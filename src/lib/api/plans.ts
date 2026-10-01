import { useCallback, useEffect, useState } from "react";
import { request } from "./client";

/**
 * Public subscription plans.
 *
 *   GET /api/plans  (public)
 *   200 { status, plans: [{ id, name, price, currency, duration, description,
 *                           max_artists, is_active, order, features }] }
 *
 * Nothing here invents a price: if the API is unreachable the UI shows a
 * "pricing is being updated — contact us" state instead of placeholders.
 */

export type Plan = {
  id: number;
  name: string;
  /** Numeric price in `currency`. */
  price: number;
  /** ISO 4217 code, e.g. "TZS" or "USD". */
  currency: string;
  /** Billing period in days. */
  duration: number;
  description: string;
  max_artists: number;
  features: string[];
  order: number;
};

type RawPlan = {
  id?: number | string;
  name?: string;
  price?: number | string;
  currency?: string | null;
  duration?: number | string | null;
  description?: string | null;
  max_artists?: number | string | null;
  is_active?: boolean | number | string | null;
  order?: number | string | null;
  features?: unknown;
};

const num = (v: unknown, fallback: number) => {
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};

function parseFeatures(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string" && x.trim() !== "");
  if (typeof v === "string") {
    try {
      return parseFeatures(JSON.parse(v));
    } catch {
      return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export function normalisePlans(raw: RawPlan[]): Plan[] {
  return raw
    .filter((p) => p.is_active === undefined || p.is_active === null || p.is_active === true || p.is_active === 1 || p.is_active === "1")
    .map((p, i) => ({
      id: num(p.id, i + 1),
      name: (p.name ?? "").trim() || `Plan ${i + 1}`,
      price: num(p.price, 0),
      currency: (p.currency ?? "").trim().toUpperCase() || "USD",
      duration: num(p.duration, 30),
      description: (p.description ?? "").trim(),
      max_artists: Math.max(1, num(p.max_artists, 1)),
      features: parseFeatures(p.features),
      order: num(p.order, i + 1),
    }))
    .sort((a, b) => a.order - b.order);
}

export async function fetchPlans(signal?: AbortSignal): Promise<Plan[]> {
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

export type PlansState =
  | { status: "loading"; plans: Plan[] }
  | { status: "ready"; plans: Plan[] }
  | { status: "unavailable"; plans: Plan[] };

/** Fetch-on-mount with a retry; "unavailable" covers network, 5xx, no API URL and an empty list. */
export function usePlans(): PlansState & { reload: () => void } {
  const [state, setState] = useState<PlansState>({ status: "loading", plans: [] });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ status: "loading", plans: s.plans }));
    fetchPlans(controller.signal)
      .then((plans) =>
        setState(plans.length ? { status: "ready", plans } : { status: "unavailable", plans: [] }),
      )
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ status: "unavailable", plans: [] });
      });
    return () => controller.abort();
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}
