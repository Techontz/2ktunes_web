import { useCallback } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { ApiError, ApiNotConfiguredError } from "./client";

/**
 * Turns any thrown value into a message that is safe to show a user.
 *
 * Business-rule and validation errors (4xx) carry a human message written by
 * the API (`insufficient_funds`, `release_locked` …) and are shown as-is.
 * Transport and server failures map to translated copy; a 5xx body is never
 * shown.
 */
export function errorMessageFor(err: unknown, t: (k: string) => string): string {
  if (err instanceof ApiNotConfiguredError) return t("err.unconfigured");
  if (err instanceof ApiError) {
    if (err.isNetwork) return t("err.network");
    if (err.status >= 500 || err.status === 0) return t("err.server");
    if (err.status === 429) return t("err.rate_limited");
    if (err.status === 404) return t("err.not_found");
    if (err.status === 403 && err.code === "forbidden") return t("err.forbidden");
    return err.message || t("err.generic");
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
