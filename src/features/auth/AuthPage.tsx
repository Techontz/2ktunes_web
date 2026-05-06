'use client';

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Apple, Chrome } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function AuthPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'login' ? 'login' : 'signup';

  const setMode = (newMode: 'login' | 'signup') => {
    router.push(`/auth?mode=${newMode}`);
  };

  const features = [
    t('auth.feature1'),
    t('auth.feature2'),
    t('auth.feature3'),
    t('auth.feature4'),
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSocialAuth = () => {
    if (mode === 'signup') {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col lg:flex-row pt-20 lg:pt-0">
      {/* LEFT SIDE - VISUAL */}
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
        </div>
      </div>

      {/* RIGHT SIDE - AUTH FORM */}
      <div className="lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-20 py-16 lg:py-32">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6 px-1">
            <span className="text-white/50 text-sm">
              {mode === 'signup' ? t('auth.already_member') : t('auth.no_account')}
            </span>

            <button
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-white/5 border border-white/10 text-white hover:text-brand-yellow hover:border-brand-yellow transition-all duration-200 cursor-pointer"
            >
              {mode === 'signup' ? t('auth.login') : t('auth.signup')}
            </button>
          </div>

          <div className="space-y-2 mb-10">
            <h2 className="text-white text-3xl md:text-4xl font-display font-black tracking-tight leading-tight">
              {mode === 'signup' ? t('auth.title') : t('auth.login_title')}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {mode === 'signup' ? t('auth.desc') : t('auth.login_desc')}
            </p>
          </div>

          <div className="space-y-3 mb-10">
            <button 
              onClick={handleSocialAuth}
              className="w-full bg-white text-black py-3 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Chrome className="w-5 h-5" />
              <span className="text-sm uppercase tracking-tight">{t('auth.google')}</span>
            </button>
            <button 
              onClick={handleSocialAuth}
              className="w-full bg-[#121217] text-white border border-white/10 py-3 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] cursor-pointer"
            >
              <Apple className="w-5 h-5 fill-current" />
              <span className="text-sm uppercase tracking-tight">{t('auth.apple')}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-10 text-white/20">
            <div className="flex-1 h-px bg-current" />
            <span className="text-[10px] font-black tracking-widest uppercase">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-current" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative group">
              <input 
                type="email" 
                placeholder={t('auth.email_placeholder')}
                className="w-full bg-transparent border-2 border-white/10 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow transition-colors placeholder:text-gray-600 font-bold"
              />
            </div>

            {mode === 'login' && (
              <div className="relative group">
                <input 
                  type="password" 
                  placeholder={t('auth.password_placeholder')}
                  className="w-full bg-transparent border-2 border-white/10 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow transition-colors placeholder:text-gray-600 font-bold"
                />
                <button 
                  type="button" 
                  onClick={() => router.push('/forgot-password')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/30 hover:text-brand-yellow uppercase tracking-widest cursor-pointer"
                >
                  {t('auth.forgot_password')}
                </button>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-brand-yellow text-brand-black py-5 rounded-sm font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-[0_10px_30px_rgba(255,255,0,0.2)] active:scale-[0.98] cursor-pointer mt-2"
            >
              {mode === 'signup' ? t('auth.email_btn') : t('auth.login_btn')}
            </button>
          </form>

          <p className="mt-8 text-[10px] text-gray-500 leading-relaxed text-center font-bold">
            {t('auth.terms').split('Terms & Conditions')[0]}
            <a href="#" className="text-brand-yellow hover:underline">Terms & Conditions</a>
            {t('auth.terms').split('Terms & Conditions')[1]?.split('Privacy Policy')[0]}
            <a href="#" className="text-brand-yellow hover:underline">Privacy Policy</a>
            {t('auth.terms').split('Privacy Policy')[1]}
          </p>
        </div>
      </div>

      <div className="lg:hidden p-8 border-t border-white/5 bg-brand-grey text-center">
         <Link href="/" className="inline-block mb-4">
            <span className="font-display font-bold text-xl tracking-tighter text-white">2kTunes</span>
         </Link>
         <p className="text-[10px] text-white/30 uppercase tracking-widest">© 2026 All Rights Reserved</p>
      </div>
    </div>
  );
}
