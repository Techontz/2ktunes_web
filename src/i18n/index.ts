import en, { type MessageKey } from "./en";
import sw from "./sw";
import fr from "./fr";

/**
 * Locale registry.
 *
 * English (default), Kiswahili and French are complete and offered in the
 * language picker. Every dictionary is typed `Record<MessageKey, string>` and
 * every `Copy`/`Localized` object requires all three, so adding a language
 * here makes the compiler list every string that still needs translating.
 */
export type Language = "EN" | "SW" | "FR";

export const SUPPORTED_LANGUAGES: { code: Language; name: string; short: string }[] = [
  { code: "EN", name: "English", short: "EN" },
  { code: "SW", name: "Kiswahili", short: "SW" },
  { code: "FR", name: "Français", short: "FR" },
];

export const DICTIONARIES: Record<Language, Record<MessageKey, string>> = {
  EN: en,
  SW: sw,
  FR: fr,
};

/** BCP-47 tags for Intl formatting. */
export const LOCALE_TAG: Record<Language, string> = {
  EN: "en-TZ",
  SW: "sw-TZ",
  FR: "fr-FR",
};

/** The `locale` value the API accepts on profile/registration. */
export const API_LOCALE: Record<Language, "en" | "sw" | "fr"> = {
  EN: "en",
  SW: "sw",
  FR: "fr",
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
export { en, sw, fr };
