import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";

type Currency = "USD" | "TZS" | "KSH" | "UGSH";

export default function PricingSection() {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState<Currency>("USD");

  const conversionRates = {
    USD: 1,
    TZS: 2600,
    KSH: 130,
    UGSH: 3750,
  };

  const currencySymbols = {
    USD: "$",
    TZS: "Tsh ",
    KSH: "Ksh ",
    UGSH: "Ush ",
  };

  const formatPrice = (basePrice: number) => {
    if (currency === "USD") return `$${basePrice}`;
    const converted = Math.round(basePrice * conversionRates[currency]);
    return `${currencySymbols[currency]}${converted.toLocaleString()}`;
  };

  const plans = [
    { 
      name: t('pricing.starter'), 
      basePrice: 1.99,
      period: t('pricing.mo'), 
      features: [
        t('pricing.feature_unlimited'), 
        t('pricing.feature_stores'), 
        t('pricing.feature_royalties'), 
        t('pricing.feature_email')
      ],
      cta: t('pricing.cta_starter'),
      popular: false
    },
    { 
      name: t('pricing.pro'), 
      basePrice: 4.99,
      period: t('pricing.mo'), 
      features: [
        t('pricing.feature_everything_starter'), 
        t('pricing.feature_mastering'), 
        t('pricing.feature_team'), 
        t('pricing.feature_priority')
      ],
      cta: t('pricing.cta_pro'),
      popular: true
    },
    { 
      name: t('pricing.label'), 
      basePrice: null, 
      period: "", 
      features: [
        t('pricing.feature_unlimited_artists'), 
        t('pricing.feature_premium_support'), 
        t('pricing.feature_api'), 
        t('pricing.feature_custom_terms')
      ],
      cta: t('pricing.cta_label'),
      popular: false
    }
  ];

  const currencies: Currency[] = ["USD", "TZS", "KSH", "UGSH"];

  return (
    <section id="pricing" className="relative w-full bg-brand-grey pt-24 pb-40 md:pt-32 md:pb-56 z-20 scroll-mt-20 overflow-hidden">
      <div 
        className="absolute -top-1 left-0 w-full h-[15vw] bg-brand-grey z-0"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)', transform: 'translateY(-99%)' }}
      />
      <div 
        className="absolute bottom-0 left-0 w-full h-[15vw] bg-brand-black z-10"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-extrabold text-white uppercase italic tracking-tighter mb-4">
            {t('pricing.title_1')} <span className="text-brand-yellow">{t('pricing.title_2')}</span>
          </h2>
          <p className="text-white/40 uppercase tracking-widest text-xs font-bold mb-8">{t('pricing.subtitle')}</p>

          <div className="inline-flex bg-brand-black/50 p-1 rounded-none border border-white/10">
            {currencies.map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-4 md:px-6 py-2 text-[10px] md:text-xs font-black tracking-widest transition-all cursor-pointer ${
                  currency === curr 
                    ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]" 
                    : "text-white/40 hover:text-white"
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, i) => (
          <Card
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            variant={plan.popular ? "glass" : "outline"}
            padding="lg"
            className="flex flex-col h-full"
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white text-[10px] font-black tracking-widest py-1 px-4 uppercase">
                {t('pricing.recommended')}
              </div>
            )}
            <div className="mb-8">
              <h3 className="font-display font-extrabold text-2xl tracking-tighter text-white mb-2 italic uppercase">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={currency}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-2xl md:text-4xl font-display font-black text-white"
                  >
                    {plan.basePrice ? formatPrice(plan.basePrice) : t('pricing.custom')}
                  </motion.span>
                </AnimatePresence>
                <span className="text-white/40 text-sm font-bold uppercase">{plan.period}</span>
              </div>
            </div>
            <div className="flex-1 space-y-4 mb-10">
              {plan.features.map((feature, f) => (
                <div key={f} className="flex gap-3 items-center">
                  <Check className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm text-white/70 font-medium">{feature}</span>
                </div>
              ))}
            </div>
            <Link to="/auth">
              <Button variant={plan.popular ? "primary" : "outline"} className="w-full">
                {plan.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
      <div className="text-center mt-20 pt-12 border-t border-white/5">
        <p className="text-white/40 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
          {t('pricing.tagline_1')} <span className="text-brand-yellow font-black">{t('pricing.tagline_2')}</span>
        </p>
        <div className="flex justify-center gap-8 opacity-20 hover:opacity-50 transition-opacity">
          <span className="font-display font-black text-white italic tracking-tighter text-sm uppercase">{t('common.visa')}</span>
          <span className="font-display font-black text-white italic tracking-tighter text-sm uppercase">{t('common.mobile_money')}</span>
          <span className="font-display font-black text-white italic tracking-tighter text-sm uppercase">{t('common.paypal')}</span>
        </div>
      </div>
    </div>
  </section>
);
}
