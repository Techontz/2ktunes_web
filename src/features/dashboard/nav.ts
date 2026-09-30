import {
  BarChart3,
  CreditCard,
  Disc3,
  LayoutDashboard,
  Settings,
  Upload,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * THE DASHBOARD'S INFORMATION ARCHITECTURE
 * ========================================
 *
 * This is not invented. It mirrors the shipped 2K Tunes mobile app
 * (`kTunes_frontend`), whose bottom navigation is:
 *
 *   My Music · Bank · New Release · Stats · Settings
 *
 * The web dashboard keeps those five and adds the two surfaces the mobile app
 * reaches from inside Settings rather than the tab bar — Artists (its own API,
 * with a per-plan limit) and Plan (subscription state) — plus an Overview, since
 * a wide screen can show the summary the phone had to split across tabs.
 *
 * `live: false` marks a surface with no backend endpoint behind it. There is
 * exactly one: analytics. The page says so instead of drawing invented numbers.
 */

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Matched as a prefix so detail routes keep the parent item active. */
  end?: boolean;
  live: boolean;
};

export const NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true, live: true },
  { to: "/dashboard/music", label: "My Music", icon: Disc3, live: true },
  { to: "/dashboard/upload", label: "New Release", icon: Upload, live: true },
  { to: "/dashboard/earnings", label: "Earnings", icon: Wallet, live: true },
  { to: "/dashboard/artists", label: "Artists", icon: UserRound, live: true },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3, live: false },
  { to: "/dashboard/plan", label: "Plan", icon: CreditCard, live: true },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, live: true },
];
