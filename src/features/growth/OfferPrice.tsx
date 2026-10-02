import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * A plan price with an offer applied (GET /plans `offer`, or a promo-code
 * quote): the list price struck through, the final price, a purple offer
 * badge with the headline, and "Ends {date}" when the offer has an end.
 * A free offer reads "Free" or "Free for N days".
 *
 * `format` turns minor units into the caller's money style (the public site
 * drops TZS decimals, the dashboard keeps them).
 */
export type OfferLike = {
  headline?: string | null;
  list_minor: number;
  final_minor: number;
  currency: string;
  ends_at?: string | null;
  free_days?: number | null;
};

export function OfferBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[0.75rem] font-bold leading-none text-white shadow-[0_6px_16px_-8px_rgb(132_29_198/0.8)]",
        className,
      )}
    >
      <Sparkles aria-hidden className="h-3 w-3 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

export function OfferPrice({
  offer,
  format,
  period,
  size = "lg",
  className,
  mutedClass = "text-text-muted",
}: {
  offer: OfferLike;
  format: (minor: number, currency: string) => string;
  /** "per year" etc, shown after a paid final price. */
  period?: ReactNode;
  size?: "md" | "lg";
  className?: string;
  mutedClass?: string;
}) {
  const { t, locale } = useLanguage();
  const free = offer.final_minor <= 0;
  const list = format(offer.list_minor, offer.currency);
  const final = format(offer.final_minor, offer.currency);
  const main = free
    ? offer.free_days
      ? t("offer.free_days", { days: offer.free_days })
      : t("offer.free")
    : final;

  return (
    <div className={cn("min-w-0", className)} data-testid="offer-price">
      {offer.headline && <OfferBadge className="mb-2.5">{offer.headline}</OfferBadge>}
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={cn(
            "font-extrabold leading-none tracking-[-0.03em] tabular-nums",
            size === "lg" ? "text-[1.75rem] sm:text-[2rem]" : "text-[1.5rem]",
          )}
        >
          <span className="sr-only">{t("offer.now", { price: free ? main : final })} </span>
          <span aria-hidden>{main}</span>
        </span>
        <s className={cn("text-body font-semibold tabular-nums decoration-2", mutedClass)}>
          <span className="sr-only">{t("offer.was", { price: list })}</span>
          <span aria-hidden>{list}</span>
        </s>
        {!free && period && <span className={cn("text-body-sm", mutedClass)}>{period}</span>}
      </p>
      {free && offer.free_days ? (
        <p className={cn("mt-1.5 text-[0.8125rem]", mutedClass)}>{t("offer.then_price", { price: list })}</p>
      ) : null}
      {offer.ends_at && (
        <p className="mt-1.5 text-[0.8125rem] font-semibold text-accent-text">
          {t("offer.ends", { date: formatDate(offer.ends_at, locale) })}
        </p>
      )}
    </div>
  );
}
