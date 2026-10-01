import { useState } from "react";
import { ScrollText } from "lucide-react";
import { DataTable, EmptyState, Field, Select, type Column } from "@/components/ui";
import { LoadError, Money, Pagination } from "@/features/dashboard/components";
import type { LedgerEntry } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { fetchStatement } from "@/lib/api/wallet";
import { formatDateTime } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { toMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { ledgerTypeLabel } from "./helpers";

export function LedgerPanel({ currencies, refreshKey }: { currencies: string[]; refreshKey: number }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const [currency, setCurrency] = useState("");
  const [page, setPage] = useState(1);
  const res = useResource(
    (signal) => fetchStatement({ currency: currency || undefined, page }, { signal }),
    [currency, page, refreshKey],
  );

  const columns: Column<LedgerEntry>[] = [
    {
      key: "type",
      header: c.colType,
      primary: true,
      cell: (e) => <span className="font-semibold">{ledgerTypeLabel(e.type, c)}</span>,
    },
    {
      key: "description",
      header: c.colDescription,
      cell: (e) => <span className="break-words text-text-muted">{e.description || "—"}</span>,
    },
    {
      key: "amount",
      header: c.colAmount,
      align: "right",
      cell: (e) => (
        <Money
          minor={e.amount_minor}
          currency={e.currency}
          signDisplay="always"
          className={toMinor(e.amount_minor) < 0n ? "text-text" : "text-success"}
        />
      ),
    },
    {
      key: "balance",
      header: c.colBalanceAfter,
      align: "right",
      cell: (e) => <Money minor={e.balance_after_minor} currency={e.currency} className="text-text-muted" />,
    },
    {
      key: "account",
      header: c.colAccount,
      cell: (e) => (e.account === "held" ? c.accountHeld : c.accountAvailable),
    },
    {
      key: "date",
      header: c.colDate,
      cell: (e) => <span className="whitespace-nowrap text-text-muted">{formatDateTime(e.created_at, locale)}</span>,
    },
    {
      key: "reference",
      header: c.colReference,
      hideOnMobile: true,
      cell: (e) => <span className="break-all font-mono text-caption text-text-subtle">{e.reference}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="min-w-0 text-body-sm text-text-subtle">{c.ledgerDesc}</p>
        {currencies.length > 1 && (
          <Field label={c.currencyFilter} className="w-full sm:w-52">
            <Select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setPage(1);
              }}
            >
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

      {res.error ? (
        <LoadError error={res.error} onRetry={res.reload} compact />
      ) : (
        <>
          <DataTable
            rows={res.data?.entries ?? []}
            columns={columns}
            getRowKey={(e) => e.id}
            caption={c.ledgerCaption}
            loading={res.loading}
            empty={
              <EmptyState icon={<ScrollText />} title={c.ledgerEmptyTitle} description={c.ledgerEmptyBody} compact />
            }
          />
          <Pagination meta={res.data?.meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}
