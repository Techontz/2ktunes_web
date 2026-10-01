/**
 * Country + currency choices shared by onboarding, settings and artist forms.
 *
 * Values are ISO 3166-1 alpha-2 codes (ArtistController validates
 * `country: size:2`; the profile accepts any short string, so we send the
 * same code there). Names come from Intl.DisplayNames in the viewer's
 * language, so no hand-maintained translation table is needed.
 */

/** Primary African markets, listed first in every picker. */
export const AFRICAN_COUNTRIES = [
  "TZ", "KE", "UG", "RW", "BI", "CD", "NG", "GH", "ZA", "ZM", "MW", "MZ", "ZW", "ET", "SO",
  "SS", "SD", "EG", "MA", "DZ", "TN", "SN", "CI", "CM", "BJ", "TG", "BF", "ML", "NE", "GN",
  "SL", "LR", "GM", "AO", "NA", "BW", "LS", "SZ", "MG", "MU", "SC", "KM", "DJ", "ER", "GA",
  "CG", "CF", "TD", "GQ", "CV", "ST", "GW", "MR", "LY",
] as const;

/** Everywhere else a 2kTunes user commonly lives. */
export const OTHER_COUNTRIES = [
  "US", "GB", "CA", "FR", "DE", "NL", "BE", "SE", "NO", "DK", "IT", "ES", "PT", "IE", "CH",
  "AE", "SA", "QA", "OM", "IN", "CN", "JP", "AU", "BR", "JM",
] as const;

export const CURRENCIES = ["USD", "TZS", "KES", "UGX", "NGN"] as const;
export type Currency = (typeof CURRENCIES)[number];

export function countryName(code: string | null | undefined, locale: string): string {
  if (!code) return "—";
  if (!/^[A-Za-z]{2}$/.test(code)) return code;
  try {
    const names = new Intl.DisplayNames([locale, "en"], { type: "region" });
    return names.of(code.toUpperCase()) ?? code;
  } catch {
    return code.toUpperCase();
  }
}

function sorted(codes: readonly string[], locale: string) {
  return codes
    .map((code) => ({ code, name: countryName(code, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

/**
 * Two option groups (Africa first). A saved value that isn't in either list
 * (e.g. an older free-text country) is returned as `extra` so the select can
 * still show it instead of silently blanking it.
 */
export function countryGroups(locale: string, current?: string | null) {
  const africa = sorted(AFRICAN_COUNTRIES, locale);
  const others = sorted(OTHER_COUNTRIES, locale);
  const known = new Set<string>([...AFRICAN_COUNTRIES, ...OTHER_COUNTRIES]);
  const extra = current && !known.has(current.toUpperCase()) ? current : null;
  return { africa, others, extra };
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
