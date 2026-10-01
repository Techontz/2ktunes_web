import { useState } from "react";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";
import { Button, DataTable, EmptyState, type Column } from "@/components/ui";
import { LoadError, Money, Pagination, StatusPill } from "@/features/dashboard/components";
import { fetchOrders } from "@/lib/api/marketplace";
import type { Order } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

export function IncomingOrders() {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const [page, setPage] = useState(1);
  const res = useResource((signal) => fetchOrders({ as: "creator", page }, { signal }), [page]);

  if (res.error) return <LoadError error={res.error} onRetry={res.reload} />;

  const columns: Column<Order>[] = [
    {
      key: "title",
      header: c.colOrder,
      primary: true,
      cell: (o) => (
        <div className="min-w-0">
          <Link
            to={`/dashboard/orders/${o.id}`}
            className="break-words font-semibold text-text hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
          >
            {o.title}
          </Link>
          <p className="text-caption text-text-subtle">{o.reference}</p>
        </div>
      ),
    },
    { key: "release", header: c.colRelease, cell: (o) => (o.release ? `${o.release.title} · ${o.release.artist}` : "-") },
    { key: "status", header: c.colStatus, cell: (o) => <StatusPill status={o.status} /> },
    {
      key: "payout",
      header: c.colPayout,
      align: "right",
      cell: (o) => <Money minor={o.creator_payout_minor ?? o.price_minor} currency={o.currency} />,
    },
    { key: "due", header: c.colDue, hideOnMobile: true, cell: (o) => formatDate(o.due_at, locale) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-[65ch] text-body-sm text-text-muted">{c.ordersIntro}</p>
        <Button to="/dashboard/orders?as=creator" variant="secondary" size="sm">
          {c.allOrders}
        </Button>
      </div>
      <DataTable
        rows={res.data?.orders ?? []}
        columns={columns}
        getRowKey={(o) => o.id}
        caption={c.ordersCaption}
        loading={res.loading}
        empty={<EmptyState compact icon={<Inbox />} title={c.noOrders} />}
      />
      <Pagination meta={res.data?.meta} onPage={setPage} />
    </div>
  );
}
