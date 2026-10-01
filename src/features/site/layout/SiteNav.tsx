import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button, Sheet } from "@/components/ui";
import { Wordmark } from "@/components/brand/Wordmark";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "./LanguageSwitch";

export const PRIMARY_NAV = [
  { to: "/distribution", key: "nav.distribution" },
  { to: "/promotion", key: "nav.promotion" },
  { to: "/creators", key: "nav.creators" },
  { to: "/royalties", key: "nav.royalties" },
  { to: "/pricing", key: "nav.pricing" },
] as const;

const SECONDARY_NAV = [
  { to: "/artists", key: "nav.artists" },
  { to: "/labels", key: "nav.labels" },
  { to: "/about", key: "nav.about" },
  { to: "/help", key: "nav.help" },
  { to: "/contact", key: "nav.contact" },
] as const;

export default function SiteNav() {
  const { t } = useLanguage();
  const { status } = useAuth();
  const signedIn = status === "authenticated";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation.
  useEffect(() => setOpen(false), [location.pathname]);

  // Every public page opens on a deep-purple hero except the legal documents,
  // so the bar is transparent at the top there and solid everywhere else.
  const solid = scrolled || location.pathname.startsWith("/legal");

  return (
    <header
      className={cn(
        "theme-dark fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        solid
          ? "border-white/10 bg-night/88 shadow-[0_10px_30px_-18px_rgb(8_2_16/0.8)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-8 xl:gap-10">
          <Link
            to="/"
            aria-label={t("nav.home")}
            className="inline-flex h-11 items-center rounded-sm text-[1.3rem] leading-none transition-opacity hover:opacity-90"
          >
            <Wordmark tone="dark" />
          </Link>
          <nav aria-label={t("nav.main")} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "relative inline-flex h-9 items-center rounded-full px-3.5 text-[0.9375rem] font-semibold transition-colors",
                        isActive
                          ? "bg-tint/[0.1] text-white"
                          : "text-text-muted hover:bg-tint/[0.06] hover:text-white",
                      )
                    }
                  >
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitch className="hidden sm:inline-flex" />
          {signedIn ? (
            <Button to="/dashboard" size="sm" shape="pill" className="hidden sm:inline-flex">
              {t("cta.dashboard")}
            </Button>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden h-9 items-center rounded-full px-3.5 text-[0.9375rem] font-semibold text-text-muted transition-colors hover:bg-tint/[0.06] hover:text-white sm:inline-flex"
              >
                {t("cta.login")}
              </Link>
              <Button to="/auth?mode=register" size="sm" shape="pill" className="hidden sm:inline-flex">
                {t("cta.release")}
              </Button>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("common.menu_open")}
            aria-expanded={open}
            aria-haspopup="dialog"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-control text-text transition-colors hover:bg-tint/[0.06] lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("nav.main")}
        titleHidden
        side="right"
        width="min(26rem, 100vw)"
        closeLabel={t("common.menu_close")}
        footer={
          <div className="flex flex-col gap-2">
            {signedIn ? (
              <Button to="/dashboard" size="lg" fullWidth>
                {t("cta.dashboard")}
              </Button>
            ) : (
              <>
                <Button to="/auth?mode=register" size="lg" fullWidth>
                  {t("cta.release")}
                </Button>
                <Button to="/auth" variant="secondary" size="lg" fullWidth>
                  {t("cta.login")}
                </Button>
              </>
            )}
          </div>
        }
      >
        <nav aria-label={t("nav.main")} className="px-3 py-4">
          <ul>
            {PRIMARY_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex h-12 items-center rounded-control px-3 text-[1.125rem] font-semibold",
                      isActive ? "bg-tint/[0.06] text-text" : "text-text hover:bg-tint/[0.04]",
                    )
                  }
                >
                  {t(item.key)}
                </NavLink>
              </li>
            ))}
          </ul>
          <ul className="mt-3 border-t border-border-subtle pt-3">
            {SECONDARY_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="flex h-11 items-center rounded-control px-3 text-[1rem] font-medium text-text-muted hover:bg-tint/[0.04] hover:text-text"
                >
                  {t(item.key)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border-subtle px-3 pt-4">
            <span className="text-body-sm text-text-subtle">{t("common.language")}</span>
            <LanguageSwitch />
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
