import { Suspense, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, Bell, Disc3, ExternalLink, LayoutDashboard, LayoutGrid, LogOut, Megaphone, Settings, Wallet } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Avatar, Button, Sheet, useToast } from "@/components/ui";
import { LanguageSwitch } from "@/features/site/layout/LanguageSwitch";
import { resendVerificationEmail } from "@/lib/api/auth";
import { useErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { PageLoading } from "../components";
import { NAV, isNavActive, type NavItem } from "./nav";
import { UnreadProvider, useUnread } from "./UnreadContext";

/**
 * THE AUTHENTICATED SHELL
 *
 * Desktop (lg+): fixed sidebar + sticky top bar. Below lg the app behaves
 * like a native app: a compact top bar (logo, section name, bell, account)
 * and a bottom tab bar with the four key sections plus "More", which opens a
 * bottom sheet holding every other section and the language switch. The
 * top bar carries the notification bell (unread count from the API) and the
 * user menu at every size. Focus moves to <main> on navigation so screen-reader users land
 * on the new page, not on the link they pressed.
 */

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { pathname } = useLocation();
  return (
    <nav aria-label={t("dash.nav_label")} className="space-y-5">
      {NAV.map((group) => {
        const items = group.items.filter((i) => !i.visible || i.visible(user));
        if (!items.length) return null;
        return (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-subtle">
              {t(group.label)}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = isNavActive(item, pathname);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex min-h-[2.375rem] items-center gap-3 rounded-control px-3 py-1.5 text-[0.9rem] font-semibold transition-[background-color,color] duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text",
                        active
                          ? "bg-accent-soft text-text before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r-full before:bg-accent-text"
                          : "text-text-muted hover:bg-tint/[0.06] hover:text-text",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-[1.05rem] w-[1.05rem] shrink-0 transition-colors",
                          active ? "text-accent-text" : "text-text-subtle group-hover:text-text",
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 truncate">{t(item.label)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

/** Current section name, shown on the left of the desktop top bar. */
function TopBarTitle() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const items = NAV.flatMap((g) => g.items).filter((i) => isNavActive(i, pathname));
  const best = items.sort((a, b) => b.to.length - a.to.length)[0];
  if (!best) return <div className="hidden lg:block" />;
  const Icon = best.icon;
  return (
    <p className="flex min-w-0 items-center gap-2.5 text-[0.9375rem] font-bold text-text lg:text-body-sm lg:font-semibold lg:text-text-muted">
      <span
        aria-hidden
        className="hidden h-8 w-8 items-center justify-center rounded-[9px] bg-accent-soft text-accent-text lg:flex"
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{t(best.label)}</span>
    </p>
  );
}

/** A small branded card at the foot of the sidebar: artist photo + the release shortcut. */
function SidebarRelease() {
  const { t } = useLanguage();
  return (
    <div className="relative shrink-0 p-3 pt-0 [@media(max-height:960px)]:hidden">
      <Link
        to="/dashboard/new-release"
        className="group relative flex h-[5.5rem] items-end overflow-hidden rounded-card border border-white/10 p-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
      >
        <img
          src="/images/artists/artist-2-sm.webp"
          alt=""
          width={480}
          height={960}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-[50%_22%] transition-transform duration-500 group-hover:scale-105"
        />
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(26_11_46/0.92)_30%,rgb(132_29_198/0.35))]" />
        <span className="relative flex w-full items-center justify-between gap-2 text-body-sm font-bold text-white">
          {t("dash.nav_new_release")}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent transition-transform group-hover:translate-x-0.5">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </span>
      </Link>
    </div>
  );
}

function NotificationBell() {
  const { t } = useLanguage();
  const { unread } = useUnread();
  const count = unread ?? 0;
  return (
    <Link
      to="/dashboard/notifications"
      aria-label={count > 0 ? t("dash.bell_unread", { count }) : t("dash.bell_none")}
      className="relative flex h-10 w-10 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-tint/[0.06] hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
    >
      <Bell className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold leading-none text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

function UserMenu() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;
  const itemCls =
    "flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-body-sm font-semibold text-text-muted hover:bg-tint/[0.06] hover:text-text focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text";

  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="dash-user-menu"
        aria-label={t("dash.user_menu")}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-control pl-1 pr-1 transition-colors hover:bg-tint/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text sm:pr-2"
      >
        <Avatar name={user.name || user.email} src={user.avatar} size="sm" />
        <span className="hidden max-w-[10rem] truncate text-body-sm font-semibold text-text md:inline">{user.name}</span>
      </button>
      {open && (
        <div
          id="dash-user-menu"
          className="absolute right-0 top-12 z-50 w-64 max-w-[calc(100vw-2rem)] animate-fade-in rounded-card border border-border bg-surface-overlay p-1.5 shadow-overlay"
        >
          <div className="border-b border-border-subtle px-3 pb-3 pt-2">
            <p className="truncate text-body-sm font-bold text-text">{user.name}</p>
            <p className="truncate text-caption text-text-subtle">{user.email}</p>
          </div>
          <ul className="pt-1.5">
            <li>
              <Link to="/dashboard/settings" className={itemCls}>
                <Settings className="h-4 w-4" aria-hidden />
                {t("dash.nav_settings")}
              </Link>
            </li>
            <li>
              <Link to="/" className={itemCls}>
                <ExternalLink className="h-4 w-4" aria-hidden />
                {t("dash.view_site")}
              </Link>
            </li>
            <li>
              <button
                type="button"
                className={itemCls}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await logout();
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                {busy ? t("dash.signing_out") : t("dash.sign_out")}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Phone/tablet navigation ─────────────────────────────────────────── */

const TABS: NavItem[] = [
  { to: "/dashboard", label: "dash.nav_home", icon: LayoutDashboard, end: true },
  { to: "/dashboard/music", label: "dash.nav_music", icon: Disc3 },
  { to: "/dashboard/promotion", label: "dash.nav_promotion", icon: Megaphone },
  { to: "/dashboard/wallet", label: "dash.nav_wallet", icon: Wallet },
];

/**
 * Bottom tab bar below lg: four key sections and "More". Fixed, translucent,
 * safe-area aware. `data-tabbar` lets global CSS lift toasts above it.
 */
function TabBar({ moreOpen, onMore }: { moreOpen: boolean; onMore: () => void }) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  // The release wizard belongs to the catalog tab.
  const path = pathname.startsWith("/dashboard/new-release") ? "/dashboard/music" : pathname;
  const activeTab = TABS.find((tab) => isNavActive(tab, path));
  const item =
    "tap relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[12px] pb-1 pt-1.5 text-[0.6875rem] font-semibold leading-none tracking-[0.01em] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text";
  return (
    <nav
      data-tabbar
      aria-label={t("dash.tabbar_label")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle bg-white/90 pb-safe shadow-[0_-10px_30px_-22px_rgb(42_8_70/0.45)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-xl items-stretch gap-1 px-2">
        {TABS.map((tab) => {
          const active = tab === activeTab && !moreOpen;
          return (
            <li key={tab.to} className="flex min-w-0 flex-1">
              <Link
                to={tab.to}
                aria-current={active ? "page" : undefined}
                className={cn(item, active ? "text-accent-text" : "text-text-subtle hover:text-text")}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-accent-soft",
                  )}
                >
                  <tab.icon className="h-[1.2rem] w-[1.2rem]" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className="max-w-full truncate px-0.5">{t(tab.label)}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex min-w-0 flex-1">
          <button
            type="button"
            onClick={onMore}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={cn(item, moreOpen || !activeTab ? "text-accent-text" : "text-text-subtle hover:text-text")}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                (moreOpen || !activeTab) && "bg-accent-soft",
              )}
            >
              <LayoutGrid className="h-[1.2rem] w-[1.2rem]" />
            </span>
            <span className="max-w-full truncate px-0.5">{t("dash.nav_more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

/** Every section as a grid of large tiles, grouped like the sidebar (inside the "More" sheet). */
function MoreGrid({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { pathname } = useLocation();
  return (
    <nav aria-label={t("dash.nav_label")} className="space-y-5 px-4 pb-5 pt-1">
      {NAV.map((group) => {
        const items = group.items.filter((i) => !i.visible || i.visible(user));
        if (!items.length) return null;
        return (
          <div key={group.label}>
            <p className="mb-2 px-1 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-subtle">
              {t(group.label)}
            </p>
            <ul className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3">
              {items.map((item) => {
                const active = isNavActive(item, pathname);
                return (
                  <li key={item.to} className="min-w-0">
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "tap flex min-h-[3.25rem] items-center gap-2.5 rounded-[14px] border px-3 py-2.5 text-[0.875rem] font-semibold leading-tight",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text",
                        active
                          ? "border-accent/30 bg-accent-soft text-text"
                          : "border-border-subtle bg-surface-raised text-text hover:border-border-strong active:bg-surface-hover",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]",
                          active ? "bg-accent text-white" : "bg-accent-soft text-accent-text",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 break-words">{t(item.label)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function VerifyEmailBanner() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const toMessage = useErrorMessage();
  const [sending, setSending] = useState(false);
  if (!user || user.email_verified !== false) return null;
  return (
    <div className="border-b border-warning/25 bg-warning-soft px-4 py-2.5 sm:px-6 lg:px-8">
      <div className="flex max-w-[80rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 text-body-sm text-text">
        <p>{t("dash.unverified")}</p>
        <Button
          size="sm"
          variant="secondary"
          loading={sending}
          onClick={async () => {
            setSending(true);
            try {
              await resendVerificationEmail();
              toast({ title: t("dash.verification_sent"), tone: "success" });
            } catch (err) {
              toast({ title: toMessage(err), tone: "danger" });
            } finally {
              setSending(false);
            }
          }}
        >
          {t("dash.resend_verification")}
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    setOpen(false);
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus({ preventScroll: true });
  }, [pathname]);

  /* Tab title per section (the marketing title otherwise lingers). The most
     specific matching nav entry wins, e.g. /dashboard/music/7 → "Music". */
  useEffect(() => {
    const items = NAV.flatMap((g) => g.items).filter((i) => isNavActive(i, pathname));
    const best = items.sort((a, b) => b.to.length - a.to.length)[0];
    document.title = `${best ? t(best.label) : "Dashboard"} · 2kTunes`;
  }, [pathname, t]);

  return (
    <UnreadProvider>
      <div className="min-h-svh bg-surface text-text">
        <a
          href="#dash-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-control focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
        >
          {t("common.skip")}
        </a>

        {/* Desktop sidebar: deep brand purple, logo on top, release card below. */}
        <aside className="theme-dark fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden bg-[linear-gradient(180deg,#1a0b2e_0%,#241040_60%,#2a0f4a_100%)] lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgb(132_29_198/0.45),transparent_65%)]"
          />
          <Link
            to="/dashboard"
            className="relative flex h-16 shrink-0 items-center px-5 text-[1.3rem] leading-none focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent-text"
            aria-label={t("nav.home")}
          >
            <Wordmark tone="dark" />
          </Link>
          <div className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-3 no-scrollbar">
            <NavList />
          </div>
          <SidebarRelease />
        </aside>

        {/* Phone/tablet navigation: bottom tabs + the "More" sheet. */}
        <TabBar moreOpen={open} onMore={() => setOpen(true)} />
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          side="bottom"
          title={t("dash.nav_more")}
          closeLabel={t("common.menu_close")}
          className="bg-surface pb-safe"
        >
          <div className="mx-4 mb-4 mt-4 flex items-center justify-between gap-3 border-b border-border-subtle pb-4">
            <span className="text-body-sm text-text-subtle">{t("common.language")}</span>
            <LanguageSwitch />
          </div>
          <MoreGrid onNavigate={() => setOpen(false)} />
        </Sheet>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 border-b border-border-subtle bg-white/85 pt-[env(safe-area-inset-top)] shadow-[0_1px_0_rgb(42_8_70/0.02),0_8px_24px_-20px_rgb(42_8_70/0.35)] backdrop-blur-md">
            <div className="flex h-14 items-center justify-between gap-2 px-4 sm:h-16 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3 lg:contents">
                <Link
                  to="/dashboard"
                  className="flex h-10 shrink-0 items-center rounded-sm text-[1.05rem] leading-none lg:hidden"
                  aria-label={t("nav.home")}
                >
                  <Wordmark tone="light" variant="mark" className="sm:hidden" />
                  <Wordmark tone="light" className="hidden sm:inline-flex" />
                </Link>
                <span aria-hidden className="h-5 w-px shrink-0 bg-border lg:hidden" />
                <TopBarTitle />
              </div>
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <LanguageSwitch className="hidden sm:inline-flex" />
                <NotificationBell />
                <UserMenu />
              </div>
            </div>
          </header>
          <VerifyEmailBanner />
          <main
            id="dash-main"
            ref={main}
            tabIndex={-1}
            className="w-full max-w-[80rem] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 focus:outline-none sm:px-6 sm:pt-7 lg:px-8 lg:pb-16"
          >
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </UnreadProvider>
  );
}
