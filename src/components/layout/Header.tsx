'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Globe, Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

type HeaderProps = {
  navLinks?: { name: string; href: string }[];
  languages?: { code: string; name: string }[];
  minimal?: boolean;
};

export default function Header({ navLinks = [], languages = [] }: HeaderProps) {
  const { language: selectedLang, setLanguage: setSelectedLang, t } = useLanguage();
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY) {
        setShowHeader(false);
        setIsLangOpen(false);
      } else {
        setShowHeader(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen, isSearchOpen]);

  const visibleNavLinks = isAuthPage ? [] : navLinks;

  return (
    <>
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-brand-black/95 z-[100] flex flex-col p-6 md:p-12"
          >
            <div className="flex justify-end p-4">
              <button onClick={() => setIsSearchOpen(false)} className="text-white hover:text-brand-primary p-2">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-4xl relative">
                <input 
                  autoFocus
                  type="text" 
                  placeholder={t('nav.search_placeholder')}
                  className="w-full bg-transparent border-b-2 border-white/20 text-[6vw] sm:text-4xl md:text-7xl font-display font-extrabold text-white pb-2 md:pb-4 focus:outline-none focus:border-brand-primary transition-colors uppercase tracking-tight"
                />
                <Search className="absolute right-0 bottom-4 md:bottom-8 w-6 h-6 md:w-8 md:h-8 text-white/40" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: showHeader ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-brand-black text-white px-4 md:px-8 h-20 flex items-center justify-between fixed top-0 w-full z-50 transition-colors shadow-2xl"
      >
        <div className="flex items-center gap-3 lg:gap-12">
          <Link href="/" className="flex items-center flex-shrink-0 z-[60]">
            <span className="font-display font-bold text-xl sm:text-2xl md:text-3xl tracking-tighter text-white whitespace-nowrap">2kTunes</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase">
            {visibleNavLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="hover:text-white transition-colors whitespace-nowrap relative group py-1"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 lg:gap-8 z-[60]">
          {!isAuthPage && (
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:text-brand-primary transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`${isAuthPage ? 'flex' : 'hidden sm:flex'} items-center gap-1 hover:text-brand-primary transition-colors text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer`}
            >
              <Globe className="w-4 h-4" />
              <span>{selectedLang}</span>
            </button>
            
            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 bg-brand-black border border-white/10 p-2 rounded-sm shadow-2xl min-w-[120px]"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code as any);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors hover:bg-brand-primary/20 ${selectedLang === lang.code ? 'text-brand-primary' : 'text-white'}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isAuthPage && (
            <>
              <Link href="/auth?mode=login" className="hidden lg:flex items-center gap-1 hover:text-brand-primary cursor-pointer active:scale-95 transition-transform">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">{t('nav.signin')}</span>
              </Link>

              <Link href="/auth?mode=signup" className="bg-white text-brand-black px-4 md:px-6 py-2 md:py-2.5 font-bold rounded-sm text-[10px] md:text-xs uppercase tracking-tight hover:bg-brand-primary hover:text-white transition-all whitespace-nowrap shadow-lg active:scale-95 text-center">
                {t('nav.getstarted')}
              </Link>
            </>
          )}


          
          {!isAuthPage && (
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:text-brand-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-brand-black z-40 flex flex-col pt-32 px-8 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-6 md:gap-8 pb-20">
              <div className="flex flex-col gap-4">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-brand-primary font-display font-extrabold text-[8vw] sm:text-4xl md:text-5xl italic tracking-tighter hover:translate-x-2 transition-transform whitespace-nowrap"
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>

              <div className="flex flex-col gap-4 mt-6 border-t border-white/10 pt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{t('nav.services_insights')}</p>
                <div className="flex flex-col gap-5">
                  {[
                    { name: "Affordable Self-serve Distribution", href: "#distribution" },
                    { name: "Artist & Label Services That Work For You", href: "#about" },
                    { name: "Artists We Work With", href: "#showcase" },
                    { name: "From the Newsroom", href: "#news" }
                  ].map((link, i) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.05) }}
                      className="text-white/60 font-bold text-xs sm:text-sm uppercase tracking-wider hover:text-brand-primary transition-colors pr-4 leading-relaxed"
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-4 mt-8"
              >
                <p className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">{t('nav.select_language')}</p>
                <div className="flex flex-wrap gap-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code as any);
                        setIsMenuOpen(false);
                      }}
                      className={`text-lg font-bold tracking-widest uppercase ${selectedLang === lang.code ? 'text-brand-primary' : 'text-white'}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="h-px bg-white/10 my-2"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-4"
              >
                 <Link
                   href="/auth?mode=login"
                   onClick={() => setIsMenuOpen(false)}
                   className="text-white font-bold text-lg sm:text-xl tracking-widest hover:text-brand-primary transition-colors"
                 >
                   {t('nav.signin')}
                 </Link>
                 <Link
                   href="/auth?mode=signup"
                   onClick={() => setIsMenuOpen(false)}
                   className="bg-white text-brand-black text-center py-4 rounded-sm font-black text-lg tracking-widest hover:bg-brand-primary hover:text-white transition-all mt-4"
                 >
                   {t('nav.getstarted')}
                 </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
