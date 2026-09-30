import { request } from "./client";
import type { AuthUser } from "./auth";

/**
 * THE DASHBOARD ENDPOINTS
 * =======================
 *
 * Every type below mirrors a response read off the running Laravel server, not
 * inferred from convention. Where the API is inconsistent the type says so, and
 * the helpers at the bottom normalise it — the components never guess.
 *
 * WHAT EXISTS (routes/api.php, all behind `auth:sanctum`)
 * ------------------------------------------------------
 *   GET    /api/releases          → { status, releases: Release[] }   (with tracks)
 *   GET    /api/releases/{id}     → { status, release }               404 if not yours
 *   POST   /api/releases/upload   → multipart, ALSO behind `subscribed`
 *   GET    /api/artists           → { status, artists, user: { id, subscription_plan, plan } }
 *   POST   /api/artists           → { status, message, artist }       403 / 422 on limits
 *   GET    /api/royalties         → { status, stats, payout, history }
 *   POST   /api/royalties/withdraw→ { status, message, transaction }  422 under $25
 *   GET    /api/plans             → { status, plans }                 public
 *   GET    /api/services          → { status, services }              public
 *   POST   /api/profile/update    → { status, message, user }
 *   POST   /api/profile/avatar    → multipart, { status, message, user }
 *   POST   /api/subscribe         → { status, message, user }
 *
 * WHAT DOES NOT EXIST, so is not represented here and is not faked anywhere in
 * the dashboard:
 *   • Streaming analytics of any kind — no plays, listeners, platform breakdown
 *     or time series endpoint. (The Flutter app's Stats tab is a placeholder for
 *     the same reason.)
 *   • Any endpoint that writes payout details. `bank_name`,
 *     `bank_account_number`, `mobile_money_number` and `payout_method` are
 *     columns on `users` and are RETURNED by /api/royalties, but they are absent
 *     from `User::$fillable`, so `POST /api/profile/update` silently drops them.
 *     The wallet therefore shows them read-only.
 *   • `GET /api/songs` and `POST /api/songs/upload` — the Flutter client calls
 *     both, but neither is routed. The live equivalents are /api/releases and
 *     /api/releases/upload.
 *   • Editing or deleting a release.
 */

/* ─────────────────────────────── RELEASES ─────────────────────────────── */

export type Track = {
  id: number;
  release_id: number;
  track_number: number;
  title: string;
  version: string | null;
  featured_artists: string[] | null;
  isrc: string | null;
  /** Absolute URL — the backend stores `asset('storage/…')`, not a bare path. */
  audio_file: string | null;
  contains_lyrics: string | null;
  explicit: boolean;
  created_at: string;
};

export type Release = {
  id: number;
  user_id: number;
  release_title: string;
  artist_name: string;
  release_type: string;
  release_date: string | null;
  record_label: string | null;
  language: string | null;
  primary_genre: string | null;
  secondary_genre: string | null;
  /** Absolute URL, as above. */
  cover_image: string | null;
  /** `platforms` is json_encode'd server-side, so it can arrive as a string. */
  platforms: unknown;
  /** The backend only ever writes 'pending' on upload. */
  status: string | null;
  upc: string | null;
  created_at: string;
  updated_at: string;
  tracks?: Track[];
};

export async function fetchReleases(signal?: AbortSignal): Promise<Release[]> {
  const res = await request<{ status: boolean; releases: Release[] }>(
    "/releases",
    { signal },
  );
  return res.releases ?? [];
}

export async function fetchRelease(
  id: number | string,
  signal?: AbortSignal,
): Promise<Release> {
  const res = await request<{ status: boolean; release: Release }>(
    `/releases/${id}`,
    { signal },
  );
  return res.release;
}

/**
 * The multipart release upload.
 *
 * Caller builds the FormData because the field names are positional
 * (`tracks[0][audio_file]`, `tracks[0][songwriters][0][first_name]`) and the
 * validator is strict about them — see UploadPage for the exact contract.
 */
export function uploadRelease(form: FormData) {
  return request<{ status: boolean; message?: string; release?: Release }>(
    "/releases/upload",
    { method: "POST", body: form },
  );
}

/* ──────────────────────────────── ARTISTS ─────────────────────────────── */

export type Artist = {
  id: number;
  user_id: number;
  name: string;
  spotify_link: string | null;
  apple_music_link: string | null;
  youtube_music_link: string | null;
  instagram_link: string | null;
  facebook_link: string | null;
  created_at: string;
};

export type Plan = {
  id: number;
  name: string;
  /** Decimal column: arrives as a string like "9.99". */
  price: string | number;
  currency?: string | null;
  exchange_rate?: string | number | null;
  duration?: number | null;
  description?: string | null;
  max_artists?: number | null;
  is_active?: boolean;
  order?: number | null;
};

export type ArtistsResponse = {
  status: boolean;
  artists: Artist[];
  /** The plan is resolved by NAME (`plans.name` = `users.subscription_plan`). */
  user: { id: number; subscription_plan: string | null; plan: Plan | null };
};

export function fetchArtists(signal?: AbortSignal) {
  return request<ArtistsResponse>("/artists", { signal });
}

export function createArtist(name: string) {
  return request<{ status: boolean; message: string; artist: Artist }>(
    "/artists",
    { method: "POST", body: { name } },
  );
}

/* ─────────────────────────────── ROYALTIES ────────────────────────────── */

export type RoyaltyTransaction = {
  id: number;
  user_id: number;
  /** 'earnings' | 'withdrawal' | 'adjustment' — free-text server-side. */
  type: string;
  /** Withdrawals are stored NEGATIVE. */
  amount: number;
  method: string | null;
  currency: string | null;
  description: string | null;
  created_at: string;
};

/**
 * `stats` mixes types: `total_earnings` is a SUM over a decimal column and
 * arrives as a string ("10.00"), while the others come back as numbers. Hence
 * `string | number` plus `num()` below.
 */
export type RoyaltyResponse = {
  status: boolean;
  stats: {
    total_earnings: string | number;
    withdrawals: string | number;
    adjustments: string | number;
    balance: string | number;
  };
  payout: {
    bank_name: string | null;
    bank_account_number: string | null;
    mobile_money_number: string | null;
    payout_method: string | null;
  };
  history: RoyaltyTransaction[];
};

export function fetchRoyalties(signal?: AbortSignal) {
  return request<RoyaltyResponse>("/royalties", { signal });
}

/** The backend enforces a $25 minimum and rejects amounts above the balance. */
export const MIN_WITHDRAWAL_USD = 25;

export function requestWithdrawal(amount: number, method: string) {
  return request<{
    status: boolean;
    message: string;
    transaction: RoyaltyTransaction;
  }>("/royalties/withdraw", { method: "POST", body: { amount, method } });
}

/* ──────────────────────────── PLANS & SERVICES ────────────────────────── */

export async function fetchPlans(signal?: AbortSignal): Promise<Plan[]> {
  const res = await request<{ status: boolean; plans: Plan[] }>("/plans", {
    signal,
    auth: false,
  });
  return res.plans ?? [];
}

/** A distribution platform row. The `services` table ships empty. */
export type Service = {
  id: number;
  name: string;
  logo?: string | null;
  order?: number | null;
};

export async function fetchServices(signal?: AbortSignal): Promise<Service[]> {
  const res = await request<{ status: boolean; services: Service[] }>(
    "/services",
    { signal, auth: false },
  );
  return res.services ?? [];
}

/* ──────────────────────────────── PROFILE ─────────────────────────────── */

/**
 * `POST /api/profile/update` requires `email` even for a partial edit, and its
 * password branch reads `current_password` / `new_password` /
 * `new_password_confirmation`. Anything outside the validator is passed to
 * `$user->update(...)` and filtered by `$fillable`.
 */
export type ProfileUpdatePayload = {
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  address_line_1?: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
};

export async function updateProfile(
  payload: ProfileUpdatePayload,
): Promise<AuthUser> {
  const res = await request<{
    status: boolean;
    message: string;
    user: AuthUser;
  }>("/profile/update", { method: "POST", body: payload });
  return res.user;
}

export async function updateAvatar(file: File): Promise<AuthUser> {
  const form = new FormData();
  form.append("avatar", file);
  const res = await request<{
    status: boolean;
    message: string;
    user: AuthUser;
  }>("/profile/avatar", { method: "POST", body: form });
  return res.user;
}

/* ───────────────────────────── NORMALISATION ──────────────────────────── */

/** The API returns decimals as strings in places. One coercion, used everywhere. */
export function num(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function usd(value: unknown): string {
  return num(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

/** `platforms` may be an array, a JSON string, or null. */
export function platformList(value: unknown): string[] {
  const raw =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        })()
      : value;

  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) =>
      typeof entry === "string"
        ? entry
        : typeof entry === "object" && entry !== null
          ? String((entry as { name?: unknown }).name ?? "")
          : "",
    )
    .filter(Boolean);
}
