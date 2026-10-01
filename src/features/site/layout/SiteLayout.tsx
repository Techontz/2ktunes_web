import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import MobileCtaBar from "./MobileCtaBar";

/**
 * Shell for every public page: skip link, fixed nav, <main>, footer.
 * Inner pages are lazy; the Suspense boundary sits inside <main> so the nav
 * and footer never flash while a page chunk loads.
 */
export default function SiteLayout() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-svh flex-col bg-surface text-text">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:rounded-control focus:bg-white focus:px-4 focus:py-2.5 focus:text-[0.9375rem] focus:font-semibold focus:text-ink"
      >
        {t("common.skip")}
      </a>
      <SiteNav />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
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
