import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Gift, Smartphone, Tag, X, XCircle } from "lucide-react";
import { Button, Dialog, Field, Input } from "@/components/ui";
import { FormAlert, useAction } from "@/features/dashboard/components";
import { OfferBadge } from "@/features/growth/OfferPrice";
import { planPrices, subscribe } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { errorCodeOf, useErrorMessage } from "@/lib/api/errors";
import { validateOffer, type OfferQuote } from "@/lib/api/growth";
import {
  cancelPlanPayment,
  checkoutRedirect,
  COMING_SOON_METHODS,
  detectTzNetwork,
  fetchPlanPayment,
  formatTzPhone,
  normaliseTzPhone,
  TZ_NETWORKS,
  type PayMethodInfo,
  type PayMethodKey,
  type PlanPayment,
} from "@/lib/api/payments";
import type { Plan, SubscriptionInfo } from "@/lib/api/types";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatMoney, isYearly } from "@/lib/api/plans";
import { formatDecimal, formatMinor, minorToDecimal } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { MastercardMark, MobileMoneyMarks, PayPalMark, VisaMark } from "./BrandMarks";
import { COPY, type PlanCopy } from "./copy";
import { CurrencyToggle } from "./CurrencyToggle";

const FORM_ID = "pay-for-plan-form";
const POLL_MS = 3000;
const USER_METHODS: PayMethodKey[] = ["mobile_money", "card", "paypal"];

/**
 * The three ways to pay, in order, for a currency (GET /subscription →
 * payment_instructions.payment_methods). Older APIs send none: all three
 * then show as "Coming soon".
 */
function methodRows(info: SubscriptionInfo["payment_instructions"] | undefined, currency: string): PayMethodInfo[] {
  const rows = (info?.payment_methods?.[currency] ?? []).filter((r) => USER_METHODS.includes(r.key));
  return USER_METHODS.map((k) => {
    const row = rows.find((r) => r.key === k);
    if (row) return row;
    const fallback = COMING_SOON_METHODS.find((r) => r.key === k)!;
    return fallback.currencies.includes(currency) ? fallback : { ...fallback, reason_code: "currency_not_supported" as const };
  });
}

type Stage =
  | { kind: "choose" }
  | { kind: "redirecting" }
  | { kind: "waiting"; payment: PlanPayment; msisdn: string; deadline: number }
  | { kind: "success"; until: string | null }
  | { kind: "failed"; reason: "failed" | "expired" };

/**
 * Buy a plan. Title, the amount (with the TZS | USD toggle and the offer
 * applied through POST /offers/validate), "Have a code?", then the three
 * ways to pay:
 *   - Mobile money (TZS): push to the phone, poll until confirmed;
 *   - Card: Stripe Checkout (redirect);
 *   - PayPal (USD): redirect.
 * A method whose provider is not connected yet reads "Coming soon". A quoted
 * price of 0 activates at once. Manual payments are not offered here.
 */
export function PayForPlanDialog({
  plan,
  instructions,
  currency: currencyProp,
  onCurrencyChange,
  onClose,
  onActivated,
  onPaid,
}: {
  plan: Plan | null;
  instructions: SubscriptionInfo["payment_instructions"] | undefined;
  /** The currency picked on the page; the dialog starts there when the plan is sold in it. */
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  onClose: () => void;
  /** The subscription went active at once (free offer or 100% discount). */
  onActivated?: (plan: Plan) => void;
  /** An automatic payment was confirmed (the dialog stays open on the success screen). */
  onPaid?: (plan: Plan) => void;
}) {
  const c = useCopy(COPY);
  const { t, locale } = useLanguage();
  const toMessage = useErrorMessage();
  const [currency, setCurrency] = useState("");
  const [method, setMethod] = useState<PayMethodKey | "">("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [quote, setQuote] = useState<OfferQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [stage, setStage] = useState<Stage>({ kind: "choose" });
  const action = useAction(subscribe);
  const { reset } = action;

  const open = !!plan;
  const prices = plan ? planPrices(plan) : [];
  const chosen = prices.find((p) => p.currency === currency) ?? prices[0];
  const rows = methodRows(instructions, chosen?.currency ?? "TZS");
  const firstAvailable = (list: PayMethodInfo[]) => list.find((m) => m.available)?.key ?? "";
  const mmRow = rows.find((r) => r.key === "mobile_money");
  const networks = mmRow?.networks?.length ? mmRow.networks : TZ_NETWORKS;

  useEffect(() => {
    if (!open) return;
    const cur = prices.find((p) => p.currency === currencyProp)?.currency ?? prices[0]?.currency ?? "";
    setCurrency(cur);
    setMethod(firstAvailable(methodRows(instructions, cur)));
    setPhone("");
    setPhoneError(null);
    setCodeOpen(false);
    setCode("");
    setApplied("");
    setCodeError(null);
    setQuote(null);
    setStage({ kind: "choose" });
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

  // The error pop-up shows once per failed attempt, until dismissed.
  const [declineShownFor, setDeclineShownFor] = useState<unknown>(null);
  useEffect(() => {
    if (action.errorObj) setDeclineShownFor(action.errorObj);
  }, [action.errorObj]);

  if (!plan || !chosen) return null;
  const q = quote && quote.currency === chosen.currency ? quote : null;
  const isFree = !!q && q.final_minor <= 0;
  const dueText = q ? formatMinor(q.final_minor, q.currency, locale) : formatDecimal(chosen.amount, chosen.currency, locale);
  // Plans are priced per year; the cards lead with this monthly equivalent.
  const dueAmount = q ? Number(minorToDecimal(q.final_minor, q.currency)) : Number(chosen.amount);
  const monthlyText = formatMoney(dueAmount / 12, chosen.currency, locale);
  const shortDue = formatMoney(dueAmount, chosen.currency, locale);
  const selected = rows.find((r) => r.key === method && r.available) ?? null;
  const anyConfigured = rows.some((r) => r.configured !== false && r.reason_code !== "coming_soon");
  const otherCurrency = prices.map((p) => p.currency).find((cur) => cur !== chosen.currency);

  const pickCurrency = (cur: string) => {
    setCurrency(cur);
    onCurrencyChange?.(cur);
    const nextRows = methodRows(instructions, cur);
    setMethod((m) => (nextRows.some((r) => r.key === m && r.available) ? m : firstAvailable(nextRows)));
    setPhoneError(null);
    reset();
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

  const base = { plan_id: plan.id, currency: chosen.currency, ...(applied ? { code: applied } : {}) };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isFree) {
      const res = await action.run(base);
      if (res.ok && res.value.subscription_status === "active") onActivated?.(plan);
      return;
    }
    if (!selected) return;

    if (selected.key === "mobile_money") {
      const msisdn = normaliseTzPhone(phone);
      const err = !msisdn ? c.phoneInvalid : !detectTzNetwork(msisdn, networks) ? c.phoneNetworkUnknown(networks.map((n) => n.label)) : null;
      setPhoneError(err);
      if (!msisdn || err) return;
      const res = await action.run({ ...base, method: "mobile_money", phone: msisdn });
      if (!res.ok) return;
      if (res.value.subscription_status === "active") {
        onActivated?.(plan);
        return;
      }
      if (res.value.payment?.id) {
        const timeout = (mmRow?.approval_timeout_seconds ?? 180) * 1000;
        setStage({ kind: "waiting", payment: res.value.payment as PlanPayment, msisdn, deadline: Date.now() + timeout });
      }
      return;
    }

    // Card (Stripe Checkout) or PayPal: leave for the provider's page.
    const res = await action.run({ ...base, method: selected.key });
    if (!res.ok) return;
    if (res.value.subscription_status === "active") {
      onActivated?.(plan);
      return;
    }
    if (res.value.redirect_url) {
      setStage({ kind: "redirecting" });
      checkoutRedirect.go(res.value.redirect_url);
    }
  };

  const fe = action.fieldErrors;
  const code422 = errorCodeOf(action.errorObj);
  // A refused push (low balance, wrong number, provider error) opens a pop-up
  // over the dialog so the reason is seen at once, wherever the page is scrolled.
  const declineDetails = action.errorObj instanceof ApiError ? action.errorObj.details : null;
  const declineNetwork =
    networks.find((n) => n.key === declineDetails?.network)?.label ?? c.methodLabels.mobile_money ?? "Mobile money";
  const declineReason = typeof declineDetails?.reason === "string" && declineDetails.reason ? declineDetails.reason : null;
  const declineMessage =
    selected?.key === "mobile_money" && code422 && c.declineMessages[code422] ? c.declineMessages[code422](declineNetwork) : null;
  const declineOpen = !!declineMessage && !!action.errorObj && declineShownFor === action.errorObj;
  const formError = action.error && !fe.phone ? (c.payErrors[code422 ?? ""] ?? c.codeErrors[code422 ?? ""] ?? action.error) : null;
  const headline = q?.offer?.headline ?? (q?.referral_applied ? c.referralApplied : null);

  const submitLabel = isFree
    ? c.activateFree
    : selected?.key === "mobile_money"
      ? c.payMobile(dueText)
      : selected?.key === "card"
        ? c.payCard(dueText)
        : selected?.key === "paypal"
          ? c.payPayPal(dueText)
          : c.comingSoon;

  const backToChoose = () => {
    reset();
    setStage({ kind: "choose" });
  };

  /* ── After choosing ─────────────────────────────────────────────── */

  if (stage.kind === "waiting") {
    return (
      <WaitingForPhone
        open={open}
        planName={plan.name}
        stage={stage}
        amountText={formatMinor(stage.payment.amount_minor, stage.payment.currency, locale)}
        c={c}
        closeLabel={t("common.close")}
        onClose={onClose}
        onResult={(next) => {
          setStage(next);
          if (next.kind === "success") onPaid?.(plan);
        }}
        onCancelled={backToChoose}
      />
    );
  }

  if (stage.kind === "success" || stage.kind === "failed") {
    const ok = stage.kind === "success";
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={ok ? c.successTitle : stage.reason === "expired" ? c.payExpiredTitle : c.failedTitle}
        closeLabel={t("common.close")}
        footer={
          ok ? (
            <Button onClick={onClose}>{c.done}</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose}>
                {t("common.close")}
              </Button>
              <Button onClick={backToChoose}>{c.tryAgain}</Button>
            </>
          )
        }
      >
        <div role="status" className="flex flex-col items-center gap-3 py-4 text-center">
          <span
            className={cn(
              "grid h-16 w-16 place-items-center rounded-full",
              ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
            )}
          >
            {ok ? <CheckCircle2 className="h-8 w-8" aria-hidden /> : <XCircle className="h-8 w-8" aria-hidden />}
          </span>
          <p className="max-w-sm text-body text-text">
            {ok
              ? stage.until
                ? c.successBody(plan.name, formatDate(stage.until, locale))
                : c.successBodyNoDate(plan.name)
              : stage.reason === "expired"
                ? c.payExpiredBody
                : c.failedBody}
          </p>
        </div>
      </Dialog>
    );
  }

  /* ── Choosing how to pay ─────────────────────────────────────────── */

  const busy = action.pending || stage.kind === "redirecting";
  const noneAvailable = !isFree && !rows.some((r) => r.available);
  return (
    <>
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      dismissible={!busy}
      title={isFree ? c.activateTitle(plan.name) : c.payTitle(plan.name)}
      description={
        isFree
          ? q?.free_days
            ? c.freeDaysNow(q.free_days)
            : c.freeNow
          : isYearly(plan.duration)
            ? c.paySubtitle(shortDue, plan.name)
            : c.paySubtitlePeriod(shortDue, plan.name)
      }
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {t("act.cancel")}
          </Button>
          <Button type="submit" form={FORM_ID} loading={busy} disabled={(quoting && !!applied && !q) || (!isFree && !selected)}>
            {stage.kind === "redirecting" ? c.redirecting : submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Amount, with the currency switch right next to it. */}
        <section aria-live="polite" className="rounded-[14px] border border-border bg-surface-sunken px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-body-sm font-semibold text-text-muted">{c.amountDue}</span>
            {prices.length > 1 && (
              <CurrencyToggle label={c.currency} value={chosen.currency} options={prices.map((p) => p.currency)} onChange={pickCurrency} size="sm" />
            )}
          </div>
          <p className="mt-2 text-[1.625rem] font-extrabold leading-tight tracking-[-0.02em] tabular-nums text-text" data-testid="amount-due">
            {isFree ? (q?.free_days ? t("offer.free_days", { days: q.free_days }) : t("offer.free")) : dueText}
          </p>
          {q && q.discount_minor > 0 && (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-text-subtle">
              {headline && <OfferBadge>{headline}</OfferBadge>}
              <span>
                <span className="sr-only">{c.listPrice}: </span>
                <s>{formatMinor(q.list_minor, q.currency, locale)}</s>
              </span>
            </p>
          )}
          {!isFree && isYearly(plan.duration) && <p className="mt-1.5 text-caption text-text-subtle">{c.yearCovers(monthlyText)}</p>}
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

        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-3">
          {!isFree && (
            <>
              <MethodList
                rows={rows}
                value={selected?.key ?? ""}
                onChange={(k) => {
                  setMethod(k);
                  setPhoneError(null);
                  reset();
                }}
                switchTarget={(r) => {
                  // A method only sold in another currency of this plan (mobile money in TZS):
                  // tapping it switches the currency and selects it.
                  const cur = r.currencies.find((x) => x !== chosen?.currency && prices.some((p) => p.currency === x));
                  return cur && methodRows(instructions, cur).some((m) => m.key === r.key && m.available) ? cur : null;
                }}
                onSwitch={(k, cur) => {
                  pickCurrency(cur);
                  setMethod(k);
                }}
                c={c}
                detail={(key) =>
                  key === "mobile_money" ? (
                    <Field label={c.phoneLabel} hint={c.phoneHint} required error={phoneError ?? fe.phone}>
                      <PhoneInput value={phone} onChange={setPhone} networks={networks} />
                    </Field>
                  ) : null
                }
              />
              {noneAvailable && (
                <p className="text-body-sm text-text-muted">
                  {anyConfigured && otherCurrency ? c.switchCurrencyNote(otherCurrency) : c.comingSoonNote}
                </p>
              )}
            </>
          )}
          {(declineMessage ?? formError) && <FormAlert>{declineMessage ?? formError}</FormAlert>}
        </form>
      </div>
    </Dialog>
    <Dialog
      open={declineOpen}
      onClose={() => setDeclineShownFor(null)}
      role="alertdialog"
      size="sm"
      title={c.declineTitle}
      closeLabel={t("common.close")}
      footer={<Button onClick={() => setDeclineShownFor(null)}>{c.declineOk}</Button>}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
        <div className="min-w-0 space-y-2">
          <p className="text-body text-text">{declineMessage}</p>
          {declineReason && <p className="text-body-sm text-text-muted">{c.providerSaid(declineNetwork, declineReason)}</p>}
        </div>
      </div>
    </Dialog>
    </>
  );
}

/* ───────────────────────────── Method list ───────────────────────────── */

function marksFor(key: PayMethodKey, networks?: string[]): ReactNode {
  if (key === "mobile_money") return <MobileMoneyMarks only={networks} />;
  if (key === "card")
    return (
      <span className="flex items-center gap-1.5">
        <VisaMark />
        <MastercardMark />
      </span>
    );
  return <PayPalMark />;
}

function MethodList({
  rows,
  value,
  onChange,
  c,
  detail,
  switchTarget,
  onSwitch,
}: {
  rows: PayMethodInfo[];
  value: string;
  onChange: (key: PayMethodKey) => void;
  /** The currency to switch to when this unavailable row is tapped, or null. */
  switchTarget?: (row: PayMethodInfo) => string | null;
  onSwitch?: (key: PayMethodKey, currency: string) => void;
  c: PlanCopy;
  /** Shown right under the selected row (the phone number for mobile money). */
  detail?: (key: PayMethodKey) => ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2.5 text-body-sm font-semibold text-text">{c.methodsTitle}</legend>
      <div className="space-y-2">
        {rows.map((r) => {
          const on = value === r.key;
          const comingSoon = r.reason_code === "coming_soon";
          const wrongCurrency = r.reason_code === "currency_not_supported";
          const target = wrongCurrency ? (switchTarget?.(r) ?? null) : null;
          const selectable = r.available || !!target;
          const note = target ? c.switchToPay(target) : wrongCurrency ? c.availableIn(r.currencies.join(" / ")) : r.key === "card" ? c.poweredByStripe : null;
          const extra = on ? detail?.(r.key) : null;
          return (
            <div key={r.key}>
              <label
                className={cn(
                  "flex items-start gap-3 rounded-[12px] border px-4 py-3.5 transition-colors",
                  on ? "border-accent bg-accent-soft" : "border-border bg-surface",
                  selectable ? "cursor-pointer hover:border-accent/50" : "cursor-not-allowed",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                )}
              >
                <input
                  type="radio"
                  name="pay-method"
                  value={r.key}
                  checked={on}
                  disabled={!selectable}
                  onChange={() => (target ? onSwitch?.(r.key, target) : onChange(r.key))}
                  className="sr-only"
                  aria-describedby={`pay-method-${r.key}-desc`}
                />
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid h-[1.125rem] w-[1.125rem] shrink-0 place-items-center rounded-full border",
                    on ? "border-accent" : selectable ? "border-border-strong" : "border-border",
                  )}
                >
                  {on && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-[0.9375rem] font-semibold", wrongCurrency && !target ? "text-text-muted" : "text-text")}>
                      {c.methodLabels[r.key] ?? r.label}
                    </span>
                    {comingSoon && (
                      <span className="rounded-full border border-border px-2 py-px text-[0.6875rem] font-semibold text-text-muted">
                        {c.comingSoon}
                      </span>
                    )}
                  </span>
                  <span className={cn("mt-2 block", wrongCurrency && !target && "opacity-50 grayscale")}>{marksFor(r.key, r.networks?.map((n) => n.key))}</span>
                  <span id={`pay-method-${r.key}-desc`} className="sr-only">
                    {c.methodSubs[r.key]}
                  </span>
                  {note && <span className="mt-1.5 block text-[0.8125rem] text-text-subtle">{note}</span>}
                </span>
              </label>
              {extra && <div className="px-1 pb-1 pt-3">{extra}</div>}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ───────────────────────────── Phone input ───────────────────────────── */

function PhoneInput({
  value,
  onChange,
  networks,
}: {
  value: string;
  onChange: (v: string) => void;
  networks: { key: string; label: string; prefixes: string[] }[];
}) {
  const network = detectTzNetwork(value, networks);
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="754 123 456"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 16))}
      // "0754123456" or "+255754123456" → "754 123 456" next to the +255 prefix.
      onBlur={() => {
        const n = normaliseTzPhone(value);
        if (n) onChange(`${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`);
      }}
      leading={<span className="text-[0.9375rem] font-semibold text-text-muted">+255</span>}
      className="pl-[3.75rem] tracking-[0.02em]"
      trailing={
        network ? (
          <span data-testid="network" className="mr-2 rounded-full bg-accent-soft px-2.5 py-1 text-[0.75rem] font-bold text-accent-text">
            {network.label}
          </span>
        ) : undefined
      }
    />
  );
}

/* ──────────────────────────── Waiting for PIN ─────────────────────────── */

function WaitingForPhone({
  open,
  planName,
  stage,
  amountText,
  c,
  closeLabel,
  onClose,
  onResult,
  onCancelled,
}: {
  open: boolean;
  planName: string;
  stage: Extract<Stage, { kind: "waiting" }>;
  amountText: string;
  c: PlanCopy;
  closeLabel: string;
  onClose: () => void;
  onResult: (next: Extract<Stage, { kind: "success" | "failed" }>) => void;
  onCancelled: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [cancelling, setCancelling] = useState(false);
  const done = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // Countdown.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Poll every 3 s until the payment settles.
  useEffect(() => {
    let live = true;
    const tick = async () => {
      try {
        const res = await fetchPlanPayment(stage.payment.id);
        if (!live || done.current) return;
        const s = res.payment.status;
        if (s === "confirmed") {
          done.current = true;
          onResultRef.current({ kind: "success", until: res.subscription?.expires_at ?? null });
        } else if (s === "failed" || s === "cancelled" || s === "expired") {
          done.current = true;
          onResultRef.current({ kind: "failed", reason: s === "expired" ? "expired" : "failed" });
        }
      } catch {
        /* a dropped request: try again on the next tick */
      }
    };
    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, [stage.payment.id]);

  const left = Math.max(0, Math.ceil((stage.deadline - now) / 1000));
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  const cancel = async () => {
    setCancelling(true);
    done.current = true;
    try {
      const res = await cancelPlanPayment(stage.payment.id);
      if (res.payment.status === "confirmed") {
        onResult({ kind: "success", until: null });
        return;
      }
    } catch {
      /* nothing was charged without approval; go back either way */
    }
    onCancelled();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={c.checkPhoneTitle}
      closeLabel={closeLabel}
      footer={
        <Button variant="secondary" onClick={() => void cancel()} loading={cancelling}>
          {c.cancelWaiting}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 py-3 text-center">
        <span className="relative grid h-20 w-20 place-items-center">
          <span aria-hidden className="absolute inset-0 rounded-full bg-accent/15 motion-safe:animate-ping motion-safe:[animation-duration:2s]" />
          <span className="relative grid h-20 w-20 place-items-center rounded-full bg-accent-soft text-accent-text">
            <Smartphone className="h-9 w-9" strokeWidth={1.75} aria-hidden />
          </span>
        </span>
        <p className="max-w-sm text-body text-text">{c.checkPhoneBody(amountText, formatTzPhone(stage.msisdn))}</p>
        <p className="text-caption font-semibold uppercase tracking-[0.08em] text-text-subtle">{planName}</p>
        {/* Not a live region: a ticking clock must not be read out every second. */}
        <p className="tabular-nums text-[1.75rem] font-extrabold tracking-[-0.02em] text-text">
          <span className="sr-only">{c.expiresIn(clock)}</span>
          <span aria-hidden>{clock}</span>
        </p>
        <p role="status" className="text-body-sm text-text-muted">
          {c.waiting}
        </p>
      </div>
    </Dialog>
  );
}
