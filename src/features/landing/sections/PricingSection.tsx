import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import {
  RECOMMENDED_PLAN_ID,
  formatPeriod,
  priceParts,
  type Plan,
} from "@/config/pricing";
import { usePlans } from "@/lib/usePlans";
import { Band, Card, Eyebrow, Reveal } from "../ui";
import { cn } from "@/lib/utils";

/**
 * PRICING
 * =======
 *
 * Both currencies are shown side by side rather than behind a toggle. TZS leads
 * because Tanzania is the primary market, USD sits beside it because that is the
 * value the backend actually stores (`plans.price`, labelled "Price (USD)" in
 * the admin) and the international reference an artist in Lagos or Nairobi needs.
 * A switcher would have hidden half of that behind an interaction for no gain.
 *
 * Everything visual here is CSS gradients, rings, box-shadows and transform
 * transitions. No backdrop-filter and no animated blur textures — the hero's
 * 60fps was won by removing exactly those, and this section is not going to give
 * it back.
 */

/* ── Feature check ──────────────────────────────────────────────────── */

function FeatureCheck({ featured }: { featured: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-[0.15rem] flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
        featured ? "bg-white" : "bg-lime",
      )}
    >
      <Check
        className="h-2.5 w-2.5"
        strokeWidth={3.6}
        color={featured ? "#4A11CC" : "#0E0E0E"}
      />
    </span>
  );
}

/* ── Price block ────────────────────────────────────────────────────── */

function PriceBlock({
  plan,
  tzsPerUsd,
  featured,
}: {
  plan: Plan;
  tzsPerUsd: number;
  featured: boolean;
}) {
  const p = priceParts(plan.price, tzsPerUsd);
  const period = formatPeriod(plan.duration);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
      {/* Local first */}
      <div>
        <p
          className={cn(
            "text-[0.625rem] font-bold uppercase tracking-[0.16em]",
            featured ? "text-white/60" : "text-white/40",
          )}
        >
          TZS
        </p>
        <p className="mt-1.5 text-[1.75rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-white sm:text-[2rem]">
          {p.tzs}
        </p>
        <p
          className={cn(
            "mt-1.5 text-[0.75rem] font-semibold",
            featured ? "text-white/55" : "text-white/40",
          )}
        >
          {period}
        </p>
      </div>

      {/* Divider */}
      <span
        aria-hidden
        className={cn(
          "h-14 w-px self-center",
          featured ? "bg-white/25" : "bg-white/[0.12]",
        )}
      />

      {/* International reference */}
      <div>
        <p
          className={cn(
            "text-[0.625rem] font-bold uppercase tracking-[0.16em]",
            featured ? "text-white/60" : "text-white/40",
          )}
        >
          USD
        </p>
        <p className="mt-1.5 text-[1.75rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-white sm:text-[2rem]">
          {p.usd}
        </p>
        <p
          className={cn(
            "mt-1.5 text-[0.75rem] font-semibold",
            featured ? "text-white/55" : "text-white/40",
          )}
        >
          {period}
        </p>
      </div>
    </div>
  );
}

/* ── Plan card ──────────────────────────────────────────────────────── */

function PlanCard({ plan, tzsPerUsd }: { plan: Plan; tzsPerUsd: number }) {
  const featured = plan.id === RECOMMENDED_PLAN_ID;

  return (
    <Card
      className={cn(
        "group/card relative flex h-full flex-col p-7 transition-[transform,box-shadow] duration-500 sm:p-8",
        "hover:-translate-y-1",
        featured
          /* Bottoms out on a deep violet surface, not pure black — ending at ink
             left the lower half of the card reading darker than its siblings. */
          ? "bg-gradient-to-b from-volt/[0.32] via-volt/[0.13] to-[#150A33] ring-1 ring-volt/45 hover:ring-volt/70"
          : "bg-carbon-2 bg-gradient-to-b from-white/[0.05] to-transparent ring-1 ring-white/[0.08] hover:ring-white/[0.16]",
      )}
      style={
        featured
          ? { boxShadow: "0 0 0 1px rgba(109,43,255,0.18), 0 30px 70px -34px rgba(109,43,255,0.6)" }
          : { boxShadow: "0 24px 60px -40px rgba(0,0,0,0.9)" }
      }
    >
      {/* Artist-slot numeral: the plan's real identity, set as an editorial
          watermark rather than decoration. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-6 top-5 text-[3.25rem] font-black leading-none tracking-[-0.07em] tabular-nums sm:right-7",
          featured ? "text-white/[0.16]" : "text-white/[0.06]",
        )}
      >
        {plan.max_artists}
      </span>

      {/* Badge slot is always reserved, so the price rules and CTAs line up
          across all three cards whether or not a badge is present. */}
      <div className="relative mb-3 flex h-6 items-center">
        {featured && (
          <span className="inline-flex h-6 items-center rounded-full bg-volt px-2.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.14em] text-white">
            Most popular
          </span>
        )}
      </div>

      <div className="relative">
        <Eyebrow className={featured ? "text-white/60" : "text-white/35"}>
          {plan.max_artists === 1
            ? "1 artist"
            : `Up to ${plan.max_artists} artists`}
        </Eyebrow>
        <h3 className="mt-3.5 text-[1.625rem] font-extrabold tracking-[-0.035em] text-white sm:text-[1.75rem]">
          {plan.name}
        </h3>
      </div>

      {/* Fixed height keeps the divider aligned across cards. */}
      <p
        className={cn(
          "mt-3 min-h-[3rem] max-w-[30ch] text-[0.9375rem] font-medium leading-relaxed",
          featured ? "text-white/75" : "text-white/45",
        )}
      >
        {plan.description}
      </p>

      <div
        className={cn(
          "mt-6 border-t pt-6",
          featured ? "border-white/20" : "border-white/[0.09]",
        )}
      >
        <PriceBlock plan={plan} tzsPerUsd={tzsPerUsd} featured={featured} />
      </div>

      <ul
        className={cn(
          "mt-7 flex-1 space-y-3.5 border-t pt-7",
          featured ? "border-white/20" : "border-white/[0.09]",
        )}
      >
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <FeatureCheck featured={featured} />
            <span
              className={cn(
                "text-[0.875rem] font-medium leading-relaxed",
                featured ? "text-white/90" : "text-white/65",
              )}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      <Link
        to="/auth"
        className={cn(
          "group/cta mt-8 flex h-12 items-center justify-center gap-2 rounded-xl text-[0.9375rem] font-bold transition-colors duration-300",
          featured
            ? "bg-volt text-white hover:bg-volt-lit"
            : "bg-white/[0.07] text-white ring-1 ring-white/[0.14] hover:bg-white/[0.12] hover:ring-white/25",
        )}
      >
        Choose {plan.name}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
          strokeWidth={2.4}
          aria-hidden
        />
      </Link>
    </Card>
  );
}

/* ── Section ────────────────────────────────────────────────────────── */

export default function PricingSection() {
  const { plans, tzsPerUsd, source } = usePlans();

  return (
    <Band id="pricing" tone="carbon">
      {/* A single static violet field behind the featured card. Static on
          purpose: an animated large-radius glow is what cost the hero 54fps. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(ellipse, rgba(109,43,255,0.16) 0%, transparent 68%)",
        }}
      />

      <div className="shell relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow className="mb-5 text-volt-lit">Choose your plan</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="t-display text-white">
              Plans that grow with your music.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="t-body mx-auto mt-6 max-w-[46ch] text-white/55">
              Start with the tools you need today. Upgrade as your catalogue and
              your team grow — the only thing that changes between plans is how
              many artists you manage.
            </p>
          </Reveal>
        </div>

        {/* Stacked below lg, but capped at 26rem and centred — a single card
            stretched across 704px at tablet width leaves its price block
            floating in half-empty space. Three across from lg, where each column
            still clears the width the TZS/USD block needs. */}
        <div className="mx-auto mt-14 grid max-w-[26rem] gap-4 md:mt-16 md:gap-5 lg:max-w-6xl lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.07} className="h-full">
              <PlanCard plan={plan} tzsPerUsd={tzsPerUsd} />
            </Reveal>
          ))}
        </div>

        {/* Trust line — only claims that are actually true today. */}
        <Reveal delay={0.1}>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              "Transparent pricing",
              "Clear plan limits",
              "No invented fees",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-lime"
                />
                <span className="text-[0.8125rem] font-semibold text-white/55">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mx-auto mt-8 max-w-2xl space-y-2 text-center">
            <p className="text-[0.75rem] font-medium leading-relaxed text-white/35">
              Plan prices are set in US dollars. TZS amounts are shown as a
              convenience conversion; your final charge is confirmed at checkout.
            </p>
            {source === "placeholder" && (
              <p className="text-[0.75rem] font-medium leading-relaxed text-amber/80">
                Indicative pricing — final plan prices are being confirmed.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </Band>
  );
}
