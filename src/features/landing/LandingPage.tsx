import Hero from "@/features/landing/Hero";
import QuickAccess from "@/features/landing/QuickAccess";
import DistributionSection from "@/features/landing/DistributionSection";
import Features from "@/features/landing/Features";
import ArtistShowcase from "@/features/landing/ArtistShowcase";
import WhyChooseUs from "@/features/landing/WhyChooseUs";
import PricingSection from "@/features/landing/PricingSection";
import AboutSection from "@/features/landing/AboutSection";
import FAQSection from "@/features/landing/FAQSection";
import CallToAction from "@/features/landing/CallToAction";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <QuickAccess />
      <DistributionSection />
      <Features />
      <ArtistShowcase />
      <WhyChooseUs />
      <PricingSection />
      <AboutSection />
      <FAQSection />
      <CallToAction />
    </>
  );
}
