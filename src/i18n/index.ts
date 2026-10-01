import en, { type MessageKey } from "./en";
import sw from "./sw";

/**
 * Locale registry.
 *
 * EN and SW are complete and offered in the language picker. FR/PT/ES remain
 * valid values of `Language` so older call sites keep type-checking, but they
 * resolve to English until real translations exist — offering a language
 * whose pages are mostly English would be worse than not offering it.
 */
export type Language = "EN" | "SW" | "FR" | "PT" | "ES";

export const SUPPORTED_LANGUAGES: { code: Language; name: string; short: string }[] = [
  { code: "EN", name: "English", short: "EN" },
  { code: "SW", name: "Kiswahili", short: "SW" },
];

export const DICTIONARIES: Partial<Record<Language, Record<MessageKey, string>>> = {
  EN: en,
  SW: sw,
};

/** BCP-47 tags for Intl formatting and <html lang>. */
export const LOCALE_TAG: Record<Language, string> = {
  EN: "en-TZ",
  SW: "sw-TZ",
  FR: "fr",
  PT: "pt",
  ES: "es",
};

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in vars ? String(vars[name]) : m,
  );
}

export type { MessageKey };
export { en, sw };
