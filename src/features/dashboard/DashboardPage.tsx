import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Music,
  BarChart3,
  Wallet,
  Plus,
  Settings,
  LogOut,
  Bell,
  X,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Globe,
  ChevronDown,
  AlertTriangle,
  Menu,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";

import MusicTab from "./MusicTab";
import AnalyticsTab from "./AnalyticsTab";
import RoyaltiesTab from "./RoyaltiesTab";
import SettingsTab from "./SettingsTab";

type Language = "EN" | "FR" | "PT" | "ES" | "SW";

export default function DashboardPage() {
  const { language, setLanguage } = useLanguage();

  const navigate = useNavigate();
  const location = useLocation();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      id: "music",
      label: "Music",
      icon: Music,
      path: "/dashboard/music",
    },
    {
      id: "analytics",
      label: "Insights",
      icon: BarChart3,
      path: "/dashboard/analytics",
    },
    {
      id: "royalties",
      label: "Wallet",
      icon: Wallet,
      path: "/dashboard/royalties",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ];

  const languages: { code: Language; name: string }[] = [
    { code: "EN", name: "English" },
    { code: "FR", name: "Français" },
    { code: "PT", name: "Português" },
    { code: "ES", name: "Español" },
    { code: "SW", name: "Kiswahili" },
  ];

  const currentPath = location.pathname;

  const handleLogout = () => {
    navigate("/auth?mode=login");
  };

  const handleDeleteAccount = () => {
    navigate("/auth?mode=login");
  };

  const activeLang = languages.find((l) => l.code === language);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Free",
      features: [
        "2 Stores",
        "15% Royalties Fee",
        "7 Days Support",
      ],
      current: false,
    },
    {
      id: "pro",
      name: "PRO PLAN",
      price: "$19.99/yr",
      features: [
        "Unlimited Stores",
        "0% Royalties Fee",
        "24h Priority Support",
        "Smart Links",
        "Custom Release Dates",
      ],
      current: true,
      popular: true,
    },
    {
      id: "label",
      name: "Label",
      price: "$45.00/yr",
      features: [
        "Multiple Artists",
        "Analytics Export",
        "Dedicated Manager",
        "Team Access",
      ],
      current: false,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#111111] text-white overflow-x-hidden">

      {/* MODALS */}

      <AnimatePresence>
        {showPlansModal && (
          <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="
                w-full
                max-w-5xl
                bg-[#141414]
                border
                border-white/[0.05]
                rounded-[2px]
                overflow-hidden
                max-h-[92vh]
                flex
                flex-col
              "
            >
              {/* TOP */}
              <div className="p-5 sm:p-7 border-b border-white/[0.05] flex items-center justify-between">

                <div>
                  <h2 className="text-[24px] sm:text-[30px] font-bold">
                    Subscription Plans
                  </h2>

                  <p className="text-white/35 text-sm mt-2">
                    Upgrade your artist experience.
                  </p>
                </div>

                <button
                  onClick={() => setShowPlansModal(false)}
                  className="
                    w-11
                    h-11
                    rounded-[2px]
                    bg-[#1F1F1F]
                    border
                    border-white/[0.05]
                    flex
                    items-center
                    justify-center
                    hover:border-white/[0.08]
                    transition-all
                  "
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              {/* BODY */}
              <div className="overflow-y-auto p-5 sm:p-7">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`
                        relative
                        rounded-[2px]
                        border
                        p-6
                        ${
                          plan.current
                            ? "border-[#F5F500]/20 bg-[#F5F500]/[0.03]"
                            : "border-white/[0.05] bg-[#1A1A1A]"
                        }
                      `}
                    >
                      {plan.popular && (
                        <div className="
                          absolute
                          top-4
                          right-4
                          px-3
                          py-1
                          rounded-[2px]
                          bg-[#F5F500]
                          text-black
                          text-[10px]
                          font-semibold
                        ">
                          Popular
                        </div>
                      )}

                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 mb-4">
                        {plan.name}
                      </p>

                      <h3 className="text-[36px] font-bold mb-8">
                        {plan.price}
                      </h3>

                      <div className="space-y-4 mb-8">
                        {plan.features.map((feature, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#F5F500]" />

                            <span className="text-sm text-white/60">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        className={`
                          h-[46px]
                          w-full
                          rounded-[2px]
                          text-sm
                          font-medium
                          transition-all
                          ${
                            plan.current
                              ? "bg-white/[0.05] text-white/40"
                              : "bg-[#F5F500] hover:bg-white text-black"
                          }
                        `}
                      >
                        {plan.current
                          ? "Current Plan"
                          : `Upgrade`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGOUT */}
      <AnimatePresence>
        {showLogoutDialog && (
          <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="
                w-full
                max-w-md
                bg-[#141414]
                border
                border-white/[0.05]
                rounded-[2px]
                p-7
              "
            >
              <div className="flex flex-col items-center text-center">

                <div className="
                  w-16
                  h-16
                  rounded-[2px]
                  bg-red-500/10
                  border
                  border-red-500/20
                  flex
                  items-center
                  justify-center
                  mb-6
                ">
                  <LogOut className="w-7 h-7 text-red-400" />
                </div>

                <h3 className="text-[28px] font-bold mb-3">
                  Logout?
                </h3>

                <p className="text-white/40 text-sm leading-relaxed mb-8">
                  You’ll need to login again to access your artist dashboard.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full">

                  <button
                    onClick={() => setShowLogoutDialog(false)}
                    className="
                      h-[48px]
                      rounded-[2px]
                      border
                      border-white/[0.06]
                      text-white/60
                      hover:text-white
                    "
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleLogout}
                    className="
                      h-[48px]
                      rounded-[2px]
                      bg-red-500
                      hover:bg-red-400
                      text-white
                    "
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE */}
      <AnimatePresence>
        {showDeleteDialog && (
          <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="
                w-full
                max-w-lg
                bg-[#141414]
                border
                border-red-500/20
                rounded-[2px]
                p-7
              "
            >
              <div className="flex flex-col items-center text-center">

                <div className="
                  w-20
                  h-20
                  rounded-[2px]
                  bg-red-500/10
                  border
                  border-red-500/20
                  flex
                  items-center
                  justify-center
                  mb-7
                ">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                <h3 className="text-[32px] font-bold mb-4">
                  Delete Account?
                </h3>

                <p className="text-white/40 leading-relaxed text-sm mb-8">
                  This action permanently removes your releases, royalties and account history.
                </p>

                <div className="flex flex-col gap-4 w-full">

                  <button
                    onClick={handleDeleteAccount}
                    className="
                      h-[52px]
                      rounded-[2px]
                      bg-red-500
                      hover:bg-red-400
                      text-white
                      text-sm
                      font-medium
                    "
                  >
                    Confirm Delete
                  </button>

                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="
                      h-[52px]
                      rounded-[2px]
                      border
                      border-white/[0.06]
                      text-white/50
                      hover:text-white
                    "
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}

      <aside className="
        hidden
        lg:flex
        flex-col
        w-[260px]
        bg-[#181818]
        border-r
        border-white/[0.05]
        sticky
        top-0
        h-screen
        z-50
      ">

        {/* USER */}
        <div className="p-6 flex items-center gap-4">

          {/* PURPLE AVATAR */}
          <div className="
            w-10
            h-10
            rounded-[2px]
            bg-gradient-to-br
            from-purple-500
            to-violet-700
            border
            border-white/[0.08]
            flex
            items-center
            justify-center
            text-white
            text-[12px]
            font-bold
            shadow-lg
            shadow-purple-500/20
          ">
            DM
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold truncate">
              DOBI MUSIC
            </p>

            <p className="text-[10px] text-white/30 mt-1 truncate">
              Verified Artist
            </p>
          </div>
        </div>

        {/* RELEASE BUTTON */}
        <div className="px-5 mb-8">

          <button className="
            h-[50px]
            w-full
            rounded-[2px]
            bg-[#F5F500]
            hover:bg-white
            text-black
            flex
            items-center
            justify-between
            px-5
            transition-all
          ">
            <div className="flex items-center gap-3">
              <Plus className="w-4 h-4" />

              <span className="text-[11px] font-semibold">
                New Release
              </span>
            </div>

            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 space-y-1">

          {menuItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.id === "music" &&
                currentPath === "/dashboard");

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  h-[52px]
                  px-5
                  rounded-[2px]
                  flex
                  items-center
                  gap-4
                  transition-all
                  ${
                    isActive
                      ? "bg-[#F5F500] text-black"
                      : "text-white/40 hover:bg-white/[0.03] hover:text-white"
                  }
                `}
              >
                <item.icon className="w-4 h-4" />

                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-5 border-t border-white/[0.05] space-y-3">

          {/* PRO */}
          <button
            onClick={() => setShowPlansModal(true)}
            className="
              w-full
              p-4
              rounded-[2px]
              bg-[#F5F500]/5
              border
              border-[#F5F500]/10
              text-left
            "
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#F5F500]" />

              <span className="text-[11px] font-semibold text-[#F5F500]">
                PRO PLAN
              </span>
            </div>

            <p className="text-[11px] text-white/35">
              Unlimited uploads enabled.
            </p>
          </button>

          {/* LANGUAGE */}
          <div className="relative">

            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="
                h-[48px]
                w-full
                rounded-[2px]
                bg-[#1F1F1F]
                border
                border-white/[0.05]
                px-4
                flex
                items-center
                justify-between
              "
            >
              <div className="flex items-center gap-3">

                <Globe className="w-4 h-4 text-[#F5F500]" />

                <span className="text-sm text-white/70">
                  {activeLang?.name}
                </span>
              </div>

              <ChevronDown className="w-4 h-4 text-white/30" />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="
                    absolute
                    bottom-full
                    mb-2
                    left-0
                    right-0
                    bg-[#1A1A1A]
                    border
                    border-white/[0.05]
                    rounded-[2px]
                    overflow-hidden
                  "
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`
                        h-[46px]
                        px-4
                        w-full
                        text-left
                        text-sm
                        transition-all
                        ${
                          language === lang.code
                            ? "bg-[#F5F500] text-black"
                            : "text-white/50 hover:bg-white/[0.03] hover:text-white"
                        }
                      `}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* MOBILE MENU */}

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed
              inset-0
              z-[300]
              lg:hidden
              bg-black/95
              backdrop-blur-xl
            "
          >
            <div className="p-6">

              <div className="flex items-center justify-between mb-10">

                <Link
                  to="/dashboard/music"
                  className="text-[28px] font-black"
                >
                  2k<span className="text-[#F5F500]">Tunes</span>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="
                    w-11
                    h-11
                    rounded-[2px]
                    bg-[#1F1F1F]
                    border
                    border-white/[0.05]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <nav className="space-y-3">

                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                      h-[56px]
                      px-5
                      rounded-[2px]
                      bg-[#1A1A1A]
                      border
                      border-white/[0.05]
                      flex
                      items-center
                      gap-4
                    "
                  >
                    <item.icon className="w-5 h-5 text-[#F5F500]" />

                    <span className="text-white text-sm font-medium">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN */}

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* HEADER */}

        <header className="
          h-[68px]
          px-4
          sm:px-6
          lg:px-10
          border-b
          border-white/[0.04]
          bg-[#181818]
          sticky
          top-0
          z-[150]
          flex
          items-center
          justify-between
        ">

          {/* LEFT */}
          <div className="flex items-center gap-4">

            {/* MOBILE MENU BTN */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="
                lg:hidden
                w-10
                h-10
                rounded-[2px]
                bg-[#1F1F1F]
                border
                border-white/[0.05]
                flex
                items-center
                justify-center
              "
            >
              <Menu className="w-5 h-5 text-white/60" />
            </button>

            <Link
              to="/dashboard/music"
              className="text-[24px] sm:text-[28px] font-black"
            >
              2k<span className="text-[#F5F500]">Tunes</span>
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* NOTIFICATION */}
            <button className="
              relative
              w-10
              h-10
              rounded-[2px]
              bg-[#1F1F1F]
              border
              border-white/[0.05]
              flex
              items-center
              justify-center
            ">
              <div className="
                absolute
                top-[10px]
                right-[10px]
                w-[6px]
                h-[6px]
                rounded-full
                bg-[#F5F500]
              " />

              <Bell className="w-4 h-4 text-white/50" />
            </button>

            {/* PROFILE */}
            <div className="
              h-10
              pl-2
              pr-4
              rounded-[2px]
              bg-[#1F1F1F]
              border
              border-white/[0.05]
              flex
              items-center
              gap-3
            ">

              {/* PURPLE PROFILE */}
              <div className="
                w-8
                h-8
                rounded-[2px]
                bg-gradient-to-br
                from-purple-500
                to-violet-700
                flex
                items-center
                justify-center
                text-white
                text-[11px]
                font-bold
              ">
                DM
              </div>

              <div className="hidden md:flex flex-col leading-none">
                <span className="text-[12px] font-semibold">
                  DOBI MUSIC
                </span>

                <span className="text-[10px] text-white/35 mt-1">
                  Verified Artist
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="flex-1 pb-28 lg:pb-10">

          <Suspense
            fallback={
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="
                  w-12
                  h-12
                  rounded-full
                  border-2
                  border-[#F5F500]/20
                  border-t-[#F5F500]
                  animate-spin
                " />
              </div>
            }
          >
            <Routes>
              <Route index element={<MusicTab />} />

              <Route path="music" element={<MusicTab />} />

              <Route
                path="analytics"
                element={<AnalyticsTab />}
              />

              <Route
                path="royalties"
                element={<RoyaltiesTab />}
              />

              <Route
                path="settings"
                element={
                  <SettingsTab
                    onLogout={() =>
                      setShowLogoutDialog(true)
                    }
                    onDeleteAccount={() =>
                      setShowDeleteDialog(true)
                    }
                    onManageSubscription={() =>
                      setShowPlansModal(true)
                    }
                  />
                }
              />
            </Routes>
          </Suspense>
        </div>

        {/* MOBILE NAV */}

        <nav className="
          lg:hidden
          fixed
          bottom-4
          left-4
          right-4
          z-[200]
          bg-[#1A1A1A]/90
          backdrop-blur-xl
          border
          border-white/[0.05]
          rounded-[2px]
          px-2
          py-2
          flex
          items-center
          justify-around
        ">

          {menuItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.id === "music" &&
                currentPath === "/dashboard");

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  relative
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  py-2
                  px-3
                  rounded-[2px]
                  transition-all
                  ${
                    isActive
                      ? "text-[#F5F500]"
                      : "text-white/25"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNav"
                    className="
                      absolute
                      inset-0
                      rounded-[2px]
                      bg-[#F5F500]/10
                    "
                  />
                )}

                <item.icon className="w-4 h-4 relative z-10" />

                <span className="text-[9px] relative z-10">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}