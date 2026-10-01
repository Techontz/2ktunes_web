import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Lock, Paperclip } from "lucide-react";
import { Button, Card, Field, Textarea, useToast } from "@/components/ui";
import {
  ConfirmDialog,
  FormAlert,
  LoadError,
  PageHeader,
  PageLoading,
  Section,
  StatusPill,
  useAction,
} from "@/features/dashboard/components";
import { ApiError } from "@/lib/api/client";
import { closeTicket, fetchTicket, replyTicket } from "@/lib/api/account";
import type { SupportTicket, TicketMessage } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate, formatDateTime } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { AttachmentField } from "./AttachmentField";
import { COPY } from "./copy";

export default function TicketDetailPage() {
  const { id = "" } = useParams();
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const { toast } = useToast();
  const res = useResource((signal) => fetchTicket(id, { signal }), [id]);
  const [confirmClose, setConfirmClose] = useState(false);

  const back = { to: "/dashboard/support", label: c.back };

  if (res.loading) return <PageLoading rows={1} />;
  if (res.error || !res.data) {
    const notFound = res.errorObj instanceof ApiError && res.errorObj.status === 404;
    return (
      <div>
        <PageHeader title={c.title} back={back} />
        <LoadError error={notFound ? c.notFound : res.error} onRetry={notFound ? undefined : res.reload} />
      </div>
    );
  }

  const ticket = res.data;
  const isClosed = ticket.status === "closed";
  const merge = (next: SupportTicket) =>
    res.setData((prev) => ({ ...(prev ?? next), ...next, messages: next.messages ?? prev?.messages ?? [] }));

  return (
    <div>
      <PageHeader
        back={back}
        title={ticket.subject}
        meta={<StatusPill status={ticket.status} size="md" />}
        description={[
          c.ticketRef(ticket.reference),
          c.categories[ticket.category] ?? ticket.category,
          c.opened(formatDate(ticket.created_at, locale)),
        ].join(" · ")}
        actions={
          !isClosed ? (
            <Button variant="secondary" onClick={() => setConfirmClose(true)}>
              {c.closeTicket}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <Section id="thread" title={c.threadLabel}>
          {(ticket.messages ?? []).length === 0 ? (
            <p className="text-body-sm text-text-subtle">{c.noMessages}</p>
          ) : (
            <ol className="space-y-3">
              {(ticket.messages ?? []).map((m) => (
                <Message key={m.id} m={m} />
              ))}
            </ol>
          )}
        </Section>

        <div className="lg:sticky lg:top-24">
          {isClosed ? (
            <Card variant="sunken" className="flex gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-text-subtle" aria-hidden />
              <div className="min-w-0">
                <p className="text-body-sm text-text-muted">{c.closedNote}</p>
                <Button to="/dashboard/support?new=1" size="sm" className="mt-3">
                  {c.openNew}
                </Button>
              </div>
            </Card>
          ) : (
            <ReplyForm
              ticketId={ticket.id}
              onSent={(t) => {
                merge(t);
                toast({ title: c.replySent, tone: "success" });
              }}
              onClosedByServer={() => res.reload()}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title={c.closeTitle}
        description={c.closeBody}
        confirmLabel={c.closeTicket}
        onConfirm={async () => {
          const t = await closeTicket(ticket.id);
          merge(t);
          toast({ title: c.closed, tone: "success" });
        }}
      />
    </div>
  );
}

function Message({ m }: { m: TicketMessage }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  return (
    <li
      className={cn(
        "min-w-0 rounded-card border p-4 sm:p-5",
        m.is_staff ? "border-accent/30 bg-accent-soft/60" : "border-border-subtle bg-surface-raised",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className={cn("text-body-sm font-bold", m.is_staff ? "text-accent-text" : "text-text")}>
          {m.is_staff ? c.staff : c.you}
        </p>
        <time dateTime={m.created_at} className="text-caption text-text-subtle">
          {formatDateTime(m.created_at, locale)}
        </time>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-body-sm text-text">{m.body}</p>
      {m.attachment_name && (
        <p className="mt-3 flex min-w-0 items-center gap-2 text-caption text-text-muted">
          <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="sr-only">{c.attached}: </span>
          <span className="min-w-0 break-all">{m.attachment_name}</span>
        </p>
      )}
    </li>
  );
}

function ReplyForm({
  ticketId,
  onSent,
  onClosedByServer,
}: {
  ticketId: number;
  onSent: (t: SupportTicket) => void;
  onClosedByServer: () => void;
}) {
  const c = useCopy(COPY);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [local, setLocal] = useState<string | null>(null);
  const send = useAction(() => replyTicket(ticketId, body.trim(), file));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setLocal(c.replyRequired);
      return;
    }
    setLocal(null);
    const res = await send.run();
    if (res.ok) {
      setBody("");
      setFile(null);
      setFileKey((k) => k + 1);
      onSent(res.value);
    } else if (res.error instanceof ApiError && res.error.code === "ticket_closed") {
      onClosedByServer();
    }
  };

  return (
    <Card as="section" aria-labelledby="reply-title">
      <h2 id="reply-title" className="text-h4 font-bold">
        {c.replyTitle}
      </h2>
      <form onSubmit={submit} noValidate className="mt-4 space-y-4">
        {send.error && !send.fieldErrors.body && !send.fieldErrors.attachment && <FormAlert>{send.error}</FormAlert>}
        <Field label={c.replyLabel} error={local ?? send.fieldErrors.body} required>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={5000} />
        </Field>
        <AttachmentField
          key={fileKey}
          file={file}
          onChange={setFile}
          serverError={send.fieldErrors.attachment}
          disabled={send.pending}
        />
        <Button type="submit" loading={send.pending} fullWidth>
          {c.sendReply}
        </Button>
      </form>
    </Card>
  );
}
