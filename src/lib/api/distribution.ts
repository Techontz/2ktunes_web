import { ApiError, request } from "./client";
import type { SplitSheet } from "./types";

/**
 * Distribution parity additions (DOCS/DISTRIBUTION_PARITY.md sections 2 to 4):
 * artist store profiles, per track splits with recoupment, past
 * collaborators and artist profile claims.
 *
 * Kept apart from catalog.ts on purpose: the release and track types there are
 * owned by the upload page.
 */

type S = { signal?: AbortSignal };

/** True for an endpoint the backend has not deployed yet (404 route / 501). */
export function isNotAvailable(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 501 || err.status === 404);
}

/* ── Artist store profiles (spec 2) ─────────────────────────────────── */

export type ProfileChoice = "existing" | "new";
export type SocialChoice = "group" | "none";

export type ArtistStoreProfiles = {
  spotify_profile?: ProfileChoice | null;
  spotify_artist_id?: string | null;
  apple_music_profile?: ProfileChoice | null;
  apple_music_artist_id?: string | null;
  youtube_music_profile?: ProfileChoice | null;
  youtube_channel_url?: string | null;
  instagram_profile?: SocialChoice | null;
  facebook_profile?: SocialChoice | null;
  /** Set by `GET /artists` once the artist has at least one delivered release. */
  has_delivered_release?: boolean;
};

/** "https://open.spotify.com/artist/ID?si=..", "spotify:artist:ID" or a bare ID → ID. */
export function parseSpotifyArtistId(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  const uri = /^spotify:artist:([A-Za-z0-9]{22})$/.exec(v);
  if (uri) return uri[1];
  const url = /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?artist\/([A-Za-z0-9]{22})(?:[/?#].*)?$/i.exec(v);
  if (url) return url[1];
  return /^[A-Za-z0-9]{22}$/.test(v) ? v : null;
}

/** "https://music.apple.com/tz/artist/name/123456789" or a bare number → "123456789". */
export function parseAppleArtistId(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^\d{3,15}$/.test(v)) return v;
  const url = /^https?:\/\/(?:music|itunes)\.apple\.com\/.*artist\/(?:[^/?#]+\/)?(?:id)?(\d{3,15})(?:[/?#].*)?$/i.exec(v);
  return url ? url[1] : null;
}

/** A YouTube channel link: /channel/UC.., /@handle, /c/name or /user/name. */
export function isYoutubeChannelUrl(input: string): boolean {
  return /^https?:\/\/(?:www\.|m\.|music\.)?youtube\.com\/(?:channel\/UC[\w-]{10,}|@[\w.-]+|c\/[\w.-]+|user\/[\w.-]+)\/?(?:[?#].*)?$/i.test(
    input.trim(),
  );
}

/* ── Splits (spec 3) ───────────────────────────────────────────────── */

export type Collaborator = { email: string; name: string };

export async function fetchCollaborators({ signal }: S = {}): Promise<Collaborator[]> {
  const res = await request<{ collaborators?: Collaborator[] }>("/splits/collaborators", { signal });
  return res.collaborators ?? [];
}

export type TrackSplitShare = {
  name: string;
  email: string;
  role?: string | null;
  share_bp: number;
  recoup_minor?: number;
  recoup_currency?: string;
};

export function proposeTrackSplit(releaseId: number, data: { track_id: number; shares: TrackSplitShare[] }) {
  return request<{ message: string; sheet: SplitSheet }>(`/releases/${releaseId}/splits`, {
    method: "POST",
    body: data,
  });
}

/* ── Artist profile claims (spec 4) ────────────────────────────────── */

export type ClaimService = "spotify" | "apple_music" | "youtube_oac" | "tidal";
export type ChannelOption = "none" | "shared" | "dedicated";
export type ClaimStatus = "requested" | "in_progress" | "completed" | "rejected";

export type ArtistProfileClaim = {
  id: number;
  artist_id: number;
  service: ClaimService;
  status: ClaimStatus | string;
  channel_option: ChannelOption | null;
  channel_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchArtistClaims(artistId: number, { signal }: S = {}): Promise<ArtistProfileClaim[]> {
  const res = await request<{ claims?: ArtistProfileClaim[] }>(`/artists/${artistId}/claims`, { signal });
  return res.claims ?? [];
}

export type ClaimInput =
  | { service: "spotify" | "apple_music" | "tidal" }
  | { service: "youtube_oac"; channel_option: ChannelOption; channel_url?: string | null };

export async function requestArtistClaim(artistId: number, data: ClaimInput): Promise<ArtistProfileClaim | null> {
  const res = await request<{ claim?: ArtistProfileClaim }>(`/artists/${artistId}/claims`, {
    method: "POST",
    body: data,
  });
  return res.claim ?? null;
}
