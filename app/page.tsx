import Header from "./components/Header";
import HeroOrbit from "./components/HeroOrbit";
import PromotionSection from "./components/PromotionSection";
import AnalyticsSection from "./components/AnalyticsSection";
import EarningsSection from "./components/EarningsSection";
import ArtistShowcase from "./components/ArtistShowcase";
import CallToAction from "./components/CallToAction";
import Help from "./components/Help";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <main id="top" className="w-full">
      <Header />

      <div id="distribution">
        <HeroOrbit />
        <Features />
      </div>

      <div id="promotion">
        <PromotionSection />
      </div>

      <div id="analytics">
        <AnalyticsSection />
      </div>

      <div id="earnings">
        <EarningsSection />
      </div>

      <ArtistShowcase />

      <div id="help">
        <Help />
      </div>

      <CallToAction />
      <Footer />
    </main>
  );
}
