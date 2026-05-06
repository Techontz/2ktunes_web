import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowLeft, Mail, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const features = [
    t('auth.feature1'),
    t('auth.feature2'),
    t('auth.feature3'),
    t('auth.feature4'),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col lg:flex-row pt-20 lg:pt-0 relative">
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#111111] border border-white/10 p-8 md:p-12 rounded-2xl max-w-md w-full relative shadow-2xl"
            >
              <button 
                onClick={() => setShowSuccess(false)}
                className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#E5F522] rounded-full flex items-center justify-center mb-8 shadow-xl shadow-[#E5F522]/20">
                  <Mail className="w-8 h-8 text-black" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight mb-4 uppercase italic">
                  Check your inbox
                </h3>
                
                <p className="text-white/40 text-sm md:text-base mb-8 leading-relaxed">
                  We've sent a password reset link to <span className="text-white font-bold">{email || "your email"}</span>. Please check your spam folder if you don't see it.
                </p>

                <button 
                  onClick={() => navigate('/auth?mode=login')}
                  className="w-full bg-white text-black py-4 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#E5F522] transition-colors active:scale-[0.98]"
                >
                  Return to Login
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* RIGHT SIDE - FORM */}
      <div className="lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-20 py-16 lg:py-32">
        <div className="w-full max-w-md mx-auto">
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-10 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('auth.back_to_login')}</span>
          </button>

          <div className="space-y-2 mb-10">
            <h2 className="text-white text-3xl md:text-4xl font-display font-black tracking-tight leading-tight">
              {t('auth.forgot_password_title')}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('auth.forgot_password_desc')}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative group">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="w-full bg-transparent border-2 border-white/10 rounded-sm px-6 py-4 text-white focus:outline-none focus:border-brand-yellow transition-colors placeholder:text-gray-600 font-bold"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-brand-yellow text-brand-black py-5 rounded-sm font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-[0_10px_30px_rgba(255,255,0,0.2)] active:scale-[0.98] cursor-pointer mt-2"
            >
              {t('auth.reset_btn')}
            </button>
          </form>

          <div className="mt-12 p-6 bg-white/5 border border-white/5 rounded-sm">
             <p className="text-[10px] text-gray-400 leading-relaxed text-center font-bold uppercase tracking-widest">
               Having trouble? Contact our <a href="#contact" className="text-brand-yellow hover:underline">support team</a> for assistance.
             </p>
          </div>
        </div>
      </div>

      <div className="lg:hidden p-8 border-t border-white/5 bg-brand-grey text-center">
         <Link to="/" className="inline-block mb-4">
            <span className="font-display font-bold text-xl tracking-tighter text-white">2kTunes</span>
         </Link>
         <p className="text-[10px] text-white/30 uppercase tracking-widest">© 2026 All Rights Reserved</p>
      </div>
    </div>
  );
}
