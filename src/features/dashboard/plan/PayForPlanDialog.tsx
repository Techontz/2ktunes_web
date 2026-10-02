import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Gift, Tag, X } from "lucide-react";
import { Button, Dialog, Field, Input, RadioCardGroup, Select } from "@/components/ui";
import { CopyButton, FormAlert, useAction } from "@/features/dashboard/components";
import { OfferBadge } from "@/features/growth/OfferPrice";
import { planPrices, subscribe } from "@/lib/api/account";
import { errorCodeOf, useErrorMessage } from "@/lib/api/errors";
import { validateOffer, type OfferQuote } from "@/lib/api/growth";
import type { PaymentMethodCode, Plan, SubscriptionInfo } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { formatDecimal, formatMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

const FORM_ID = "pay-for-plan-form";

/** `details` is a PHP array: `{}` when set, but `[]` when every value is empty. */
function paymentDetails(info: SubscriptionInfo["payment_instructions"] | undefined): [string, string][] {
  const d = info?.details;
  if (!d || Array.isArray(d) || typeof d !== "object") return [];
  return Object.entries(d).filter(([, v]) => typeof v === "string" && v.trim() !== "");
}

/**
 * Buy a plan. The exact price comes from POST /offers/validate (automatic
 * offers, the invited-friend price and an optional promo code; offers never
 * stack). A quoted price of 0 activates at once (200 active, no payment
 * step); otherwise the artist pays the discounted amount and enters the
 * reference for Finance (202 pending_payment).
 */
export function PayForPlanDialog({
  plan,
  instructions,
  onClose,
  onSubmitted,
  onActivated,
}: {
  plan: Plan | null;
  instructions: SubscriptionInfo["payment_instructions"] | undefined;
  onClose: () => void;
  onSubmitted: () => void;
  /** The subscription went active at once (free offer or 100% discount). */
  onActivated?: (plan: Plan) => void;
}) {
  const c = useCopy(COPY);
  const { t, locale, language } = useLanguage();
  const toMessage = useErrorMessage();
  const [currency, setCurrency] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [errors, setErrors] = useState<{ method?: string; reference?: string }>({});
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [quote, setQuote] = useState<OfferQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const action = useAction(subscribe);
  const { reset } = action;

  const open = !!plan;
  const prices = plan ? planPrices(plan) : [];
  const chosen = prices.find((p) => p.currency === currency) ?? prices[0];
  const allMethods = (instructions?.methods ?? []).filter((m) => !!m);
  // Older APIs don't send methods_by_currency: assume mobile money is TZS only.
  const methodsFor = (cur: string | undefined) => {
    const allowed = instructions?.methods_by_currency?.[cur ?? ""];
    if (allowed) return allMethods.filter((m) => allowed.includes(m));
    return cur && cur !== "TZS" ? allMethods.filter((m) => m === "bank" || m === "card") : allMethods;
  };
  const methods = methodsFor(chosen?.currency);
  const details = paymentDetails(instructions);

  useEffect(() => {
    if (!open) return;
    const first = prices[0]?.currency ?? "";
    const firstMethods = methodsFor(first);
    setCurrency(first);
    setMethod(firstMethods.length === 1 ? firstMethods[0] : "");
    setReference("");
    setErrors({});
    setCodeOpen(false);
    setCode("");
    setApplied("");
    setCodeError(null);
    setQuote(null);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan?.id]);

  // My exact price in the chosen currency (with the applied code, if any).
  useEffect(() => {
    if (!plan || !chosen) return;
    let live = true;
    setQuoting(true);
    validateOffer({ plan_id: plan.id, currency: chosen.currency, code: applied || undefined })
      .then((q) => live && setQuote(q))
      .catch((err) => {
        if (!live) return;
        if (applied) {
          // The code stopped working (e.g. currency switch): drop it and show why.
          setCodeError(c.codeErrors[errorCodeOf(err) ?? ""] ?? toMessage(err));
          setApplied("");
        } else {
          setQuote(null); // fall back to the list price
        }
      })
      .finally(() => live && setQuoting(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id, chosen?.currency, applied]);

  if (!plan || !chosen) return null;
  const q = quote && quote.currency === chosen.currency ? quote : null;
  const isFree = !!q && q.final_minor <= 0;
  const dueText = q ? formatMinor(q.final_minor, q.currency, locale) : formatDecimal(chosen.amount, chosen.currency, locale);

  const pickCurrency = (cur: string) => {
    setCurrency(cur);
    const next = methodsFor(cur);
    setMethod((m) => (next.includes(m) ? m : next.length === 1 ? next[0] : ""));
  };

  const applyCode = async () => {
    const value = code.trim();
    if (!value) {
      setCodeError(c.codeRequired);
      return;
    }
    setCodeError(null);
    setQuoting(true);
    try {
      const res = await validateOffer({ plan_id: plan.id, currency: chosen.currency, code: value });
      setQuote(res);
      setApplied(value);
    } catch (err) {
      setCodeError(c.codeErrors[errorCodeOf(err) ?? ""] ?? toMessage(err));
    } finally {
      setQuoting(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isFree) {
      const res = await action.run({ plan_id: plan.id, currency: chosen.currency, ...(applied ? { code: applied } : {}) });
      if (res.ok) {
        if (res.value.subscription_status === "active") onActivated?.(plan);
        else onSubmitted();
      }
      return;
    }
    const next: typeof errors = {};
    if (!method) next.method = c.methodRequired;
    if (!reference.trim()) next.reference = c.referenceRequired;
    setErrors(next);
    if (next.method || next.reference) return;

    const res = await action.run({
      plan_id: plan.id,
      currency: chosen.currency,
      ...(applied ? { code: applied } : {}),
      payment_method: method as PaymentMethodCode,
      payment_reference: reference.trim(),
    });
    if (res.ok) {
      if (res.value.subscription_status === "active") onActivated?.(plan);
      else onSubmitted();
      return;
    }
    if ("error" in res && errorCodeOf(res.error) === "payment_reference_required") {
      setErrors({ reference: c.referenceRequired });
    }
  };

  const fe = action.fieldErrors;
  const code422 = errorCodeOf(action.errorObj);
  const formError =
    action.error && code422 !== "payment_reference_required" && !fe.payment_reference && !fe.payment_method
      ? (c.codeErrors[code422 ?? ""] ?? action.error)
      : null;

  // The API writes the note in English; Swahili and French readers get our translation.
  const note = language !== "EN" || !instructions?.note ? c.payNote : instructions.note;
  const labelFor = (key: string) =>
    c.detailLabels[key] ?? key.replace(/_/g, " ").replace(/^\w/, (m) => m.toUpperCase());
  const headline = q?.offer?.headline ?? (q?.referral_applied ? c.referralApplied : null);

  return (
    <Dialog
      open={open}
      onClose={action.pending ? () => {} : onClose}
      dismissible={!action.pending}
      title={isFree ? c.activateTitle(plan.name) : c.payTitle(plan.name)}
      description={isFree ? (q?.free_days ? c.freeDaysNow(q.free_days) : c.freeNow) : c.payDesc(dueText)}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={action.pending}>
            {t("act.cancel")}
          </Button>
          <Button type="submit" form={FORM_ID} loading={action.pending} disabled={quoting && !!applied && !q}>
            {isFree ? c.activateFree : c.submit}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Price summary */}
        <section aria-live="polite" className="rounded-card border border-border-subtle bg-surface-sunken px-4 py-3">
          {headline && q && q.discount_minor > 0 && <OfferBadge className="mb-2">{headline}</OfferBadge>}
          <dl className="space-y-1 text-body-sm">
            {q && q.discount_minor > 0 && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-text-muted">{c.listPrice}</dt>
                <dd className="tabular-nums text-text-muted">
                  <s>{formatMinor(q.list_minor, q.currency, locale)}</s>
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-semibold text-text">{c.amountDue}</dt>
              <dd className="text-h4 font-extrabold tabular-nums text-text" data-testid="amount-due">
                {isFree ? (q?.free_days ? t("offer.free_days", { days: q.free_days }) : t("offer.free")) : dueText}
              </dd>
            </div>
          </dl>
          {quoting && <p className="mt-1 text-caption text-text-subtle">{c.quoteLoading}</p>}
        </section>

        {/* Promo code */}
        <section className="space-y-2">
          {applied ? (
            <p className="flex flex-wrap items-center gap-2 text-body-sm font-semibold text-success">
              <Tag className="h-4 w-4" aria-hidden />
              {c.codeApplied(q?.offer?.headline ?? applied.toUpperCase())}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<X />}
                onClick={() => {
                  setApplied("");
                  setCode("");
                }}
              >
                {c.codeRemove}
              </Button>
            </p>
          ) : (
            <>
              <button
                type="button"
                aria-expanded={codeOpen}
                aria-controls="promo-code-panel"
                onClick={() => setCodeOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-[6px] text-body-sm font-semibold text-accent-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
              >
                <Gift className="h-4 w-4" aria-hidden />
                {c.codeToggle}
                <ChevronDown className={codeOpen ? "h-4 w-4 rotate-180 transition-transform" : "h-4 w-4 transition-transform"} aria-hidden />
              </button>
              {codeOpen && (
                <div id="promo-code-panel" className="flex items-start gap-2">
                  <Field label={c.codeLabel} error={codeError} className="min-w-0 flex-1">
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void applyCode();
                        }
                      }}
                      maxLength={40}
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                    />
                  </Field>
                  <Button type="button" variant="secondary" className="mt-[1.625rem]" onClick={() => void applyCode()} loading={quoting && !!code.trim()}>
                    {c.codeApply}
                  </Button>
                </div>
              )}
            </>
          )}
          {!applied && !codeOpen && codeError && (
            <p role="alert" className="text-body-sm font-medium text-danger">
              {codeError}
            </p>
          )}
          {(codeOpen || applied) && <p className="text-caption text-text-subtle">{c.codeNoStack}</p>}
        </section>

        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-4">
          {prices.length > 1 && (
            <RadioCardGroup
              legend={c.currency}
              name="plan-currency"
              value={chosen.currency}
              onChange={pickCurrency}
              columns={2}
              options={prices.map((p) => ({
                value: p.currency,
                label: formatDecimal(p.amount, p.currency, locale),
                description: methodsFor(p.currency).some((m) => m.endsWith("_tz")) ? c.currencyMobileMoney : c.currencyBankOnly,
              }))}
            />
          )}
          {!isFree && (
            <>
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
            </>
          )}
          {formError && <FormAlert>{formError}</FormAlert>}
        </form>
      </div>
    </Dialog>
  );
}
