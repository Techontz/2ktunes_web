'use client';

import { motion } from "motion/react";
import { Check, SmartphoneNfc, CreditCard, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";

export default function DistributionSection() {
  const { t } = useLanguage();
  const items = [
    { title: t('dist.feature1_title'), desc: t('dist.feature1_desc') },
    { title: t('dist.feature2_title'), desc: t('dist.feature2_desc') },
    { title: t('dist.feature3_title'), desc: t('dist.feature3_desc') },
    { title: t('dist.feature4_title'), desc: t('dist.feature4_desc') },
    { title: t('dist.feature5_title'), desc: t('dist.feature5_desc') },
  ];

  const payoutMethods = [
    { name: t('payout.mobile_money'), icon: <SmartphoneNfc className="w-5 h-5" />, desc: t('payout.mobile_money_desc') },
    { name: t('payout.visa'), icon: <CreditCard className="w-5 h-5" />, desc: t('payout.visa_desc') },
    { name: t('payout.paypal'), icon: <Wallet className="w-5 h-5" />, desc: t('payout.paypal_desc') },
  ];

  return (
    <div id="distribution" className="bg-brand-black px-4 md:px-8 scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-48 md:pb-64 px-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative order-1 lg:order-2 px-4 lg:px-0"
        >
          <div className="absolute -inset-4 bg-brand-primary/20 blur-3xl rounded-full animate-pulse"></div>
          <img 
            src="https://picsum.photos/seed/2ktunes-dashboard/1000/1000?grayscale" 
            alt="2kTunes App Interface" 
            className="relative z-10 w-full h-auto max-w-[500px] lg:max-w-none mx-auto object-cover rounded-2xl shadow-2xl border border-white/10 aspect-square lg:aspect-auto"
            referrerPolicy="no-referrer"
          />
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-48 h-80 bg-brand-black border-2 border-brand-primary/50 rounded-xl z-20 shadow-2xl p-4 hidden xl:block"
          >
            <div className="w-full h-2 bg-brand-primary mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="flex gap-2">
                   <div className="w-8 h-8 bg-white/5 rounded-sm"></div>
                   <div className="flex-1 space-y-1">
                      <div className="w-full h-2 bg-white/10 rounded-sm"></div>
                      <div className="w-1/2 h-2 bg-white/5 rounded-sm"></div>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6 order-2 lg:order-1"
        >
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-display font-extrabold text-white leading-tight uppercase italic tracking-tighter">
              {t('dist.title_1')} <span className="text-brand-primary">{t('dist.title_2')}</span> {t('dist.title_3')}
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed max-w-xl">
              {t('dist.desc')}
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex gap-4 items-start group"
              >
                <div className="mt-1 p-1 bg-brand-primary/20 rounded-full group-hover:bg-brand-primary transition-colors">
                  <Check className="w-3 h-3 text-brand-primary group-hover:text-white transition-colors" />
                </div>
                <p className="text-xs md:text-sm text-gray-300">
                  <strong className="text-white font-bold">{item.title}</strong> — {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
              {t('dist.payout_methods')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {payoutMethods.map((pm, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i + 0.5 }}
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-brand-primary/50 transition-all group"
                >
                  <div className="text-white opacity-40 group-hover:opacity-100 group-hover:text-brand-primary transition-all">
                    {pm.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase leading-none">{pm.name}</span>
                    <span className="text-[8px] text-white/40 font-bold uppercase tracking-tighter mt-1">{pm.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Button variant="primary" size="lg" className="self-start mt-6">
            {t('dist.btn')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
