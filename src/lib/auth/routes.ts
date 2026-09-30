/**
 * Where an authenticated user belongs.
 *
 * One constant, imported by both the route guard and the auth form, so the
 * post-sign-in destination can never drift between them. `?next=` always wins
 * over this — that is how a guarded deep link survives a round trip through
 * /auth.
 */
export const DASHBOARD_HOME = "/dashboard";

/** Only same-origin paths are accepted as a redirect target. */
export function safeNext(next: string | null): string | null {
  if (!next) return null;
  // `//evil.com` is protocol-relative and would leave the site.
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}
