import { useState } from "react";
import { Check, Package } from "lucide-react";
import { Button, Skeleton } from "@/components/ui";
import { currenciesOf, formatMoney, priceIn, usePlans, type Plan } from "@/lib/api/plans";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { OfferPrice } from "@/features/growth/OfferPrice";
import { isDarkTone, useMuted, useTone } from "./kit";

/**
 * Plans as the admin set them up (GET /api/plans), with a TZS / USD switch
 * when any plan has a USD price. Always shows plans: if the API is down we
 * fall back to the last list this browser saw, then to the launch plans.
 */
export function PlanCards() {
  const [chosen, setChosen] = useState("TZS");
  // Re-fetched per currency so each plan's `offer` is quoted in it.
  const state = usePlans(chosen);
  const { t } = useLanguage();
  const tone = useTone();
  const { card, muted } = useMuted();

  if (state.status === "loading") {
    return (
      <div className="grid gap-4 md:grid-cols-2" role="status" aria-label={t("pricing.loading")}>
        {[0, 1].map((i) => (
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

  if (state.status === "empty") {
    return (
      <div className={cn("flex flex-col items-start gap-5 rounded-card p-6 sm:flex-row sm:items-center sm:p-8", card)}>
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-text">
          <Package className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="t-card">{t("pricing.unavailable_title")}</h3>
          <p className={cn("t-body mt-1.5", muted)}>{t("pricing.unavailable_body")}</p>
        </div>
        <Button to="/contact" variant={isDarkTone(tone) ? "inverse" : "primary"} className="shrink-0">
          {t("cta.contact")}
        </Button>
      </div>
    );
  }

  const currencies = currenciesOf(state.plans);
  const currency = currencies.includes(chosen) ? chosen : currencies[0];

  return (
    <div>
      {currencies.length > 1 && (
        <CurrencySwitch currencies={currencies} value={currency} onChange={setChosen} />
      )}
      <ul
        data-rail
        className={cn(
          "grid gap-4",
          state.plans.length > 1 && "max-sm:rail",
          state.plans.length === 2 && "md:grid-cols-2",
          state.plans.length >= 3 && "md:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {state.plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} currency={currency} />
        ))}
      </ul>
      <p className={cn("mt-4 text-[0.8125rem]", muted)}>
        {state.source === "live" ? t("pricing.from_api") : t("pricing.offline_note")}
      </p>
    </div>
  );
}

function CurrencySwitch({
  currencies,
  value,
  onChange,
}: {
  currencies: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  const { t } = useLanguage();
  const { muted, line } = useMuted();
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 sm:mb-6">
      <span id="plan-currency-label" className={cn("text-body-sm font-semibold", muted)}>
        {t("pricing.currency_label")}
      </span>
      <div role="radiogroup" aria-labelledby="plan-currency-label" className={cn("inline-flex rounded-full border p-1", line)}>
        {currencies.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === value}
            onClick={() => onChange(c)}
            className={cn(
              "min-w-[3.5rem] rounded-full px-3.5 py-1.5 text-body-sm font-bold transition-colors",
              c === value ? "bg-accent text-white" : cn(muted, "hover:text-current"),
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan, currency }: { plan: Plan; currency: string }) {
  const { t, locale } = useLanguage();
  const { card, muted, line } = useMuted();
  const period =
    plan.duration === 365 || plan.duration === 366
      ? t("pricing.per_year")
      : plan.duration === 30 || plan.duration === 31
        ? t("pricing.per_month")
        : t("pricing.per_days", { days: plan.duration });
  // A plan without a price in the chosen currency shows its main price instead.
  const price = priceIn(plan, currency) ?? { currency: plan.currency, amount: plan.price };
  const free = price.amount === 0;
  const offer = plan.offer && plan.offer.currency === price.currency && !free ? plan.offer : null;
  const fmt = (minor: number, cur: string) => formatMoney(minor / 100, cur, locale);

  return (
    <li className={cn("group lift relative flex min-w-0 flex-col overflow-hidden rounded-card p-5 max-sm:w-[84%] max-sm:max-w-[21rem] sm:p-7", card)}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#6e16a8,#9e4fe0,#f7931e)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <h3 className="text-[1.125rem] font-bold tracking-[-0.015em]">{plan.name}</h3>
      {plan.description && <p className={cn("mt-1.5 text-body-sm", muted)}>{plan.description}</p>}
      {offer ? (
        <OfferPrice offer={offer} format={fmt} period={period} mutedClass={muted} className="mt-4 sm:mt-6" />
      ) : (
        <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:mt-6">
          <span className="text-[1.75rem] font-extrabold sm:text-[2rem] leading-none tracking-[-0.03em] tabular-nums">
            {free ? t("pricing.free") : formatMoney(price.amount, price.currency, locale)}
          </span>
          {!free && <span className={cn("text-body-sm", muted)}>{period}</span>}
        </p>
      )}
      {price.currency !== currency && (
        <p className={cn("mt-2 text-[0.8125rem]", muted)}>{t("pricing.only_in", { currency: price.currency })}</p>
      )}
      <ul className={cn("mt-5 space-y-2.5 border-t pt-5", line)}>
        <li className="flex gap-2.5 text-body-sm font-semibold">
          <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
          <span className="min-w-0">
            {plan.max_artists === 1
              ? t("pricing.artists_one")
              : t("pricing.artists_many", { count: plan.max_artists })}
          </span>
        </li>
        {plan.features.map((f) => (
          <li key={f} className={cn("flex gap-2.5 text-body-sm", muted)}>
            <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
            <span className="min-w-0">{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6 sm:pt-7">
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
