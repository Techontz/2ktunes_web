import { motion } from "motion/react";
import {
  ArrowDownToLine,
  ReceiptText,
  Smartphone,
  SplitSquareHorizontal,
  Wallet,
} from "lucide-react";
import { MIN_WITHDRAWAL_USD, PAYOUTS } from "../data";
import { Band, Card, Eyebrow, Opener, Reveal } from "../ui";

/** Illustrative wallet state, labelled as such in the UI. */
const BALANCE = "1,284.42";

const LEDGER = [
  { l: "Streaming revenue", v: "+ $248.90", accent: true },
  { l: "Previous balance", v: "$1,035.52", accent: false },
  { l: "Paid out to date", v: "$6,204.15", accent: false },
];

function WalletCard() {
  return (
    <Card className="h-full bg-carbon-2 p-7 ring-1 ring-white/[0.07] sm:p-9">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <Wallet className="h-4 w-4 text-lime" strokeWidth={2.2} aria-hidden />
          <Eyebrow className="text-white/35">Artist wallet</Eyebrow>
        </span>
        <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[0.5625rem] font-extrabold uppercase tracking-[0.1em] text-white/45">
          Sample data
        </span>
      </div>

      <p className="mt-7 text-[0.8125rem] font-semibold text-white/40">
        Available balance
      </p>
      <p className="t-figure mt-1.5 flex items-start gap-1 text-white">
        <span className="mt-[0.15em] text-[0.45em] font-bold text-lime">$</span>
        {BALANCE}
      </p>

      <dl className="mt-8 space-y-3.5 border-t border-white/[0.08] pt-7">
        {LEDGER.map((row) => (
          <div key={row.l} className="flex items-baseline justify-between gap-4">
            <dt className="text-[0.875rem] font-medium text-white/45">
              {row.l}
            </dt>
            <dd
              className={`text-[0.9375rem] font-bold tabular-nums ${
                row.accent ? "text-lime" : "text-white"
              }`}
            >
              {row.v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex h-12 items-center justify-center gap-2 rounded-full bg-lime text-[0.9375rem] font-bold text-ink">
        <ArrowDownToLine className="h-4 w-4" strokeWidth={2.6} aria-hidden />
        Withdraw
      </div>
      <p className="mt-3.5 text-center text-[0.6875rem] font-medium text-white/30">
        Minimum withdrawal ${MIN_WITHDRAWAL_USD}
      </p>
    </Card>
  );
}

function WithdrawCard() {
  return (
    <Card className="h-full bg-slab p-7 sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Eyebrow className="text-white/35">Request a withdrawal</Eyebrow>
        <span className="rounded-full bg-amber/[0.14] px-2.5 py-1 text-[0.5625rem] font-extrabold uppercase tracking-[0.1em] text-amber">
          Methods in onboarding
        </span>
      </div>

      <ul className="mt-6 space-y-2.5">
        {PAYOUTS.slice(0, 3).map((p, i) => (
          <motion.li
            key={p.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.1 + i * 0.09, duration: 0.5 }}
            className="flex items-center gap-3.5 rounded-2xl bg-white/[0.04] p-3.5 ring-1 ring-white/[0.06]"
          >
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[0.75rem] font-extrabold opacity-70"
              style={{
                background: p.tint,
                color: p.tint === "#FFC94A" ? "#0E0E0E" : "#fff",
              }}
            >
              {p.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.9375rem] font-bold text-white/85">
                {p.name}
              </span>
              <span className="block truncate text-[0.75rem] font-medium text-white/40">
                {p.region}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-amber/[0.14] px-2 py-1 text-[0.5625rem] font-extrabold uppercase tracking-[0.1em] text-amber">
              Planned
            </span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-7 rounded-2xl bg-ink/50 p-5">
        <p className="text-[0.75rem] font-semibold text-white/40">Amount</p>
        <p className="mt-1 text-[1.75rem] font-extrabold tracking-[-0.03em] tabular-nums text-white">
          ${BALANCE}
        </p>
        <div className="mt-5 flex h-11 items-center justify-center rounded-full bg-white text-[0.875rem] font-bold text-ink">
          Submit request
        </div>
        <p className="mt-3.5 text-center text-[0.6875rem] font-medium leading-relaxed text-white/30">
          Requests are reviewed and processed by the 2K Tunes team while
          automated payout providers are onboarded.
        </p>
      </div>
    </Card>
  );
}

const FEATURES = [
  {
    Icon: ReceiptText,
    t: "Transparent reporting",
    d: "Royalties broken down by store, country and period, with earnings and withdrawals both on the record.",
  },
  {
    Icon: SplitSquareHorizontal,
    t: "Royalty splits",
    d: "Assign percentages to producers and features up front, so collaborators are paid from the same balance.",
  },
  {
    Icon: Smartphone,
    t: "Built for mobile money",
    d: "The payout roadmap is mobile-first, because on this continent a phone number is closer to a bank account.",
  },
  {
    Icon: ArrowDownToLine,
    t: "Withdraw on your schedule",
    d: `No waiting for an annual statement. Request a payout whenever your balance clears the $${MIN_WITHDRAWAL_USD} minimum.`,
  },
];

export default function EarningsSection() {
  return (
    <Band id="wallet" tone="carbon">
      <div className="shell">
        <Opener
          eyebrow="Earnings"
          title={
            <>
              Get <span className="text-lime">paid</span> without the friction.
            </>
          }
          deck="You made the music. You should be able to reach the money. 2K Tunes collects your royalties into one balance you can actually read, and puts the withdrawal in your hands."
        />

        <div className="mt-14 grid gap-4 md:mt-20 md:gap-5 lg:grid-cols-2">
          <Reveal className="h-full">
            <WalletCard />
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <WithdrawCard />
          </Reveal>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:mt-5 md:gap-5 lg:grid-cols-4">
          {FEATURES.map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.06} className="h-full">
              <Card className="h-full bg-slab p-7">
                <Icon className="h-7 w-7 text-lime" strokeWidth={1.7} aria-hidden />
                <h3 className="mt-6 text-[1.0625rem] font-extrabold leading-tight tracking-[-0.02em] text-white">
                  {t}
                </h3>
                <p className="mt-2.5 text-[0.875rem] font-medium leading-relaxed text-white/45">
                  {d}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-3xl text-center text-[0.75rem] font-medium leading-relaxed text-white/30">
            Balances and transactions shown are a product demonstration, not real
            account data. The ${MIN_WITHDRAWAL_USD} minimum withdrawal is enforced
            by the platform.
          </p>
        </Reveal>
      </div>
    </Band>
  );
}
