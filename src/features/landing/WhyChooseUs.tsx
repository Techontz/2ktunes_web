import { motion } from "motion/react";
import { SmartphoneNfc, CreditCard, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/lib/LanguageContext";

export default function WhyChooseUs() {
  const { t } = useLanguage();
  const whyItems = [
    { title: t('why.feature2_title'), desc: t('why.feature2_desc') },
    { title: t('why.feature4_title'), desc: t('why.feature4_desc') },
    { title: t('why.feature3_title'), desc: t('why.feature3_desc') },
    { title: t('why.feature1_title'), desc: t('why.feature1_desc') }
  ];

  const newsItems = [
    { 
      category: t('news.category_product'), 
      date: "2026-03-24", 
      title: "2kTunes opens up music video distribution to Spotify and Vevo for DIY artists", 
      img: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070" 
    },
    { 
      category: t('news.category_artist'), 
      date: "2025-08-14", 
      title: "Deki Alem's Forget in Mass Release Hits New Milestones with Global Support from ...", 
      img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070" 
    },
    { 
      category: t('news.category_product'), 
      date: "2025-08-26", 
      title: "2kTunes Unveils Notable Product Updates, Including Auto-Save Links and Trolley-Pow...", 
      img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070" 
    }
  ];

  return (
    <>
      <section id="news" className="relative w-full bg-brand-grey pt-24 pb-32 md:pt-32 md:pb-48 z-30 overflow-hidden scroll-mt-20">
        <div 
          className="absolute -top-1 left-0 w-full h-[15vw] bg-brand-grey z-0"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)', transform: 'translateY(-99%)' }}
        />

        <div 
          className="absolute bottom-0 left-0 w-full h-[15vw] bg-brand-black z-10"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-12 md:mb-20"
          >
            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-brand-yellow uppercase tracking-tighter leading-none text-center italic">
              {t('news.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {newsItems.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col group cursor-pointer"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-6 border border-white/5 transition-transform duration-500 group-hover:scale-[1.02]">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-brand-yellow font-bold text-xs uppercase tracking-wider">{item.category}</span>
                  <span className="text-white/30 font-bold text-xs">{item.date}</span>
                </div>
                <h3 className="text-white font-display font-bold text-xl md:text-2xl leading-tight group-hover:text-brand-yellow transition-colors line-clamp-3">
                  {item.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="relative w-full bg-brand-black pt-24 pb-32 md:pt-32 md:pb-48 z-20 scroll-mt-20 overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 w-full h-[15vw] bg-brand-grey z-10"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}
        />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-extrabold text-white uppercase italic tracking-tighter mb-4">
              {t('why.title_1')} <span className="text-brand-primary">{t('why.title_2')}</span>
            </h2>
            <div className="w-20 h-1 bg-brand-primary mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyItems.map((item, i) => (
              <Card
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                variant="outline"
                className="group"
              >
                <h3 className="font-display font-bold text-lg md:text-xl text-white group-hover:text-brand-primary transition-colors mb-4">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{item.desc}</p>
                {item.title === t('why.feature1_title') && (
                  <div className="flex gap-4 mt-auto pt-4 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <SmartphoneNfc className="w-5 h-5 text-white" />
                    <CreditCard className="w-5 h-5 text-white" />
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
