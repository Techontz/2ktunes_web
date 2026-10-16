import { useState } from "react";
import { CalendarX2, Clock } from "lucide-react";
import { DefinitionList, FormAlert, LoadError, PageLoading } from "@/features/dashboard/components";
import { fetchSubscription } from "@/lib/api/account";
import type { SubscriptionInfo } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatMinor } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY, type PlanCopy } from "./copy";
import { PaymentReturn } from "./PaymentReturn";
import { PlanPicker } from "./PlanPicker";

/**
 * PLANS & BILLING
 *
 * Also where Stripe Checkout and PayPal send the artist back
 * (?payment={id}&result=success|cancel): see PaymentReturn.
 *
 * Where artists pick, change or renew a plan. The header, then any payment
 * awaiting confirmation (in full) or an expired plan, then the plan cards
 * (PlanPicker, variant "page"): the current plan carries a "Current plan"
 * band and a Renew button, the others open the pay dialog.
 */
export default function PlanPage() {
  const c = useCopy(COPY);
  const sub = useResource((signal) => fetchSubscription({ signal }), []);
  // Remounts the picker after a payment confirmed on return from Stripe or PayPal.
  const [pickerKey, setPickerKey] = useState(0);

  return (
    <>
      {/* Soft lavender wash with faint light streaks (CSS only). */}
      <div aria-hidden className="plan-backdrop" />
      <div className="relative z-[1] w-full">
        <PlanHeader c={c} />
        {sub.loading ? (
          <PageLoading />
        ) : sub.error || !sub.data ? (
          <div className="mt-8">
            <LoadError error={sub.error} onRetry={sub.reload} />
          </div>
        ) : (
          <>
            <PaymentReturn
              c={c}
              onConfirmed={() => {
                sub.reload();
                setPickerKey((k) => k + 1);
              }}
            />
            <SubscriptionNotice info={sub.data} c={c} />
            <PlanPicker key={pickerKey} variant="page" onChanged={sub.reload} />
          </>
        )}
      </div>
    </>
  );
}

function PlanHeader({ c }: { c: PlanCopy }) {
  return (
    <header className="mx-auto flex max-w-[70rem] items-start justify-between gap-10">
      <div className="min-w-0">
        <p className="text-[0.75rem] font-semibold uppercase leading-none tracking-[0.14em] text-[#7a3fe4]">{c.eyebrow}</p>
        <h1 className="mt-2.5 text-[1.875rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0b0a14] sm:text-[2.25rem]">
          {c.changePlanTitle}
        </h1>
        <p className="mt-2 max-w-[48rem] text-[0.9375rem] leading-snug text-[#3a3560] sm:text-[1rem]">
          {c.plansDesc}
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-5 pr-1 pt-1 lg:flex">
        <Waveform />
        <p className="font-hand text-[1.125rem] font-light leading-[1.3] text-[#443c71]">
          {c.taglineTop}
          <br />
          {c.taglineBottom}
        </p>
      </div>
    </header>
  );
}

/** Thin equaliser bars, the brand's "sound" motif. */
function Waveform() {
  const bars = [10, 18, 28, 52, 34, 20, 12, 22, 14];
  return (
    <svg aria-hidden width="44" height="44" viewBox="0 0 54 54" fill="none" className="text-[#7c48e6]">
      {bars.map((h, i) => {
        const x = 3 + i * 6;
        return <line key={i} x1={x} x2={x} y1={27 - h / 2} y2={27 + h / 2} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />;
      })}
    </svg>
  );
}

/** A payment being checked (in full) or a plan that has run out. */
function SubscriptionNotice({ info, c }: { info: SubscriptionInfo; c: PlanCopy }) {
  const { locale } = useLanguage();
  const pay = info.pending_payment;

  if (pay) {
    return (
      <FormAlert tone="warning" className="mx-auto mt-6 max-w-[70rem]">
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
    );
  }

  if (info.subscription_status === "expired") {
    return (
      <FormAlert tone="warning" className="mx-auto mt-6 max-w-[70rem]">
        <div className="flex items-start gap-3">
          <CalendarX2 className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <div className="min-w-0">
            {info.plan?.name && info.expires_at && (
              <p className="font-semibold">
                {info.plan.name} · {c.expiredLabel} {formatDate(info.expires_at, locale)}
              </p>
            )}
            <p className="mt-0.5 text-text-muted">{c.expiredBody}</p>
          </div>
        </div>
      </FormAlert>
    );
  }

  return null;
}
