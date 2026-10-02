import { ArrowRight, Hourglass, Lock, Wallet } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { InlineLoading, LoadError, Money } from "@/features/dashboard/components";
import { fetchCreatorEarnings } from "@/lib/api/growth";
import { useResource } from "@/lib/api/useResource";
import { useLanguage } from "@/lib/LanguageContext";
import { formatBp } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { WORK_COPY } from "./workCopy";

/**
 * GET /creator/earnings. Pending money is the creator's share of paid orders
 * still held by 2kTunes: shown, but clearly not withdrawable. Available is
 * the wallet balance.
 */
export function EarningsPanel() {
  const w = useCopy(WORK_COPY);
  const { locale } = useLanguage();
  const res = useResource((signal) => fetchCreatorEarnings({ signal }), []);

  if (res.loading) return <InlineLoading />;
  if (res.error || !res.data) return <LoadError error={res.error} onRetry={res.reload} />;
  const { earnings, platform_fee_bp } = res.data;

  return (
    <div className="space-y-5">
      <p className="max-w-[65ch] text-body-sm text-text-muted">{w.earningsIntro}</p>
      {earnings.length === 0 ? (
        <EmptyState compact icon={<Wallet />} title={w.noEarnings} />
      ) : (
        <ul className="space-y-4">
          {earnings.map((e) => (
            <li key={e.currency} className="grid gap-3 sm:grid-cols-2">
              <Card variant="sunken" className="flex flex-col gap-2" aria-labelledby={`pending-${e.currency}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p id={`pending-${e.currency}`} className="flex items-center gap-2 text-body-sm font-semibold text-text-muted">
                    <Hourglass className="h-4 w-4 text-warning" aria-hidden />
                    {w.pending} · {e.currency}
                  </p>
                  <Badge tone="warning" size="sm">
                    <Lock className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
                    {w.notWithdrawable}
                  </Badge>
                </div>
                <Money minor={e.pending_minor} currency={e.currency} className="text-[1.75rem] font-extrabold leading-tight text-text" />
                <p className="text-caption text-text-subtle">{w.pendingOrders(e.pending_orders)}</p>
                <p className="text-caption text-text-muted">{w.pendingHint}</p>
              </Card>
              <Card className="flex flex-col gap-2" aria-labelledby={`available-${e.currency}`}>
                <p id={`available-${e.currency}`} className="flex items-center gap-2 text-body-sm font-semibold text-text-muted">
                  <Wallet className="h-4 w-4 text-success" aria-hidden />
                  {w.available} · {e.currency}
                </p>
                <Money minor={e.available_minor} currency={e.currency} className="text-[1.75rem] font-extrabold leading-tight text-text" />
                <p className="text-caption text-text-subtle">
                  {w.lifetime}: <Money minor={e.lifetime_earned_minor} currency={e.currency} className="font-semibold" />
                </p>
                <p className="text-caption text-text-muted">{w.availableHint}</p>
                <div className="mt-auto pt-1">
                  <Button to="/dashboard/wallet" variant="secondary" size="sm" rightIcon={<ArrowRight />}>
                    {w.toWallet}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="text-caption text-text-subtle">{w.feeNote(formatBp(platform_fee_bp ?? 1500, locale))}</p>
    </div>
  );
}
