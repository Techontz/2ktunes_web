/**
 * Label helpers shared by the royalties and analytics screens.
 * Stores report countries as ISO-3166 alpha-2 codes; "??" means unknown.
 */

const regionNames = new Map<string, Intl.DisplayNames | null>();

export function countryName(code: string | null | undefined, locale: string, unknown: string): string {
  const cc = (code ?? "").trim().toUpperCase();
  if (!cc || cc === "??" || cc === "XX" || cc === "ZZ") return unknown;
  if (!/^[A-Z]{2}$/.test(cc)) return cc;
  if (!regionNames.has(locale)) {
    try {
      regionNames.set(locale, new Intl.DisplayNames([locale], { type: "region" }));
    } catch {
      regionNames.set(locale, null);
    }
  }
  try {
    return regionNames.get(locale)?.of(cc) ?? cc;
  } catch {
    return cc;
  }
}

export function usageLabel(type: string | null | undefined, labels: Record<string, string>, unknown: string): string {
  if (!type) return unknown;
  return labels[type.toLowerCase()] ?? type.replace(/_/g, " ");
}
