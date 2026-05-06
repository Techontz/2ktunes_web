import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/lib/LanguageContext";

function FAQItem({ question, answer, ...props }: { question: string; answer: string; [key: string]: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card variant="dark" padding="none" className="overflow-hidden" {...props}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors group cursor-pointer"
      >
        <span className="font-display font-bold text-lg md:text-xl text-white group-hover:text-brand-yellow transition-colors">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="w-5 h-5 text-white/40" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6 pt-0 text-white/50 text-sm md:text-base leading-relaxed border-t border-white/5">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function FAQSection() {
  const { t } = useLanguage();

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  return (
    <section id="faq" className="relative w-full bg-brand-black pt-24 pb-40 md:pt-32 md:pb-56 z-20 scroll-mt-20 overflow-hidden">
      <div 
        className="absolute -top-1 left-0 w-full h-[15vw] bg-brand-black z-0"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)', transform: 'translateY(-99%)' }}
      />

      <div 
        className="absolute bottom-0 left-0 w-full h-[15vw] bg-brand-grey z-10"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}
      />

      <div className="max-w-3xl mx-auto px-6 relative z-20">
        <div className="text-center mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-extrabold text-white uppercase italic tracking-tighter mb-4">
            {t('faq.title_1')} <span className="text-brand-yellow">{t('faq.title_2')}</span>
          </h2>
          <div className="w-16 h-1 bg-brand-yellow mx-auto" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
