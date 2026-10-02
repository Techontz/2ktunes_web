import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Headphones, Inbox, Wrench } from "lucide-react";
import { Avatar, Button, Card, EmptyState, useToast } from "@/components/ui";
import { ConfirmDialog, FormAlert, InlineLoading, LoadError, Money } from "@/features/dashboard/components";
import { useLabels } from "@/features/dashboard/marketplace/labels";
import { Countdown, SubmitLinksDialog } from "@/features/dashboard/marketplace/OrderDialogs";
import { REQ_COPY } from "@/features/dashboard/marketplace/requestCopy";
import { OrderStatusPill } from "@/features/dashboard/marketplace/shared";
import { acceptOrder, declineOrder, fetchOrder, fetchOrders } from "@/lib/api/marketplace";
import type { Order } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { WORK_COPY } from "./workCopy";

/**
 * New requests forwarded by 2kTunes: listen, then accept (optional note) or
 * decline (reason) before `respond_by`.
 */
export function IncomingRequests() {
  const w = useCopy(WORK_COPY);
  const r = useCopy(REQ_COPY);
  const { toast } = useToast();
  const res = useResource((signal) => fetchOrders({ as: "creator", status: "forwarded" }, { signal }), []);
  const [accepting, setAccepting] = useState<Order | null>(null);
  const [declining, setDeclining] = useState<Order | null>(null);

  const done = (title: string) => {
    toast({ title, tone: "success" });
    res.reload();
  };

  if (res.error) return <LoadError error={res.error} onRetry={res.reload} />;
  const orders = res.data?.orders ?? [];

  return (
    <div className="space-y-4">
      <p className="max-w-[65ch] text-body-sm text-text-muted">{w.incomingIntro}</p>
      {res.loading ? (
        <InlineLoading />
      ) : orders.length === 0 ? (
        <EmptyState compact icon={<Inbox />} title={w.incomingEmpty} />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {orders.map((o) => (
            <RequestCard key={o.id} order={o}>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setAccepting(o)}>
                  {r.accept}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setDeclining(o)}>
                  {r.decline}
                </Button>
              </div>
            </RequestCard>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!accepting}
        onClose={() => setAccepting(null)}
        title={r.acceptTitle}
        description={r.acceptBody}
        confirmLabel={r.accept}
        reason={{ label: r.acceptNote, hint: r.acceptNoteHint, required: false }}
        onConfirm={async (note) => {
          if (!accepting) return;
          await acceptOrder(accepting.id, note.slice(0, 1000) || null);
          done(r.acceptedToast);
        }}
      />
      <ConfirmDialog
        open={!!declining}
        onClose={() => setDeclining(null)}
        title={r.declineTitle}
        description={r.declineBody}
        confirmLabel={r.decline}
        danger
        reason={{ label: r.declineReason, minLength: 1 }}
        onConfirm={async (reason) => {
          if (!declining) return;
          await declineOrder(declining.id, reason.slice(0, 500));
          done(r.declinedToast);
        }}
      />
    </div>
  );
}

/** Paid or accepted work: submit post links, see fix requests and verification. */
export function ActiveWork() {
  const w = useCopy(WORK_COPY);
  const r = useCopy(REQ_COPY);
  const { locale } = useLanguage();
  const { toast } = useToast();
  const res = useResource(
    (signal) => fetchOrders({ as: "creator", status: "awaiting_payment,in_progress,submitted,disputed" }, { signal }),
    [],
  );
  const [submitting, setSubmitting] = useState<Order | null>(null);

  if (res.error) return <LoadError error={res.error} onRetry={res.reload} />;
  const orders = res.data?.orders ?? [];

  return (
    <div className="space-y-4">
      <p className="max-w-[65ch] text-body-sm text-text-muted">{w.activeIntro}</p>
      {res.loading ? (
        <InlineLoading />
      ) : orders.length === 0 ? (
        <EmptyState compact icon={<Inbox />} title={w.activeEmpty} />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {orders.map((o) => (
            <RequestCard key={o.id} order={o} hideListen={o.status !== "in_progress"}>
              {o.status === "in_progress" && o.fix_note && (
                <FormAlert tone="warning">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Wrench className="h-4 w-4" aria-hidden />
                    {w.fixNote}:
                  </span>{" "}
                  {o.fix_note}
                </FormAlert>
              )}
              {o.status === "in_progress" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => setSubmitting(o)}>
                    {r.submitLinks}
                  </Button>
                  {o.due_at && <span className="text-caption text-text-subtle">{w.due(formatDate(o.due_at, locale))}</span>}
                  {o.due_at && <Countdown until={o.due_at} />}
                </div>
              ) : (
                <p className="text-body-sm text-text-muted">
                  {o.status === "awaiting_payment" ? w.waitingPay : o.status === "submitted" ? w.waitingVerify : w.inDispute}
                </p>
              )}
            </RequestCard>
          ))}
        </ul>
      )}
      {submitting && (
        <SubmitLinksDialog
          open
          order={submitting}
          onClose={() => setSubmitting(null)}
          onDone={() => {
            toast({ title: r.submittedToast, tone: "success" });
            res.reload();
          }}
        />
      )}
    </div>
  );
}

/** One request: song, artist, payout, deadline and an inline "Listen". */
function RequestCard({
  order: o,
  children,
  hideListen,
}: {
  order: Order;
  children?: React.ReactNode;
  hideListen?: boolean;
}) {
  const w = useCopy(WORK_COPY);
  const r = useCopy(REQ_COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const song = o.song;
  const songTitle = [song?.title, song?.artist].filter(Boolean).join(" · ") || o.title;
  const deadline = o.status === "forwarded" ? o.respond_by : null;

  return (
    <li className="min-w-0">
      <Card padding="sm" className="flex h-full flex-col gap-3">
        <div className="flex items-start gap-3">
          <Avatar name={o.artist?.display_name ?? songTitle} size="md" />
          <div className="min-w-0 flex-1">
            <p className="break-words font-bold text-text">{songTitle}</p>
            <p className="text-caption text-text-subtle">
              {o.artist?.display_name ? `${w.from(o.artist.display_name)} · ` : ""}
              {o.package ? `${o.package.title} · ${labels.platform(o.package.platform)}` : o.title}
            </p>
          </div>
          <OrderStatusPill status={o.status} role="creator" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-surface-sunken px-3 py-2">
          <span className="text-caption text-text-subtle">{w.youEarn}</span>
          <Money minor={o.creator_payout_minor ?? o.price_minor} currency={o.currency} className="font-bold text-text" />
        </div>

        {deadline && (
          <p className="flex flex-wrap items-center gap-2 text-caption text-text-subtle">
            {r.respondByCreator(formatDate(deadline, locale))}
            <Countdown until={deadline} />
          </p>
        )}
        {o.preferred_post_date && <p className="text-caption text-text-subtle">{w.postBy(formatDate(o.preferred_post_date, locale))}</p>}
        {o.brief && <p className="line-clamp-3 whitespace-pre-line break-words text-body-sm text-text-muted">{o.brief}</p>}

        {!hideListen && <ListenButton order={o} />}
        {children}
        <Link
          to={`/dashboard/orders/${o.id}`}
          className="mt-auto text-body-sm font-semibold text-accent-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          {w.openRequest}
        </Link>
      </Card>
    </li>
  );
}

/**
 * External songs open their link. Catalog songs need the order detail's
 * short-lived signed `listen_url`, fetched on demand and played inline.
 */
function ListenButton({ order }: { order: Order }) {
  const w = useCopy(WORK_COPY);
  const r = useCopy(REQ_COPY);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "none">("idle");
  const [src, setSrc] = useState<string | null>(null);

  if (order.song?.source === "external" && order.song.url) {
    return (
      <a
        href={order.song.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-body-sm font-semibold text-text hover:border-border-strong"
      >
        <ExternalLink className="h-4 w-4 text-accent-text" aria-hidden />
        {w.openSong}
        <span className="sr-only"> {r.opensNewTab}</span>
      </a>
    );
  }

  if (state === "ready" && src) {
    return <audio controls autoPlay src={src} className="w-full" aria-label={w.listen} />;
  }

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Headphones />}
        loading={state === "loading"}
        className="w-fit"
        onClick={async () => {
          setState("loading");
          try {
            const full = await fetchOrder(order.id);
            const url = full.song?.listen_url ?? null;
            setSrc(url);
            setState(url ? "ready" : "none");
          } catch {
            setState("none");
          }
        }}
      >
        {state === "loading" ? w.loadingAudio : w.listen}
      </Button>
      {state === "none" && <p className="text-caption text-text-subtle">{w.noAudio}</p>}
    </div>
  );
}
