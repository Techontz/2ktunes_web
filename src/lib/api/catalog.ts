import { request } from "./client";
import type {
  Artist,
  ArtistsResponse,
  Credit,
  Paginated,
  Release,
  ReleaseConfig,
  ReleaseSummary,
  ReleaseValidation,
  SplitInvitation,
  SplitSheet,
  Store,
  Track,
} from "./types";

/**
 * Catalogue: releases, tracks, artwork, validation, splits, artists, stores.
 * DOCS/API.md → "Releases", "Splits", "Artists"; verified in
 * ReleaseController / TrackController / SplitController / ArtistController.
 */

type S = { signal?: AbortSignal };

/* ── Reference data ────────────────────────────────────────────────── */

let configCache: Promise<ReleaseConfig> | null = null;

/** GET /release-config — cached for the session (it is static server config). */
export function fetchReleaseConfig(): Promise<ReleaseConfig> {
  if (!configCache) {
    configCache = request<{ config: ReleaseConfig }>("/release-config", { auth: false })
      .then((r) => r.config)
      .catch((err) => {
        configCache = null;
        throw err;
      });
  }
  return configCache;
}

let storesCache: Promise<Store[]> | null = null;

export function fetchStores(): Promise<Store[]> {
  if (!storesCache) {
    storesCache = request<{ stores: Store[] }>("/stores", { auth: false })
      .then((r) => r.stores ?? [])
      .catch((err) => {
        storesCache = null;
        throw err;
      });
  }
  return storesCache;
}

/** Test hook: forget cached reference data. */
export function resetCatalogCaches() {
  configCache = null;
  storesCache = null;
}

/* ── Releases ──────────────────────────────────────────────────────── */

type ReleaseListParams = {
  status?: string;
  type?: string;
  q?: string;
  sort?: "newest" | "oldest" | "release_date" | "title";
  page?: number;
  per_page?: number;
};

export function fetchReleases(params: ReleaseListParams = {}, { signal }: S = {}) {
  return request<{ releases: Release[]; meta: Paginated; summary: ReleaseSummary }>("/releases", {
    signal,
    query: params,
  });
}

export async function fetchRelease(id: number | string, { signal }: S = {}): Promise<Release> {
  const res = await request<{ release: Release }>(`/releases/${id}`, { signal });
  return res.release;
}

/** Any writable release field (see ReleaseController::rules). */
export type ReleasePatch = Partial<{
  release_type: Release["release_type"];
  release_title: string;
  artist_id: number | null;
  artist_name: string | null;
  version: string | null;
  additional_artists: { name: string; role: "primary_artist" | "featured_artist" | "remixer" }[];
  release_date: string | null;
  release_time: string | null;
  release_timezone: string | null;
  original_release_date: string | null;
  previously_released: boolean;
  record_label: string | null;
  language: string | null;
  primary_genre: string | null;
  secondary_genre: string | null;
  c_line_year: string | null;
  c_line_owner: string | null;
  p_line_year: string | null;
  p_line_owner: string | null;
  is_compilation: boolean;
  upc: string | null;
  platforms: string[];
  territories: Release["territories"];
  social_options: Record<string, boolean>;
  agreements: Record<string, boolean>;
  presave_enabled: boolean;
  smart_link_enabled: boolean;
  draft_step: string | null;
}>;

export async function createRelease(
  data: ReleasePatch & { release_type: Release["release_type"]; release_title: string },
): Promise<Release> {
  const res = await request<{ release: Release }>("/releases", { method: "POST", body: data });
  return res.release;
}

export async function updateRelease(id: number, patch: ReleasePatch): Promise<Release> {
  const res = await request<{ release: Release }>(`/releases/${id}`, { method: "PATCH", body: patch });
  return res.release;
}

export function deleteRelease(id: number) {
  return request<{ message: string }>(`/releases/${id}`, { method: "DELETE" });
}

export async function fetchValidation(id: number, { signal }: S = {}): Promise<ReleaseValidation> {
  const res = await request<{ validation: ReleaseValidation }>(`/releases/${id}/validation`, { signal });
  return res.validation;
}

export async function attachArtwork(id: number, source: { upload_id: string } | File): Promise<Release> {
  let body: FormData | { upload_id: string };
  if (source instanceof File) {
    body = new FormData();
    body.append("cover_image", source);
  } else {
    body = source;
  }
  const res = await request<{ release: Release }>(`/releases/${id}/artwork`, { method: "POST", body });
  return res.release;
}

export async function submitRelease(id: number): Promise<Release> {
  const res = await request<{ release: Release }>(`/releases/${id}/submit`, { method: "POST" });
  return res.release;
}

export async function withdrawSubmission(id: number): Promise<Release> {
  const res = await request<{ release: Release }>(`/releases/${id}/withdraw`, { method: "POST" });
  return res.release;
}

export async function requestTakedown(id: number, reason: string): Promise<Release> {
  const res = await request<{ release: Release }>(`/releases/${id}/takedown`, {
    method: "POST",
    body: { reason },
  });
  return res.release;
}

/* ── Tracks ────────────────────────────────────────────────────────── */

export type TrackPatch = Partial<{
  title: string;
  version: string | null;
  primary_artist: string | null;
  featured_artists: string[];
  isrc: string | null;
  language: string | null;
  lyrics: string | null;
  instrumental: boolean;
  explicit: boolean;
  is_clean_version: boolean;
  ai_generated: boolean;
  preview_start_seconds: number | null;
  publisher: string | null;
  ownership: "original" | "cover" | "remix" | "public_domain";
  primary_genre: string | null;
  credits: Credit[];
}>;

export async function addTrack(releaseId: number, data: TrackPatch & { title: string }): Promise<Track> {
  const res = await request<{ track: Track }>(`/releases/${releaseId}/tracks`, { method: "POST", body: data });
  return res.track;
}

export async function updateTrack(id: number, patch: TrackPatch): Promise<Track> {
  const res = await request<{ track: Track }>(`/tracks/${id}`, { method: "PATCH", body: patch });
  return res.track;
}

export function deleteTrack(id: number) {
  return request<{ message: string }>(`/tracks/${id}`, { method: "DELETE" });
}

export async function reorderTracks(releaseId: number, order: number[]): Promise<Track[]> {
  const res = await request<{ tracks: Track[] }>(`/releases/${releaseId}/tracks/reorder`, {
    method: "POST",
    body: { order },
  });
  return res.tracks;
}

export async function attachAudio(trackId: number, uploadId: string): Promise<Track> {
  const res = await request<{ track: Track }>(`/tracks/${trackId}/audio`, {
    method: "POST",
    body: { upload_id: uploadId },
  });
  return res.track;
}

export function copyTrackMetadata(trackId: number, fields: string[]) {
  return request<{ message: string; updated: number }>(`/tracks/${trackId}/copy-metadata`, {
    method: "POST",
    body: { fields },
  });
}

/* ── Splits ────────────────────────────────────────────────────────── */

export function fetchSplits({ signal }: S = {}) {
  return request<{ sheets: SplitSheet[]; invitations: SplitInvitation[] }>("/splits", { signal });
}

export async function fetchReleaseSplits(releaseId: number, { signal }: S = {}): Promise<SplitSheet[]> {
  const res = await request<{ sheets: SplitSheet[] }>(`/releases/${releaseId}/splits`, { signal });
  return res.sheets ?? [];
}

export async function proposeSplit(
  releaseId: number,
  data: {
    track_id?: number | null;
    effective_from?: string | null;
    shares: { name: string; email: string; role?: string | null; share_bp: number }[];
  },
) {
  return request<{ message: string; sheet: SplitSheet }>(`/releases/${releaseId}/splits`, {
    method: "POST",
    body: {
      ...data,
      track_id: data.track_id || undefined,
      effective_from: data.effective_from || undefined,
    },
  });
}

export function respondToShare(shareId: number, accept: boolean) {
  return request<{ share: unknown }>(`/splits/shares/${shareId}/respond`, { method: "POST", body: { accept } });
}

export function respondToShareByToken(token: string, accept: boolean) {
  return request<{ share: unknown }>("/splits/respond", { method: "POST", body: { token, accept } });
}

/* ── Artists ───────────────────────────────────────────────────────── */

export function fetchArtists({ signal }: S = {}) {
  return request<ArtistsResponse>("/artists", { signal });
}

export type ArtistInput = Partial<{
  name: string;
  bio: string | null;
  country: string | null;
  primary_genre: string | null;
  spotify_link: string | null;
  apple_music_link: string | null;
  youtube_music_link: string | null;
  instagram_link: string | null;
  facebook_link: string | null;
  tiktok_link: string | null;
  boomplay_link: string | null;
  audiomack_link: string | null;
}>;

export async function createArtist(data: ArtistInput & { name: string }): Promise<Artist> {
  const res = await request<{ artist: Artist }>("/artists", { method: "POST", body: data });
  return res.artist;
}

export async function updateArtist(id: number, data: ArtistInput): Promise<Artist> {
  const res = await request<{ artist: Artist }>(`/artists/${id}`, { method: "PATCH", body: data });
  return res.artist;
}

export async function uploadArtistAvatar(id: number, file: File): Promise<Artist> {
  const form = new FormData();
  form.append("avatar", file);
  const res = await request<{ artist: Artist }>(`/artists/${id}/avatar`, { method: "POST", body: form });
  return res.artist;
}
