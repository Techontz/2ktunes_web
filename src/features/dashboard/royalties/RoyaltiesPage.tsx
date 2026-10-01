import { useMemo, useState } from "react";
import { FileSpreadsheet, Music2 } from "lucide-react";
import { Card, DataTable, EmptyState, Field, Input, Select, type Column } from "@/components/ui";
import { ChipGroup, LoadError, Money, PageHeader, Section } from "@/features/dashboard/components";
import type { BreakdownBy, BreakdownRow, RoyaltyStatement } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { fetchBreakdown, fetchStatements } from "@/lib/api/wallet";
import { formatDate, formatMonth } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount, toMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY, type RoyaltiesCopy } from "./copy";
import { countryName, usageLabel } from "./labels";

const BY: BreakdownBy[] = ["month", "store", "territory", "release", "track", "usage", "statement"];

export default function RoyaltiesPage() {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const [by, setBy] = useState<BreakdownBy>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [currency, setCurrency] = useState("");

  const rangeInvalid = !!from && !!to && from > to;

  const statements = useResource((signal) => fetchStatements({ signal }), []);
  const breakdown = useResource(
    (signal) =>
      rangeInvalid
        ? Promise.resolve(null)
        : fetchBreakdown({ by, from: from || undefined, to: to || undefined, currency: currency || undefined }, { signal }),
    [by, from, to, currency, rangeInvalid],
  );

  // Currencies you've actually been credited in (from posted statements).
  const currencies = useMemo(
    () => Array.from(new Set((statements.data ?? []).map((s) => s.currency))).sort(),
    [statements.data],
  );

  return (
    <>
      <PageHeader title={c.title} description={c.intro} />

      <div className="space-y-10">
        <Section id="breakdown" title={c.breakdownTitle}>
          <Card padding="sm" className="mb-4 space-y-4" role="group" aria-label={c.filtersLabel}>
            <ChipGroup<BreakdownBy>
              label={c.groupBy}
              value={by}
              onChange={setBy}
              options={BY.map((b) => ({ value: b, label: c.by[b] }))}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={c.from}>
                <Input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label={c.to} error={rangeInvalid ? c.rangeInvalid : null}>
                <Input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
              </Field>
              {currencies.length > 1 && (
                <Field label={c.currency}>
                  <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="">{c.allCurrencies}</option>
                    {currencies.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>
            {breakdown.data?.range && (
              <p className="text-caption text-text-subtle" aria-live="polite">
                {c.showing(formatDate(breakdown.data.range.from, locale), formatDate(breakdown.data.range.to, locale))}
              </p>
            )}
          </Card>

          {breakdown.error ? (
            <LoadError error={breakdown.error} onRetry={breakdown.reload} compact />
          ) : (
            <BreakdownTable by={by} rows={breakdown.data?.rows ?? []} loading={breakdown.loading || breakdown.refreshing} c={c} />
          )}
        </Section>

        <Section id="statements" title={c.statementsTitle} description={c.statementsDesc}>
          {statements.error ? (
            <LoadError error={statements.error} onRetry={statements.reload} compact />
          ) : (
            <StatementsTable rows={statements.data ?? []} loading={statements.loading} c={c} />
          )}
        </Section>
      </div>
    </>
  );
}

function BreakdownTable({
  by,
  rows,
  loading,
  c,
}: {
  by: BreakdownBy;
  rows: BreakdownRow[];
  loading: boolean;
  c: RoyaltiesCopy;
}) {
  const { locale } = useLanguage();

  const label = (r: BreakdownRow): string => {
    if (by === "month") return formatMonth(r.label, locale);
    if (by === "territory") return countryName(r.label, locale, c.unknown);
    if (by === "usage") return usageLabel(r.label, c.usage, c.unknown);
    if (!r.label || r.label === "Unknown") return c.unknown;
    return r.label;
  };

  // Exact per-currency totals (BigInt — never float money).
  const totals = useMemo(() => {
    const map = new Map<string, bigint>();
    for (const r of rows) map.set(r.currency, (map.get(r.currency) ?? 0n) + toMinor(r.amount_minor));
    return Array.from(map.entries());
  }, [rows]);

  const columns: Column<BreakdownRow>[] = [
    { key: "label", header: c.by[by], primary: true, cell: (r) => <span className="break-words font-semibold">{label(r)}</span> },
    { key: "amount", header: c.colAmount, align: "right", cell: (r) => <Money minor={r.amount_minor} currency={r.currency} /> },
    { key: "units", header: c.colUnits, align: "right", cell: (r) => <span className="tabular-nums">{formatCount(r.units, locale)}</span> },
    { key: "lines", header: c.colLines, align: "right", cell: (r) => <span className="tabular-nums">{formatCount(r.lines, locale)}</span> },
  ];

  return (
    <div className="space-y-3">
      {!loading && totals.length > 0 && (
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          {totals.map(([cur, sum]) => (
            <div key={cur} className="min-w-0">
              <dt className="text-caption text-text-subtle">{c.totalFor(cur)}</dt>
              <dd className="text-h4 font-bold text-text">
                <Money minor={sum} currency={cur} className="whitespace-normal" />
              </dd>
            </div>
          ))}
        </dl>
      )}
      <DataTable
        rows={rows}
        columns={columns}
        getRowKey={(r) => `${r.label ?? "?"}|${r.currency}`}
        caption={c.breakdownCaption(c.by[by])}
        loading={loading}
        empty={<EmptyState icon={<Music2 />} title={c.emptyTitle} description={c.emptyBody} compact />}
      />
    </div>
  );
}

function StatementsTable({ rows, loading, c }: { rows: RoyaltyStatement[]; loading: boolean; c: RoyaltiesCopy }) {
  const { locale } = useLanguage();
  const columns: Column<RoyaltyStatement>[] = [
    { key: "source", header: c.colSource, primary: true, cell: (s) => <span className="break-words font-semibold">{s.source}</span> },
    {
      key: "period",
      header: c.colPeriod,
      cell: (s) => c.period(formatDate(s.period_start, locale), formatDate(s.period_end, locale)),
    },
    { key: "amount", header: c.colAmount, align: "right", cell: (s) => <Money minor={s.amount_minor} currency={s.currency} /> },
    { key: "posted", header: c.colPosted, cell: (s) => formatDate(s.posted_at, locale) },
  ];
  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowKey={(s) => `${s.id}|${s.currency}`}
      caption={c.statementsCaption}
      loading={loading}
      empty={<EmptyState icon={<FileSpreadsheet />} title={c.statementsEmptyTitle} description={c.statementsEmptyBody} compact />}
    />
  );
}
