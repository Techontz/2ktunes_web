import SiteNav from "./sections/SiteNav";
import HeroSection from "./sections/HeroSection";
import DistributeSection from "./sections/DistributeSection";
import ShowcaseSection from "./sections/ShowcaseSection";
import LocalPaymentsSection from "./sections/LocalPaymentsSection";
import OwnershipSection from "./sections/OwnershipSection";
import PromotionSection from "./sections/PromotionSection";
import AnalyticsSection from "./sections/AnalyticsSection";
import EarningsSection from "./sections/EarningsSection";
import CommunitySection from "./sections/CommunitySection";
import PricingSection from "./sections/PricingSection";
import FinalCtaSection from "./sections/FinalCtaSection";
import SiteFooter from "./sections/SiteFooter";

/**
 * 2K Tunes landing page.
 *
 * The band sequence is the storyboard, and no two adjacent bands share a tone:
 *
 *   black   hero          emotion
 *   carbon  distribution  global reach
 *   bone    showcase      the product, in a real device
 *   carbon  payments      the Africa-first advantage
 *   bone    ownership     who the work belongs to
 *   carbon  promotion     growth beyond upload
 *   bone    analytics     what the numbers say
 *   carbon  wallet        getting paid
 *   clay    community     who this is for
 *   bone    pricing       what it costs
 *   violet  CTA           the ask
 *   black   footer
 */
export default function LandingPage() {
  return (
    <div className="tunes w-full overflow-x-hidden bg-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-[0.875rem] focus:font-bold focus:text-ink"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <HeroSection />
        <DistributeSection />
        <ShowcaseSection />
        <LocalPaymentsSection />
        <OwnershipSection />
        <PromotionSection />
        <AnalyticsSection />
        <EarningsSection />
        <CommunitySection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
