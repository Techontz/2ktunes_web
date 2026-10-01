import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellOff, CheckCheck, ChevronRight } from "lucide-react";
import { Badge, Button, Card, Checkbox, EmptyState, Skeleton, useToast } from "@/components/ui";
import {
  FormAlert,
  LoadError,
  PageHeader,
  Pagination,
  Section,
  useAction,
} from "@/features/dashboard/components";
import { useUnread } from "@/features/dashboard/shell/UnreadContext";
import {
  fetchNotificationPreferences,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationPreferences,
} from "@/lib/api/account";
import type { AppNotification, NotificationPreferences } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDateTime, relativeTime } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY } from "./copy";

/** Only same-origin app paths are followed from a notification. */
function internalPath(path: string | null): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
  return path;
}

export default function NotificationsPage() {
  const c = useCopy(COPY);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setUnread } = useUnread();
  const [page, setPage] = useState(1);
  const list = useResource((signal) => fetchNotifications(page, { signal }), [page]);

  // Keep the bell in step with what this page just loaded.
  useEffect(() => {
    if (list.data) setUnread(list.data.unread);
  }, [list.data, setUnread]);

  const markOne = useAction((id: string) => markNotificationRead(id));
  const markAll = useAction(() => markAllNotificationsRead());

  const applyRead = (id: string) => {
    list.setData((prev) => {
      if (!prev) return prev;
      const target = prev.notifications.find((n) => n.id === id);
      if (!target || target.read_at) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read_at: now } : n)),
      };
    });
  };

  const onMarkOne = async (n: AppNotification) => {
    const res = await markOne.run(n.id);
    if (res.ok) applyRead(n.id);
  };

  const onOpen = async (n: AppNotification) => {
    const path = internalPath(n.action_path);
    if (!n.read_at) {
      // Mark first so the bell is right when the next page renders; a failure
      // here must not stop the person getting where they wanted to go.
      const res = await markOne.run(n.id);
      if (res.ok) {
        applyRead(n.id);
        setUnread(Math.max(0, (list.data?.unread ?? 1) - 1));
      }
    }
    if (path) navigate(path);
  };

  const onMarkAll = async () => {
    const res = await markAll.run();
    if (!res.ok) return;
    const now = new Date().toISOString();
    list.setData((prev) =>
      prev
        ? { ...prev, unread: 0, notifications: prev.notifications.map((n) => (n.read_at ? n : { ...n, read_at: now })) }
        : prev,
    );
    toast({ title: c.markedAll, tone: "success" });
  };

  const unread = list.data?.unread ?? 0;

  return (
    <div>
      <PageHeader
        title={c.title}
        description={c.description}
        meta={unread > 0 ? <Badge tone="accent">{c.unreadCount(unread)}</Badge> : undefined}
        actions={
          unread > 0 ? (
            <Button variant="secondary" leftIcon={<CheckCheck />} onClick={onMarkAll} loading={markAll.pending}>
              {c.markAll}
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-10">
        <section aria-label={c.listLabel} className="min-w-0">
          {(markAll.error || markOne.error) && (
            <FormAlert className="mb-3">{markAll.error ?? markOne.error}</FormAlert>
          )}
          {list.loading ? (
            <ListSkeleton />
          ) : list.error || !list.data ? (
            <LoadError error={list.error} onRetry={list.reload} />
          ) : list.data.notifications.length === 0 ? (
            <EmptyState icon={<BellOff />} title={c.emptyTitle} description={c.emptyBody} />
          ) : (
            <>
              <ul className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border-subtle bg-surface-raised">
                {list.data.notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    n={n}
                    busy={markOne.pending}
                    onOpen={() => void onOpen(n)}
                    onMarkRead={() => void onMarkOne(n)}
                  />
                ))}
              </ul>
              <Pagination meta={list.data.meta} onPage={setPage} />
            </>
          )}
        </section>

        <Preferences />
      </div>
    </div>
  );
}

function ListSkeleton() {
  const { t } = useLanguage();
  return (
    <div aria-busy="true" className="space-y-2">
      <span role="status" className="sr-only">
        {t("common.loading")}
      </span>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

function NotificationItem({
  n,
  busy,
  onOpen,
  onMarkRead,
}: {
  n: AppNotification;
  busy: boolean;
  onOpen: () => void;
  onMarkRead: () => void;
}) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const unread = !n.read_at;
  const path = internalPath(n.action_path);
  const category = c.categories[n.category] ?? n.category?.replace(/_/g, " ");

  return (
    <li className={cn("relative flex gap-3 px-4 py-4 sm:px-5", unread && "bg-accent-soft/40")}>
      <span
        aria-hidden
        className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", unread ? "bg-accent-text" : "bg-transparent")}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-text-subtle">
          {category && <span className="font-semibold uppercase tracking-[0.08em]">{category}</span>}
          <time dateTime={n.created_at} title={formatDateTime(n.created_at, locale)}>
            {relativeTime(n.created_at, locale)}
          </time>
          {unread && <span className="sr-only">{c.unread}</span>}
        </div>
        {path ? (
          <button
            type="button"
            onClick={onOpen}
            className={cn(
              "mt-1 flex w-full items-start justify-between gap-2 rounded-sm text-left text-body",
              "hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text",
              unread ? "font-bold text-text" : "font-semibold text-text-muted",
            )}
          >
            <span className="min-w-0 break-words">{n.title}</span>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-text-subtle" aria-hidden />
          </button>
        ) : (
          <p className={cn("mt-1 break-words text-body", unread ? "font-bold text-text" : "font-semibold text-text-muted")}>
            {n.title}
          </p>
        )}
        {n.body && <p className="mt-1 break-words text-body-sm text-text-muted">{n.body}</p>}
        {unread && (
          <Button variant="ghost" size="sm" className="-ml-3 mt-1" onClick={onMarkRead} disabled={busy}>
            {c.markRead}
          </Button>
        )}
      </div>
    </li>
  );
}

/* ── Preferences matrix ──────────────────────────────────────────────── */

function Preferences() {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { toast } = useToast();
  const prefs = useResource((signal) => fetchNotificationPreferences({ signal }), []);
  const [draft, setDraft] = useState<NotificationPreferences | null>(null);
  const save = useAction((p: NotificationPreferences) => saveNotificationPreferences(p));

  useEffect(() => {
    if (prefs.data) setDraft(prefs.data.preferences);
  }, [prefs.data]);

  const categories = prefs.data?.categories?.length
    ? prefs.data.categories
    : Object.keys(prefs.data?.preferences ?? {});

  const dirty = !!draft && !!prefs.data && JSON.stringify(draft) !== JSON.stringify(prefs.data.preferences);

  const onSave = async () => {
    if (!draft) return;
    const res = await save.run(draft);
    if (res.ok) {
      prefs.setData((prev) => (prev ? { ...prev, preferences: res.value } : prev));
      toast({ title: c.prefsSaved, tone: "success" });
    }
  };

  return (
    <Section id="notification-prefs" title={c.prefsTitle} description={c.prefsDescription}>
      {prefs.loading ? (
        <Skeleton className="h-64 w-full" />
      ) : prefs.error || !draft ? (
        <LoadError error={prefs.error} onRetry={prefs.reload} compact />
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {categories.map((cat) => {
              const ch = draft[cat] ?? { database: true, mail: true };
              const label = c.categories[cat] ?? cat.replace(/_/g, " ");
              return (
                <li key={cat} className="px-5 py-4 sm:px-6">
                  <fieldset className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <legend className="sr-only">{label}</legend>
                    <div className="min-w-0" aria-hidden>
                      <p className="font-semibold text-text">{label}</p>
                      {c.categoryHints[cat] && (
                        <p className="mt-0.5 text-body-sm text-text-subtle">{c.categoryHints[cat]}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2">
                      <Checkbox
                        label={
                          <>
                            {c.inApp}
                            <span className="sr-only"> — {label}</span>
                          </>
                        }
                        checked={ch.database}
                        onChange={(e) =>
                          setDraft((d) => (d ? { ...d, [cat]: { ...ch, database: e.target.checked } } : d))
                        }
                      />
                      <Checkbox
                        label={
                          <>
                            {c.email}
                            <span className="sr-only"> — {label}</span>
                          </>
                        }
                        checked={ch.mail}
                        onChange={(e) => setDraft((d) => (d ? { ...d, [cat]: { ...ch, mail: e.target.checked } } : d))}
                      />
                    </div>
                  </fieldset>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col gap-3 border-t border-border-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            {save.error && <FormAlert className="sm:mr-auto">{save.error}</FormAlert>}
            <Button onClick={onSave} loading={save.pending} disabled={!dirty}>
              {save.pending ? t("act.saving") : c.savePrefs}
            </Button>
          </div>
        </Card>
      )}
    </Section>
  );
}
