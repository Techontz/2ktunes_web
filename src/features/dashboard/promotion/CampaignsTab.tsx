import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";
import { Button, DataTable, EmptyState, type Column } from "@/components/ui";
import { LoadError, Money, Pagination, StatusPill } from "@/features/dashboard/components";
import { useLabels } from "@/features/dashboard/marketplace/labels";
import { fetchCampaigns } from "@/lib/api/marketplace";
import type { Campaign } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { CampaignFormDialog } from "./CampaignFormDialog";
import { COPY } from "./copy";

export function CampaignsTab() {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const res = useResource((signal) => fetchCampaigns(page, { signal }), [page]);

  const columns: Column<Campaign>[] = [
    {
      key: "title",
      header: c.colTitle,
      primary: true,
      cell: (x) => (
        <Link
          to={`/dashboard/promotion/campaigns/${x.id}`}
          className="break-words font-semibold text-text hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          {x.title}
        </Link>
      ),
    },
    { key: "type", header: c.colType, cell: (x) => labels.campaignType(x.type) },
    { key: "status", header: c.colStatus, cell: (x) => <StatusPill status={x.status} /> },
    {
      key: "release",
      header: c.colRelease,
      hideOnMobile: true,
      cell: (x) => (x.release ? `${x.release.release_title} · ${x.release.artist_name}` : "-"),
    },
    { key: "orders", header: c.colOrders, align: "right", cell: (x) => formatCount(x.orders_count ?? 0, locale) },
    {
      key: "budget",
      header: c.colBudget,
      align: "right",
      cell: (x) => (x.budget_minor != null && x.currency ? <Money minor={x.budget_minor} currency={x.currency} /> : c.noBudget),
    },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-[60ch] text-body-sm text-text-muted">{c.campaignsIntro}</p>
        <Button leftIcon={<Plus />} onClick={() => setCreating(true)}>
          {c.newCampaign}
        </Button>
      </div>

      {res.error ? (
        <LoadError error={res.error} onRetry={res.reload} />
      ) : (
        <>
          <DataTable
            rows={res.data?.campaigns ?? []}
            columns={columns}
            getRowKey={(x) => x.id}
            caption={c.campaignsCaption}
            loading={res.loading}
            empty={
              <EmptyState
                icon={<Megaphone />}
                title={c.noCampaignsTitle}
                description={c.noCampaignsBody}
                action={
                  <Button leftIcon={<Plus />} onClick={() => setCreating(true)}>
                    {c.newCampaign}
                  </Button>
                }
              />
            }
          />
          <Pagination meta={res.data?.meta} onPage={setPage} />
        </>
      )}

      <CampaignFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(x) => navigate(`/dashboard/promotion/campaigns/${x.id}`)}
      />
    </div>
  );
}
