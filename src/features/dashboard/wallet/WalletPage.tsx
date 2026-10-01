import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, Receipt } from "lucide-react";
import { Button, EmptyState, Tab, TabList, TabPanel, Tabs } from "@/components/ui";
import { InlineLoading, LoadError, PageHeader, PageLoading, Pagination, Section } from "@/features/dashboard/components";
import { useResource } from "@/lib/api/useResource";
import { fetchPayoutMethods, fetchPayoutProviders, fetchWallet, fetchWithdrawals } from "@/lib/api/wallet";
import { toMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { AddPayoutMethodDialog } from "./AddPayoutMethodDialog";
import { BalancesGrid } from "./BalancesGrid";
import { COPY } from "./copy";
import { LedgerPanel } from "./LedgerPanel";
import { PayoutMethodsPanel } from "./PayoutMethodsPanel";
import { WithdrawalsTable } from "./WithdrawalsTable";
import { WithdrawDialog } from "./WithdrawDialog";

const TABS = ["withdrawals", "statement", "methods"] as const;
type TabValue = (typeof TABS)[number];

export default function WalletPage() {
  const c = useCopy(COPY);
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab: TabValue = TABS.includes(tabParam as TabValue) ? (tabParam as TabValue) : "withdrawals";

  // Bumped after any write so every panel refetches (keeping its old data on screen meanwhile).
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const wallet = useResource((signal) => fetchWallet({ signal }), [refreshKey]);
  const methods = useResource((signal) => fetchPayoutMethods({ signal }), [refreshKey]);
  const providers = useResource((signal) => fetchPayoutProviders({ signal }), []);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const balances = useMemo(() => wallet.data?.balances ?? [], [wallet.data]);
  const canWithdraw = balances.some((b) => toMinor(b.available_minor) > 0n);
  const currencies = useMemo(() => balances.map((b) => b.currency), [balances]);

  const setTab = (v: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", v);
        return next;
      },
      { replace: true },
    );

  if (wallet.loading) return <PageLoading />;
  if (wallet.error && !wallet.data) {
    return (
      <>
        <PageHeader title={c.title} description={c.intro} />
        <LoadError error={wallet.error} onRetry={wallet.reload} />
      </>
    );
  }

  const openWithdrawals = wallet.data?.open_withdrawals ?? [];

  return (
    <>
      <PageHeader
        title={c.title}
        description={c.intro}
        actions={
          canWithdraw ? (
            <Button leftIcon={<ArrowUpRight />} onClick={() => setWithdrawOpen(true)} disabled={methods.loading}>
              {c.withdraw}
            </Button>
          ) : balances.length > 0 ? (
            <p className="text-body-sm text-text-subtle">{c.nothingToWithdraw}</p>
          ) : null
        }
      />

      <div className="space-y-10">
        <Section id="balances" title={c.balancesTitle} description={c.balancesDesc}>
          <BalancesGrid balances={balances} />
        </Section>

        {openWithdrawals.length > 0 && (
          <Section id="open-withdrawals" title={c.openTitle} description={c.openDesc}>
            <WithdrawalsTable rows={openWithdrawals} caption={c.openTitle} onChanged={refresh} />
          </Section>
        )}

        <section aria-label={c.tabsLabel} className="min-w-0">
          <Tabs value={tab} onValueChange={setTab} variant="underline">
            <TabList aria-label={c.tabsLabel} className="mb-5">
              <Tab value="withdrawals">{c.tabWithdrawals}</Tab>
              <Tab value="statement">{c.tabLedger}</Tab>
              <Tab value="methods">{c.tabMethods}</Tab>
            </TabList>
            <TabPanel value="withdrawals">
              <WithdrawalsPanel refreshKey={refreshKey} onChanged={refresh} />
            </TabPanel>
            <TabPanel value="statement">
              <LedgerPanel currencies={currencies} refreshKey={refreshKey} />
            </TabPanel>
            <TabPanel value="methods">
              {methods.error && !methods.data ? (
                <LoadError error={methods.error} onRetry={methods.reload} compact />
              ) : methods.loading ? (
                <InlineLoading />
              ) : (
                <PayoutMethodsPanel methods={methods.data ?? []} providers={providers.data ?? []} onAdd={() => setAddOpen(true)} onChanged={refresh} />
              )}
            </TabPanel>
          </Tabs>
        </section>
      </div>

      <WithdrawDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        balances={balances}
        methods={methods.data ?? []}
        providers={providers.data ?? []}
        onDone={refresh}
        onAddMethod={() => {
          setWithdrawOpen(false);
          setTab("methods");
          setAddOpen(true);
        }}
      />
      <AddPayoutMethodDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        providers={providers.data ?? []}
        providersLoading={providers.loading}
        providersError={providers.error}
        onRetryProviders={providers.reload}
        isFirst={(methods.data ?? []).length === 0}
        onAdded={() => {
          refresh();
        }}
      />
    </>
  );
}

function WithdrawalsPanel({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const c = useCopy(COPY);
  const [page, setPage] = useState(1);
  const res = useResource((signal) => fetchWithdrawals(page, { signal }), [page, refreshKey]);

  if (res.error && !res.data) return <LoadError error={res.error} onRetry={res.reload} compact />;
  if (res.loading) return <InlineLoading />;
  return (
    <>
      <WithdrawalsTable
        rows={res.data?.withdrawals ?? []}
        caption={c.withdrawalsCaption}
        onChanged={onChanged}
        empty={
          <EmptyState icon={<Receipt />} title={c.withdrawalsEmptyTitle} description={c.withdrawalsEmptyBody} compact />
        }
      />
      <Pagination meta={res.data?.meta} onPage={setPage} />
    </>
  );
}
