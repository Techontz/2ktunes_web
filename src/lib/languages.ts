/**
 * Language choices for creator profiles and similar pickers. Values are ISO
 * 639-1 codes (what the API stores); names come from Intl.DisplayNames in the
 * viewer's language.
 */

/** Languages 2kTunes creators most often work in, African languages first. */
const COMMON_LANGUAGES = [
  "sw", "en", "fr", "pt", "ar", "am", "ha", "yo", "ig", "zu", "xh", "rw", "rn", "lg", "so", "om",
  "ln", "wo", "tw", "es", "de", "it", "zh", "hi",
] as const;

export function languageName(code: string, locale: string): string {
  try {
    const name = new Intl.DisplayNames([locale, "en"], { type: "language" }).of(code);
    if (name && name !== code) return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
  } catch {
    /* fall through */
  }
  return code;
}

/** Options for a language picker: the common list plus any extra saved codes. */
export function languageOptions(locale: string, extra: readonly string[] = []): { value: string; label: string }[] {
  const codes = [...COMMON_LANGUAGES, ...extra.filter((c) => !(COMMON_LANGUAGES as readonly string[]).includes(c))];
  return codes.map((value) => ({ value, label: languageName(value, locale) }));
}
