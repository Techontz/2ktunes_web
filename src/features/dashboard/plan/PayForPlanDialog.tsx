import { useEffect, useState, type FormEvent } from "react";
import { Button, Dialog, Field, Input, Select } from "@/components/ui";
import { CopyButton, FormAlert, useAction } from "@/features/dashboard/components";
import { subscribe } from "@/lib/api/account";
import { errorCodeOf } from "@/lib/api/errors";
import type { PaymentMethodCode, Plan, SubscriptionInfo } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { formatDecimal } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

const FORM_ID = "pay-for-plan-form";

/** `details` is a PHP array: `{}` when set, but `[]` when every value is empty. */
function paymentDetails(info: SubscriptionInfo["payment_instructions"] | undefined): [string, string][] {
  const d = info?.details;
  if (!d || Array.isArray(d) || typeof d !== "object") return [];
  return Object.entries(d).filter(([, v]) => typeof v === "string" && v.trim() !== "");
}

export function PayForPlanDialog({
  plan,
  instructions,
  onClose,
  onSubmitted,
}: {
  plan: Plan | null;
  instructions: SubscriptionInfo["payment_instructions"] | undefined;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const c = useCopy(COPY);
  const { t, locale, language } = useLanguage();
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [errors, setErrors] = useState<{ method?: string; reference?: string }>({});
  const action = useAction(subscribe);
  const { reset } = action;

  const open = !!plan;
  const methods = (instructions?.methods ?? []).filter((m) => !!m);
  const details = paymentDetails(instructions);

  useEffect(() => {
    if (!open) return;
    setMethod(methods.length === 1 ? methods[0] : "");
    setReference("");
    setErrors({});
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan?.id]);

  if (!plan) return null;
  const price = formatDecimal(plan.price, plan.currency || "TZS", locale);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!method) next.method = c.methodRequired;
    if (!reference.trim()) next.reference = c.referenceRequired;
    setErrors(next);
    if (next.method || next.reference) return;

    const res = await action.run({
      plan_id: plan.id,
      payment_method: method as PaymentMethodCode,
      payment_reference: reference.trim(),
    });
    if (res.ok) {
      onSubmitted();
      return;
    }
    if ("error" in res && errorCodeOf(res.error) === "payment_reference_required") {
      setErrors({ reference: c.referenceRequired });
    }
  };

  const fe = action.fieldErrors;
  const code = errorCodeOf(action.errorObj);
  const formError =
    action.error && code !== "payment_reference_required" && !fe.payment_reference && !fe.payment_method ? action.error : null;

  // The API writes the note in English; Swahili and French readers get our translation.
  const note = language !== "EN" || !instructions?.note ? c.payNote : instructions.note;
  const labelFor = (key: string) =>
    c.detailLabels[key] ?? key.replace(/_/g, " ").replace(/^\w/, (m) => m.toUpperCase());

  return (
    <Dialog
      open={open}
      onClose={action.pending ? () => {} : onClose}
      dismissible={!action.pending}
      title={c.payTitle(plan.name)}
      description={c.payDesc(price)}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={action.pending}>
            {t("act.cancel")}
          </Button>
          <Button type="submit" form={FORM_ID} loading={action.pending}>
            {c.submit}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <section aria-labelledby="pay-how" className="space-y-3">
          <h3 id="pay-how" className="text-body font-semibold text-text">
            {c.howToPay}
          </h3>
          <p>{note}</p>
          {details.length > 0 ? (
            <dl className="space-y-2">
              {details.map(([key, value]) => (
                <div
                  key={key}
                  role="group"
                  aria-label={labelFor(key)}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-control border border-border-subtle bg-white/[0.02] px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <dt className="text-caption text-text-subtle">{labelFor(key)}</dt>
                    <dd className="break-all font-mono text-body-sm font-semibold text-text">{value}</dd>
                  </div>
                  <CopyButton value={value} />
                </div>
              ))}
            </dl>
          ) : (
            <FormAlert tone="info">
              <p>{c.noDetails}</p>
              <Button to="/dashboard/support" variant="secondary" size="sm" className="mt-2">
                {c.contactSupport}
              </Button>
            </FormAlert>
          )}
        </section>

        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-4">
          <Field label={c.method} required error={errors.method ?? fe.payment_method}>
            <Select value={method} onChange={(e) => setMethod(e.target.value)} placeholder={c.methodPlaceholder}>
              {methods.map((m) => (
                <option key={m} value={m}>
                  {c.methods[m] ?? m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.reference} hint={c.referenceHint} required error={errors.reference ?? fe.payment_reference}>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={64}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
          </Field>
          {formError && <FormAlert>{formError}</FormAlert>}
        </form>
      </div>
    </Dialog>
  );
}
