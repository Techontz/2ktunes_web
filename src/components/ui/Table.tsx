import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Feedback";

/**
 * DataTable — a real <table> on desktop that becomes a stack of cards below
 * the `md` breakpoint, so nothing scrolls sideways on a phone.
 *
 *   <DataTable
 *     caption="Recent withdrawals"
 *     rows={withdrawals}
 *     getRowKey={(w) => w.id}
 *     columns={[
 *       { key: "date", header: "Date", cell: (w) => fmtDate(w.created_at) },
 *       { key: "amount", header: "Amount", align: "right", cell: (w) => fmt(w.amount), primary: true },
 *       { key: "status", header: "Status", cell: (w) => <StatusBadge status={w.status} /> },
 *     ]}
 *     loading={loading}
 *     empty={<EmptyState title="No withdrawals yet" compact />}
 *     onRowClick={(w) => navigate(…)}
 *   />
 *
 * Column: key, header, cell(row), align? left|right|center, primary? (becomes
 *   the card title on mobile), hideOnMobile?, className?.
 * Table props: rows, columns, getRowKey, caption (sr-only unless
 *   showCaption), loading?, loadingRows? (default 4), empty?, onRowClick?.
 *   Clickable rows stay keyboard-reachable (Enter/Space).
 */

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  primary?: boolean;
  hideOnMobile?: boolean;
  className?: string;
};

const alignClass = (a?: Column<unknown>["align"]) =>
  a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  caption,
  showCaption,
  loading,
  loadingRows = 4,
  empty,
  onRowClick,
  className,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string | number;
  caption: string;
  showCaption?: boolean;
  loading?: boolean;
  loadingRows?: number;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}) {
  if (!loading && rows.length === 0 && empty) return <>{empty}</>;

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const secondary = columns.filter((c) => c !== primary && !c.hideOnMobile);

  const rowInteraction = (row: T) =>
    onRowClick
      ? {
          tabIndex: 0,
          role: "link" as const,
          onClick: () => onRowClick(row),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onRowClick(row);
            }
          },
        }
      : {};

  return (
    <div className={cn("min-w-0", className)} aria-busy={loading || undefined}>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-card border border-border-subtle md:block">
        <table className="w-full border-collapse text-body-sm">
          <caption className={showCaption ? "px-5 py-3 text-left font-semibold" : "sr-only"}>
            {caption}
          </caption>
          <thead>
            <tr className="border-b border-border-subtle bg-white/[0.025]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "px-5 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-text-subtle",
                    alignClass(c.align),
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: loadingRows }, (_, i) => (
                  <tr key={i} className="border-b border-border-subtle last:border-0">
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-4">
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={getRowKey(row)}
                    {...rowInteraction(row)}
                    className={cn(
                      "border-b border-border-subtle last:border-0",
                      onRowClick && "cursor-pointer transition-colors hover:bg-white/[0.03]",
                    )}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={cn("px-5 py-3.5 text-text", alignClass(c.align), c.className)}
                      >
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="space-y-2 md:hidden" aria-label={caption}>
        {loading
          ? Array.from({ length: loadingRows }, (_, i) => (
              <li key={i} className="rounded-card border border-border-subtle bg-surface-raised p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-3 h-3 w-4/5" />
              </li>
            ))
          : rows.map((row) => (
              <li
                key={getRowKey(row)}
                {...rowInteraction(row)}
                className={cn(
                  "rounded-card border border-border-subtle bg-surface-raised p-4",
                  onRowClick && "cursor-pointer active:bg-surface-hover",
                )}
              >
                <div className="text-[0.9375rem] font-semibold text-text">{primary.cell(row)}</div>
                {secondary.length > 0 && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {secondary.map((c) => (
                      <div key={c.key} className="min-w-0">
                        <dt className="text-[0.75rem] text-text-subtle">{c.header}</dt>
                        <dd className="mt-0.5 min-w-0 break-words text-body-sm text-text">
                          {c.cell(row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
      </ul>
    </div>
  );
}

export default DataTable;
