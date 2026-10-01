import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Handshake, Info, Plus, Split } from "lucide-react";
import { Button, Card, DataTable, EmptyState, useToast } from "@/components/ui";
import {
  ConfirmDialog,
  DefinitionList,
  FormAlert,
  LoadError,
  PageHeader,
  PageLoading,
  Section,
  StatusPill,
  useAction,
} from "@/features/dashboard/components";
import { ApiError } from "@/lib/api/client";
import { fetchSplits, respondToShare, respondToShareByToken } from "@/lib/api/catalog";
import type { SplitInvitation, SplitShare, SplitSheet } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatBp } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { NewSplitDialog } from "./NewSplitDialog";

/**
 * /dashboard/splits
 *
 *   ?invite=<token>   answer an emailed invitation (the param is removed after)
 *   ?release=<id>     open the "New split sheet" form with that release chosen
 */
export default function SplitsPage() {
  const c = useCopy(COPY);
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const token = params.get("invite");
  const releaseParam = Number(params.get("release")) || null;
  const [formOpen, setFormOpen] = useState(() => releaseParam !== null);
  const data = useResource((signal) => fetchSplits({ signal }), []);

  const dropParam = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    setParams(next, { replace: true });
  };

  const closeForm = () => {
    setFormOpen(false);
    if (releaseParam) dropParam("release");
  };

  return (
    <div>
      <PageHeader
        title={c.title}
        description={c.description}
        actions={
          <Button leftIcon={<Plus />} onClick={() => setFormOpen(true)}>
            {c.newSheet}
          </Button>
        }
      />

      <div className="space-y-8">
        {token && (
          <InviteBanner
            token={token}
            onDone={(accepted) => {
              toast({ title: accepted ? c.inviteAccepted : c.inviteDeclined, tone: "success" });
              dropParam("invite");
              data.reload();
            }}
            onDismiss={() => dropParam("invite")}
          />
        )}

        <Card variant="outline" padding="sm" className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" aria-hidden />
          <div className="min-w-0">
            <h2 className="text-body-sm font-bold text-text">{c.howTitle}</h2>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-body-sm text-text-muted">
              <li>{c.how1}</li>
              <li>{c.how2}</li>
              <li>{c.how3}</li>
              <li>{c.how4}</li>
            </ul>
          </div>
        </Card>

        {data.loading ? (
          <PageLoading rows={2} />
        ) : data.error || !data.data ? (
          <LoadError error={data.error} onRetry={data.reload} />
        ) : (
          <>
            <Invitations invitations={data.data.invitations} onChanged={data.reload} />
            <MySheets sheets={data.data.sheets} onNew={() => setFormOpen(true)} />
          </>
        )}
      </div>

      {formOpen && (
        <NewSplitDialog
          open
          onClose={closeForm}
          initialReleaseId={releaseParam}
          onCreated={(_sheet, message) => {
            toast({ title: message, tone: "success" });
            closeForm();
            data.reload();
          }}
        />
      )}
    </div>
  );
}

/* ── Emailed invitation (?invite=token) ──────────────────────────────── */

function InviteBanner({
  token,
  onDone,
  onDismiss,
}: {
  token: string;
  onDone: (accepted: boolean) => void;
  onDismiss: () => void;
}) {
  const c = useCopy(COPY);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const respond = useAction((accept: boolean) => respondToShareByToken(token, accept));

  const invalid =
    respond.errorObj instanceof ApiError && (respond.errorObj.status === 404 || respond.errorObj.code === "invite_invalid");

  const answer = async (accept: boolean) => {
    const res = await respond.run(accept);
    if (res.ok) onDone(accept);
  };

  return (
    <Card variant="accent" as="section" aria-labelledby="invite-banner-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accent text-white"
        >
          <Handshake className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="invite-banner-title" className="text-h4 font-bold">
            {c.inviteBannerTitle}
          </h2>
          <p className="mt-1 text-body-sm text-text-muted">{c.inviteBannerBody}</p>
          {respond.error && (
            <FormAlert className="mt-3">{invalid ? c.inviteInvalid : respond.error}</FormAlert>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {respond.error ? (
              <Button variant="secondary" onClick={onDismiss}>
                {c.dismiss}
              </Button>
            ) : (
              <>
                <Button onClick={() => void answer(true)} loading={respond.pending}>
                  {c.accept}
                </Button>
                <Button variant="secondary" onClick={() => setConfirmDecline(true)} disabled={respond.pending}>
                  {c.decline}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDecline}
        onClose={() => setConfirmDecline(false)}
        title={c.declineTitle}
        description={c.declineBody}
        confirmLabel={c.decline}
        danger
        onConfirm={async () => {
          await respondToShareByToken(token, false);
          onDone(false);
        }}
      />
    </Card>
  );
}

/* ── Invitations to me ───────────────────────────────────────────────── */

function Invitations({ invitations, onChanged }: { invitations: SplitInvitation[]; onChanged: () => void }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const { toast } = useToast();
  const [declining, setDeclining] = useState<SplitInvitation | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const accept = useAction((id: number) => respondToShare(id, true));

  const roleLabel = (r: string | null) => (r ? (c.roles[r] ?? r.replace(/_/g, " ")) : "—");

  return (
    <Section id="split-invitations" title={c.invitationsTitle}>
      {accept.error && <FormAlert className="mb-3">{accept.error}</FormAlert>}
      {invitations.length === 0 ? (
        <p className="rounded-card border border-dashed border-border px-5 py-6 text-center text-body-sm text-text-subtle">
          {c.invitationsEmpty}
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {invitations.map((inv) => (
            <li key={inv.id}>
              <Card as="article" className="h-full">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="break-words text-body font-bold text-text">{inv.release.title}</h3>
                    <p className="break-words text-body-sm text-text-muted">
                      {inv.release.artist}
                      {inv.from ? ` · ${c.from(inv.from)}` : ""}
                    </p>
                  </div>
                  <StatusPill status={inv.status} />
                </div>
                <DefinitionList
                  className="mt-4"
                  items={[
                    { label: c.yourShare, value: <span className="font-bold tabular-nums">{formatBp(inv.share_bp, locale)}</span> },
                    { label: c.role, value: roleLabel(inv.role) },
                    { label: c.track, value: inv.track?.title ?? c.wholeRelease },
                    { label: c.effectiveFrom, value: formatDate(inv.effective_from, locale) },
                    { label: c.sheetStatus, value: <StatusPill status={inv.sheet_status} /> },
                  ]}
                />
                {inv.status === "invited" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      loading={accept.pending && acceptingId === inv.id}
                      disabled={accept.pending}
                      onClick={async () => {
                        setAcceptingId(inv.id);
                        const res = await accept.run(inv.id);
                        setAcceptingId(null);
                        if (res.ok) {
                          toast({ title: c.inviteAccepted, tone: "success" });
                          onChanged();
                        }
                      }}
                    >
                      {c.accept}
                    </Button>
                    <Button size="sm" variant="secondary" disabled={accept.pending} onClick={() => setDeclining(inv)}>
                      {c.decline}
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!declining}
        onClose={() => setDeclining(null)}
        title={c.declineTitle}
        description={c.declineBody}
        confirmLabel={c.decline}
        danger
        onConfirm={async () => {
          if (!declining) return;
          await respondToShare(declining.id, false);
          toast({ title: c.inviteDeclined, tone: "success" });
          onChanged();
        }}
      />
    </Section>
  );
}

/* ── My sheets, grouped by release ───────────────────────────────────── */

function MySheets({ sheets, onNew }: { sheets: SplitSheet[]; onNew: () => void }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();

  const groups = new Map<number, { title: string; sheets: SplitSheet[] }>();
  for (const s of sheets) {
    const g = groups.get(s.release.id) ?? { title: s.release.title || c.untitled(s.release.id), sheets: [] };
    g.sheets.push(s);
    groups.set(s.release.id, g);
  }

  const roleLabel = (r: string | null) => (r ? (c.roles[r] ?? r.replace(/_/g, " ")) : "—");

  return (
    <Section id="split-sheets" title={c.mineTitle}>
      {groups.size === 0 ? (
        <EmptyState
          icon={<Split />}
          title={c.mineEmpty}
          description={c.mineEmptyBody}
          action={
            <Button leftIcon={<Plus />} onClick={onNew}>
              {c.newSheet}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([releaseId, g]) => (
            <Card as="article" key={releaseId}>
              <h3 className="break-words text-h4 font-bold">{g.title}</h3>
              <div className="mt-4 space-y-6">
                {g.sheets.map((s) => (
                  <div key={s.id} className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="text-body-sm font-semibold text-text">{c.version(s.version)}</span>
                      <StatusPill status={s.status} />
                      <span className="text-body-sm text-text-muted">{s.track?.title ?? c.wholeRelease}</span>
                      <span className="text-body-sm text-text-subtle">
                        {c.effectiveFrom}: {formatDate(s.effective_from, locale)}
                      </span>
                      {s.activated_at && (
                        <span className="text-body-sm text-text-subtle">{c.activated(formatDate(s.activated_at, locale))}</span>
                      )}
                    </div>
                    <DataTable<SplitShare>
                      caption={c.sharesCaption(g.title)}
                      rows={s.shares}
                      getRowKey={(sh) => sh.id}
                      columns={[
                        { key: "name", header: c.colName, primary: true, cell: (sh) => <span className="break-words">{sh.name}</span> },
                        { key: "email", header: c.colEmail, cell: (sh) => <span className="break-all">{sh.email}</span> },
                        { key: "role", header: c.colRole, cell: (sh) => roleLabel(sh.role) },
                        {
                          key: "share",
                          header: c.colShare,
                          align: "right",
                          cell: (sh) => <span className="font-semibold tabular-nums">{formatBp(sh.share_bp, locale)}</span>,
                        },
                        { key: "status", header: c.colStatus, cell: (sh) => <StatusPill status={sh.status} /> },
                      ]}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
