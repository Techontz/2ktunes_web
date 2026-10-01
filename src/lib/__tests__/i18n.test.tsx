import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DICTIONARIES, LOCALE_TAG, SUPPORTED_LANGUAGES, en, fr, sw } from "@/i18n";
import { LanguageSwitch } from "@/features/site/layout/LanguageSwitch";
import { LanguageProvider, useLanguage } from "@/lib/LanguageContext";
import { ApiError } from "@/lib/api/client";
import { TRANSLATED_ERROR_CODES, errorMessageFor } from "@/lib/api/errors";
import { formatDate } from "@/lib/dates";
import { formatMinor } from "@/lib/money";

describe("i18n", () => {
  it("offers exactly English, Kiswahili and Français, English first", () => {
    expect(SUPPORTED_LANGUAGES.map((l) => l.name)).toEqual(["English", "Kiswahili", "Français"]);
    expect(LOCALE_TAG.FR).toBe("fr-FR");
  });

  it("has every key translated in every dictionary", () => {
    const keys = Object.keys(en).sort();
    expect(Object.keys(sw).sort()).toEqual(keys);
    expect(Object.keys(fr).sort()).toEqual(keys);
    for (const k of keys) {
      const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
      expect(placeholders(fr[k as keyof typeof fr]), k).toBe(placeholders(en[k as keyof typeof en]));
    }
  });

  it("switches to French, persists it and sets <html lang>", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    function Probe() {
      const { t } = useLanguage();
      return <p>{t("cta.login")}</p>;
    }
    render(
      <LanguageProvider>
        <LanguageSwitch />
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    await user.click(screen.getByRole("radio", { name: "Français" }));
    expect(screen.getByText(DICTIONARIES.FR["cta.login"])).toBeInTheDocument();
    expect(localStorage.getItem("2ktunes.lang")).toBe("FR");
    expect(document.documentElement.lang).toBe("fr");
  });

  it("formats dates and money for the French locale", () => {
    expect(formatDate("2026-03-05", LOCALE_TAG.FR)).toMatch(/5 mars 2026/);
    expect(formatMinor(2500050, "TZS", LOCALE_TAG.FR)).toMatch(/25 000,50/);
  });

  it("maps known API error codes to translated text and keeps the API message otherwise", () => {
    const t = (k: string) => (DICTIONARIES.FR as Record<string, string>)[k] ?? k;
    for (const code of TRANSLATED_ERROR_CODES) {
      const err = new ApiError("English message", 422, {}, false, { code });
      expect(errorMessageFor(err, t)).toBe(DICTIONARIES.FR[`err.code.${code}` as keyof typeof fr]);
    }
    const unknown = new ApiError("Release is locked.", 422, {}, false, { code: "release_locked" });
    expect(errorMessageFor(unknown, t)).toBe("Release is locked.");
  });
});
