import { useCallback, useReducer } from "react";
import { newIdempotencyKey } from "@/lib/api/wallet";

/**
 * One withdrawal "attempt" = one idempotency key.
 *
 * The key is minted when the confirmation step is entered and then reused for
 * every retry of that same attempt (network error, 5xx, wrong password …), so
 * the server can never create two withdrawals for one intent. It changes only
 * when the attempt itself changes — a different currency, payout method or
 * amount (i.e. a new quote) — or after success / closing the flow (`reset`).
 */

type AttemptState = {
  /** `currency|methodId|amount` the current key belongs to. */
  signature: string | null;
  key: string | null;
};

type AttemptAction =
  | { type: "enter_confirm"; signature: string; mint: () => string }
  | { type: "reset" };

export const initialAttempt: AttemptState = { signature: null, key: null };

export function attemptSignature(currency: string, methodId: number, amountDecimal: string): string {
  return `${currency.toUpperCase()}|${methodId}|${amountDecimal}`;
}

export function attemptReducer(state: AttemptState, action: AttemptAction): AttemptState {
  switch (action.type) {
    case "enter_confirm":
      if (state.key && state.signature === action.signature) return state;
      return { signature: action.signature, key: action.mint() };
    case "reset":
      return initialAttempt;
  }
}

export function useWithdrawAttempt(mint: () => string = newIdempotencyKey) {
  const [state, dispatch] = useReducer(attemptReducer, initialAttempt);
  const enterConfirm = useCallback(
    (signature: string) => dispatch({ type: "enter_confirm", signature, mint }),
    [mint],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  return { key: state.key, signature: state.signature, enterConfirm, reset };
}
