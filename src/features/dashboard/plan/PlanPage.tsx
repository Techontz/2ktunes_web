import { useState } from "react";
import { Check, Clock, Package } from "lucide-react";
import { Badge, Button, Card, EmptyState, useToast } from "@/components/ui";
import {
  ConfirmDialog,
  DefinitionList,
  FormAlert,
  LoadError,
  PageHeader,
  PageLoading,
  Section,
  StatusPill,
} from "@/features/dashboard/components";
import { fetchPlanList, fetchSubscription, planPrices, subscribe } from "@/lib/api/account";
import type { Plan, SubscriptionInfo } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount, formatDecimal, formatMinor, isZeroDecimal } from "@/lib/money";
import { OfferPrice } from "@/features/growth/OfferPrice";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY, type PlanCopy } from "./copy";
import { PayForPlanDialog } from "./PayForPlanDialog";

export default function PlanPage() {
  const c = useCopy(COPY);
  const { toast } = useToast();
  const auth = useAuth();
  const plans = useResource((signal) => fetchPlanList({ signal }), []);
  const sub = useResource((signal) => fetchSubscription({ signal }), []);
  const [freePlan, setFreePlan] = useState<Plan | null>(null);
  const [paidPlan, setPaidPlan] = useState<Plan | null>(null);

  const afterChange = () => {
    sub.reload();
    void auth.refresh();
  };

  if (plans.loading || sub.loading) return <PageLoading />;

  const error = sub.error ?? plans.error;
  if (error && (!sub.data || !plans.data)) {
    return (
      <>
        <PageHeader title={c.title} description={c.intro} />
        <LoadError
          error={error}
          onRetry={() => {
            if (sub.error) sub.reload();
            if (plans.error) plans.reload();
          }}
        />
      </>
    );
  }

  const info = sub.data as SubscriptionInfo;
  const list = (plans.data ?? []).filter((p) => p.is_active !== false);

  return (
    <>
      <PageHeader title={c.title} description={c.intro} />

      <div className="space-y-10">
        <Section id="current" title={c.currentTitle}>
          <CurrentSubscription info={info} c={c} />
        </Section>

        <Section id="plans" title={c.plansTitle} description={c.plansDesc}>
          {list.length === 0 ? (
            <EmptyState icon={<Package />} title={c.plansEmptyTitle} description={c.plansEmptyBody} compact />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  info={info}
                  c={c}
                  onChoose={() => (isZeroDecimal(p.price) ? setFreePlan(p) : setPaidPlan(p))}
                />
              ))}
            </ul>
          )}
        </Section>
      </div>

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
        onClose={() => setPaidPlan(null)}
        onSubmitted={() => {
          setPaidPlan(null);
          toast({ title: c.submitted, tone: "success" });
          afterChange();
        }}
        onActivated={(p) => {
          setPaidPlan(null);
          toast({ title: c.activated(p.name), description: c.activatedBody, tone: "success" });
          afterChange();
        }}
      />
    </>
  );
}

function CurrentSubscription({ info, c }: { info: SubscriptionInfo; c: PlanCopy }) {
  const { locale } = useLanguage();
  const status = info.subscription_status;
  const pay = info.pending_payment;

  return (
    <Card padding="md" className="space-y-5">
      <DefinitionList
        columns={3}
        items={[
          { label: c.planLabel, value: <span className="font-semibold">{info.plan?.name ?? c.noPlan}</span> },
          { label: c.statusLabel, value: <StatusPill status={status} /> },
          {
            label: status === "expired" ? c.expiredLabel : c.expiresLabel,
            value: formatDate(info.expires_at, locale),
            hidden: !info.expires_at,
          },
        ]}
      />
      {status === "inactive" && !pay && <p className="text-body-sm text-text-muted">{c.inactiveBody}</p>}
      {status === "expired" && <p className="text-body-sm text-text-muted">{c.expiredBody}</p>}
      {pay && (
        <FormAlert tone="warning">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="font-semibold">{c.pendingTitle}</p>
                <p className="mt-0.5 text-text-muted">{c.pendingBody}</p>
              </div>
              <DefinitionList
                items={[
                  { label: c.pendingPlan, value: pay.plan?.name ?? "-", hidden: !pay.plan },
                  { label: c.pendingMethod, value: c.methods[pay.method] ?? pay.method },
                  { label: c.pendingReference, value: <span className="break-all font-mono">{pay.payer_reference}</span> },
                  { label: c.pendingAmount, value: formatMinor(pay.amount_minor, pay.currency, locale) },
                  { label: c.pendingSubmitted, value: formatDate(pay.created_at, locale) },
                ]}
              />
            </div>
          </div>
        </FormAlert>
      )}
    </Card>
  );
}

function PlanCard({
  plan,
  info,
  c,
  onChoose,
}: {
  plan: Plan;
  info: SubscriptionInfo;
  c: PlanCopy;
  onChoose: () => void;
}) {
  const { locale } = useLanguage();
  const free = isZeroDecimal(plan.price);
  const [main, ...others] = planPrices(plan);
  const isCurrent = info.subscription_status === "active" && info.plan?.id === plan.id;
  const isPending = info.pending_payment?.plan_id === plan.id;
  const features = (plan.features ?? []).filter((f) => typeof f === "string" && f.trim());
  const headingId = `plan-${plan.id}-name`;
  // GET /plans quotes the offer in the plan's main currency (my own eligibility).
  const offer = !free && plan.offer && plan.offer.currency === main.currency ? plan.offer : null;

  return (
    <Card
      as="li"
      padding="md"
      aria-labelledby={headingId}
      className={cn("flex flex-col", isCurrent && "border-accent-text")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={headingId} className="text-h4 font-bold text-text">
          {plan.name}
        </h3>
        {isCurrent && (
          <Badge tone="accent" size="sm">
            {c.current}
          </Badge>
        )}
        {!isCurrent && isPending && (
          <Badge tone="warning" size="sm">
            {c.pendingMarker}
          </Badge>
        )}
      </div>
      {offer ? (
        <OfferPrice
          offer={offer}
          size="md"
          className="mt-3"
          format={(minor, cur) => formatMinor(minor, cur, locale)}
          period={plan.duration === 365 || plan.duration === 366 ? c.perYear : plan.duration ? c.perDays(formatCount(plan.duration, locale)) : undefined}
        />
      ) : (
        <p className="mt-3 break-words text-[1.625rem] font-bold leading-tight tracking-[-0.025em] text-text">
          {free ? c.free : formatDecimal(main.amount, main.currency, locale)}
        </p>
      )}
      {!free && others.length > 0 && (
        <p className="text-body-sm font-semibold text-text-muted">
          {others.map((p) => c.orPrice(formatDecimal(p.amount, p.currency, locale))).join(" · ")}
        </p>
      )}
      {plan.duration && !offer ? (
        <p className="text-body-sm text-text-subtle">
          {plan.duration === 365 || plan.duration === 366 ? c.perYear : c.perDays(formatCount(plan.duration, locale))}
        </p>
      ) : null}
      {plan.description && <p className="mt-3 text-body-sm text-text-muted">{plan.description}</p>}

      <ul className="mt-4 space-y-2 text-body-sm text-text">
        {plan.max_artists != null && (
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            {plan.max_artists === 1 ? c.oneArtist : c.maxArtists(formatCount(plan.max_artists, locale))}
          </li>
        )}
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            <span className="min-w-0 break-words">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        {isCurrent && free ? null : (
          <Button
            fullWidth
            variant={isCurrent ? "secondary" : "primary"}
            onClick={onChoose}
            aria-label={isCurrent ? c.renewPlan(plan.name) : c.choosePlan(plan.name)}
          >
            {isCurrent ? c.renew : c.choose}
          </Button>
        )}
      </div>
    </Card>
  );
}
