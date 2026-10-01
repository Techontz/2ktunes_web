import { useLanguage, type Language } from "./LanguageContext";

/**
 * Feature-local copy.
 *
 * Short shared strings (navigation, actions, statuses, errors) live in
 * src/i18n/{en,sw}.ts and are read with `t(key)`. Each dashboard feature keeps
 * its own screen copy next to its components as:
 *
 *   const EN = { title: "Wallet", fee: (x: string) => `Fee ${x}` };
 *   const SW: typeof EN = { title: "Pochi", fee: (x) => `Ada ${x}` };
 *   const FR: typeof EN = { title: "Portefeuille", fee: (x) => `Frais ${x}` };
 *   export const COPY = { EN, SW, FR };
 *
 *   const c = useCopy(COPY);   // → EN, SW or FR for the current language
 *
 * `SW: typeof EN` / `FR: typeof EN` make a missing or misshaped translation a
 * type error, the same guarantee src/i18n/{sw,fr}.ts give the shared keys,
 * and `Copy<T>` requires every language.
 */
export type Copy<T> = Record<Language, T>;

export function useCopy<T>(copy: Copy<T>): T {
  const { language } = useLanguage();
  return copy[language] ?? copy.EN;
}
