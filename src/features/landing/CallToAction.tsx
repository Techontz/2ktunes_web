'use client';

import { motion } from "motion/react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";

export default function CallToAction() {
  const { t } = useLanguage();

  return (
    <section id="cta" className="relative w-full bg-brand-grey pt-16 pb-12 md:pt-24 md:pb-16 flex flex-col items-center justify-center text-center px-6 overflow-hidden scroll-mt-20">
      <div 
        className="absolute -top-1 left-0 w-full h-[15vw] bg-brand-grey z-0"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)', transform: 'translateY(-99%)' }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-display font-extrabold text-white tracking-tight uppercase leading-none mb-8 italic">
            {t('cta.title_1')} <br className="hidden md:block" /> <span className="text-brand-primary">{t('cta.title_2')}</span>
          </h2>
          
          <div className="max-w-md md:max-w-xl mb-12">
            <p className="text-white/40 font-bold text-xs md:text-sm uppercase tracking-[0.2em] leading-relaxed">
              {t('cta.subtitle') || "Join thousands of artists who trust 2kTunes to power their independent music career."}
            </p>
          </div>

          <Link href="/auth">
            <Button variant="yellow" size="xl">
              {t('cta.btn')}
            </Button>
          </Link>
        </motion.div>
      </div>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05)_0%,transparent_70%)] pointer-events-none" />
    </section>
  );
}
