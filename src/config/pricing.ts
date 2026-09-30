/**
 * 2K TUNES — SINGLE SOURCE OF TRUTH FOR LANDING-PAGE PRICING
 * ==========================================================
 *
 * ⚠️  THE PRICES BELOW ARE PLACEHOLDERS. THEY ARE NOT PRODUCTION PRICING.
 *     Replace `PLACEHOLDER_PLANS` / `PLACEHOLDER_TZS_PER_USD` with the real
 *     values, or point `VITE_API_URL` at the backend so the page reads the
 *     live `plans` table instead (see "Live hydration" below).
 *
 *
 * WHAT THE BACKEND ACTUALLY DEFINES
 * ---------------------------------
 * Verified in 2ktunes_app_backend:
 *
 *   • `plans` table — migrations 2024_09_27_003737, 2026_05_11_225335,
 *     2026_05_12_232651. Columns: name, price, features (json), currency,
 *     exchange_rate, duration, max_artists, description, order, is_active.
 *
 *   • `price` IS STORED IN USD. Filament labels the field "Price (USD)" with a
 *     `$` prefix (app/Filament/Resources/PlanResource.php). USD is therefore the
 *     base currency and TZS is derived — not the other way round.
 *
 *   • `duration` IS A NUMBER OF DAYS, default 30 ("Duration (Days)"). The
 *     backend has NO monthly/annual duality, so this page does not offer an
 *     annual toggle — that would be inventing backend behaviour.
 *
 *   • `max_artists` (default 1) "Controls how many artist names users can
 *     create under this subscription plan." This is what the Single / 2 / 5
 *     Artists tiers are actually made of.
 *
 *   • `GET /api/plans` (routes/api.php → ApiController@getPlans) is public and
 *     unauthenticated. It returns `{ status: true, plans: Plan[] }`.
 *
 * WHY THE VALUES HERE ARE PLACEHOLDERS
 * ------------------------------------
 * The only prices committed anywhere are in database/seeders/PlansTableSeeder
 * ("Basic Plan" 20000.00, "Premium Plan" 80000.00), and they are unusable:
 * both are annotated "Adjust price as necessary", the names do not match the
 * artist-slot model, and the figures are not USD. The `2kTunes` database is not
 * provisioned on this machine, so live rows could not be read either.
 *
 * Everything below therefore mirrors the backend SHAPE exactly, so swapping in
 * real numbers is a one-line change per plan and needs no component edits.
 */

/** Mirrors a row of the backend `plans` table. */
export type Plan = {
  id: number;
  name: string;
  /** USD, matching `plans.price`. */
  price: number;
  /** Billing period in days, matching `plans.duration`. */
  duration: number;
  /** Artist slots, matching `plans.max_artists`. */
  max_artists: number;
  description: string;
  features: string[];
  order: number;
  is_active: boolean;
};

export type Currency = "TZS" | "USD";

/**
 * ⚠️ PLACEHOLDER — replace with real pricing.
 *
 * `features` is presentational copy for the landing page. Each entry describes
 * capability that exists in the application today (artist slots, releases,
 * analytics, royalty tracking, artist management); none of it describes a
 * payment-provider integration, because none exists yet.
 */
export const PLACEHOLDER_PLANS: Plan[] = [
  {
    id: 1,
    name: "Single Artist",
    price: 19,
    duration: 30,
    max_artists: 1,
    description: "For independent artists releasing their own music.",
    features: [
      "1 artist profile",
      "Unlimited releases",
      "Delivery to 150+ stores",
      "Release management",
      "Streams & audience analytics",
      "Royalty tracking and wallet",
    ],
    order: 1,
    is_active: true,
  },
  {
    id: 2,
    name: "2 Artists",
    price: 29,
    duration: 30,
    max_artists: 2,
    description: "For artists building together.",
    features: [
      "Up to 2 artist profiles",
      "Everything in Single Artist",
      "Per-artist release management",
      "Per-artist analytics",
      "Royalty splits",
    ],
    order: 2,
    is_active: true,
  },
  {
    id: 3,
    name: "5 Artists",
    price: 49,
    duration: 30,
    max_artists: 5,
    description: "For managers, collectives and growing labels.",
    features: [
      "Up to 5 artist profiles",
      "Everything in 2 Artists",
      "Roster and artist management",
      "Consolidated catalogue view",
      "Consolidated royalty reporting",
    ],
    order: 3,
    is_active: true,
  },
];

/**
 * ⚠️ PLACEHOLDER RATE.
 *
 * One rate, declared once, used for every conversion on the page, so the TZS
 * and USD figures can never drift apart. When the page hydrates from the API
 * this is replaced by the plan's own `exchange_rate` column.
 */
export const PLACEHOLDER_TZS_PER_USD = 2600;

/** The plan highlighted as most popular — the middle artist-slot tier. */
export const RECOMMENDED_PLAN_ID = 2;

/** TZS is first because Tanzania is the primary market. */
export const DEFAULT_CURRENCY: Currency = "TZS";

/* ── Formatting ─────────────────────────────────────────────────────── */

/**
 * TZS figures are always derived from the USD base, so they are rounded for
 * legibility and always presented with a "≈". USD is the stored value and is
 * shown exactly.
 */
export function formatPrice(
  usd: number,
  currency: Currency,
  tzsPerUsd: number,
): { display: string; approximate: boolean } {
  if (currency === "USD") {
    return {
      display: `$${usd.toLocaleString("en-US")}`,
      approximate: false,
    };
  }

  const tzs = Math.round((usd * tzsPerUsd) / 1000) * 1000;
  return {
    display: `TZS ${tzs.toLocaleString("en-US")}`,
    approximate: true,
  };
}

/** "per 30 days" reads honestly for a day-count subscription. */
export function formatPeriod(days: number): string {
  if (days === 30) return "per 30 days";
  if (days === 365) return "per year";
  return `per ${days} days`;
}

/**
 * Both currencies, split into label and figure, for the side-by-side price
 * block. TZS leads because Tanzania is the primary market; USD stays visible
 * because it is the stored value and the international reference.
 */
export function priceParts(
  usd: number,
  tzsPerUsd: number,
): { tzs: string; usd: string } {
  return {
    tzs: (Math.round((usd * tzsPerUsd) / 1000) * 1000).toLocaleString("en-US"),
    usd: `$${usd.toLocaleString("en-US")}`,
  };
}
