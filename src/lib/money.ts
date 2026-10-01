/**
 * MONEY — formatting and input parsing, never arithmetic on floats.
 *
 * The API sends money as integer minor units (`amount_minor: 2500000` +
 * `currency: "TZS"` = TZS 25,000.00) and, in a few legacy places, as decimal
 * strings ("9.99"). It accepts amounts as decimal STRINGS. So the UI only
 * ever needs to:
 *
 *   formatMinor(2500000, "TZS", locale)   → "TZS 25,000.00"
 *   formatDecimal("9.99", "USD", locale)  → "USD 9.99"
 *   parseAmount("25,000.5", "TZS")        → { minor: 2500050n, decimal: "25000.50" }
 *
 * Everything runs on BigInt / strings. `Intl.NumberFormat` is only asked to
 * lay out the (integer) whole part and the currency code for the locale; the
 * fraction digits are spliced in from the exact integer, so no value ever
 * passes through a binary float.
 *
 * Exponents mirror app/Domain/Money/Money.php on the backend.
 */

export const CURRENCY_EXPONENTS: Record<string, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  TZS: 2,
  KES: 2,
  UGX: 0,
  RWF: 0,
  NGN: 2,
  GHS: 2,
  ZAR: 2,
  XOF: 0,
  XAF: 0,
  ZMW: 2,
  MWK: 2,
};

export function currencyExponent(currency: string | null | undefined): number {
  return CURRENCY_EXPONENTS[(currency ?? "").toUpperCase()] ?? 2;
}

export type MinorInput = number | string | bigint | null | undefined;

/** Coerces an API minor-unit value to BigInt. Non-integers become 0n. */
export function toMinor(value: MinorInput): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    return Number.isSafeInteger(value) ? BigInt(value) : 0n;
  }
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) return BigInt(value.trim());
  return 0n;
}

const SPACES = /[  ]/g;

function layout(
  whole: bigint,
  fraction: string,
  currency: string,
  locale: string,
  exp: number,
): string {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "code",
      minimumFractionDigits: exp,
      maximumFractionDigits: exp,
    }).formatToParts(whole);
    return parts
      .map((p) => (p.type === "fraction" ? fraction : p.value))
      .join("")
      .replace(SPACES, " ");
  } catch {
    // Unknown currency code: keep the digits honest, drop the locale styling.
    const grouped = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${currency} ${grouped}${exp > 0 ? `.${fraction}` : ""}`;
  }
}

export type FormatMoneyOptions = {
  /** "always" prefixes + on positives (ledger rows); default "auto". */
  signDisplay?: "auto" | "always";
};

/** Formats integer minor units in `currency` for `locale`. Exact. */
export function formatMinor(
  minor: MinorInput,
  currency: string | null | undefined,
  locale = "en-TZ",
  { signDisplay = "auto" }: FormatMoneyOptions = {},
): string {
  const code = (currency ?? "").toUpperCase() || "USD";
  const exp = currencyExponent(code);
  let v = toMinor(minor);
  const negative = v < 0n;
  if (negative) v = -v;
  const base = 10n ** BigInt(exp);
  const whole = v / base;
  const fraction = exp > 0 ? (v % base).toString().padStart(exp, "0") : "";
  const body = layout(whole, fraction, code, locale, exp);
  if (negative) return `-${body}`;
  if (signDisplay === "always" && v > 0n) return `+${body}`;
  return body;
}

/** Minor units → canonical decimal string for the API ("2500050" TZS → "25000.50"). */
export function minorToDecimal(minor: MinorInput, currency: string | null | undefined): string {
  const exp = currencyExponent(currency);
  let v = toMinor(minor);
  const negative = v < 0n;
  if (negative) v = -v;
  const base = 10n ** BigInt(exp);
  const whole = (v / base).toString();
  const out = exp > 0 ? `${whole}.${(v % base).toString().padStart(exp, "0")}` : whole;
  return negative ? `-${out}` : out;
}

export type ParsedAmount = { minor: bigint; decimal: string };

/**
 * Parses what a person typed ("25,000", "25000.5", " 1 000 ") into exact
 * minor units and the canonical decimal string the API expects. Returns null
 * for anything that is not a plain non-negative amount, or that has more
 * decimal places than the currency allows (we never silently round money).
 */
export function parseAmount(input: string, currency: string | null | undefined): ParsedAmount | null {
  const exp = currencyExponent(currency);
  const cleaned = input.trim().replace(/[\s,_  ]/g, "");
  if (!cleaned) return null;
  const m = /^(\d+)(?:\.(\d*))?$/.exec(cleaned);
  if (!m) return null;
  const frac = m[2] ?? "";
  if (frac.length > exp) return null;
  const minor = BigInt(m[1]) * 10n ** BigInt(exp) + BigInt((frac.padEnd(exp, "0") || "0"));
  return { minor, decimal: minorToDecimal(minor, currency) };
}

/** Formats a decimal string amount (e.g. a plan price "9.99") exactly. */
export function formatDecimal(
  value: string | number | null | undefined,
  currency: string | null | undefined,
  locale = "en-TZ",
): string {
  const code = (currency ?? "").toUpperCase() || "USD";
  const exp = currencyExponent(code);
  const str = typeof value === "number" ? String(value) : (value ?? "0");
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(str.trim());
  if (!m) return formatMinor(0, code, locale);
  // Truncate beyond the currency's precision (the API never sends more).
  const frac = (m[3] ?? "").slice(0, exp).padEnd(exp, "0");
  const minor = BigInt(m[2]) * 10n ** BigInt(exp) + BigInt(frac || "0");
  return formatMinor(m[1] === "-" ? -minor : minor, code, locale);
}

/** True when a decimal-string price is zero ("0", "0.00"). */
export function isZeroDecimal(value: string | number | null | undefined): boolean {
  const str = typeof value === "number" ? String(value) : (value ?? "0");
  return /^-?0*(\.0*)?$/.test(str.trim()) || str.trim() === "";
}

/* ── Basis points (splits, fees) ─────────────────────────────────────── */

/** 1250 → "12.5%", 10000 → "100%", 3333 → "33.33%". Integer maths only. */
export function formatBp(bp: number | null | undefined, locale = "en-TZ"): string {
  const v = Math.trunc(bp ?? 0);
  const negative = v < 0;
  const abs = Math.abs(v);
  const whole = Math.trunc(abs / 100);
  const frac = String(abs % 100).padStart(2, "0").replace(/0+$/, "");
  const sep = decimalSeparator(locale);
  return `${negative ? "-" : ""}${whole}${frac ? sep + frac : ""}%`;
}

/** "33.33" → 3333; "12,5" → 1250. Null when invalid or > 2 decimals. */
export function percentToBp(input: string): number | null {
  const cleaned = input.trim().replace(",", ".").replace(/%$/, "").trim();
  const m = /^(\d{1,3})(?:\.(\d{0,2}))?$/.exec(cleaned);
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0") || "0");
}

/** "12.5" style value for editing a bp number in an input. */
export function bpToPercentInput(bp: number): string {
  const whole = Math.trunc(bp / 100);
  const frac = String(bp % 100).padStart(2, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : String(whole);
}

function decimalSeparator(locale: string): string {
  try {
    return new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === "decimal")?.value ?? ".";
  } catch {
    return ".";
  }
}

/* ── Plain counts (streams, views) — not money ───────────────────────── */

export function formatCount(n: number | string | null | undefined, locale = "en-TZ"): string {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  if (!Number.isFinite(v)) return "0";
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(v);
  } catch {
    return String(Math.round(v));
  }
}
