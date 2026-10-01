import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Card, EmptyState, Field, Input, Select, Stat } from "@/components/ui";
import {
  ChipGroup,
  LoadError,
  Money,
  PageHeader,
  PageLoading,
  Section,
  StatGrid,
} from "@/features/dashboard/components";
import { fetchAnalytics } from "@/lib/api/account";
import { fetchReleases } from "@/lib/api/catalog";
import type { Analytics, AnalyticsRange, CountRow, LabelledRevenue, MonthRow } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { countryName, usageLabel } from "../royalties/labels";
import { COPY, type AnalyticsCopy } from "./copy";
import { MonthlyChart, RankedList, type RankedItem } from "./charts";

const RANGES: AnalyticsRange[] = ["7d", "30d", "90d", "12m", "custom"];

export default function AnalyticsPage() {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const [range, setRange] = useState<AnalyticsRange>("12m");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [releaseId, setReleaseId] = useState("");

  const customIncomplete = range === "custom" && (!from || !to);
  const customInvalid = range === "custom" && !!from && !!to && from > to;
  const canQuery = !customIncomplete && !customInvalid;

  const releases = useResource((signal) => fetchReleases({ per_page: 100 }, { signal }), []);
  const res = useResource(
    (signal) =>
      canQuery
        ? fetchAnalytics(
            {
              range,
              from: range === "custom" ? from : undefined,
              to: range === "custom" ? to : undefined,
              release_id: releaseId ? Number(releaseId) : null,
            },
            { signal },
          )
        : Promise.resolve(null),
    [range, from, to, releaseId, canQuery],
  );

  const releaseOptions = releases.data?.releases ?? [];

  return (
    <>
      <PageHeader title={c.title} description={c.intro} />

      <Card padding="sm" className="mb-8 space-y-4" role="group" aria-label={c.filtersLabel}>
        <ChipGroup<AnalyticsRange>
          label={c.range}
          value={range}
          onChange={setRange}
          options={RANGES.map((r) => ({ value: r, label: c.ranges[r] }))}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {range === "custom" && (
            <>
              <Field label={c.from}>
                <Input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label={c.to} error={customInvalid ? c.rangeInvalid : null}>
                <Input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
              </Field>
            </>
          )}
          {releaseOptions.length > 0 && (
            <Field label={c.release}>
              <Select value={releaseId} onChange={(e) => setReleaseId(e.target.value)}>
                <option value="">{c.allReleases}</option>
                {releaseOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.release_title} — {r.artist_name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
        {customIncomplete && <p className="text-caption text-text-subtle">{c.pickDates}</p>}
        {res.data?.range && (
          <p className="text-caption text-text-subtle" aria-live="polite">
            {c.showing(formatDate(res.data.range.from, locale), formatDate(res.data.range.to, locale))}
          </p>
        )}
      </Card>

      {!canQuery ? null : res.loading ? (
        <PageLoading rows={4} />
      ) : res.error ? (
        <LoadError error={res.error} onRetry={res.reload} />
      ) : res.data ? (
        <AnalyticsBody a={res.data} c={c} />
      ) : null}
    </>
  );
}

function AnalyticsBody({ a, c }: { a: Analytics; c: AnalyticsCopy }) {
  const { locale } = useLanguage();
  const links = a.smart_links;
  const hasLinkActivity = !!links && (links.views > 0 || links.clicks > 0 || links.presaves > 0);

  const monthsByCurrency = useMemo(() => {
    const map = new Map<string, MonthRow[]>();
    for (const r of a.by_month ?? []) map.set(r.currency, [...(map.get(r.currency) ?? []), r]);
    return Array.from(map.entries());
  }, [a.by_month]);

  const revenueItems = (rows: LabelledRevenue[], label: (r: LabelledRevenue) => string): RankedItem[] =>
    rows.map((r, i) => ({
      key: `${r.id ?? r.label ?? i}|${r.currency}`,
      label: label(r),
      value: <Money minor={r.revenue_minor} currency={r.currency} />,
      weight: r.revenue_minor,
      group: r.currency,
      sub: c.unitsCount(formatCount(r.units, locale)),
    }));
  const plain = (r: LabelledRevenue) => r.label || c.unknown;

  const tops: { title: string; items: RankedItem[] }[] = a.has_data
    ? [
        { title: c.topReleases, items: revenueItems(a.top_releases ?? [], plain) },
        { title: c.topTracks, items: revenueItems(a.top_tracks ?? [], plain) },
        { title: c.topStores, items: revenueItems(a.top_stores ?? [], plain) },
        { title: c.topTerritories, items: revenueItems(a.top_territories ?? [], (r) => countryName(r.label, locale, c.unknown)) },
        { title: c.byUsage, items: revenueItems(a.by_usage ?? [], (r) => usageLabel(r.label, c.usage, c.unknown)) },
      ].filter((t) => t.items.length > 0)
    : [];

  return (
    <div className="space-y-10">
      {!a.has_data ? (
        <EmptyState icon={<BarChart3 />} title={c.emptyTitle} description={c.emptyBody} />
      ) : (
        <>
          <Section id="totals" title={c.totalsTitle}>
            <StatGrid>
              {(a.totals?.revenue ?? []).map((r) => (
                <Stat key={r.currency} label={c.revenue(r.currency)} value={<Money minor={r.revenue_minor} currency={r.currency} />} />
              ))}
              <Stat label={c.streams} value={formatCount(a.totals?.streams, locale)} />
              <Stat label={c.downloads} value={formatCount(a.totals?.downloads, locale)} />
              <Stat label={c.videoUses} value={formatCount(a.totals?.video_uses, locale)} hint={c.videoUsesHint} />
            </StatGrid>
          </Section>

          {monthsByCurrency.length > 0 && (
            <Section id="monthly" title={c.monthlyTitle} description={c.monthlyDesc}>
              <div className="grid gap-4 xl:grid-cols-2">
                {monthsByCurrency.map(([cur, rows]) => (
                  <MonthlyChart key={cur} currency={cur} rows={rows} />
                ))}
              </div>
            </Section>
          )}

          {tops.length > 0 && (
            <Section id="top" title={c.topTitle}>
              <div className="grid gap-4 lg:grid-cols-2">
                {tops.map((t) => (
                  <RankedList key={t.title} title={t.title} items={t.items} />
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      {(a.has_data || hasLinkActivity) && links && <SmartLinks a={a} c={c} />}
    </div>
  );
}

function SmartLinks({ a, c }: { a: Analytics; c: AnalyticsCopy }) {
  const { locale } = useLanguage();
  const l = a.smart_links;

  const countItems = (rows: CountRow[], label: (v: string | null) => string): RankedItem[] =>
    (rows ?? []).map((r, i) => ({
      key: `${r.label ?? "?"}-${i}`,
      label: label(r.label),
      value: <span className="tabular-nums">{formatCount(r.n, locale)}</span>,
      weight: Number(r.n) || 0,
    }));
  const humanise = (v: string | null) => (v ? v.replace(/[_-]/g, " ").replace(/^\w/, (m) => m.toUpperCase()) : c.unknown);

  const lists = [
    { title: c.byStore, items: countItems(l.by_store, humanise) },
    { title: c.byCountry, items: countItems(l.by_country, (v) => countryName(v, locale, c.unknown)) },
    { title: c.byDevice, items: countItems(l.by_device, (v) => (v ? (c.devices[v.toLowerCase()] ?? humanise(v)) : c.unknown)) },
    { title: c.byReferrer, items: countItems(l.by_referrer, (v) => v || c.unknown) },
  ].filter((x) => x.items.length > 0);

  return (
    <Section id="smart-links" title={c.linksTitle} description={c.linksDesc}>
      <StatGrid>
        <Stat label={c.views} value={formatCount(l.views, locale)} />
        <Stat label={c.uniqueVisitors} value={formatCount(l.unique_visitors, locale)} />
        <Stat label={c.clicks} value={formatCount(l.clicks, locale)} />
        <Stat label={c.presaves} value={formatCount(l.presaves, locale)} />
      </StatGrid>
      {lists.length > 0 && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {lists.map((x) => (
            <RankedList key={x.title} title={x.title} items={x.items} />
          ))}
        </div>
      )}
      {a.campaigns && (
        <div className="mt-8">
          <h3 className="mb-3 text-body font-semibold text-text">{c.campaignsTitle}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label={c.activeOrders} value={formatCount(a.campaigns.active_orders, locale)} />
            <Stat label={c.completedOrders} value={formatCount(a.campaigns.completed_orders, locale)} />
          </div>
        </div>
      )}
    </Section>
  );
}
