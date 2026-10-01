import { Check, MessageCircle } from "lucide-react";
import { Button, Skeleton } from "@/components/ui";
import { formatMoney, usePlans, type Plan } from "@/lib/api/plans";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { isDarkTone, useMuted, useTone } from "./kit";

/**
 * Live plans from GET /api/plans. No placeholder prices: while loading we show
 * skeletons, and if the API can't be reached we say pricing is being updated
 * and point to /contact.
 */
export function PlanCards({ compact }: { compact?: boolean }) {
  const state = usePlans();
  const { t } = useLanguage();
  const tone = useTone();
  const { card, muted } = useMuted();

  if (state.status === "loading") {
    return (
      <div className="grid gap-4 md:grid-cols-3" role="status" aria-label={t("pricing.loading")}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("rounded-card p-6", card)}>
            <Skeleton className={cn("h-5 w-28")} />
            <Skeleton className={cn("mt-5 h-9 w-40")} />
            <Skeleton className={cn("mt-6 h-4 w-full")} />
            <Skeleton className={cn("mt-2.5 h-4 w-4/5")} />
          </div>
        ))}
      </div>
    );
  }

  if (state.status === "unavailable") {
    return (
      <div className={cn("flex flex-col items-start gap-5 rounded-card p-6 sm:flex-row sm:items-center sm:p-8", card)}>
        <span
          aria-hidden
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-control",
            "bg-accent-soft text-accent-text",
          )}
        >
          <MessageCircle className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="t-card">{t("pricing.unavailable_title")}</h3>
          <p className={cn("t-body mt-1.5", muted)}>{t("pricing.unavailable_body")}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button to="/contact" variant={isDarkTone(tone) ? "inverse" : "primary"}>
            {t("cta.contact")}
          </Button>
          <Button variant="outline" onClick={state.reload}>
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ul
        className={cn(
          "grid gap-4",
          state.plans.length === 2 && "md:grid-cols-2",
          state.plans.length >= 3 && "md:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {state.plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} compact={compact} />
        ))}
      </ul>
      <p className={cn("mt-4 text-[0.8125rem]", muted)}>{t("pricing.from_api")}</p>
    </div>
  );
}

function PlanCard({ plan, compact }: { plan: Plan; compact?: boolean }) {
  const { t, locale } = useLanguage();
  const { card, muted, line } = useMuted();
  const period =
    plan.duration === 30 || plan.duration === 31
      ? t("pricing.per_month")
      : plan.duration === 365
        ? t("pricing.per_year")
        : t("pricing.per_days", { days: plan.duration });
  const features = compact ? plan.features.slice(0, 4) : plan.features;

  return (
    <li className={cn("group lift relative flex min-w-0 flex-col overflow-hidden rounded-card p-6 sm:p-7", card)}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#6e16a8,#9e4fe0,#f7931e)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <h3 className="text-[1.125rem] font-bold tracking-[-0.015em]">{plan.name}</h3>
      {plan.description && <p className={cn("mt-1.5 text-body-sm", muted)}>{plan.description}</p>}
      <p className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[2rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums">
          {plan.price === 0 ? t("pricing.free") : formatMoney(plan.price, plan.currency, locale)}
        </span>
        {plan.price !== 0 && <span className={cn("text-body-sm", muted)}>{period}</span>}
      </p>
      <p className={cn("mt-5 border-t pt-5 text-body-sm font-semibold", line)}>
        {plan.max_artists === 1
          ? t("pricing.artists_one")
          : t("pricing.artists_many", { count: plan.max_artists })}
      </p>
      {features.length > 0 && (
        <ul className="mt-3 space-y-2.5">
          {features.map((f) => (
            <li key={f} className={cn("flex gap-2.5 text-body-sm", muted)}>
              <Check
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-accent-text"
              />
              <span className="min-w-0">{f}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-7">
        <Button
          to={`/auth?mode=register&plan=${encodeURIComponent(String(plan.id))}`}
          variant="primary"
          fullWidth
        >
          {t("pricing.choose", { plan: plan.name })}
        </Button>
      </div>
    </li>
  );
}
