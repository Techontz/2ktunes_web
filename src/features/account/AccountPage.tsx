import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, MailWarning, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resendVerificationEmail } from "@/lib/api/auth";
import { Wordmark } from "@/features/landing/ui";
import { cn } from "@/lib/utils";

/**
 * THE AUTHENTICATED DESTINATION
 * =============================
 *
 * This app had no route behind authentication — only `/` and `/auth` — so there
 * was no existing dashboard to redirect to. Rather than guess at one or invent a
 * product surface, this is a deliberately minimal account screen whose only job
 * is to prove the session is real: every value on it comes from
 * `GET /api/profile`, and the sign-out button calls `POST /api/logout`.
 *
 * It reuses the auth screen's design language, and is the place to build (or
 * replace with) the real dashboard when that exists.
 *
 * Email verification is surfaced but not enforced, because the backend does not
 * enforce it either: `User` implements MustVerifyEmail, yet `register` never
 * fires the `Registered` event and no API route carries the `verified`
 * middleware. Claiming an account was blocked would be false.
 */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-white/[0.07] py-4">
      <dt className="text-[0.8125rem] font-medium text-white/40">{label}</dt>
      <dd className="min-w-0 truncate text-[0.9375rem] font-semibold text-white">
        {value}
      </dd>
    </div>
  );
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [resend, setResend] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );

  if (!user) return null;

  // Boolean(), not `!== null`: the field can be absent entirely.
  const verified = Boolean(user.email_verified_at);

  return (
    <div className="tunes flex min-h-screen flex-col bg-[#050505]">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link to="/" className="text-[1.25rem] leading-none" aria-label="2K Tunes — home">
          <Wordmark />
        </Link>
        <button
          type="button"
          onClick={async () => {
            setBusy(true);
            await logout();
            setBusy(false);
          }}
          disabled={busy}
          className={cn(
            "flex h-11 items-center gap-2 rounded-[12px] border border-white/[0.11] px-4",
            "text-[0.875rem] font-semibold text-white/70 transition-colors",
            "hover:border-white/20 hover:bg-white/[0.05] hover:text-white",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} aria-hidden />
          ) : (
            <LogOut className="h-4 w-4" strokeWidth={2.2} aria-hidden />
          )}
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </header>

      <main className="flex flex-1 justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-[34rem]">
          <p className="text-[0.5625rem] font-bold uppercase tracking-[0.22em] text-white/25">
            2K Tunes <span className="text-white/15">/</span> Account
          </p>
          <h1 className="mt-4 text-[2.125rem] font-extrabold leading-[1.04] tracking-[-0.04em] text-white">
            {user.name}
          </h1>
          <p className="mt-3 text-[1rem] font-medium text-white/45">
            You’re signed in to 2K Tunes.
          </p>

          {!verified && (
            <div className="mt-8 rounded-[14px] border border-amber/25 bg-amber/[0.06] p-4">
              <p className="flex items-center gap-2.5 text-[0.875rem] font-semibold text-amber">
                <MailWarning className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
                Your email address isn’t verified yet
              </p>
              <p className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-white/45">
                Verification isn’t required to use your account today, but
                confirming your address keeps it recoverable.
              </p>
              <button
                type="button"
                disabled={resend === "sending" || resend === "sent"}
                onClick={async () => {
                  setResend("sending");
                  try {
                    await resendVerificationEmail();
                    setResend("sent");
                  } catch {
                    setResend("failed");
                  }
                }}
                className="mt-3 text-[0.8125rem] font-bold text-amber underline decoration-amber/40 underline-offset-4 disabled:opacity-60"
              >
                {resend === "sending"
                  ? "Sending…"
                  : resend === "sent"
                    ? "Verification email sent"
                    : resend === "failed"
                      ? "Couldn’t send — try again"
                      : "Resend verification email"}
              </button>
            </div>
          )}

          {/* Everything below is live data from GET /api/profile. */}
          <dl className="mt-10">
            <Row label="Name" value={user.name} />
            <Row label="Email" value={user.email} />
            {user.business_name && (
              <Row label="Business name" value={user.business_name} />
            )}
            <Row
              label="Email verified"
              value={verified ? "Yes" : "Not yet"}
            />
            <Row
              label="Subscription"
              value={
                user.subscription_plan_id
                  ? `Plan #${user.subscription_plan_id}`
                  : "No active plan"
              }
            />
            {user.country && <Row label="Country" value={user.country} />}
            <Row
              label="Member since"
              value={new Date(user.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <Row label="Account ID" value={`#${user.id}`} />
          </dl>

          <p className="mt-10 text-[0.75rem] font-medium leading-relaxed text-white/30">
            This screen exists so the authenticated session is visible and
            testable. Replace it with the product dashboard when that surface is
            built — the auth state, guards and API client it uses are already in
            place.
          </p>
        </div>
      </main>
    </div>
  );
}
