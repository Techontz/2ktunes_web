import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Info } from "lucide-react";
import { Button, Checkbox, Dialog, Field, Input, PasswordInput, RadioCardGroup, Select } from "@/components/ui";
import { CountrySelect } from "@/components/forms/CountrySelect";
import { DefinitionList, FormAlert, InlineLoading, LoadError, SandboxBadge, useAction } from "@/features/dashboard/components";
import { errorCodeOf, fieldErrorsOf } from "@/lib/api/errors";
import type { PayoutField, PayoutMethod, PayoutProvider } from "@/lib/api/types";
import { createPayoutMethod } from "@/lib/api/wallet";
import { useLanguage } from "@/lib/LanguageContext";
import { formatMinor, toMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY, type WalletCopy } from "./copy";
import { failureOf, providerFee, providerLimits, providerProcessing } from "./helpers";
import {
  OTHER_VALUE,
  fieldHint,
  fieldLabel,
  fieldPayload,
  fieldsFor,
  groupProviders,
  isOtherCompanion,
  otherKeyFor,
  validateFields,
  type ProviderGroup,
} from "./payoutMethods";
import { PayoutTypeIcon } from "./PayoutTypeIcon";

/**
 * Add a payout method — three short steps:
 *   1. Method type (mobile money / local bank / SWIFT / PayPal-Payoneer-Wise),
 *      grouped from GET /payout-providers; only types with providers show.
 *   2. Provider, when the type has more than one.
 *   3. Details, rendered from the provider's `fields` schema, then nickname,
 *      default flag and the current password. 422 field errors land inline.
 * There are no card payouts.
 */

const FORM_ID = "add-payout-method-form";

type Step = "type" | "provider" | "details";

export function AddPayoutMethodDialog({
  open,
  onClose,
  providers,
  providersLoading,
  providersError,
  onRetryProviders,
  isFirst,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  providers: PayoutProvider[];
  providersLoading?: boolean;
  providersError?: string | null;
  onRetryProviders?: () => void;
  /** The first method becomes the default unless the user unticks it. */
  isFirst: boolean;
  onAdded: (m: PayoutMethod) => void;
}) {
  const c = useCopy(COPY);
  const { t, locale, language } = useLanguage();
  const groups = useMemo(() => groupProviders(providers), [providers]);

  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [password, setPassword] = useState("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const save = useAction(createPayoutMethod);
  const { reset } = save;

  const group: ProviderGroup | null = groups.find((g) => g.type === type) ?? null;
  const provider = providers.find((p) => String(p.id) === providerId) ?? null;
  const fields = useMemo(() => (provider ? fieldsFor(provider) : []), [provider]);
  const multiProvider = (group?.providers.length ?? 0) > 1;

  const startDetails = (p: PayoutProvider) => {
    setProviderId(String(p.id));
    setValues({});
    setLocalErrors({});
    reset();
    setStep("details");
  };

  // A fresh flow every time the dialog opens. One provider in total → straight to its form.
  useEffect(() => {
    if (!open) return;
    setLabel("");
    setIsDefault(isFirst);
    setPassword("");
    setValues({});
    setLocalErrors({});
    reset();
    if (providers.length === 1) {
      setType(providers[0].type);
      setProviderId(String(providers[0].id));
      setStep("details");
    } else {
      setType(groups.length === 1 ? groups[0].type : null);
      setProviderId(null);
      setStep("type");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, providers.length]);

  const onTypeContinue = () => {
    if (!group) {
      setLocalErrors({ type: c.chooseType });
      return;
    }
    setLocalErrors({});
    if (group.providers.length === 1) startDetails(group.providers[0]);
    else {
      setProviderId(null);
      setStep("provider");
    }
  };

  const onProviderContinue = () => {
    const p = group?.providers.find((x) => String(x.id) === providerId);
    if (!p) {
      setLocalErrors({ provider: c.providerPlaceholder });
      return;
    }
    startDetails(p);
  };

  const back = () => {
    setLocalErrors({});
    reset();
    if (step === "details" && multiProvider) setStep("provider");
    else setStep("type");
  };

  const setValue = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    const errs = validateFields(fields, values, c);
    if (!password) errs.current_password = t("pw.required");
    setLocalErrors(errs);
    if (Object.keys(errs).length) return;

    const res = await save.run({
      payout_provider_id: provider.id,
      ...fieldPayload(fields, values),
      label: label.trim() || null,
      is_default: isDefault,
      current_password: password,
    });
    if (res.ok) {
      onAdded(res.value);
      onClose();
    } else if (errorCodeOf(failureOf(res)) === "password_incorrect") {
      setLocalErrors({ current_password: t("pw.incorrect") });
      setPassword("");
    }
  };

  const fe = save.fieldErrors;
  const errorFor = (key: string) => localErrors[key] ?? fe[key] ?? null;
  const pwIncorrect = errorCodeOf(save.errorObj) === "password_incorrect";
  const hasFieldErrors = Object.keys(fieldErrorsOf(save.errorObj)).length > 0;
  const formError = save.error && !pwIncorrect && !hasFieldErrors ? save.error : hasFieldErrors ? t("err.fix_fields") : null;

  const ready = !providersLoading && providers.length > 0;
  const showProviderStep = multiProvider;
  const stepLabels = showProviderStep ? [c.stepType, c.stepProvider, c.stepDetails] : [c.stepType, c.stepDetails];
  const stepIndex = step === "type" ? 0 : step === "provider" ? 1 : showProviderStep ? 2 : 1;
  const skippedTypeStep = providers.length === 1;
  const international = type === "bank_international" || type === "wallet";

  let footer: ReactNode;
  if (!ready) {
    footer = (
      <Button variant="secondary" onClick={onClose}>
        {t("act.close")}
      </Button>
    );
  } else if (step === "type") {
    footer = (
      <>
        <Button variant="ghost" onClick={onClose}>
          {t("act.cancel")}
        </Button>
        <Button onClick={onTypeContinue}>{c.next}</Button>
      </>
    );
  } else if (step === "provider") {
    footer = (
      <>
        <Button variant="ghost" onClick={back}>
          {c.back}
        </Button>
        <Button onClick={onProviderContinue}>{c.next}</Button>
      </>
    );
  } else {
    footer = (
      <>
        {skippedTypeStep ? (
          <Button variant="ghost" onClick={onClose} disabled={save.pending}>
            {t("act.cancel")}
          </Button>
        ) : (
          <Button variant="ghost" onClick={back} disabled={save.pending}>
            {c.back}
          </Button>
        )}
        <Button type="submit" form={FORM_ID} loading={save.pending}>
          {c.save}
        </Button>
      </>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={save.pending ? () => {} : onClose}
      dismissible={!save.pending}
      size="lg"
      title={c.addTitle}
      description={c.addDesc}
      closeLabel={t("common.close")}
      footer={footer}
    >
      {providersLoading ? (
        <InlineLoading />
      ) : providersError && providers.length === 0 ? (
        <LoadError error={providersError} onRetry={onRetryProviders} compact />
      ) : providers.length === 0 ? (
        <FormAlert tone="info">{c.providersEmpty}</FormAlert>
      ) : (
        <>
          {!skippedTypeStep && (
            <ol aria-label={c.addSteps} className="mb-5 flex flex-wrap gap-x-4 gap-y-1 text-caption">
              {stepLabels.map((s, i) => (
                <li
                  key={s}
                  aria-current={i === stepIndex ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 font-semibold",
                    i === stepIndex ? "text-accent-text" : i < stepIndex ? "text-text-muted" : "text-text-subtle",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border text-[0.6875rem]",
                      i === stepIndex ? "border-accent-text" : "border-border",
                    )}
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          )}

          {step === "type" && (
            <div className="space-y-4">
              <RadioCardGroup<string>
                legend={c.chooseType}
                name="payout_type"
                value={type}
                onChange={(v) => {
                  setType(v);
                  setLocalErrors({});
                }}
                columns={2}
                error={localErrors.type}
                options={groups.map((g) => ({
                  value: g.type,
                  label: c.types[g.type] ?? c.typeOther,
                  icon: <PayoutTypeIcon type={g.type} />,
                  description: <TypeSummary group={g} c={c} locale={locale} />,
                }))}
              />
              <PayoutNotes c={c} />
            </div>
          )}

          {step === "provider" && group && (
            <RadioCardGroup<string>
              legend={c.chooseProvider}
              name="payout_provider"
              value={providerId}
              onChange={(v) => {
                setProviderId(v);
                setLocalErrors({});
              }}
              columns={2}
              error={localErrors.provider}
              options={group.providers.map((p) => ({
                value: String(p.id),
                label: (
                  <span className="flex flex-wrap items-center gap-2">
                    {p.name}
                    {p.is_sandbox && <SandboxBadge />}
                  </span>
                ),
                icon: <PayoutTypeIcon type={p.type} />,
                description: (
                  <>
                    {c.paidInList(p.currency)} · {c.feeTitle} {providerFee(p, c, locale)}
                    <span className="mt-0.5 block">{providerLimits(p, c, locale)}</span>
                  </>
                ),
              }))}
            />
          )}

          {step === "details" && provider && (
            <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-4">
              <div className="rounded-control border border-border-subtle bg-white/[0.02] p-3.5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/[0.06] text-text-muted [&>svg]:h-4 [&>svg]:w-4"
                  >
                    <PayoutTypeIcon type={provider.type} />
                  </span>
                  <span className="font-semibold text-text">{provider.name}</span>
                  {provider.is_sandbox && <SandboxBadge />}
                </div>
                <DefinitionList
                  items={[
                    { label: c.providerCurrency, value: provider.currency },
                    { label: c.feeTitle, value: providerFee(provider, c, locale) },
                    { label: c.limitsTitle, value: providerLimits(provider, c, locale) },
                    {
                      label: c.dailyLimit,
                      value: formatMinor(provider.daily_limit_minor, provider.currency, locale),
                      hidden: provider.daily_limit_minor == null,
                    },
                    {
                      label: c.monthlyLimit,
                      value: formatMinor(provider.monthly_limit_minor, provider.currency, locale),
                      hidden: provider.monthly_limit_minor == null,
                    },
                    { label: c.processingTitle, value: providerProcessing(provider, c, language) },
                  ]}
                />
                {international && <p className="mt-3 text-caption text-text-muted">{c.intlUsdNote}</p>}
                {provider.is_sandbox && <p className="mt-3 text-caption text-warning">{c.sandboxProvider}</p>}
              </div>

              {fields
                .filter((f) => !isOtherCompanion(f, fields))
                .map((f) => {
                  const otherKey = otherKeyFor(f, fields);
                  const companion = otherKey
                    ? (fields.find((x) => x.key === otherKey) ?? {
                        key: otherKey,
                        label: c.fieldLabels.bank_name_other,
                        type: "text",
                        required: true,
                        max: 120,
                      })
                    : null;
                  return (
                    <div key={f.key} className="space-y-4">
                      <DynamicField
                        field={f}
                        type={provider.type}
                        value={values[f.key] ?? ""}
                        onChange={(v) => setValue(f.key, v)}
                        error={errorFor(f.key)}
                        c={c}
                      />
                      {companion && values[f.key] === OTHER_VALUE && (
                        <DynamicField
                          field={{ ...companion, required: true }}
                          type={provider.type}
                          value={values[companion.key] ?? ""}
                          onChange={(v) => setValue(companion.key, v)}
                          error={errorFor(companion.key)}
                          c={c}
                        />
                      )}
                    </div>
                  );
                })}

              <Field label={c.label} hint={c.labelHint} optional optionalLabel={t("common.optional")} error={fe.label}>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} />
              </Field>

              <Checkbox label={c.makeDefault} checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />

              <Field label={t("pw.label")} hint={c.passwordHint} required error={errorFor("current_password")}>
                <PasswordInput
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showLabel={t("auth.show_pw")}
                  hideLabel={t("auth.hide_pw")}
                />
              </Field>

              {formError && <FormAlert>{formError}</FormAlert>}
              {skippedTypeStep && <PayoutNotes c={c} />}
            </form>
          )}
        </>
      )}
    </Dialog>
  );
}

/** "Paid in TZS · Fee from TZS 500.00 · Processed by 2kTunes finance…" */
function TypeSummary({ group, c, locale }: { group: ProviderGroup; c: WalletCopy; locale: string }) {
  const currencies = [...new Set(group.providers.map((p) => p.currency))].join(" / ");
  // Cheapest fixed fee among the type's providers (same currency only).
  const cheapest = [...group.providers].sort((a, b) => {
    const d = toMinor(a.fee_fixed_minor) - toMinor(b.fee_fixed_minor);
    return d < 0n ? -1 : d > 0n ? 1 : (a.fee_percent_bp ?? 0) - (b.fee_percent_bp ?? 0);
  })[0];
  const free = group.providers.every((p) => toMinor(p.fee_fixed_minor) === 0n && !(p.fee_percent_bp > 0));
  const fee = free ? c.noFee : c.feeFrom(providerFee(cheapest, c, locale));
  const manual = group.providers.some((p) => !/automatic/i.test(p.processing ?? ""));
  return (
    <>
      {c.typeDescs[group.type] ?? group.providers.map((p) => p.name).join(", ")}
      <span className="mt-1.5 flex flex-wrap gap-1.5">
        <Chip>{c.paidInList(currencies)}</Chip>
        <Chip>{fee}</Chip>
      </span>
      <span className="mt-1.5 block text-[0.75rem] text-text-subtle">
        {manual ? c.processingManualShort : c.processingAutoShort}
      </span>
    </>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border-subtle bg-white/[0.04] px-2 py-0.5 text-[0.75rem] font-medium text-text-muted">
      {children}
    </span>
  );
}

function PayoutNotes({ c }: { c: WalletCopy }) {
  return (
    <div className="flex gap-2.5 rounded-control border border-border-subtle bg-white/[0.02] p-3 text-caption text-text-muted">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-subtle" aria-hidden />
      <ul className="space-y-1">
        <li>{c.noCards}</li>
        <li>{c.financeNote}</li>
        <li>{c.intlUsdNote}</li>
      </ul>
    </div>
  );
}

function DynamicField({
  field: f,
  type,
  value,
  onChange,
  error,
  c,
}: {
  field: PayoutField;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  c: WalletCopy;
}) {
  const { t, language } = useLanguage();
  const label = fieldLabel(f, type, c);
  const hint = fieldHint(f, type, c, language);
  const common = {
    label,
    hint,
    error,
    required: f.required,
    optional: !f.required,
    optionalLabel: t("common.optional"),
  };

  if (f.type === "select") {
    return (
      <Field {...common}>
        <Select value={value} onChange={(e) => onChange(e.target.value)} placeholder={c.selectPlaceholder}>
          {(f.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.value === OTHER_VALUE ? c.bankOther : o.label}
            </option>
          ))}
        </Select>
      </Field>
    );
  }
  if (f.type === "country") {
    return (
      <Field {...common}>
        <CountrySelect value={value} onChange={onChange} />
      </Field>
    );
  }
  const isTel = f.type === "tel";
  const isEmail = f.type === "email";
  const upper = f.key === "swift_code";
  return (
    <Field {...common}>
      <Input
        type={isEmail ? "email" : isTel ? "tel" : "text"}
        inputMode={isTel ? "tel" : isEmail ? "email" : undefined}
        autoComplete={f.key === "account_name" ? "name" : isTel ? "tel" : isEmail ? "email" : "off"}
        autoCapitalize={upper ? "characters" : undefined}
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(upper ? e.target.value.toUpperCase() : e.target.value)}
        maxLength={f.max ?? undefined}
      />
    </Field>
  );
}
