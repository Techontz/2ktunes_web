import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, LifeBuoy, Plus } from "lucide-react";
import { Button, DataTable, Dialog, EmptyState, Field, Input, Select, Textarea, useToast } from "@/components/ui";
import {
  FormAlert,
  LoadError,
  PageHeader,
  Pagination,
  StatusPill,
  useAction,
} from "@/features/dashboard/components";
import { createTicket, fetchTickets } from "@/lib/api/account";
import { fetchReleases } from "@/lib/api/catalog";
import type { SupportTicket, TicketCategory } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDateTime, relativeTime } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { AttachmentField } from "./AttachmentField";
import { COPY, TICKET_CATEGORIES } from "./copy";

/**
 * /dashboard/support — ticket list + "New ticket".
 *   ?new=1            opens the form (help articles and closed tickets link here)
 *   ?release=<id>     … with that release preselected
 */
export default function SupportPage() {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(() => params.get("new") === "1" || !!params.get("release"));
  const list = useResource((signal) => fetchTickets(page, { signal }), [page]);

  const close = () => {
    setOpen(false);
    if (params.has("new") || params.has("release")) {
      const next = new URLSearchParams(params);
      next.delete("new");
      next.delete("release");
      setParams(next, { replace: true });
    }
  };

  const tickets = list.data?.tickets ?? [];

  return (
    <div>
      <PageHeader
        title={c.title}
        description={c.description}
        actions={
          <>
            <Button variant="secondary" leftIcon={<BookOpen />} to="/dashboard/help">
              {c.helpLink}
            </Button>
            <Button leftIcon={<Plus />} onClick={() => setOpen(true)}>
              {c.newTicket}
            </Button>
          </>
        }
      />

      {list.error ? (
        <LoadError error={list.error} onRetry={list.reload} />
      ) : (
        <>
          <DataTable<SupportTicket>
            caption={c.ticketsCaption}
            rows={tickets}
            loading={list.loading}
            getRowKey={(t) => t.id}
            onRowClick={(t) => navigate(`/dashboard/support/${t.id}`)}
            empty={
              <EmptyState
                icon={<LifeBuoy />}
                title={c.emptyTitle}
                description={c.emptyBody}
                action={
                  <Button leftIcon={<Plus />} onClick={() => setOpen(true)}>
                    {c.newTicket}
                  </Button>
                }
              />
            }
            columns={[
              {
                key: "subject",
                header: c.colSubject,
                primary: true,
                cell: (t) => <span className="break-words font-semibold text-text">{t.subject}</span>,
              },
              { key: "ref", header: c.colReference, cell: (t) => <span className="font-mono text-body-sm">{t.reference}</span> },
              { key: "category", header: c.colCategory, cell: (t) => c.categories[t.category] ?? t.category },
              { key: "status", header: c.colStatus, cell: (t) => <StatusPill status={t.status} /> },
              {
                key: "activity",
                header: c.colActivity,
                cell: (t) => {
                  const at = t.last_activity_at ?? t.created_at;
                  return (
                    <time dateTime={at} title={formatDateTime(at, locale)}>
                      {relativeTime(at, locale)}
                    </time>
                  );
                },
              },
            ]}
          />
          <Pagination meta={list.data?.meta} onPage={setPage} />
        </>
      )}

      {open && (
        <NewTicketDialog
          initialReleaseId={params.get("release")}
          onClose={close}
          onCreated={(t) => navigate(`/dashboard/support/${t.id}`)}
        />
      )}
    </div>
  );
}

function NewTicketDialog({
  initialReleaseId,
  onClose,
  onCreated,
}: {
  initialReleaseId: string | null;
  onClose: () => void;
  onCreated: (t: SupportTicket) => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { toast } = useToast();
  const releases = useResource((signal) => fetchReleases({ per_page: 100 }, { signal }), []);
  const [category, setCategory] = useState<TicketCategory | "">(initialReleaseId ? "release" : "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [releaseId, setReleaseId] = useState(initialReleaseId ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [local, setLocal] = useState<Record<string, string>>({});

  const create = useAction(() =>
    createTicket({
      category: category as TicketCategory,
      subject: subject.trim(),
      body: body.trim(),
      release_id: releaseId ? Number(releaseId) : null,
      attachment: file,
    }),
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!category) errs.category = c.categoryRequired;
    if (!subject.trim()) errs.subject = c.subjectRequired;
    if (body.trim().length < 10) errs.body = c.bodyShort;
    setLocal(errs);
    if (Object.keys(errs).length) return;
    const res = await create.run();
    if (res.ok) {
      toast({ title: c.created, description: c.createdBody(res.value.reference), tone: "success" });
      onCreated(res.value);
    }
  };

  const err = (k: string) => local[k] ?? create.fieldErrors[k] ?? null;
  const releaseList = releases.data?.releases ?? [];
  const formId = "new-ticket-form";

  return (
    <Dialog
      open
      onClose={create.pending ? () => {} : onClose}
      dismissible={!create.pending}
      size="lg"
      title={c.formTitle}
      description={c.formDescription}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={create.pending}>
            {c.cancel}
          </Button>
          <Button type="submit" form={formId} loading={create.pending}>
            {c.submit}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        {create.error && Object.keys(create.fieldErrors).length === 0 && <FormAlert>{create.error}</FormAlert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.category} error={err("category")} required>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              placeholder={c.categoryPlaceholder}
            >
              {TICKET_CATEGORIES.map((k) => (
                <option key={k} value={k}>
                  {c.categories[k]}
                </option>
              ))}
            </Select>
          </Field>
          {releaseList.length > 0 && (
            <Field label={c.release} error={err("release_id")} optional optionalLabel={t("common.optional")}>
              <Select value={releaseId} onChange={(e) => setReleaseId(e.target.value)}>
                <option value="">{c.releaseNone}</option>
                {releaseList.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {`${r.release_title}${r.version ? ` (${r.version})` : ""} — ${r.artist_name}`}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
        <Field label={c.subject} error={err("subject")} required>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} />
        </Field>
        <Field label={c.body} hint={c.bodyHint} error={err("body")} required>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} maxLength={5000} />
        </Field>
        <AttachmentField
          file={file}
          onChange={setFile}
          serverError={create.fieldErrors.attachment}
          disabled={create.pending}
        />
      </form>
    </Dialog>
  );
}
