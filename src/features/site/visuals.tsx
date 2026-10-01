import type { ReactNode } from "react";
import { ArrowUpRight, Check, Landmark, Smartphone } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { formatMoney } from "@/lib/api/plans";
import { cn } from "@/lib/utils";
import ReleaseCover from "./art/ReleaseCover";
import { FEATURED_RELEASE } from "./art/release";
import { MOCKS } from "./content/mocks";

/**
 * Product illustrations drawn in HTML — crisp, translatable and tiny compared
 * with screenshots. Every one is labelled as sample data, and none depicts a
 * third-party logo: stores and payout providers appear as plain text.
 */

function Frame({ children, className, caption }: { children: ReactNode; className?: string; caption?: string }) {
  return (
    <figure className={cn("relative min-w-0", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-0 rounded-[2rem] bg-[radial-gradient(60%_60%_at_70%_30%,rgb(158_79_224/0.28),transparent_70%)] blur-xl"
      />
      <div className="relative overflow-hidden rounded-panel border border-border-subtle bg-surface-raised text-text shadow-[0_30px_70px_-30px_rgb(42_8_70/0.45)] transition-transform duration-500 ease-[var(--ease-tunes)] hover:-translate-y-1">
        {children}
      </div>
      {caption && (
        <figcaption className="relative mt-3 text-center text-[0.75rem] text-text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Release status ─────────────────────────────────────────────────── */

export function ReleaseMock({ className, eager }: { className?: string; eager?: boolean }) {
  const { pick } = useLanguage();
  const m = pick(MOCKS);
  const r = FEATURED_RELEASE;
  return (
    <Frame className={className} caption={m.sample}>
      <div className="flex items-center gap-4 p-5">
        <span className="h-16 w-16 shrink-0 overflow-hidden rounded-[10px] sm:h-20 sm:w-20">
          <ReleaseCover size="thumb" eager={eager} alt="" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[1.125rem] font-bold tracking-[-0.02em]">{r.title}</p>
          <p className="truncate text-body-sm text-text-muted">{r.artist}</p>
          <p className="mt-0.5 truncate text-caption text-text-subtle">{m.release.kind}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[0.75rem] font-semibold text-success">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {m.release.statusLive}
        </span>
      </div>
      <ol className="grid grid-cols-4 gap-2 border-y border-border-subtle px-5 py-4">
        {m.release.steps.map((s, i) => (
          <li key={s} className="min-w-0">
            <span
              className={cn(
                "block h-1 rounded-full",
                i < 3 ? "bg-accent" : "bg-success",
              )}
            />
            <span className="mt-2 flex items-start gap-1 text-[0.6875rem] font-semibold leading-tight text-text-muted sm:text-[0.75rem]">
              <Check aria-hidden className="hidden h-3 w-3 shrink-0 text-text-subtle sm:block" />
              <span className="min-w-0 break-words">{s}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="p-5">
        <p className="text-caption text-text-subtle">{m.release.destinations}</p>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {["Spotify", "Apple Music", "Boomplay", "TikTok", "Audiomack", "YouTube Music"].map((s) => (
            <li
              key={s}
              className="rounded-[6px] border border-border-subtle bg-tint/[0.03] px-2 py-1 text-[0.75rem] font-semibold text-text-muted"
            >
              {s}
            </li>
          ))}
          <li className="px-1 py-1 text-[0.75rem] font-semibold text-text-subtle">+9 {m.release.more}</li>
        </ul>
      </div>
    </Frame>
  );
}

/* ── Wallet + local withdrawal ──────────────────────────────────────── */

export function WalletMock({ className }: { className?: string }) {
  const { pick, locale } = useLanguage();
  const m = pick(MOCKS).wallet;
  const sample = pick(MOCKS).sample;
  const lines = [342.18, 128.74, 50.9];
  const total = lines.reduce((a, b) => a + b, 0);
  return (
    <Frame className={className} caption={sample}>
      <div className="p-5 sm:p-6">
        <p className="text-caption font-semibold text-text-subtle">{m.title}</p>
        <p className="mt-3 text-caption text-text-muted">{m.available}</p>
        <p className="mt-1 text-[1.875rem] font-bold leading-none tracking-[-0.03em] tabular-nums sm:text-[2.125rem]">
          {formatMoney(total, "USD", locale)}
        </p>
        <dl className="mt-5 space-y-2 border-t border-border-subtle pt-4">
          {m.lines.map((label, i) => (
            <div key={label} className="flex items-center justify-between gap-3 text-body-sm">
              <dt className="text-text-muted">{label}</dt>
              <dd className="tabular-nums text-text">{formatMoney(lines[i], "USD", locale)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="border-t border-border-subtle bg-tint/[0.02] p-5 sm:p-6">
        <p className="text-caption font-semibold text-text-subtle">{m.withdrawTo}</p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {m.methods.map((name, i) => (
            <li
              key={name}
              className={cn(
                "flex items-center gap-3 rounded-control border px-3 py-2.5",
                i === 0 ? "border-accent-text bg-accent-soft" : "border-border-subtle",
              )}
            >
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-tint/[0.06] text-text-muted"
              >
                {i === 3 ? <Landmark className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-body-sm font-semibold">{name}</span>
                <span className="block truncate text-[0.75rem] text-text-subtle">{m.methodNote[i]}</span>
              </span>
            </li>
          ))}
        </ul>
        <span className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-control bg-accent text-[0.9375rem] font-semibold text-white">
          {m.action}
          <ArrowUpRight aria-hidden className="h-4 w-4" />
        </span>
      </div>
    </Frame>
  );
}

/* ── Royalty splits ─────────────────────────────────────────────────── */

export function SplitsMock({ className }: { className?: string }) {
  const { pick } = useLanguage();
  const m = pick(MOCKS);
  const shares = [
    { who: "Conrad Bubex", pct: 60, color: "bg-accent" },
    { who: "K. Mwakyusa", pct: 25, color: "bg-brand-400" },
    { who: "A. Nassoro", pct: 15, color: "bg-orange" },
  ];
  return (
    <Frame className={className} caption={m.sample}>
      <div className="p-5 sm:p-6">
        <p className="text-body-sm font-semibold">{m.splits.title}</p>
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
          {shares.map((s) => (
            <span key={s.who} className={s.color} style={{ width: `${s.pct}%` }} />
          ))}
        </div>
        <ul className="mt-5 space-y-3">
          {shares.map((s, i) => (
            <li key={s.who} className="flex items-center gap-3">
              <span aria-hidden className={cn("h-2.5 w-2.5 shrink-0 rounded-full", s.color)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-sm font-semibold">{s.who}</span>
                <span className="block truncate text-[0.75rem] text-text-subtle">{m.splits.roles[i]}</span>
              </span>
              <span className="text-body-sm font-semibold tabular-nums">{s.pct}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-border-subtle pt-4 text-caption text-text-muted">{m.splits.note}</p>
      </div>
    </Frame>
  );
}

/* ── Creator campaign ───────────────────────────────────────────────── */

export function CampaignMock({ className }: { className?: string }) {
  const { pick } = useLanguage();
  const m = pick(MOCKS);
  const c = m.campaign;
  return (
    <Frame className={className} caption={m.sample}>
      <div className="flex items-center gap-4 border-b border-border-subtle p-5">
        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-[8px]">
          <ReleaseCover size="thumb" alt="" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-caption font-semibold text-text-subtle">{c.title}</p>
          <p className="truncate text-[1rem] font-bold">{FEATURED_RELEASE.title}</p>
          <p className="truncate text-caption text-text-muted">{c.brief}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-info-soft px-2.5 py-1 text-[0.75rem] font-semibold text-info">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {c.status}
        </span>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-border-subtle">
        {[
          [c.creators, "24"],
          [c.videos, "31"],
          [c.budget, "62%"],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 p-4 sm:p-5">
            <dt className="truncate text-[0.6875rem] text-text-subtle sm:text-caption">{label}</dt>
            <dd className="mt-1 text-[1.375rem] font-bold tabular-nums tracking-[-0.02em]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex gap-1.5 border-t border-border-subtle p-5">
        {["#841dc6", "#6e16a8", "#9e4fe0", "#5a1389", "#b983ee"].map((bg, i) => (
          <span
            key={bg}
            aria-hidden
            className="aspect-[9/16] flex-1 rounded-[6px] border border-border-subtle"
            style={{
              background: `linear-gradient(180deg, ${bg}, #2a0f4a)`,
              opacity: 1 - i * 0.12,
            }}
          />
        ))}
      </div>
    </Frame>
  );
}

/* ── Analytics ──────────────────────────────────────────────────────── */

const BARS = [22, 26, 24, 31, 35, 33, 41, 46, 44, 53, 61, 72];
const TERRITORIES = [
  { code: "TZ", share: 38 },
  { code: "KE", share: 21 },
  { code: "NG", share: 12 },
  { code: "GB", share: 9 },
];

export function AnalyticsMock({ className }: { className?: string }) {
  const { pick, locale } = useLanguage();
  const m = pick(MOCKS);
  let regionName = (code: string) => code;
  try {
    const dn = new Intl.DisplayNames([locale, "en"], { type: "region" });
    regionName = (code) => dn.of(code) ?? code;
  } catch {
    /* older engines */
  }
  const max = Math.max(...BARS);
  return (
    <Frame className={className} caption={m.sample}>
      <div className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-body-sm font-semibold">{m.analytics.title}</p>
          <p className="text-caption text-text-subtle">{m.analytics.period}</p>
        </div>
        <p className="mt-2 text-[1.875rem] font-bold leading-none tracking-[-0.03em] tabular-nums">
          {new Intl.NumberFormat(locale, { notation: "compact" }).format(488000)}
        </p>
        <div aria-hidden className="mt-5 flex h-28 items-end gap-1.5">
          {BARS.map((b, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-t-[4px]", i === BARS.length - 1 ? "bg-accent" : "bg-tint/[0.12]")}
              style={{ height: `${(b / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-border-subtle p-5 sm:p-6">
        <p className="text-caption font-semibold text-text-subtle">{m.analytics.territories}</p>
        <ul className="mt-3 space-y-3">
          {TERRITORIES.map((t, i) => (
            <li key={t.code} className={i > 1 ? "max-sm:hidden" : undefined}>
              <div className="flex justify-between text-body-sm">
                <span className="text-text">{regionName(t.code)}</span>
                <span className="tabular-nums text-text-muted">{t.share}%</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-tint/[0.08]">
                <div className="h-full rounded-full bg-accent-text" style={{ width: `${t.share * 2}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}
