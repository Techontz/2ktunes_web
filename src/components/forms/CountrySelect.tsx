import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { controlClasses, useFieldContext } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import {
  PRIORITY_COUNTRIES,
  countryName,
  countryOptions,
  filterCountries,
  flagEmoji,
  type CountryOption,
} from "@/lib/countries";
import { cn } from "@/lib/utils";

/**
 * CountrySelect — searchable ISO-3166 country combobox.
 *
 *   <Field label="Country"><CountrySelect value={cc} onChange={setCc} /></Field>
 *   <Field label="Countries"><CountrySelect multiple value={list} onChange={setList} /></Field>
 *
 * - Names are localised with Intl.DisplayNames (active language), shown with
 *   a flag; typing filters by name in the active language (and English), or
 *   by ISO code.
 * - WAI-ARIA 1.2 combobox: an <input role="combobox"> owns a listbox; Arrow
 *   keys move the active option (aria-activedescendant), Enter selects,
 *   Escape closes, Home/End jump.
 * - `multiple` keeps the input for adding and shows chips with remove
 *   buttons; Backspace in an empty input removes the last chip.
 * - Values are always upper-case ISO-2 codes (what the API expects).
 * - Inside a <Field> it picks up the id, aria-describedby and invalid state.
 */

type CommonProps = {
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  /** Codes that must not be offered (e.g. already used elsewhere). */
  exclude?: readonly string[];
};

export type SingleCountrySelectProps = CommonProps & {
  multiple?: false;
  value: string | null | undefined;
  onChange: (code: string) => void;
  /** Show a clear button (onChange("")). Default true. */
  allowEmpty?: boolean;
};

export type MultiCountrySelectProps = CommonProps & {
  multiple: true;
  value: readonly string[];
  onChange: (codes: string[]) => void;
};

export type CountrySelectProps = SingleCountrySelectProps | MultiCountrySelectProps;

const PRIORITY: ReadonlySet<string> = new Set(PRIORITY_COUNTRIES);

const MAX_VISIBLE = 60;

export function CountrySelect(props: CountrySelectProps) {
  const { t, locale } = useLanguage();
  const field = useFieldContext();
  const autoId = useId().replace(/:/g, "");
  const inputId = props.id ?? field?.id ?? `cs${autoId}`;
  const listId = `${inputId}-listbox`;
  const invalid = !!field?.invalid;

  const multiple = props.multiple === true;
  const selected: string[] = multiple
    ? (props.value as readonly string[]).map((c) => c.toUpperCase())
    : props.value
      ? [String(props.value).toUpperCase()]
      : [];

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const all = useMemo(() => countryOptions(locale), [locale]);
  const excluded = useMemo(() => new Set((props.exclude ?? []).map((c) => c.toUpperCase())), [props.exclude]);

  const results: CountryOption[] = useMemo(() => {
    const base = all.filter((o) => !excluded.has(o.code));
    if (query.trim()) return filterCountries(base, query, locale);
    // Unfiltered: the markets 2kTunes serves most come first.
    const top = PRIORITY_COUNTRIES.map((c) => base.find((o) => o.code === c)).filter(
      (o): o is CountryOption => !!o,
    );
    return [...top, ...base.filter((o) => !PRIORITY.has(o.code))];
  }, [all, excluded, query, locale]);

  // Rendering all ~250 options on every keystroke is slow on low-end phones;
  // show the first MAX_VISIBLE and let typing narrow the rest.
  const hiddenCount = Math.max(0, results.length - MAX_VISIBLE);
  const visible = hiddenCount ? results.slice(0, MAX_VISIBLE) : results;

  const firstNonPriority = query.trim() ? -1 : results.findIndex((o) => !PRIORITY.has(o.code));

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [active, open]);

  const openList = () => {
    if (props.disabled) return;
    if (!open) {
      setOpen(true);
      // Start on the current selection in single mode.
      const idx = !multiple && selected[0] ? results.findIndex((o) => o.code === selected[0]) : 0;
      setActive(idx > 0 && idx < MAX_VISIBLE ? idx : 0);
    }
  };

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const choose = (code: string) => {
    if (multiple) {
      const p = props as MultiCountrySelectProps;
      p.onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]);
      setQuery("");
      inputRef.current?.focus();
    } else {
      (props as SingleCountrySelectProps).onChange(code);
      close();
    }
  };

  const remove = (code: string) => {
    if (multiple) (props as MultiCountrySelectProps).onChange(selected.filter((c) => c !== code));
    else (props as SingleCountrySelectProps).onChange("");
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setActive((i) => Math.min(i + 1, visible.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else setActive((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(Math.max(visible.length - 1, 0));
        }
        break;
      case "Enter":
        if (open && visible[active]) {
          e.preventDefault();
          choose(visible[active].code);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      case "Backspace":
        if (multiple && !query && selected.length) remove(selected[selected.length - 1]);
        break;
      case "Tab":
        close();
        break;
    }
  };

  const single = !multiple ? selected[0] : undefined;
  const singleLabel = single ? countryName(single, locale) : "";
  // In single mode the input shows the chosen country until the user types.
  const inputValue = open || multiple ? query : singleLabel;
  const activeOption = open ? visible[active] : undefined;
  const placeholder =
    props.placeholder ?? (multiple ? t("country.choose_many") : open ? t("country.placeholder") : t("country.choose"));

  return (
    <div
      ref={rootRef}
      className={cn("relative min-w-0", props.className)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) close();
      }}
    >
      {multiple && selected.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5" aria-label={t("country.selected_count", { count: selected.length })}>
          {selected.map((code) => {
            const name = countryName(code, locale);
            return (
              <li
                key={code}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-white/[0.05] py-1 pl-2.5 pr-1 text-[0.8125rem] font-medium text-text"
              >
                <span aria-hidden>{flagEmoji(code)}</span>
                <span className="truncate">{name}</span>
                <button
                  type="button"
                  onClick={() => remove(code)}
                  disabled={props.disabled}
                  aria-label={t("country.remove", { name })}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-subtle transition-colors hover:bg-white/[0.08] hover:text-text"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-text-subtle"
        >
          {!multiple && single && !open ? (
            <span className="text-[1.05rem] leading-none">{flagEmoji(single)}</span>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-label={props["aria-label"]}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOption ? `${inputId}-opt-${activeOption.code}` : undefined}
          aria-describedby={field?.describedBy}
          aria-invalid={invalid || undefined}
          aria-required={field?.required || undefined}
          autoComplete="off"
          spellCheck={false}
          disabled={props.disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            if (!open) setOpen(true);
          }}
          onFocus={openList}
          onClick={openList}
          onKeyDown={onKeyDown}
          className={cn(controlClasses(invalid), "h-11 pl-10", !multiple && single ? "pr-20" : "pr-10")}
        />
        <span className="absolute inset-y-0 right-1 flex items-center gap-0.5">
          {!multiple && single && props.allowEmpty !== false && !props.disabled && (
            <button
              type="button"
              onClick={() => remove(single)}
              aria-label={t("country.clear")}
              className="flex h-9 w-9 items-center justify-center rounded-[8px] text-text-subtle transition-colors hover:bg-white/[0.06] hover:text-text"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
          <ChevronDown aria-hidden className="pointer-events-none mr-2.5 h-4 w-4 text-text-subtle" />
        </span>
      </div>

      {props.name && (
        <input type="hidden" name={props.name} value={multiple ? selected.join(",") : (single ?? "")} />
      )}

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        aria-label={props["aria-label"] ?? (multiple ? t("country.choose_many") : t("country.choose"))}
        hidden={!open}
        className={cn(
          "absolute left-0 right-0 z-50 mt-1.5 max-h-72 overflow-y-auto overscroll-contain rounded-control border border-border",
          "bg-surface-overlay p-1 shadow-[0_18px_48px_-12px_rgba(0,0,0,0.6)]",
        )}
      >
        {results.length === 0 ? (
          <li role="presentation" className="px-3 py-2.5 text-[0.875rem] text-text-subtle">
            {t("country.no_results", { query: query.trim() })}
          </li>
        ) : (
          visible.map((o, i) => {
            const isSelected = selected.includes(o.code);
            return (
              <li
                key={o.code}
                id={`${inputId}-opt-${o.code}`}
                data-index={i}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => active !== i && setActive(i)}
                onClick={() => choose(o.code)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[0.9375rem] text-text",
                  i === active && "bg-white/[0.08]",
                  i === firstNonPriority && i > 0 && "mt-1 border-t border-border-subtle pt-2.5",
                )}
              >
                <span aria-hidden className="w-6 shrink-0 text-center text-[1.05rem] leading-none">
                  {o.flag}
                </span>
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                {isSelected && <Check aria-hidden className="h-4 w-4 shrink-0 text-accent-text" />}
              </li>
            );
          })
        )}
        {hiddenCount > 0 && (
          <li role="presentation" className="px-3 py-2 text-[0.8125rem] text-text-subtle">
            {t("country.more_results", { count: hiddenCount })}
          </li>
        )}
      </ul>
    </div>
  );
}
