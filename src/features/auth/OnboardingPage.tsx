'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowLeft, Music, MapPin, Phone, User, Search, ChevronDown, X, Mail, MessageSquare, Apple } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { countries } from "countries-list";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const countryList = Object.entries(countries).map(([code, country]) => ({
  code,
  name: (country as any).name,
  emoji: (country as any).emoji,
  phone: (country as any).phone[0]
})).sort((a, b) => a.name.localeCompare(b.name));

export default function OnboardingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryList.find(c => c.name === "Tanzania") || countryList[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // OTP States
  const [showMethodChoice, setShowMethodChoice] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState("plusdobi@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState("621 234 567");
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Plans States
  const [showPlans, setShowPlans] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'cards' | 'paypal' | 'gpay' | 'apple'>('mobile');
  const [currency, setCurrency] = useState<"USD" | "TZS" | "KSH" | "UGSH">("USD");

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

  const currencies: ("USD" | "TZS" | "KSH" | "UGSH")[] = ["USD", "TZS", "KSH", "UGSH"];

  const filteredCountries = countryList.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMethodChoice(true);
  };

  const startVerification = (method: 'email' | 'phone') => {
    setOtpMethod(method);
    setShowMethodChoice(false);
    setShowOTP(true);
  };

  const features = [
    t('auth.feature1'),
    t('auth.feature2'),
    t('auth.feature3'),
    t('auth.feature4'),
  ];

  return (
    <div className="min-h-screen bg-brand-black flex flex-col lg:flex-row pt-20 lg:pt-0">
      {/* LEFT SIDE - VISUAL (Identical to Auth for consistency) */}
      <div className="lg:w-[55%] relative overflow-hidden flex flex-col justify-center px-8 md:px-16 py-16 lg:py-0 min-h-[400px] lg:min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from),_transparent_80%),_radial-gradient(circle_at_bottom_left,_var(--tw-gradient-to),_transparent_80%)] from-brand-primary/20 via-brand-primary to-indigo-950">
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none z-0" />
        <div className="relative z-10 w-full max-w-2xl mx-auto lg:mx-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12"
          >
            <h1 className="font-display font-extrabold flex flex-col items-center text-center leading-[0.85] tracking-tight select-none">
              <span className="text-white text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw]">
                {t('hero.drop')}
              </span>
              <span className="text-white italic text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] tracking-tighter">
                {t('hero.grow')}
              </span>
              <span className="text-white text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw]">
                {t('hero.earn')}
              </span>
            </h1>
          </motion.div>

          <div className="space-y-4 md:space-y-6 max-w-fit mx-auto lg:mx-0">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 md:gap-4 group"
              >
                <div className="w-6 h-6 flex-shrink-0 bg-brand-yellow flex items-center justify-center rounded-sm transition-transform">
                  <Check className="w-4 h-4 text-brand-black stroke-[4]" />
                </div>
                <span className="text-white font-bold text-sm md:text-lg tracking-tight uppercase lg:normal-case">{feature}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-16 md:mt-24 max-w-lg mx-auto lg:mx-0 border-l-4 border-brand-yellow pl-6"
          >
            <p className="text-white/60 font-medium italic text-sm md:text-base leading-relaxed">
              {t('onboarding.testimonial')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE - ONBOARDING FORM */}
      <div className="lg:w-[45%] bg-brand-black flex flex-col justify-center px-8 md:px-16 py-20 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8 px-1">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/50 hover:text-brand-yellow transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('onboarding.back')}
            </button>
          </div>

          <div className="space-y-2 mb-10">
            <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white tracking-tighter uppercase leading-none italic">
              {t('onboarding.title')}
            </h2>
            <p className="text-brand-primary text-sm font-bold uppercase tracking-widest">
              {t('onboarding.desc')}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t('auth.email_placeholder')}</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="plusdobi@gmail.com"
                className="w-full bg-brand-grey border-2 border-white/5 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow transition-colors placeholder:text-gray-700 font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t('onboarding.first_name')}</label>
                <input 
                  type="text" 
                  placeholder="Dobi"
                  className="w-full bg-brand-grey border-2 border-white/5 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow transition-colors placeholder:text-gray-700 font-bold"
                  required
                />
                <p className="text-[9px] text-white/30 font-bold uppercase leading-tight ml-1">{t('onboarding.payout_notice')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t('onboarding.last_name')}</label>
                <input 
                  type="text" 
                  placeholder="Plus"
                  className="w-full bg-brand-grey border-2 border-white/5 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow transition-colors placeholder:text-gray-700 font-bold"
                  required
                />
                <p className="text-[9px] text-white/30 font-bold uppercase leading-tight ml-1">{t('onboarding.payout_notice')}</p>
              </div>
            </div>

            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t('onboarding.country')}</label>
              <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-brand-grey border-2 border-white/5 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{selectedCountry.emoji}</span>
                  <span className="font-bold">{selectedCountry.name}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-white/20 group-hover:text-brand-yellow transition-all ${isOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-50 top-full left-0 w-full mt-2 bg-brand-grey border-2 border-white/10 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-80"
                  >
                    <div className="p-3 border-b border-white/5 bg-brand-black/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input 
                          autoFocus
                          type="text"
                          placeholder="Search countries..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full bg-brand-black border border-white/10 rounded-sm pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 no-scrollbar">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsOpen(false);
                              setSearch("");
                            }}
                            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-brand-primary group transition-colors ${selectedCountry.code === c.code ? 'bg-white/5' : ''}`}
                          >
                            <span className="text-lg">{c.emoji}</span>
                            <span className={`text-sm font-bold ${selectedCountry.code === c.code ? 'text-brand-yellow' : 'text-white/70'} group-hover:text-white`}>
                              {c.name}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-4 text-sm text-white/30 italic">No countries found...</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t('onboarding.phone')}</label>
              <div className="flex gap-2">
                <div className="w-24 bg-brand-grey border-2 border-white/5 rounded-sm px-4 py-4 text-white/50 font-bold text-center flex items-center justify-center gap-1">
                  <span className="text-xs">+{selectedCountry.phone}</span>
                </div>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="621 234 567"
                  className="flex-1 bg-brand-grey border-2 border-white/5 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow transition-colors placeholder:text-gray-700 font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-5 h-5 flex-shrink-0">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-full h-full border-2 border-white/20 rounded-sm bg-brand-grey peer-checked:bg-brand-yellow peer-checked:border-brand-yellow transition-all" />
                  <Check className="absolute inset-0 w-full h-full text-brand-black opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
                </div>
                <span className="text-xs font-bold text-white/50 group-hover:text-white transition-colors">{t('onboarding.news_consent')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-5 h-5 flex-shrink-0">
                  <input type="checkbox" className="peer sr-only" required />
                  <div className="w-full h-full border-2 border-white/20 rounded-sm bg-brand-grey peer-checked:bg-brand-yellow peer-checked:border-brand-yellow transition-all" />
                  <Check className="absolute inset-0 w-full h-full text-brand-black opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
                </div>
                <span className="text-xs font-bold text-white/50 group-hover:text-white transition-colors">{t('onboarding.age_consent')}</span>
              </label>
            </div>

            <p className="text-[10px] text-white/30 font-medium leading-relaxed mt-6">
              {t('auth.terms')}
            </p>

            <button 
              type="submit"
              className="w-full bg-brand-yellow text-brand-black py-5 rounded-sm font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-[0_10px_30px_rgba(255,255,0,0.2)] active:scale-[0.98] cursor-pointer mt-4"
            >
              {t('onboarding.btn')}
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">
            2ktunes &copy; {new Date().getFullYear()} • {t('footer.rights')}
          </p>
        </div>
      </div>

      {/* METHOD CHOICE MODAL */}
      <AnimatePresence>
        {showMethodChoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMethodChoice(false)}
              className="absolute inset-0 bg-brand-black/95 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-brand-grey border border-white/10 rounded-sm p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowMethodChoice(false)}
                className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-display font-extrabold text-2xl text-white uppercase italic mb-2">{t('otp.method_choice')}</h3>
              <p className="text-white/40 text-sm mb-8 font-bold">How should we send your verification code?</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => startVerification('email')}
                  className="w-full flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-sm hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all text-left group"
                >
                  <Mail className="w-6 h-6 text-brand-primary group-hover:text-brand-yellow" />
                  <div className="flex flex-col">
                    <span className="text-white font-black text-sm uppercase tracking-widest">Email</span>
                    <span className="text-white/30 text-[10px] font-bold">{email}</span>
                  </div>
                </button>
                <button 
                  onClick={() => startVerification('phone')}
                  className="w-full flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-sm hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all text-left group"
                >
                  <MessageSquare className="w-6 h-6 text-brand-primary group-hover:text-brand-yellow" />
                  <div className="flex flex-col">
                    <span className="text-white font-black text-sm uppercase tracking-widest">SMS / Whatsapp</span>
                    <span className="text-white/30 text-[10px] font-bold">+{selectedCountry.phone} {phoneNumber}</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OTP MODAL */}
      <AnimatePresence>
        {showOTP && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-black/95 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-brand-black/40 border border-white/10 rounded-sm p-6 md:p-12 lg:p-16 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <button 
                onClick={() => setShowOTP(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-white/20 hover:text-white transition-colors cursor-pointer z-50"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <div className="mb-6 md:mb-10">
                <h3 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-white tracking-tighter leading-[1] mb-3 md:mb-4 italic uppercase">
                  {otpMethod === 'email' ? t('otp.title_email') : t('otp.title_phone')}
                </h3>
                <p className="text-white font-bold text-[10px] md:text-sm leading-relaxed opacity-60">
                  {t('otp.subtitle')}
                </p>
              </div>

              <div className="border border-white/10 p-4 md:p-10 rounded-sm mb-8 md:mb-10">
                <p className="text-white/60 font-medium text-xs md:text-base mb-6 md:mb-8">
                  {t('otp.message')} <span className="text-white font-black block sm:inline mt-1 sm:mt-0">{otpMethod === 'email' ? email : `+${selectedCountry.phone} ${phoneNumber}`}</span>
                </p>

                <div className="grid grid-cols-6 gap-2 md:gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpInputs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-full aspect-square bg-white/5 border-2 border-white/10 rounded-sm text-center text-lg md:text-3xl font-black text-brand-yellow focus:outline-none focus:border-brand-yellow focus:bg-brand-yellow/5 transition-all flex items-center justify-center p-0"
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 md:gap-8">
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-brand-yellow text-brand-black py-4 md:py-5 rounded-sm font-black text-sm md:text-base uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_10px_40px_rgba(255,255,0,0.2)] active:scale-[0.98] cursor-pointer"
                  >
                    {t('otp.verify_btn')}
                  </button>

                <div className="flex items-center gap-2 group cursor-pointer">
                  <span className="text-white/40 font-bold text-xs md:text-sm">{t('otp.resend_text')}</span>
                  <button className="text-brand-yellow font-black text-xs md:text-sm uppercase tracking-widest underline decoration-2 underline-offset-4 group-hover:text-white transition-colors cursor-pointer">
                    {t('otp.resend_btn')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* PLANS MODAL */}
      <AnimatePresence>
        {showPlans && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlans(false)}
              className="absolute inset-0 bg-brand-black/98 backdrop-blur-md cursor-pointer" 
            />
            
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlans(false)}
              className="fixed top-4 right-4 md:top-8 md:right-8 text-white/40 hover:text-white transition-colors cursor-pointer z-[200] bg-white/5 p-3 md:p-4 rounded-full border border-white/10 hover:bg-brand-primary active:scale-90 flex items-center justify-center backdrop-blur-md"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-6xl bg-transparent px-4 md:px-10 py-16 md:py-20 overflow-y-auto max-h-[95vh] no-scrollbar"
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-extrabold text-white uppercase italic tracking-tighter mb-4">
                  {t('pricing.title_1')} <span className="text-brand-yellow">{t('pricing.title_2')}</span>
                </h2>
                <p className="text-white/40 uppercase tracking-widest text-[10px] md:text-xs font-bold mb-8">Choose the right plan to start your journey</p>

                <div className="flex flex-col items-center gap-6">
                  <div className="inline-flex bg-brand-black/50 p-1 rounded-none border border-white/10">
                    {currencies.map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`px-4 md:px-6 py-2 text-[10px] md:text-xs font-black tracking-widest transition-all cursor-pointer ${
                          currency === curr 
                            ? "bg-brand-primary text-white" 
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer border-b border-transparent hover:border-white/20 pb-0.5"
                  >
                    {t('common.skip')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {plans.map((plan, i) => (
                  <Card
                    key={i}
                    variant={plan.popular ? "glass" : "outline"}
                    padding="lg"
                    className="flex flex-col h-full relative"
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white text-[10px] font-black tracking-widest py-1 px-4 uppercase z-10">
                        {t('pricing.recommended')}
                      </div>
                    )}
                    <div className="mb-8">
                      <h3 className="font-display font-extrabold text-xl md:text-2xl tracking-tighter text-white mb-2 italic uppercase">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-4xl font-display font-black text-white">
                          {plan.basePrice ? formatPrice(plan.basePrice) : t('pricing.custom')}
                        </span>
                        <span className="text-white/40 text-xs font-bold uppercase">{plan.period}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 mb-10">
                      {plan.features.map((feature, f) => (
                        <div key={f} className="flex gap-3 items-center">
                          <Check className="w-4 h-4 text-brand-primary flex-shrink-0" />
                          <span className="text-xs md:text-sm text-white/70 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedPlanData(plan);
                        setShowPlans(false);
                        setShowPayment(true);
                      }}
                      className={`w-full py-4 px-6 rounded-sm font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                        plan.popular 
                          ? "bg-brand-primary text-white hover:bg-white hover:text-brand-black" 
                          : "border-2 border-white/10 text-white hover:border-brand-yellow hover:text-brand-yellow"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="absolute inset-0 bg-brand-black/98 backdrop-blur-md cursor-pointer" 
            />
            
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="fixed top-4 right-4 md:top-8 md:right-8 text-white/40 hover:text-white transition-colors cursor-pointer z-[210] bg-white/5 p-3 md:p-4 rounded-full border border-white/10 hover:bg-brand-primary active:scale-90 flex items-center justify-center backdrop-blur-md"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-grey border border-white/10 rounded-sm overflow-hidden flex flex-col shadow-2xl max-h-[90vh] no-scrollbar"
            >
              <div className="p-6 md:p-10 border-b border-white/5 text-center bg-brand-black/20">
                <h3 className="text-xl md:text-3xl font-display font-extrabold text-white tracking-tighter uppercase italic">{t('payment.title')}</h3>
                <p className="text-white/40 text-xs md:text-sm font-bold mt-2 uppercase tracking-tight">{t('payment.subtitle')}</p>
              </div>

              <div className="p-6 md:p-10 overflow-y-auto no-scrollbar space-y-8 flex-1">
                {/* Country Re-selector */}
                <div className="relative group">
                  <span className="absolute -top-2.5 left-4 bg-brand-grey px-2 text-[10px] font-black text-white/40 uppercase tracking-widest z-10">{t('onboarding.country')}</span>
                  <div className="w-full bg-transparent border border-white/20 rounded-sm px-6 py-4 text-white flex items-center justify-between group-hover:border-white/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span>{selectedCountry.emoji}</span>
                      <span className="font-bold text-sm">{selectedCountry.name}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-white uppercase tracking-tight">{t('payment.method')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                    {[
                      { id: 'mobile', label: 'Mobile' },
                      { id: 'cards', label: 'Cards' },
                      { id: 'paypal', label: 'PayPal' },
                      { id: 'gpay', label: 'GPay' },
                      { id: 'apple', label: 'Apple' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer whitespace-nowrap"
                      >
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          paymentMethod === m.id ? "border-brand-yellow" : "border-white/20 group-hover:border-white/40"
                        }`}>
                          {paymentMethod === m.id && <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-brand-yellow" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${paymentMethod === m.id ? "text-white" : "text-white/40 group-hover:text-white"}`}>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Payment Details */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'mobile' && (
                    <motion.div 
                      key="mobile"
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-4"
                    >
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {['M-Pesa', 'Tigo Pesa', 'Airtel', 'Halopesa'].map((prov) => (
                          <button key={prov} className="flex items-center justify-center p-4 border border-white/10 bg-white/5 rounded-sm hover:border-brand-yellow transition-all uppercase text-[10px] font-black tracking-widest">
                            {prov}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute -top-2.5 left-4 bg-brand-grey px-2 text-[10px] font-black text-white/40 uppercase tracking-widest z-10">{t('payment.phone_number')}</span>
                        <div className="flex bg-transparent border border-white/20 rounded-sm overflow-hidden focus-within:border-brand-yellow transition-colors">
                          <div className="px-6 flex items-center font-bold text-white/40 text-sm border-r border-white/10">+{selectedCountry.phone}</div>
                          <input type="tel" className="flex-1 bg-transparent px-6 py-4 text-white focus:outline-none font-bold" placeholder="621 234 567" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'cards' && (
                    <motion.div 
                      key="cards"
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 pt-4"
                    >
                      <div className="flex gap-2 mb-2 pb-6 border-b border-white/5">
                        {['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'].map(card => (
                          <div key={card} className="w-10 h-6 bg-white/10 rounded-sm flex items-center justify-center text-[6px] font-black text-white/20 uppercase">{card}</div>
                        ))}
                      </div>
                      <div className="space-y-6">
                        <div className="relative">
                          <span className="absolute -top-2.5 left-4 bg-brand-grey px-2 text-[10px] font-black text-white/40 uppercase tracking-widest z-10">{t('payment.card_number')}</span>
                          <input type="text" className="w-full bg-transparent border border-white/20 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow font-bold uppercase transition-all" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="relative">
                            <span className="absolute -top-2.5 left-4 bg-brand-grey px-2 text-[10px] font-black text-white/40 uppercase tracking-widest z-10">{t('payment.expiry')}</span>
                            <input type="text" className="w-full bg-transparent border border-white/20 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow font-bold uppercase transition-all" placeholder="MM / YY" />
                          </div>
                          <div className="relative">
                            <span className="absolute -top-2.5 left-4 bg-brand-grey px-2 text-[10px] font-black text-white/40 uppercase tracking-widest z-10">{t('payment.cvv')}</span>
                            <input type="text" className="w-full bg-transparent border border-white/20 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow font-bold uppercase transition-all" placeholder="***" />
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute -top-2.5 left-4 bg-brand-grey px-2 text-[10px] font-black text-white/40 uppercase tracking-widest z-10">{t('payment.card_name')}</span>
                          <input type="text" className="w-full bg-transparent border border-white/20 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow font-bold uppercase transition-all" placeholder="FULL NAME" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod !== 'mobile' && paymentMethod !== 'cards' && (
                    <motion.div 
                      key="other"
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 flex flex-col items-center justify-center text-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-brand-yellow animate-pulse" />
                      </div>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
                        Redirecting to safe {paymentMethod.toUpperCase()} portal...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Summary & Button */}
              <div className="p-6 md:p-10 bg-[#1A1A1A] mt-auto border-t border-white/5 space-y-8">
                <div className="flex justify-between items-center">
                   <div className="space-y-1">
                     <h4 className="text-white font-black text-xl italic uppercase tracking-tighter leading-none">{selectedPlanData?.name || "Artist Account"}</h4>
                     <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{t('payment.billed_yearly')}</p>
                   </div>
                   <div className="text-right space-y-0.5">
                     <span className="text-2xl md:text-3xl font-display font-black text-white block leading-none">
                        {selectedPlanData?.basePrice ? formatPrice(selectedPlanData.basePrice) : "CUSTOM"}
                     </span>
                     <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{currency} {selectedPlanData?.basePrice ? formatPrice(selectedPlanData.basePrice) : ""} billed yearly</span>
                   </div>
                </div>

                <div className="space-y-6">
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-brand-yellow text-brand-black py-5 md:py-6 rounded-sm font-black text-sm md:text-base uppercase tracking-widest hover:bg-white transition-all shadow-xl active:scale-[0.98] cursor-pointer"
                  >
                    {t('payment.pay_btn')}
                  </button>

                  <div className="flex items-center justify-center gap-3 opacity-20">
                    <div className="flex items-center gap-1.5 ">
                      <Check className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t('payment.secure')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
