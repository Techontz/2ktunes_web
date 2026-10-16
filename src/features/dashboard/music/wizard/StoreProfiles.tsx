import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Field, Input } from "@/components/ui";
import { updateArtist, type ArtistInput } from "@/lib/api/catalog";
import { fieldErrorsOf } from "@/lib/api/errors";
import type { Artist, SocialProfileChoice, StoreProfileChoice } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "../copy";
import { useReportSaver } from "./context";
import { RadioList, TextButton } from "./layout";
import { useUpload } from "./state";
import { useAutosave } from "./useAutosave";

/**
 * 5. STORE PROFILES for the chosen artist (DOCS/DISTRIBUTION_PARITY.md
 * section 2). Spotify, Apple Music and YouTube Music: existing profile (paste
 * its link) or a new one; once the artist has a delivered release they show
 * as linked instead. Instagram and Facebook: group with the existing profile
 * or none yet. Saved on the artist (PATCH /artists/{id}) as it changes.
 */

/** open.spotify.com/artist/{id} or spotify:artist:{id} */
export function spotifyArtistId(link: string): string | null {
  return link.match(/artist[/:]([A-Za-z0-9]{22})/)?.[1] ?? null;
}

/** music.apple.com/.../artist/{name}/{id} (or ?id=) */
export function appleArtistId(link: string): string | null {
  return link.match(/artist\/(?:[^/?#]+\/)?(\d{3,})/)?.[1] ?? link.match(/[?&]id=?(\d{3,})/)?.[1] ?? null;
}

type StoreKey = "spotify" | "apple_music" | "youtube_music";
export const SOCIAL_LINKS = ["instagram_link", "tiktok_link", "facebook_link", "boomplay_link", "audiomack_link"] as const;
type SocialLink = (typeof SOCIAL_LINKS)[number];
export type Profiles = {
  spotify: { choice: StoreProfileChoice | null; link: string };
  apple_music: { choice: StoreProfileChoice | null; link: string };
  youtube_music: { choice: StoreProfileChoice | null; link: string };
  instagram: SocialProfileChoice | null;
  facebook: SocialProfileChoice | null;
  links: Record<SocialLink, string>;
};

export const EMPTY_PROFILES: Profiles = {
  // A first upload starts on "Existing profile" with the link box open; "New profile" is one tap away.
  spotify: { choice: "existing", link: "" },
  apple_music: { choice: "existing", link: "" },
  youtube_music: { choice: "existing", link: "" },
  instagram: "none",
  facebook: "none",
  links: { instagram_link: "", tiktok_link: "", facebook_link: "", boomplay_link: "", audiomack_link: "" },
};

function fromArtist(a: Artist): Profiles {
  return {
    spotify: { choice: a.spotify_profile ?? "existing", link: a.spotify_link ?? "" },
    apple_music: { choice: a.apple_music_profile ?? "existing", link: a.apple_music_link ?? "" },
    youtube_music: { choice: a.youtube_music_profile ?? "existing", link: a.youtube_channel_url ?? a.youtube_music_link ?? "" },
    instagram: a.instagram_profile ?? "none",
    facebook: a.facebook_profile ?? "none",
    links: Object.fromEntries(SOCIAL_LINKS.map((k) => [k, (a[k] as string | null | undefined) ?? ""])) as Record<SocialLink, string>,
  };
}

const keepLink = (p: { choice: StoreProfileChoice | null; link: string }) => (p.choice === "existing" && p.link.trim() ? p.link.trim() : undefined);

export function profilesPatch(p: Profiles): ArtistInput {
  const patch: ArtistInput = {
    spotify_profile: p.spotify.choice,
    apple_music_profile: p.apple_music.choice,
    youtube_music_profile: p.youtube_music.choice,
    instagram_profile: p.instagram,
    facebook_profile: p.facebook,
  };
  const spotify = keepLink(p.spotify);
  if (spotify) {
    patch.spotify_link = spotify;
    patch.spotify_artist_id = spotifyArtistId(spotify);
  }
  const apple = keepLink(p.apple_music);
  if (apple) {
    patch.apple_music_link = apple;
    patch.apple_music_artist_id = appleArtistId(apple);
  }
  const yt = keepLink(p.youtube_music);
  if (yt) patch.youtube_channel_url = yt;
  for (const k of SOCIAL_LINKS) patch[k] = p.links[k].trim() || null;
  return patch;
}

/** For POST /artists: only what was actually filled in. */
export function profilesForCreate(p: Profiles): ArtistInput {
  return Object.fromEntries(Object.entries(profilesPatch(p)).filter(([, v]) => v !== null && v !== undefined && v !== "")) as ArtistInput;
}

/** The chosen artist's profiles, autosaved on the artist (PATCH /artists/{id}). */
export function SavedStoreProfiles({ artist }: { artist: Artist }) {
  const { putArtist } = useUpload();
  const [p, setP] = useState<Profiles>(() => fromArtist(artist));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const auto = useAutosave(
    p,
    async (v) => {
      try {
        putArtist(await updateArtist(artist.id, profilesPatch(v)));
        setErrors({});
      } catch (err) {
        setErrors(fieldErrorsOf(err));
        throw err;
      }
    },
    { delay: 900 },
  );
  useReportSaver(`profiles-${artist.id}`, auto);
  const saved = fromArtist(artist);
  const onFile: Partial<Record<StoreKey, string>> = {};
  for (const k of ["spotify", "apple_music", "youtube_music"] as StoreKey[]) {
    if (saved[k].choice === "existing" && saved[k].link.trim()) onFile[k] = saved[k].link.trim();
    else if (saved[k].choice === "new" && (artist[`${k}_profile` as "spotify_profile"] ?? null) === "new") onFile[k] = "";
  }
  return <ProfilesFields value={p} onChange={setP} errors={errors} linked={!!artist.has_delivered_release} artistName={artist.name} idKey={String(artist.id)} onFile={onFile} />;
}

/**
 * Store profile tiles plus social links. Controlled: the Artist card holds the
 * values for an artist that isn't created yet (they go in POST /artists), and
 * SavedStoreProfiles holds them for an existing one.
 */
export function ProfilesFields({
  value: p,
  onChange: setP,
  errors,
  linked,
  artistName,
  idKey,
  onFile = {},
}: {
  value: Profiles;
  onChange: (fn: (p: Profiles) => Profiles) => void;
  errors: Record<string, string>;
  linked: boolean;
  artistName: string;
  idKey: string;
  /** Profiles saved on an earlier upload: shown as connected, with Edit, instead of asking again. */
  onFile?: Partial<Record<StoreKey, string>>;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const [editing, setEditing] = useState<Set<StoreKey>>(new Set());
  const linkError = (key: StoreKey) => errors[key === "spotify" ? "spotify_link" : key === "apple_music" ? "apple_music_link" : "youtube_channel_url"];

  /* One row per service: name on the left, a pill switch on the right, the link underneath when needed. */
  const row = (name: string, control: ReactNode, below?: ReactNode) => (
    <li key={name} className="px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-body-sm font-bold text-text-muted">
            {name.charAt(0)}
          </span>
          <span className="truncate text-[0.9375rem] font-semibold text-text">{name}</span>
        </span>
        {control}
      </div>
      {below && <div className="mt-3 sm:pl-12">{below}</div>}
    </li>
  );

  const store = (key: StoreKey) => {
    const name = c.storeNames[key];
    const v = p[key];
    if (linked) {
      return row(
        name,
        <span className="flex items-center gap-2 text-body-sm text-text-muted">
          <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
          {c.profileLinked}
        </span>,
      );
    }
    const saved = onFile[key];
    if (saved !== undefined && !editing.has(key) && !linkError(key)) {
      return row(
        name,
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex min-w-0 items-center gap-2 text-body-sm text-text-muted">
            <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
            <span className="min-w-0 truncate">{saved ? c.profileConnected(saved) : c.profileWillCreate}</span>
          </span>
          <TextButton onClick={() => setEditing((e) => new Set(e).add(key))}>{c.profileEdit}</TextButton>
        </span>,
      );
    }
    return row(
      name,
      <RadioList<StoreProfileChoice>
        legend={name}
        legendHidden
        name={`profile-${key}-${idKey}`}
        inline
        value={v.choice}
        onChange={(choice) => setP((x) => ({ ...x, [key]: { ...x[key], choice } }))}
        options={[
          { value: "existing", label: c.profileExisting },
          { value: "new", label: c.profileNew },
        ]}
      />,
      v.choice === "existing" ? (
        <Field label={c.profileLink(name)} hint={c.profileLinkHint} error={linkError(key)}>
          <Input
            type="url"
            inputMode="url"
            placeholder="https://"
            value={v.link}
            maxLength={500}
            onChange={(e) => {
              const val = e.target.value;
              setP((x) => ({ ...x, [key]: { ...x[key], link: val } }));
            }}
          />
        </Field>
      ) : undefined,
    );
  };

  const social = (key: "instagram" | "facebook") =>
    row(
      c.storeNames[key],
      <RadioList<SocialProfileChoice>
        legend={c.storeNames[key]}
        legendHidden
        name={`profile-${key}-${idKey}`}
        inline
        value={p[key]}
        onChange={(choice) => setP((x) => ({ ...x, [key]: choice }))}
        options={[
          { value: "group", label: c.socialGroup },
          { value: "none", label: c.socialNone },
        ]}
      />,
    );

  const SITE: Record<string, string> = {
    instagram_link: "https://instagram.com/",
    tiktok_link: "https://tiktok.com/@",
    facebook_link: "https://facebook.com/",
    boomplay_link: "https://boomplay.com/artists/",
    audiomack_link: "https://audiomack.com/",
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-[1rem] font-semibold text-text">{artistName.trim() ? c.upProfiles(artistName.trim()) : c.profilesHeading}</h3>
        <p className="mt-1 max-w-[60ch] text-body-sm text-text-muted">{c.upProfilesHint}</p>
        <ul className="mt-4 divide-y divide-border-subtle overflow-hidden rounded-control border border-border-subtle bg-surface-raised">
          {(["spotify", "apple_music", "youtube_music"] as StoreKey[]).map(store)}
          {social("instagram")}
          {social("facebook")}
        </ul>
      </div>

      <div role="group" aria-labelledby={`social-links-${idKey}`}>
        <h3 id={`social-links-${idKey}`} className="text-[1rem] font-semibold text-text">
          {c.socialLinks}
        </h3>
        <p className="mt-1 max-w-[60ch] text-body-sm text-text-muted">{c.socialLinksHint}</p>
        <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {SOCIAL_LINKS.map((k) => {
            const name = c.storeNames[k.replace("_link", "")];
            return (
              <Field key={k} label={c.profileLink(name)} optional optionalLabel={t("common.optional")} error={errors[k]}>
                <Input
                  type="url"
                  inputMode="url"
                  placeholder={`${SITE[k] ?? "https://"}yourname`}
                  value={p.links[k]}
                  maxLength={500}
                  onChange={(e) => {
                    const val = e.target.value;
                    setP((x) => ({ ...x, links: { ...x.links, [k]: val } }));
                  }}
                />
              </Field>
            );
          })}
        </div>
      </div>
    </div>
  );
}
