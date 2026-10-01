import { useCallback } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { ApiError, ApiNotConfiguredError } from "./client";

/**
 * Turns any thrown value into a message that is safe to show a user.
 *
 * Business-rule and validation errors (4xx) carry an English message written
 * by the API. Known machine `code`s (`insufficient_funds`, `daily_limit` …)
 * map to translated copy; unknown codes fall back to the API's message.
 * Transport and server failures map to translated copy; a 5xx body is never
 * shown.
 */

/** API error codes that have translated copy under `err.code.<code>`. */
export const TRANSLATED_ERROR_CODES = [
  "password_incorrect",
  "insufficient_funds",
  "below_minimum",
  "above_maximum",
  "daily_limit",
  "monthly_limit",
  "fx_unavailable",
  "provider_unavailable",
  "validation_failed",
  "release_incomplete",
  "subscription_required",
  "email_unverified",
  "too_many_uploads",
  "upc_taken",
  "amount_invalid",
  "idempotency_conflict",
  "accept_window_expired",
] as const;


/** Translated text for a known API error code, or null. */
function translatedCodeMessage(
  code: string | null | undefined,
  t: (k: string) => string,
): string | null {
  if (!code || !(TRANSLATED_ERROR_CODES as readonly string[]).includes(code)) return null;
  return t(`err.code.${code}`);
}

export function errorMessageFor(err: unknown, t: (k: string) => string): string {
  if (err instanceof ApiNotConfiguredError) return t("err.unconfigured");
  if (err instanceof ApiError) {
    if (err.isNetwork) return t("err.network");
    if (err.status >= 500 || err.status === 0) return t("err.server");
    if (err.status === 429) return t("err.rate_limited");
    if (err.status === 404) return t("err.not_found");
    if (err.status === 403 && err.code === "forbidden") return t("err.forbidden");
    // A 422 whose only content is field errors keeps the API summary so the
    // form can highlight fields; a known code wins over the English message.
    return translatedCodeMessage(err.code, t) ?? (err.message || t("err.generic"));
  }
  return t("err.generic");
}

export function useErrorMessage(): (err: unknown) => string {
  const { t } = useLanguage();
  return useCallback((err: unknown) => errorMessageFor(err, t), [t]);
}

/** Field errors from a 422, or an empty object. */
export function fieldErrorsOf(err: unknown): Record<string, string> {
  return err instanceof ApiError ? err.fieldErrors : {};
}

/** The API's machine code, if any. */
export function errorCodeOf(err: unknown): string | null {
  return err instanceof ApiError ? err.code : null;
}
