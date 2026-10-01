import type { ReactNode } from "react";
import { Card, DataTable, type Column } from "@/components/ui";
import { Money } from "@/features/dashboard/components";
import type { MonthRow } from "@/lib/api/types";
import { formatMonth } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount, toMinor, type MinorInput } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

/** Bar length in % of the largest value, computed on BigInt (display only). */
export function share(value: MinorInput, max: bigint): number {
  const v = toMinor(value);
  if (max <= 0n || v <= 0n) return 0;
  return Number((v * 1000n) / max) / 10;
}

function Bar({ pct }: { pct: number }) {
  return (
    <span aria-hidden className="block h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(pct, pct > 0 ? 1.5 : 0)}%` }} />
    </span>
  );
}

/**
 * One currency's monthly revenue: horizontal bars (decorative, labelled with
 * the exact figure) plus the same numbers — and streams — in a table.
 */
export function MonthlyChart({ currency, rows }: { currency: string; rows: MonthRow[] }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const max = rows.reduce((m, r) => (toMinor(r.revenue_minor) > m ? toMinor(r.revenue_minor) : m), 0n);

  const columns: Column<MonthRow>[] = [
    { key: "month", header: c.colMonth, primary: true, cell: (r) => formatMonth(r.month, locale) },
    { key: "revenue", header: c.colRevenue, align: "right", cell: (r) => <Money minor={r.revenue_minor} currency={r.currency} /> },
    { key: "streams", header: c.colStreams, align: "right", cell: (r) => <span className="tabular-nums">{formatCount(r.streams, locale)}</span> },
  ];

  return (
    <Card padding="md" className="space-y-5">
      <figure className="min-w-0">
        <figcaption className="text-body-sm font-semibold text-text">{c.chartCaption(currency)}</figcaption>
        <p className="sr-only">{c.chartNote}</p>
        <ol aria-hidden className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <li key={r.month} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 sm:grid-cols-[5.5rem_minmax(0,1fr)_9rem]">
              <span className="text-caption text-text-subtle">{formatMonth(r.month, locale)}</span>
              <Bar pct={share(r.revenue_minor, max)} />
              <span className="col-start-2 text-caption text-text-muted sm:col-start-auto sm:text-right">
                <Money minor={r.revenue_minor} currency={r.currency} />
              </span>
            </li>
          ))}
        </ol>
      </figure>
      <DataTable rows={rows} columns={columns} getRowKey={(r) => r.month} caption={c.tableCaption(currency)} />
    </Card>
  );
}

/** `group` (e.g. a currency) scopes bar lengths: amounts in different currencies aren't compared. */
export type RankedItem = { key: string; label: string; value: ReactNode; weight: MinorInput; group?: string; sub?: ReactNode };

/** A titled, ordered top-N list with proportional bars. */
export function RankedList({ title, items }: { title: string; items: RankedItem[] }) {
  const max = new Map<string, bigint>();
  for (const i of items) {
    const g = i.group ?? "";
    const w = toMinor(i.weight);
    if (w > (max.get(g) ?? 0n)) max.set(g, w);
  }
  return (
    <Card padding="md" className="min-w-0">
      <h3 className="text-body font-semibold text-text">{title}</h3>
      <ol className="mt-4 space-y-3">
        {items.map((i, idx) => (
          <li key={i.key} className="min-w-0">
            <div className="flex items-baseline justify-between gap-3 text-body-sm">
              <span className="min-w-0 break-words text-text">
                <span className="mr-2 tabular-nums text-text-subtle">{idx + 1}.</span>
                {i.label}
              </span>
              <span className="shrink-0 text-right font-semibold text-text">{i.value}</span>
            </div>
            {i.sub && <p className="mt-0.5 text-caption text-text-subtle">{i.sub}</p>}
            <div className="mt-1.5">
              <Bar pct={share(i.weight, max.get(i.group ?? "") ?? 0n)} />
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
