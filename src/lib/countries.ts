/**
 * COUNTRIES — the full ISO 3166-1 alpha-2 list, bundled (no network).
 *
 * Names come from `Intl.DisplayNames` in the viewer's language, so French
 * users see "Côte d’Ivoire", Swahili users "Kenya", etc., with no translation
 * table to maintain. The API always receives the upper-case ISO-2 code.
 */

/** Every officially assigned ISO 3166-1 alpha-2 code (249). */
export const ISO_COUNTRIES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
  "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
  "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

export type CountryCode = (typeof ISO_COUNTRIES)[number];

const ISO_SET: ReadonlySet<string> = new Set(ISO_COUNTRIES);

/** Markets 2kTunes serves most; shown first when the list is unfiltered. */
export const PRIORITY_COUNTRIES = ["TZ", "KE", "UG", "RW", "BI", "CD", "NG", "GH", "CI", "SN", "CM", "ZA"] as const;

export function isCountryCode(code: string | null | undefined): code is CountryCode {
  return !!code && ISO_SET.has(code.toUpperCase());
}

/** "TZ" → 🇹🇿 (regional indicator symbols). */
export function flagEmoji(code: string | null | undefined): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "";
  const base = 0x1f1e6;
  const up = code.toUpperCase();
  return String.fromCodePoint(base + up.charCodeAt(0) - 65, base + up.charCodeAt(1) - 65);
}

const namesCache = new Map<string, Intl.DisplayNames | null>();

function displayNames(locale: string): Intl.DisplayNames | null {
  if (!namesCache.has(locale)) {
    try {
      namesCache.set(locale, new Intl.DisplayNames([locale, "en"], { type: "region" }));
    } catch {
      namesCache.set(locale, null);
    }
  }
  return namesCache.get(locale) ?? null;
}

/** Localised country name; unknown/free-text values are returned unchanged. */
export function countryName(code: string | null | undefined, locale: string): string {
  if (!code) return "—";
  if (!/^[A-Za-z]{2}$/.test(code)) return code;
  try {
    return displayNames(locale)?.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export type CountryOption = { code: string; name: string; flag: string };

/** Pre-computed, accent-free search keys (local name, English name, code) per option. */
const searchKeys = new WeakMap<CountryOption, { name: string; english: string; code: string }>();
const optionsCache = new Map<string, CountryOption[]>();

/** All countries, sorted by localised name. Cached per locale; search keys are computed once. */
export function countryOptions(locale: string): CountryOption[] {
  const hit = optionsCache.get(locale);
  if (hit) return hit;
  const options = ISO_COUNTRIES.map((code) => ({ code, name: countryName(code, locale), flag: flagEmoji(code) })).sort(
    (a, b) => a.name.localeCompare(b.name, locale),
  );
  for (const o of options) {
    const name = searchKey(o.name);
    searchKeys.set(o, { name, english: locale.startsWith("en") ? name : searchKey(countryName(o.code, "en")), code: o.code.toLowerCase() });
  }
  optionsCache.set(locale, options);
  return options;
}

/** Case- and accent-insensitive comparison key ("Côte d’Ivoire" → "cote d'ivoire"). */
export function searchKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .trim();
}

/**
 * Filters options by a typed query. Names that start with the query rank
 * before names that merely contain it; an exact ISO code ("tz") matches too.
 * Names are also matched in English so "Ivory" finds Côte d’Ivoire in French.
 */
export function filterCountries(options: CountryOption[], query: string, locale: string): CountryOption[] {
  const q = searchKey(query);
  if (!q) return options;
  const starts: CountryOption[] = [];
  const contains: CountryOption[] = [];
  for (const o of options) {
    const keys = searchKeys.get(o);
    const name = keys?.name ?? searchKey(o.name);
    const english = keys?.english ?? (locale.startsWith("en") ? name : searchKey(countryName(o.code, "en")));
    if (o.code.toLowerCase() === q || name.startsWith(q) || english.startsWith(q)) starts.push(o);
    else if (name.includes(q) || english.includes(q)) contains.push(o);
  }
  return [...starts, ...contains];
}

/** Parses "TZ, KE ug" into upper-case ISO codes (deduplicated, valid only). */
export function parseCountryCodes(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/[\s,;]+/)) {
    const c = raw.trim().toUpperCase();
    if (isCountryCode(c) && !out.includes(c)) out.push(c);
  }
  return out;
}
