import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LogOut, Menu, X, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Wordmark } from "@/features/landing/ui";
import { cn } from "@/lib/utils";
import { NAV } from "./nav";

/**
 * THE AUTHENTICATED SHELL
 * =======================
 *
 * Everything behind /dashboard renders inside this. The user identity in the
 * sidebar comes from the AuthProvider, which sources it from GET /api/profile —
 * there is no second copy of the user anywhere in the dashboard.
 *
 * Sign-out calls the provider's logout(), which deletes the token server-side
 * before clearing it locally; the route guard then bounces to /auth.
 */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "•";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : ""))
    .toUpperCase()
    .slice(0, 2);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Dashboard">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-[11px] px-3 py-2.5",
              "text-[0.875rem] font-semibold transition-colors duration-150",
              "outline-none focus-visible:ring-2 focus-visible:ring-volt-lit/70",
              isActive
                ? "bg-white/[0.07] text-white"
                : "text-white/45 hover:bg-white/[0.035] hover:text-white/80",
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn("h-[1.05rem] w-[1.05rem] shrink-0", isActive && "text-volt-lit")}
                strokeWidth={2.1}
                aria-hidden
              />
              <span className="min-w-0 truncate">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function UserBlock({ compact = false }: { compact?: boolean }) {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  if (!user) return null;

  return (
    <div className={cn("border-t border-white/[0.07] pt-4", compact && "pt-3")}>
      <div className="mb-3 flex items-center gap-3 px-1">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-volt/20 text-[0.75rem] font-bold text-volt-lit"
            aria-hidden
          >
            {initials(user.name)}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-[0.8125rem] font-bold text-white">
            {user.name}
          </span>
          <span className="block truncate text-[0.6875rem] font-medium text-white/35">
            {user.email}
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={async () => {
          setBusy(true);
          await logout();
          setBusy(false);
        }}
        disabled={busy}
        className={cn(
          "flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5",
          "text-[0.875rem] font-semibold text-white/45 transition-colors",
          "hover:bg-white/[0.035] hover:text-white/80",
          "outline-none focus-visible:ring-2 focus-visible:ring-volt-lit/70",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {busy ? (
          <Loader2 className="h-[1.05rem] w-[1.05rem] shrink-0 animate-spin" strokeWidth={2.1} aria-hidden />
        ) : (
          <LogOut className="h-[1.05rem] w-[1.05rem] shrink-0" strokeWidth={2.1} aria-hidden />
        )}
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer on navigation and on Escape.
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="tunes min-h-screen bg-[#050505] text-white">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="fixed inset-y-0 left-0 hidden w-[16.5rem] flex-col border-r border-white/[0.07] bg-[#090909] px-4 py-6 lg:flex">
        <Link
          to="/"
          className="mb-8 block px-1 text-[1.1875rem] leading-none"
          aria-label="2K Tunes — home"
        >
          <Wordmark />
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
          <NavList />
        </div>
        <UserBlock />
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.07] bg-[#090909]/95 px-4 py-3.5 backdrop-blur-sm lg:hidden">
        <Link to="/" className="text-[1.0625rem] leading-none" aria-label="2K Tunes — home">
          <Wordmark />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-white/[0.11] text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-volt-lit/70"
        >
          <Menu className="h-4.5 w-4.5" strokeWidth={2.2} aria-hidden />
        </button>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-white/[0.07] bg-[#0B0B0B] px-4 py-5">
            <div className="mb-7 flex items-center justify-between">
              <span className="text-[1.0625rem] leading-none">
                <Wordmark />
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white/50 outline-none focus-visible:ring-2 focus-visible:ring-volt-lit/70"
              >
                <X className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <UserBlock compact />
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main className="lg:pl-[16.5rem]">
        <div className="mx-auto w-full max-w-[74rem] px-4 py-8 sm:px-7 sm:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
