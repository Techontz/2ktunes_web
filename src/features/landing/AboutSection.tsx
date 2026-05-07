import { motion } from "motion/react";
import { Globe, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";

export default function AboutSection() {
  const { t } = useLanguage();
  
  return (
    <>
      <section id="about" className="relative w-full bg-brand-black pt-24 pb-40 md:pt-32 md:pb-56 z-20 scroll-mt-20 overflow-hidden">
        <div 
          className="absolute -top-1 left-0 w-full h-[15vw] bg-brand-black z-0"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)', transform: 'translateY(-99%)' }}
        />

        <div 
          className="absolute bottom-0 left-0 w-full h-[15vw] bg-brand-grey z-10"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}
        />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold text-white uppercase italic tracking-tighter leading-none mb-8">
                {t('about.title_1')} <br /> <span className="text-brand-primary">{t('about.title_2')}</span>
              </h2>
              <div className="space-y-6 text-base md:text-lg text-white/60 leading-relaxed font-medium">
                <p>
                  {t('about.p1')}
                </p>
                <p>
                  {t('about.p2')}
                </p>
                <p className="border-l-4 border-brand-primary pl-6 py-2 italic text-white font-display">
                  "{t('about.quote')}"
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square grayscale border-2 border-white/5 rounded-[5px] overflow-hidden"
            >
              <img 
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop" 
                alt="About 2kTunes" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-primary/20 mix-blend-overlay" />
            </motion.div>
          </div>
        </div>
      </section>

      <section id="contact" className="relative w-full bg-brand-grey pt-24 pb-40 md:pt-32 md:pb-56 z-20 scroll-mt-20 overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 w-full h-[15vw] bg-brand-black z-10"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}
        />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-extrabold text-white uppercase italic tracking-tighter mb-6">
              {t('contact.title_1')} <span className="text-brand-primary">{t('contact.title_2')}</span>
            </h2>
            <p className="text-white/50 text-base md:text-lg mb-10 max-w-md">
              {t('contact.desc')}
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-full group-hover:border-brand-primary transition-colors">
                  <Globe className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">{t('contact.support_label')}</p>
                  <p className="text-white font-display font-bold">{t('contact.support_value')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-full group-hover:border-brand-primary transition-colors">
                  <Check className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">{t('contact.office_label')}</p>
                  <p className="text-white font-display font-bold">{t('contact.office_value')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 bg-white/5 p-8 md:p-12 border border-white/10 rounded-[5px]"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-1">{t('contact.label_name')}</label>
                <input type="text" placeholder={t('contact.placeholder_name')} className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors placeholder:text-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-1">{t('contact.label_email')}</label>
                <input type="email" placeholder={t('contact.placeholder_email')} className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors placeholder:text-white/10" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-1">{t('contact.label_subject') || "Subject"}</label>
              <select className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors appearance-none">
                <option>{t('contact.subject_dist') || "Distribution Inquiry"}</option>
                <option>{t('contact.subject_artist') || "Artist Services"}</option>
                <option>{t('contact.subject_tech') || "Technical Support"}</option>
                <option>{t('contact.subject_other') || "Other"}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-1">{t('contact.label_msg')}</label>
              <textarea rows={4} placeholder={t('contact.placeholder_msg') || "Your message here..."} className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors placeholder:text-white/10 resize-none"></textarea>
            </div>
            <Button variant="primary" className="w-full py-4 shadow-2xl">
              {t('contact.btn')}
            </Button>
          </motion.form>
          </div>
        </div>
      </section>
    </>
  );
}
