import { motion } from "motion/react";
import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-brand-black pt-8 pb-12 md:pt-16 md:pb-16 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16 md:mb-24">
        {/* Column 1: Logo & Info */}
        <div className="flex flex-col items-start lg:col-span-1 border-b border-white/5 pb-12 lg:border-none lg:pb-0">
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tighter">2kTunes</h2>
            <p className="text-white/40 font-bold text-[9px] uppercase tracking-widest mt-1">{t('footer.tagline')}</p>
          </div>
          
          <div className="mt-8 md:mt-10 group cursor-pointer w-full max-w-[240px]">
            <div className="flex items-center space-x-3 p-4 border border-white/10 rounded-xl transition-colors group-hover:bg-white/5">
              <div className="w-10 h-10 rounded-full bg-brand-black flex items-center justify-center border border-white/20">
                <span className="text-green-500 text-xl">●</span>
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">{t('footer.preferred')}</p>
                <p className="text-xs text-white font-bold leading-tight">{t('footer.provider')}</p>
                <p className="text-[9px] text-white/30 font-medium">{t('common.spotify_artist')}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-12 w-full">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4">{t('footer.partners')}</p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 group/partner bg-white/5 p-2 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                <CreditCard className="w-4 h-4 text-white/60" />
                <span className="font-display font-black text-xs text-white italic tracking-tighter uppercase">{t('common.visa')}</span>
              </div>
              <div className="flex items-center gap-2 group/partner bg-white/5 p-2 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                <Smartphone className="w-4 h-4 text-brand-yellow/80" />
                <span className="font-display font-extrabold text-[9px] text-brand-yellow uppercase italic leading-none">{t('common.mobile_money')}</span>
              </div>
              <div className="flex items-center gap-2 group/partner bg-white/5 p-2 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                <Wallet className="w-4 h-4 text-blue-400/80" />
                <span className="font-display font-black text-xs text-blue-400 italic tracking-tighter uppercase px-1">{t('common.paypal')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Newsletter */}
        <div className="flex flex-col border-b border-white/5 pb-12 lg:border-none lg:pb-0">
          <h3 className="text-white font-display font-bold text-lg mb-6 underline decoration-brand-yellow/30 underline-offset-8">{t('footer.newsletter_title')}</h3>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            {t('footer.newsletter_desc')}
          </p>
          <div className="flex flex-col space-y-3">
            <input 
              type="email" 
              placeholder={t('footer.email_placeholder')}
              className="w-full bg-transparent border-b border-white/20 py-3 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors placeholder:text-white/20"
            />
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-brand-yellow text-brand-black font-display font-extrabold py-4 uppercase tracking-tighter text-sm mt-4 cursor-pointer"
            >
              {t('footer.subscribe')}
            </motion.button>
          </div>
        </div>

        {/* Column 3: Social & Links 1 */}
        <div className="flex flex-col md:pl-0 lg:pl-8 border-b border-white/5 pb-12 lg:border-none lg:pb-0">
          <div className="mb-0 lg:mb-12">
            <h3 className="text-white font-display font-bold text-lg mb-6">{t('footer.social_title')}</h3>
            <ul className="space-y-4">
              {[
                { name: "Instagram", icon: "ig" },
                { name: "TikTok", icon: "tk" },
                { name: "YouTube", icon: "yt" },
                { name: "Facebook", icon: "fb" }
              ].map((social) => (
                <li key={social.name}>
                  <a href="#" className="flex items-center space-x-3 text-white/60 hover:text-brand-yellow transition-colors text-sm font-medium">
                    <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px]">●</span>
                    <span>{social.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Column 4: Links 2 & 3 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-6">2kTunes</h3>
            <ul className="space-y-4">
              {[
                { label: t('nav.about'), href: "#" },
                { label: t('nav.pricing'), href: "#" },
                { label: "Newsroom", href: "#" },
                { label: t('footer.link_work'), href: "#" },
                { label: t('footer.link_cookies'), href: "#" }
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/60 hover:text-white transition-colors text-sm">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-6">{t('footer.legal_title')}</h3>
            <ul className="space-y-4">
              {[
                { label: t('footer.link_sub_tnc'), href: "#" },
                { label: t('footer.link_gen_tnc'), href: "#" },
                { label: t('footer.link_privacy'), href: "#" }
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/60 hover:text-white transition-colors text-sm">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-white/20 text-[10px] font-medium uppercase tracking-widest">
          © 2kTunes {currentYear}. {t('footer.rights')}
        </p>
        <p className="text-brand-yellow/30 text-[9px] font-bold uppercase tracking-wider">
          {t('footer.built_by')}
        </p>
      </div>
    </footer>
  );
}
