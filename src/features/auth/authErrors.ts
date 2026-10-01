import { ApiError, ApiNotConfiguredError } from "@/lib/api/client";
import type { MessageKey } from "@/i18n";

/**
 * Maps an auth request failure to a translated message key.
 * Field-level 422 errors are handled separately by the forms.
 */
export function authErrorKey(err: unknown): MessageKey {
  if (err instanceof ApiNotConfiguredError) return "auth.err_unconfigured";
  if (err instanceof ApiError) {
    if (err.isNetwork) return "auth.err_network";
    if (err.status === 429) return "auth.err_throttle";
    if (err.status === 401) return "auth.err_credentials";
    return "auth.err_server";
  }
  return "auth.err_server";
}

/** Laravel field names → form field names. */
export function mapFieldErrors(fieldErrors: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [field, message] of Object.entries(fieldErrors)) {
    out[field === "password_confirmation" ? "confirm" : field] = message;
  }
  return out;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
