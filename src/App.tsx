import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import ScrollToTop from "@/components/common/ScrollToTop";
import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { RedirectIfAuthenticated, RequireAuth } from "@/lib/auth/guards";
import { DASHBOARD_HOME } from "@/lib/auth/routes";
import { useLanguage } from "@/lib/LanguageContext";

// Public shell + home — eager: this is what a first-time visitor lands on.
import SiteLayout from "@/features/site/layout/SiteLayout";
import HomePage from "@/features/site/pages/HomePage";

/* Public inner pages: one chunk each, fetched on navigation. */
const DistributionPage = lazy(() => import("@/features/site/pages/DistributionPage"));
const PromotionPage = lazy(() => import("@/features/site/pages/PromotionPage"));
const CreatorsPage = lazy(() => import("@/features/site/pages/CreatorsPage"));
const RoyaltiesPage = lazy(() => import("@/features/site/pages/RoyaltiesPage"));
const PricingPage = lazy(() => import("@/features/site/pages/PricingPage"));
const ArtistsPage = lazy(() => import("@/features/site/pages/ArtistsPage"));
const LabelsPage = lazy(() => import("@/features/site/pages/LabelsPage"));
const AboutPage = lazy(() => import("@/features/site/pages/AboutPage"));
const HelpPage = lazy(() => import("@/features/site/pages/HelpPage"));
const ContactPage = lazy(() => import("@/features/site/pages/ContactPage"));
const LegalPage = lazy(() => import("@/features/site/pages/LegalPage"));
const NotFoundPage = lazy(() => import("@/features/site/pages/NotFoundPage"));

/* Auth screens. */
const AuthPage = lazy(() => import("@/features/auth/AuthPage"));
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/RecoveryPages").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/RecoveryPages").then((m) => ({ default: m.ResetPasswordPage })),
);
const EmailVerifiedPage = lazy(() =>
  import("@/features/auth/RecoveryPages").then((m) => ({ default: m.EmailVerifiedPage })),
);

/* Dashboard — code-split per route; nobody who never signs in downloads it. */
const DashboardLayout = lazy(() => import("@/features/dashboard/shell/DashboardLayout"));
const OverviewPage = lazy(() => import("@/features/dashboard/overview/OverviewPage"));
const MusicPage = lazy(() => import("@/features/dashboard/music/MusicPage"));
const ReleaseDetailPage = lazy(() => import("@/features/dashboard/music/ReleaseDetailPage"));
const ReleaseWizardPage = lazy(() => import("@/features/dashboard/music/wizard/ReleaseWizardPage"));
const DashPromotionPage = lazy(() => import("@/features/dashboard/promotion/PromotionPage"));
const CampaignDetailPage = lazy(() => import("@/features/dashboard/promotion/CampaignDetailPage"));
const DashCreatorsPage = lazy(() => import("@/features/dashboard/marketplace/CreatorsPage"));
const CreatorDetailPage = lazy(() => import("@/features/dashboard/marketplace/CreatorDetailPage"));
const OrdersPage = lazy(() => import("@/features/dashboard/marketplace/OrdersPage"));
const OrderDetailPage = lazy(() => import("@/features/dashboard/marketplace/OrderDetailPage"));
const CreatorWorkspacePage = lazy(() => import("@/features/dashboard/creator/CreatorWorkspacePage"));
const AnalyticsPage = lazy(() => import("@/features/dashboard/analytics/AnalyticsPage"));
const DashRoyaltiesPage = lazy(() => import("@/features/dashboard/royalties/RoyaltiesPage"));
const WalletPage = lazy(() => import("@/features/dashboard/wallet/WalletPage"));
const PlanPage = lazy(() => import("@/features/dashboard/plan/PlanPage"));
const SplitsPage = lazy(() => import("@/features/dashboard/splits/SplitsPage"));
const ArtistsDashboardPage = lazy(() => import("@/features/dashboard/artists/ArtistsPage"));
const NotificationsPage = lazy(() => import("@/features/dashboard/notifications/NotificationsPage"));
const SupportPage = lazy(() => import("@/features/dashboard/support/SupportPage"));
const TicketDetailPage = lazy(() => import("@/features/dashboard/support/TicketDetailPage"));
const HelpArticlesPage = lazy(() => import("@/features/dashboard/support/HelpPage"));
const HelpArticlePage = lazy(() => import("@/features/dashboard/support/HelpArticlePage"));
const SettingsPage = lazy(() => import("@/features/dashboard/settings/SettingsPage"));

/* Signed-in, outside the dashboard shell. */
const OnboardingPage = lazy(() => import("@/features/onboarding/OnboardingPage"));

/* Public release landing page ("smart link"). */
const SmartLinkPage = lazy(() => import("@/features/smartlink/SmartLinkPage"));

/** Matches the guards' boot spinner, so a chunk fetch looks like a boot check. */
function Loading() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-svh items-center justify-center bg-surface" role="status" aria-label={t("common.loading")}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
    </div>
  );
}

/**
 * Routing.
 *
 * Public pages share SiteLayout (nav, footer, skip link). Auth screens own a
 * focused layout. `RequireAuth` sits on the dashboard's PARENT route, so every
 * dashboard page is guarded by construction.
 *
 * /onboarding runs once after registration (account type, first artist
 * profile, optional creator profile) and then hands over to /dashboard.
 * /r/:slug is the public, mobile-first smart-link page for a release.
 * Retired paths (/account, /dashboard/upload, /dashboard/earnings) redirect to
 * their replacements so old bookmarks and emails keep working.
 */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/distribution" element={<DistributionPage />} />
                <Route path="/promotion" element={<PromotionPage />} />
                <Route path="/creators" element={<CreatorsPage />} />
                <Route path="/royalties" element={<RoyaltiesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/artists" element={<ArtistsPage />} />
                <Route path="/labels" element={<LabelsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/legal/:doc" element={<LegalPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              <Route
                path="/auth"
                element={
                  <RedirectIfAuthenticated>
                    <AuthPage />
                  </RedirectIfAuthenticated>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/email-verified" element={<EmailVerifiedPage />} />

              <Route path="/r/:slug" element={<SmartLinkPage />} />

              <Route
                path="/onboarding"
                element={
                  <RequireAuth>
                    <OnboardingPage />
                  </RequireAuth>
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
                <Route path="music/:id/edit" element={<ReleaseWizardPage />} />
                <Route path="new-release" element={<ReleaseWizardPage />} />
                <Route path="promotion" element={<DashPromotionPage />} />
                <Route path="promotion/campaigns/:id" element={<CampaignDetailPage />} />
                <Route path="creators" element={<DashCreatorsPage />} />
                <Route path="creators/:slug" element={<CreatorDetailPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="creator" element={<CreatorWorkspacePage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="royalties" element={<DashRoyaltiesPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="plan" element={<PlanPage />} />
                <Route path="splits" element={<SplitsPage />} />
                <Route path="artists" element={<ArtistsDashboardPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="support/:id" element={<TicketDetailPage />} />
                <Route path="help" element={<HelpArticlesPage />} />
                <Route path="help/:slug" element={<HelpArticlePage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Retired paths from the first dashboard. */}
                <Route path="upload" element={<Navigate to="/dashboard/new-release" replace />} />
                <Route path="earnings" element={<Navigate to="/dashboard/wallet" replace />} />
                <Route path="*" element={<Navigate to={DASHBOARD_HOME} replace />} />
              </Route>

              <Route path="/account" element={<Navigate to="/dashboard/settings" replace />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
