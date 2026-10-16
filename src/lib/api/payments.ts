import { request } from "./client";
import type { AuthUser } from "./auth";

/**
 * Automatic plan payments (DOCS/API.md → "Subscription payments").
 *
 *   GET  /payments/methods?currency=TZS|USD   which ways to pay are on offer
 *   GET  /subscription/payments/{id}          poll a payment (owner only)
 *   POST /subscription/payments/{id}/cancel   stop waiting for a push
 *   POST /subscription/payments/{id}/paypal-capture   after the PayPal return
 *
 * The pay dialog offers exactly three methods: mobile money, card and
 * PayPal. Manual payments (bank, Lipa number) are recorded by Finance only.
 *
 * GET /subscription also carries the method rows per currency in
 * `payment_instructions.payment_methods`, so the pay dialog needs no extra
 * request.
 */

export type PayMethodKey = "mobile_money" | "card" | "paypal" | "manual";

export type PayMethodInfo = {
  key: PayMethodKey;
  label: string;
  available: boolean;
  /** False until the provider's credentials are set ("Coming soon"). Older APIs omit it. */
  configured?: boolean;
  /** English reason from the API; the UI shows its own translation by `reason_code`. */
  reason: string | null;
  reason_code: "coming_soon" | "not_configured" | "currency_not_supported" | null;
  currencies: string[];
  description?: string;
  brands?: string[];
  networks?: { key: string; label: string; prefixes: string[] }[];
  approval_timeout_seconds?: number;
};

export type PlanPaymentStatus = "awaiting_approval" | "processing" | "confirmed" | "failed" | "expired" | "cancelled";

export type PlanPayment = {
  id: number;
  status: PlanPaymentStatus;
  method: string;
  provider: string | null;
  amount: string;
  amount_minor: number;
  currency: string;
  plan: { id: number; name: string } | null;
  plan_id: number;
  failure_reason: string | null;
  expires_at: string | null;
  payer_phone_masked: string | null;
  network: string | null;
  confirmed_at: string | null;
  created_at: string;
};

export type PaymentStatusResponse = {
  payment: PlanPayment;
  subscription?: { status: string; expires_at: string | null };
  user?: AuthUser;
};

export async function fetchPaymentMethods(currency: string, { signal }: { signal?: AbortSignal } = {}): Promise<PayMethodInfo[]> {
  const res = await request<{ methods: PayMethodInfo[] }>("/payments/methods", { signal, query: { currency } });
  return res.methods ?? [];
}

export function fetchPlanPayment(id: number | string, { signal }: { signal?: AbortSignal } = {}) {
  return request<PaymentStatusResponse>(`/subscription/payments/${id}`, { signal });
}

export function cancelPlanPayment(id: number | string) {
  return request<{ payment: PlanPayment }>(`/subscription/payments/${id}/cancel`, { method: "POST" });
}

export function capturePayPalPayment(id: number | string) {
  return request<PaymentStatusResponse>(`/subscription/payments/${id}/paypal-capture`, { method: "POST" });
}

/** Older APIs send no method rows: the three methods then read "Coming soon". */
export const COMING_SOON_METHODS: PayMethodInfo[] = [
  { key: "mobile_money", label: "Mobile money", available: false, configured: false, reason: "Coming soon", reason_code: "coming_soon", currencies: ["TZS"] },
  { key: "card", label: "Card", available: false, configured: false, reason: "Coming soon", reason_code: "coming_soon", currencies: ["TZS", "USD"] },
  { key: "paypal", label: "PayPal", available: false, configured: false, reason: "Coming soon", reason_code: "coming_soon", currencies: ["USD"] },
];

/* ── Tanzanian mobile numbers ───────────────────────────────────────── */

/** Mirrors the API (config/payouts.php + config/payments.php). The API's list wins when present. */
export const TZ_NETWORKS: { key: string; label: string; prefixes: string[] }[] = [
  { key: "mpesa", label: "M-Pesa", prefixes: ["25574", "25575", "25576"] },
  { key: "airtel", label: "Airtel Money", prefixes: ["25568", "25569", "25578"] },
  { key: "mixx", label: "Mixx by Yas", prefixes: ["25565", "25567", "25571", "25577"] },
  { key: "halopesa", label: "Halopesa", prefixes: ["25561", "25562"] },
];

/** "0754 123 456", "+255754123456", "754123456" → "255754123456", or null when not a TZ mobile number. */
export function normaliseTzPhone(input: string): string | null {
  let d = input.replace(/\D+/g, "");
  if (d.startsWith("00255")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("0")) d = `255${d.slice(1)}`;
  else if (d.length === 9 && /^[67]/.test(d)) d = `255${d}`;
  return /^255[67]\d{8}$/.test(d) ? d : null;
}

/** The network for a (possibly partial) number, as soon as the prefix is known. */
export function detectTzNetwork(input: string, networks = TZ_NETWORKS): { key: string; label: string } | null {
  let d = input.replace(/\D+/g, "");
  if (d.startsWith("00255")) d = d.slice(2);
  if (d.startsWith("255")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  if (d.length < 2) return null;
  const prefix = `255${d.slice(0, 2)}`;
  return networks.find((n) => n.prefixes.includes(prefix)) ?? null;
}

/** "255754123456" → "+255 754 123 456" (non-breaking spaces: the number never wraps). */
export function formatTzPhone(msisdn: string): string {
  const m = /^255(\d{3})(\d{3})(\d{3})$/.exec(msisdn);
  return (m ? `+255 ${m[1]} ${m[2]} ${m[3]}` : `+${msisdn}`).replace(/ /g, "\u00a0");
}

/**
 * The browser's guess when the API does not say: TZS for Tanzania (profile
 * country) or a Swahili browser, USD otherwise.
 */
export function guessCurrency(country?: string | null): "TZS" | "USD" {
  if (country && /^[A-Za-z]{2}$/.test(country)) return country.toUpperCase() === "TZ" ? "TZS" : "USD";
  const langs = typeof navigator !== "undefined" ? [navigator.language, ...(navigator.languages ?? [])] : [];
  return langs.some((l) => typeof l === "string" && l.toLowerCase().startsWith("sw")) ? "TZS" : "USD";
}

/** Leaving for Stripe Checkout or PayPal. An object so tests can spy on it. */
export const checkoutRedirect = {
  go(url: string) {
    window.location.assign(url);
  },
};
