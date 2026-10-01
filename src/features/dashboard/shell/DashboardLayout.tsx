import { Suspense, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bell, ExternalLink, LogOut, Menu, Settings } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Avatar, Button, Sheet, useToast } from "@/components/ui";
import { LanguageSwitch } from "@/features/site/layout/LanguageSwitch";
import { resendVerificationEmail } from "@/lib/api/auth";
import { useErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { PageLoading } from "../components";
import { NAV, isNavActive } from "./nav";
import { UnreadProvider, useUnread } from "./UnreadContext";

/**
 * THE AUTHENTICATED SHELL
 *
 * Desktop (lg+): fixed sidebar + sticky top bar. Below lg: the sidebar moves
 * into a left Sheet opened from the top bar. The top bar always carries the
 * language switch, the notification bell (unread count from the API) and the
 * user menu. Focus moves to <main> on navigation so screen-reader users land
 * on the new page, not on the link they pressed.
 */

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { pathname } = useLocation();
  return (
    <nav aria-label={t("dash.nav_label")} className="space-y-6">
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
                        "flex min-h-10 items-center gap-3 rounded-control px-3 py-2 text-[0.9rem] font-semibold transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text",
                        active
                          ? "bg-white/[0.08] text-text"
                          : "text-text-muted hover:bg-white/[0.04] hover:text-text",
                      )}
                    >
                      <item.icon
                        className={cn("h-[1.05rem] w-[1.05rem] shrink-0", active ? "text-accent-text" : "text-text-subtle")}
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

function NotificationBell() {
  const { t } = useLanguage();
  const { unread } = useUnread();
  const count = unread ?? 0;
  return (
    <Link
      to="/dashboard/notifications"
      aria-label={count > 0 ? t("dash.bell_unread", { count }) : t("dash.bell_none")}
      className="relative flex h-10 w-10 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
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
    "flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-body-sm font-semibold text-text-muted hover:bg-white/[0.06] hover:text-text focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text";

  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="dash-user-menu"
        aria-label={t("dash.user_menu")}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-control pl-1 pr-1 transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text sm:pr-2"
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

function VerifyEmailBanner() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const toMessage = useErrorMessage();
  const [sending, setSending] = useState(false);
  if (!user || user.email_verified !== false) return null;
  return (
    <div className="border-b border-warning/25 bg-warning-soft px-4 py-2.5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 text-body-sm text-text">
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

        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border-subtle bg-surface-sunken lg:flex">
          <Link
            to="/dashboard"
            className="flex h-16 shrink-0 items-center px-6 text-[1.2rem] leading-none focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent-text"
            aria-label={t("nav.home")}
          >
            <Wordmark />
          </Link>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-2 no-scrollbar">
            <NavList />
          </div>
        </aside>

        {/* Mobile navigation */}
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          side="left"
          width="min(18rem, 86vw)"
          title={t("dash.nav_label")}
          closeLabel={t("common.menu_close")}
        >
          <div className="px-3 py-4">
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </Sheet>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[76rem] items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-1.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-label={t("common.menu_open")}
                  aria-expanded={open}
                  className="flex h-10 w-10 items-center justify-center rounded-control text-text-muted hover:bg-white/[0.06] hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                >
                  <Menu className="h-5 w-5" aria-hidden />
                </button>
                <Link to="/dashboard" className="text-[1.05rem] leading-none" aria-label={t("nav.home")}>
                  <Wordmark />
                </Link>
              </div>
              <div className="hidden lg:block" />
              <div className="flex items-center gap-1 sm:gap-2">
                <LanguageSwitch />
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
            className="mx-auto w-full max-w-[76rem] px-4 pb-16 pt-6 focus:outline-none sm:px-6 sm:pt-8 lg:px-8"
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
