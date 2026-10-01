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
  if (/^\/(auth|forgot-password|reset-password)(\/|\?|$)/.test(next)) return null;
  return next;
}
