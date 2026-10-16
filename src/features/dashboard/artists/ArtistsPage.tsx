import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Camera, Mic2, Pencil, Plus } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  Dialog,
  EmptyState,
  Field,
  Input,
  ProgressBar,
  Select,
  Spinner,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  FormAlert,
  LoadError,
  PageHeader,
  PageLoading,
  useAction,
} from "@/features/dashboard/components";
import { CountrySelect } from "@/components/forms/CountrySelect";
import { countryName } from "@/lib/countries";
import { AVATAR_ACCEPT, checkImage } from "@/features/dashboard/settings/imageFile";
import { errorCodeOf } from "@/lib/api/errors";
import {
  createArtist,
  fetchArtists,
  fetchReleaseConfig,
  updateArtist,
  uploadArtistAvatar,
  type ArtistInput,
} from "@/lib/api/catalog";
import {
  isYoutubeChannelUrl,
  parseAppleArtistId,
  parseSpotifyArtistId,
  type ArtistStoreProfiles,
  type ProfileChoice,
  type SocialChoice,
} from "@/lib/api/distribution";
import type { Artist } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

/**
 * /dashboard/artists — list, create, edit, avatar. There is no delete
 * endpoint (artists own releases and earnings history), so none is offered.
 *
 * Plan limit, mirroring ArtistController@store: without an active
 * subscription (or with no resolvable plan) the limit is 1; otherwise the
 * plan's `max_artists` (`limit`). A 403 `artist_limit` from the server is the
 * final word either way.
 */

const LINK_KEYS = [
  "spotify_link",
  "apple_music_link",
  "youtube_music_link",
  "instagram_link",
  "facebook_link",
  "tiktok_link",
  "boomplay_link",
  "audiomack_link",
] as const;
type LinkKey = (typeof LINK_KEYS)[number];

export default function ArtistsPage() {
  const c = useCopy(COPY);
  const { user } = useAuth();
  const res = useResource((signal) => fetchArtists({ signal }), []);
  const [editing, setEditing] = useState<Artist | "new" | null>(null);

  const artists = res.data?.artists ?? [];
  const hasPlan = !!user?.has_active_subscription && !!res.data?.user?.plan;
  const max: number | null = res.data ? (hasPlan ? res.data.limit : 1) : null;
  const atLimit = max !== null && artists.length >= max;

  const replace = (a: Artist) =>
    res.setData((prev) =>
      prev ? { ...prev, artists: prev.artists.map((x) => (x.id === a.id ? { ...x, ...a } : x)) } : prev,
    );

  return (
    <div>
      <PageHeader
        title={c.title}
        description={c.description}
        actions={
          res.data ? (
            <Button leftIcon={<Plus />} onClick={() => setEditing("new")}>
              {c.add}
            </Button>
          ) : undefined
        }
      />

      {res.loading ? (
        <PageLoading rows={3} />
      ) : res.error || !res.data ? (
        <LoadError error={res.error} onRetry={res.reload} />
      ) : (
        <div className="space-y-6">
          {max !== null && max > 0 && (
            <Card padding="sm" className="space-y-3">
              <ProgressBar
                value={Math.min(artists.length, max)}
                max={max}
                label={c.usage(artists.length, max)}
                tone={atLimit ? "warning" : "accent"}
              />
              {!hasPlan && <p className="text-body-sm text-text-subtle">{c.noPlanNote}</p>}
              {atLimit && (
                <p className="flex flex-wrap items-center gap-x-2 text-body-sm text-text-muted">
                  {c.atLimit}
                  <Link to="/dashboard/plan" className="font-semibold text-accent-text underline-offset-4 hover:underline">
                    {c.upgrade}
                  </Link>
                </p>
              )}
            </Card>
          )}

          {artists.length === 0 ? (
            <EmptyState
              icon={<Mic2 />}
              title={c.emptyTitle}
              description={c.emptyBody}
              action={
                <Button leftIcon={<Plus />} onClick={() => setEditing("new")}>
                  {c.add}
                </Button>
              }
            />
          ) : (
            <ul aria-label={c.listLabel} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {artists.map((a) => (
                <li key={a.id} className="min-w-0">
                  <ArtistCard artist={a} onEdit={() => setEditing(a)} onUpdated={replace} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {editing && (
        <ArtistDialog
          artist={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(a, created) => {
            if (created) res.setData((prev) => (prev ? { ...prev, artists: [{ releases_count: 0, ...a }, ...prev.artists] } : prev));
            else replace(a);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

/* ── Card with avatar upload ─────────────────────────────────────────── */

function ArtistCard({
  artist,
  onEdit,
  onUpdated,
}: {
  artist: Artist;
  onEdit: () => void;
  onUpdated: (a: Artist) => void;
}) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const upload = useAction((file: File) => uploadArtistAvatar(artist.id, file));

  const onFile = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    setPhotoError(null);
    const problem = await checkImage(file, { maxBytes: 6 * 1024 * 1024, minPx: 300 });
    if (problem) {
      setPhotoError(
        problem === "type"
          ? c.photoType
          : problem === "size"
            ? c.photoSize
            : problem === "dimensions"
              ? c.photoDims
              : c.photoUnreadable,
      );
      return;
    }
    const res = await upload.run(file);
    if (res.ok) {
      onUpdated(res.value);
      toast({ title: c.photoUpdated, tone: "success" });
    }
  };

  const meta = [
    artist.primary_genre,
    artist.country ? countryName(artist.country, locale) : null,
    typeof artist.releases_count === "number" ? c.releases(artist.releases_count) : null,
  ].filter(Boolean);

  const inputId = `artist-photo-${artist.id}`;
  const errorId = `${inputId}-error`;

  return (
    <Card as="article" className="flex h-full flex-col">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <Avatar name={artist.name} src={artist.avatar_url} size="lg" />
          {upload.pending && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Spinner label={c.uploading} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-h4 font-bold">{artist.name}</h2>
          {meta.length > 0 && <p className="mt-1 break-words text-body-sm text-text-subtle">{meta.join(" · ")}</p>}
        </div>
      </div>

      {(photoError || upload.error) && (
        <p id={errorId} role="alert" className="mt-3 text-body-sm font-medium text-danger">
          {photoError ?? upload.fieldErrors.avatar ?? upload.error}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Button variant="secondary" size="sm" leftIcon={<Pencil />} onClick={onEdit}>
          {c.edit}
        </Button>
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept={AVATAR_ACCEPT}
          className="sr-only"
          aria-describedby={photoError || upload.error ? errorId : undefined}
          onChange={(e) => void onFile(e.target.files?.[0])}
          disabled={upload.pending}
          title={c.photoRules}
        />
        <Button asChild variant="ghost" size="sm">
          <label htmlFor={inputId} className="cursor-pointer">
            <Camera className="h-4 w-4" aria-hidden />
            {upload.pending ? c.uploading : artist.avatar_url ? c.changePhoto : c.uploadPhoto}
            <span className="sr-only">, {c.photoFor(artist.name)}. {c.photoRules}</span>
          </label>
        </Button>
      </div>
    </Card>
  );
}

/* ── Create / edit dialog ────────────────────────────────────────────── */

type FormState = {
  name: string;
  bio: string;
  country: string;
  primary_genre: string;
} & Record<LinkKey, string> &
  StoreForm;

/* Store profile questions (DOCS/DISTRIBUTION_PARITY.md section 2). */
type StoreForm = {
  spotify_profile: ProfileChoice | "";
  spotify_url: string;
  apple_music_profile: ProfileChoice | "";
  apple_music_url: string;
  youtube_music_profile: ProfileChoice | "";
  youtube_channel_url: string;
  instagram_profile: SocialChoice | "";
  facebook_profile: SocialChoice | "";
};
const STORE_SERVICES = [
  { key: "spotify", choice: "spotify_profile", url: "spotify_url" },
  { key: "apple_music", choice: "apple_music_profile", url: "apple_music_url" },
  { key: "youtube_music", choice: "youtube_music_profile", url: "youtube_channel_url" },
] as const;
const SOCIAL_SERVICES = [
  { key: "instagram", choice: "instagram_profile" },
  { key: "facebook", choice: "facebook_profile" },
] as const;

function storeFormFrom(a: (Artist & ArtistStoreProfiles) | null): StoreForm {
  return {
    spotify_profile: a?.spotify_profile ?? "",
    spotify_url: a?.spotify_artist_id ? `https://open.spotify.com/artist/${a.spotify_artist_id}` : "",
    apple_music_profile: a?.apple_music_profile ?? "",
    apple_music_url: a?.apple_music_artist_id ? `https://music.apple.com/artist/${a.apple_music_artist_id}` : "",
    youtube_music_profile: a?.youtube_music_profile ?? "",
    youtube_channel_url: a?.youtube_channel_url ?? "",
    instagram_profile: a?.instagram_profile ?? "",
    facebook_profile: a?.facebook_profile ?? "",
  };
}

const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]+$/i;

function ArtistDialog({
  artist,
  onClose,
  onSaved,
}: {
  artist: (Artist & ArtistStoreProfiles) | null;
  onClose: () => void;
  onSaved: (a: Artist, created: boolean) => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const config = useResource(() => fetchReleaseConfig(), []);
  const [form, setForm] = useState<FormState>(() => {
    const base = {
      name: artist?.name ?? "",
      bio: artist?.bio ?? "",
      country: (artist?.country ?? (artist ? "" : (user?.country ?? ""))).toUpperCase().slice(0, 2),
      primary_genre: artist?.primary_genre ?? "",
    };
    const links = Object.fromEntries(LINK_KEYS.map((k) => [k, (artist?.[k] as string | null | undefined) ?? ""])) as Record<
      LinkKey,
      string
    >;
    return { ...base, ...links, ...storeFormFrom(artist) };
  });
  const [local, setLocal] = useState<Record<string, string>>({});

  const linked = artist?.has_delivered_release === true;
  const save = useAction(async (payload: ArtistInput & { name: string }) =>
    artist ? updateArtist(artist.id, payload) : createArtist(payload),
  );

  const set = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setLocal((l) => {
      const n = { ...l };
      delete n[k];
      return n;
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = c.nameRequired;
    for (const k of LINK_KEYS) {
      const v = form[k].trim();
      if (v && !URL_RE.test(v)) errs[k] = c.urlInvalid;
    }
    const spotifyId = parseSpotifyArtistId(form.spotify_url);
    const appleId = parseAppleArtistId(form.apple_music_url);
    if (!linked) {
      if (form.spotify_profile === "existing") {
        if (!form.spotify_url.trim()) errs.spotify_url = c.storeLinkRequired;
        else if (!spotifyId) errs.spotify_url = c.spotifyLinkInvalid;
      }
      if (form.apple_music_profile === "existing") {
        if (!form.apple_music_url.trim()) errs.apple_music_url = c.storeLinkRequired;
        else if (!appleId) errs.apple_music_url = c.appleLinkInvalid;
      }
      if (form.youtube_music_profile === "existing") {
        if (!form.youtube_channel_url.trim()) errs.youtube_channel_url = c.storeLinkRequired;
        else if (!isYoutubeChannelUrl(form.youtube_channel_url)) errs.youtube_channel_url = c.youtubeLinkInvalid;
      }
    }
    setLocal(errs);
    if (Object.keys(errs).length) return;

    const payload: ArtistInput & { name: string } = {
      name: form.name.trim(),
      bio: form.bio.trim() || null,
      country: form.country || null,
      primary_genre: form.primary_genre || null,
    };
    for (const k of LINK_KEYS) payload[k] = form[k].trim() || null;
    if (!linked) {
      const store: ArtistStoreProfiles = {
        spotify_profile: form.spotify_profile || null,
        spotify_artist_id: form.spotify_profile === "existing" ? spotifyId : null,
        apple_music_profile: form.apple_music_profile || null,
        apple_music_artist_id: form.apple_music_profile === "existing" ? appleId : null,
        youtube_music_profile: form.youtube_music_profile || null,
        youtube_channel_url: form.youtube_music_profile === "existing" ? form.youtube_channel_url.trim() : null,
        instagram_profile: form.instagram_profile || null,
        facebook_profile: form.facebook_profile || null,
      };
      Object.assign(payload, store);
    }

    const res = await save.run(payload);
    if (res.ok) {
      toast({ title: artist ? c.saved : c.created, tone: "success" });
      onSaved(res.value, !artist);
    }
  };

  const code = errorCodeOf(save.errorObj);
  const err = (k: string) => local[k] ?? save.fieldErrors[k] ?? null;
  const genres = config.data?.genres ?? [];
  const formId = "artist-form";

  return (
    <Dialog
      open
      onClose={save.pending ? () => {} : onClose}
      dismissible={!save.pending}
      size="lg"
      title={artist ? c.editTitle(artist.name) : c.createTitle}
      description={c.formDescription}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={save.pending}>
            {c.cancel}
          </Button>
          <Button type="submit" form={formId} loading={save.pending}>
            {artist ? c.save : c.create}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        {code === "artist_limit" ? (
          <FormAlert tone="warning">
            {c.limitReached}{" "}
            <Link to="/dashboard/plan" className="font-semibold text-accent-text underline underline-offset-4">
              {c.limitLink}
            </Link>
          </FormAlert>
        ) : code === "artist_exists" ? (
          <FormAlert>{c.exists}</FormAlert>
        ) : save.error && Object.keys(save.fieldErrors).length === 0 ? (
          <FormAlert>{save.error}</FormAlert>
        ) : save.error ? (
          <FormAlert>{t("err.fix_fields")}</FormAlert>
        ) : null}

        <Field label={c.name} error={err("name")} required>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={255} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.country} error={err("country")} optional optionalLabel={t("common.optional")}>
            <CountrySelect value={form.country} onChange={(v) => set("country", v)} />
          </Field>
          <Field label={c.genre} error={err("primary_genre")} optional optionalLabel={t("common.optional")}>
            <Select value={form.primary_genre} onChange={(e) => set("primary_genre", e.target.value)}>
              <option value="">{c.genrePlaceholder}</option>
              {form.primary_genre && !genres.includes(form.primary_genre) && (
                <option value={form.primary_genre}>{form.primary_genre}</option>
              )}
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={c.bio} hint={c.bioHint} error={err("bio")} optional optionalLabel={t("common.optional")}>
          <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={3000} rows={4} />
        </Field>

        <fieldset className="min-w-0">
          <legend className="text-[0.875rem] font-semibold text-text-muted">{c.storeLegend}</legend>
          {linked ? (
            <p className="mt-1 rounded-control border border-success/30 bg-success-soft px-3.5 py-2.5 text-body-sm text-text">
              {c.storeLinked}
            </p>
          ) : (
            <>
              <p className="mb-3 mt-1 text-[0.8125rem] text-text-subtle">{c.storeHint}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {STORE_SERVICES.map((sv) => (
                  <div key={sv.key} className="min-w-0 space-y-2">
                    <Field label={c.storeServices[sv.key]} error={err(sv.choice)}>
                      <Select value={form[sv.choice]} onChange={(e) => set(sv.choice, e.target.value)}>
                        <option value="">{c.storeUnset}</option>
                        <option value="existing">{c.storeExisting}</option>
                        <option value="new">{c.storeNew}</option>
                      </Select>
                    </Field>
                    {form[sv.choice] === "existing" && (
                      <Field
                        label={sv.key === "spotify" ? c.spotifyLink : sv.key === "apple_music" ? c.appleLink : c.youtubeLink}
                        error={err(sv.url)}
                        required
                      >
                        <Input
                          inputMode="url"
                          placeholder={sv.key === "spotify" ? "https://open.spotify.com/artist/" : "https://"}
                          value={form[sv.url]}
                          onChange={(e) => set(sv.url, e.target.value)}
                          maxLength={255}
                        />
                      </Field>
                    )}
                  </div>
                ))}
                {SOCIAL_SERVICES.map((sv) => (
                  <Field key={sv.key} label={c.storeServices[sv.key]} error={err(sv.choice)}>
                    <Select value={form[sv.choice]} onChange={(e) => set(sv.choice, e.target.value)}>
                      <option value="">{c.storeUnset}</option>
                      <option value="group">{c.storeGroup}</option>
                      <option value="none">{c.storeNone}</option>
                    </Select>
                  </Field>
                ))}
              </div>
            </>
          )}
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="text-[0.875rem] font-semibold text-text-muted">{c.linksLegend}</legend>
          <p className="mb-3 mt-1 text-[0.8125rem] text-text-subtle">{c.linksHint}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {LINK_KEYS.map((k) => (
              <Field key={k} label={c.links[k]} error={err(k)} optional optionalLabel={t("common.optional")}>
                <Input
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  value={form[k]}
                  onChange={(e) => set(k, e.target.value)}
                  maxLength={255}
                />
              </Field>
            ))}
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}
