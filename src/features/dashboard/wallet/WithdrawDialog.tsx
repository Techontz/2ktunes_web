import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, Dialog, Field, Input, PasswordInput, Select } from "@/components/ui";
import {
  DefinitionList,
  FormAlert,
  Money,
  SandboxBadge,
  StatusPill,
  useAction,
} from "@/features/dashboard/components";
import { errorCodeOf, fieldErrorsOf } from "@/lib/api/errors";
import type { Balance, PayoutMethod, PayoutProvider, Withdrawal, WithdrawalQuote } from "@/lib/api/types";
import { quoteWithdrawal, requestWithdrawal } from "@/lib/api/wallet";
import { useLanguage } from "@/lib/LanguageContext";
import { formatMinor, minorToDecimal, parseAmount, toMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY } from "./copy";
import { failureOf, providerFee, providerLimits, providerProcessing, withdrawalErrorMessage } from "./helpers";
import { attemptSignature, useWithdrawAttempt } from "./useWithdrawAttempt";
import { methodProvider } from "./payoutMethods";

type Step = "form" | "review" | "confirm" | "done";

/** What was quoted — the confirm step sends exactly this. */
type Quoted = { currency: string; methodId: number; decimal: string; quote: WithdrawalQuote };

const FORM_ID = "withdraw-form";

export function WithdrawDialog({
  open,
  onClose,
  balances,
  methods,
  providers,
  onDone,
  onAddMethod,
}: {
  open: boolean;
  onClose: () => void;
  balances: Balance[];
  methods: PayoutMethod[];
  providers: PayoutProvider[];
  onDone: (w: Withdrawal) => void;
  onAddMethod: () => void;
}) {
  const c = useCopy(COPY);
  const { t, locale, language } = useLanguage();
  const attempt = useWithdrawAttempt();

  const withdrawable = useMemo(() => balances.filter((b) => toMinor(b.available_minor) > 0n), [balances]);

  const [step, setStep] = useState<Step>("form");
  const [currency, setCurrency] = useState("");
  const [methodId, setMethodId] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [methodError, setMethodError] = useState<string | null>(null);
  const [quoted, setQuoted] = useState<Quoted | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [done, setDone] = useState<Withdrawal | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const quote = useAction(quoteWithdrawal);
  const submit = useAction(requestWithdrawal);
  const { reset: resetQuote } = quote;
  const { reset: resetSubmit } = submit;
  const { reset: resetAttempt } = attempt;

  // Fresh flow every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setStep("form");
    setCurrency(withdrawable[0]?.currency ?? "");
    const preferred = methods.find((m) => m.is_default) ?? methods[0];
    setMethodId(preferred ? String(preferred.id) : "");
    setAmount("");
    setAmountError(null);
    setMethodError(null);
    setQuoted(null);
    setPassword("");
    setPasswordError(null);
    setDone(null);
    resetQuote();
    resetSubmit();
    resetAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (step === "confirm") passwordRef.current?.focus();
  }, [step]);

  const balance = withdrawable.find((b) => b.currency === currency) ?? null;
  const method = methods.find((m) => String(m.id) === methodId) ?? null;
  const provider = method ? methodProvider(method, providers) : null;
  const quotedMethod = quoted ? (methods.find((m) => m.id === quoted.methodId) ?? null) : null;
  const quotedProvider = quotedMethod ? methodProvider(quotedMethod, providers) : null;
  const quotedDest = quotedMethod ? quotedMethod.display : "—";

  const close = () => {
    resetAttempt();
    onClose();
  };

  /* ── Step 1 → 2: validate and quote ─────────────────────────────── */
  const onReview = async (e: FormEvent) => {
    e.preventDefault();
    setAmountError(null);
    setMethodError(null);
    if (!balance) return;
    const parsed = parseAmount(amount, currency);
    let bad = false;
    if (!parsed) {
      setAmountError(c.wdAmountInvalid(currency));
      bad = true;
    } else if (parsed.minor <= 0n) {
      setAmountError(c.wdAmountZero);
      bad = true;
    } else if (parsed.minor > toMinor(balance.available_minor)) {
      setAmountError(c.wdAmountTooHigh(formatMinor(balance.available_minor, currency, locale)));
      bad = true;
    }
    if (!method) {
      setMethodError(c.wdChooseMethod);
      bad = true;
    }
    if (bad || !parsed || !method) return;

    const res = await quote.run({ amount: parsed.decimal, currency, payout_method_id: method.id });
    if (res.ok) {
      setQuoted({ currency, methodId: method.id, decimal: parsed.decimal, quote: res.value });
      setStep("review");
    }
  };

  /* ── Step 2 → 3: the attempt (and its idempotency key) starts here ── */
  const onContinue = () => {
    if (!quoted) return;
    attempt.enterConfirm(attemptSignature(quoted.currency, quoted.methodId, quoted.decimal));
    resetSubmit();
    setPassword("");
    setPasswordError(null);
    setStep("confirm");
  };

  /* ── Step 3: submit; retries reuse the same key ─────────────────── */
  const onWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    if (!quoted || !attempt.key) return;
    if (!password) {
      setPasswordError(t("pw.required"));
      passwordRef.current?.focus();
      return;
    }
    setPasswordError(null);
    const res = await submit.run({
      amount: quoted.decimal,
      currency: quoted.currency,
      payout_method_id: quoted.methodId,
      current_password: password,
      idempotency_key: attempt.key,
    });
    if (res.ok) {
      attempt.reset();
      setDone(res.value);
      setStep("done");
      onDone(res.value);
      return;
    }
    if ("ignored" in res && res.ignored) return;
    const err = failureOf(res);
    const fe = fieldErrorsOf(err);
    if (errorCodeOf(err) === "password_incorrect") {
      setPasswordError(t("pw.incorrect"));
      setPassword("");
      passwordRef.current?.focus();
    } else if (fe.current_password) {
      setPasswordError(fe.current_password);
      passwordRef.current?.focus();
    }
  };

  const backToForm = () => {
    resetQuote();
    resetSubmit();
    setStep("form");
  };

  /* ── Errors to show above the actions ───────────────────────────── */
  const quoteError =
    quote.errorObj && !quote.fieldErrors.amount
      ? (withdrawalErrorMessage(quote.errorObj, c) ?? quote.error)
      : null;
  const submitCode = errorCodeOf(submit.errorObj);
  const submitError =
    submit.errorObj && submitCode !== "password_incorrect" && !submit.fieldErrors.current_password
      ? (withdrawalErrorMessage(submit.errorObj, c) ?? submit.error)
      : null;
  // After a transport/server failure the request may or may not have landed;
  // retrying with the same key is safe, and we say so.
  const retryable = !!submit.errorObj && !submitCode;

  const q = quoted?.quote;
  const belowMin = q ? toMinor(q.payout_amount_minor) < toMinor(q.limits.min_minor) : false;
  const aboveMax = q && q.limits.max_minor != null ? toMinor(q.payout_amount_minor) > toMinor(q.limits.max_minor) : false;
  const limitCur = q?.limits.currency ?? "";

  const busy = quote.pending || submit.pending;
  const stepIndex = step === "form" ? 0 : step === "review" ? 1 : 2;

  let footer: ReactNode = null;
  if (step === "form" && withdrawable.length > 0 && methods.length > 0) {
    footer = (
      <>
        <Button variant="ghost" onClick={close} disabled={busy}>
          {t("act.cancel")}
        </Button>
        <Button type="submit" form={FORM_ID} loading={quote.pending}>
          {c.wdReview}
        </Button>
      </>
    );
  } else if (step === "review") {
    footer = (
      <>
        <Button variant="ghost" onClick={backToForm}>
          {c.wdEdit}
        </Button>
        <Button onClick={onContinue} disabled={belowMin || aboveMax}>
          {c.wdContinue}
        </Button>
      </>
    );
  } else if (step === "confirm") {
    footer = (
      <>
        <Button variant="ghost" onClick={backToForm} disabled={submit.pending}>
          {c.wdEdit}
        </Button>
        <Button type="submit" form={FORM_ID} loading={submit.pending}>
          {c.wdSubmit}
        </Button>
      </>
    );
  } else if (step === "done") {
    footer = <Button onClick={close}>{t("act.done")}</Button>;
  }

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : close}
      dismissible={!busy}
      title={step === "done" ? c.wdDoneTitle : c.wdTitle}
      closeLabel={t("common.close")}
      footer={footer}
    >
      {step !== "done" && (
        <ol aria-label={c.wdSteps} className="mb-5 flex flex-wrap gap-x-4 gap-y-1 text-caption">
          {[c.wdStepForm, c.wdStepReview, c.wdStepConfirm].map((label, i) => (
            <li
              key={label}
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
              {label}
            </li>
          ))}
        </ol>
      )}

      {/* ── Details ── */}
      {step === "form" &&
        (withdrawable.length === 0 ? (
          <FormAlert tone="info">{c.nothingToWithdraw}</FormAlert>
        ) : methods.length === 0 ? (
          <div className="space-y-4">
            <FormAlert tone="info">{c.wdNoMethods}</FormAlert>
            <Button onClick={onAddMethod}>{c.wdAddMethod}</Button>
          </div>
        ) : (
          <form id={FORM_ID} onSubmit={onReview} noValidate className="space-y-4">
            <Field label={c.wdCurrency}>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {withdrawable.map((b) => (
                  <option key={b.currency} value={b.currency}>
                    {b.currency} — {formatMinor(b.available_minor, b.currency, locale)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={c.wdMethod} error={methodError}>
              <Select value={methodId} onChange={(e) => setMethodId(e.target.value)} placeholder={c.wdMethodPlaceholder}>
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {[m.label, m.display].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </Select>
            </Field>

            {provider && (
              <div className="rounded-control border border-border-subtle bg-white/[0.02] p-3.5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-text">{provider.name}</span>
                  {provider.is_sandbox && <SandboxBadge />}
                </div>
                <DefinitionList
                  items={[
                    { label: c.feeTitle, value: providerFee(provider, c, locale) },
                    { label: c.limitsTitle, value: providerLimits(provider, c, locale) },
                    { label: c.processingTitle, value: providerProcessing(provider, c, language) },
                  ]}
                />
                {(provider.type === "bank_international" || provider.type === "wallet") && (
                  <p className="mt-3 text-caption text-text-muted">{c.intlUsdNote}</p>
                )}
                {provider.is_sandbox && <p className="mt-3 text-caption text-warning">{c.wdSandbox}</p>}
              </div>
            )}

            <Field
              label={c.wdAmount}
              error={amountError ?? quote.fieldErrors.amount}
              hint={balance ? c.wdAvailable(formatMinor(balance.available_minor, currency, locale)) : undefined}
            >
              <Input
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                leading={<span className="text-caption font-semibold">{currency}</span>}
                className="pl-14"
              />
            </Field>
            {balance && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAmount(minorToDecimal(balance.available_minor, currency))}
              >
                {c.wdUseAll}
              </Button>
            )}

            <div aria-live="polite" className="sr-only">
              {quote.pending ? c.wdQuoting : ""}
            </div>
            {quoteError && <FormAlert>{quoteError}</FormAlert>}
          </form>
        ))}

      {/* ── Review ── */}
      {step === "review" && q && quoted && (
        <div className="space-y-4">
          <DefinitionList
            items={[
              { label: c.wdYouWithdraw, value: <Money minor={q.gross_minor} currency={q.currency} /> },
              { label: c.wdFee, value: <Money minor={q.fee_minor} currency={q.currency} /> },
              { label: c.wdNet, value: <Money minor={q.net_minor} currency={q.currency} /> },
              {
                label: c.wdYouReceive,
                value: (
                  <Money minor={q.payout_amount_minor} currency={q.payout_currency} className="font-semibold text-text" />
                ),
              },
              {
                label: c.wdFx,
                value: q.fx_rate ? c.wdFxValue(q.currency, q.fx_rate, q.payout_currency) : null,
                hidden: !q.fx_rate,
              },
              { label: c.wdMethod, value: quotedDest },
              { label: c.wdMin, value: <Money minor={q.limits.min_minor} currency={limitCur} /> },
              {
                label: c.wdMax,
                value: q.limits.max_minor != null ? <Money minor={q.limits.max_minor} currency={limitCur} /> : c.wdNoMax,
              },
              {
                label: c.wdDaily,
                value: <Money minor={q.limits.daily_limit_minor} currency={limitCur} />,
                hidden: q.limits.daily_limit_minor == null,
              },
              {
                label: c.wdMonthly,
                value: <Money minor={q.limits.monthly_limit_minor} currency={limitCur} />,
                hidden: q.limits.monthly_limit_minor == null,
              },
            ]}
          />
          {belowMin && <FormAlert tone="warning">{c.wdBelowMin(formatMinor(q.limits.min_minor, limitCur, locale))}</FormAlert>}
          {aboveMax && q.limits.max_minor != null && (
            <FormAlert tone="warning">{c.wdAboveMax(formatMinor(q.limits.max_minor, limitCur, locale))}</FormAlert>
          )}
          {quotedProvider?.is_sandbox && (
            <FormAlert tone="warning">
              <span className="mr-2 inline-flex align-middle">
                <SandboxBadge />
              </span>
              {c.wdSandbox}
            </FormAlert>
          )}
        </div>
      )}

      {/* ── Confirm ── */}
      {step === "confirm" && q && quoted && (
        <form id={FORM_ID} onSubmit={onWithdraw} noValidate className="space-y-4">
          <div className="rounded-control border border-border-subtle bg-white/[0.02] p-3.5 text-body-sm text-text">
            <p className="break-words">
              {c.wdConfirmLead(
                formatMinor(q.gross_minor, q.currency, locale),
                quotedDest,
              )}
            </p>
            <p className="mt-1 text-text-muted">
              {c.wdConfirmReceive(formatMinor(q.payout_amount_minor, q.payout_currency, locale))}
            </p>
            {quotedProvider?.is_sandbox && (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-caption text-warning">
                <SandboxBadge />
                {c.wdSandbox}
              </p>
            )}
          </div>
          <Field label={t("pw.label")} hint={c.wdPasswordHint} error={passwordError}>
            <PasswordInput
              ref={passwordRef}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showLabel={t("auth.show_pw")}
              hideLabel={t("auth.hide_pw")}
            />
          </Field>
          <div aria-live="polite" className="sr-only">
            {submit.pending ? c.wdSubmitting : ""}
          </div>
          {submitError && (
            <FormAlert>
              {submitError}
              {retryable && <span className="mt-1 block text-text-muted">{c.wdRetryNote}</span>}
            </FormAlert>
          )}
        </form>
      )}

      {/* ── Done ── */}
      {step === "done" && done && (
        <div className="space-y-4" role="status">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
            <p className="break-words text-text">{c.wdDoneBody(done.reference)}</p>
          </div>
          <DefinitionList
            items={[
              { label: c.colStatus, value: <StatusPill status={done.status} /> },
              { label: c.colAmount, value: <Money minor={done.gross_minor} currency={done.currency} /> },
              { label: c.colReceive, value: <Money minor={done.payout_amount_minor} currency={done.payout_currency} /> },
              { label: c.colDestination, value: done.destination ?? "—" },
            ]}
          />
          {done.is_sandbox && (
            <p className="flex flex-wrap items-center gap-2 text-caption text-warning">
              <SandboxBadge />
              {c.sandboxWithdrawal}
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}
