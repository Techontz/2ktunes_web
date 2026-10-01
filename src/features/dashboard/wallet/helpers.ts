import type { ActionResult } from "@/features/dashboard/components";
import type { PayoutProvider } from "@/lib/api/types";
import { errorCodeOf } from "@/lib/api/errors";
import { formatBp, formatMinor, toMinor } from "@/lib/money";
import type { WalletCopy } from "./copy";

/** "TZS 1,000.00 + 1.5%" — or just the part that is non-zero. */
export function providerFee(p: PayoutProvider, c: WalletCopy, locale: string): string {
  const hasFixed = toMinor(p.fee_fixed_minor) > 0n;
  const hasPct = (p.fee_percent_bp ?? 0) > 0;
  const fixed = formatMinor(p.fee_fixed_minor, p.currency, locale);
  const pct = formatBp(p.fee_percent_bp, locale);
  if (hasFixed && hasPct) return c.feeValue(fixed, pct);
  if (hasPct) return pct;
  return fixed;
}

export function providerLimits(p: PayoutProvider, c: WalletCopy, locale: string): string {
  const min = formatMinor(p.min_minor, p.currency, locale);
  return p.max_minor == null ? c.minOnly(min) : c.limitsValue(min, formatMinor(p.max_minor, p.currency, locale));
}

/**
 * The API describes processing in English. Swahili and French readers get the
 * matching translated sentence (the backend only emits the manual/automatic pair).
 */
export function providerProcessing(p: PayoutProvider, c: WalletCopy, language: string): string {
  if (language === "EN" && p.processing) return p.processing;
  return /automatic/i.test(p.processing ?? "") ? c.processingAuto : c.processingManual;
}

/** A friendly, localized message for a withdrawal business-rule error, or null. */
export function withdrawalErrorMessage(err: unknown, c: WalletCopy): string | null {
  const code = errorCodeOf(err);
  return code && c.wdErrors[code] ? c.wdErrors[code] : null;
}

export function ledgerTypeLabel(type: string, c: WalletCopy): string {
  return c.ledgerTypes[type] ?? type.replace(/_/g, " ").replace(/^\w/, (m) => m.toUpperCase());
}

/** The thrown value behind a failed `useAction` run (null on success). */
export function failureOf(res: ActionResult<unknown>): unknown {
  return "error" in res ? res.error : null;
}
