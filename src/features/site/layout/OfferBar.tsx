import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { fetchActiveOffers, type ActiveOffer } from "@/lib/api/growth";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatBp, formatMinor } from "@/lib/money";

/**
 * Site-wide offer announcement (GET /offers/active, `show_on_pricing`
 * offers). Shows the highest-priority offer anyone can use without a code,
 * links to /pricing and can be dismissed (remembered per offer).
 */

const DISMISS_KEY = "2kt.offerbar.dismissed";

function dismissedIds(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "number") : [];
  } catch {
    return [];
  }
}

/** The banner offer: no code needed, not referral-only, not dismissed. */
export function pickBannerOffer(offers: ActiveOffer[], dismissed: number[] = []): ActiveOffer | null {
  return (
    offers.find((o) => !o.requires_code && o.audience !== "referred" && !dismissed.includes(o.id)) ?? null
  );
}

export function useOfferBar() {
  const [offer, setOffer] = useState<ActiveOffer | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchActiveOffers({ signal: ctrl.signal })
      .then((list) => setOffer(pickBannerOffer(list, dismissedIds())))
      .catch(() => setOffer(null));
    return () => ctrl.abort();
  }, []);
  const dismiss = useCallback(() => {
    setOffer((o) => {
      if (o) {
        try {
          localStorage.setItem(DISMISS_KEY, JSON.stringify([...dismissedIds(), o.id].slice(-20)));
        } catch {
          /* storage blocked: hidden for this visit only */
        }
      }
      return null;
    });
  }, []);
  return { offer, dismiss };
}

/** "join free until 31 Dec 2026" style summary, built from the offer's fields. */
export function useOfferSummary() {
  const { t, locale } = useLanguage();
  return (o: ActiveOffer): { what: string; until: string } => {
    const amount = (minor: number | null, cur: string | null) =>
      minor != null && cur ? formatMinor(minor, cur, locale).replace(/[.,]00(?=\D*$)/, "") : "";
    const what =
      o.type === "free"
        ? o.free_days
          ? t("offer.sum_free_days", { days: o.free_days })
          : t("offer.sum_free")
        : o.type === "percent_off" && o.percent_bp
          ? t("offer.sum_percent", { pct: formatBp(o.percent_bp, locale) })
          : o.type === "fixed_off" && o.amount_minor
            ? t("offer.sum_fixed_off", { amount: amount(o.amount_minor, o.currency) })
            : o.type === "fixed_price" && o.amount_minor != null
              ? t("offer.sum_fixed_price", { amount: amount(o.amount_minor, o.currency) })
              : "";
    const until = o.ends_at ? t("offer.until", { date: formatDate(o.ends_at, locale) }) : "";
    return { what, until };
  };
}

export function OfferBar({ offer, onDismiss }: { offer: ActiveOffer; onDismiss: () => void }) {
  const { t } = useLanguage();
  const { what, until } = useOfferSummary()(offer);
  return (
    <div
      role="region"
      aria-label={t("offer.bar_label")}
      className="relative flex h-9 items-center bg-[linear-gradient(90deg,#5a1191,#841dc6_45%,#9e4fe0)] text-white"
    >
      <Link
        to="/pricing"
        className="flex h-full min-w-0 flex-1 items-center justify-center gap-2 px-11 text-[0.8125rem] font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white sm:text-[0.875rem]"
      >
        <Sparkles aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#ffd8a8]" />
        <span className="min-w-0 truncate">
          {what ? `${offer.headline}: ${what}` : offer.headline}
          {/* The end date is dropped on phones to keep the bar to one line. */}
          {until && <span className="hidden sm:inline"> {until}</span>}
        </span>
        <span className="hidden shrink-0 items-center gap-1 underline decoration-white/50 underline-offset-2 sm:inline-flex">
          {t("offer.bar_link")}
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </span>
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("offer.bar_dismiss")}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
