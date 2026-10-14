/**
 * Where an authenticated user belongs.
 *
 * One constant, imported by both the route guard and the auth form, so the
 * post-sign-in destination can never drift between them. `?next=` always wins
 * over this — that is how a guarded deep link survives a round trip through
 * /auth.
 */
export const DASHBOARD_HOME = "/dashboard";

/** Where a freshly registered account goes first. */
export const ONBOARDING_PATH = "/onboarding";

/**
 * Where an account with an unconfirmed email waits. The API refuses almost
 * everything (403 `email_unverified`) until the address is confirmed.
 */
export const VERIFY_EMAIL_PATH = "/verify-email";

/** True once the account's email address is confirmed. */
export function isEmailVerified(user: { email_verified?: boolean; email_verified_at?: string | null } | null): boolean {
  if (!user) return false;
  if (typeof user.email_verified === "boolean") return user.email_verified;
  return !!user.email_verified_at;
}

/** `/verify-email`, carrying `?next=` when there is somewhere to return to. */
export function verifyEmailPath(next?: string | null): string {
  const safe = safeNext(next ?? null);
  return safe ? `${VERIFY_EMAIL_PATH}?next=${encodeURIComponent(safe)}` : VERIFY_EMAIL_PATH;
}

/**
 * Where a confirmed account continues to: onboarding first if it was never
 * finished (keeping `next` for afterwards), otherwise `next` or the dashboard.
 */
export function homeAfterVerification(
  user: { onboarding_completed_at?: string | null } | null,
  next?: string | null,
): string {
  const safe = safeNext(next ?? null);
  if (user && !user.onboarding_completed_at && safe?.split("?")[0] !== ONBOARDING_PATH) {
    return safe ? `${ONBOARDING_PATH}?next=${encodeURIComponent(safe)}` : ONBOARDING_PATH;
  }
  return safe ?? DASHBOARD_HOME;
}

/** Only same-origin paths are accepted as a redirect target. */
export function safeNext(next: string | null): string | null {
  if (!next) return null;
  // Browsers strip tabs/newlines from URLs, so `/\t/evil.com` would become
  // `//evil.com`. No legitimate path contains control characters or spaces.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\s]/.test(next)) return null;
  // `//evil.com` is protocol-relative and would leave the site.
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  // `/\evil.com` is normalised to `//evil.com` by browsers.
  if (next.startsWith("/\\")) return null;
  // Never bounce back into the auth screens themselves.
  if (/^\/(auth|forgot-password|reset-password|verify-email)(\/|\?|$)/.test(next)) return null;
  return next;
}
