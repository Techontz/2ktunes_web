import { useEffect, useState, type FormEvent } from "react";
import { Button, Checkbox, Dialog, Field, Input, PasswordInput, Select } from "@/components/ui";
import { DefinitionList, FormAlert, InlineLoading, LoadError, SandboxBadge, useAction } from "@/features/dashboard/components";
import { errorCodeOf, fieldErrorsOf } from "@/lib/api/errors";
import type { PayoutMethod, PayoutProvider } from "@/lib/api/types";
import { createPayoutMethod } from "@/lib/api/wallet";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { failureOf, providerFee, providerLimits, providerProcessing } from "./helpers";
import { formatMinor } from "@/lib/money";

const FORM_ID = "add-payout-method-form";

type Values = {
  providerId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankBranch: string;
  swift: string;
  label: string;
  isDefault: boolean;
  password: string;
};

const EMPTY: Values = {
  providerId: "",
  accountName: "",
  accountNumber: "",
  bankName: "",
  bankBranch: "",
  swift: "",
  label: "",
  isDefault: false,
  password: "",
};

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
  const [v, setV] = useState<Values>(EMPTY);
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const save = useAction(createPayoutMethod);
  const { reset } = save;

  useEffect(() => {
    if (!open) return;
    setV({ ...EMPTY, providerId: providers.length === 1 ? String(providers[0].id) : "", isDefault: isFirst });
    setLocalErrors({});
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const provider = providers.find((p) => String(p.id) === v.providerId) ?? null;
  const isBank = provider?.type === "bank";
  const set = <K extends keyof Values>(k: K, value: Values[K]) => setV((prev) => ({ ...prev, [k]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<keyof Values, string>> = {};
    if (!provider) errs.providerId = c.providerPlaceholder;
    if (!v.accountName.trim()) errs.accountName = c.fieldRequired;
    if (!v.accountNumber.trim()) errs.accountNumber = c.fieldRequired;
    if (!v.password) errs.password = t("pw.required");
    setLocalErrors(errs);
    if (Object.keys(errs).length || !provider) return;

    const res = await save.run({
      payout_provider_id: provider.id,
      account_name: v.accountName.trim(),
      account_number: v.accountNumber.trim(),
      bank_name: isBank ? v.bankName.trim() || null : null,
      bank_branch: isBank ? v.bankBranch.trim() || null : null,
      swift_code: isBank ? v.swift.trim() || null : null,
      label: v.label.trim() || null,
      is_default: v.isDefault,
      current_password: v.password,
    });
    if (res.ok) {
      onAdded(res.value);
      onClose();
    } else if (errorCodeOf(failureOf(res)) === "password_incorrect") {
      setLocalErrors({ password: t("pw.incorrect") });
      set("password", "");
    }
  };

  const fe = save.fieldErrors;
  const pwIncorrect = errorCodeOf(save.errorObj) === "password_incorrect";
  const hasFieldErrors = Object.keys(fieldErrorsOf(save.errorObj)).length > 0;
  const formError = save.error && !pwIncorrect && !hasFieldErrors ? save.error : hasFieldErrors ? t("err.fix_fields") : null;

  return (
    <Dialog
      open={open}
      onClose={save.pending ? () => {} : onClose}
      dismissible={!save.pending}
      size="lg"
      title={c.addTitle}
      description={c.addDesc}
      closeLabel={t("common.close")}
      footer={
        providers.length > 0 ? (
          <>
            <Button variant="ghost" onClick={onClose} disabled={save.pending}>
              {t("act.cancel")}
            </Button>
            <Button type="submit" form={FORM_ID} loading={save.pending}>
              {c.save}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            {t("act.close")}
          </Button>
        )
      }
    >
      {providersLoading ? (
        <InlineLoading />
      ) : providersError && providers.length === 0 ? (
        <LoadError error={providersError} onRetry={onRetryProviders} compact />
      ) : providers.length === 0 ? (
        <FormAlert tone="info">{c.providersEmpty}</FormAlert>
      ) : (
        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-4">
          <Field label={c.provider} required error={localErrors.providerId ?? fe.payout_provider_id}>
            <Select value={v.providerId} onChange={(e) => set("providerId", e.target.value)} placeholder={c.providerPlaceholder}>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.currency}){p.is_sandbox ? ` — ${t("badge.sandbox")}` : ""}
                </option>
              ))}
            </Select>
          </Field>

          {provider && (
            <div className="rounded-control border border-border-subtle bg-white/[0.02] p-3.5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
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
              {provider.is_sandbox && <p className="mt-3 text-caption text-warning">{c.sandboxProvider}</p>}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={c.accountName} hint={c.accountNameHint} required error={localErrors.accountName ?? fe.account_name}>
              <Input autoComplete="name" value={v.accountName} onChange={(e) => set("accountName", e.target.value)} maxLength={120} />
            </Field>
            <Field
              label={isBank ? c.accountNumber : c.phoneNumber}
              hint={isBank ? undefined : c.phoneHint}
              required
              error={localErrors.accountNumber ?? fe.account_number}
            >
              <Input
                inputMode={isBank ? "text" : "tel"}
                autoComplete={isBank ? "off" : "tel"}
                value={v.accountNumber}
                onChange={(e) => set("accountNumber", e.target.value)}
                maxLength={40}
              />
            </Field>
          </div>

          {isBank && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={c.bankName} optional optionalLabel={t("common.optional")} error={fe.bank_name}>
                <Input value={v.bankName} onChange={(e) => set("bankName", e.target.value)} maxLength={120} />
              </Field>
              <Field label={c.bankBranch} optional optionalLabel={t("common.optional")} error={fe.bank_branch}>
                <Input value={v.bankBranch} onChange={(e) => set("bankBranch", e.target.value)} maxLength={120} />
              </Field>
              <Field label={c.swift} optional optionalLabel={t("common.optional")} error={fe.swift_code}>
                <Input
                  value={v.swift}
                  onChange={(e) => set("swift", e.target.value.toUpperCase())}
                  maxLength={11}
                  autoCapitalize="characters"
                />
              </Field>
            </div>
          )}

          <Field label={c.label} hint={c.labelHint} optional optionalLabel={t("common.optional")} error={fe.label}>
            <Input value={v.label} onChange={(e) => set("label", e.target.value)} maxLength={60} />
          </Field>

          <Checkbox label={c.makeDefault} checked={v.isDefault} onChange={(e) => set("isDefault", e.target.checked)} />

          <Field label={t("pw.label")} hint={c.passwordHint} required error={localErrors.password ?? fe.current_password}>
            <PasswordInput
              autoComplete="current-password"
              value={v.password}
              onChange={(e) => set("password", e.target.value)}
              showLabel={t("auth.show_pw")}
              hideLabel={t("auth.hide_pw")}
            />
          </Field>

          {formError && <FormAlert>{formError}</FormAlert>}
        </form>
      )}
    </Dialog>
  );
}
