import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { LanguageSwitch } from "@/features/site/layout/LanguageSwitch";
import ReleaseCover from "@/features/site/art/ReleaseCover";
import { FEATURED_RELEASE } from "@/features/site/art/release";
import { useLanguage } from "@/lib/LanguageContext";
import { ArtistPhoto, EqBars } from "@/features/site/kit";
import { MOCKS } from "@/features/site/content/mocks";
import { cn } from "@/lib/utils";

/**
 * Shared frame for /auth, /forgot-password, /reset-password and
 * /email-verified: a quiet brand panel on large screens and a focused form
 * column. No marketing chrome — the only exits are home and the legal links.
 */
/** `wide` gives the create-account form room for two columns, so it fits one screen. */
export default function AuthLayout({ children, wide }: { children: ReactNode; wide?: boolean }) {
  const { t, pick } = useLanguage();
  return (
    <div className="flex min-h-svh bg-surface text-text">
      <aside className="theme-dark sticky top-0 hidden h-svh w-[44%] max-w-[40rem] shrink-0 flex-col justify-between overflow-hidden bg-night p-12 text-text lg:flex xl:p-14">
        <div aria-hidden className="absolute inset-0">
          <ArtistPhoto id={4} eager sizes="44vw" position="50% 22%" className="opacity-90" />
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(26_11_46/0.55)_0%,rgb(42_15_74/0.35)_35%,rgb(26_11_46/0.92)_72%,#1a0b2e_100%)]" />
          <span className="absolute inset-0 bg-[radial-gradient(70%_50%_at_0%_100%,rgb(132_29_198/0.55),transparent_70%)]" />
        </div>
        <Link to="/" aria-label={t("nav.home")} className="relative w-fit rounded-sm text-[1.5rem]">
          <Wordmark tone="dark" />
        </Link>

        <div className="relative">
          <EqBars className="mb-6 h-7 text-brand-300" />
          <p className="max-w-[18ch] text-[2.25rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-white xl:text-[2.625rem]">
            {t("auth.brand_title")}
          </p>
          <ul className="mt-8 space-y-3.5">
            {(["auth.brand_point_1", "auth.brand_point_2", "auth.brand_point_3"] as const).map((k) => (
              <li key={k} className="flex items-start gap-3 text-body text-text-muted">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
          <div
            aria-hidden
            className="mt-10 flex max-w-[22rem] animate-float-slow items-center gap-3 rounded-card border border-white/15 bg-[#2a1248]/80 p-3 shadow-overlay backdrop-blur-md"
          >
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-[8px]">
              <ReleaseCover size="thumb" alt="" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body-sm font-bold text-white">{FEATURED_RELEASE.title}</span>
              <span className="block truncate text-caption text-text-subtle">{FEATURED_RELEASE.artist}</span>
            </span>
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-success">
              {pick(MOCKS).release.statusLive}
            </span>
          </div>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Phones/tablets: a slim brand bar with an artist photo. */}
        <header className="theme-dark relative flex h-16 items-center justify-between gap-4 overflow-hidden bg-hero px-4 sm:px-8 lg:hidden">
          <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 opacity-40 [mask-image:linear-gradient(90deg,transparent,#000)]">
            <ArtistPhoto id={4} sizes="50vw" position="50% 25%" />
          </div>
          <Link to="/" aria-label={t("nav.home")} className="relative rounded-sm text-[1.3rem]">
            <Wordmark tone="dark" />
          </Link>
          <LanguageSwitch className="relative" />
        </header>
        <div className="absolute right-8 top-4 z-10 hidden lg:block">
          <LanguageSwitch />
        </div>

        <main id="main" className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center sm:px-8 sm:py-12 lg:pb-2 lg:pt-14">
          <div
            className={cn(
              "w-full animate-slide-up sm:rounded-panel sm:border sm:border-border-subtle sm:bg-white sm:p-8 sm:shadow-card-light",
              wide ? "max-w-[36rem] lg:py-6" : "max-w-[28rem]",
            )}
          >
            {children}
          </div>
        </main>

        <footer className="flex flex-col gap-3 px-4 pb-6 text-[0.8125rem] text-text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-sm hover:text-text">
            <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
            {t("auth.back")}
          </Link>
          <nav aria-label={t("footer.legal")} className="flex gap-4">
            <Link to="/legal/terms" className="rounded-sm hover:text-text">
              {t("footer.terms")}
            </Link>
            <Link to="/legal/privacy" className="rounded-sm hover:text-text">
              {t("footer.privacy")}
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}

/** Heading block used by every auth screen. */
export function AuthHeading({ title, sub, compact }: { title: ReactNode; sub?: ReactNode; compact?: boolean }) {
  return (
    <div className={compact ? "mb-5" : "mb-8"}>
      <h1 className="text-[1.875rem] font-extrabold leading-tight tracking-[-0.03em] text-text sm:text-[2.125rem]">
        {title}
      </h1>
      {sub && <p className="mt-2.5 text-body text-text-muted">{sub}</p>}
    </div>
  );
}

/** Form-level error or notice, announced to screen readers. */
export function FormAlert({ tone = "danger", children }: { tone?: "danger" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={
        tone === "danger"
          ? "rounded-control border border-danger/30 bg-danger-soft px-4 py-3 text-body-sm font-medium text-danger"
          : "rounded-control border border-success/30 bg-success-soft px-4 py-3 text-body-sm font-medium text-success"
      }
    >
      {children}
    </p>
  );
}
