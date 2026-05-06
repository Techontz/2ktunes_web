'use client';

import { motion } from "motion/react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";

export default function ArtistShowcase() {
  const { t } = useLanguage();
  const artists = [
    { name: "Hotel Ugly", listeners: `20M+ ${t('showcase.listeners')}`, img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070" },
    { name: "Stela Cole", listeners: `1M+ ${t('showcase.listeners')}`, img: "https://images.unsplash.com/photo-1549213821-4708d624e1d1?q=80&w=2070" },
    { name: "Deki Alem", listeners: `250K+ ${t('showcase.listeners')}`, img: "https://images.unsplash.com/photo-1520127877038-dc6586716104?q=80&w=2070" },
    { name: "Silva Bumpa", listeners: `2M+ ${t('showcase.listeners')}`, img: "https://images.unsplash.com/photo-1514525253344-f81d1c70266f?q=80&w=2070" },
    { name: "Emei", listeners: `2M+ ${t('showcase.listeners')}`, img: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070" },
    { name: "DJEZJA", listeners: `1M+ ${t('showcase.listeners')}`, img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070" },
  ];

  return (
    <section id="showcase" className="relative w-full bg-brand-black pt-16 pb-24 md:pt-32 md:pb-64 z-20 overflow-hidden scroll-mt-20">
      <div 
        className="absolute -top-1 left-0 w-full h-[15vw] bg-brand-black z-0"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)', transform: 'translateY(-99%)' }}
      />

      <div 
        className="absolute bottom-0 left-0 w-full h-[15vw] bg-brand-grey z-10"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mb-12 md:mb-20"
        >
          <h2 className="text-3xl md:text-8xl lg:text-9xl font-display font-extrabold text-brand-yellow uppercase tracking-tighter italic leading-none text-center">
            {t('showcase.title_1')} <br className="md:hidden" /> {t('showcase.title_2')}
          </h2>
          <div className="w-16 h-1.5 md:w-24 md:h-2 bg-brand-yellow mt-4 md:mt-6" />
        </motion.div>

        <div className="relative w-screen -ml-[50vw] left-1/2 overflow-hidden py-6 md:py-10">
          <motion.div 
            className="flex gap-4 md:gap-10 px-8 min-w-max"
            animate={{
              x: [0, -2640],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ width: 'max-content' }}
          >
            {[...Array(3)].flatMap((_, groupIndex) => 
              artists.map((artist, i) => (
                <div 
                  key={`${groupIndex}-${i}`}
                  className="w-[200px] md:w-[400px] flex flex-col group cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden mb-4 md:mb-8 artist-mask bg-white/5 border border-white/5 transition-all duration-700 group-hover:border-brand-yellow/30 group-hover:shadow-[0_0_50px_rgba(255,255,0,0.1)]">
                    <img 
                      src={artist.img} 
                      alt={artist.name} 
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  </div>
                  <div className="px-2">
                    <h3 className="text-white font-display font-extrabold text-xl md:text-4xl uppercase tracking-tighter leading-none mb-1 md:mb-2 group-hover:text-brand-yellow transition-colors">{artist.name}</h3>
                    <p className="text-white/40 font-bold text-[10px] md:text-base uppercase tracking-tight group-hover:text-white/60 transition-colors">{artist.listeners}</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>

        <div className="mt-8 md:mt-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 md:gap-12 border-t border-white/10 pt-12 md:pt-16">
          <div className="max-w-lg">
            <p className="text-white/40 font-bold text-[10px] md:text-sm leading-relaxed uppercase tracking-widest italic max-w-md">
              {t('showcase.desc')}
            </p>
          </div>
          
          <Button variant="yellow" size="lg" className="whitespace-nowrap text-sm md:text-xl px-8 md:px-12 py-3 md:py-5">
            {t('nav.about')}
          </Button>
        </div>
      </div>
    </section>
  );
}
