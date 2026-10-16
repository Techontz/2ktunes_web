import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { updateRelease, type ReleasePatch } from "@/lib/api/catalog";
import { fieldErrorsOf } from "@/lib/api/errors";
import type { Artist, Release, ReleaseType } from "@/lib/api/types";
import { todayIso } from "@/lib/dates";
import { COPY } from "../copy";
import { useIssueText } from "../shared";
import { useDraftPart, useReportSaver, useWizard } from "./context";
import { defaultPlatforms, typeForCount } from "./options";
import { useAutosave } from "./useAutosave";
import { firstByField, isValidUpc, validateInfo, type InfoValues, type Issue } from "./validation";

/**
 * Page state shared by several cards of the upload page:
 *  - the chosen stores (Stores card, Store profiles, Apple credits, Agreements),
 *  - the song blocks (Number of songs drives them; one Track card each),
 *  - the first song's title (a single's release title follows it),
 *  - the artist list (new artists are added inline).
 * And the release fields (sections 3 to 12), one autosaved form.
 */

export type Block = { key: string; trackId: number | null };
let blockSeq = 0;
export const newBlock = (): Block => ({ key: `new-${++blockSeq}`, trackId: null });

type UploadCtx = {
  platforms: string[];
  setPlatforms: Dispatch<SetStateAction<string[]>>;
  /** Stores that can be picked today. */
  available: string[];
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  /** Song 1's title as typed (a single's release title). */
  leadTitle: string;
  setLeadTitle: (t: string) => void;
  artists: Artist[];
  putArtist: (a: Artist) => void;
};

const Upload = createContext<UploadCtx | null>(null);

export function useUpload(): UploadCtx {
  const ctx = useContext(Upload);
  if (!ctx) throw new Error("useUpload outside the upload page");
  return ctx;
}

export function UploadStateProvider({ children }: { children: ReactNode }) {
  const { release, stores, artists: initialArtists } = useWizard();
  const available = useMemo(() => stores.filter((s) => s.status === "available").map((s) => s.slug), [stores]);
  const [platforms, setPlatforms] = useState<string[]>(() =>
    // Nothing chosen yet: every available store except the opt-in ones (Snapchat, Roblox).
    (release?.platforms ?? []).length === 0 ? defaultPlatforms(stores) : (release?.platforms ?? []),
  );
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const tracks = release?.tracks ?? [];
    return tracks.length ? tracks.map((t) => ({ key: `t-${t.id}`, trackId: t.id })) : [newBlock()];
  });
  const [leadTitle, setLeadTitle] = useState(() => {
    const first = release?.tracks?.[0]?.title;
    if (first) return first;
    const rt = release?.release_title ?? "";
    return UNTITLED.includes(rt) ? "" : rt;
  });
  const [artists, setArtists] = useState<Artist[]>(initialArtists);
  const putArtist = useCallback(
    (a: Artist) => setArtists((list) => (list.some((x) => x.id === a.id) ? list.map((x) => (x.id === a.id ? { ...x, ...a } : x)) : [...list, a])),
    [],
  );
  const value = useMemo(
    () => ({ platforms, setPlatforms, available, blocks, setBlocks, leadTitle, setLeadTitle, artists, putArtist }),
    [platforms, available, blocks, leadTitle, artists, putArtist],
  );
  return <Upload.Provider value={value}>{children}</Upload.Provider>;
}

/* ── Release fields ───────────────────────────────────────────────── */

export type ReleaseFields = Omit<InfoValues, "release_type" | "artist_name">;

/** The placeholder title a draft gets before one is typed, in any language. */
const UNTITLED = [COPY.EN.untitled, COPY.SW.untitled, COPY.FR.untitled];

function fromRelease(r: Release | null, fallbackArtist: Artist | null): ReleaseFields {
  return {
    release_title: r && !UNTITLED.includes(r.release_title) ? r.release_title : "",
    artist_id: r ? r.artist_id : (fallbackArtist?.id ?? null),
    primary_genre: r?.primary_genre ?? "",
    secondary_genre: r?.secondary_genre ?? "",
    language: r?.language ?? "",
    release_date: r?.release_date ?? "",
    release_asap: r?.release_asap ?? false,
    previously_released: r?.previously_released ?? false,
    original_release_date: r?.original_release_date ?? "",
    record_label: r?.record_label ?? "",
    album_price: r?.album_price ?? "",
    upc: r?.upc && !r.upc_generated ? r.upc : "",
    c_line_year: r?.c_line_year != null ? String(r.c_line_year) : "",
    c_line_owner: r?.c_line_owner ?? "",
    p_line_year: r?.p_line_year != null ? String(r.p_line_year) : "",
    p_line_owner: r?.p_line_owner ?? "",
  };
}

/** What an empty © / ℗ field means: the label (else the artist) and the release year. */
export function rightsDefaults(f: ReleaseFields, artistName: string): { owner: string; year: string } {
  const owner = f.record_label.trim() || artistName.trim();
  const year = (DATE.test(f.release_date) && !f.release_asap ? f.release_date : todayIso()).slice(0, 4);
  return { owner, year };
}

/** The © / ℗ values as they will be saved: typed ones, else the defaults. */
export function rightsOf(f: ReleaseFields, artistName: string) {
  const d = rightsDefaults(f, artistName);
  return {
    c_line_year: f.c_line_year.trim() || d.year,
    c_line_owner: f.c_line_owner.trim() || d.owner,
    p_line_year: f.p_line_year.trim() || d.year,
    p_line_owner: f.p_line_owner.trim() || d.owner,
  };
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const nul = (s: string) => (s.trim() === "" ? null : s.trim());

type Snapshot = { form: ReleaseFields; type: ReleaseType; title: string };

/**
 * The PATCH body. Half-typed dates, years and UPCs are left out rather than
 * failing the save. An empty © or ℗ field is filled from the label (or the
 * artist) and the release year.
 */
export function releasePatch(s: Snapshot, artistName: string): ReleasePatch {
  const f = s.form;
  const patch: ReleasePatch = {
    release_type: s.type,
    primary_genre: nul(f.primary_genre),
    secondary_genre: nul(f.secondary_genre),
    language: nul(f.language),
    previously_released: f.previously_released,
    record_label: nul(f.record_label),
    release_asap: f.release_asap,
    album_price: s.type === "Single" ? null : nul(f.album_price),
  };
  if (s.title.trim()) patch.release_title = s.title.trim();
  if (f.artist_id) patch.artist_id = f.artist_id;
  if (f.release_asap) patch.release_date = null;
  else if (f.release_date === "" || DATE.test(f.release_date)) patch.release_date = nul(f.release_date);
  if (!f.previously_released) patch.original_release_date = null;
  else if (f.original_release_date === "" || DATE.test(f.original_release_date)) patch.original_release_date = nul(f.original_release_date);
  const rights = rightsOf(f, artistName);
  if (rights.c_line_owner) patch.c_line_owner = rights.c_line_owner;
  if (rights.p_line_owner) patch.p_line_owner = rights.p_line_owner;
  if (/^\d{4}$/.test(rights.c_line_year)) patch.c_line_year = rights.c_line_year;
  if (/^\d{4}$/.test(rights.p_line_year)) patch.p_line_year = rights.p_line_year;
  const upc = f.upc.replace(/\D/g, "");
  if (!upc) patch.upc = null;
  else if (isValidUpc(upc)) patch.upc = upc;
  return patch;
}

type FormCtx = {
  form: ReleaseFields;
  set: <K extends keyof ReleaseFields>(k: K, v: ReleaseFields[K]) => void;
  /** The field's problem: server errors at once, our own after a submit attempt. */
  err: (field: string) => string | undefined;
  type: ReleaseType;
  /** The release title as it will be sent (a single follows its song). */
  title: string;
  artist: Artist | null;
  /** The chosen artist's name (the © / ℗ fallback owner). */
  artistName: string;
  /** Our own problems with the release fields (for the summary checklist). */
  issues: Issue[];
};

const Form = createContext<FormCtx | null>(null);

export function useReleaseForm(): FormCtx {
  const ctx = useContext(Form);
  if (!ctx) throw new Error("useReleaseForm outside the upload page");
  return ctx;
}

export function ReleaseFormProvider({ children }: { children: ReactNode }) {
  const issueText = useIssueText();
  const { release, setRelease, config, attempted, ensureRelease, createError } = useWizard();
  const { blocks, leadTitle, artists } = useUpload();
  const [form, setForm] = useState<ReleaseFields>(() => fromRelease(release, artists[0] ?? null));
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const releaseRef = useRef(release);
  releaseRef.current = release;

  const type = typeForCount(blocks.length);
  const title = type === "Single" ? leadTitle : form.release_title;
  const artist = artists.find((a) => a.id === form.artist_id) ?? null;
  const artistName = artist?.name ?? "";
  const snapshot: Snapshot = { form, type, title };

  const auto = useAutosave(
    snapshot,
    async (s) => {
      try {
        const updated = await updateRelease(releaseRef.current!.id, releasePatch(s, artistName));
        setServerErrors({});
        setRelease(updated);
      } catch (err) {
        setServerErrors(fieldErrorsOf(err));
        throw err;
      }
    },
    { enabled: !!release?.is_editable, delay: 1200 },
  );
  useReportSaver("release", auto);

  // An existing draft whose type no longer matches its song count: save the derived type.
  useEffect(() => {
    if (release && release.release_type !== type) auto.rebase({ ...snapshot, type: release.release_type });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // These fields go into the draft when it is created in the background.
  useDraftPart("release", () => {
    const s = snapshot;
    return { patch: { ...releasePatch(s, artistName), release_type: s.type, release_title: s.title.trim() }, commit: () => auto.rebase(s) };
  });

  // An album or EP: create the draft about a second after its title is typed.
  // (A single's draft starts from its song block.)
  const typedTitle = type === "Single" ? "" : form.release_title.trim();
  useEffect(() => {
    if (release || !typedTitle) return;
    const timer = window.setTimeout(() => void ensureRelease(), 1000);
    return () => window.clearTimeout(timer);
  }, [release, typedTitle, ensureRelease]);

  useEffect(() => {
    const fe = createError ? fieldErrorsOf(createError) : {};
    if (Object.keys(fe).length) setServerErrors(fe);
  }, [createError]);

  const today = todayIso();
  const issues = useMemo(
    () =>
      validateInfo(
        { ...form, ...rightsOf(form, artistName), release_title: title, release_type: type, artist_name: "" },
        { today, minLeadDays: config.min_lead_days },
      ),
    [form, artistName, title, type, today, config.min_lead_days],
  );
  const byField = firstByField(issues);
  const err = useCallback(
    (field: string) => serverErrors[field] ?? (attempted ? issueText(byField[field]) : undefined),
    [serverErrors, attempted, issueText, byField],
  );
  const set = useCallback(<K extends keyof ReleaseFields>(k: K, v: ReleaseFields[K]) => setForm((f) => ({ ...f, [k]: v })), []);

  const value = useMemo(() => ({ form, set, err, type, title, artist, artistName, issues }), [form, set, err, type, title, artist, artistName, issues]);
  return <Form.Provider value={value}>{children}</Form.Provider>;
}
