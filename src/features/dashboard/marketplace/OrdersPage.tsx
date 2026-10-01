import { Link, useSearchParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button, DataTable, EmptyState, Tab, TabList, TabPanel, Tabs, type Column } from "@/components/ui";
import { ChipGroup, LoadError, Money, PageHeader, Pagination, StatusPill } from "@/features/dashboard/components";
import { fetchOrders } from "@/lib/api/marketplace";
import type { Order } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { ORDER_STATUSES } from "./shared";

type Role = "buyer" | "creator";

export default function OrdersPage() {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const canCreator = user?.account_type === "creator" || !!user?.has_creator_profile;
  const role: Role = canCreator && sp.get("as") === "creator" ? "creator" : "buyer";
  const status = sp.get("status") ?? "";
  const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setSp(next);
  };

  const statuses = role === "creator" ? ORDER_STATUSES.filter((s) => s !== "pending_payment") : ORDER_STATUSES;

  const body = (
    <>
      <ChipGroup
        label={c.statusFilter}
        value={status}
        onChange={(v) => update({ status: v || null, page: null })}
        options={[{ value: "", label: c.allStatuses }, ...statuses.map((s) => ({ value: s, label: t(`status.${s}`) }))]}
        className="mb-5"
      />
      <OrderList role={role} status={status} page={page} onPage={(p) => update({ page: p > 1 ? String(p) : null })} />
    </>
  );

  return (
    <div>
      <PageHeader
        title={c.ordersTitle}
        description={c.ordersIntro}
        actions={
          <Button to="/dashboard/creators" variant="secondary">
            {c.findCreators}
          </Button>
        }
      />

      {canCreator ? (
        <Tabs value={role} onValueChange={(v) => update({ as: v === "creator" ? "creator" : null, status: null, page: null })}>
          <TabList aria-label={c.ordersTabs} className="mb-5">
            <Tab value="buyer">{c.asBuyer}</Tab>
            <Tab value="creator">{c.asCreator}</Tab>
          </TabList>
          <TabPanel value={role}>{body}</TabPanel>
        </Tabs>
      ) : (
        body
      )}
    </div>
  );
}

function OrderList({
  role,
  status,
  page,
  onPage,
}: {
  role: Role;
  status: string;
  page: number;
  onPage: (p: number) => void;
}) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const res = useResource(
    (signal) => fetchOrders({ as: role, status: status || undefined, page }, { signal }),
    [role, status, page],
  );

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
    {
      key: "with",
      header: c.colWith,
      cell: (o) =>
        role === "creator"
          ? o.release
            ? `${o.release.title} — ${o.release.artist}`
            : "—"
          : (o.creator?.display_name ?? (o.service ? `${o.service.name} · ${c.serviceBy2k}` : "—")),
    },
    { key: "status", header: c.colStatus, cell: (o) => <StatusPill status={o.status} /> },
    {
      key: "price",
      header: role === "creator" ? c.colYourPayout : c.colPrice,
      align: "right",
      cell: (o) => (
        <Money minor={role === "creator" ? (o.creator_payout_minor ?? o.price_minor) : o.price_minor} currency={o.currency} />
      ),
    },
    { key: "created", header: c.colCreated, hideOnMobile: true, cell: (o) => formatDate(o.created_at, locale) },
  ];

  return (
    <>
      <DataTable
        rows={res.data?.orders ?? []}
        columns={columns}
        getRowKey={(o) => o.id}
        caption={c.ordersCaption}
        loading={res.loading}
        empty={
          <EmptyState
            icon={<ShoppingBag />}
            title={c.noOrdersTitle}
            description={status ? c.noOrdersFiltered : role === "creator" ? c.noOrdersCreator : c.noOrdersBuyer}
            action={
              role === "buyer" && !status ? (
                <Button to="/dashboard/creators" variant="secondary">
                  {c.findCreators}
                </Button>
              ) : undefined
            }
          />
        }
      />
      <Pagination meta={res.data?.meta} onPage={onPage} />
    </>
  );
}
