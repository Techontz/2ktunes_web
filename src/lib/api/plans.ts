import { useCallback, useEffect, useState } from "react";
import { request } from "./client";

/**
 * Public subscription plans.
 *
 *   GET /api/plans  (public)
 *   200 { status, plans: [{ id, name, price, currency, price_usd, prices[],
 *                           duration, description, max_artists, is_active,
 *                           order, features[] }] }
 *
 * Plans and their TZS / USD prices are set by the admin. So that pricing is
 * always on show, the last live list is cached in the browser, and if the API
 * can't be reached on a first visit we fall back to the launch plans
 * (DEFAULT_PLANS, mirroring the backend PlansTableSeeder).
 */

/** One currency a plan can be paid in. */
export type PlanPrice = { currency: string; amount: number };

export type Plan = {
  id: number;
  name: string;
  /** Numeric main price in `currency`. */
  price: number;
  /** ISO 4217 code of the main price, e.g. "TZS". */
  currency: string;
  /** Every currency the plan can be paid in, main price first. */
  prices: PlanPrice[];
  /** Billing period in days. */
  duration: number;
  description: string;
  max_artists: number;
  features: string[];
  order: number;
};

/** A row as GET /plans sends it (`price` is a decimal string, `features` a JSON array). */
type RawPlan = {
  id: number;
  name: string;
  price: number | string;
  currency: string | null;
  price_usd?: number | string | null;
  prices?: { currency: string; amount: number | string }[] | null;
  duration: number | null;
  description: string | null;
  max_artists: number | null;
  is_active?: boolean;
  order: number | null;
  features?: string[] | null;
};

const num = (v: unknown, fallback: number) => {
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};

function pricesOf(p: RawPlan): PlanPrice[] {
  const main = (p.currency ?? "").trim().toUpperCase() || "TZS";
  const list = p.prices?.length
    ? p.prices.map((x) => ({ currency: x.currency.trim().toUpperCase(), amount: num(x.amount, Number.NaN) }))
    : [
        { currency: main, amount: num(p.price, 0) },
        ...(main !== "USD" && p.price_usd != null ? [{ currency: "USD", amount: num(p.price_usd, Number.NaN) }] : []),
      ];
  return list.filter((x) => x.currency && Number.isFinite(x.amount));
}

/** The plan's price in `currency`, or null when it isn't sold in it. */
export function priceIn(plan: Pick<Plan, "prices">, currency: string): PlanPrice | null {
  return plan.prices.find((p) => p.currency === currency) ?? null;
}

/** Currencies offered by any plan, TZS first. */
export function currenciesOf(plans: Pick<Plan, "prices">[]): string[] {
  const set = new Set(plans.flatMap((p) => p.prices.map((x) => x.currency)));
  return [...set].sort((a, b) => (a === "TZS" ? -1 : b === "TZS" ? 1 : a.localeCompare(b)));
}

/** Launch plans (backend PlansTableSeeder). Only shown when no live list has ever loaded. */
export const DEFAULT_PLANS: Plan[] = normalisePlans([
  {
    id: 1, name: "Single Artist", price: 39000, currency: "TZS", duration: 365, max_artists: 1, order: 1,
    description: "For independent artists releasing their own music.",
    features: ["Unlimited releases for a year", "Delivery to all major stores and platforms", "Keep 100% of your rights", "Royalty wallet with mobile money and bank withdrawals", "Streams and audience analytics"],
  },
  {
    id: 2, name: "2 Artists", price: 59000, currency: "TZS", duration: 365, max_artists: 2, order: 2,
    description: "For duos and artists who manage a second act.",
    features: ["Everything in Single Artist", "Unlimited releases for both artists", "Separate analytics per artist", "Royalty splits between collaborators"],
  },
]);

const CACHE_KEY = "2kt.plans.v1";

function readCache(): Plan[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const plans = raw ? (JSON.parse(raw) as Plan[]) : null;
    return Array.isArray(plans) && plans.length && plans.every((p) => Array.isArray(p.prices)) ? plans : null;
  } catch {
    return null;
  }
}

function writeCache(plans: Plan[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(plans));
  } catch {
    /* private mode / storage full: the live list still renders */
  }
}

export function normalisePlans(raw: RawPlan[]): Plan[] {
  return raw
    .filter((p) => p.is_active !== false)
    .map((p, i) => ({
      id: p.id,
      name: p.name.trim(),
      price: num(p.price, 0),
      currency: (p.currency ?? "").trim().toUpperCase() || "TZS",
      prices: pricesOf(p),
      duration: num(p.duration, 365),
      description: (p.description ?? "").trim(),
      max_artists: Math.max(1, num(p.max_artists, 1)),
      features: (p.features ?? []).filter((x) => typeof x === "string" && x.trim() !== ""),
      order: num(p.order, i + 1),
    }))
    .sort((a, b) => a.order - b.order);
}

async function fetchPlans(signal?: AbortSignal): Promise<Plan[]> {
  const res = await request<{ status?: boolean; plans?: RawPlan[] }>("/plans", {
    auth: false,
    signal,
  });
  return normalisePlans(res?.plans ?? []);
}

/** Formats a price with Intl; TZS (and other zero-minor-unit use) drops decimals. */
export function formatMoney(amount: number, currency: string, locale = "en-TZ"): string {
  const whole = Number.isInteger(amount) || currency === "TZS" || currency === "UGX" || currency === "KES";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "code",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    })
      .format(amount)
      .replace(/ /g, " ");
  } catch {
    return `${currency} ${amount.toLocaleString(locale)}`;
  }
}

type PlansState =
  | { status: "loading"; plans: Plan[] }
  /** `live`: from the API now; `cached`: last live list; `default`: launch plans. */
  | { status: "ready"; plans: Plan[]; source: "live" | "cached" | "default" }
  /** The API answered with no active plans: the admin has none on sale. */
  | { status: "empty"; plans: Plan[] };

/** Fetch-on-mount. Plans stay visible when the API is down (cached, else DEFAULT_PLANS). */
export function usePlans(): PlansState & { reload: () => void } {
  const [state, setState] = useState<PlansState>(() => {
    const cached = readCache();
    return cached ? { status: "ready", plans: cached, source: "cached" } : { status: "loading", plans: [] };
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchPlans(controller.signal)
      .then((plans) => {
        if (plans.length) writeCache(plans);
        setState(plans.length ? { status: "ready", plans, source: "live" } : { status: "empty", plans: [] });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const cached = readCache();
        setState(
          cached
            ? { status: "ready", plans: cached, source: "cached" }
            : { status: "ready", plans: DEFAULT_PLANS, source: "default" },
        );
      });
    return () => controller.abort();
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}
