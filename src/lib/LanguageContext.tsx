import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DICTIONARIES,
  LOCALE_TAG,
  SUPPORTED_LANGUAGES,
  interpolate,
  type Language,
  type MessageKey,
} from "@/i18n";

/**
 * TRANSLATION SYSTEM
 * ==================
 *
 * Two ways to translate, one provider:
 *
 *   t("auth.login_btn")                 short UI strings, keyed in src/i18n/*.ts
 *   t("pricing.per_days", { days: 30 }) with {placeholder} interpolation
 *   pick({ EN, SW, FR })                long-form structured copy that lives next
 *                                       to the page that renders it (marketing
 *                                       sections, help articles, legal drafts)
 *
 * Missing keys fall back to English, then to the key itself, so a gap is
 * visible in QA rather than rendering nothing.
 *
 * The chosen language persists in localStorage and is mirrored onto
 * <html lang>, so screen readers pronounce Swahili and French pages correctly.
 */

export type { Language };

/**
 * Structured copy for `pick()`. Every supported language is REQUIRED, so a
 * page that ships without French (or Swahili) copy fails typecheck.
 */
export type Localized<T> = Record<Language, T>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** BCP-47 tag for Intl APIs, e.g. "sw-TZ". */
  locale: string;
  /** Accepts any string for backwards compatibility; MessageKey is typed. */
  t: (key: MessageKey | (string & {}), vars?: Record<string, string | number>) => string;
  pick: <T>(content: Localized<T>) => T;
}

const STORAGE_KEY = "2ktunes.lang";

function initialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored;
  } catch {
    /* storage blocked */
  }
  const nav = typeof navigator !== "undefined" ? navigator.language?.toLowerCase() : "";
  if (nav?.startsWith("sw")) return "SW";
  if (nav?.startsWith("fr")) return "FR";
  return "EN";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initial,
}: {
  children: ReactNode;
  /** Tests pin a language; the app reads storage/browser preference. */
  initial?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(() => initial ?? initialLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage blocked — the choice lasts for this visit */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALE_TAG[language].slice(0, 2);
  }, [language]);

  const value = useMemo<LanguageContextType>(() => {
    const dict = DICTIONARIES[language] ?? DICTIONARIES.EN;
    const fallback = DICTIONARIES.EN;
    return {
      language,
      setLanguage,
      locale: LOCALE_TAG[language],
      t: (key, vars) => {
        const k = key as MessageKey;
        return interpolate(dict[k] ?? fallback[k] ?? key, vars);
      },
      pick: (content) => content[language] ?? content.EN,
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
