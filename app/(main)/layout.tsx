'use client';

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/lib/LanguageContext";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

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

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      <Header navLinks={navLinks} languages={languages} />
      <main className="relative flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      <Footer />
    </div>
  );
}
