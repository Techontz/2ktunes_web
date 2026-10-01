import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Button, Card, Dialog, Field, Input, Select, Textarea, useToast } from "@/components/ui";
import {
  ConfirmDialog,
  DefinitionList,
  FormAlert,
  LoadError,
  Money,
  PageHeader,
  PageLoading,
  Section,
  StatusPill,
  useAction,
} from "@/features/dashboard/components";
import {
  acceptOrder,
  cancelOrder,
  completeOrder,
  declineOrder,
  disputeOrder,
  fetchOrder,
  payOrderFromWallet,
  requestOrderRevision,
  sendOrderMessage,
  submitOrderWork,
  type DisputeReason,
} from "@/lib/api/marketplace";
import type { Order } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { fetchWallet } from "@/lib/api/wallet";
import { formatDate, formatDateTime } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatMinor, toMinor } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { DISPUTE_REASONS, useLabels } from "./labels";

/** Mirrors config/marketplace.php `max_revisions` (not exposed by the API). */
const MAX_REVISIONS = 2;

type Dlg = "pay" | "cancel" | "complete" | "revision" | "dispute" | "accept" | "decline" | "submit" | null;

/** Which actions the API allows for this viewer (see OrderService + OrderStatus). */
export function orderActions(o: Pick<Order, "status" | "role" | "creator" | "revision_count">) {
  const s = o.status;
  const isService = !o.creator;
  if (o.role === "buyer") {
    return {
      pay: s === "pending_payment",
      cancel: s === "pending_payment" || s === "awaiting_creator",
      complete: s === "submitted" && !isService,
      revision: s === "submitted" && !isService && o.revision_count < MAX_REVISIONS,
      dispute: ["accepted", "in_progress", "submitted", "revision_requested"].includes(s),
      accept: false,
      decline: false,
      submit: false,
    };
  }
  return {
    pay: false,
    cancel: false,
    complete: false,
    revision: false,
    dispute: ["accepted", "submitted", "revision_requested"].includes(s),
    accept: s === "awaiting_creator",
    decline: s === "awaiting_creator",
    submit: s === "accepted" || s === "revision_requested",
  };
}

export default function OrderDetailPage() {
  const { id = "" } = useParams();
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const { toast } = useToast();
  const res = useResource((signal) => fetchOrder(id, { signal }), [id]);
  const [dlg, setDlg] = useState<Dlg>(null);
  const back = { to: "/dashboard/orders", label: c.backToOrders };

  if (res.loading) return <PageLoading />;
  if (res.error || !res.data)
    return (
      <div>
        <PageHeader title={c.ordersTitle} back={back} />
        <LoadError error={res.error} onRetry={res.reload} />
      </div>
    );

  const o = res.data;
  const isBuyer = o.role === "buyer";
  const isService = !o.creator;
  const can = orderActions(o);
  const anyAction = Object.values(can).some(Boolean);

  const done = (title: string) => {
    toast({ title, tone: "success" });
    res.reload();
  };

  const counterpart = o.creator ? (
    <Link to={`/dashboard/creators/${encodeURIComponent(o.creator.slug)}`} className="font-semibold text-accent-text hover:underline">
      {o.creator.display_name}
    </Link>
  ) : o.service ? (
    `${o.service.name} · ${c.serviceBy2k}`
  ) : (
    "—"
  );

  return (
    <div>
      <PageHeader
        back={back}
        title={o.title}
        meta={<StatusPill status={o.status} size="md" />}
        description={c.orderRef(o.reference)}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-8">
          <Section title={c.summary} id="summary">
            <Card>
              <DefinitionList
                items={[
                  { label: isService ? c.service : c.creator, value: counterpart },
                  {
                    label: c.release,
                    value: o.release ? `${o.release.title} — ${o.release.artist}` : "—",
                    hidden: !o.release,
                  },
                  { label: c.track, value: o.track?.title ?? "—", hidden: !o.track },
                  { label: c.price, value: <Money minor={o.price_minor} currency={o.currency} /> },
                  {
                    label: c.platformFee,
                    value: <Money minor={o.platform_fee_minor ?? 0} currency={o.currency} />,
                    hidden: isBuyer || o.platform_fee_minor == null,
                  },
                  {
                    label: c.yourPayout,
                    value: <Money minor={o.creator_payout_minor ?? 0} currency={o.currency} className="font-bold" />,
                    hidden: isBuyer || o.creator_payout_minor == null,
                  },
                  {
                    label: c.campaign,
                    value: (
                      <Link to={`/dashboard/promotion/campaigns/${o.campaign_id}`} className="text-accent-text hover:underline">
                        {c.viewCampaign(o.campaign_id)}
                      </Link>
                    ),
                    hidden: !isBuyer,
                  },
                  { label: c.due, value: formatDate(o.due_at, locale), hidden: !o.due_at },
                  { label: c.revisions, value: String(o.revision_count), hidden: isService },
                  { label: c.created, value: formatDateTime(o.created_at, locale) },
                  { label: c.paid, value: formatDateTime(o.paid_at, locale), hidden: !o.paid_at },
                  { label: c.acceptedAt, value: formatDateTime(o.accepted_at, locale), hidden: !o.accepted_at },
                  { label: c.submittedAt, value: formatDateTime(o.submitted_at, locale), hidden: !o.submitted_at },
                  { label: c.completedAt, value: formatDateTime(o.completed_at, locale), hidden: !o.completed_at },
                ]}
              />
            </Card>
          </Section>

          <Section title={c.briefTitle} id="brief">
            <Card>
              <p className="whitespace-pre-line break-words text-body-sm text-text-muted">{o.brief || c.noBrief}</p>
            </Card>
          </Section>

          {(o.submission_url || o.submission_notes) && (
            <Section title={c.submissionTitle} id="submission">
              <Card className="space-y-3">
                {o.submission_url && (
                  <a
                    href={o.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1.5 break-all font-semibold text-accent-text hover:underline"
                  >
                    <span className="sr-only">{c.submissionLink}: </span>
                    {o.submission_url}
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                  </a>
                )}
                {o.submission_notes && (
                  <div>
                    <p className="text-caption font-medium text-text-subtle">{c.submissionNotes}</p>
                    <p className="mt-1 whitespace-pre-line break-words text-body-sm text-text">{o.submission_notes}</p>
                  </div>
                )}
              </Card>
            </Section>
          )}

          {o.disputes && o.disputes.length > 0 && <Disputes order={o} />}

          <Messages order={o} onSent={res.reload} />
        </div>

        <aside className="min-w-0 space-y-4">
          <Card className="lg:sticky lg:top-24">
            <h2 className="text-h4 font-bold text-text">{c.actionsTitle}</h2>
            {anyAction ? (
              <div className="mt-4 flex flex-col gap-2">
                {can.pay && <Button onClick={() => setDlg("pay")}>{c.pay}</Button>}
                {can.accept && <Button onClick={() => setDlg("accept")}>{c.accept}</Button>}
                {can.submit && <Button onClick={() => setDlg("submit")}>{c.submitWork}</Button>}
                {can.complete && <Button onClick={() => setDlg("complete")}>{c.complete}</Button>}
                {can.revision && (
                  <Button variant="secondary" onClick={() => setDlg("revision")}>
                    {c.revision}
                  </Button>
                )}
                {can.decline && (
                  <Button variant="secondary" onClick={() => setDlg("decline")}>
                    {c.decline}
                  </Button>
                )}
                {can.cancel && (
                  <Button variant="secondary" onClick={() => setDlg("cancel")}>
                    {c.cancel}
                  </Button>
                )}
                {can.dispute && (
                  <Button variant="ghost" onClick={() => setDlg("dispute")}>
                    {c.dispute}
                  </Button>
                )}
              </div>
            ) : (
              <p className="mt-2 text-body-sm text-text-subtle">{c.noActions}</p>
            )}
            <p className="mt-5 flex gap-2 border-t border-border-subtle pt-4 text-caption text-text-subtle">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent-text" aria-hidden />
              <span>{isBuyer ? (isService ? c.serviceNote : c.holdingNote) : c.creatorNote}</span>
            </p>
          </Card>
        </aside>
      </div>

      {/* Buyer */}
      <PayDialog
        open={dlg === "pay"}
        order={o}
        onClose={() => setDlg(null)}
        onPaid={() => done(isService ? c.paidServiceToast : c.paidToast)}
      />
      <ConfirmDialog
        open={dlg === "cancel"}
        onClose={() => setDlg(null)}
        title={c.cancelTitle}
        description={o.status === "awaiting_creator" ? c.cancelBodyPaid : c.cancelBodyUnpaid}
        confirmLabel={c.cancel}
        danger
        onConfirm={async () => {
          await cancelOrder(o.id);
          done(c.cancelledToast);
        }}
      />
      <ConfirmDialog
        open={dlg === "complete"}
        onClose={() => setDlg(null)}
        title={c.completeTitle}
        description={c.completeBody}
        confirmLabel={c.complete}
        onConfirm={async () => {
          await completeOrder(o.id);
          done(c.completedToast);
        }}
      />
      <ConfirmDialog
        open={dlg === "revision"}
        onClose={() => setDlg(null)}
        title={c.revisionTitle}
        description={c.revisionBody}
        confirmLabel={c.revision}
        reason={{ label: c.revisionLabel, minLength: 1 }}
        onConfirm={async (note) => {
          await requestOrderRevision(o.id, note);
          done(c.revisionToast);
        }}
      />
      {/* Creator */}
      <ConfirmDialog
        open={dlg === "accept"}
        onClose={() => setDlg(null)}
        title={c.acceptTitle}
        description={c.acceptBody}
        confirmLabel={c.accept}
        onConfirm={async () => {
          await acceptOrder(o.id);
          done(c.acceptedToast);
        }}
      />
      <ConfirmDialog
        open={dlg === "decline"}
        onClose={() => setDlg(null)}
        title={c.declineTitle}
        description={c.declineBody}
        confirmLabel={c.decline}
        danger
        reason={{ label: c.declineReason, minLength: 1 }}
        onConfirm={async (reason) => {
          await declineOrder(o.id, reason.slice(0, 500));
          done(c.declinedToast);
        }}
      />
      <SubmitWorkDialog open={dlg === "submit"} order={o} onClose={() => setDlg(null)} onDone={() => done(c.submittedToast)} />
      {/* Both */}
      <DisputeDialog open={dlg === "dispute"} order={o} onClose={() => setDlg(null)} onDone={() => done(c.disputeToast)} />
    </div>
  );
}

/* ── Pay from wallet ───────────────────────────────────────────────── */

function PayDialog({ open, order, onClose, onPaid }: { open: boolean; order: Order; onClose: () => void; onPaid: () => void }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const wallet = useResource(
    (signal) => (open ? fetchWallet({ signal }) : Promise.resolve(null)),
    [open],
  );
  const balance = wallet.data?.balances.find((b) => b.currency === order.currency) ?? null;
  const available = balance ? toMinor(balance.available_minor) : 0n;
  const short = wallet.data !== null && !wallet.loading && available < toMinor(order.price_minor);

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={c.payTitle}
      confirmLabel={c.pay}
      onConfirm={async () => {
        await payOrderFromWallet(order.id);
        onPaid();
      }}
    >
      <p className="text-body-sm text-text-muted">{c.payBody(formatMinor(order.price_minor, order.currency, locale))}</p>
      <div className="rounded-control border border-border-subtle bg-surface-sunken px-4 py-3">
        <p className="text-caption text-text-subtle">{c.walletBalance}</p>
        {wallet.loading || wallet.data === null ? (
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
            {c.topUpHint}
          </Link>
        </FormAlert>
      )}
    </ConfirmDialog>
  );
}

/* ── Submit work (creator) ─────────────────────────────────────────── */

function SubmitWorkDialog({
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
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const submit = useAction((u: string, n: string) => submitOrderWork(order.id, u, n || null));

  useEffect(() => {
    if (open) {
      setUrl(order.submission_url ?? "");
      setNotes("");
      setUrlError(null);
      submit.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const u = url.trim();
    if (!/^https?:\/\/\S+\.\S+/i.test(u)) {
      setUrlError(c.submitUrlInvalid);
      return;
    }
    setUrlError(null);
    const res = await submit.run(u, notes.trim());
    if (res.ok) {
      onClose();
      onDone();
    }
  };

  const formId = "order-submit-work";
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
          <Button type="submit" form={formId} loading={submit.pending}>
            {c.submitWork}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label={c.submitUrl} hint={c.submitUrlHint} error={urlError ?? submit.fieldErrors.url} required>
          <Input type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={1024} />
        </Field>
        <Field label={c.submitNotes} optional optionalLabel={t("common.optional")} error={submit.fieldErrors.notes}>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} rows={4} />
        </Field>
        {submit.error && !submit.fieldErrors.url && <FormAlert>{submit.error}</FormAlert>}
      </form>
    </Dialog>
  );
}

/* ── Dispute (buyer or creator) ────────────────────────────────────── */

function DisputeDialog({
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
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const [reason, setReason] = useState<DisputeReason | "">("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const act = useAction((r: DisputeReason, d: string) => disputeOrder(order.id, r, d));

  useEffect(() => {
    if (open) {
      setReason("");
      setDetails("");
      setErrors({});
      act.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  const formId = "order-dispute";
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
          <Button type="submit" form={formId} loading={act.pending} variant="danger">
            {c.dispute}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="space-y-4">
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

/* ── Disputes list ─────────────────────────────────────────────────── */

function Disputes({ order }: { order: Order }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  return (
    <Section title={c.disputesTitle} id="disputes">
      <ul className="space-y-3">
        {order.disputes!.map((d) => (
          <li key={d.id}>
            <Card padding="sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-text">{labels.disputeReason(d.reason)}</p>
                <StatusPill status={d.status} />
              </div>
              <p className="mt-1 text-caption text-text-subtle">
                {c.disputeOpened(formatDate(d.created_at, locale))}
                {d.resolved_at && ` · ${c.disputeResolved(formatDate(d.resolved_at, locale))}`}
              </p>
              {(d.resolution || d.resolution_note) && (
                <p className="mt-2 break-words text-body-sm text-text-muted">
                  <span className="font-semibold text-text">{c.resolution}: </span>
                  {d.resolution_note || d.resolution?.replace(/_/g, " ")}
                </p>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ── Message thread ────────────────────────────────────────────────── */

function Messages({ order, onSent }: { order: Order; onSent: () => void }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const { toast } = useToast();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const send = useAction((text: string) => sendOrderMessage(order.id, text));
  const messages = order.messages ?? [];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setError(c.messageRequired);
      return;
    }
    setError(null);
    const res = await send.run(body.trim());
    if (res.ok) {
      setBody("");
      toast({ title: c.messageSent, tone: "success" });
      onSent();
    }
  };

  return (
    <Section title={c.messagesTitle} id="messages">
      <Card>
        {messages.length === 0 ? (
          <p className="text-body-sm text-text-subtle">{c.noMessages}</p>
        ) : (
          <ol className="space-y-3">
            {messages.map((m) =>
              m.is_system ? (
                <li key={m.id} className="flex justify-center">
                  <p className="max-w-full rounded-full bg-white/[0.04] px-3 py-1 text-center text-caption text-text-subtle">
                    <span className="font-semibold">{c.system}:</span> <span className="break-words">{m.body}</span>
                    <span className="sr-only"> · </span>
                    <time dateTime={m.created_at} className="ml-2 whitespace-nowrap opacity-80">
                      {formatDateTime(m.created_at, locale)}
                    </time>
                  </p>
                </li>
              ) : (
                <li key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] min-w-0 rounded-card px-4 py-2.5",
                      m.mine ? "bg-accent-soft text-text" : "border border-border-subtle bg-surface-sunken text-text",
                    )}
                  >
                    <p className="text-caption font-semibold text-text-subtle">
                      {m.mine ? c.you : (m.author ?? "—")}
                      <span aria-hidden> · </span>
                      <time dateTime={m.created_at} className="font-normal">
                        {formatDateTime(m.created_at, locale)}
                      </time>
                    </p>
                    <p className="mt-1 whitespace-pre-line break-words text-body-sm">{m.body}</p>
                  </div>
                </li>
              ),
            )}
          </ol>
        )}

        <form onSubmit={onSubmit} noValidate className="mt-5 space-y-3 border-t border-border-subtle pt-5">
          <Field label={c.messageLabel} error={error ?? send.fieldErrors.body}>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} rows={3} />
          </Field>
          {send.error && !send.fieldErrors.body && <FormAlert>{send.error}</FormAlert>}
          <div className="flex justify-end">
            <Button type="submit" loading={send.pending}>
              {c.send}
            </Button>
          </div>
        </form>
      </Card>
    </Section>
  );
}
