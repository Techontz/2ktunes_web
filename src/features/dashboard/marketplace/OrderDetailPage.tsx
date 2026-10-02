import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ExternalLink, Headphones, ShieldCheck, ShieldOff } from "lucide-react";
import { Badge, Button, Card, Field, Textarea, useToast } from "@/components/ui";
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
import { acceptOrder, cancelOrder, declineOrder, fetchOrder, sendOrderMessage } from "@/lib/api/marketplace";
import type { Order, OrderStatus } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate, formatDateTime } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { useLabels } from "./labels";
import { Countdown, DisputeDialog, PayOrderDialog, SubmitLinksDialog } from "./OrderDialogs";
import { REQ_COPY } from "./requestCopy";
import { OrderStatusPill } from "./shared";

type Dlg = "pay" | "cancel" | "accept" | "decline" | "submit" | "dispute" | null;

const UNPAID: OrderStatus[] = ["requested", "under_review", "forwarded", "awaiting_payment", "pending_payment"];
const HELD: OrderStatus[] = ["in_progress", "submitted"];

/** The API's `can` block, or the same rules (OrderController::abilities) for older payloads. */
export function orderAbilities(o: Order) {
  const s = o.status;
  const buyer = o.role === "buyer";
  const closed = ["completed", "rejected", "declined", "expired", "cancelled", "refunded"].includes(s);
  const fallback = {
    cancel: buyer && UNPAID.includes(s) && !o.payment?.paid_at,
    pay: buyer && (s === "awaiting_payment" || s === "pending_payment"),
    accept: !buyer && s === "forwarded",
    decline: !buyer && s === "forwarded",
    submit: !buyer && o.kind !== "service" && s === "in_progress",
    dispute: HELD.includes(s),
    message: !closed && (buyer || !!o.forwarded_at),
  };
  return { ...fallback, ...(o.can ?? {}) };
}

export default function OrderDetailPage() {
  const { id = "" } = useParams();
  const c = useCopy(REQ_COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
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
  const isService = o.kind === "service" || (!o.creator && !!o.service);
  const can = orderAbilities(o);
  const manualWaiting = isBuyer && !!o.payment?.manual_reference_submitted && o.status === "awaiting_payment";
  const actions = [can.pay && !manualWaiting, can.accept, can.decline, can.submit, can.cancel, can.dispute].some(Boolean);

  const done = (title: string, description?: string) => {
    toast({ title, description, tone: "success" });
    res.reload();
  };

  const stage = (isBuyer ? c.stageBuyer : c.stageCreator)[o.status] ?? o.status_label ?? "";
  const deadline =
    o.status === "awaiting_payment" && o.pay_by
      ? { text: c.payBy(formatDateTime(o.pay_by, locale)), at: o.pay_by }
      : o.status === "forwarded" && o.respond_by
        ? { text: (isBuyer ? c.respondBy : c.respondByCreator)(formatDateTime(o.respond_by, locale)), at: o.respond_by }
        : o.status === "in_progress" && o.due_at
          ? { text: c.dueBy(formatDateTime(o.due_at, locale)), at: o.due_at }
          : null;

  const song = o.song;
  const listen = song?.listen_url ?? song?.url ?? null;
  const posts = o.submission_urls ?? [];

  return (
    <div>
      <PageHeader back={back} title={o.title} meta={<OrderStatusPill status={o.status} size="md" role={o.role} />} description={c.orderRef(o.reference)} />

      {/* What happens now */}
      <Card variant="accent" className="mb-6 space-y-2" aria-live="polite">
        <p className="font-semibold text-text">{stage}</p>
        {deadline && (
          <p className="flex flex-wrap items-center gap-2 text-body-sm text-text-muted">
            <span>{deadline.text}</span>
            <Countdown until={deadline.at} />
          </p>
        )}
        {manualWaiting && <p className="text-body-sm text-text-muted">{c.manualWaiting}</p>}
        {o.overdue && (
          <p className="flex items-start gap-2 text-body-sm font-semibold text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {c.overdue}
          </p>
        )}
        {!isBuyer && o.status === "in_progress" && o.fix_note && (
          <FormAlert tone="warning">
            <span className="font-semibold">{c.fixTitle}: </span>
            {o.fix_note}
          </FormAlert>
        )}
      </Card>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-8">
          <Section title={c.summary} id="summary">
            <Card>
              <DefinitionList
                items={[
                  {
                    label: isService ? c.service : isBuyer ? c.creator : c.artist,
                    value: isService ? (
                      (o.service?.name ?? "-")
                    ) : isBuyer && o.creator ? (
                      <Link to={`/dashboard/creators/${encodeURIComponent(o.creator.slug)}`} className="font-semibold text-accent-text hover:underline">
                        {o.creator.display_name}
                      </Link>
                    ) : (
                      (o.artist?.display_name ?? song?.artist ?? "-")
                    ),
                  },
                  {
                    label: c.pkg,
                    value: o.package ? `${o.package.title} · ${labels.platform(o.package.platform)}` : "-",
                    hidden: !o.package,
                  },
                  {
                    label: c.song,
                    hidden: !song,
                    value: song ? (
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="break-words">
                          {[song.title, song.artist].filter(Boolean).join(" · ") || "-"}
                          {song.platform && <span className="text-text-subtle"> ({labels.platform(song.platform)})</span>}
                        </span>
                        {listen && (
                          <a
                            href={listen}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-accent-text hover:underline"
                          >
                            <Headphones className="h-4 w-4" aria-hidden />
                            {c.listen}
                            <span className="sr-only"> {c.opensNewTab}</span>
                          </a>
                        )}
                      </span>
                    ) : null,
                  },
                  { label: c.price, value: <Money minor={o.price_minor} currency={o.currency} className="font-semibold" /> },
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
                  { label: c.preferredDate, value: formatDate(o.preferred_post_date, locale), hidden: !o.preferred_post_date },
                  { label: c.created, value: formatDateTime(o.created_at, locale) },
                ]}
              />
            </Card>
          </Section>

          <Section title={c.briefTitle} id="brief">
            <Card className="space-y-4">
              <p className="whitespace-pre-line break-words text-body-sm text-text-muted">{o.brief || c.noBrief}</p>
              {o.creator_note && (
                <div className="border-t border-border-subtle pt-4">
                  <p className="text-caption font-semibold text-text-subtle">{c.creatorNote}</p>
                  <p className="mt-1 whitespace-pre-line break-words text-body-sm text-text">{o.creator_note}</p>
                </div>
              )}
            </Card>
          </Section>

          {(posts.length > 0 || o.submission_notes) && (
            <Section title={c.deliveredTitle} id="delivered">
              <Card className="space-y-3">
                {posts.length > 0 && (
                  <ul className="space-y-2">
                    {posts.map((u, i) => (
                      <li key={u}>
                        <a
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-w-0 items-center gap-2 rounded-control border border-border-subtle px-3 py-2.5 transition-colors hover:border-border-strong"
                        >
                          <span className="shrink-0 font-semibold text-text">{c.postLink(i + 1)}</span>
                          <span className="min-w-0 flex-1 truncate text-body-sm text-accent-text">{u}</span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-text-subtle" aria-hidden />
                          <span className="sr-only">{c.opensNewTab}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {o.submission_notes && (
                  <div>
                    <p className="text-caption font-semibold text-text-subtle">{c.deliveredNotes}</p>
                    <p className="mt-1 whitespace-pre-line break-words text-body-sm text-text">{o.submission_notes}</p>
                  </div>
                )}
              </Card>
            </Section>
          )}

          {o.timeline && o.timeline.length > 0 && <Timeline order={o} />}
          {o.disputes && o.disputes.length > 0 && <Disputes order={o} />}
          <Messages order={o} canSend={can.message} onSent={res.reload} />
        </div>

        {/* Phones: next steps sit right under the status, before the details. */}
        <aside className="order-first min-w-0 space-y-4 lg:order-none">
          <Card className="lg:sticky lg:top-24">
            <h2 className="text-h4 font-bold text-text">{c.nextTitle}</h2>
            {actions ? (
              <div className="mt-4 flex flex-col gap-2">
                {can.pay && !manualWaiting && <Button onClick={() => setDlg("pay")}>{c.payNow}</Button>}
                {can.accept && <Button onClick={() => setDlg("accept")}>{c.accept}</Button>}
                {can.submit && <Button onClick={() => setDlg("submit")}>{c.submitLinks}</Button>}
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
              <span>{isService ? c.serviceNote : isBuyer ? c.heldNote : c.creatorHeldNote}</span>
            </p>
          </Card>
        </aside>
      </div>

      <PayOrderDialog
        open={dlg === "pay"}
        order={o}
        onClose={() => setDlg(null)}
        onPaid={() => done(c.paidToast)}
        onManualSent={() => done(c.manualSentToast, c.manualSentBody)}
      />
      <ConfirmDialog
        open={dlg === "cancel"}
        onClose={() => setDlg(null)}
        title={c.cancelTitle}
        description={c.cancelBody}
        confirmLabel={c.cancel}
        danger
        onConfirm={async () => {
          await cancelOrder(o.id);
          done(c.cancelledToast);
        }}
      />
      <ConfirmDialog
        open={dlg === "accept"}
        onClose={() => setDlg(null)}
        title={c.acceptTitle}
        description={c.acceptBody}
        confirmLabel={c.accept}
        reason={{ label: c.acceptNote, hint: c.acceptNoteHint, required: false }}
        onConfirm={async (note) => {
          await acceptOrder(o.id, note.slice(0, 1000) || null);
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
      <SubmitLinksDialog open={dlg === "submit"} order={o} onClose={() => setDlg(null)} onDone={() => done(c.submittedToast)} />
      <DisputeDialog open={dlg === "dispute"} order={o} onClose={() => setDlg(null)} onDone={() => done(c.disputeToast)} />
    </div>
  );
}

/* ── Timeline (order_events) ───────────────────────────────────────── */

function Timeline({ order }: { order: Order }) {
  const c = useCopy(REQ_COPY);
  const { locale } = useLanguage();
  const events = order.timeline ?? [];
  const actorName = (a: string) => {
    if ((a === "artist" && order.role === "buyer") || (a === "creator" && order.role === "creator")) return c.actor.you;
    return c.actor[a] ?? c.actor.system;
  };
  return (
    <Section title={c.timelineTitle} id="timeline">
      <Card>
        <ol className="relative space-y-5 border-l border-border-subtle pl-5">
          {events.map((e, i) => {
            const last = i === events.length - 1;
            return (
              <li key={`${e.to}-${e.at}-${i}`} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-[1.6875rem] top-1 h-3 w-3 rounded-full border-2 border-surface-raised",
                    last ? "bg-accent" : "bg-border-strong",
                  )}
                />
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-text">{c.status[e.to as OrderStatus] ?? e.label ?? e.to}</span>
                  <span className="text-caption text-text-subtle">
                    {actorName(e.actor)} · <time dateTime={e.at}>{formatDateTime(e.at, locale)}</time>
                  </span>
                </p>
                {/* System notes are English boilerplate; people's notes (reasons, fixes) are shown. */}
                {e.note && e.actor !== "system" && (
                  <p className="mt-1 whitespace-pre-line break-words text-body-sm text-text-muted">{e.note}</p>
                )}
              </li>
            );
          })}
        </ol>
      </Card>
    </Section>
  );
}

/* ── Disputes ──────────────────────────────────────────────────────── */

function Disputes({ order }: { order: Order }) {
  const c = useCopy(REQ_COPY);
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

/* ── Messages (filtered by the server, visible to staff) ───────────── */

function Messages({ order, canSend, onSent }: { order: Order; canSend: boolean; onSent: () => void }) {
  const c = useCopy(REQ_COPY);
  const { locale } = useLanguage();
  const { toast } = useToast();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const send = useAction((text: string) => sendOrderMessage(order.id, text));
  const messages = order.messages ?? [];

  const authorName = (a: string | null | undefined) =>
    a === "artist" ? c.actor.artist : a === "creator" ? c.actor.creator : (a ?? c.actor.staff);

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
      toast({ title: res.value.message?.was_redacted ? c.messageSentRedacted : c.messageSent, tone: "success" });
      onSent();
    }
  };

  return (
    <Section title={c.messagesTitle} id="messages">
      <Card>
        <p className="mb-4 flex gap-2 rounded-control bg-surface-sunken px-3 py-2 text-caption text-text-muted">
          <ShieldOff className="mt-px h-4 w-4 shrink-0 text-accent-text" aria-hidden />
          <span>{c.contactRemovedNote}</span>
        </p>
        {messages.length === 0 ? (
          <p className="text-body-sm text-text-subtle">{c.noMessages}</p>
        ) : (
          <ol className="space-y-3">
            {messages.map((m) =>
              m.is_system ? (
                <li key={m.id} className="flex justify-center">
                  <p className="max-w-full rounded-full bg-tint/[0.05] px-3 py-1 text-center text-caption text-text-subtle">
                    <span className="font-semibold">2kTunes:</span> <span className="break-words">{m.body}</span>
                  </p>
                </li>
              ) : (
                <li key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "min-w-0 max-w-[85%] rounded-card px-4 py-2.5",
                      m.mine ? "bg-accent-soft text-text" : "border border-border-subtle bg-surface-sunken text-text",
                    )}
                  >
                    <p className="flex flex-wrap items-center gap-x-1.5 text-caption font-semibold text-text-subtle">
                      {m.mine ? c.actor.you : authorName(m.author)}
                      <span aria-hidden>·</span>
                      <time dateTime={m.created_at} className="font-normal">
                        {formatDateTime(m.created_at, locale)}
                      </time>
                    </p>
                    <p className="mt-1 whitespace-pre-line break-words text-body-sm">{m.body}</p>
                    {m.was_redacted && (
                      <Badge tone="warning" size="sm" className="mt-1.5">
                        <ShieldOff className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
                        {c.redacted}
                      </Badge>
                    )}
                  </div>
                </li>
              ),
            )}
          </ol>
        )}

        {canSend && (
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
        )}
      </Card>
    </Section>
  );
}
