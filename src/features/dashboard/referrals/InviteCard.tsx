import { ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui";
import { REFERRAL_COPY } from "@/features/growth/referralCopy";
import { friendGetsText } from "@/features/growth/referralText";
import { fetchReferrals } from "@/lib/api/growth";
import { useResource } from "@/lib/api/useResource";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";

/** Overview card: shown only while the referral program is enabled. */
export function InviteCard({ className }: { className?: string }) {
  const c = useCopy(REFERRAL_COPY);
  const { locale } = useLanguage();
  const res = useResource((signal) => fetchReferrals({ signal }), []);
  if (!res.data?.program.enabled) return null;
  const gets = friendGetsText(res.data.program.friend_gets, c, locale);

  return (
    <section
      aria-labelledby="invite-card-title"
      className={`theme-dark relative overflow-hidden rounded-card bg-[linear-gradient(120deg,#3b0d63,#841dc6_60%,#b45be8)] p-5 text-white shadow-raised sm:p-6 ${className ?? ""}`}
    >
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Gift className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="invite-card-title" className="text-[1.125rem] font-bold leading-tight">
              {c.cardTitle}
            </h2>
            <p className="mt-1 text-body-sm text-white/85">{gets ? c.cardBody(gets) : c.cardBodyGeneric}</p>
          </div>
        </div>
        <Button to="/dashboard/referrals" variant="inverse" rightIcon={<ArrowRight />} className="shrink-0">
          {c.cardCta}
        </Button>
      </div>
    </section>
  );
}
