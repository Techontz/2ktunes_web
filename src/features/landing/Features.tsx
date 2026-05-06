import { motion } from "motion/react";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";

export default function Features() {
  const { t } = useLanguage();
  const checkItems = [
    t('features.item1'),
    t('features.item2'),
    t('features.item3'),
    t('features.item4'),
    t('features.item5')
  ];

  return (
    <section className="relative w-full overflow-hidden py-48 md:py-72 bg-brand-primary z-10 -mt-32 md:-mt-48">
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
      
      <div 
        className="absolute top-0 left-0 w-full h-[15vw] bg-brand-black z-10"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />

      <div 
        className="absolute bottom-0 left-0 w-full h-[15vw] bg-brand-black z-10"
        style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}
      />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="order-2 lg:order-1"
        >
          <div className="relative w-full aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=2070&auto=format&fit=crop" 
              alt="Artist & Label Services" 
              className="w-full h-full object-cover grayscale transition-transform duration-1000 hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-white flex flex-col items-start order-1 lg:order-2"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-extrabold tracking-tighter uppercase leading-[0.9] mb-6 italic text-brand-black">
            {t('features.title_1')} <br /> {t('features.title_2')} <br /> <span className="text-white drop-shadow-lg">{t('features.title_3')}</span>
          </h2>
          
          <p className="text-base md:text-lg font-bold mb-8 text-brand-black/80 max-w-lg leading-snug">
            {t('features.desc')}
          </p>

          <div className="grid grid-cols-1 gap-3 mb-10 w-full">
            {checkItems.map((text, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex gap-3 items-center group"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-brand-black rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-brand-primary stroke-[3px]" />
                </div>
                <span className="font-bold text-sm md:text-base text-brand-black uppercase tracking-tight">{text}</span>
              </motion.div>
            ))}
          </div>

          <Button variant="yellow" size="lg">
            {t('nav.about')}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
