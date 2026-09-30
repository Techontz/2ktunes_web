import { Link } from "react-router-dom";
import { Disc3, MailWarning, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useResource } from "@/lib/api/useResource";
import {
  fetchArtists,
  fetchReleases,
  fetchRoyalties,
  num,
  usd,
} from "@/lib/api/dashboard";
import { resendVerificationEmail } from "@/lib/api/auth";
import { useState } from "react";
import {
  Badge,
  Button,
  DataState,
  EmptyState,
  Notice,
  Panel,
  SectionLabel,
  Skeleton,
  StatTile,
} from "./ui";
import { Cover, releaseStatusTone } from "./release";

/**
 * OVERVIEW
 * ========
 *
 * Every number here is read from the API on load — three real calls:
 *
 *   GET /api/royalties  → balance, total earnings, withdrawals
 *   GET /api/releases   → release count and the most recent few
 *   GET /api/artists    → artist count, and the plan resolved server-side
 *
 * There is no computed "streams", "listeners" or "growth" figure, because no
 * endpoint returns any. See AnalyticsPage.
 */

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function EmailVerificationNotice() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  return (
    <Notice
      title="Your email address isn’t verified yet"
      action={
        <button
          type="button"
          disabled={state === "sending" || state === "sent"}
          onClick={async () => {
            setState("sending");
            try {
              await resendVerificationEmail();
              setState("sent");
            } catch {
              setState("failed");
            }
          }}
          className="text-[0.8125rem] font-bold text-amber underline decoration-amber/40 underline-offset-4 disabled:opacity-60"
        >
          {state === "sending"
            ? "Sending…"
            : state === "sent"
              ? "Verification email sent"
              : state === "failed"
                ? "Couldn’t send — try again"
                : "Resend verification email"}
        </button>
      }
    >
      <span className="flex items-start gap-2">
        <MailWarning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" strokeWidth={2.2} aria-hidden />
        Verification isn’t required to use 2K Tunes today, but confirming your
        address keeps your account recoverable.
      </span>
    </Notice>
  );
}

export default function OverviewPage() {
  const { user } = useAuth();
  const royalties = useResource((signal) => fetchRoyalties(signal));
  const releases = useResource((signal) => fetchReleases(signal));
  const artists = useResource((signal) => fetchArtists(signal));

  if (!user) return null;

  const verified = Boolean(user.email_verified_at);
  const subscribed = user.subscription_status === "active";

  return (
    <>
      <PageIntro name={firstName(user.name)} />

      <div className="space-y-4">
        {!verified && <EmailVerificationNotice />}

        {!subscribed && (
          <Notice
            tone="accent"
            title="You don’t have an active plan"
            action={
              <Link
                to="/dashboard/plan"
                className="text-[0.8125rem] font-bold text-volt-lit underline decoration-volt-lit/40 underline-offset-4"
              >
                See plans
              </Link>
            }
          >
            Distribution is gated on an active subscription — the release upload
            endpoint rejects requests without one.
          </Notice>
        )}
      </div>

      {/* ── EARNINGS ── */}
      <section className="mt-8">
        <SectionLabel>Earnings</SectionLabel>
        <div className="mt-4">
          <DataState
            state={royalties}
            skeleton={
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-[8.5rem]" />
                <Skeleton className="h-[8.5rem]" />
                <Skeleton className="h-[8.5rem]" />
              </div>
            }
          >
            {(data) => (
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile
                  label="Available balance"
                  value={usd(data.stats.balance)}
                  tone="positive"
                  meta={
                    num(data.stats.balance) < 25
                      ? "Withdrawals start at $25.00"
                      : "Ready to withdraw"
                  }
                />
                <StatTile
                  label="Total earnings"
                  value={usd(data.stats.total_earnings)}
                  meta={`${data.history.length} transaction${data.history.length === 1 ? "" : "s"}`}
                />
                <StatTile
                  label="Withdrawn"
                  value={usd(data.stats.withdrawals)}
                  meta={data.payout.payout_method ?? "No payout method on file"}
                />
              </div>
            )}
          </DataState>
        </div>
      </section>

      {/* ── CATALOGUE ── */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <SectionLabel>Catalogue</SectionLabel>
          <Link
            to="/dashboard/music"
            className="text-[0.8125rem] font-bold text-white/45 underline decoration-white/20 underline-offset-4 hover:text-white"
          >
            View all
          </Link>
        </div>

        {/* items-start: without it the release list stretches to match the
            taller artists card and leaves a block of dead space under one row. */}
        <div className="mt-4 grid items-start gap-3 lg:grid-cols-[1fr_18rem]">
          <DataState
            state={releases}
            skeleton={<Skeleton className="h-[13rem]" />}
            empty={(list) =>
              list.length === 0 ? (
                <EmptyState
                  icon={<Disc3 className="h-5 w-5" strokeWidth={2} />}
                  title="No releases yet"
                  action={
                    <Link to="/dashboard/upload">
                      <Button>
                        <Upload className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                        Start a release
                      </Button>
                    </Link>
                  }
                >
                  Anything you deliver through 2K Tunes will appear here with its
                  review status.
                </EmptyState>
              ) : null
            }
          >
            {(list) => (
              <Panel className="p-0 sm:p-0">
                <ul>
                  {list.slice(0, 4).map((release, i) => (
                    <li key={release.id} className={i > 0 ? "border-t border-white/[0.06]" : ""}>
                      <Link
                        to={`/dashboard/music/${release.id}`}
                        className="flex items-center gap-4 p-4 outline-none transition-colors hover:bg-white/[0.025] focus-visible:ring-2 focus-visible:ring-volt-lit/70 sm:px-5"
                      >
                        <Cover src={release.cover_image} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.9375rem] font-bold text-white">
                            {release.release_title}
                          </span>
                          <span className="block truncate text-[0.8125rem] font-medium text-white/40">
                            {release.artist_name} · {release.release_type}
                          </span>
                        </span>
                        <Badge tone={releaseStatusTone(release.status)}>
                          {release.status ?? "unknown"}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </DataState>

          <DataState state={artists} skeleton={<Skeleton className="h-[13rem]" />}>
            {(data) => (
              <Panel className="flex flex-col justify-between gap-6">
                <div>
                  <p className="text-[0.8125rem] font-semibold text-white/40">Artists</p>
                  <p className="mt-4 text-[2rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-white">
                    {data.artists.length}
                    {data.user.plan?.max_artists != null && (
                      <span className="text-[1rem] font-bold text-white/25">
                        {" "}
                        / {data.user.plan.max_artists}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-[0.75rem] font-medium text-white/30">
                    {data.user.plan
                      ? `${data.user.plan.name} plan`
                      : "No plan resolved for this account"}
                  </p>
                </div>
                <Link
                  to="/dashboard/artists"
                  className="text-[0.8125rem] font-bold text-white/45 underline decoration-white/20 underline-offset-4 hover:text-white"
                >
                  Manage artists
                </Link>
              </Panel>
            )}
          </DataState>
        </div>
      </section>

      {/* ── RECENT ACTIVITY ── */}
      <section className="mt-10">
        <SectionLabel>Recent transactions</SectionLabel>
        <div className="mt-4">
          <DataState state={royalties} skeleton={<Skeleton className="h-[9rem]" />}>
            {(data) =>
              data.history.length === 0 ? (
                <Panel>
                  <p className="text-[0.875rem] font-medium text-white/40">
                    No transactions on this account yet.
                  </p>
                </Panel>
              ) : (
                <Panel className="p-0 sm:p-0">
                  <ul>
                    {data.history.slice(0, 5).map((tx, i) => (
                      <li
                        key={tx.id}
                        className={`flex items-center justify-between gap-4 p-4 sm:px-5 ${
                          i > 0 ? "border-t border-white/[0.06]" : ""
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[0.875rem] font-semibold text-white">
                            {tx.description || tx.method || tx.type}
                          </span>
                          <span className="block text-[0.75rem] font-medium text-white/35">
                            {new Date(tx.created_at).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {" · "}
                            {tx.type}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 text-[0.9375rem] font-bold tabular-nums ${
                            num(tx.amount) < 0 ? "text-white/50" : "text-lime"
                          }`}
                        >
                          {num(tx.amount) < 0 ? "−" : "+"}
                          {usd(Math.abs(num(tx.amount)))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )
            }
          </DataState>
        </div>
      </section>
    </>
  );
}

function PageIntro({ name }: { name: string }) {
  return (
    <div className="mb-8">
      <p className="text-[0.5625rem] font-bold uppercase tracking-[0.22em] text-white/25">
        2K Tunes <span className="text-white/15">/</span> Dashboard
      </p>
      <h1 className="mt-3 text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.035em] text-white sm:text-[2.125rem]">
        Welcome back, {name}
      </h1>
    </div>
  );
}
