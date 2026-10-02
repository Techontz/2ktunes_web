import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button, Dialog, Field, Input, RadioCardGroup, Select, Textarea } from "@/components/ui";
import { CopyButton, FormAlert, Money, useAction } from "@/features/dashboard/components";
import { fetchSubscription } from "@/lib/api/account";
import {
  disputeOrder,
  payOrder,
  submitOrderWork,
  type DisputeReason,
  type ManualPaymentMethod,
} from "@/lib/api/marketplace";
import type { Order } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { fetchWallet } from "@/lib/api/wallet";
import { useLanguage } from "@/lib/LanguageContext";
import { formatMinor, toMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { DISPUTE_REASONS, useLabels } from "./labels";
import { isHttpUrl } from "./platform";
import { REQ_COPY } from "./requestCopy";

/* ── Countdown ─────────────────────────────────────────────────────── */

/** Whole days/hours until `iso` (negative ms once it has passed). */
export function timeLeft(iso: string | null | undefined, now = Date.now()) {
  const at = iso ? Date.parse(iso) : Number.NaN;
  if (!Number.isFinite(at)) return null;
  const ms = at - now;
  return { ms, days: Math.floor(ms / 86_400_000), hours: Math.floor(ms / 3_600_000) };
}

/** "2 days left" / "5 hours left" chip, warning-toned under a day. */
export function Countdown({ until, className }: { until: string | null | undefined; className?: string }) {
  const c = useCopy(REQ_COPY);
  const left = timeLeft(until);
  if (!left) return null;
  const text =
    left.ms <= 0
      ? c.timeUp
      : left.days >= 1
        ? c.daysLeft(left.days)
        : left.hours >= 1
          ? c.hoursLeft(left.hours)
          : c.lessThanHour;
  const urgent = left.ms < 86_400_000;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.75rem] font-semibold tabular-nums",
        urgent ? "bg-warning-soft text-warning" : "bg-info-soft text-info",
        className,
      )}
    >
      <Clock className="h-3 w-3" aria-hidden />
      {text}
    </span>
  );
}

/* ── Pay (artist): wallet or manual reference ──────────────────────── */

const MANUAL_METHODS: ManualPaymentMethod[] = ["mpesa_tz", "airtel_tz", "mixx_tz", "bank"];

/** `details` is a PHP array: `{}` when set, `[]` when empty. */
function detailsOf(d: unknown): [string, string][] {
  if (!d || Array.isArray(d) || typeof d !== "object") return [];
  return Object.entries(d as Record<string, unknown>).filter(
    (e): e is [string, string] => typeof e[1] === "string" && e[1].trim() !== "",
  );
}

export function PayOrderDialog({
  open,
  order,
  onClose,
  onPaid,
  onManualSent,
}: {
  open: boolean;
  order: Order;
  onClose: () => void;
  onPaid: () => void;
  onManualSent: () => void;
}) {
  const c = useCopy(REQ_COPY);
  const { t, locale } = useLanguage();
  const [mode, setMode] = useState<"wallet" | "manual">("wallet");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pay = useAction((body: Parameters<typeof payOrder>[1]) => payOrder(order.id, body));
  const { reset } = pay;

  const wallet = useResource((signal) => (open ? fetchWallet({ signal }) : Promise.resolve(null)), [open]);
  const sub = useResource(
    (signal) => (open && mode === "manual" ? fetchSubscription({ signal }).catch(() => null) : Promise.resolve(null)),
    [open, mode],
  );

  useEffect(() => {
    if (!open) return;
    setMode("wallet");
    setMethod("");
    setReference("");
    setErrors({});
    reset();
  }, [open, reset]);

  const balance = wallet.data?.balances.find((b) => b.currency === order.currency) ?? null;
  const short = !!wallet.data && (balance ? toMinor(balance.available_minor) : 0n) < toMinor(order.price_minor);
  // Mobile money is TZS only.
  const methods = order.currency === "TZS" ? MANUAL_METHODS : (["bank"] as ManualPaymentMethod[]);
  const details = detailsOf(sub.data?.payment_instructions?.details);
  const amount = formatMinor(order.price_minor, order.currency, locale);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "wallet") {
      const res = await pay.run({ method: "wallet" });
      if (res.ok) {
        onClose();
        onPaid();
      }
      return;
    }
    const errs: Record<string, string> = {};
    if (!method) errs.payment_method = c.methodRequired;
    if (!reference.trim()) errs.payment_reference = c.referenceRequired;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const res = await pay.run({
      method: "manual",
      payment_method: method as ManualPaymentMethod,
      payment_reference: reference.trim(),
    });
    if (res.ok) {
      onClose();
      onManualSent();
    }
  };

  const err = (k: string) => errors[k] ?? pay.fieldErrors[k];
  return (
    <Dialog
      open={open}
      onClose={pay.pending ? () => {} : onClose}
      dismissible={!pay.pending}
      title={c.payTitle}
      description={c.payAmount(amount)}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pay.pending}>
            {t("act.cancel")}
          </Button>
          <Button type="submit" form="pay-order-form" loading={pay.pending} disabled={mode === "wallet" && short}>
            {mode === "wallet" ? c.payFromWallet : c.manualSubmit}
          </Button>
        </>
      }
    >
      <form id="pay-order-form" onSubmit={submit} noValidate className="space-y-4">
        <RadioCardGroup<"wallet" | "manual">
          legend={c.manualMethod}
          name="order-pay-mode"
          value={mode}
          onChange={(v) => {
            setMode(v);
            setErrors({});
            reset();
          }}
          columns={2}
          options={[
            { value: "wallet", label: c.payWallet },
            { value: "manual", label: c.payManual },
          ]}
        />

        {mode === "wallet" ? (
          <>
            <div className="rounded-control border border-border-subtle bg-surface-sunken px-4 py-3">
              <p className="text-caption text-text-subtle">{c.walletBalance}</p>
              {wallet.loading || !wallet.data ? (
                wallet.error ? (
                  <p className="text-body-sm text-danger">{wallet.error}</p>
                ) : (
                  <p className="text-body-sm text-text-subtle">{c.walletLoading}</p>
                )
              ) : balance ? (
                <Money minor={balance.available_minor} currency={balance.currency} className="text-h4 font-bold text-text" />
              ) : (
                <p className="text-body-sm text-text">{c.walletNone(order.currency)}</p>
              )}
            </div>
            {short && (
              <FormAlert tone="warning">
                {c.insufficient}{" "}
                <Link to="/dashboard/wallet" className="font-semibold text-accent-text underline">
                  {c.topUp}
                </Link>
              </FormAlert>
            )}
          </>
        ) : (
          <>
            {details.length > 0 && (
              <section aria-labelledby="order-where-to-pay" className="space-y-2">
                <h3 id="order-where-to-pay" className="text-body-sm font-semibold text-text">
                  {c.whereToPay}
                </h3>
                <dl className="space-y-2">
                  {details.map(([k, v]) => (
                    <div
                      key={k}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border-subtle px-3 py-2"
                    >
                      <div className="min-w-0">
                        <dt className="text-caption text-text-subtle">{k.replace(/_/g, " ")}</dt>
                        <dd className="break-all font-mono text-body-sm font-semibold text-text">{v}</dd>
                      </div>
                      <CopyButton value={v} />
                    </div>
                  ))}
                </dl>
              </section>
            )}
            <Field label={c.manualMethod} error={err("payment_method")} required>
              <Select value={method} onChange={(e) => setMethod(e.target.value)} placeholder={c.manualMethodPick}>
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {c.methods[m] ?? m}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={c.manualReference} hint={c.manualReferenceHint} error={err("payment_reference")} required>
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
        {pay.error && !pay.fieldErrors.payment_method && !pay.fieldErrors.payment_reference && (
          <FormAlert>{pay.error}</FormAlert>
        )}
        <p className="text-caption text-text-subtle">{c.heldNote}</p>
      </form>
    </Dialog>
  );
}

/* ── Submit post links (creator) ───────────────────────────────────── */

export function SubmitLinksDialog({
  open,
  order,
  onClose,
  onDone,
}: {
  open: boolean;
  order: Order;
  onClose: () => void;
  onDone: () => void;
}) {
  const c = useCopy(REQ_COPY);
  const { t } = useLanguage();
  const [urls, setUrls] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const submit = useAction((list: string[], n: string) => submitOrderWork(order.id, list, n || null));
  const { reset } = submit;

  useEffect(() => {
    if (!open) return;
    setUrls(order.submission_urls?.length ? [...order.submission_urls] : [""]);
    setNotes("");
    setErrors({});
    setFormError(null);
    reset();
  }, [open, order.submission_urls, reset]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<number, string> = {};
    urls.forEach((u, i) => {
      if (u.trim() && !isHttpUrl(u)) errs[i] = c.linkInvalid;
    });
    const list = urls.map((u) => u.trim()).filter(Boolean);
    setErrors(errs);
    setFormError(list.length === 0 ? c.linksRequired : null);
    if (Object.keys(errs).length || list.length === 0) return;
    const res = await submit.run(list, notes.trim());
    if (res.ok) {
      onClose();
      onDone();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submit.pending ? () => {} : onClose}
      dismissible={!submit.pending}
      title={c.submitTitle}
      description={c.submitBody}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submit.pending}>
            {t("act.cancel")}
          </Button>
          <Button type="submit" form="submit-links-form" loading={submit.pending}>
            {c.submitLinks}
          </Button>
        </>
      }
    >
      <form id="submit-links-form" onSubmit={onSubmit} noValidate className="space-y-4">
        {order.fix_note && (
          <FormAlert tone="warning">
            <span className="font-semibold">{c.fixTitle}: </span>
            {order.fix_note}
          </FormAlert>
        )}
        {urls.map((u, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field label={c.linkLabel(i + 1)} error={errors[i] ?? submit.fieldErrors[`urls.${i}`]} required={i === 0} className="min-w-0 flex-1">
              <Input
                type="url"
                inputMode="url"
                placeholder="https://"
                value={u}
                onChange={(e) => setUrls((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                maxLength={1024}
              />
            </Field>
            {urls.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-1"
                aria-label={c.removeLink(i + 1)}
                onClick={() => setUrls((prev) => prev.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
        ))}
        {urls.length < 10 && (
          <Button type="button" variant="secondary" size="sm" leftIcon={<Plus />} onClick={() => setUrls((p) => [...p, ""])}>
            {c.addLink}
          </Button>
        )}
        <Field label={c.submitNotes} optional optionalLabel={t("common.optional")} error={submit.fieldErrors.notes}>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} rows={3} />
        </Field>
        {(formError || (submit.error && !submit.fieldErrors.notes)) && <FormAlert>{formError ?? submit.error}</FormAlert>}
      </form>
    </Dialog>
  );
}

/* ── Dispute (artist or creator, while the money is held) ──────────── */

export function DisputeDialog({
  open,
  order,
  onClose,
  onDone,
}: {
  open: boolean;
  order: Order;
  onClose: () => void;
  onDone: () => void;
}) {
  const c = useCopy(REQ_COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const [reason, setReason] = useState<DisputeReason | "">("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const act = useAction((r: DisputeReason, d: string) => disputeOrder(order.id, r, d));
  const { reset } = act;

  useEffect(() => {
    if (!open) return;
    setReason("");
    setDetails("");
    setErrors({});
    reset();
  }, [open, reset]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!reason) errs.reason = c.disputeReasonRequired;
    if (details.trim().length < 20) errs.details = c.disputeDetailsShort;
    setErrors(errs);
    if (Object.keys(errs).length || !reason) return;
    const res = await act.run(reason, details.trim());
    if (res.ok) {
      onClose();
      onDone();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={act.pending ? () => {} : onClose}
      dismissible={!act.pending}
      title={c.disputeTitle}
      description={c.disputeBody}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={act.pending}>
            {t("act.cancel")}
          </Button>
          <Button type="submit" form="order-dispute-form" loading={act.pending} variant="danger">
            {c.dispute}
          </Button>
        </>
      }
    >
      <form id="order-dispute-form" onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label={c.disputeReason} error={errors.reason ?? act.fieldErrors.reason} required>
          <Select value={reason} onChange={(e) => setReason(e.target.value as DisputeReason)} placeholder={c.disputeReason}>
            {DISPUTE_REASONS.map((r) => (
              <option key={r} value={r}>
                {labels.disputeReason(r)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.disputeDetails} hint={c.disputeDetailsHint} error={errors.details ?? act.fieldErrors.details} required>
          <Textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={3000} rows={5} />
        </Field>
        {act.error && !act.fieldErrors.reason && !act.fieldErrors.details && <FormAlert>{act.error}</FormAlert>}
      </form>
    </Dialog>
  );
}
