import { CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useResource } from "@/lib/api/useResource";
import { fetchPlans, num, usd } from "@/lib/api/dashboard";
import {
  Badge,
  DataState,
  EmptyState,
  Notice,
  PageHeader,
  Panel,
  SectionLabel,
  Skeleton,
} from "./ui";

/**
 * PLAN — GET /api/plans, plus the subscription fields on GET /api/profile
 *
 * Both halves are live: the current state comes from the authenticated user
 * (`subscription_plan`, `subscription_status`, `subscription_currency`,
 * `payment_method`), and the catalogue comes from the public plans endpoint.
 *
 * WHY THERE IS NO "SUBSCRIBE" BUTTON HERE
 * ---------------------------------------
 * `POST /api/subscribe` exists, but all it does is set
 * `subscription_status = 'active'` from whatever `plan` / `currency` /
 * `payment_method` strings it is handed. It takes no payment, verifies no
 * charge, and talks to no payment provider — none is installed in this backend.
 * Wiring a button to it would hand out paid subscriptions for free, which is a
 * business decision, not a wiring detail. The surface below is therefore
 * accurate about what exists and ready for a real checkout to be attached.
 */
export default function PlanPage() {
  const { user } = useAuth();
  const plans = useResource((signal) => fetchPlans(signal));

  if (!user) return null;

  const active = user.subscription_status === "active";
  const currentName = user.subscription_plan;

  return (
    <>
      <PageHeader
        eyebrow="2K Tunes / Subscription"
        title="Plan"
        lede="What your account is subscribed to right now, and the plans the backend has published."
      />

      <Panel className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
        <div>
          <SectionLabel>Current subscription</SectionLabel>
          <p className="mt-3 text-[1.5rem] font-extrabold tracking-[-0.035em] text-white">
            {currentName || "No plan"}
          </p>
          <p className="mt-1.5 text-[0.8125rem] font-medium text-white/40">
            {user.payment_method ? `Paid by ${user.payment_method} · ` : ""}
            {user.subscription_currency ?? "No billing currency set"}
          </p>
        </div>
        <Badge tone={active ? "positive" : "attention"}>
          {active ? "Active" : (user.subscription_status ?? "inactive")}
        </Badge>
      </Panel>

      {!active && (
        <div className="mt-4">
          <Notice tone="accent" title="Distribution needs an active plan">
            <code className="text-white/60">POST /api/releases/upload</code> is
            behind the <code className="text-white/60">subscribed</code>{" "}
            middleware, which rejects any account whose{" "}
            <code className="text-white/60">subscription_status</code> isn’t{" "}
            <code className="text-white/60">active</code>.
          </Notice>
        </div>
      )}

      <section className="mt-10">
        <SectionLabel>Available plans</SectionLabel>
        <div className="mt-4">
          <DataState
            state={plans}
            skeleton={
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[13rem]" />
                <Skeleton className="h-[13rem]" />
                <Skeleton className="h-[13rem]" />
              </div>
            }
            empty={(list) =>
              list.length === 0 ? (
                <EmptyState
                  icon={<CreditCard className="h-5 w-5" strokeWidth={2} />}
                  title="No plans published yet"
                >
                  <code className="text-white/60">GET /api/plans</code> returned
                  an empty list — the <code className="text-white/60">plans</code>{" "}
                  table has no rows. An administrator adds them in the admin
                  panel, and they’ll appear here automatically.
                </EmptyState>
              ) : null
            }
          >
            {(list) => (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...list]
                  .filter((plan) => plan.is_active !== false)
                  .sort((a, b) => num(a.order) - num(b.order))
                  .map((plan) => {
                    const isCurrent =
                      !!currentName &&
                      currentName.toLowerCase() === plan.name.toLowerCase();
                    return (
                      <Panel
                        as="li"
                        key={plan.id}
                        className={
                          isCurrent ? "border-volt-lit/40 bg-volt/[0.05]" : undefined
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[1.0625rem] font-bold tracking-[-0.02em] text-white">
                            {plan.name}
                          </p>
                          {isCurrent && <Badge tone="accent">Current</Badge>}
                        </div>

                        <p className="mt-4 text-[1.75rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-white">
                          {usd(plan.price)}
                          {plan.duration ? (
                            <span className="text-[0.875rem] font-bold text-white/30">
                              {" "}
                              / {plan.duration} days
                            </span>
                          ) : null}
                        </p>

                        {plan.description && (
                          <p className="mt-3.5 text-[0.8125rem] font-medium leading-relaxed text-white/40">
                            {plan.description}
                          </p>
                        )}

                        {plan.max_artists != null && (
                          <p className="mt-4 border-t border-white/[0.06] pt-3.5 text-[0.8125rem] font-semibold text-white/55">
                            {plan.max_artists} artist
                            {plan.max_artists === 1 ? "" : "s"}
                          </p>
                        )}
                      </Panel>
                    );
                  })}
              </ul>
            )}
          </DataState>
        </div>

        <p className="mt-6 text-[0.75rem] font-medium leading-relaxed text-white/25">
          Prices come straight from the <code>plans</code> table, in the currency
          that table stores. There is no payment provider connected to this
          backend, so subscriptions are activated by 2K Tunes rather than checked
          out here.
        </p>
      </section>
    </>
  );
}
