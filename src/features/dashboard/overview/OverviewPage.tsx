import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronRight,
  CircleAlert,
  Disc3,
  LifeBuoy,
  Plus,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button, Card, EmptyState, Stat } from "@/components/ui";
import { fetchDashboard } from "@/lib/api/account";
import type { ActionItem, DashboardOverview } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { relativeTime } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount, formatMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { LoadError, Money, PageHeader, PageLoading, Section, StatusPill } from "../components";
import { ReleaseCover } from "../music/shared";
import { COPY } from "./copy";

const GROUPS: Record<"drafts" | "in_review" | "distributing" | "live" | "inactive", string[]> = {
  drafts: ["draft", "changes_requested"],
  in_review: ["submitted", "under_review"],
  distributing: ["approved", "scheduled", "delivering", "delivered", "partially_delivered"],
  live: ["live"],
  inactive: ["rejected", "takedown_requested", "taken_down"],
};

/** Dashboard home — everything from GET /dashboard; nothing estimated. */
export default function OverviewPage() {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const { user } = useAuth();
  const state = useResource((signal) => fetchDashboard({ signal }), []);

  const first = (user?.first_name || user?.name || "").split(" ")[0];

  return (
    <>
      <PageHeader
        title={c.greeting(first)}
        description={c.description}
        actions={
          <Button to="/dashboard/new-release" leftIcon={<Plus />}>
            {c.newRelease}
          </Button>
        }
      />

      {user && !user.onboarding_completed_at && (
        <Card variant="accent" className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold text-text">
              <Sparkles className="h-4 w-4 text-accent-text" aria-hidden />
              {c.finishSetupTitle}
            </p>
            <p className="mt-1 text-body-sm text-text-muted">{c.finishSetupBody}</p>
          </div>
          <Button to="/onboarding" variant="secondary" rightIcon={<ArrowRight />}>
            {c.finishSetup}
          </Button>
        </Card>
      )}

      {state.loading ? (
        <PageLoading />
      ) : state.error || !state.data ? (
        <LoadError error={state.error} onRetry={state.reload} />
      ) : (
        <Content data={state.data} locale={locale} />
      )}
    </>
  );
}

function Content({ data, locale }: { data: DashboardOverview; locale: string }) {
  const c = useCopy(COPY);
  const counts = data.release_counts ?? {};
  const group = (g: keyof typeof GROUPS) => GROUPS[g].reduce((n, s) => n + Number(counts[s] ?? 0), 0);
  const totalReleases = Object.values(counts).reduce((n, v) => n + Number(v || 0), 0);

  return (
    <div className="space-y-8 sm:space-y-10">
      <Section title={c.nextActions} id="ov-actions">
        {data.action_items.length === 0 ? (
          <p className="text-body-sm text-text-subtle">{c.noActions}</p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {data.action_items.map((a, i) => (
              <li key={i}>
                <Link
                  to={a.path}
                  className="flex min-h-14 items-center gap-3 rounded-card border border-border-subtle bg-surface-raised px-4 py-3 transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                >
                  <CircleAlert className="h-4 w-4 shrink-0 text-warning" aria-hidden />
                  <span className="min-w-0 flex-1 text-body-sm text-text">
                    <ActionText item={a} draftCount={group("drafts")} />
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-subtle" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title={c.balances}
        id="ov-balances"
        action={
          <Button variant="ghost" size="sm" to="/dashboard/wallet" rightIcon={<ArrowRight />}>
            {c.toWallet}
          </Button>
        }
      >
        {data.balances.length === 0 ? (
          <EmptyState compact icon={<Wallet />} title={c.noBalanceTitle} description={c.noBalanceBody} />
        ) : (
          <div data-rail className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", data.balances.length > 1 && "max-sm:rail")}>
            {data.balances.map((b) => (
              <Stat
                className={data.balances.length > 1 ? "max-sm:w-[84%]" : undefined}
                key={b.currency}
                label={`${c.available} · ${b.currency}`}
                value={<Money minor={b.available_minor} currency={b.currency} />}
                icon={<Wallet />}
                hint={[
                  Number(b.held_minor) ? c.held(formatMinor(b.held_minor, b.currency, locale)) : null,
                  Number(b.pending_minor) ? c.pending(formatMinor(b.pending_minor, b.currency, locale)) : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || undefined}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title={c.releases}
        id="ov-releases"
        action={
          <Button variant="ghost" size="sm" to="/dashboard/music" rightIcon={<ArrowRight />}>
            {c.toCatalog}
          </Button>
        }
      >
        {totalReleases === 0 ? (
          <EmptyState
            compact
            icon={<Disc3 />}
            title={c.noReleasesTitle}
            description={c.noReleasesBody}
            action={
              <Button to="/dashboard/new-release" leftIcon={<Plus />}>
                {c.newRelease}
              </Button>
            }
          />
        ) : (
          <div className="space-y-5">
            <ul className="max-sm:rail max-sm:!gap-2 sm:grid sm:grid-cols-3 sm:gap-2 lg:grid-cols-5">
              {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
                <li key={g} className="max-sm:w-[7.25rem]">
                  <Link
                    to={`/dashboard/music?status=${g}`}
                    className="tap block rounded-card border border-border-subtle bg-surface-raised px-4 py-3 transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                  >
                    <span className="block text-caption text-text-subtle">{c.groups[g]}</span>
                    <span className="mt-1 block text-h3 font-bold tabular-nums">{formatCount(group(g), locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {data.recent_releases.length > 0 && (
              <div>
                <h3 className="mb-2 text-body-sm font-semibold text-text-muted">{c.recent}</h3>
                <ul className="divide-y divide-border-subtle rounded-card border border-border-subtle bg-surface-raised">
                  {data.recent_releases.map((r) => (
                    <li key={r.id}>
                      <Link
                        to={`/dashboard/music/${r.id}`}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text"
                      >
                        <ReleaseCover src={r.cover_image} title={r.release_title} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-text">{r.release_title || "—"}</span>
                          <span className="block truncate text-caption text-text-subtle">
                            {r.artist_name} · {c.updated(relativeTime(r.updated_at, locale))}
                          </span>
                        </span>
                        <StatusPill status={r.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Section>

      <Section
        title={c.analytics}
        id="ov-analytics"
        action={
          <Button variant="ghost" size="sm" to="/dashboard/analytics" rightIcon={<ArrowRight />}>
            {c.toAnalytics}
          </Button>
        }
      >
        {!data.analytics?.has_data ? (
          <EmptyState compact icon={<BarChart3 />} title={c.noAnalyticsTitle} description={c.noAnalyticsBody} />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-3 max-xl:[&>*:last-child:nth-child(odd)]:col-span-2">
            <Stat label={c.streams} value={formatCount(data.analytics.streams, locale)} />
            <Stat label={c.videoUses} value={formatCount(data.analytics.video_uses, locale)} />
            {data.analytics.top_store?.label && <Stat label={c.topStore} value={data.analytics.top_store.label} />}
            {data.analytics.top_territory?.label && <Stat label={c.topTerritory} value={data.analytics.top_territory.label} />}
            {data.analytics.top_release?.label && <Stat label={c.topRelease} value={data.analytics.top_release.label} />}
          </div>
        )}
      </Section>

      <Section title={c.activity} id="ov-activity">
        <ul className="grid gap-2 sm:grid-cols-3">
          {[
            { to: "/dashboard/notifications", icon: <Bell />, label: c.unread, n: data.unread_notifications },
            { to: "/dashboard/orders", icon: <Receipt />, label: c.activeOrders, n: data.active_orders },
            { to: "/dashboard/support", icon: <LifeBuoy />, label: c.openTickets, n: data.open_tickets },
          ].map((x) => (
            <li key={x.to}>
              <Link
                to={x.to}
                className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-raised px-4 py-3 transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
              >
                <span aria-hidden className="text-text-subtle [&>svg]:h-4 [&>svg]:w-4">
                  {x.icon}
                </span>
                <span className="min-w-0 flex-1 text-body-sm text-text-muted">{x.label}</span>
                <span className="text-h4 font-bold tabular-nums text-text">{formatCount(x.n, locale)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

/** Localised text for the API's action items (the API sends English). */
function ActionText({ item, draftCount }: { item: ActionItem; draftCount: number }) {
  const c = useCopy(COPY);
  const quoted = /“([^”]+)”|"([^"]+)"/.exec(item.message);
  const num = Number(/\d+/.exec(item.message)?.[0] ?? 0);
  switch (item.type) {
    case "verify_email":
      return <>{c.actions.verify_email}</>;
    case "changes_requested":
      return <>{c.actions.changes_requested(quoted?.[1] ?? quoted?.[2] ?? "")}</>;
    case "drafts":
      return <>{c.actions.drafts(num || draftCount)}</>;
    case "plan":
      return <>{/confirm/i.test(item.message) ? c.actions.plan_pending : c.actions.plan}</>;
    case "payout_method":
      return <>{c.actions.payout_method}</>;
    case "split_invites":
      return <>{c.actions.split_invites(num || 1)}</>;
    default:
      return <>{item.message}</>;
  }
}
