import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Music2, X } from "lucide-react";
import { Button, Field, Input, Select, Textarea, useToast } from "@/components/ui";
import { addTrack, reorderTracks, updateTrack, type TrackPatch } from "@/lib/api/catalog";
import { fieldErrorsOf, useErrorMessage } from "@/lib/api/errors";
import type { Credit, FeaturedArtist, Release, Track } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { FormAlert } from "../../components";
import { COPY } from "../copy";
import { useIssueText } from "../shared";
import { AudioUploader } from "./AudioUploader";
import { useReportSaver, useWizard } from "./context";
import { FormCard, RadioList, SubSection, TextButton, YesNo } from "./layout";
import { defaultTier, useOptions, type Opt, type UploadOptions } from "./options";
import { useReleaseForm, useUpload, type Block } from "./state";
import { useAutosave } from "./useAutosave";
import { isValidIsrc, validateCredits, validateTracks, WRITER_ROLES, type Issue } from "./validation";

/**
 * 13. TRACK cards (one per song, DOCS/DISTRIBUTION_PARITY.md 1.1) and
 * 14. APPLE MUSIC CREDITS (only when Apple Music is a chosen store).
 *
 * The number of track cards follows "Number of songs". A card that isn't on
 * the server yet creates its track lazily (and the draft first, if needed)
 * the first time a song title is typed or an audio file is picked; what was
 * typed until then is saved right after. Cards keep a stable key, so creating
 * a track never remounts them.
 *
 * Credits (songwriters here, performers and producers in the Apple card) are
 * one `credits[]` list per track on the server, so their rows live here and
 * each track card saves its list.
 */

type Copy = (typeof COPY)["EN"];

/* ── Credits model ─────────────────────────────────────────────────── */

export type WriterRow = { role: string; first: string; middle: string; last: string };
export type PersonRow = { role: string; name: string };
export type CreditState = { writers: WriterRow[]; performers: PersonRow[]; producers: PersonRow[]; extra: Credit[] };

const emptyWriter = (): WriterRow => ({ role: "songwriter", first: "", middle: "", last: "" });
const joinName = (w: WriterRow) => [w.first, w.middle, w.last].map((s) => s.trim()).filter(Boolean).join(" ");

export function creditsFromTrack(t: Track | null, opts: UploadOptions): CreditState {
  const list = t?.credits ?? [];
  const writers: WriterRow[] = [];
  const performers: PersonRow[] = [];
  const producers: PersonRow[] = [];
  const extra: Credit[] = [];
  for (const cr of list) {
    if (WRITER_ROLES.includes(cr.role)) {
      const parts = (cr.name ?? "").trim().split(/\s+/);
      const hasParts = cr.first_name != null || cr.last_name != null;
      writers.push({
        role: cr.role,
        first: hasParts ? (cr.first_name ?? "") : (parts[0] ?? ""),
        middle: hasParts ? (cr.middle_name ?? "") : parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
        last: hasParts ? (cr.last_name ?? "") : parts.length > 1 ? parts[parts.length - 1] : "",
      });
    } else if (cr.role === "performer") performers.push({ role: cr.detail ?? "", name: cr.name ?? "" });
    else if (cr.role === "producer") producers.push({ role: cr.detail ?? "", name: cr.name ?? "" });
    else extra.push({ role: cr.role, name: cr.name, detail: cr.detail ?? null });
  }
  return {
    writers: writers.length ? writers : [emptyWriter()],
    performers: performers.length ? performers : [{ role: "", name: "" }],
    producers: producers.length ? producers : [{ role: "", name: "" }],
    extra,
  };
}

/** The `credits[]` body for a track. Covers carry no songwriter rows (their writers are cover fields). */
export function creditsPayload(s: CreditState, ownership: "original" | "cover"): Credit[] {
  const writers =
    ownership === "original"
      ? s.writers
          .filter((w) => w.first.trim() || w.last.trim())
          .map((w) => ({
            role: w.role,
            name: joinName(w),
            first_name: w.first.trim(),
            middle_name: w.middle.trim() || null,
            last_name: w.last.trim(),
            detail: null,
          }))
      : [];
  const people = (rows: PersonRow[], role: string) =>
    rows.filter((r) => r.name.trim()).map((r) => ({ role, name: r.name.trim(), detail: r.role || null }));
  return [...writers, ...people(s.performers, "performer"), ...people(s.producers, "producer"), ...s.extra];
}

/* ── Title preview ─────────────────────────────────────────────────── */

export const featuredOf = (list: Track["featured_artists"] | undefined): FeaturedArtist[] =>
  (list ?? []).map((x) => (typeof x === "string" ? { name: x, role: "featuring" as const } : x));

/** "Title (feat. A & B) [Version]" as the stores will show it. */
export function displayTitle(
  t: { title: string; featured: FeaturedArtist[]; version_type: string; version: string },
  c: Copy,
): string {
  const named = t.featured.filter((f) => f.name.trim());
  const feat = named.filter((f) => f.role !== "remixer").map((f) => f.name.trim());
  const remix = named.filter((f) => f.role === "remixer").map((f) => f.name.trim());
  const tags: string[] = [];
  if (remix.length) tags.push(c.remix(remix.join(" & ")));
  if (t.version_type === "radio_edit") tags.push(c.versionTag);
  else if (t.version_type === "other" && t.version.trim()) tags.push(t.version.trim());
  return [t.title.trim(), feat.length ? `(${c.feat(feat.join(" & "))})` : "", ...tags.map((x) => `[${x}]`)].filter(Boolean).join(" ");
}

export function trackDisplayTitle(t: Track, c: Copy): string {
  const vt = t.version_type ?? (t.version ? "other" : "normal");
  return displayTitle({ title: t.title, featured: featuredOf(t.featured_artists), version_type: vt, version: t.version ?? "" }, c);
}

/* ── Section ───────────────────────────────────────────────────────── */

/** Put the release's tracks in the order of the blocks on screen. */
const withTrackList = (base: Release, list: Track[]): Release => ({ ...base, tracks: list, tracks_count: list.length }) as Release;

export function TracksStep() {
  const c = useCopy(COPY);
  const { toast } = useToast();
  const issueText = useIssueText();
  const { release, setRelease, config, attempted } = useWizard();
  const { blocks, setBlocks, platforms, leadTitle } = useUpload();
  const opts = useOptions(config);
  const tracks = release?.tracks ?? [];
  const byId = new Map(tracks.map((t) => [t.id, t]));
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const [initialLead] = useState(leadTitle);

  /* Credit rows per block (songwriters + Apple credits) */
  const [creditMap, setCreditMap] = useState<Record<string, CreditState>>({});
  const creditsOf = (b: Block) => creditMap[b.key] ?? creditsFromTrack(b.trackId ? (byId.get(b.trackId) ?? null) : null, opts);
  const setCredits = (b: Block): Dispatch<SetStateAction<CreditState>> => (next) =>
    setCreditMap((m) => {
      const cur = m[b.key] ?? creditsFromTrack(b.trackId ? (byId.get(b.trackId) ?? null) : null, opts);
      return { ...m, [b.key]: typeof next === "function" ? next(cur) : next };
    });
  const copyToAll = (from: Block, part: "writers" | "apple") => {
    const src = creditsOf(from);
    setCreditMap((m) => {
      const out = { ...m };
      for (const b of blocks) {
        if (b.key === from.key) continue;
        const cur = m[b.key] ?? creditsFromTrack(b.trackId ? (byId.get(b.trackId) ?? null) : null, opts);
        out[b.key] =
          part === "writers"
            ? { ...cur, writers: src.writers.map((w) => ({ ...w })) }
            : { ...cur, performers: src.performers.map((r) => ({ ...r })), producers: src.producers.map((r) => ({ ...r })) };
      }
      return out;
    });
    toast({ title: c.copiedToAll, tone: "success" });
  };

  const type = release?.release_type ?? "Single";
  const general = release ? validateTracks(tracks, type, null).filter((i) => !i.trackId) : [];

  const updateTrackInRelease = (next: Track, base?: Release) =>
    setRelease((prev) => {
      const r = prev ?? base ?? null;
      if (!r) return r;
      const list = r.tracks ?? [];
      return withTrackList(r, list.some((x) => x.id === next.id) ? list.map((x) => (x.id === next.id ? { ...x, ...next } : x)) : [...list, next]);
    });

  const onCreated = async (key: string, track: Track, base: Release) => {
    updateTrackInRelease(track, base);
    const next = blocksRef.current.map((b) => (b.key === key ? { ...b, trackId: track.id } : b));
    blocksRef.current = next;
    setBlocks(next);
    const order = next.map((b) => b.trackId).filter((id): id is number => id !== null);
    // Created out of order (track 2 before track 1): keep the server in screen order.
    const serverOrder = [...(base.tracks ?? []).map((t) => t.id).filter((id) => id !== track.id), track.id];
    if (order.length > 1 && order.join() !== serverOrder.filter((id) => order.includes(id)).join()) {
      try {
        await reorderTracks(base.id, order);
      } catch {
        /* order is cosmetic here */
      }
    }
  };

  const apple = platforms.includes("apple_music");
  const multi = blocks.length > 1;

  return (
    <>
      <FormCard anchor="section-tracks" number={4} title={multi ? c.upSongs : c.upSong} hint={c.tracksSectionHint}>
      <div className="space-y-6">
        {attempted && general.length > 0 && (
          <FormAlert>
            {general.map((i, n) => (
              <p key={n}>{issueText(i)}</p>
            ))}
          </FormAlert>
        )}
        {blocks.map((b, i) => (
          <SongBlock
            key={b.key}
            blockKey={b.key}
            track={b.trackId ? (byId.get(b.trackId) ?? null) : null}
            index={i}
            multi={multi}
            initialTitle={i === 0 ? initialLead : ""}
            credits={creditsOf(b)}
            setCredits={setCredits(b)}
            onCopyWriters={() => copyToAll(b, "writers")}
            onChange={(t) => updateTrackInRelease(t)}
            onCreated={(t, base) => onCreated(b.key, t, base)}
          />
        ))}
      </div>
      </FormCard>

      {apple && (
        <FormCard anchor="section-credits" title={c.upApple} hint={c.appleHint}>
          <div className="space-y-4">
            {blocks.map((b, i) => (
              <AppleCredits
                key={b.key}
                n={i + 1}
                title={(b.trackId ? byId.get(b.trackId)?.title : undefined) ?? (i === 0 ? leadTitle : "")}
                credits={creditsOf(b)}
                setCredits={setCredits(b)}
                performerRoles={opts.performerRoles}
                producerRoles={opts.producerRoles}
                showErrors={attempted}
                onCopy={multi ? () => copyToAll(b, "apple") : undefined}
              />
            ))}
          </div>
        </FormCard>
      )}
    </>
  );
}

/* ── Apple Music credits for one track ─────────────────────────────── */

function AppleCredits({
  n,
  title,
  credits,
  setCredits,
  performerRoles,
  producerRoles,
  showErrors,
  onCopy,
}: {
  n: number;
  title: string;
  credits: CreditState;
  setCredits: Dispatch<SetStateAction<CreditState>>;
  performerRoles: Opt[];
  producerRoles: Opt[];
  showErrors: boolean;
  onCopy?: () => void;
}) {
  const c = useCopy(COPY);
  const rows = (part: "performers" | "producers", roles: Opt[], roleLabel: string, legend: string, addLabel: string, missing: string) => {
    const list = credits[part];
    const named = list.some((r) => r.name.trim());
    const set = (i: number, patch: Partial<PersonRow>) => setCredits((s) => ({ ...s, [part]: s[part].map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
    return (
      <fieldset className="min-w-0">
        <legend className="mb-2 text-[0.875rem] font-semibold text-text-muted">{legend}</legend>
        <ul className="space-y-2">
          {list.map((r, i) => (
            <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Field label={`${roleLabel} (${legend} ${i + 1})`} labelHidden className="col-span-2 sm:col-span-1">
                <Select value={r.role} onChange={(e) => set(i, { role: e.target.value })} placeholder={c.selectRole}>
                  {!roles.some((o) => o.label === r.role) && r.role && <option value={r.role}>{r.role}</option>}
                  {roles.map((o) => (
                    <option key={o.value} value={o.label}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={`${c.personName} (${legend} ${i + 1})`} labelHidden>
                <Input value={r.name} maxLength={255} placeholder={c.personName} onChange={(e) => set(i, { name: e.target.value })} />
              </Field>
              <Button
                variant="ghost"
                aria-label={c.removeRow(r.name)}
                disabled={list.length === 1}
                onClick={() => setCredits((s) => ({ ...s, [part]: s[part].filter((_, j) => j !== i) }))}
                className="w-11 px-0"
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
        {showErrors && !named && <p className="mt-2 text-caption text-danger">{missing}</p>}
        <div className="mt-2">
          <TextButton onClick={() => setCredits((s) => ({ ...s, [part]: [...s[part], { role: "", name: "" }] }))}>{addLabel}</TextButton>
        </div>
      </fieldset>
    );
  };
  return (
    <div className="min-w-0 rounded-control border border-border-subtle">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border-subtle px-4 py-3">
        <h3 className="min-w-0 break-words text-[0.9375rem] font-semibold text-text">
          {c.trackHeading(n)}
          {title ? <span className="font-normal text-text-muted">{`: ${title}`}</span> : null}
        </h3>
        {onCopy && <TextButton onClick={onCopy}>{c.copyToAll}</TextButton>}
      </div>
      <div className="grid gap-6 p-4 xl:grid-cols-2">
        {rows("performers", performerRoles, c.performerRole, c.performers, c.addPerformer, c.appleNeedsPerformer)}
        {rows("producers", producerRoles, c.producerRole, c.producers, c.addProducer, c.appleNeedsProducer)}
      </div>
    </div>
  );
}

/* ── One track card ────────────────────────────────────────────────── */

type TrackForm = {
  title: string;
  featuredOn: boolean;
  featured: FeaturedArtist[];
  version_type: string;
  version: string;
  isrc: string;
  dolby_atmos: boolean;
  ownership: "original" | "cover";
  cover_original_artist: string;
  cover_original_title: string;
  cover_original_writers: string;
  explicit: boolean;
  is_clean_version: boolean;
  instrumental: boolean;
  ai_generated: boolean;
  previewSpecific: boolean;
  preview_start_seconds: number;
  track_price: string;
  lyrics: string;
};

function toForm(t: Track | null, initialTitle: string, defaultPrice: string): TrackForm {
  const featured = featuredOf(t?.featured_artists);
  const version = t?.version ?? "";
  return {
    title: t?.title ?? initialTitle,
    featuredOn: featured.length > 0,
    featured: featured.length ? featured : [{ name: "", role: "featuring" }],
    version_type: t?.version_type ?? (/^radio edit$/i.test(version) ? "radio_edit" : version ? "other" : "normal"),
    version,
    isrc: t?.isrc && !t.isrc_generated ? t.isrc : "",
    dolby_atmos: t?.dolby_atmos ?? false,
    ownership: t?.ownership === "cover" ? "cover" : "original",
    cover_original_artist: t?.cover_original_artist ?? "",
    cover_original_title: t?.cover_original_title ?? "",
    cover_original_writers: t?.cover_original_writers ?? "",
    explicit: t?.explicit ?? false,
    is_clean_version: t?.is_clean_version ?? false,
    instrumental: t?.instrumental ?? false,
    ai_generated: t?.ai_generated ?? false,
    previewSpecific: t?.preview_start_seconds != null,
    preview_start_seconds: t?.preview_start_seconds ?? 0,
    track_price: t?.track_price ?? defaultPrice,
    lyrics: t?.lyrics ?? "",
  };
}

const nul = (s: string) => (s.trim() ? s.trim() : null);

export function trackPatch(f: TrackForm): TrackPatch {
  const cover = f.ownership === "cover";
  const patch: TrackPatch = {
    featured_artists: f.featuredOn ? f.featured.filter((a) => a.name.trim()).map((a) => ({ name: a.name.trim(), role: a.role })) : [],
    version_type: f.version_type as TrackPatch["version_type"],
    version: f.version_type === "other" ? nul(f.version) : null,
    dolby_atmos: f.dolby_atmos,
    ownership: f.ownership,
    cover_original_artist: cover ? nul(f.cover_original_artist) : null,
    cover_original_title: cover ? nul(f.cover_original_title) : null,
    cover_original_writers: cover ? nul(f.cover_original_writers) : null,
    explicit: f.explicit,
    is_clean_version: f.explicit ? false : f.is_clean_version,
    instrumental: f.instrumental,
    ai_generated: f.ai_generated,
    preview_start_seconds: f.previewSpecific ? f.preview_start_seconds : null,
    track_price: nul(f.track_price),
    lyrics: f.instrumental ? null : nul(f.lyrics),
  };
  if (f.title.trim()) patch.title = f.title.trim();
  if (!f.isrc.trim() || isValidIsrc(f.isrc)) patch.isrc = nul(f.isrc.replace(/[-\s]/g, "").toUpperCase());
  return patch;
}

/** Renumber issue messages to the track's position on the page. */
const at = (issues: Issue[], n: number) => issues.map((i) => ({ ...i, params: { ...i.params, n } }));

function SongBlock({
  blockKey,
  track,
  index,
  multi,
  initialTitle,
  credits,
  setCredits,
  onCopyWriters,
  onChange,
  onCreated,
}: {
  blockKey: string;
  /** null until the song exists on the server. */
  track: Track | null;
  index: number;
  multi: boolean;
  /** Track 1 of a draft without songs starts from the release title. */
  initialTitle: string;
  credits: CreditState;
  setCredits: Dispatch<SetStateAction<CreditState>>;
  onCopyWriters: () => void;
  onChange: (t: Track) => void;
  onCreated: (t: Track, base: Release) => void | Promise<void>;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const issueText = useIssueText();
  const toMessage = useErrorMessage();
  const { release, config, attempted, ensureRelease } = useWizard();
  const { setLeadTitle } = useUpload();
  const { artist, form: releaseFields } = useReleaseForm();
  // Music that came out before keeps its codes: the ISRC field is simply open.
  const reissue = releaseFields.previously_released;
  const opts = useOptions(config);
  const n = index + 1;
  const optional = { optional: true, optionalLabel: t("common.optional") };

  /* Song fields */
  const [form, setForm] = useState<TrackForm>(() => toForm(track, initialTitle, defaultTier(opts.trackPrices, "0.99")));
  const [titleTouched, setTitleTouched] = useState(false);
  const [showIsrc, setShowIsrc] = useState(() => !!form.isrc);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const auto = useAutosave(
    form,
    async (f) => {
      try {
        const updated = await updateTrack(track!.id, trackPatch(f));
        setServerErrors({});
        onChange(updated);
      } catch (err) {
        setServerErrors(fieldErrorsOf(err));
        throw err;
      }
    },
    // Before the track exists nothing saves; once it does, everything typed so far is saved.
    { delay: 1200, enabled: !!track },
  );
  const idle = useCallback(async () => true, []);
  useReportSaver(`song-${blockKey}`, track ? auto : { status: "idle", error: null, flush: idle });
  const set = <K extends keyof TrackForm>(k: K, v: TrackForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Track 1's title is a single's release title.
  useEffect(() => {
    if (index === 0) setLeadTitle(form.title.trim());
  }, [index, form.title, setLeadTitle]);

  /* Lazy creation of the track */
  const creating = useRef<Promise<Track | null> | null>(null);
  const formRef = useRef(form);
  formRef.current = form;
  const [createError, setCreateError] = useState<string | null>(null);
  const ensureTrack = async (): Promise<Track | null> => {
    if (track) return track;
    if (creating.current) return creating.current;
    creating.current = (async () => {
      try {
        const base = await ensureRelease();
        if (!base) return null;
        const created = await addTrack(base.id, { title: formRef.current.title.trim() || c.trackHeading(n) });
        setCreateError(null);
        await onCreated(created, base);
        return created;
      } catch (err) {
        setCreateError(toMessage(err));
        return null;
      } finally {
        creating.current = null;
      }
    })();
    return creating.current;
  };
  const typedTitle = titleTouched ? form.title.trim() : "";
  useEffect(() => {
    if (track || !typedTitle) return;
    const timer = window.setTimeout(() => void ensureTrack(), 800);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, typedTitle]);

  /* Credits: this card saves the track's whole credits list. */
  const payload = creditsPayload(credits, form.ownership);
  const [creditError, setCreditError] = useState<string | null>(null);
  const creditsAuto = useAutosave(
    payload,
    async (list) => {
      try {
        onChange(await updateTrack(track!.id, { credits: list }));
        setCreditError(null);
      } catch (err) {
        setCreditError(Object.values(fieldErrorsOf(err))[0] ?? null);
        throw err;
      }
    },
    { delay: 1000, enabled: !!track },
  );
  useReportSaver(`credits-${blockKey}`, track ? creditsAuto : { status: "idle", error: null, flush: idle });

  /* Problems, shown after a submit attempt */
  const songIssues = at(
    validateTracks(
      [{ id: track?.id ?? 0, title: form.title, audio: track?.audio ?? null, audio_url: track?.audio_url, explicit: form.explicit, is_clean_version: form.is_clean_version, isrc: null }],
      "",
      null,
    ).filter((i) => i.trackId !== undefined),
    n,
  );
  const creditIssues = form.ownership === "original" ? at(validateCredits([{ id: track?.id ?? 0, ownership: "original", credits: payload }]), n) : [];
  const issues = attempted ? [...songIssues, ...creditIssues] : [];
  const has = (code: Issue["code"]) => issues.some((i) => i.code === code);
  const required = (v: string) => (attempted && !v.trim() ? c.issue.required() : undefined);
  const isrcError = serverErrors.isrc ?? (form.isrc && !isValidIsrc(form.isrc) ? c.issue.isrc_invalid({ n }) : undefined);

  const setWriter = (i: number, patch: Partial<WriterRow>) => setCredits((s) => ({ ...s, writers: s.writers.map((w, j) => (j === i ? { ...w, ...patch } : w)) }));
  const setFeatured = (i: number, patch: Partial<FeaturedArtist>) => set("featured", form.featured.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  const preview = displayTitle({ title: form.title || c.trackHeading(n), featured: form.featuredOn ? form.featured : [], version_type: form.version_type, version: form.version }, c);
  const durationMin = Math.max(1, Math.ceil((track?.audio?.duration_ms ?? 0) / 60000));
  const minutes = Array.from({ length: Math.max(durationMin, 10) }, (_, i) => i);
  const name = (k: string) => `${k}-${blockKey}`;

  const label = "text-[0.875rem] font-semibold text-text-muted";

  return (
    <SubSection
      title={c.trackHeading(n)}
      aside={
        !form.title.trim() ? undefined : <p className="min-w-0 max-w-full break-words text-body-sm text-text-muted sm:max-w-[60%] sm:truncate">
          <span data-testid={`title-preview-${n}`} className="font-semibold text-text" title={preview}>
            {preview}
          </span>
          {artist && <span>{` · ${artist.name}`}</span>}
        </p>
      }
    >
      <div id={track ? `track-${track.id}` : undefined} tabIndex={-1} className="space-y-6 focus:outline-none">
        {issues.length > 0 && (
          <FormAlert>
            {issues.map((e, k) => (
              <p key={k}>{issueText(e)}</p>
            ))}
          </FormAlert>
        )}
        {createError && <FormAlert>{createError}</FormAlert>}

        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* Left: what the song is called and who wrote it */}
          <div className="min-w-0 space-y-6">
            <Field
              label={c.songTitle}
              required
              error={serverErrors.title ?? (has("track_title_missing") ? c.issue.required() : undefined)}
              hint={
                <ul className="max-w-[60ch] list-disc space-y-0.5 pl-4">
                  {c.titleHints.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              }
            >
              <Input
                value={form.title}
                maxLength={255}
                onChange={(e) => {
                  setTitleTouched(true);
                  set("title", e.target.value);
                }}
              />
            </Field>

            <div className="space-y-3">
              <YesNo legend={c.featuredQ} name={name("featured")} value={form.featuredOn} onChange={(v) => set("featuredOn", v)} yes={c.yes} no={c.no} />
              {form.featuredOn && (
                <div className="space-y-2">
                  <ul className="space-y-2">
                    {form.featured.map((a, i) => (
                      <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                        <Field label={`${c.featuredRole} ${i + 1}`} labelHidden className="col-span-2 sm:col-span-1">
                          <Select value={a.role} onChange={(e) => setFeatured(i, { role: e.target.value as FeaturedArtist["role"] })}>
                            {opts.featuredRoles.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label={`${c.featuredName} ${i + 1}`} labelHidden error={serverErrors[`featured_artists.${i}.name`]}>
                          <Input value={a.name} maxLength={255} placeholder={c.featuredName} onChange={(e) => setFeatured(i, { name: e.target.value })} />
                        </Field>
                        <Button
                          variant="ghost"
                          aria-label={c.removeRow(a.name)}
                          disabled={form.featured.length === 1}
                          onClick={() => set("featured", form.featured.filter((_, j) => j !== i))}
                          className="w-11 px-0"
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <TextButton onClick={() => set("featured", [...form.featured, { name: "", role: "featuring" }])}>{c.addAnother}</TextButton>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <RadioList
                legend={c.versionQ}
                name={name("version")}
                inline
                value={form.version_type}
                onChange={(v) => set("version_type", v)}
                options={opts.versionTypes.map((o) => ({ value: o.value, label: o.label }))}
              />
              {form.version_type === "other" && (
                <Field label={c.versionName} labelHidden error={serverErrors.version} className="w-full sm:w-56">
                  <Input value={form.version} maxLength={120} placeholder={c.versionNameHint} onChange={(e) => set("version", e.target.value)} />
                </Field>
              )}
            </div>

            <div className="space-y-3">
              {!reissue && <TextButton onClick={() => setShowIsrc((v) => !v)}>{showIsrc ? c.isrcHide : c.isrcReveal}</TextButton>}
              {(showIsrc || reissue) && (
                <Field label={c.isrcLabel} {...optional} hint={reissue ? c.isrcExistingHint : c.isrcHint} error={isrcError} className="sm:max-w-xs">
                  <Input value={form.isrc} maxLength={15} onChange={(e) => set("isrc", e.target.value.toUpperCase())} placeholder="CC-XXX-YY-NNNNN" />
                </Field>
              )}
            </div>

            {/* How the song will read in store apps, updated as you type. */}
            <div>
              <p className={label}>{c.songPreviewTitle}</p>
              <div data-testid={`song-preview-${n}`} className="mt-2 flex items-center gap-3 rounded-card bg-[#1a0b2e] px-4 py-3 text-white">
                <span className="w-5 shrink-0 text-center text-body-sm tabular-nums text-white/60">{n}</span>
                {release?.cover_image ? (
                  <img src={release.cover_image} alt="" className="h-11 w-11 shrink-0 rounded-[6px] object-cover" />
                ) : (
                  <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] bg-white/10">
                    <Music2 className="h-5 w-5 text-white/70" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {preview}
                    {form.explicit && (
                      <span aria-label={c.explicitTag} className="ml-2 inline-flex h-4 items-center rounded-[3px] bg-white/80 px-1 align-middle text-[0.625rem] font-bold text-[#1a0b2e]">
                        E
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-body-sm text-white/70">{artist?.name ?? c.pvNone}</span>
                </span>
              </div>
              <p className="mt-1.5 text-caption text-text-subtle">{c.songPreviewNote}</p>
            </div>

            <div className="space-y-4 border-t border-border-subtle pt-6">
              <RadioList<"original" | "cover">
                legend={c.ownershipQ}
                name={name("ownership")}
                value={form.ownership}
                onChange={(v) => set("ownership", v)}
                options={opts.ownership.map((o) => ({ value: o.value as "original" | "cover", label: o.label }))}
              />
              {form.ownership === "original" ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-text">
                      {c.writersHeading}
                      <span aria-hidden className="text-danger"> *</span>
                    </p>
                    <p className="max-w-[60ch] text-caption text-text-subtle">{c.writersHint}</p>
                  </div>
                  <ul className="space-y-3">
                    {credits.writers.map((w, i) => (
                      <li key={i} className="rounded-control border border-border-subtle p-4">
                        <fieldset className="min-w-0">
                          <legend className="sr-only">{c.writerRowLabel(i + 1)}</legend>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p aria-hidden className="text-body-sm font-semibold text-text">{c.writerRowLabel(i + 1)}</p>
                            {credits.writers.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={c.removeRow(joinName(w))}
                                onClick={() => setCredits((s) => ({ ...s, writers: s.writers.filter((_, j) => j !== i) }))}
                                className="-my-1 w-9 px-0"
                              >
                                <X className="h-4 w-4" aria-hidden />
                              </Button>
                            )}
                          </div>
                          {/* Two per row: role and first name, then middle and last name. */}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label={c.writerRole}>
                              <Select value={w.role} onChange={(e) => setWriter(i, { role: e.target.value })}>
                                {opts.writerRoles.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </Select>
                            </Field>
                            <Field label={c.writerFirst} error={i === 0 && has("writer_missing") ? c.issue.required() : undefined}>
                              <Input value={w.first} maxLength={120} autoComplete="off" onChange={(e) => setWriter(i, { first: e.target.value })} />
                            </Field>
                            <Field label={c.writerMiddle} {...optional}>
                              <Input value={w.middle} maxLength={120} autoComplete="off" onChange={(e) => setWriter(i, { middle: e.target.value })} />
                            </Field>
                            <Field label={c.writerLast}>
                              <Input value={w.last} maxLength={120} autoComplete="off" onChange={(e) => setWriter(i, { last: e.target.value })} />
                            </Field>
                          </div>
                        </fieldset>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    <TextButton onClick={() => setCredits((s) => ({ ...s, writers: [...s.writers, emptyWriter()] }))}>{c.addAnotherWriter}</TextButton>
                    {multi && <TextButton onClick={onCopyWriters}>{c.copyToAll}</TextButton>}
                  </div>
                  {creditError && <FormAlert>{creditError}</FormAlert>}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={c.coverArtist} required error={serverErrors.cover_original_artist ?? required(form.cover_original_artist)}>
                    <Input value={form.cover_original_artist} maxLength={255} onChange={(e) => set("cover_original_artist", e.target.value)} />
                  </Field>
                  <Field label={c.coverTitle} required error={serverErrors.cover_original_title ?? required(form.cover_original_title)}>
                    <Input value={form.cover_original_title} maxLength={255} onChange={(e) => set("cover_original_title", e.target.value)} />
                  </Field>
                  <Field label={c.coverWriters} {...optional} hint={c.coverWritersHint} className="sm:col-span-2" error={serverErrors.cover_original_writers}>
                    <Input value={form.cover_original_writers} maxLength={500} onChange={(e) => set("cover_original_writers", e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          </div>

          {/* Right: the files and how stores sell them */}
          <div className="min-w-0 space-y-6">
            <div className="space-y-2">
              <p className={label}>{c.audioTitle}</p>
              <AudioUploader track={track} cfg={config.audio} onAttached={onChange} ensureTrack={ensureTrack} />
              <p className="text-caption text-text-subtle">{c.audioRulesShort(config.audio.formats.join(", ").toUpperCase(), config.audio.max_mb)}</p>
              {track?.audio_url && (
                <div className="pt-1">
                  <p className={label}>{c.listenTitle}</p>
                  <audio controls preload="none" src={track.audio_url} className="mt-2 w-full" aria-label={c.listenLabel(form.title || c.trackHeading(n))} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <YesNo legend={c.atmosQ} name={name("atmos")} value={form.dolby_atmos} onChange={(v) => set("dolby_atmos", v)} yes={c.yes} no={c.no} />
              {form.dolby_atmos && <AudioUploader track={track} cfg={config.audio} onAttached={onChange} ensureTrack={ensureTrack} variant="atmos" />}
            </div>

            <div className="space-y-3">
              <RadioList<boolean>
                legend={c.previewQ}
                name={name("preview")}
                value={form.previewSpecific}
                onChange={(v) => set("previewSpecific", v)}
                inline
                options={[
                  { value: false, label: c.previewAuto },
                  { value: true, label: c.previewChoose },
                ]}
              />
              {form.previewSpecific && (
                <PreviewTime seconds={form.preview_start_seconds} onChange={(v) => set("preview_start_seconds", v)} label={c.previewStartAt} />
              )}
            </div>

            <Field label={c.trackPrice} error={serverErrors.track_price} className="sm:max-w-[12rem]">
              <Select value={form.track_price} onChange={(e) => set("track_price", e.target.value)}>
                {opts.trackPrices.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        {/* Content questions, side by side */}
        <div className="grid gap-x-8 gap-y-6 border-t border-border-subtle pt-6 md:grid-cols-2">
          <YesNo
            legend={c.explicitQuestion}
            name={name("explicit")}
            value={form.explicit}
            onChange={(v) => setForm((f) => ({ ...f, explicit: v, is_clean_version: v ? false : f.is_clean_version }))}
            yes={c.yes}
            no={c.no}
          />
          {/* Only a clean song can be a radio edit; kept in place (disabled) so the row doesn't jump. */}
          <RadioList<boolean>
            legend={c.radioEditQ}
            name={name("clean")}
            value={form.explicit ? false : form.is_clean_version}
            disabled={form.explicit}
            onChange={(v) => set("is_clean_version", v)}
            options={[
              { value: false, label: c.radioEditNo },
              { value: true, label: c.radioEditYes },
            ]}
          />
          <RadioList<boolean>
            legend={c.instrumentalQ}
            name={name("instrumental")}
            inline
            value={form.instrumental}
            onChange={(v) => set("instrumental", v)}
            options={[
              { value: false, label: c.hasLyrics },
              { value: true, label: c.isInstrumental },
            ]}
          />
          <YesNo legend={c.aiQ} name={name("ai")} value={form.ai_generated} onChange={(v) => set("ai_generated", v)} yes={c.yes} no={c.no} />
        </div>

        {!form.instrumental && (
          <Field label={c.lyricsLabel} {...optional} hint={c.lyricsHint} error={serverErrors.lyrics}>
            <Textarea value={form.lyrics} rows={5} maxLength={20000} onChange={(e) => set("lyrics", e.target.value)} />
          </Field>
        )}
      </div>
    </SubSection>
  );
}

/** A single "m:ss" box for where the preview clip starts (typed as 1:05 or 65). */
function PreviewTime({ seconds, onChange, label }: { seconds: number; onChange: (v: number) => void; label: string }) {
  const fmt = (v: number) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
  const [text, setText] = useState(() => fmt(seconds));
  useEffect(() => setText(fmt(seconds)), [seconds]);
  const commit = () => {
    const m = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(text.trim());
    if (!m) return setText(fmt(seconds));
    const v = m[2] === undefined ? Number(m[1]) : Number(m[1]) * 60 + Math.min(59, Number(m[2]));
    onChange(Math.min(3600, v));
    setText(fmt(Math.min(3600, v)));
  };
  return (
    <Field label={label} className="w-32">
      <Input inputMode="numeric" value={text} placeholder="0:30" maxLength={5} onChange={(e) => setText(e.target.value.replace(/[^\d:]/g, ""))} onBlur={commit} />
    </Field>
  );
}
