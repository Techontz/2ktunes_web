import React, { useState } from "react";
import {
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
  Smartphone,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsTabProps {
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  onManageSubscription?: () => void;
}

type TabType =
  | "Profile"
  | "Security"
  | "Notifications"
  | "Payments"
  | "Verification"
  | "Language";

export default function SettingsTab({
  onLogout,
  onDeleteAccount,
  onManageSubscription,
}: SettingsTabProps) {
  const [activeTab, setActiveTab] = useState<TabType | null>(null);

  const menuItems = [
    {
      id: "Profile" as TabType,
      label: "Profile",
      icon: User,
      desc: "Personal info and artist handle",
    },
    {
      id: "Security" as TabType,
      label: "Security",
      icon: Lock,
      desc: "Passwords and 2FA",
    },
    {
      id: "Notifications" as TabType,
      label: "Notifications",
      icon: Bell,
      desc: "Email and push alerts",
    },
    {
      id: "Payments" as TabType,
      label: "Payments",
      icon: CreditCard,
      desc: "Payout methods and history",
    },
    {
      id: "Verification" as TabType,
      label: "Verification",
      icon: ShieldCheck,
      desc: "Identity and brand protection",
    },
    {
      id: "Language" as TabType,
      label: "Language",
      icon: Globe,
      desc: "App display language",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6 lg:space-y-8"
          >
            {/* TOP */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab(null)}
                className="w-10 h-10 rounded-[4px] bg-[#1A1A1A] border border-white/[0.05] flex items-center justify-center hover:border-[#F5F500]/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-white/70" />
              </button>

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">
                  Settings
                </p>

                <h2 className="text-[24px] sm:text-[30px] font-bold">
                  Profile Settings
                </h2>
              </div>
            </div>

            {/* CARD */}
            <div className="bg-[#1A1A1A] border border-white/[0.05] rounded-[4px] overflow-hidden">

              {/* PROFILE */}
              <div className="p-5 sm:p-8 lg:p-10 border-b border-white/[0.05]">

                <div className="flex flex-col lg:flex-row lg:items-center gap-8">

                  <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">

                    {/* AVATAR */}
                    <div className="relative group">

                      <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full bg-[#F5F500] flex items-center justify-center text-black text-[28px] sm:text-[34px] font-bold">
                        DM
                      </div>

                      <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-black border border-white/[0.08] flex items-center justify-center hover:border-[#F5F500]/30 transition-all">
                        <Plus className="w-4 h-4 text-[#F5F500]" />
                      </button>
                    </div>

                    {/* INFO */}
                    <div className="text-center sm:text-left min-w-0">

                      <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start mb-3">

                        <span className="px-3 h-[26px] bg-[#F5F500]/10 border border-[#F5F500]/15 rounded-[3px] flex items-center text-[#F5F500] text-[10px] uppercase tracking-[0.15em]">
                          Verified Artist
                        </span>

                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle2 className="w-4 h-4" />

                          <span className="text-[11px] uppercase tracking-[0.15em]">
                            Active
                          </span>
                        </div>
                      </div>

                      <h3 className="text-[26px] sm:text-[32px] font-bold break-words">
                        DOBI MUSIC
                      </h3>

                      <p className="text-sm text-white/35 mt-2 break-all">
                        plusdobi@gmail.com
                      </p>

                      <button className="mt-5 h-[42px] px-5 bg-[#F5F500] hover:bg-white text-black rounded-[3px] transition-all text-sm font-medium active:scale-[0.98]">
                        Update Avatar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* FORM */}
              <div className="p-5 sm:p-8 lg:p-10">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">
                      Artist Name
                    </label>

                    <input
                      type="text"
                      defaultValue="DOBI MUSIC"
                      className="w-full h-[52px] bg-[#161616] border border-white/[0.05] rounded-[3px] px-4 text-sm text-white focus:outline-none focus:border-[#F5F500]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">
                      Label
                    </label>

                    <input
                      type="text"
                      placeholder="Independent"
                      className="w-full h-[52px] bg-[#161616] border border-white/[0.05] rounded-[3px] px-4 text-sm text-white focus:outline-none focus:border-[#F5F500]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">
                      Email Address
                    </label>

                    <input
                      type="email"
                      defaultValue="plusdobi@gmail.com"
                      className="w-full h-[52px] bg-[#161616] border border-white/[0.05] rounded-[3px] px-4 text-sm text-white focus:outline-none focus:border-[#F5F500]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">
                      Country
                    </label>

                    <div className="h-[52px] bg-[#161616] border border-white/[0.05] rounded-[3px] px-4 flex items-center justify-between">
                      <span className="text-sm text-white">
                        Tanzania
                      </span>

                      <Globe className="w-4 h-4 text-[#F5F500]" />
                    </div>
                  </div>
                </div>

                <button className="mt-8 h-[48px] px-8 bg-[#F5F500] hover:bg-white text-black rounded-[3px] transition-all text-sm font-medium active:scale-[0.98]">
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        );

      case "Security":
        return (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            {/* HEADER */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab(null)}
                className="w-10 h-10 rounded-[4px] bg-[#1A1A1A] border border-white/[0.05] flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-white/70" />
              </button>

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">
                  Security
                </p>

                <h2 className="text-[24px] sm:text-[30px] font-bold">
                  Account Protection
                </h2>
              </div>
            </div>

            {/* CARD */}
            <div className="bg-[#1A1A1A] border border-white/[0.05] rounded-[4px] p-5 sm:p-8 lg:p-10">

              <div className="space-y-6">

                {/* PASSWORD */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">
                      Current Password
                    </label>

                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-[52px] bg-[#161616] border border-white/[0.05] rounded-[3px] px-4 pr-12 text-sm text-white focus:outline-none focus:border-[#F5F500]/20 transition-all"
                      />

                      <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">
                      New Password
                    </label>

                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-[52px] bg-[#161616] border border-white/[0.05] rounded-[3px] px-4 pr-12 text-sm text-white focus:outline-none focus:border-[#F5F500]/20 transition-all"
                      />

                      <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    </div>
                  </div>
                </div>

                {/* 2FA */}
                <div className="bg-[#161616] border border-white/[0.05] rounded-[4px] p-5">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-[3px] bg-[#F5F500]/10 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-5 h-5 text-[#F5F500]" />
                      </div>

                      <div>
                        <h3 className="text-[16px] font-semibold">
                          Two-Factor Authentication
                        </h3>

                        <p className="text-sm text-white/35 mt-2 leading-relaxed">
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                    </div>

                    <button className="h-[42px] px-5 bg-[#F5F500] hover:bg-white text-black rounded-[3px] transition-all text-sm font-medium whitespace-nowrap">
                      Enable
                    </button>
                  </div>
                </div>

                <button className="h-[48px] px-8 bg-[#F5F500] hover:bg-white text-black rounded-[3px] transition-all text-sm font-medium active:scale-[0.98]">
                  Update Security
                </button>
              </div>
            </div>
          </motion.div>
        );

      case "Notifications":
        return (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab(null)}
                className="w-10 h-10 rounded-[4px] bg-[#1A1A1A] border border-white/[0.05] flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-white/70" />
              </button>

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">
                  Notifications
                </p>

                <h2 className="text-[24px] sm:text-[30px] font-bold">
                  Preferences
                </h2>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-white/[0.05] rounded-[4px] p-5 sm:p-8 lg:p-10">

              <div className="space-y-4">

                {[
                  {
                    title: "Email Notifications",
                    desc: "Receive reports and catalog updates.",
                    enabled: true,
                  },
                  {
                    title: "Push Alerts",
                    desc: "Get real-time artist notifications.",
                    enabled: true,
                  },
                  {
                    title: "Marketing Updates",
                    desc: "Stay updated with new features.",
                    enabled: false,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-[#161616] border border-white/[0.05] rounded-[4px] p-5"
                  >
                    <div className="flex items-center justify-between gap-5">

                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold break-words">
                          {item.title}
                        </h3>

                        <p className="text-sm text-white/35 mt-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      <div
                        className={`
                          w-[52px]
                          h-[28px]
                          rounded-full
                          p-1
                          transition-all
                          flex
                          items-center
                          ${
                            item.enabled
                              ? "bg-[#F5F500] justify-end"
                              : "bg-white/10 justify-start"
                          }
                        `}
                      >
                        <div className="w-5 h-5 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white overflow-x-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">

        <AnimatePresence mode="wait">

          {!activeTab ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >

              {/* HEADER */}
              <div>

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-11 h-11 rounded-[4px] bg-[#F5F500] flex items-center justify-center">
                    <Settings className="w-5 h-5 text-black" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                      2kTunes
                    </p>

                    <h1 className="text-[30px] sm:text-[42px] font-bold leading-none">
                      Settings
                    </h1>
                  </div>
                </div>

                <p className="text-white/40 max-w-2xl text-sm leading-relaxed">
                  Manage your account, artist identity, payments, security and platform preferences.
                </p>
              </div>

              {/* PREMIUM */}
              <div className="bg-gradient-to-r from-[#F5F500]/10 via-[#F5F500]/5 to-transparent border border-[#F5F500]/10 rounded-[4px] overflow-hidden">

                <div className="p-5 sm:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

                    <div className="w-14 h-14 rounded-[4px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-[#F5F500]" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">

                        <span className="text-[10px] uppercase tracking-[0.25em] text-[#F5F500]">
                          Active Plan
                        </span>

                        <span className="px-3 h-[24px] rounded-full bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center text-[#F5F500] text-[10px] uppercase tracking-[0.15em]">
                          Premium
                        </span>
                      </div>

                      <h2 className="text-[24px] sm:text-[32px] font-bold">
                        2kTunes Premium
                      </h2>

                      <p className="text-sm text-white/35 mt-2">
                        Unlimited releases • Priority support • Faster payouts
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onManageSubscription}
                    className="h-[48px] px-7 bg-[#F5F500] hover:bg-white text-black rounded-[3px] transition-all text-sm font-medium whitespace-nowrap active:scale-[0.98]"
                  >
                    Manage Plan
                  </button>
                </div>
              </div>

              {/* MENU GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="bg-[#1A1A1A] border border-white/[0.05] rounded-[4px] p-5 sm:p-6 hover:border-[#F5F500]/15 transition-all text-left group"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-start gap-4 min-w-0">

                        <div className="w-12 h-12 rounded-[3px] bg-[#161616] border border-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover:border-[#F5F500]/15 transition-all">
                          <item.icon className="w-5 h-5 text-[#F5F500]" />
                        </div>

                        <div className="min-w-0">

                          <h3 className="text-[18px] font-semibold break-words">
                            {item.label}
                          </h3>

                          <p className="text-sm text-white/35 mt-2 leading-relaxed break-words">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#F5F500] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>

              {/* DANGER ZONE */}
              <div className="pt-3">

                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 h-[1px] bg-white/[0.05]" />

                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/20">
                    Danger Zone
                  </span>

                  <div className="flex-1 h-[1px] bg-white/[0.05]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                  {/* LOGOUT */}
                  <button
                    onClick={onLogout}
                    className="bg-[#1A1A1A] border border-white/[0.05] rounded-[4px] p-5 sm:p-6 hover:border-[#F5F500]/15 transition-all text-left group"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">
                        <h3 className="text-[18px] font-semibold">
                          Logout Session
                        </h3>

                        <p className="text-sm text-white/35 mt-2 leading-relaxed">
                          End your current login session safely.
                        </p>
                      </div>

                      <LogOut className="w-5 h-5 text-white/20 group-hover:text-[#F5F500] transition-all flex-shrink-0" />
                    </div>
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={onDeleteAccount}
                    className="bg-red-500/[0.03] border border-red-500/10 rounded-[4px] p-5 sm:p-6 hover:border-red-500/25 transition-all text-left group"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">
                        <h3 className="text-[18px] font-semibold text-red-400">
                          Delete Account
                        </h3>

                        <p className="text-sm text-white/35 mt-2 leading-relaxed">
                          Permanently remove your account and data.
                        </p>
                      </div>

                      <Trash2 className="w-5 h-5 text-red-400/40 group-hover:text-red-400 transition-all flex-shrink-0" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div>
              {renderContent()}

              {/* VERIFICATION CARD */}
              {(activeTab === "Profile" ||
                activeTab === "Verification") && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="bg-[#1A1A1A] border border-white/[0.05] rounded-[4px] p-5 sm:p-8 overflow-hidden relative">

                    <div className="absolute right-[-100px] top-[-100px] w-[220px] h-[220px] rounded-full bg-[#F5F500]/5 blur-3xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                      <div className="flex items-start gap-5">

                        <div className="w-14 h-14 rounded-[4px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-7 h-7 text-[#F5F500]" />
                        </div>

                        <div>
                          <h3 className="text-[22px] font-bold">
                            Identity Verification
                          </h3>

                          <p className="text-sm text-white/35 mt-3 leading-relaxed max-w-2xl">
                            Verify your identity to unlock higher payout limits
                            and secure your music catalog globally.
                          </p>
                        </div>
                      </div>

                      <button className="h-[48px] px-7 border border-[#F5F500]/20 text-[#F5F500] hover:bg-[#F5F500] hover:text-black rounded-[3px] transition-all text-sm font-medium whitespace-nowrap">
                        Start Verification
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
