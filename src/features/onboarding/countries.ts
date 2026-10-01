/**
 * Currency choices shared by onboarding and settings. Country names and the
 * ISO list live in src/lib/countries.ts (re-exported here for older imports).
 */

export { countryName } from "@/lib/countries";

export const CURRENCIES = ["USD", "TZS", "KES", "UGX", "NGN"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** "TZS" → "TZS — Tanzanian Shilling" (name in the viewer's language). */
export function currencyLabel(code: string, locale: string): string {
  try {
    const name = new Intl.DisplayNames([locale, "en"], { type: "currency" }).of(code);
    if (name && name !== code) return `${code} — ${name.charAt(0).toLocaleUpperCase(locale)}${name.slice(1)}`;
  } catch {
    /* fall through */
  }
  return code;
}

/** A currency suggestion for a country (used only as a default). */
export function currencyForCountry(code: string | null | undefined): Currency | null {
  switch ((code ?? "").toUpperCase()) {
    case "TZ":
      return "TZS";
    case "KE":
      return "KES";
    case "UG":
      return "UGX";
    case "NG":
      return "NGN";
    default:
      return null;
  }
}
