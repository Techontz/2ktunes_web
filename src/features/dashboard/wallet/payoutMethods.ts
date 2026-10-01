import type { PayoutField, PayoutMethod, PayoutProvider, PayoutType } from "@/lib/api/types";
import type { WalletCopy } from "./copy";

/**
 * Payout providers/methods helpers.
 *
 * The add-method dialog groups providers by `type`, then renders the chosen
 * provider's `fields` schema. Methods are read tolerantly: the current API
 * sends `{provider_code, type, display}`, older responses `{provider{…}, masked}`.
 */

export const PAYOUT_TYPES: readonly PayoutType[] = ["mobile_money", "bank", "bank_international", "wallet"];

/** Field key that, when its select is "other", reveals `<key>_other`. */
export const OTHER_VALUE = "other";

export type ProviderGroup = { type: string; providers: PayoutProvider[] };

/** Groups providers by type in a fixed, friendly order (unknown types last). */
export function groupProviders(providers: PayoutProvider[]): ProviderGroup[] {
  const byType = new Map<string, PayoutProvider[]>();
  for (const p of providers) {
    const list = byType.get(p.type) ?? [];
    list.push(p);
    byType.set(p.type, list);
  }
  const order = (t: string) => {
    const i = (PAYOUT_TYPES as readonly string[]).indexOf(t);
    return i === -1 ? PAYOUT_TYPES.length : i;
  };
  return [...byType.entries()]
    .sort(([a], [b]) => order(a) - order(b))
    .map(([type, list]) => ({ type, providers: list }));
}

/**
 * The provider's form schema. Older backends send no `fields`; fall back to
 * the inputs the previous form collected so the dialog still works.
 */
export function fieldsFor(p: PayoutProvider): PayoutField[] {
  if (p.fields && p.fields.length) return p.fields;
  const name: PayoutField = { key: "account_name", label: "Account holder name", type: "text", required: true, max: 120 };
  if (p.type === "mobile_money") {
    return [name, { key: "account_number", label: "Mobile money number", type: "tel", required: true, max: 40 }];
  }
  if (p.type === "wallet") {
    return [name, { key: "account_email", label: "Account email", type: "email", required: true, max: 190 }];
  }
  return [
    name,
    { key: "account_number", label: "Account number", type: "text", required: true, max: 40 },
    { key: "bank_name", label: "Bank name", type: "text", required: false, max: 120 },
    { key: "bank_branch", label: "Branch", type: "text", required: false, max: 120 },
    { key: "swift_code", label: "SWIFT / BIC", type: "text", required: false, max: 11 },
  ];
}

/** Translated label for a field key, falling back to the API's label. */
export function fieldLabel(f: PayoutField, type: string, c: WalletCopy): string {
  return c.fieldLabelsByType[type]?.[f.key] ?? c.fieldLabels[f.key] ?? f.label;
}

/** Translated hint (or the phone hint for tel fields), else the API's hint. */
export function fieldHint(f: PayoutField, type: string, c: WalletCopy, language: string): string | undefined {
  if (f.type === "tel") return c.phoneHint;
  if (type === "bank_international" && f.key === "account_number") return c.intlAccountHint;
  const own = c.fieldHints[f.key];
  if (own) return own;
  // API hints are English; show them only to English readers.
  return language === "EN" ? (f.hint ?? undefined) : undefined;
}

/** The hidden "<key>_other" companion for a select with an "other" option. */
export function otherKeyFor(f: PayoutField, all: PayoutField[]): string | null {
  if (f.type !== "select" || !f.options?.some((o) => o.value === OTHER_VALUE)) return null;
  void all;
  return `${f.key}_other`;
}

/** True for a field that only appears when its select is "other". */
export function isOtherCompanion(f: PayoutField, all: PayoutField[]): boolean {
  if (!f.key.endsWith("_other")) return false;
  const base = all.find((x) => x.key === f.key.slice(0, -"_other".length));
  return !!base && otherKeyFor(base, all) === f.key;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Client-side checks before POSTing; the server stays the authority. */
export function validateFields(
  fields: PayoutField[],
  values: Record<string, string>,
  c: WalletCopy,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const visible = (f: PayoutField) => {
    if (!isOtherCompanion(f, fields)) return true;
    const baseKey = f.key.slice(0, -"_other".length);
    return values[baseKey] === OTHER_VALUE;
  };
  for (const f of fields) {
    if (!visible(f)) continue;
    const v = (values[f.key] ?? "").trim();
    const required = f.required || isOtherCompanion(f, fields);
    if (!v) {
      if (required) errors[f.key] = c.fieldRequired;
      continue;
    }
    if (f.type === "email" && !EMAIL_RE.test(v)) errors[f.key] = c.emailInvalid;
    else if (f.max && v.length > f.max) errors[f.key] = c.tooLong(f.max);
  }
  return errors;
}

/** The body fields for POST /payout-methods (trimmed, hidden companions dropped). */
export function fieldPayload(fields: PayoutField[], values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    if (isOtherCompanion(f, fields)) {
      const baseKey = f.key.slice(0, -"_other".length);
      if (values[baseKey] !== OTHER_VALUE) continue;
    }
    let v = (values[f.key] ?? "").trim();
    if (!v) continue;
    if (f.key === "swift_code" || f.type === "country") v = v.toUpperCase();
    out[f.key] = v;
  }
  return out;
}

/* ── Methods ─────────────────────────────────────────────────────────── */

export function methodProvider(m: PayoutMethod, providers: PayoutProvider[]): PayoutProvider | null {
  const code = m.provider_code ?? m.provider?.code ?? null;
  return (
    providers.find((p) => (m.provider?.id != null && p.id === m.provider.id) || (code != null && p.code === code)) ?? null
  );
}

export function methodType(m: PayoutMethod, providers: PayoutProvider[] = []): string {
  return m.type ?? m.provider?.type ?? methodProvider(m, providers)?.type ?? "mobile_money";
}

export function methodProviderName(m: PayoutMethod, providers: PayoutProvider[] = []): string {
  return m.provider?.name ?? methodProvider(m, providers)?.name ?? m.provider_code ?? "";
}

/** The masked, human summary of where money goes. */
export function methodDisplay(m: PayoutMethod, providers: PayoutProvider[] = []): string {
  if (m.display) return m.display;
  return [methodProviderName(m, providers), m.masked].filter(Boolean).join(" ");
}

export function methodCurrency(m: PayoutMethod, providers: PayoutProvider[] = []): string | null {
  return m.currency ?? m.provider?.currency ?? methodProvider(m, providers)?.currency ?? null;
}
