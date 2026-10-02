import {
  BarChart3,
  Bell,
  BookOpen,
  CreditCard,
  Disc3,
  Gift,
  HandCoins,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Palette,
  PieChart,
  PlusCircle,
  Receipt,
  Settings,
  UserRound,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { MessageKey } from "@/i18n";
import type { AuthUser } from "@/lib/api/auth";

/**
 * The dashboard's information architecture. Every entry maps to a route in
 * App.tsx backed by a real endpoint (DOCS/API.md). The creator workspace is
 * shown only to accounts that are creators or already have a creator profile.
 */

export type NavItem = {
  to: string;
  label: MessageKey;
  icon: LucideIcon;
  /** Exact match only (Overview). */
  end?: boolean;
  visible?: (user: AuthUser | null) => boolean;
};

type NavGroup = { label: MessageKey; items: NavItem[] };

const isCreator = (u: AuthUser | null) => !!u && (u.account_type === "creator" || u.has_creator_profile === true);

export const NAV: NavGroup[] = [
  {
    label: "dash.group_music",
    items: [
      { to: "/dashboard", label: "dash.nav_overview", icon: LayoutDashboard, end: true },
      { to: "/dashboard/music", label: "dash.nav_music", icon: Disc3 },
      { to: "/dashboard/new-release", label: "dash.nav_new_release", icon: PlusCircle },
      { to: "/dashboard/artists", label: "dash.nav_artists", icon: UserRound },
      { to: "/dashboard/splits", label: "dash.nav_splits", icon: PieChart },
    ],
  },
  {
    label: "dash.group_grow",
    items: [
      { to: "/dashboard/promotion", label: "dash.nav_promotion", icon: Megaphone },
      { to: "/dashboard/creators", label: "dash.nav_creators", icon: UsersRound },
      { to: "/dashboard/orders", label: "dash.nav_orders", icon: Receipt },
      { to: "/dashboard/creator", label: "dash.nav_creator_workspace", icon: Palette, visible: isCreator },
      { to: "/dashboard/analytics", label: "dash.nav_analytics", icon: BarChart3 },
      { to: "/dashboard/referrals", label: "dash.nav_referrals", icon: Gift },
    ],
  },
  {
    label: "dash.group_money",
    items: [
      { to: "/dashboard/royalties", label: "dash.nav_royalties", icon: HandCoins },
      { to: "/dashboard/wallet", label: "dash.nav_wallet", icon: Wallet },
      { to: "/dashboard/plan", label: "dash.nav_plan", icon: CreditCard },
    ],
  },
  {
    label: "dash.group_account",
    items: [
      { to: "/dashboard/notifications", label: "dash.nav_notifications", icon: Bell },
      { to: "/dashboard/support", label: "dash.nav_support", icon: LifeBuoy },
      { to: "/dashboard/help", label: "dash.nav_help", icon: BookOpen },
      { to: "/dashboard/settings", label: "dash.nav_settings", icon: Settings },
    ],
  },
];

/** Whether `item` is the current section for `pathname`. */
export function isNavActive(item: NavItem, pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (item.end) return path === item.to;
  return path === item.to || path.startsWith(`${item.to}/`);
}
