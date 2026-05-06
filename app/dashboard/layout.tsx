'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Music, 
  BarChart3, 
  Wallet, 
  Plus, 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  X, 
  ChevronRight, 
  Sparkles, 
  Globe, 
  ChevronDown, 
  AlertTriangle 
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { DashboardProvider } from "@/lib/DashboardContext";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type Language = 'EN' | 'FR' | 'PT' | 'ES' | 'SW';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'music', label: 'Music', icon: Music, path: '/dashboard/music' },
    { id: 'overview', label: 'Artist', icon: User, path: '/dashboard/artist' },
    { id: 'analytics', label: 'Insights', icon: BarChart3, path: '/dashboard/analytics' },
    { id: 'royalties', label: 'Wallet', icon: Wallet, path: '/dashboard/royalties' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const languages: { code: Language; name: string }[] = [
    { code: 'EN', name: 'English' },
    { code: 'FR', name: 'Français' },
    { code: 'PT', name: 'Português' },
    { code: 'ES', name: 'Español' },
    { code: 'SW', name: 'Kiswahili' },
  ];

  const handleLogout = () => {
    router.push('/auth?mode=login');
  };

  const handleDeleteAccount = () => {
    console.log("Account deleted");
    router.push('/auth?mode=login');
  };

  const activeLang = languages.find(l => l.code === language);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      features: ['2 Stores', '15% Royalties Fee', '7 Days Support'],
      current: false
    },
    {
      id: 'pro',
      name: 'PRO PLAN',
      price: '$19.99/yr',
      features: ['Unlimited Stores', '0% Royalties Fee', '24h Priority Support', 'Smart Links', 'Custom Release Dates'],
      current: true,
      popular: true
    },
    {
      id: 'label',
      name: 'Label',
      price: '$45.00/yr',
      features: ['Multiple Artists', 'Analytics Export', 'Dedicated Manager', 'Team Access'],
      current: false
    }
  ];

  return (
    <DashboardProvider value={{ setShowPlansModal, setShowLogoutDialog, setShowDeleteDialog }}>
      <div className="flex min-h-screen bg-brand-black text-white font-sans overflow-x-hidden selection:bg-brand-yellow selection:text-black">
      {/* PLANS MODAL */}
      <AnimatePresence>
        {showPlansModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-brand-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#111111] border border-white/10 rounded-2xl max-w-4xl w-full relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#111111] z-20">
                <div>
                  <h3 className="text-2xl font-display font-medium text-white tracking-tight">Artist Subscription Plans</h3>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">Scale your music career with 2kTunes Pro</p>
                </div>
                <button 
                  onClick={() => setShowPlansModal(false)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`relative p-8 rounded-[4px] border transition-all flex flex-col ${
                        plan.current 
                          ? "bg-brand-primary/[0.03] border-brand-primary shadow-[0_0_40px_rgba(124,58,237,0.1)]" 
                          : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-yellow text-black text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                          Most Popular
                        </div>
                      )}
                      <div className="mb-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{plan.name}</h4>
                        <div className="flex items-end gap-1">
                          <span className="text-3xl font-display font-medium italic">{plan.price}</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4 mb-10">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                            <span className="text-[10px] font-medium text-white/60 tracking-wide uppercase">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        disabled={plan.current}
                        className={`w-full py-4 rounded-[2px] font-black text-[9px] uppercase tracking-[0.25em] transition-all ${
                          plan.current 
                            ? "bg-white/10 text-white cursor-default" 
                            : "bg-brand-primary hover:bg-brand-primary/80 text-white shadow-xl shadow-brand-primary/20 active:scale-95"
                        }`}
                      >
                        {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGOUT DIALOG */}
      <AnimatePresence>
        {showLogoutDialog && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-brand-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1A1A1A] border border-white/10 p-8 md:p-10 rounded-2xl max-w-sm w-full relative shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                  <LogOut className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-display font-medium text-white tracking-tight mb-3">Logging out?</h3>
                <p className="text-white/40 text-xs mb-8 leading-relaxed italic">Are you sure you want to end your current session?</p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button onClick={() => setShowLogoutDialog(false)} className="py-4 rounded-[2px] border border-white/10 text-white font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white/5 transition-colors">Cancel</button>
                  <button onClick={handleLogout} className="py-4 rounded-[2px] bg-red-600 text-white font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-500 transition-colors shadow-lg active:scale-95">Logout</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#111111]/40 border-r border-white/5 sticky top-0 h-screen z-50 backdrop-blur-2xl">
        <div className="p-6 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center border border-white/10 text-white font-bold text-xs uppercase">DM</div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.1em] truncate">DOBI MUSIC</span>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.1em] truncate">Verified Artist</span>
          </div>
        </div>
        <div className="px-5 mb-8">
          <button className="w-full bg-brand-yellow hover:bg-white text-black py-4 px-6 rounded-[2px] flex items-center justify-between group transition-all cursor-pointer shadow-xl active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <Plus className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Release</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5">
          <p className="px-8 text-[7px] font-black uppercase tracking-[0.3em] text-white/10 mb-4">Main Menu</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.id === 'music' && pathname === '/dashboard');
            return (
              <Link 
                key={item.id} 
                href={item.path}
                className={`flex items-center gap-4 px-8 py-4 transition-all relative group ${isActive ? "bg-brand-primary/5 text-brand-primary" : "text-white/40 hover:text-white"}`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-primary shadow-[0_0_15px_rgba(124,58,237,0.5)]" />}
                <item.icon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-5 space-y-2 border-t border-white/5">
          <div onClick={() => setShowPlansModal(true)} className="bg-brand-primary/5 p-4 rounded-[4px] border border-brand-primary/20 cursor-pointer hover:bg-brand-primary/10 transition-all mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-primary">PRO Plan</span>
            </div>
            <p className="text-[8px] text-white/30 font-bold uppercase">Unlimited uploads active</p>
          </div>
          <div className="relative">
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center justify-between w-full p-4 rounded-[2px] bg-white/[0.02] border border-white/5 text-white/30 hover:text-white transition-all">
              <div className="flex items-center gap-3">
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{activeLang?.name}</span>
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1A1A] border border-white/10 rounded-[4px] overflow-hidden z-[60]">
                  {languages.map((lang) => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }} className={`w-full text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] border-b border-white/5 last:border-0 ${language === lang.code ? "bg-brand-primary text-white" : "hover:bg-white/5 text-white/40 hover:text-white"}`}>{lang.name}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* HEADER */}
      <main className="flex-1 flex flex-col min-h-screen bg-brand-black overflow-x-hidden relative">
        <header className="h-16 px-6 lg:px-12 flex items-center justify-between border-b border-white/5 sticky top-0 bg-brand-black/80 backdrop-blur-xl z-[150]">
          <Link href="/dashboard" className="text-lg lg:text-2xl font-display font-black italic tracking-tighter text-white">2k<span className="text-brand-primary">Tunes</span></Link>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-3 text-white/30 hover:text-white transition-colors relative"><div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-yellow rounded-full shadow-[0_0_10px_#FFFF00]" /><Bell className="w-4 h-4" /><span className="hidden sm:inline text-[9px] font-black uppercase tracking-[0.25em]">Alerts</span></button>
            <div className="flex items-center gap-3 p-1 pl-4 rounded-full bg-white/5 border border-white/5"><span className="hidden md:inline text-[9px] font-black uppercase tracking-[0.2em] text-white/60">DOBI MUSIC</span><div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center font-bold text-[10px]">DM</div></div>
          </div>
        </header>
        <div className="flex-1 pb-28 lg:pb-12 relative z-10 p-6 lg:p-12">
          {children}
        </div>
      </main>

      {/* DELETE ACCOUNT DIALOG */}
      <AnimatePresence>
        {showDeleteDialog && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-brand-black/95 backdrop-blur-xl">
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#111111] border border-red-500/20 p-8 rounded-2xl max-w-md w-full"><div className="flex flex-col items-center text-center"><AlertTriangle className="w-10 h-10 text-red-500 mb-6" /><h3 className="text-2xl font-display text-white mb-4">Delete Account?</h3><p className="text-white/40 text-sm mb-8">This action is permanent.</p><div className="flex flex-col gap-4 w-full"><button onClick={handleDeleteAccount} className="w-full py-4 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-[2px]">Confirm Deletion</button><button onClick={() => setShowDeleteDialog(false)} className="w-full py-4 border border-white/10 text-white/40 font-black text-xs uppercase tracking-widest rounded-[2px]">Cancel</button></div></div></motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE NAV (Bottom Bar) */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-[#1A1A1A]/80 backdrop-blur-2xl border border-white/10 z-[180] px-4 py-3 rounded-2xl flex justify-around items-center">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.id === 'music' && pathname === '/dashboard');
          return (
            <Link key={item.id} href={item.path} className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${isActive ? "text-brand-yellow" : "text-white/20"}`}>
              <item.icon className="w-4 h-4" />
              <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
    </DashboardProvider>
  );
}
