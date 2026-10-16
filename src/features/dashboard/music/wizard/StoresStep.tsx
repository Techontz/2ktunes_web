import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { BarChart3, Check, ChevronDown, Globe, Search } from "lucide-react";
import { Button, Checkbox, Dialog, Field } from "@/components/ui";
import { cn } from "@/lib/utils";
import { CountrySelect } from "@/components/forms/CountrySelect";
import { updateRelease } from "@/lib/api/catalog";
import { fieldErrorsOf } from "@/lib/api/errors";
import type { Store, Territories } from "@/lib/api/types";
import { useCopy } from "@/lib/useCopy";
import { FormAlert } from "../../components";
import { COPY } from "../copy";
import { useIssueText } from "../shared";
import { useDraftPart, useReportSaver, useWizard } from "./context";
import { confirmationKeys } from "./options";
import { useAgreements } from "./ReviewStep";
import { useUpload } from "./state";
import { useAutosave } from "./useAutosave";
import { firstByField, validateStores } from "./validation";

/**
 * 1. DISTRIBUTION: every available store is ticked unless the draft already
 * has a choice, except opt-in stores (Snapchat, Roblox) which the artist
 * ticks and confirms in a dialog; the confirmation is recorded as agreements.
 * A search field filters the whole catalogue, shown at once as a dense grid
 * of checkbox rows. Territories sit in one bar under the grid with the count
 * of chosen stores. The store choice lives in the page state (other sections
 * depend on it) and autosaves with the territories.
 */
export function StoresStep() {
  const issueText = useIssueText();
  const { release, setRelease, stores, attempted } = useWizard();
  const { platforms, setPlatforms, available } = useUpload();
  const [noChoiceYet] = useState(() => (release?.platforms ?? []).length === 0);
  const [mode, setMode] = useState<Territories["mode"]>(() => release?.territories?.mode ?? "worldwide");
  const [countries, setCountries] = useState<string[]>(() => release?.territories?.countries ?? []);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const territories: Territories = { mode, countries: mode === "worldwide" ? [] : countries };
  const issues = validateStores({ platforms, territories }, available);
  const by = firstByField(issues);

  // A store can be switched off after it was picked; never resend it.
  const payload = { platforms: platforms.filter((p) => available.includes(p)), territories };
  const auto = useAutosave(
    payload,
    async (p) => {
      try {
        setRelease(await updateRelease(release!.id, p));
        setServerErrors({});
      } catch (err) {
        setServerErrors(fieldErrorsOf(err));
        throw err;
      }
    },
    { delay: 900, enabled: !!release },
  );
  useReportSaver("stores", auto);
  useDraftPart("stores", () => {
    const snapshot = payload;
    return { patch: snapshot, commit: () => auto.rebase(snapshot) };
  });

  // An existing draft with no stores: every available one starts ticked; save that now.
  useEffect(() => {
    if (!release || !noChoiceYet || !available.length) return;
    auto.rebase({ ...payload, platforms: [] });
    void auto.flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countriesError = serverErrors["territories.countries"] ?? (attempted ? issueText(by.territories) : undefined);
  const storesError = serverErrors.platforms ?? (attempted || platforms.length === 0 ? issueText(by.platforms) : undefined);
  // Only stores we deliver to today; unavailable ones are not shown at all.
  const list = useMemo(() => stores.filter((s) => s.status === "available"), [stores]);
  const { setAgreements } = useAgreements();
  const [confirming, setConfirming] = useState<Store | null>(null);
  const toggle = (slug: string, on: boolean) => {
    const store = list.find((s) => s.slug === slug);
    const keys = confirmationKeys(store);
    // Opt-in stores are ticked from their confirmation dialog.
    if (on && keys.length) return setConfirming(store!);
    setPlatforms((p) => (on ? [...new Set([...p, slug])] : p.filter((x) => x !== slug)));
    if (!on && keys.length) {
      const stillNeeded = list.filter((s) => s.slug !== slug && platforms.includes(s.slug)).flatMap(confirmationKeys);
      setAgreements((a) => ({ ...a, ...Object.fromEntries(keys.filter((k) => !stillNeeded.includes(k)).map((k) => [k, false])) }));
    }
  };
  const confirm = (store: Store) => {
    setPlatforms((p) => [...new Set([...p, store.slug])]);
    setAgreements((a) => ({ ...a, ...Object.fromEntries(confirmationKeys(store).map((k) => [k, true])) }));
    setConfirming(null);
  };
  const chosen = list.filter((s) => platforms.includes(s.slug));

  return (
    <div className="space-y-5">
      {storesError && <FormAlert>{storesError}</FormAlert>}
      <DistributionStoreSelector stores={list} selected={platforms} onToggle={toggle} />
      <StoreConfirmDialog store={confirming} onCancel={() => setConfirming(null)} onConfirm={confirm} />
      <TerritorySelector
        mode={mode}
        onMode={setMode}
        countries={countries}
        onCountries={setCountries}
        countriesError={countriesError}
        chosen={chosen}
      />
    </div>
  );
}

/** Case and accent insensitive ("claro musica" finds "Claro Música"). */
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Search plus every store at once, DistroKid style: a plain grid of checkbox
 * rows (4 columns on wide screens, 3 on tablets, 2 on phones, 1 under 340 px),
 * filled row by row. Native checkboxes underneath: Tab moves through the
 * stores, Space toggles, and the row shows a focus ring.
 */
export function DistributionStoreSelector({
  stores,
  selected,
  onToggle,
}: {
  stores: Store[];
  selected: string[];
  onToggle: (slug: string, on: boolean) => void;
}) {
  const c = useCopy(COPY);
  const searchId = useId();
  const [query, setQuery] = useState("");
  const q = fold(query);
  const visible = q ? stores.filter((s) => fold(s.name).includes(q) || fold(s.slug).includes(q)) : stores;

  return (
    <div className="space-y-3.5">
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {c.storeSearchLabel}
        </label>
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-nr-subtle" />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={c.storeSearch}
          autoComplete="off"
          className="w-full rounded-[8px] border border-nr-line bg-white pl-11 pr-4 text-text outline-none transition-colors placeholder:text-nr-subtle hover:border-[#d9d2e8] focus:border-accent-text"
        />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-[8px] border border-dashed border-nr-line px-4 py-3 text-body-sm text-nr-muted">{c.storesNoMatch(query.trim())}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-5 min-[340px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
          {visible.map((st) => {
            const on = selected.includes(st.slug);
            return (
              <li key={st.slug} className="min-w-0">
                <label
                  title={st.name}
                  className={cn(
                    "group flex h-[2.125rem] cursor-pointer select-none items-center gap-2.5 rounded-[4px] text-[0.875rem] leading-tight text-text",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent-text",
                  )}
                >
                  <input type="checkbox" className="sr-only" checked={on} onChange={(e) => onToggle(st.slug, e.target.checked)} />
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] transition-colors duration-100",
                      on ? "bg-accent text-white" : "border-[1.5px] border-nr-line-strong bg-white group-hover:border-[#9c97ad]",
                    )}
                  >
                    {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
                  </span>
                  <span className="min-w-0 truncate decoration-nr-line-strong underline-offset-[3px] group-hover:underline">{st.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * The confirmation an opt-in store asks for when ticked (DistroKid parity):
 * Snapchat a yes or no on owning all the publishing, Roblox four boxes that
 * all have to be ticked before Continue.
 */
export function StoreConfirmDialog({
  store,
  onCancel,
  onConfirm,
}: {
  store: Store | null;
  onCancel: () => void;
  onConfirm: (store: Store) => void;
}) {
  const c = useCopy(COPY);
  const kind = store?.confirmation;
  const [ticks, setTicks] = useState<boolean[]>([false, false, false, false]);
  // Each opening starts with the boxes empty.
  useEffect(() => {
    if (store) setTicks([false, false, false, false]);
  }, [store]);

  if (!store) return null;
  if (kind === "roblox_eligibility") {
    const items: ReactNode[] = [
      c.optInRobloxRights,
      c.optInRobloxNoPro,
      c.optInRobloxNotMonetized,
      <>
        {c.optInRobloxTermsBefore}
        <a
          href={ROBLOX_TERMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-text underline underline-offset-2 hover:no-underline"
        >
          {c.optInRobloxTermsLink}
          <span className="sr-only"> {c.optInNewTab}</span>
        </a>
        {c.optInRobloxTermsAfter}
      </>,
    ];
    const ready = ticks.every(Boolean);
    return (
      <Dialog
        open
        onClose={onCancel}
        title={c.optInRobloxTitle}
        description={c.optInRobloxBody}
        closeLabel={c.optInClose}
        footer={
          <>
            <Button variant="secondary" onClick={onCancel}>
              {c.optInCancel}
            </Button>
            <Button onClick={() => onConfirm(store)} disabled={!ready}>
              {c.optInContinue}
            </Button>
          </>
        }
      >
        <fieldset>
          <legend className="mb-3 text-[0.875rem] font-semibold text-text">{c.optInRobloxConfirm}</legend>
          <div className="space-y-3">
            {items.map((label, i) => (
              <Checkbox
                key={i}
                label={label}
                checked={ticks[i]}
                onChange={(e) => setTicks((t) => t.map((v, j) => (j === i ? e.target.checked : v)))}
              />
            ))}
          </div>
        </fieldset>
      </Dialog>
    );
  }
  return (
    <Dialog
      open
      onClose={onCancel}
      title={c.optInSnapTitle}
      description={c.optInSnapBody(store.name)}
      closeLabel={c.optInClose}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {c.optInSnapNo}
          </Button>
          <Button onClick={() => onConfirm(store)}>{c.optInSnapYes}</Button>
        </>
      }
    />
  );
}

const ROBLOX_TERMS_URL = "https://en.help.roblox.com/hc/en-us/articles/115004647846";

/**
 * One bar: territories (Worldwide, only some countries, all but some) with a
 * "Global release" pill, then the number of chosen stores, which opens the
 * list of names. The country picker shows under the bar when needed.
 */
export function TerritorySelector({
  mode,
  onMode,
  countries,
  onCountries,
  countriesError,
  chosen,
}: {
  mode: Territories["mode"];
  onMode: (m: Territories["mode"]) => void;
  countries: string[];
  onCountries: (c: string[]) => void;
  countriesError?: string;
  chosen: Store[];
}) {
  const c = useCopy(COPY);
  const selectId = useId();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const n = chosen.length;

  return (
    <div className="@container rounded-[10px] border border-nr-line bg-white/75">
      <div className="flex flex-col gap-4 p-4 @3xl:flex-row @3xl:items-center @3xl:gap-0 @3xl:py-4 @3xl:pl-[1.1rem] @3xl:pr-5">
        {/* Territories */}
        <div className="flex min-w-0 items-center gap-3.5 @3xl:flex-1 @3xl:gap-5">
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nr-pick text-accent-text">
            <Globe className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="min-w-0">
            <label htmlFor={selectId} className="block text-[0.875rem] font-bold text-text">
              {c.territoriesTitle}
            </label>
            <span className="block text-[0.75rem] text-nr-muted">{c.terrSub}</span>
          </span>
        </div>
        <div className="flex h-[2.625rem] min-w-0 items-center gap-3 rounded-[8px] border border-nr-line bg-white pr-2.5 @3xl:ml-4 @3xl:w-[17rem] @4xl:w-[17.25rem]">
          <span className="relative min-w-0 flex-1">
            <select
              id={selectId}
              value={mode}
              onChange={(e) => onMode(e.target.value as Territories["mode"])}
              className="!h-10 w-full min-w-0 cursor-pointer appearance-none truncate !border-0 bg-transparent pl-4 pr-7 text-[0.875rem] font-medium text-text outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text"
            >
              <option value="worldwide">{c.terrWorldwide}</option>
              <option value="include">{c.terrInclude}</option>
              <option value="exclude">{c.terrExclude}</option>
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text" />
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-medium",
              mode === "worldwide" ? "bg-nr-go-soft text-[#2c6b55]" : "bg-nr-pick text-accent-text",
            )}
          >
            <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", mode === "worldwide" ? "bg-nr-go" : "bg-accent")} />
            {mode === "worldwide" ? c.terrGlobal : c.terrCountriesPill(countries.length)}
          </span>
        </div>

        <span aria-hidden className="hidden h-10 w-px shrink-0 bg-nr-line @3xl:mx-7 @3xl:block" />

        {/* Stores chosen */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 items-center gap-3.5 rounded-[8px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text @3xl:flex-1"
        >
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nr-soft text-accent-text">
            <BarChart3 className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.875rem] font-bold text-text">{c.storesSelected(n)}</span>
            <span className="block text-[0.75rem] text-nr-muted">{c.storesSentTo(n)}</span>
          </span>
          <span className="sr-only">{c.storesShowSelected}</span>
          <ChevronDown aria-hidden className={cn("h-[1.1rem] w-[1.1rem] shrink-0 text-nr-muted transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div id={listId} className="border-t border-nr-line px-4 py-3 @3xl:px-5">
          {n ? (
            <ul className="flex flex-wrap gap-1.5">
              {chosen.map((s) => (
                <li key={s.slug} className="rounded-full bg-nr-pick px-2.5 py-1 text-[0.75rem] font-medium text-text">
                  {s.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.8125rem] text-nr-muted">{c.storesNoneSelected}</p>
          )}
        </div>
      )}

      {mode !== "worldwide" && (
        <div className="border-t border-nr-line px-4 py-4 @3xl:px-5">
          <Field label={c.countries} className="sm:max-w-lg" error={countriesError}>
            <CountrySelect multiple value={countries} onChange={onCountries} />
          </Field>
        </div>
      )}
    </div>
  );
}

/**
 * "Select all / Clear all" for the stores heading. Select all skips opt-in
 * stores (Snapchat, Roblox) the artist hasn't confirmed for this release;
 * Clear all also clears their confirmations.
 */
export function StoresSelectAll() {
  const c = useCopy(COPY);
  const { stores } = useWizard();
  const { platforms, setPlatforms, available } = useUpload();
  const { agreements, setAgreements } = useAgreements();
  const selectable = stores
    .filter((s) => available.includes(s.slug) && confirmationKeys(s).every((k) => agreements[k] === true))
    .map((s) => s.slug);
  const all = selectable.length > 0 && selectable.every((slug) => platforms.includes(slug));
  const onClick = () => {
    if (!all) return setPlatforms(available.filter((slug) => selectable.includes(slug) || platforms.includes(slug)));
    setPlatforms([]);
    const keys = stores.flatMap(confirmationKeys);
    if (keys.length) setAgreements((a) => ({ ...a, ...Object.fromEntries(keys.map((k) => [k, false])) }));
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[0.8125rem] font-medium text-accent-text underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
    >
      {all ? c.storesClearAll : c.storesSelectAll}
    </button>
  );
}
