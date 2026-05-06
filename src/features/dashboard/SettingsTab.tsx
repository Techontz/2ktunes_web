import React, { useState } from "react";
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  CreditCard, 
  ShieldCheck,
  ChevronRight,
  Globe,
  Plus,
  LogOut,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Card from "@/components/ui/Card";
import { motion, AnimatePresence } from "motion/react";

interface SettingsTabProps {
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  onManageSubscription?: () => void;
}

type TabType = 'Profile' | 'Security' | 'Notifications' | 'Payments' | 'Verification' | 'Language';

export default function SettingsTab({ onLogout, onDeleteAccount, onManageSubscription }: SettingsTabProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType | null>(null);

  const menuItems = [
    { id: 'Profile' as TabType, label: 'Profile', icon: User, desc: 'Personal info and artist handle' },
    { id: 'Security' as TabType, label: 'Security', icon: Lock, desc: 'Passwords and 2FA' },
    { id: 'Notifications' as TabType, label: 'Notifications', icon: Bell, desc: 'Email and push alerts' },
    { id: 'Payments' as TabType, label: 'Payments', icon: CreditCard, desc: 'Payout methods and history' },
    { id: 'Verification' as TabType, label: 'Verification', icon: ShieldCheck, desc: 'Identity and brand protection' },
    { id: 'Language' as TabType, label: 'Language', icon: Globe, desc: 'App display language' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setActiveTab(null)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <h3 className="text-2xl font-display font-medium text-white tracking-tight">Profile Settings</h3>
            </div>

            <Card variant="outline" className="p-8 lg:p-12 border-white/10 bg-brand-black space-y-12 backdrop-blur-3xl">
              <div className="flex flex-col sm:flex-row items-center gap-8 border-b border-white/5 pb-12">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-brand-primary to-indigo-600 flex items-center justify-center font-display font-medium text-4xl text-white border-8 border-white/5 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Plus className="w-8 h-8 text-white" />
                    </div>
                    DM
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl lg:text-3xl font-display font-medium text-white tracking-tight italic">DOBI MUSIC</h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2 italic">plusdobi@gmail.com</p>
                    <button className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary hover:text-white mt-5 transition-colors block mx-auto sm:mx-0">Update Avatar</button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em] ml-1">Artist Identity</label>
                    <input type="text" defaultValue="DOBI MUSIC" className="w-full bg-white/[0.02] border border-white/5 rounded-[2px] px-6 py-5 text-[11px] font-black text-white focus:outline-none focus:border-brand-primary transition-colors uppercase tracking-widest placeholder:text-white/10 shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em] ml-1">Label Association</label>
                    <input type="text" placeholder="Independent" className="w-full bg-white/[0.02] border border-white/5 rounded-[2px] px-6 py-5 text-[11px] font-black text-white focus:outline-none focus:border-brand-primary transition-colors uppercase tracking-widest placeholder:text-white/10 shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em] ml-1">Communication Channel</label>
                    <input type="email" defaultValue="plusdobi@gmail.com" className="w-full bg-white/[0.02] border border-white/5 rounded-[2px] px-6 py-5 text-[11px] font-black text-white focus:outline-none focus:border-brand-primary transition-colors tracking-widest placeholder:text-white/10 shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em] ml-1">HQ Distribution</label>
                    <div className="w-full bg-white/[0.02] border border-white/5 rounded-[2px] px-6 py-5 text-[11px] font-black text-white flex items-center justify-between cursor-not-allowed shadow-inner opacity-50">
                        <span className="tracking-widest uppercase">Tanzania</span>
                        <Globe className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
              </div>

              <div className="pt-6">
                  <button className="bg-brand-primary text-white px-12 py-5 rounded-[2px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-yellow hover:text-black transition-all shadow-2xl active:scale-95">
                    Save Profile
                  </button>
              </div>
            </Card>
          </motion.div>
        );

      case 'Security':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setActiveTab(null)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <h3 className="text-2xl font-display font-medium text-white tracking-tight">Security Credentials</h3>
            </div>

            <Card variant="outline" className="p-8 lg:p-12 border-white/10 bg-brand-black space-y-12 backdrop-blur-3xl">
              <div>
                <h3 className="text-xl font-display font-medium text-white mb-8 tracking-tight">Access Control</h3>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">Change Password</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <input type="password" placeholder="Current Password" className="w-full bg-white/[0.02] border border-white/5 rounded-[2px] px-6 py-5 text-[11px] font-black text-white focus:outline-none focus:border-brand-primary transition-colors" />
                        <Eye className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 cursor-pointer" />
                      </div>
                      <div className="relative">
                        <input type="password" placeholder="New Password" className="w-full bg-white/[0.02] border border-white/5 rounded-[2px] px-6 py-5 text-[11px] font-black text-white focus:outline-none focus:border-brand-primary transition-colors" />
                        <Eye className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[4px] flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-brand-primary/10 text-brand-primary rounded-[2px]">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white mb-1">Two-Factor Authentication</p>
                        <p className="text-[9px] text-white/30 italic">Secure your account with an additional layer of safety.</p>
                      </div>
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest text-brand-primary hover:text-white transition-all">Enable</button>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                  <button className="bg-brand-primary text-white px-12 py-5 rounded-[2px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-yellow hover:text-black transition-all shadow-2xl active:scale-95">
                    Update Security
                  </button>
              </div>
            </Card>
          </motion.div>
        );
      case 'Notifications':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setActiveTab(null)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <h3 className="text-2xl font-display font-medium text-white tracking-tight">Notification Center</h3>
            </div>

            <Card variant="outline" className="p-8 lg:p-12 border-white/10 bg-brand-black space-y-8 backdrop-blur-3xl">
              <h3 className="text-xl font-display font-medium text-white mb-4 tracking-tight">Preference Management</h3>
              <div className="space-y-4">
                {[
                  { title: 'Email Notifications', desc: 'Receive catalog updates and financial reports.', enabled: true },
                  { title: 'Push Alerts', desc: 'Get instant notifications for streams and new follows.', enabled: true },
                  { title: 'Marketing News', desc: 'Stay updated on new features and global opportunities.', enabled: false },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white/[0.01] border border-white/5 rounded-[4px] group">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-white mb-1">{notif.title}</p>
                      <p className="text-[9px] text-white/30 italic">{notif.desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${notif.enabled ? 'bg-brand-primary' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-all ${notif.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        );
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center p-20 text-center min-h-[400px]"
          >
            <div className="flex items-center gap-4 mb-12 self-start">
               <button onClick={() => setActiveTab(null)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                 <ArrowLeft className="w-5 h-5" />
               </button>
            </div>
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-display font-medium text-white mb-2">Section Under Construction</h3>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">We are refining this configuration panel.</p>
          </motion.div>
        );
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12 p-6 lg:p-12 max-w-6xl mx-auto min-h-screen">
      <AnimatePresence mode="wait">
        {!activeTab ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-3xl lg:text-5xl font-display font-medium text-white tracking-tight leading-none mb-4">
                Global <span className="text-brand-primary">Settings</span>
              </h2>
              <p className="text-white/30 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] italic">Tailor your distribution experience and security profile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
              {/* SUBSCRIPTION STICKER */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="md:col-span-2 p-1 bg-gradient-to-r from-brand-primary/20 via-indigo-500/20 to-brand-primary/20 rounded-[4px] relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute inset-0 bg-brand-black/90 backdrop-blur-3xl z-0"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 gap-6">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-brand-primary/10 text-brand-primary rounded-[2px] border border-brand-primary/20 shadow-xl group-hover:scale-110 transition-transform">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Active Plan</span>
                        <div className="px-2 py-0.5 bg-brand-primary/20 text-brand-primary text-[8px] font-black uppercase tracking-widest rounded-full">Pro Member</div>
                      </div>
                      <h4 className="text-2xl font-display font-medium text-white tracking-tight italic uppercase">2kTunes <span className="text-brand-primary">Premium</span></h4>
                      <p className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wider">Unlimited distribution • 0% Commission • Priority Support</p>
                    </div>
                  </div>
                  <button 
                    onClick={onManageSubscription}
                    className="w-full md:w-auto bg-white text-black px-8 py-4 rounded-[2px] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-white transition-all shadow-2xl active:scale-95"
                  >
                    Manage Membership
                  </button>
                </div>
              </motion.div>

              {menuItems.map((item) => (
                <button 
                   key={item.id} 
                   onClick={() => setActiveTab(item.id)}
                   className="flex items-center justify-between py-1.5 sm:py-8 px-4 sm:px-8 bg-[#111111]/40 border border-white/5 rounded-[4px] group hover:bg-white/[0.03] hover:border-brand-primary/20 transition-all text-left backdrop-blur-xl"
                >
                   <div className="flex items-center gap-4 sm:gap-6">
                      <div className="p-2 sm:p-4 bg-white/5 text-white/20 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all rounded-[2px] border border-white/5">
                        <item.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-white">{item.label}</p>
                        <p className="hidden sm:block text-[9px] text-white/30 italic group-hover:text-white/50 transition-colors uppercase tracking-wider">{item.id}</p>
                      </div>
                   </div>
                   <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            {/* DANGER ZONE / ACCOUNT ACTIONS */}
            <div className="pt-8 sm:pt-12 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-4 mb-2 sm:mb-4">
                 <div className="h-[1px] flex-1 bg-white/5"></div>
                 <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Danger Zone</span>
                 <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                 <button 
                    onClick={onLogout}
                    className="flex items-center justify-between py-2 sm:py-8 px-4 sm:px-8 bg-[#1A1A1A] border border-white/5 rounded-[4px] group hover:border-brand-primary/30 transition-all text-left"
                 >
                    <div>
                       <p className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-white group-hover:text-brand-primary transition-colors">Logout Session</p>
                       <p className="hidden sm:block text-[9px] text-white/30 italic">End your active login session on this device.</p>
                    </div>
                    <LogOut className="w-4 h-4 sm:w-6 sm:h-6 text-white/10 group-hover:text-brand-primary transition-colors" />
                 </button>

                 <button 
                    onClick={onDeleteAccount}
                    className="flex items-center justify-between py-2 sm:py-8 px-4 sm:px-8 bg-red-500/[0.02] border border-red-500/10 rounded-[4px] group hover:bg-red-500/5 hover:border-red-500/30 transition-all text-left w-full"
                 >
                    <div>
                       <p className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-red-500">Delete Account</p>
                       <p className="hidden sm:block text-[9px] text-white/30 italic">Permanently remove all your data and catalog.</p>
                    </div>
                    <Trash2 className="w-4 h-4 sm:w-6 sm:h-6 text-red-500/20 group-hover:text-red-500 transition-colors" />
                 </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div key="content">
            {renderContent()}
            
            {/* VERIFICATION CARD - Show only on Profile or Verification */}
            {(activeTab === 'Profile' || activeTab === 'Verification') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Card variant="outline" className="p-8 lg:p-12 border-white/10 border-dashed bg-brand-black relative overflow-hidden group backdrop-blur-3xl">
                   <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-primary/[0.04] rounded-full blur-[100px] pointer-events-none group-hover:bg-brand-primary/[0.08] transition-all"></div>
                   <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                      <div className="p-5 bg-white/5 text-brand-primary rounded-[2px] border border-white/10 shadow-xl group-hover:scale-105 transition-transform">
                         <ShieldCheck className="w-10 h-10" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                         <h4 className="text-xl font-display font-medium text-white tracking-tight">Identity Verification</h4>
                         <p className="text-[11px] font-medium text-white/40 leading-relaxed max-w-lg mt-2 italic text-balance">Verify your identity to unlock higher payout limits and protect your global catalog from unauthorized access.</p>
                      </div>
                      <button className="w-full md:w-auto border-2 border-brand-primary text-brand-primary px-8 py-4 rounded-[2px] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-white transition-all shadow-lg active:scale-95">Start Process</button>
                   </div>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
