import type { FriendGets, ReferralSummary } from "@/lib/api/growth";
import { formatBp, formatMinor } from "@/lib/money";
import type { ReferralCopy } from "./referralCopy";

/** Money without trailing ".00" (TZS 5,000 rather than TZS 5,000.00). */
export function shortMoney(minor: number, currency: string, locale: string): string {
  return formatMinor(minor, currency, locale).replace(/[.,]00(?=\D*$)/, "");
}

/** "20% off your first plan" / "Your first year for TZS 15,000" from the structured offer. */
export function friendGetsText(g: FriendGets | null | undefined, c: ReferralCopy, locale: string): string | null {
  if (!g) return null;
  if (g.mode === "percent" && g.discount_bp) return c.friendPercent(formatBp(g.discount_bp, locale));
  const cheapest = [...(g.plans ?? [])].sort((a, b) => a.price_minor - b.price_minor)[0];
  if (cheapest) {
    const price = shortMoney(cheapest.price_minor, cheapest.currency, locale);
    return cheapest.duration_days === 365 ? c.friendPriceYear(price) : c.friendPricePlan(cheapest.plan_name, price);
  }
  return null;
}

/** "TZS 5,000 in your wallet for each friend who joins and starts a paid plan." */
export function youGetText(p: ReferralSummary["program"], c: ReferralCopy, locale: string): string {
  const y = p.you_get;
  const parts = [
    y.amount_minor > 0 && y.currency ? c.rewardWallet(shortMoney(y.amount_minor, y.currency, locale)) : null,
    y.free_days > 0 ? c.rewardDays(y.free_days) : null,
  ].filter(Boolean) as string[];
  if (!parts.length) return c.rewardNone;
  const what = parts.join(" + ");
  return p.reward_trigger === "on_signup_verified" ? c.rewardJoin(what) : c.rewardPaid(what);
}
