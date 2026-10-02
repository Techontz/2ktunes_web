import { request } from "./client";

/**
 * Growth endpoints: offers and promo codes, referrals, the public creator
 * showcase and creator slider, and creator earnings.
 * DOCS/API.md: "Offers and pricing", "Referrals", "Creators & marketplace";
 * verified in OfferController, ReferralController, PublicController and
 * CreatorController@earnings.
 */

type S = { signal?: AbortSignal };

/* ── Offers ────────────────────────────────────────────────────────── */

export type ActiveOffer = {
  id: number;
  headline: string;
  description: string | null;
  type: "percent_off" | "fixed_off" | "fixed_price" | "free" | string;
  percent_bp: number | null;
  amount_minor: number | null;
  currency: string | null;
  free_days: number | null;
  audience: "first_subscription" | "everyone" | "referred" | string;
  requires_code: boolean;
  /** null means every plan. */
  plan_ids: number[] | null;
  starts_at: string | null;
  ends_at: string | null;
};

/** GET /offers/active (no auth): offers flagged for the pricing banner. */
export async function fetchActiveOffers({ signal }: S = {}): Promise<ActiveOffer[]> {
  const res = await request<{ offers?: ActiveOffer[] }>("/offers/active", { signal, auth: false });
  return res.offers ?? [];
}

export type OfferQuote = {
  list_minor: number;
  final_minor: number;
  discount_minor: number;
  currency: string;
  list: string;
  final: string;
  offer: { id: number; headline: string; type: string; ends_at: string | null } | null;
  referral_applied: boolean;
  free_days: number | null;
};

/** POST /offers/validate: the exact price for me, with an optional promo code. */
export async function validateOffer(input: { plan_id: number; currency?: string; code?: string }): Promise<OfferQuote> {
  const body: Record<string, unknown> = { plan_id: input.plan_id };
  if (input.currency) body.currency = input.currency;
  if (input.code?.trim()) body.code = input.code.trim();
  const res = await request<{ quote: OfferQuote }>("/offers/validate", { method: "POST", body });
  return res.quote;
}

/* ── Referrals ─────────────────────────────────────────────────────── */

export type FriendGets = {
  mode: "percent" | "price" | string;
  discount_bp: number | null;
  plans: {
    plan_id: number;
    plan_name: string;
    duration_days: number;
    list_minor: number;
    price_minor: number;
    currency: string;
  }[];
  /** English only; the UI builds its own sentence from the fields above. */
  text: string | null;
};

export type ReferralLookup =
  | {
      valid: true;
      code: string;
      referrer_name: string;
      friend_gets: FriendGets;
      message?: string;
    }
  | { valid: false; code: string | null };

/** GET /public/referral/{code} (no auth, case-insensitive). */
export async function fetchReferralLookup(code: string, { signal }: S = {}): Promise<ReferralLookup> {
  const res = await request<{ referral: ReferralLookup }>(`/public/referral/${encodeURIComponent(code)}`, {
    signal,
    auth: false,
  });
  return res.referral ?? { valid: false, code };
}

export type ReferralStatus = "joined" | "qualified" | "rewarded" | "rejected" | string;

export type ReferralSummary = {
  code: string;
  link: string;
  program: {
    enabled: boolean;
    friend_gets: FriendGets;
    you_get: {
      type: string;
      amount_minor: number;
      currency: string | null;
      free_days: number;
      text: string | null;
    };
    reward_trigger: "on_first_paid_subscription" | "on_signup_verified" | string;
    hold_days: number;
    max_rewards_per_month: number | null;
  };
  stats: {
    joined: number;
    qualified: number;
    rewarded: number;
    pending_rewards: number;
    rejected: number;
    earned: { currency: string; amount_minor: number }[];
    free_days_earned: number;
  };
  referrals: {
    id: number;
    initials: string;
    status: ReferralStatus;
    reward_pending: boolean;
    reward_skipped: boolean;
    joined_at: string;
    qualified_at: string | null;
    reward_due_at: string | null;
    rewarded_at: string | null;
  }[];
};

/** GET /referrals: my code, link, program, stats and referrals (initials only). */
export async function fetchReferrals({ signal }: S = {}): Promise<ReferralSummary> {
  const res = await request<{ referral: ReferralSummary }>("/referrals", { signal });
  return res.referral;
}

/** `referral` on POST /register and POST /google-login when a code was sent. */
export type ReferralResult = {
  applied: boolean;
  reason:
    | null
    | "invalid_code"
    | "program_disabled"
    | "self_referral"
    | "not_a_new_account"
    | "already_referred"
    | "unavailable"
    | string;
};

/* ── Public creators (home slider) and showcase (reels) ────────────── */

export type PublicCreator = {
  slug: string;
  display_name: string;
  avatar_url: string | null;
  categories: string[];
  country: string | null;
  verified: boolean;
  packages_count: number;
  from_price_minor: number | null;
  from_price_currency: string | null;
};

/** GET /public/creators (no auth): approved creators with a photo, newest first. */
export async function fetchPublicCreators({ signal }: S = {}): Promise<PublicCreator[]> {
  const res = await request<{ creators?: PublicCreator[] }>("/public/creators", { signal, auth: false });
  return res.creators ?? [];
}

export type ShowcaseItem = {
  id: number;
  caption: string | null;
  platform: string;
  media_type: "upload" | "external" | string;
  /** Uploaded files only. */
  video_src: string | null;
  /** TikTok, Instagram or YouTube link (never opened directly from the rail). */
  external_url: string | null;
  thumbnail_url: string | null;
  /** Self-reported by the creator. */
  views_count: number | null;
  views_source: "self_reported" | string;
  creator: {
    slug: string;
    display_name: string;
    avatar_url: string | null;
    categories: string[];
    verified: boolean;
    from_price_minor: number | null;
    from_price_currency: string | null;
  };
};

/** GET /public/showcase (no auth): featured reels, ordered by staff (max 24). */
export async function fetchShowcase({ signal }: S = {}): Promise<ShowcaseItem[]> {
  const res = await request<{ items?: ShowcaseItem[] }>("/public/showcase", { signal, auth: false });
  return res.items ?? [];
}

/* ── Creator earnings ──────────────────────────────────────────────── */

export type CreatorEarnings = {
  earnings: {
    currency: string;
    pending_minor: number;
    pending_orders: number;
    pending_withdrawable: boolean;
    available_minor: number;
    lifetime_earned_minor: number;
  }[];
  platform_fee_bp: number;
  note?: string;
};

/** GET /creator/earnings: pending (held, not withdrawable) vs available. */
export function fetchCreatorEarnings({ signal }: S = {}): Promise<CreatorEarnings> {
  return request<CreatorEarnings & { status?: boolean }>("/creator/earnings", { signal });
}

/* ── Referral code carried through sign-up ─────────────────────────── */

const REF_KEY = "2kt.ref";

/** Remember an invite code for this browser session (survives a tab switch to Google). */
export function rememberReferralCode(code: string | null): void {
  try {
    if (code) sessionStorage.setItem(REF_KEY, code.trim().toUpperCase());
    else sessionStorage.removeItem(REF_KEY);
  } catch {
    /* storage blocked: the code still travels in the URL */
  }
}

export function rememberedReferralCode(): string | null {
  try {
    return sessionStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}

/** Referral codes are 8 letters/digits; be lenient (up to 32, the API limit). */
export function cleanReferralCode(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim().toUpperCase();
  return /^[A-Z0-9]{3,32}$/.test(v) ? v : null;
}
