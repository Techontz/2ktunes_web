import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/common/ScrollToTop";
import { useLanguage } from "@/lib/LanguageContext";

// Pages
import LandingPage from "@/features/landing/LandingPage";
import AuthPage from "@/features/auth/AuthPage";
import OnboardingPage from "@/features/auth/OnboardingPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import DashboardPage from "@/features/dashboard/DashboardPage";

export default function App() {
  const { t } = useLanguage();

  const navLinks = [
    { name: t("nav.pricing"), href: "#pricing" },
    { name: t("nav.why"), href: "#why" },
    { name: t("nav.about"), href: "#about" },
    { name: t("nav.faq"), href: "#faq" },
    { name: t("nav.contact"), href: "#contact" },
  ];

  const languages = [
    { code: "EN", name: "English" },
    { code: "SW", name: "Swahili" },
    { code: "FR", name: "French" },
    { code: "PT", name: "Portuguese" },
    { code: "ES", name: "Spanish" },
  ];

  return (
    <Router>
      <ScrollToTop />

      <LayoutWrapper 
        navLinks={navLinks} 
        languages={languages}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

// Separate component for layout logic to access useLocation
function LayoutWrapper({ children, navLinks, languages }: { children: React.ReactNode, navLinks: any[], languages: any[] }) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      {!isDashboard && <Header navLinks={navLinks} languages={languages} />}
      <main className="relative flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}
