import { BadgeCheck, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui";
import { StatusPill } from "@/features/dashboard/components";
import type { MetricsSource, OrderStatus, SocialAccount } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { REQ_COPY } from "./requestCopy";

/**
 * Provenance label for creator metrics. Self-reported numbers get a neutral,
 * visibly different badge; verified ones get a success badge with a check.
 */
export function MetricsBadge({ source, className }: { source: MetricsSource | string | null | undefined; className?: string }) {
  const { t } = useLanguage();
  const key = source === "admin_verified" || source === "platform_verified" ? source : "self_reported";
  const verified = key !== "self_reported";
  return (
    <Badge tone={verified ? "success" : "neutral"} size="sm" className={className}>
      {verified ? (
        <BadgeCheck className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
      ) : (
        <CircleHelp className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
      )}
      {t(`metrics.${key}`)}
    </Badge>
  );
}

/** Summary provenance across all accounts of a creator (used on browse cards). */
export function TotalMetricsBadge({
  accounts,
  hasVerified,
}: {
  accounts: SocialAccount[];
  hasVerified: boolean;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  if (!hasVerified) {
    return (
      <Badge tone="neutral" size="sm">
        <CircleHelp className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
        {t("metrics.self_reported")}
      </Badge>
    );
  }
  const allVerified = accounts.length > 0 && accounts.every((a) => a.metrics_source && a.metrics_source !== "self_reported");
  return (
    <Badge tone={allVerified ? "success" : "info"} size="sm">
      <BadgeCheck className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
      {allVerified ? c.metricsVerified : c.metricsPartly}
    </Badge>
  );
}

/** Statuses the orders list can be filtered by, in lifecycle order. */
export const ORDER_STATUSES = [
  "requested",
  "under_review",
  "forwarded",
  "awaiting_payment",
  "pending_payment",
  "in_progress",
  "submitted",
  "disputed",
  "completed",
  "rejected",
  "declined",
  "expired",
  "cancelled",
  "refunded",
] as const satisfies readonly OrderStatus[];

/** Order status badge with the marketplace's own wording (e.g. "Delivered, being verified"). */
export function OrderStatusPill({
  status,
  size = "sm",
  role,
}: {
  status: OrderStatus | string;
  size?: "sm" | "md";
  role?: "buyer" | "creator";
}) {
  const r = useCopy(REQ_COPY);
  const label = role === "creator" && status === "forwarded" ? r.newRequest : r.status[status as OrderStatus];
  return <StatusPill status={status} label={label} size={size} />;
}
