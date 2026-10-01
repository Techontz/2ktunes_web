import type { Balance, PayoutMethod, PayoutProvider, Withdrawal, WithdrawalQuote } from "@/lib/api/types";

export const META = { current_page: 1, last_page: 1, per_page: 20, total: 0 };

export function balance(over: Partial<Balance> = {}): Balance {
  return {
    currency: "TZS",
    available_minor: 0,
    held_minor: 0,
    pending_minor: 0,
    lifetime_earnings_minor: 0,
    withdrawn_minor: 0,
    ...over,
  };
}

export function provider(over: Partial<PayoutProvider> = {}): PayoutProvider {
  return {
    id: 7,
    code: "mpesa_tz",
    name: "M-Pesa",
    type: "mobile_money",
    country: "TZ",
    currency: "TZS",
    min_minor: 100000,
    max_minor: 500000000,
    daily_limit_minor: 1000000000,
    monthly_limit_minor: 5000000000,
    fee_fixed_minor: 50000,
    fee_percent_bp: 150,
    is_sandbox: false,
    processing: "Processed automatically.",
    fields: [
      { key: "account_name", label: "Account holder name", type: "text", required: true, max: 120 },
      { key: "account_number", label: "Phone number", type: "tel", required: true, max: 20 },
    ],
    ...over,
  };
}

export function method(over: Partial<PayoutMethod> = {}): PayoutMethod {
  return {
    id: 3,
    provider_code: "mpesa_tz",
    type: "mobile_money",
    label: "Main M-Pesa",
    display: "M-Pesa •••• 4567",
    account_name: "Neema Said",
    bank_name: null,
    is_default: true,
    provider: { id: 7, code: "mpesa_tz", name: "M-Pesa", type: "mobile_money", currency: "TZS" },
    created_at: "2026-05-01T10:00:00Z",
    ...over,
  };
}

export function quoteFor(grossMinor: number): WithdrawalQuote {
  return {
    currency: "TZS",
    gross_minor: grossMinor,
    fee_minor: 50000,
    net_minor: grossMinor - 50000,
    payout_currency: "TZS",
    payout_amount_minor: grossMinor - 50000,
    payout_fee_minor: 50000,
    fx_rate: null,
    limits: { min_minor: 100000, max_minor: 500000000, daily_limit_minor: 1000000000, monthly_limit_minor: null, currency: "TZS" },
  };
}

export function withdrawal(over: Partial<Withdrawal> = {}): Withdrawal {
  return {
    id: 11,
    reference: "WD260901ABCDEF",
    status: "requested",
    currency: "TZS",
    gross_minor: 2500000,
    fee_minor: 50000,
    net_minor: 2450000,
    payout_currency: "TZS",
    payout_amount_minor: 2450000,
    fx_rate: null,
    destination: "M-Pesa •••• 4567",
    is_sandbox: false,
    provider_reference: null,
    failure_reason: null,
    created_at: "2026-09-01T09:00:00Z",
    approved_at: null,
    completed_at: null,
    failed_at: null,
    ...over,
  };
}
