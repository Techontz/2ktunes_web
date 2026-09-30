import { motion } from "motion/react";
import { MIN_WITHDRAWAL_USD, PAYOUTS, PLATFORMS } from "../data";
import PlatformTile from "../art/PlatformTile";
import { Band, Card, Eyebrow, Opener, Reveal, Wordmark } from "../ui";

/** A dashed connector with a single travelling pulse. */
function Route({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="relative hidden h-px w-16 self-center lg:block">
      <div className="absolute inset-0 border-t-2 border-dashed border-white/25" />
      <motion.span
        aria-hidden
        className="absolute -top-[4px] h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_12px_2px_rgba(203,242,76,0.6)]"
        initial={{ left: reverse ? "100%" : "0%", opacity: 0 }}
        animate={{
          left: reverse ? ["100%", "0%"] : ["0%", "100%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/**
 * Payout method chip.
 *
 * Every method carries an explicit status pill. Nothing here is presented as a
 * working integration, because none of them is one yet.
 */
function PayoutChip({ p, i }: { p: (typeof PAYOUTS)[number]; i: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3 pr-3.5 ring-1 ring-white/[0.07]"
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.6875rem] font-extrabold opacity-70"
        style={{
          background: p.tint,
          color:
            p.tint === "#FFC94A" || p.tint === "#F2F0EA" ? "#0E0E0E" : "#fff",
        }}
      >
        {p.initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.8125rem] font-bold text-white/85">
          {p.name}
        </span>
        <span className="block truncate text-[0.6875rem] font-medium text-white/40">
          {p.region}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-amber/[0.14] px-2 py-1 text-[0.5625rem] font-extrabold uppercase tracking-[0.1em] text-amber">
        {p.status === "live" ? "Live" : "Planned"}
      </span>
    </motion.li>
  );
}

export default function LocalPaymentsSection() {
  return (
    <Band tone="carbon">
      <div className="shell">
        <Opener
          eyebrow="Africa-first"
          title={
            <>
              Global earnings.
              <br />
              <span className="text-lime">Local access.</span>
            </>
          }
          deck="Your music can reach listeners worldwide without your money getting stuck somewhere else. Royalties collect into one transparent 2K Tunes balance, and we are building payout toward the methods artists across the continent actually use."
        />

        {/* ── The route ── */}
        <Reveal className="mt-14 md:mt-20">
          <Card className="bg-carbon-2 ring-1 ring-white/[0.07]">
            <div className="grid items-stretch gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-6 lg:p-12">
              {/* Streams in */}
              <div>
                <Eyebrow className="text-white/35">01 — Streams</Eyebrow>
                <p className="mt-4 text-[1.0625rem] font-bold leading-snug text-white">
                  Listeners play your release worldwide
                </p>
                <div className="mt-6 grid max-w-[15rem] grid-cols-4 gap-2.5">
                  {PLATFORMS.slice(0, 8).map((p) => (
                    <PlatformTile key={p.name} platform={p} className="opacity-90" />
                  ))}
                </div>
                <p className="mt-5 text-[0.8125rem] font-medium leading-relaxed text-white/40">
                  Royalties are reported per store, per country, per period.
                </p>
              </div>

              <Route />

              {/* Hub — this part exists today */}
              <div className="relative flex flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-volt/25 to-volt/[0.04] p-7 text-center ring-1 ring-volt/25 lg:max-w-[17rem] lg:self-center">
                <Eyebrow className="text-white/35">02 — Wallet</Eyebrow>
                <Wordmark className="mt-4 text-[1.5rem]" />
                <p className="mt-4 text-[0.8125rem] font-medium leading-relaxed text-white/55">
                  Every store, one transparent balance
                </p>
                <div className="mt-6 w-full rounded-2xl bg-ink/45 px-4 py-3.5">
                  <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/35">
                    Available
                  </p>
                  <p className="mt-1 text-[1.375rem] font-extrabold tabular-nums tracking-[-0.03em] text-white">
                    $1,284.42
                  </p>
                </div>
              </div>

              <Route />

              {/* Payout — this part is roadmap */}
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Eyebrow className="text-white/35">03 — Payout</Eyebrow>
                  <span className="rounded-full bg-amber/[0.14] px-2 py-1 text-[0.5625rem] font-extrabold uppercase tracking-[0.1em] text-amber">
                    Provider onboarding
                  </span>
                </div>
                <p className="mt-4 text-[1.0625rem] font-bold leading-snug text-white">
                  Built toward the way you already get paid
                </p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                  {PAYOUTS.slice(0, 4).map((p, i) => (
                    <PayoutChip key={p.name} p={p} i={i} />
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </Reveal>

        {/* ── What is true today vs. what is coming ── */}
        <div className="mt-4 grid gap-4 md:mt-5 md:grid-cols-3 md:gap-5">
          {[
            {
              n: "01",
              t: "Withdrawals you request in-app",
              d: `Request a payout from your wallet once your balance clears the $${MIN_WITHDRAWAL_USD} minimum. Requests are reviewed and processed by the 2K Tunes team.`,
              tag: "Available now",
              live: true,
            },
            {
              n: "02",
              t: "No mystery deductions",
              d: "Every line of your balance traces back to a store, a territory and a period. Earnings and withdrawals are both on the record.",
              tag: "Available now",
              live: true,
            },
            {
              n: "03",
              t: "Automated mobile money & bank payouts",
              d: "Direct disbursement to mobile wallets and local bank accounts, so a payout lands without anyone processing it by hand.",
              tag: "In development",
              live: false,
            },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 0.06} className="h-full">
              <Card className="flex h-full flex-col bg-slab p-7 sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.75rem] font-extrabold ring-1 ${
                      c.live
                        ? "bg-lime/15 text-lime ring-lime/30"
                        : "bg-amber/[0.12] text-amber ring-amber/25"
                    }`}
                  >
                    {c.n}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.5625rem] font-extrabold uppercase tracking-[0.1em] ${
                      c.live
                        ? "bg-lime/[0.12] text-lime"
                        : "bg-amber/[0.14] text-amber"
                    }`}
                  >
                    {c.tag}
                  </span>
                </div>
                <h3 className="text-[1.125rem] font-extrabold leading-snug tracking-[-0.02em] text-white">
                  {c.t}
                </h3>
                <p className="t-body mt-2.5 text-white/50">{c.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-3xl text-center text-[0.75rem] font-medium leading-relaxed text-white/35">
            Mobile money and bank payout providers are not yet integrated. They
            are shown here as the payout roadmap, and each becomes available only
            once that provider is genuinely onboarded. The balance figure above
            is a product demonstration.
          </p>
        </Reveal>
      </div>
    </Band>
  );
}
