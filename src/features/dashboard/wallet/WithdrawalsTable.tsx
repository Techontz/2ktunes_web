import { useState, type ReactNode } from "react";
import { Button, DataTable, useToast, type Column } from "@/components/ui";
import { ConfirmDialog, Money, SandboxBadge, StatusPill } from "@/features/dashboard/components";
import type { Withdrawal } from "@/lib/api/types";
import { cancelWithdrawal } from "@/lib/api/wallet";
import { formatDateTime } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

/** Withdrawals as a table (cards on phones), with cancel while `requested`. */
export function WithdrawalsTable({
  rows,
  caption,
  empty,
  onChanged,
}: {
  rows: Withdrawal[];
  caption: string;
  empty?: ReactNode;
  onChanged: () => void;
}) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState<Withdrawal | null>(null);

  const columns: Column<Withdrawal>[] = [
    {
      key: "amount",
      header: c.colAmount,
      primary: true,
      cell: (w) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <Money minor={w.gross_minor} currency={w.currency} className="font-semibold" />
          {w.is_sandbox && <SandboxBadge />}
        </span>
      ),
    },
    {
      key: "status",
      header: c.colStatus,
      cell: (w) => (
        <div className="min-w-0">
          <StatusPill status={w.status} />
          {w.failure_reason && (
            <p className="mt-1 break-words text-caption text-text-subtle">{c.failure(w.failure_reason)}</p>
          )}
        </div>
      ),
    },
    { key: "fee", header: c.colFee, align: "right", cell: (w) => <Money minor={w.fee_minor} currency={w.currency} /> },
    {
      key: "receive",
      header: c.colReceive,
      align: "right",
      cell: (w) => <Money minor={w.payout_amount_minor} currency={w.payout_currency} />,
    },
    {
      key: "destination",
      header: c.colDestination,
      cell: (w) => <span className="break-words">{w.destination ?? "—"}</span>,
    },
    {
      key: "reference",
      header: c.colReference,
      cell: (w) => <span className="break-all font-mono text-caption">{w.reference}</span>,
    },
    {
      key: "date",
      header: c.colDate,
      cell: (w) => <span className="whitespace-nowrap text-text-muted">{formatDateTime(w.created_at, locale)}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">{c.cancel}</span>,
      align: "right",
      cell: (w) =>
        w.status === "requested" ? (
          <Button variant="secondary" size="sm" onClick={() => setCancelling(w)}>
            {c.cancel}
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <DataTable rows={rows} columns={columns} getRowKey={(w) => w.id} caption={caption} empty={empty} />
      <ConfirmDialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        title={c.cancelTitle}
        description={cancelling ? c.cancelBody(formatMinor(cancelling.gross_minor, cancelling.currency, locale)) : undefined}
        confirmLabel={c.cancelConfirm}
        danger
        onConfirm={async () => {
          if (!cancelling) return;
          await cancelWithdrawal(cancelling.id);
          toast({ title: c.cancelled, tone: "success" });
          onChanged();
        }}
      />
    </>
  );
}
