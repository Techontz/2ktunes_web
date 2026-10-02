import { Link } from "react-router-dom";
import { Facebook, Gift, HandCoins, MessageCircle, Send, Share2, Sparkles, UserCheck, UserPlus, Users } from "lucide-react";
import { Avatar, Badge, Button, Card, EmptyState, Stat } from "@/components/ui";
import {
  CopyButton,
  LoadError,
  Money,
  PageHeader,
  PageLoading,
  Section,
  StatGrid,
  StatusPill,
} from "@/features/dashboard/components";
import { REFERRAL_COPY, type ReferralCopy } from "@/features/growth/referralCopy";
import { friendGetsText, youGetText } from "@/features/growth/referralText";
import { fetchReferrals, type ReferralSummary } from "@/lib/api/growth";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";

/**
 * /dashboard/referrals: "Invite artists". The referral link with copy,
 * native share and share buttons, what friends get and what I get, stats
 * and the list of friends (initials only, for privacy). A friendly "coming
 * soon" state when the program is switched off.
 */
export default function ReferralsPage() {
  const c = useCopy(REFERRAL_COPY);
  const res = useResource((signal) => fetchReferrals({ signal }), []);

  if (res.loading) return <PageLoading />;
  if (res.error || !res.data)
    return (
      <div>
        <PageHeader title={c.pageTitle} />
        <LoadError error={res.error} onRetry={res.reload} />
      </div>
    );

  const r = res.data;
  if (!r.program.enabled) {
    return (
      <div>
        <PageHeader title={c.pageTitle} />
        <Card className="mx-auto max-w-xl py-10 text-center">
          <span aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-text">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-h3 font-bold text-text">{c.disabledTitle}</h2>
          <p className="mx-auto mt-2 max-w-[42ch] text-body-sm text-text-muted">{c.disabledBody}</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={c.pageTitle} description={c.pageIntro} />
      <div className="space-y-8 sm:space-y-10">
        <ShareCard r={r} />
        <Rewards r={r} />
        <Stats r={r} />
        <Friends r={r} />
        <p className="text-caption text-text-subtle">
          <Link to="/legal/terms#referrals" className="font-semibold text-accent-text hover:underline">
            {c.terms}
          </Link>
        </p>
      </div>
    </div>
  );
}

function shareLinks(link: string, message: string) {
  const u = encodeURIComponent(link);
  const m = encodeURIComponent(message);
  return [
    { key: "whatsapp", name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`, icon: <MessageCircle />, tone: "bg-[#25d366] text-white" },
    { key: "x", name: "X", href: `https://twitter.com/intent/tweet?text=${m}&url=${u}`, icon: <XGlyph />, tone: "bg-black text-white" },
    { key: "facebook", name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <Facebook />, tone: "bg-[#1877f2] text-white" },
    { key: "telegram", name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${m}`, icon: <Send />, tone: "bg-[#229ed9] text-white" },
  ];
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ShareCard({ r }: { r: ReferralSummary }) {
  const c = useCopy(REFERRAL_COPY);
  const { locale } = useLanguage();
  const gets = friendGetsText(r.program.friend_gets, c, locale);
  const message = gets ? c.shareMessage(gets) : c.shareMessageNoGift;
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <Card className="relative overflow-hidden border-accent/25" padding="lg">
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-2xl" />
      <h2 className="text-h4 font-bold text-text">{c.yourLink}</h2>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <p
          className="min-w-0 flex-1 truncate rounded-control border border-border bg-surface-sunken px-3.5 py-3 font-mono text-body-sm font-semibold text-text"
          data-testid="referral-link"
        >
          {r.link}
        </p>
        <div className="flex gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
          <CopyButton value={r.link} label={c.copyLink} size="md" />
          {canShare && (
            <Button
              leftIcon={<Share2 />}
              onClick={() => {
                navigator.share({ title: "2kTunes", text: message, url: r.link }).catch(() => {
                  /* dismissed */
                });
              }}
            >
              {c.share}
            </Button>
          )}
        </div>
      </div>
      <p className="mt-2 text-caption text-text-subtle">
        {c.code}: <span className="font-mono font-semibold text-text">{r.code}</span>
      </p>
      <div className="mt-5">
        <p className="mb-2 text-caption font-semibold text-text-subtle">{c.shareVia}</p>
        <ul className="flex flex-wrap gap-2">
          {shareLinks(r.link, message).map((s) => (
            <li key={s.key}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface-raised pl-1.5 pr-4 text-body-sm font-semibold text-text transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
              >
                <span aria-hidden className={cn("flex h-8 w-8 items-center justify-center rounded-full [&>svg]:h-4 [&>svg]:w-4", s.tone)}>
                  {s.icon}
                </span>
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function Rewards({ r }: { r: ReferralSummary }) {
  const c = useCopy(REFERRAL_COPY);
  const { locale } = useLanguage();
  const gets = friendGetsText(r.program.friend_gets, c, locale) ?? c.friendGeneric;
  const p = r.program;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card variant="accent" className="flex gap-4">
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <Gift className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-caption font-bold uppercase tracking-[0.12em] text-accent-text">{c.friendsGet}</h2>
          <p className="mt-1 text-[1.125rem] font-bold text-text">{gets}</p>
        </div>
      </Card>
      <Card className="flex gap-4">
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
          <HandCoins className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-caption font-bold uppercase tracking-[0.12em] text-success">{c.youGetReward}</h2>
          <p className="mt-1 font-semibold text-text">{youGetText(p, c, locale)}</p>
          <p className="mt-1.5 text-caption text-text-subtle">
            {[
              c.holdNote(p.hold_days ?? 0),
              p.max_rewards_per_month ? c.capNote(p.max_rewards_per_month) : null,
              p.you_get.amount_minor > 0 ? c.walletNote : null,
            ]
              .filter(Boolean)
              .join(" ")}
          </p>
        </div>
      </Card>
    </div>
  );
}

function Stats({ r }: { r: ReferralSummary }) {
  const c = useCopy(REFERRAL_COPY);
  const { locale } = useLanguage();
  const s = r.stats;
  const earned = s.earned.filter((e) => e.amount_minor > 0);
  return (
    <Section title={c.statsTitle} id="ref-stats">
      <StatGrid>
        <Stat label={c.joined} value={formatCount(s.joined, locale)} icon={<UserPlus />} />
        <Stat label={c.qualified} value={formatCount(s.qualified, locale)} icon={<UserCheck />} />
        <Stat
          label={c.rewarded}
          value={formatCount(s.rewarded, locale)}
          icon={<Users />}
          hint={s.pending_rewards > 0 ? c.pendingRewards(s.pending_rewards) : undefined}
        />
        <Stat
          label={c.earned}
          icon={<HandCoins />}
          value={
            earned.length === 0 && !s.free_days_earned ? (
              "0"
            ) : (
              <span className="flex flex-col">
                {earned.map((e) => (
                  <Money key={e.currency} minor={e.amount_minor} currency={e.currency} />
                ))}
                {s.free_days_earned > 0 && <span>{c.freeDaysEarned(s.free_days_earned)}</span>}
              </span>
            )
          }
        />
      </StatGrid>
    </Section>
  );
}

function Friends({ r }: { r: ReferralSummary }) {
  const c = useCopy(REFERRAL_COPY);
  return (
    <Section title={c.listTitle} description={c.listPrivacy} id="ref-friends">
      {r.referrals.length === 0 ? (
        <EmptyState compact icon={<Users />} title={c.listEmpty} />
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {r.referrals.map((f) => (
              <FriendRow key={f.id} f={f} c={c} />
            ))}
          </ul>
        </Card>
      )}
    </Section>
  );
}

function FriendRow({ f, c }: { f: ReferralSummary["referrals"][number]; c: ReferralCopy }) {
  const { locale } = useLanguage();
  const sub = !f.reward_skipped && f.reward_pending && f.reward_due_at
      ? c.rewardDue(formatDate(f.reward_due_at, locale))
      : c.joinedOn(formatDate(f.joined_at, locale));
  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      {/* Avatar builds initials from words, so "AJ" becomes "A J". */}
      <Avatar name={(f.initials || "?").split("").join(" ")} size="md" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-text">{f.initials || "?"}</p>
        <p className="truncate text-caption text-text-subtle">{sub}</p>
      </div>
      {f.reward_skipped ? (
        <Badge tone="neutral" size="sm">
          {c.rewardSkipped}
        </Badge>
      ) : (
        <StatusPill status={f.status} />
      )}
    </li>
  );
}
