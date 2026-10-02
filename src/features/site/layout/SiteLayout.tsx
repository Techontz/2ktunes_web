import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import MobileCtaBar from "./MobileCtaBar";
import { OfferBar, useOfferBar } from "./OfferBar";

/**
 * Shell for every public page: skip link, fixed nav, <main>, footer.
 * Inner pages are lazy; the Suspense boundary sits inside <main> so the nav
 * and footer never flash while a page chunk loads.
 */
export default function SiteLayout() {
  const { t } = useLanguage();
  const { offer, dismiss } = useOfferBar();
  return (
    <div className="flex min-h-svh flex-col bg-surface text-text">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:rounded-control focus:bg-white focus:px-4 focus:py-2.5 focus:text-[0.9375rem] focus:font-semibold focus:text-ink"
      >
        {t("common.skip")}
      </a>
      <SiteNav banner={offer ? <OfferBar offer={offer} onDismiss={dismiss} /> : null} />
      {/* The fixed header grows by the offer bar (h-9); shift the page down to match. */}
      <main id="main" tabIndex={-1} className={offer ? "flex-1 pt-9 outline-none" : "flex-1 outline-none"}>
        <Suspense
          fallback={
            <div className="flex min-h-[70svh] items-center justify-center text-text-muted">
              <Spinner label={t("common.loading")} />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <MobileCtaBar />
    </div>
  );
}
