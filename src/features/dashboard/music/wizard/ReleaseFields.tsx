import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Field, Input, Select, useToast } from "@/components/ui";
import { createArtist, deleteTrack } from "@/lib/api/catalog";
import { fieldErrorsOf, useErrorMessage } from "@/lib/api/errors";
import type { Release } from "@/lib/api/types";
import { todayIso } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../../components";
import { COPY } from "../copy";
import { useWizard } from "./context";
import { Divider, FormCard, RadioList } from "./layout";
import { defaultTier, maxSongs, typeForCount, useOptions } from "./options";
import { newBlock, rightsDefaults, useReleaseForm, useUpload, type Block } from "./state";
import { EMPTY_PROFILES, profilesForCreate, ProfilesFields, SavedStoreProfiles, type Profiles } from "./StoreProfiles";
import { addDays } from "./validation";

/*
 * The release cards of the upload page. Every release field of
 * DOCS/DISTRIBUTION_PARITY.md section 1 (number of songs, previously
 * released, release date, record label, album price, language, genres and
 * album title) sits in one dense "Release details" card; the artist and its
 * store profiles share the "Artist" card. One autosaved form (state.tsx).
 */

/** Number of songs: drives the track cards; removing saved songs asks first. */
function SongCountField() {
  const c = useCopy(COPY);
  const { config, release, setRelease } = useWizard();
  const { blocks, setBlocks } = useUpload();
  const [pending, setPending] = useState<{ n: number; removed: Block[] } | null>(null);
  const max = maxSongs(config);
  const titleOf = (b: Block) => release?.tracks?.find((t) => t.id === b.trackId)?.title ?? "";

  const choose = (n: number) => {
    if (n >= blocks.length) {
      setBlocks((bs) => [...bs, ...Array.from({ length: n - bs.length }, newBlock)]);
      return;
    }
    const removed = blocks.slice(n);
    if (removed.some((b) => b.trackId)) setPending({ n, removed });
    else setBlocks((bs) => bs.slice(0, n));
  };

  return (
    <>
      <Field label={c.upSongCount} id="wiz-song_count" hint={c.releaseTypeIs(typeForCount(blocks.length))}>
        <Select value={String(blocks.length)} onChange={(e) => choose(Number(e.target.value))}>
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {c.songCountOption(n)}
            </option>
          ))}
        </Select>
      </Field>
      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        title={c.removeSongsTitle}
        description={pending ? c.removeSongsBody(pending.removed.map((b) => titleOf(b) || c.trackHeading(blocks.indexOf(b) + 1)).join(", ")) : undefined}
        confirmLabel={c.removeSongsConfirm}
        danger
        onConfirm={async () => {
          const target = pending!;
          const ids = target.removed.map((b) => b.trackId).filter((id): id is number => !!id);
          for (const id of ids) await deleteTrack(id);
          setBlocks((bs) => bs.slice(0, target.n));
          setRelease((prev: Release | null) => {
            if (!prev) return prev;
            const rest = (prev.tracks ?? []).filter((t) => !ids.includes(t.id)).map((t, i) => ({ ...t, track_number: i + 1 }));
            return { ...prev, tracks: rest, tracks_count: rest.length } as Release;
          });
        }}
      />
    </>
  );
}

function languageName(code: string, fallback: string, locale: string): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "language" });
    const name = dn.of(code);
    return name && name !== code ? name.charAt(0).toUpperCase() + name.slice(1) : fallback;
  } catch {
    return fallback;
  }
}

/** Release details: every release-level field in one grid. */
export function ReleaseDetailsCard() {
  const c = useCopy(COPY);
  const { t, locale } = useLanguage();
  const { config } = useWizard();
  const opts = useOptions(config);
  const { form, set, err, type } = useReleaseForm();
  const multi = type !== "Single";
  const optional = { optional: true, optionalLabel: t("common.optional") };
  const today = todayIso();
  const earliest = addDays(today, config.min_lead_days);

  // An EP or album starts on the usual tier, saved like any other choice.
  const fallbackPrice = defaultTier(opts.albumPrices, "9.99");
  const missingPrice = multi && !form.album_price;
  useEffect(() => {
    if (missingPrice && fallbackPrice) set("album_price", fallbackPrice);
  }, [missingPrice, fallbackPrice, set]);

  return (
    <FormCard anchor="section-info" number={3} title={c.secDetails} hint={c.secDetailsHint}>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
        {multi && (
          <Field label={c.upAlbumTitle} hint={c.albumTitleHint} error={err("release_title")} id="wiz-release_title" required className="sm:col-span-2 xl:col-span-3">
            <Input value={form.release_title} maxLength={255} onChange={(e) => set("release_title", e.target.value)} />
          </Field>
        )}
        <SongCountField />
        {multi && (
          <Field label={c.upAlbumPrice} error={err("album_price")} id="wiz-album_price">
            <Select value={form.album_price || fallbackPrice} onChange={(e) => set("album_price", e.target.value)}>
              {opts.albumPrices.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label={c.upLanguage} error={err("language")} id="wiz-language" required>
          <Select value={form.language} onChange={(e) => set("language", e.target.value)} placeholder={c.chooseLanguage}>
            {Object.entries(config.languages).map(([code, name]) => (
              <option key={code} value={code}>
                {languageName(code, name, locale)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.primaryGenre} error={err("primary_genre")} id="wiz-primary_genre" required>
          <Select value={form.primary_genre} onChange={(e) => set("primary_genre", e.target.value)} placeholder={c.chooseGenre}>
            {config.genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.secondaryGenreOpt} {...optional} error={err("secondary_genre")} id="wiz-secondary_genre">
          <Select value={form.secondary_genre} onChange={(e) => set("secondary_genre", e.target.value)}>
            <option value="">{c.noSecondGenre}</option>
            {config.genres
              .filter((g) => g !== form.primary_genre)
              .map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
          </Select>
        </Field>
        {/* A single has five fields here: the label takes the rest of the last row. */}
        <Field label={c.upLabel} {...optional} error={err("record_label")} id="wiz-record_label" className={cn(!multi && "sm:col-span-2")}>
          <Input value={form.record_label} maxLength={255} placeholder={c.pvIndependent} onChange={(e) => set("record_label", e.target.value)} />
        </Field>
      </div>

      <Divider />

      <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <RadioList<boolean>
            legend={c.upPrevReleased}
            name="previously_released"
            inline
            value={form.previously_released}
            onChange={(v) => set("previously_released", v)}
            options={[
              { value: false, label: c.prevNo },
              { value: true, label: c.prevYes },
            ]}
          />
          {form.previously_released && (
            <div role="group" aria-labelledby="wiz-moving-title" className="space-y-4 rounded-control border border-border-subtle p-4">
              <p id="wiz-moving-title" className="text-[0.9375rem] font-semibold text-text">
                {c.movingTitle}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={c.originalDateShort} error={err("original_release_date")} id="wiz-original_release_date" required>
                  <Input type="date" value={form.original_release_date} max={today} onChange={(e) => set("original_release_date", e.target.value)} />
                </Field>
                <UpcField hint={c.movingUpcHint} />
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            <RadioList<boolean>
              legend={c.upReleaseDate}
              name="release_asap"
              inline
              value={form.release_asap}
              onChange={(v) => set("release_asap", v)}
              options={[
                { value: true, label: c.dateAsap },
                { value: false, label: c.dateSpecific },
              ]}
            />
            {!form.release_asap && (
              <Field label={c.dateField} error={err("release_date")} id="wiz-release_date" required className="w-full sm:w-48">
                <Input
                  type="date"
                  value={form.release_date}
                  min={form.previously_released ? undefined : earliest}
                  onChange={(e) => set("release_date", e.target.value)}
                />
              </Field>
            )}
          </div>
          {form.release_asap && <p className="mt-2 max-w-[60ch] text-caption text-text-subtle">{c.dateAsapHint}</p>}
        </div>
      </div>

      <Divider />
      <CodesAndRights />
    </FormCard>
  );
}

/** UPC / EAN: here in "Codes and rights", or in the moving group when released before. */
function UpcField({ hint }: { hint: string }) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { form, set, err } = useReleaseForm();
  return (
    <Field label={c.upc} optional optionalLabel={t("common.optional")} hint={hint} error={err("upc")} id="wiz-upc">
      <Input inputMode="numeric" maxLength={14} value={form.upc} onChange={(e) => set("upc", e.target.value.replace(/\D/g, ""))} />
    </Field>
  );
}

/** Codes and rights: UPC (unless it sits in the moving group) and the © / ℗ lines, prefilled. */
function CodesAndRights() {
  const c = useCopy(COPY);
  const { form, set, err, artistName } = useReleaseForm();
  const d = rightsDefaults(form, artistName);
  const year = (k: "c_line_year" | "p_line_year", label: string) => (
    <Field label={label} error={err(k)} id={`wiz-${k}`} required>
      <Input inputMode="numeric" maxLength={4} value={form[k] || d.year} onChange={(e) => set(k, e.target.value.replace(/\D/g, ""))} />
    </Field>
  );
  const owner = (k: "c_line_owner" | "p_line_owner", label: string) => (
    <Field label={label} error={err(k)} id={`wiz-${k}`} required>
      <Input value={form[k] || d.owner} maxLength={255} onChange={(e) => set(k, e.target.value)} />
    </Field>
  );
  return (
    <div>
      <h3 className="text-[0.9375rem] font-semibold text-text">{c.codesTitle}</h3>
      <p className="mt-1 max-w-[60ch] text-body-sm text-text-muted">{c.codesHint}</p>
      <div className="mt-4 grid gap-x-6 gap-y-5 md:grid-cols-2">
        {!form.previously_released && (
          <div className="md:col-span-2 md:max-w-xs">
            <UpcField hint={c.upcAutoHint} />
          </div>
        )}
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
          {year("c_line_year", c.cLineYear)}
          {owner("c_line_owner", c.cLineOwner)}
        </div>
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
          {year("p_line_year", c.pLineYear)}
          {owner("p_line_owner", c.pLineOwner)}
        </div>
      </div>
    </div>
  );
}

/*
 * The artist (step 2) and its store profiles (step 5) are separate sections
 * but share state: profiles typed for an artist that doesn't exist yet are
 * sent with POST /artists when "Save artist" is pressed.
 */
type NewArtistCtx = {
  adding: boolean;
  setAdding: (v: boolean) => void;
  name: string;
  setName: (v: string) => void;
  pending: Profiles;
  setPending: (fn: (p: Profiles) => Profiles) => void;
  pendingErrors: Record<string, string>;
  setPendingErrors: (v: Record<string, string>) => void;
};
const NewArtist = createContext<NewArtistCtx | null>(null);
function useNewArtist(): NewArtistCtx {
  const ctx = useContext(NewArtist);
  if (!ctx) throw new Error("useNewArtist outside NewArtistProvider");
  return ctx;
}

export function NewArtistProvider({ children }: { children: ReactNode }) {
  const { artists } = useUpload();
  const [adding, setAdding] = useState(artists.length === 0);
  const [name, setName] = useState("");
  // Profiles and links for an artist that doesn't exist yet: sent with POST /artists.
  const [pending, setPendingState] = useState<Profiles>(EMPTY_PROFILES);
  const [pendingErrors, setPendingErrors] = useState<Record<string, string>>({});
  const value = useMemo(
    () => ({ adding, setAdding, name, setName, pending, setPending: (fn: (p: Profiles) => Profiles) => setPendingState(fn), pendingErrors, setPendingErrors }),
    [adding, name, pending, pendingErrors],
  );
  return <NewArtist.Provider value={value}>{children}</NewArtist.Provider>;
}

/** 2. Artist: pick one or add one inline (with the plan's artist limit). */
export function ArtistCard() {
  const c = useCopy(COPY);
  const toMessage = useErrorMessage();
  const { toast } = useToast();
  const { artists, putArtist } = useUpload();
  const { artistLimit } = useWizard();
  // The plan decides how many artist profiles an account can have.
  const atLimit = artistLimit != null && artists.length >= artistLimit;
  const { form, set, err } = useReleaseForm();
  const { adding, setAdding, name, setName, pending, setPending, setPendingErrors } = useNewArtist();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const a = await createArtist({ name: name.trim(), ...profilesForCreate(pending) });
      putArtist(a);
      set("artist_id", a.id);
      setAdding(false);
      setName("");
      setPending(() => EMPTY_PROFILES);
      setPendingErrors({});
      toast({ title: c.artistCreated, tone: "success" });
    } catch (e) {
      const fe = fieldErrorsOf(e);
      setPendingErrors(fe);
      setError(fe.name ?? toMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormCard anchor="section-artist" number={2} title={c.upArtist} hint={c.artistSectionHint}>
      {artists.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label={c.artistLabel} error={err("artist") ?? err("artist_id")} id="wiz-artist" required className="sm:w-[22rem]">
            <Select
              value={form.artist_id ? String(form.artist_id) : ""}
              placeholder={c.chooseArtist}
              onChange={(e) => set("artist_id", e.target.value ? Number(e.target.value) : null)}
            >
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
          {!adding && !atLimit && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex h-10 items-center gap-2 self-start rounded-[8px] border border-[#dcd6e8] bg-white px-4 text-[0.8125rem] font-semibold text-text transition-colors hover:bg-nr-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text sm:self-auto"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {c.addNewArtist}
            </button>
          )}
        </div>
      )}
      {atLimit && artists.length > 0 && (
        <p className="mt-3 max-w-[60ch] text-[0.8125rem] text-nr-muted">
          {c.artistLimitNote(artistLimit!)}{" "}
          <Link to="/dashboard/plan" className="font-semibold text-accent-text underline-offset-2 hover:underline">
            {c.artistLimitUpgrade}
          </Link>
        </p>
      )}
      {adding && (
        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start", artists.length > 0 && "mt-5")}>
          <Field
            label={c.newArtistName}
            hint={c.newArtistHint}
            id={artists.length ? "wiz-new-artist" : "wiz-artist"}
            required
            error={error ?? (artists.length ? undefined : (err("artist") ?? err("artist_id")))}
            className="sm:max-w-[44rem] sm:flex-1"
          >
            <Input value={name} maxLength={255} placeholder={c.newArtistPlaceholder} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="flex gap-2 sm:mt-[1.6rem]">
            <button
              type="button"
              disabled={!name.trim() || busy}
              aria-busy={busy || undefined}
              onClick={() => void save()}
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-[8px] bg-nr-primary px-5 text-[0.875rem] font-semibold text-white transition-colors hover:bg-nr-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:cursor-not-allowed disabled:bg-nr-primary-disabled"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {c.saveArtist}
            </button>
            {artists.length > 0 && (
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="inline-flex h-10 items-center rounded-[8px] px-4 text-[0.875rem] font-semibold text-nr-muted hover:bg-nr-soft hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
              >
                {c.cancel}
              </button>
            )}
          </div>
        </div>
      )}
    </FormCard>
  );
}

/** 5. Profiles: the chosen artist's store profiles (connected ones show with Edit), or the new artist's. */
export function ProfilesCard() {
  const c = useCopy(COPY);
  const { artist } = useReleaseForm();
  const { adding, name, pending, setPending, pendingErrors } = useNewArtist();
  const editing = artist && !adding;
  return (
    <FormCard anchor="section-profiles" number={5} title={c.profilesSectionTitle} hint={c.profilesSectionHint}>
      {editing ? (
        <SavedStoreProfiles key={artist.id} artist={artist} />
      ) : (
        <ProfilesFields value={pending} onChange={setPending} errors={pendingErrors} linked={false} artistName={name} idKey="new" />
      )}
    </FormCard>
  );
}
