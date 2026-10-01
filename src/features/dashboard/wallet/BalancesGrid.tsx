import { Wallet } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";
import { Money } from "@/features/dashboard/components";
import type { Balance } from "@/lib/api/types";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY } from "./copy";

export function BalancesGrid({ balances }: { balances: Balance[] }) {
  const c = useCopy(COPY);

  if (balances.length === 0) {
    return <EmptyState icon={<Wallet />} title={c.balancesEmptyTitle} description={c.balancesEmptyBody} compact />;
  }

  return (
    <>
      <ul data-rail className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-3", balances.length > 1 && "max-sm:rail")}>
        {balances.map((b) => (
          <Card as="li" key={b.currency} padding="md" className={balances.length > 1 ? "max-sm:w-[86%]" : undefined}>
            <h3 className="text-caption font-semibold uppercase tracking-[0.08em] text-text-subtle">
              {c.balanceIn(b.currency)}
            </h3>
            <p className="mt-3 text-body-sm font-medium text-text-muted">{c.available}</p>
            <p className="mt-0.5 break-words text-[1.625rem] font-bold leading-tight tracking-[-0.025em] text-text">
              <Money minor={b.available_minor} currency={b.currency} className="whitespace-normal" />
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border-subtle pt-4">
              {(
                [
                  [c.held, b.held_minor],
                  [c.pending, b.pending_minor],
                  [c.lifetime, b.lifetime_earnings_minor],
                  [c.withdrawn, b.withdrawn_minor],
                ] as const
              ).map(([label, minor]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-caption text-text-subtle">{label}</dt>
                  <dd className="mt-0.5 break-words text-body-sm font-semibold text-text">
                    <Money minor={minor} currency={b.currency} className="whitespace-normal" />
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </ul>

      <details className="mt-3 rounded-control border border-border-subtle px-4 py-3 text-body-sm">
        <summary className="cursor-pointer font-semibold text-text-muted">{c.balancesExplainer}</summary>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {(
            [
              [c.available, c.availableHint],
              [c.held, c.heldHint],
              [c.pending, c.pendingHint],
              [c.lifetime, c.lifetimeHint],
              [c.withdrawn, c.withdrawnHint],
            ] as const
          ).map(([term, hint]) => (
            <div key={term} className="min-w-0">
              <dt className="font-semibold text-text">{term}</dt>
              <dd className="text-text-subtle">{hint}</dd>
            </div>
          ))}
        </dl>
      </details>
    </>
  );
}
