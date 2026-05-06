'use client';

import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function QuickAccess() {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-black py-4 md:py-8 px-4 md:px-8 border-t-4 border-white/5">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8 md:mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="group relative border-2 border-white/20 p-4 md:p-8 rounded-none text-white flex items-center justify-between cursor-pointer hover:border-white transition-all transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-white font-display font-extrabold text-lg md:text-2xl italic tracking-tighter uppercase">{t('quick.distribution')}</h2>
            <p className="text-gray-400 text-[10px] md:text-sm font-medium">
              {t('dist.feature1_desc')}
            </p>
          </div>
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:translate-x-2 transition-transform" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="group relative border-2 border-white/20 p-4 md:p-8 rounded-none text-white flex items-center justify-between cursor-pointer hover:border-white transition-all transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-white font-display font-extrabold text-lg md:text-2xl italic tracking-tighter uppercase">{t('quick.services')}</h2>
            <p className="text-gray-400 text-[10px] md:text-sm font-medium">
              {t('quick.services_desc')}
            </p>
          </div>
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:translate-x-2 transition-transform" />
        </motion.div>
      </div>
    </div>
  );
}
