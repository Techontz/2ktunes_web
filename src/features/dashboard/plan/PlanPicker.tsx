import { useState, type ReactNode } from "react";
import { ArrowRight, Building2, Check, Clock, Crown, Info, Package, UserRound, UsersRound } from "lucide-react";
import { EmptyState, useToast } from "@/components/ui";
import { ConfirmDialog, FormAlert, LoadError, PageLoading } from "@/features/dashboard/components";
import { OfferBadge } from "@/features/growth/OfferPrice";
import { fetchPlanList, fetchSubscription, planPrices, subscribe } from "@/lib/api/account";
import { formatMoney, isYearly } from "@/lib/api/plans";
import type { Plan, SubscriptionInfo } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount, isZeroDecimal, minorToDecimal } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { guessCurrency } from "@/lib/api/payments";
import { COPY, type PlanCopy } from "./copy";
import { CurrencyToggle } from "./CurrencyToggle";
import { PayForPlanDialog } from "./PayForPlanDialog";

/** A plan billed per month (28 to 31 days): its price is already the monthly one. */
const isMonthly = (duration: number | string | null | undefined) => {
  const d = Number(duration);
  return d >= 28 && d <= 31;
};

/**
 * PLAN PICKER
 * ===========
 *
 * Plans are sold per year (the admin enters the yearly price). Cards lead with
 * the monthly equivalent, yearly price ÷ 12, and say what is billed per year;
 * the pay dialog then charges the full yearly amount.
 *
 * Used on My music and the upload gate (variant "hero", with its own heading)
 * and on the Plan page (variant "page", which renders the heading itself).
 * A monthly plan (28 to 31 days) shows its price per month as is; any other
 * period shows the price "for N days". Owns its data and the pay / activate dialogs, and refreshes the
 * signed-in user after a change so gated pages unlock on their own.
 */
export function PlanPicker({
  variant = "hero",
  title,
  intro,
  onChanged,
}: {
  variant?: "hero" | "page";
  title?: string;
  intro?: string;
  onChanged?: () => void;
}) {
  const c = useCopy(COPY);
  const { toast } = useToast();
  const auth = useAuth();
  const plans = useResource((signal) => fetchPlanList({ signal }), []);
  const sub = useResource((signal) => fetchSubscription({ signal }), []);
  const [freePlan, setFreePlan] = useState<Plan | null>(null);
  const [paidPlan, setPaidPlan] = useState<Plan | null>(null);
  // TZS | USD: the server's default (Tanzania → TZS), else the profile country or browser language.
  const [picked, setPicked] = useState<string | null>(null);

  const afterChange = () => {
    sub.reload();
    void auth.refresh();
    onChanged?.();
  };

  if (plans.loading || sub.loading) return <PageLoading />;
  const error = sub.error ?? plans.error;
  if (error && (!sub.data || !plans.data)) {
    return (
      <LoadError
        error={error}
        onRetry={() => {
          if (sub.error) sub.reload();
          if (plans.error) plans.reload();
        }}
      />
    );
  }

  const info = sub.data as SubscriptionInfo;
  const list = (plans.data ?? []).filter((p) => p.is_active !== false);
  const pay = info.pending_payment;
  const hero = variant === "hero";

  // TZS and USD are always offered; every plan carries a price in both (set in the admin).
  const currencies = [...new Set(["TZS", "USD", ...list.flatMap((p) => planPrices(p).map((x) => x.currency))])].sort((a, b) =>
    a === "TZS" ? -1 : b === "TZS" ? 1 : a.localeCompare(b),
  );
  const preferred = picked ?? info.default_currency ?? guessCurrency(auth.user?.country);
  const currency = currencies.includes(preferred) ? preferred : (currencies[0] ?? "TZS");

  const elevate = list.length >= 3 && list.some((p) => info.subscription_status === "active" && info.plan?.id === p.id);

  return (
    <section aria-labelledby={hero ? "plan-picker-title" : undefined} aria-label={hero ? undefined : c.plansTitle}>
      {hero && (
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="plan-picker-title" className="text-[1.75rem] font-bold leading-tight tracking-[-0.03em] text-text sm:text-[2.25rem]">
            {title ?? c.pickerTitle}
          </h2>
          <p className="mt-3 text-body text-text-muted sm:text-[1.0625rem]">{intro ?? c.pickerIntro}</p>
        </div>
      )}

      {/* The Plan page lists pending payments in full above the cards. */}
      {pay && hero && (
        <FormAlert tone="warning" className="mx-auto mt-6 max-w-2xl">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
            <div className="min-w-0">
              <p className="font-semibold">{c.pendingTitle}</p>
              <p className="mt-0.5 text-text-muted">{c.pendingBody}</p>
            </div>
          </div>
        </FormAlert>
      )}

      {list.length > 0 && (
        <div className={cn("flex items-center gap-3", hero ? "mt-6 justify-center" : "mx-auto mt-6 max-w-[70rem] justify-end")}>
          <span className="text-[0.875rem] font-semibold text-[#5f617d]">{c.currencyLegend}</span>
          <CurrencyToggle label={c.currency} value={currency} options={currencies} onChange={setPicked} />
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={<Package />} title={c.plansEmptyTitle} description={c.plansEmptyBody} compact className="mt-8" />
      ) : (
        <>
          <ul
            className={cn(
              "mx-auto grid gap-5",
              hero ? "mt-8 sm:mt-10" : "mt-6 lg:mt-8",
              currencies.length > 1 && (hero ? "!mt-5" : "!mt-4"),
              list.length === 1 && "max-w-[23rem]",
              list.length === 2 && "max-w-[46rem] md:grid-cols-2",
              list.length >= 3 &&
                "max-w-[70rem] md:grid-cols-2 lg:grid-cols-3 md:max-lg:[&>li:last-child:nth-child(odd)]:col-span-2 md:max-lg:[&>li:last-child:nth-child(odd)]:mx-auto md:max-lg:[&>li:last-child:nth-child(odd)]:w-[calc(50%-0.625rem)]",
            )}
          >
            {list.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                info={info}
                currency={currency}
                c={c}
                elevate={elevate}
                onChoose={() => (isZeroDecimal(p.price) ? setFreePlan(p) : setPaidPlan(p))}
              />
            ))}
          </ul>
          {list.some((p) => isYearly(p.duration) && !isZeroDecimal(p.price)) && (
            <p
              className={cn(
                "flex items-center gap-2 text-[0.8125rem] text-[#7e7799] sm:text-[0.875rem]",
                hero ? "mt-6 justify-center text-center" : "mx-auto mt-6 max-w-[70rem]",
              )}
            >
              <Info className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {c.yearlyNote}
            </p>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!freePlan}
        onClose={() => setFreePlan(null)}
        title={freePlan ? c.freeTitle(freePlan.name) : ""}
        description={c.freeBody}
        confirmLabel={c.freeConfirm}
        onConfirm={async () => {
          if (!freePlan) return;
          await subscribe({ plan_id: freePlan.id });
          toast({ title: c.activated(freePlan.name), tone: "success" });
          afterChange();
        }}
      />
      <PayForPlanDialog
        plan={paidPlan}
        instructions={info?.payment_instructions}
        currency={currency}
        onCurrencyChange={setPicked}
        onClose={() => setPaidPlan(null)}
        onPaid={() => afterChange()}
        onActivated={(p) => {
          setPaidPlan(null);
          toast({ title: c.activated(p.name), description: c.activatedBody, tone: "success" });
          afterChange();
        }}
      />
    </section>
  );
}

/** Plan size icon: one artist, two artists, or a label / roster (3+). */
function PlanIcon({ maxArtists }: { maxArtists: number | null | undefined }) {
  const n = Number(maxArtists ?? 1);
  const Icon = n >= 3 ? Building2 : n === 2 ? UsersRound : UserRound;
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f1ecfd] text-[#3a22b4]">
      <Icon className="h-[1.375rem] w-[1.375rem]" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

function FeatureItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#f1ecfc]">
        <Check className="h-3.5 w-3.5 text-[#3520b5]" strokeWidth={3.25} aria-hidden />
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

function PlanCard({
  plan,
  info,
  currency,
  c,
  elevate,
  onChoose,
}: {
  plan: Plan;
  info: SubscriptionInfo;
  /** The currency picked above the cards; a plan not sold in it shows its main price. */
  currency: string;
  c: PlanCopy;
  /** Lift the current card above its row (desktop, three or more plans). */
  elevate: boolean;
  onChoose: () => void;
}) {
  const { locale, t } = useLanguage();
  const free = isZeroDecimal(plan.price);
  const yearly = isYearly(plan.duration);
  const monthly = isMonthly(plan.duration);
  const all = planPrices(plan);
  const main = all.find((p) => p.currency === currency) ?? all[0];
  const others = all.filter((p) => p !== main);
  const isCurrent = info.subscription_status === "active" && info.plan?.id === plan.id;
  const isPending = !isCurrent && info.pending_payment?.plan_id === plan.id;
  const features = (plan.features ?? []).filter((f) => typeof f === "string" && f.trim());
  const headingId = `plan-${plan.id}-name`;
  // GET /plans quotes the offer in the plan's main currency (my own eligibility); shown only in that currency.
  const offer = !free && plan.offer && plan.offer.currency === main.currency ? plan.offer : null;

  const money = (amount: number, currency: string) => formatMoney(amount, currency, locale);
  const fromMinor = (minor: number, currency: string) => Number(minorToDecimal(minor, currency));
  const listAmount = Number(main.amount);
  const payAmount = offer ? fromMinor(offer.final_minor, offer.currency) : listAmount;
  const discounted = !!offer && offer.final_minor < offer.list_minor;

  const bigPrice = "text-[2.25rem] font-extrabold leading-none tracking-[-0.035em] tabular-nums text-[#0b0a14] xl:text-[2.375rem]";
  const perUnit = "text-[0.9375rem] text-[#65648a]";
  const subLine = "text-[0.875rem] text-[#5f617d]";

  return (
    <li
      aria-labelledby={headingId}
      className={cn(
        "relative flex min-w-0 flex-col rounded-[18px]",
        isCurrent
          ? "max-md:order-first border-2 border-[#7559da] bg-gradient-to-r from-[#4b27a0] via-[#6a31c1] to-[#b265f5] shadow-[0_0_0_4px_rgb(167_139_250/0.14),0_18px_44px_-12px_rgb(118_72_230/0.42),0_0_36px_0_rgb(150_110_240/0.28)]"
          : isPending
            ? "border border-[#f1d9b4] bg-[#fdf3e6]"
            : "border border-[#ece8f4] bg-white shadow-[0_12px_30px_-22px_rgb(72_52_150/0.22)]",
        isCurrent && elevate && "lg:-my-2.5",
      )}
    >
      {(isCurrent || isPending) && (
        <p
          className={cn(
            "relative flex min-h-9 flex-wrap items-center justify-center gap-x-2 px-4 py-1.5 text-[0.875rem] font-bold",
            isCurrent ? "text-white" : "text-warning",
          )}
        >
          {isCurrent ? (
            <Crown className="h-3.5 w-3.5 fill-[#f5c6ff] text-[#f5c6ff]" aria-hidden />
          ) : (
            <Clock className="h-3.5 w-3.5" aria-hidden />
          )}
          {isCurrent ? c.current : c.pendingMarker}
          {isCurrent && info.expires_at && (
            <span className="font-medium text-white/80">· {c.activeUntil(formatDate(info.expires_at, locale))}</span>
          )}
          {/* The band dips into the card at its centre, like a tab. */}
          {isCurrent && (
            <span aria-hidden className="absolute left-1/2 top-[calc(100%-1px)] z-[1] h-[6px] w-20 -translate-x-1/2 rounded-b-[100%] bg-[#7136c9]" />
          )}
        </p>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col bg-white p-5 sm:p-6",
          isCurrent || isPending ? "rounded-[16px] sm:pt-5" : "rounded-[17px]",
        )}
      >
        <div className="flex items-start gap-4">
          <PlanIcon maxArtists={plan.max_artists} />
          <div className="min-w-0 pt-0.5">
            <h3 id={headingId} className="text-[1.25rem] font-bold leading-tight tracking-[-0.02em] text-[#0b0a14]">
              {plan.name}
            </h3>
            {plan.description && (
              <p className="mt-1 text-[0.875rem] leading-[1.45] text-[#65648a]">{plan.description}</p>
            )}
          </div>
        </div>

        <div className="mt-5" aria-live="off">
          {free || payAmount <= 0 ? (
            <>
              {!free && (
                <p className="text-body-sm text-[#8d8aa8]">
                  <s>{c.billedYearly(money(listAmount, main.currency))}</s>
                </p>
              )}
              <p className={bigPrice}>
                {offer?.free_days ? t("offer.free_days", { days: offer.free_days }) : c.free}
              </p>
            </>
          ) : yearly || monthly ? (
            <>
              {discounted && (
                <p className="mb-1 text-[0.875rem] text-[#8d8aa8]">
                  <s>{money(yearly ? listAmount / 12 : listAmount, main.currency)}</s>
                </p>
              )}
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className={bigPrice}>{money(yearly ? payAmount / 12 : payAmount, main.currency)}</span>
                <span className={perUnit}>{c.slashMonth}</span>
              </p>
              {yearly && <p className={cn("mt-2", subLine)}>{c.billedYearly(money(payAmount, main.currency))}</p>}
            </>
          ) : (
            <>
              <p className={bigPrice}>{money(payAmount, main.currency)}</p>
              {plan.duration ? <p className={cn("mt-2", subLine)}>{c.perDays(formatCount(plan.duration, locale))}</p> : null}
            </>
          )}
          {!free && others.length > 0 && (
            <p className="mt-1 text-[0.8125rem] text-[#8d8aa8]">
              {others.map((p) => c.orPrice(money(Number(p.amount), p.currency))).join(" · ")}
            </p>
          )}
          {offer?.headline && <OfferBadge className="mt-3">{offer.headline}</OfferBadge>}
        </div>

        <ul className="mt-5 space-y-2.5 border-t border-[#eeedf3] pt-5 text-[0.875rem] leading-[1.45] text-[#3d3762] sm:text-[0.90625rem]">
          {plan.max_artists != null && (
            <FeatureItem>
              {Number(plan.max_artists) === 1 ? c.oneArtist : c.maxArtists(formatCount(plan.max_artists, locale))}
            </FeatureItem>
          )}
          {features.map((f) => (
            <FeatureItem key={f}>{f}</FeatureItem>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          {isCurrent && free ? null : (
            <button
              type="button"
              onClick={onChoose}
              aria-label={isCurrent ? c.renewPlan(plan.name) : c.choosePlan(plan.name)}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] px-4 text-[0.9375rem] transition-[filter,background-color]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6a31c1]",
                isCurrent
                  ? "bg-[#ede7fb] font-bold text-[#2a1aa6] hover:bg-[#e4dcf9]"
                  : "bg-gradient-to-r from-[#5a2eb1] to-[#8a44e2] font-semibold text-white hover:brightness-110 active:brightness-95",
              )}
            >
              {isCurrent ? c.renewCta : c.choose}
              {!isCurrent && <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/** Stands in for the upload pages until a plan is active (see RequirePlan). */
export function PlanGate() {
  const c = useCopy(COPY);
  return (
    <div className="pb-4 pt-2 sm:pt-6">
      <PlanPicker title={c.gateTitle} intro={c.gateIntro} />
    </div>
  );
}
