import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { DASHBOARD_HOME, safeNext } from "./routes";

/**
 * Route guards.
 *
 * Both render nothing while status is "loading" — that window is the boot-time
 * `GET /api/profile` check. Redirecting during it would bounce a signed-in user
 * to /auth on every refresh.
 */

function Booting() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#050505]"
      role="status"
      aria-label="Loading"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
    </div>
  );
}

/** Sends unauthenticated visitors to /auth, remembering where they wanted to go. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Booting />;
  if (status === "unauthenticated") {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }
  return <>{children}</>;
}

/**
 * Keeps signed-in users off /auth. Honours ?next= so a redirected visitor lands
 * where they were originally headed.
 */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Booting />;
  if (status === "authenticated") {
    const next = safeNext(new URLSearchParams(location.search).get("next"));
    return <Navigate to={next ?? DASHBOARD_HOME} replace />;
  }
  return <>{children}</>;
}
