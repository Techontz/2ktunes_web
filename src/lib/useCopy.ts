import { useLanguage } from "./LanguageContext";

/**
 * Feature-local copy.
 *
 * Short shared strings (navigation, actions, statuses, errors) live in
 * src/i18n/{en,sw}.ts and are read with `t(key)`. Each dashboard feature keeps
 * its own screen copy next to its components as:
 *
 *   const EN = { title: "Wallet", fee: (x: string) => `Fee ${x}` };
 *   const SW: typeof EN = { title: "Pochi", fee: (x) => `Ada ${x}` };
 *   export const COPY = { EN, SW };
 *
 *   const c = useCopy(COPY);   // → EN or SW for the current language
 *
 * `SW: typeof EN` makes a missing or misshaped Swahili string a type error,
 * the same guarantee src/i18n/sw.ts gives the shared keys.
 */
export type Copy<T> = { EN: T; SW: T };

export function useCopy<T>(copy: Copy<T>): T {
  const { language } = useLanguage();
  return language === "SW" ? copy.SW : copy.EN;
}
