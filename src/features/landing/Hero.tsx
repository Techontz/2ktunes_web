import { motion } from "motion/react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  
  return (
    <section className="relative flex-1 flex flex-col overflow-hidden pt-24 md:pt-16 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from),_transparent_80%),_radial-gradient(circle_at_bottom_left,_var(--tw-gradient-to),_transparent_80%)] from-brand-primary/20 via-brand-primary to-indigo-950">
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none z-0" />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-4 md:py-10 min-h-[30vh] md:min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center w-full max-w-7xl"
        >
          <h1 className="font-display font-extrabold text-huge flex flex-col items-center select-none leading-[0.85]">
            <motion.span 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="block text-brand-black"
            >
              {t('hero.drop')}
            </motion.span>
            <motion.span 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="block text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              {t('hero.grow')}
            </motion.span>
            <motion.span 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              className="block text-brand-black"
            >
              {t('hero.earn')}
            </motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-2 md:mt-3 text-sm md:text-2xl font-semibold max-w-2xl mx-auto leading-tight italic opacity-85 px-4 text-white tracking-tight"
          >
            {t('hero.subtitle')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
