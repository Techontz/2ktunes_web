import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "@/components/ui";
import { LanguageProvider, type Language } from "@/lib/LanguageContext";
import { filterCountries, countryOptions, ISO_COUNTRIES, parseCountryCodes } from "@/lib/countries";
import { CountrySelect } from "../CountrySelect";

function Single({ onChange, language = "EN" }: { onChange?: (v: string) => void; language?: Language }) {
  const [v, setV] = useState("");
  return (
    <LanguageProvider initial={language}>
      <Field label="Country">
        <CountrySelect
          value={v}
          onChange={(x) => {
            setV(x);
            onChange?.(x);
          }}
        />
      </Field>
      <output data-testid="value">{v}</output>
    </LanguageProvider>
  );
}

function Multi({ initial = [] as string[] }) {
  const [v, setV] = useState<string[]>(initial);
  return (
    <LanguageProvider initial="EN">
      <Field label="Countries">
        <CountrySelect multiple value={v} onChange={setV} />
      </Field>
      <output data-testid="value">{JSON.stringify(v)}</output>
    </LanguageProvider>
  );
}

describe("countries lib", () => {
  it("bundles the full ISO 3166-1 alpha-2 list", () => {
    expect(ISO_COUNTRIES).toHaveLength(249);
    expect(new Set(ISO_COUNTRIES).size).toBe(249);
  });

  it("filters by localized name, English name and code, accent-insensitively", () => {
    const fr = countryOptions("fr-FR");
    expect(filterCountries(fr, "cote", "fr-FR")[0].code).toBe("CI");
    // English names match too: "Germany" finds Allemagne.
    expect(filterCountries(fr, "Germany", "fr-FR").map((o) => o.code)).toEqual(["DE"]);
    expect(filterCountries(fr, "tz", "fr-FR")[0].code).toBe("TZ");
    expect(filterCountries(countryOptions("en-TZ"), "zzzz", "en-TZ")).toEqual([]);
  });

  it("parses legacy comma lists into valid codes only", () => {
    expect(parseCountryCodes("tz, KE ,ug tz XX")).toEqual(["TZ", "KE", "UG"]);
  });
});

describe("CountrySelect", () => {
  it("is a labelled ARIA combobox that filters as you type", async () => {
    const user = userEvent.setup();
    render(<Single />);
    const input = screen.getByRole("combobox", { name: "Country" });
    expect(input).toHaveAttribute("aria-expanded", "false");

    await user.type(input, "tan");
    expect(input).toHaveAttribute("aria-expanded", "true");
    const list = screen.getByRole("listbox");
    const names = within(list).getAllByRole("option").map((o) => o.textContent);
    expect(names[0]).toMatch(/Tanzania/);
    expect(names.every((n) => /tan/i.test(n ?? ""))).toBe(true);
    expect(input.getAttribute("aria-activedescendant")).toMatch(/-opt-TZ$/);
  });

  it("selects with the keyboard and shows the name with a flag", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Single onChange={onChange} />);
    const input = screen.getByRole("combobox", { name: "Country" });

    await user.type(input, "ken");
    await user.keyboard("{ArrowDown}{ArrowUp}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("KE");
    expect(screen.getByTestId("value")).toHaveTextContent("KE");
    expect(input).toHaveValue("Kenya");
    expect(input).toHaveAttribute("aria-expanded", "false");

    // Escape closes without changing; the clear button empties it.
    await user.type(input, "uga");
    await user.keyboard("{Escape}");
    expect(screen.getByTestId("value")).toHaveTextContent("KE");
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("shows names in the active language (French)", async () => {
    const user = userEvent.setup();
    render(<Single language="FR" />);
    const input = screen.getByRole("combobox", { name: "Country" });
    await user.type(input, "Allem");
    expect(screen.getByRole("option", { name: /Allemagne/ })).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent("DE");
  });

  it("multiple: adds chips, toggles, removes and yields ISO codes", async () => {
    const user = userEvent.setup();
    render(<Multi initial={["TZ"]} />);
    const input = screen.getByRole("combobox", { name: "Countries" });
    expect(screen.getByRole("button", { name: "Remove Tanzania" })).toBeInTheDocument();

    await user.type(input, "kenya");
    await user.keyboard("{Enter}");
    await user.type(input, "uganda");
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent('["TZ","KE","UG"]');
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");

    await user.click(screen.getByRole("button", { name: "Remove Tanzania" }));
    expect(screen.getByTestId("value")).toHaveTextContent('["KE","UG"]');

    // Backspace in an empty input removes the last chip.
    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(screen.getByTestId("value")).toHaveTextContent('["KE"]');

    // Choosing an already-selected country toggles it off.
    await user.type(input, "kenya");
    expect(screen.getByRole("option", { name: /Kenya/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent("[]");
  });
});
