import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { LanguageSwitch } from "@/features/site/layout/LanguageSwitch";
import ReleaseCover from "@/features/site/art/ReleaseCover";
import { FEATURED_RELEASE } from "@/features/site/art/release";
import { useLanguage } from "@/lib/LanguageContext";
import { MOCKS } from "@/features/site/content/mocks";

/**
 * Shared frame for /auth, /forgot-password, /reset-password and
 * /email-verified: a quiet brand panel on large screens and a focused form
 * column. No marketing chrome — the only exits are home and the legal links.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const { t, pick } = useLanguage();
  return (
    <div className="flex min-h-svh bg-surface text-text">
      <aside className="relative hidden w-[44%] max-w-[40rem] flex-col justify-between overflow-hidden border-r border-border-subtle bg-surface-sunken p-12 lg:flex xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/3 h-[32rem] w-[32rem] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(109,43,255,0.14), transparent 65%)" }}
        />
        <Link to="/" aria-label={t("nav.home")} className="relative w-fit rounded-sm text-[1.5rem]">
          <Wordmark />
        </Link>

        <div className="relative">
          <p className="max-w-[18ch] text-[2.25rem] font-extrabold leading-[1.08] tracking-[-0.035em] xl:text-[2.5rem]">
            {t("auth.brand_title")}
          </p>
          <ul className="mt-8 space-y-3.5">
            {(["auth.brand_point_1", "auth.brand_point_2", "auth.brand_point_3"] as const).map((k) => (
              <li key={k} className="flex items-start gap-3 text-body text-text-muted">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>

        <div
          aria-hidden
          className="relative flex max-w-[22rem] items-center gap-3 rounded-card border border-border-subtle bg-surface-raised p-3"
        >
          <span className="h-12 w-12 shrink-0 overflow-hidden rounded-[8px]">
            <ReleaseCover size="thumb" alt="" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body-sm font-bold">{FEATURED_RELEASE.title}</span>
            <span className="block truncate text-caption text-text-subtle">{FEATURED_RELEASE.artist}</span>
          </span>
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-success">
            {pick(MOCKS).release.statusLive}
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
          <Link to="/" aria-label={t("nav.home")} className="rounded-sm text-[1.375rem] lg:invisible">
            <Wordmark />
          </Link>
          <LanguageSwitch />
        </header>

        <main id="main" className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center sm:px-8 sm:py-12">
          <div className="w-full max-w-[26rem]">{children}</div>
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
export function AuthHeading({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-[1.875rem] font-extrabold leading-tight tracking-[-0.03em] sm:text-[2.125rem]">
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
