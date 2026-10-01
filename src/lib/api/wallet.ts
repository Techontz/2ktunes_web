import { request } from "./client";
import type {
  Balance,
  BreakdownBy,
  BreakdownRow,
  LedgerEntry,
  Paginated,
  PayoutMethod,
  PayoutProvider,
  RoyaltyStatement,
  Withdrawal,
  WithdrawalQuote,
} from "./types";

/**
 * Wallet, withdrawals, payout methods and royalty reporting.
 * DOCS/API.md → "Money"; verified in WalletController / RoyaltyController.
 *
 * Amounts are SENT as decimal strings (`amount: "25000.00"`) plus currency —
 * build them with `parseAmount()` from `@/lib/money`, never from a float.
 */

type S = { signal?: AbortSignal };

export function fetchWallet({ signal }: S = {}) {
  return request<{ balances: Balance[]; open_withdrawals: Withdrawal[] }>("/wallet", { signal });
}

export function fetchStatement(params: { currency?: string; page?: number; per_page?: number } = {}, { signal }: S = {}) {
  return request<{ entries: LedgerEntry[]; meta: Paginated }>("/wallet/statement", { signal, query: params });
}

export async function fetchPayoutProviders({ signal }: S = {}): Promise<PayoutProvider[]> {
  const res = await request<{ providers: PayoutProvider[] }>("/payout-providers", { signal });
  return res.providers ?? [];
}

export async function fetchPayoutMethods({ signal }: S = {}): Promise<PayoutMethod[]> {
  const res = await request<{ methods: PayoutMethod[] }>("/payout-methods", { signal });
  return res.methods ?? [];
}

/**
 * POST /payout-methods body: the provider, options, the password and one
 * entry per provider `fields[].key` (account_name, account_number,
 * bank_name, bank_country, swift_code, account_email …).
 */
type PayoutMethodInput = {
  payout_provider_id: number;
  label?: string | null;
  is_default?: boolean;
  current_password: string;
} & Record<string, string | number | boolean | null | undefined>;

export async function createPayoutMethod(input: PayoutMethodInput): Promise<PayoutMethod> {
  const res = await request<{ method: PayoutMethod }>("/payout-methods", { method: "POST", body: input });
  return res.method;
}

/**
 * DELETE /payout-methods/{id}. The backend route takes no password; the UI
 * still asks for one first and checks it with POST /verify-password.
 */
export function deletePayoutMethod(id: number) {
  return request<{ message: string }>(`/payout-methods/${id}`, { method: "DELETE" });
}

/** POST /verify-password → `{status: bool}` (200 either way). */
export async function verifyPassword(current_password: string): Promise<boolean> {
  const res = await request<{ status: boolean }>("/verify-password", { method: "POST", body: { current_password } });
  return res.status === true;
}

export async function quoteWithdrawal(input: {
  amount: string;
  currency: string;
  payout_method_id: number;
}): Promise<WithdrawalQuote> {
  const res = await request<{ quote: WithdrawalQuote }>("/withdrawals/quote", { method: "POST", body: input });
  return res.quote;
}

export async function requestWithdrawal(input: {
  amount: string;
  currency: string;
  payout_method_id: number;
  current_password: string;
  idempotency_key: string;
}): Promise<Withdrawal> {
  const res = await request<{ withdrawal: Withdrawal }>("/withdrawals", { method: "POST", body: input });
  return res.withdrawal;
}

export function fetchWithdrawals(page = 1, { signal }: S = {}) {
  return request<{ withdrawals: Withdrawal[]; meta: Paginated }>("/withdrawals", { signal, query: { page } });
}

export async function cancelWithdrawal(id: number): Promise<Withdrawal> {
  const res = await request<{ withdrawal: Withdrawal }>(`/withdrawals/${id}/cancel`, { method: "POST" });
  return res.withdrawal;
}

/* ── Royalties ─────────────────────────────────────────────────────── */

export async function fetchBreakdown(
  params: { by: BreakdownBy; from?: string; to?: string; currency?: string },
  { signal }: S = {},
) {
  return request<{ by: BreakdownBy; range: { from: string; to: string }; rows: BreakdownRow[] }>(
    "/royalties/breakdown",
    { signal, query: params },
  );
}

export async function fetchStatements({ signal }: S = {}): Promise<RoyaltyStatement[]> {
  const res = await request<{ statements: RoyaltyStatement[] }>("/royalties/statements", { signal });
  return res.statements ?? [];
}

/** A fresh idempotency key: one per withdrawal confirmation screen. */
export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `wd-${crypto.randomUUID()}`;
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `wd-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
