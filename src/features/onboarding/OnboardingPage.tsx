import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Building2, Check, Clapperboard, Mic2 } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import {
  Avatar,
  Button,
  Card,
  Field,
  Input,
  RadioCardGroup,
  Select,
  Stepper,
  useToast,
} from "@/components/ui";
import { FormAlert, InlineLoading, useAction } from "@/features/dashboard/components";
import { LanguageSwitch } from "@/features/site/layout/LanguageSwitch";
import { completeOnboarding, type OnboardingPayload } from "@/lib/api/account";
import { ACCOUNT_TYPES, type AccountType } from "@/lib/api/auth";
import { fieldErrorsOf, useErrorMessage } from "@/lib/api/errors";
import { createArtist, fetchArtists, fetchReleaseConfig } from "@/lib/api/catalog";
import { saveMyCreatorProfile } from "@/lib/api/marketplace";
import { useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DASHBOARD_HOME } from "@/lib/auth/routes";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { CountrySelect } from "./CountrySelect";
import { CURRENCIES, currencyForCountry, type Currency } from "./countries";
import { CATEGORY_COPY, COPY } from "./copy";

/**
 * /onboarding — runs once after registration, outside the dashboard shell.
 *
 *   1. Account      account type, names, country, phone, currency, language
 *   2. Artist       (artist / label) first artist profile → POST /artists
 *   3. Creator      optional creator profile → PUT /creator/profile
 *
 * The account fields are only sent at the end, with POST /onboarding/complete,
 * so going back and forth never half-saves the profile. Any 422 on those
 * fields sends the person back to step 1 with the errors next to the inputs.
 */

type StepId = "account" | "artist" | "creator";

type AccountForm = {
  account_type: AccountType;
  first_name: string;
  last_name: string;
  business_name: string;
  country: string;
  phone: string;
  preferred_currency: Currency;
};

const ACCOUNT_FIELDS = new Set([
  "account_type",
  "first_name",
  "last_name",
  "business_name",
  "country",
  "phone",
  "preferred_currency",
  "locale",
]);

const MAX_CATEGORIES = 8;
const MAX_LANGUAGES = 10;

export default function OnboardingPage() {
  const { user, refresh, logout } = useAuth();
  const c = useCopy(COPY);
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const toMessage = useErrorMessage();

  const [account, setAccount] = useState<AccountForm>(() => {
    const type = (user?.account_type as AccountType | null | undefined) ?? "artist";
    const country = (user?.country ?? "").toUpperCase();
    const savedCurrency = CURRENCIES.find((x) => x === user?.preferred_currency);
    return {
      account_type: ACCOUNT_TYPES.includes(type) ? type : "artist",
      first_name: user?.first_name ?? (user?.name ? user.name.split(" ")[0] : ""),
      last_name: user?.last_name ?? (user?.name ? user.name.split(" ").slice(1).join(" ") : ""),
      business_name: user?.business_name ?? "",
      country: country.length === 2 ? country : "",
      phone: user?.phone ?? "",
      preferred_currency: savedCurrency ?? currencyForCountry(country) ?? "USD",
    };
  });
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [finishError, setFinishError] = useState<string | null>(null);

  const steps: StepId[] = useMemo(
    () => (account.account_type === "creator" ? ["account", "creator"] : ["account", "artist", "creator"]),
    [account.account_type],
  );
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  useEffect(() => {
    document.title = `${c.docTitle} · 2kTunes`;
  }, [c.docTitle]);

  // Move focus to the step heading so keyboard and screen-reader users land
  // on the new content, not on the button they pressed.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [stepIndex]);

  const finish = useAction(async () => {
    const payload: OnboardingPayload = {
      account_type: account.account_type,
      first_name: account.first_name.trim() || null,
      last_name: account.last_name.trim() || null,
      business_name: account.business_name.trim() || null,
      country: account.country || null,
      phone: account.phone.trim() || null,
      preferred_currency: account.preferred_currency,
      locale: language === "SW" ? "sw" : "en",
    };
    await completeOnboarding(payload);
    await refresh();
  });

  const runFinish = async () => {
    setFinishError(null);
    const res = await finish.run();
    if (res.ok) {
      toast({ title: c.welcome, description: c.welcomeBody, tone: "success" });
      navigate(DASHBOARD_HOME, { replace: true });
      return;
    }
    if (res.ignored) return;
    setFinishError(toMessage(res.error));
    // Errors on account fields belong on step 1, next to the inputs.
    const fe = fieldErrorsOf(res.error);
    const accountFieldErrors = Object.fromEntries(Object.entries(fe).filter(([k]) => ACCOUNT_FIELDS.has(k)));
    if (Object.keys(accountFieldErrors).length) {
      setAccountErrors(accountFieldErrors);
      setStepIndex(0);
    }
  };

  if (user?.onboarding_completed_at) return <Navigate to={DASHBOARD_HOME} replace />;

  const stepLabels: Record<StepId, string> = {
    account: c.stepAccount,
    artist: c.stepArtist,
    creator: c.stepCreator,
  };

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="flex min-h-svh flex-col bg-surface text-text">
      <header className="flex h-16 items-center justify-between gap-4 border-b border-border-subtle px-4 sm:px-8">
        <Link to="/" aria-label={t("nav.home")} className="rounded-sm text-[1.375rem]">
          <Wordmark />
        </Link>
        <LanguageSwitch />
      </header>

      <main id="main" className="flex flex-1 justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="w-full min-w-0 max-w-[40rem]">
          <Stepper
            ariaLabel={c.stepsLabel}
            completedLabel={t("common.completed")}
            current={stepIndex}
            steps={steps.map((s) => ({ id: s, label: stepLabels[s] }))}
            className="mb-8"
          />

          <p className="mb-2 text-caption font-semibold uppercase tracking-[0.12em] text-text-subtle">
            {c.stepOf(stepIndex + 1, steps.length)}
          </p>

          {finishError && step !== "account" && (
            <FormAlert className="mb-4">{finishError}</FormAlert>
          )}

          {step === "account" && (
            <AccountStep
              headingRef={headingRef}
              value={account}
              onChange={(patch) => {
                setAccount((a) => ({ ...a, ...patch }));
                setAccountErrors((e) => {
                  const next = { ...e };
                  for (const k of Object.keys(patch)) delete next[k];
                  return next;
                });
              }}
              errors={accountErrors}
              formError={step === "account" ? finishError : null}
              onLanguage={(lang) => setLanguage(lang)}
              language={language}
              onNext={() => {
                setFinishError(null);
                goNext();
              }}
            />
          )}

          {step === "artist" && (
            <ArtistStep
              headingRef={headingRef}
              isLabel={account.account_type === "label"}
              defaultCountry={account.country}
              defaultName={
                account.account_type === "label"
                  ? ""
                  : [account.first_name, account.last_name].filter(Boolean).join(" ")
              }
              onBack={goBack}
              onNext={goNext}
            />
          )}

          {step === "creator" && (
            <CreatorStep
              headingRef={headingRef}
              recommended={account.account_type === "creator"}
              defaultName={
                account.account_type === "label"
                  ? account.business_name
                  : [account.first_name, account.last_name].filter(Boolean).join(" ") || (user?.name ?? "")
              }
              defaultCountry={account.country}
              finishing={finish.pending}
              onBack={goBack}
              onFinish={runFinish}
            />
          )}
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-3 px-4 pb-6 text-[0.8125rem] text-text-subtle sm:px-8">
        {user?.email && <span className="min-w-0 break-words">{c.signedInAs(user.email)}</span>}
        <button
          type="button"
          onClick={() => void logout()}
          className="min-h-11 rounded-sm font-semibold hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          {c.signOut}
        </button>
      </footer>
    </div>
  );
}

/* ── Shared bits ─────────────────────────────────────────────────────── */

function StepHeading({
  headingRef,
  title,
  sub,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  title: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] outline-none sm:text-[2rem]"
      >
        {title}
      </h1>
      {sub && <p className="mt-2 text-body text-text-muted">{sub}</p>}
    </div>
  );
}

/** Multi-select as toggle chips (aria-pressed), capped at `max`. */
function ToggleChips({
  legend,
  hint,
  options,
  value,
  onChange,
  max,
  error,
}: {
  legend: string;
  hint?: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  error?: string | null;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-[0.875rem] font-semibold text-text-muted">{legend}</legend>
      {hint && <p className="mb-2 text-[0.8125rem] text-text-subtle">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          const disabled = !on && value.length >= max;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-body-sm font-semibold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:opacity-45",
                on
                  ? "border-accent-text bg-accent-soft text-text"
                  : "border-border bg-white/[0.03] text-text-muted hover:border-border-strong hover:text-text",
              )}
            >
              {on && <Check className="h-3.5 w-3.5" aria-hidden />}
              {o.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/* ── Step 1: account ─────────────────────────────────────────────────── */

function AccountStep({
  headingRef,
  value,
  onChange,
  errors,
  formError,
  language,
  onLanguage,
  onNext,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  value: AccountForm;
  onChange: (patch: Partial<AccountForm>) => void;
  errors: Record<string, string>;
  formError: string | null;
  language: string;
  onLanguage: (lang: "EN" | "SW") => void;
  onNext: () => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const [local, setLocal] = useState<Record<string, string>>({});
  const isLabel = value.account_type === "label";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (isLabel && !value.business_name.trim()) next.business_name = c.businessRequired;
    if (!isLabel && !value.first_name.trim()) next.first_name = c.firstNameRequired;
    if (!value.country) next.country = c.countryRequired;
    setLocal(next);
    if (Object.keys(next).length) return;
    onNext();
  };

  const err = (k: string) => local[k] ?? errors[k] ?? null;
  const set = (patch: Partial<AccountForm>) => {
    setLocal((l) => {
      const n = { ...l };
      for (const k of Object.keys(patch)) delete n[k];
      return n;
    });
    onChange(patch);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <StepHeading headingRef={headingRef} title={c.accountTitle} sub={c.accountSub} />
      {formError && <FormAlert>{formError}</FormAlert>}

      <RadioCardGroup<AccountType>
        legend={c.typeLegend}
        name="account_type"
        value={value.account_type}
        onChange={(v) => set({ account_type: v })}
        error={errors.account_type}
        options={[
          { value: "artist", label: t("auth.type_artist"), description: t("auth.type_artist_desc"), icon: <Mic2 /> },
          { value: "label", label: t("auth.type_label"), description: t("auth.type_label_desc"), icon: <Building2 /> },
          {
            value: "creator",
            label: t("auth.type_creator"),
            description: t("auth.type_creator_desc"),
            icon: <Clapperboard />,
          },
        ]}
      />

      {isLabel && (
        <Field label={c.businessName} hint={c.businessHint} error={err("business_name")} required>
          <Input
            value={value.business_name}
            onChange={(e) => set({ business_name: e.target.value })}
            autoComplete="organization"
            maxLength={255}
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={c.firstName}
          error={err("first_name")}
          required={!isLabel}
          optional={isLabel}
          optionalLabel={t("common.optional")}
        >
          <Input
            value={value.first_name}
            onChange={(e) => set({ first_name: e.target.value })}
            autoComplete="given-name"
            maxLength={120}
          />
        </Field>
        <Field label={c.lastName} error={err("last_name")} optional optionalLabel={t("common.optional")}>
          <Input
            value={value.last_name}
            onChange={(e) => set({ last_name: e.target.value })}
            autoComplete="family-name"
            maxLength={120}
          />
        </Field>
      </div>

      <Field label={c.country} hint={c.countryHint} error={err("country")} required>
        <CountrySelect
          value={value.country}
          onChange={(code) => {
            const suggested = currencyForCountry(code);
            set(suggested && value.preferred_currency === "USD" ? { country: code, preferred_currency: suggested } : { country: code });
          }}
        />
      </Field>

      <Field label={c.phone} hint={c.phoneHint} error={err("phone")} optional optionalLabel={t("common.optional")}>
        <Input
          type="tel"
          inputMode="tel"
          value={value.phone}
          onChange={(e) => set({ phone: e.target.value })}
          autoComplete="tel"
          maxLength={30}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.currency} hint={c.currencyHint} error={err("preferred_currency")}>
          <Select
            value={value.preferred_currency}
            onChange={(e) => set({ preferred_currency: e.target.value as Currency })}
          >
            {CURRENCIES.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.language} error={err("locale")}>
          <Select value={language} onChange={(e) => onLanguage(e.target.value as "EN" | "SW")}>
            <option value="EN" lang="en">
              {c.langEn}
            </option>
            <option value="SW" lang="sw">
              {c.langSw}
            </option>
          </Select>
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          {c.continue}
        </Button>
      </div>
    </form>
  );
}

/* ── Step 2: artist profile ──────────────────────────────────────────── */

function ArtistStep({
  headingRef,
  isLabel,
  defaultName,
  defaultCountry,
  onBack,
  onNext,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  isLabel: boolean;
  defaultName: string;
  defaultCountry: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { toast } = useToast();
  const artists = useResource((signal) => fetchArtists({ signal }), []);
  const config = useResource(() => fetchReleaseConfig(), []);
  const [name, setName] = useState(defaultName);
  const [genre, setGenre] = useState("");
  const [country, setCountry] = useState(defaultCountry);
  const [nameError, setNameError] = useState<string | null>(null);

  const create = useAction(() =>
    createArtist({ name: name.trim(), primary_genre: genre || null, country: country || null }),
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(c.artistNameRequired);
      return;
    }
    setNameError(null);
    const res = await create.run();
    if (res.ok) {
      toast({ title: c.artistCreated, tone: "success" });
      artists.setData((prev) => (prev ? { ...prev, artists: [res.value, ...prev.artists] } : prev));
      onNext();
    }
  };

  const list = artists.data?.artists ?? [];
  const genres = config.data?.genres ?? [];

  return (
    <div>
      <StepHeading
        headingRef={headingRef}
        title={c.artistTitle}
        sub={list.length ? undefined : isLabel ? c.artistSubLabel : c.artistSub}
      />

      {artists.loading ? (
        <InlineLoading />
      ) : list.length > 0 ? (
        <div className="space-y-5">
          <p className="text-body text-text-muted">{c.artistExisting}</p>
          <ul className="space-y-2">
            {list.map((a) => (
              <li key={a.id}>
                <Card padding="sm" className="flex items-center gap-3">
                  <Avatar name={a.name} src={a.avatar_url} size="md" />
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-text">{a.name}</p>
                    <p className="text-body-sm text-text-subtle">
                      {[a.primary_genre, typeof a.releases_count === "number" ? c.releasesCount(a.releases_count) : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          {isLabel && <p className="text-body-sm text-text-subtle">{c.artistExistingLabel}</p>}
          <StepNav onBack={onBack} next={<Button onClick={onNext} size="lg" className="w-full sm:w-auto">{c.continue}</Button>} />
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          {artists.error && <FormAlert tone="warning">{artists.error}</FormAlert>}
          {create.error && (
            <FormAlert>{create.fieldErrors.name ? t("err.fix_fields") : create.error}</FormAlert>
          )}
          <Field label={c.artistName} hint={c.artistNameHint} error={nameError ?? create.fieldErrors.name} required>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={255} />
          </Field>
          <Field
            label={c.genre}
            error={create.fieldErrors.primary_genre}
            hint={config.error ? c.configError : undefined}
            optional
            optionalLabel={t("common.optional")}
          >
            <Select value={genre} onChange={(e) => setGenre(e.target.value)} disabled={!genres.length}>
              <option value="">{c.genrePlaceholder}</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.artistCountry} error={create.fieldErrors.country} optional optionalLabel={t("common.optional")}>
            <CountrySelect value={country} onChange={setCountry} />
          </Field>
          <StepNav
            onBack={onBack}
            next={
              <Button type="submit" size="lg" loading={create.pending} className="w-full sm:w-auto">
                {c.createArtist}
              </Button>
            }
          />
        </form>
      )}
    </div>
  );
}

function StepNav({ onBack, next }: { onBack: () => void; next: ReactNode }) {
  const c = useCopy(COPY);
  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <Button type="button" variant="ghost" onClick={onBack} className="w-full sm:w-auto">
        {c.back}
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row">{next}</div>
    </div>
  );
}

/* ── Step 3: creator profile ─────────────────────────────────────────── */

function CreatorStep({
  headingRef,
  recommended,
  defaultName,
  defaultCountry,
  finishing,
  onBack,
  onFinish,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  recommended: boolean;
  defaultName: string;
  defaultCountry: string;
  finishing: boolean;
  onBack: () => void;
  onFinish: () => Promise<void>;
}) {
  const c = useCopy(COPY);
  const categoryLabels = useCopy(CATEGORY_COPY);
  const { locale } = useLanguage();
  const { toast } = useToast();
  const config = useResource(() => fetchReleaseConfig(), []);
  const [displayName, setDisplayName] = useState(defaultName.trim());
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);

  const save = useAction(() =>
    saveMyCreatorProfile({
      display_name: displayName.trim(),
      country: defaultCountry || null,
      categories,
      languages,
    }),
  );

  const languageOptions = useMemo(() => {
    const map = config.data?.languages ?? {};
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale, "en"], { type: "language" });
    } catch {
      names = null;
    }
    return Object.entries(map)
      .filter(([code]) => code !== "zxx")
      .map(([code, fallback]) => {
        let label = fallback;
        try {
          label = names?.of(code) ?? fallback;
        } catch {
          /* keep the API's English name */
        }
        return { value: code, label: label.charAt(0).toUpperCase() + label.slice(1) };
      });
  }, [config.data, locale]);

  const categoryOptions = (config.data?.marketplace.categories ?? []).map((k) => ({
    value: k,
    label: categoryLabels[k] ?? k.replace(/_/g, " "),
  }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setNameError(c.displayNameRequired);
      return;
    }
    setNameError(null);
    const res = await save.run();
    if (res.ok) {
      toast({ title: c.creatorSaved, tone: "success" });
      await onFinish();
    }
  };

  const busy = save.pending || finishing;

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <StepHeading
        headingRef={headingRef}
        title={c.creatorTitle}
        sub={recommended ? c.creatorSubCreator : c.creatorSubOther}
      />
      {save.error && <FormAlert>{save.error}</FormAlert>}

      <Field label={c.displayName} hint={c.displayNameHint} error={nameError ?? save.fieldErrors.display_name} required>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} />
      </Field>

      {config.loading ? (
        <InlineLoading />
      ) : config.error ? (
        <FormAlert tone="warning">{c.noOptions}</FormAlert>
      ) : (
        <>
          <ToggleChips
            legend={c.categories}
            hint={c.categoriesHint(MAX_CATEGORIES)}
            options={categoryOptions}
            value={categories}
            onChange={setCategories}
            max={MAX_CATEGORIES}
            error={save.fieldErrors.categories}
          />
          <ToggleChips
            legend={c.languages}
            hint={c.languagesHint(MAX_LANGUAGES)}
            options={languageOptions}
            value={languages}
            onChange={setLanguages}
            max={MAX_LANGUAGES}
            error={save.fieldErrors.languages}
          />
        </>
      )}

      <div className="space-y-3 pt-2">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" onClick={onBack} disabled={busy} className="w-full sm:w-auto">
            {c.back}
          </Button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => void onFinish()}
              disabled={busy}
              loading={finishing && !save.pending}
              className="w-full sm:w-auto"
            >
              {c.skip}
            </Button>
            <Button type="submit" size="lg" loading={save.pending} disabled={busy} className="w-full sm:w-auto">
              {c.saveCreator}
            </Button>
          </div>
        </div>
        <p className="text-body-sm text-text-subtle">{c.skipHint}</p>
      </div>
    </form>
  );
}
