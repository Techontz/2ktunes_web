/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/common/ScrollToTop";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { RedirectIfAuthenticated, RequireAuth } from "@/lib/auth/guards";

// Public — eager, because this is what a first-time visitor lands on.
import LandingPage from "@/features/landing/LandingPage";
import AuthPage from "@/features/auth/AuthPage";

/**
 * The dashboard is code-split. Nobody who never signs in should download nine
 * authenticated screens, and the landing page's initial bundle is the one that
 * has to stay small — it is the page being measured for load and frame rate.
 */
const DashboardLayout = lazy(() => import("@/features/dashboard/DashboardLayout"));
const OverviewPage = lazy(() => import("@/features/dashboard/OverviewPage"));
const MusicPage = lazy(() => import("@/features/dashboard/MusicPage"));
const ReleaseDetailPage = lazy(() => import("@/features/dashboard/ReleaseDetailPage"));
const UploadPage = lazy(() => import("@/features/dashboard/UploadPage"));
const EarningsPage = lazy(() => import("@/features/dashboard/EarningsPage"));
const ArtistsPage = lazy(() => import("@/features/dashboard/ArtistsPage"));
const AnalyticsPage = lazy(() => import("@/features/dashboard/AnalyticsPage"));
const PlanPage = lazy(() => import("@/features/dashboard/PlanPage"));
const SettingsPage = lazy(() => import("@/features/dashboard/SettingsPage"));
const AccountPage = lazy(() => import("@/features/account/AccountPage"));

/** Matches the guards' boot spinner, so a chunk fetch looks like a boot check. */
function Loading() {
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

/**
 * Both public surfaces own their own chrome: the landing page ships SiteNav and
 * SiteFooter, and the auth page is a focused full-screen composition with its own
 * minimal header, language picker and footer. The legacy layout/Header and
 * layout/Footer components remain in the repo but are no longer mounted.
 *
 * AuthProvider wraps the router so route guards and every page read one shared
 * authentication state.
 *
 * `RequireAuth` sits on the dashboard's PARENT route, so it guards the layout
 * and every child at once — a new dashboard page cannot be added unprotected by
 * accident. Signed-out visitors are sent to `/auth?next=<the path they wanted>`;
 * signed-in visitors to /auth are sent onward to that `next`, or to the
 * dashboard.
 */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />

        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/auth"
              element={
                <RedirectIfAuthenticated>
                  <AuthPage />
                </RedirectIfAuthenticated>
              }
            />

            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="music" element={<MusicPage />} />
              <Route path="music/:id" element={<ReleaseDetailPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="earnings" element={<EarningsPage />} />
              <Route path="artists" element={<ArtistsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="plan" element={<PlanPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Kept as a diagnostic: a bare view of GET /api/profile, useful when
                checking what the session actually resolves to. No longer the
                post-authentication destination. */}
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}
