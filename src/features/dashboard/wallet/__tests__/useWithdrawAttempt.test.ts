import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { attemptReducer, attemptSignature, initialAttempt, useWithdrawAttempt } from "../useWithdrawAttempt";

function counter() {
  let n = 0;
  return () => `key-${++n}`;
}

describe("attemptReducer", () => {
  it("mints a key on first confirm and keeps it for the same attempt", () => {
    const mint = counter();
    const sig = attemptSignature("TZS", 1, "25000.00");
    const a = attemptReducer(initialAttempt, { type: "enter_confirm", signature: sig, mint });
    const b = attemptReducer(a, { type: "enter_confirm", signature: sig, mint });
    expect(a.key).toBe("key-1");
    expect(b).toBe(a);
  });

  it("mints a new key when the attempt changes, and after reset", () => {
    const mint = counter();
    const a = attemptReducer(initialAttempt, { type: "enter_confirm", signature: attemptSignature("TZS", 1, "1.00"), mint });
    const b = attemptReducer(a, { type: "enter_confirm", signature: attemptSignature("TZS", 1, "2.00"), mint });
    const c = attemptReducer(b, { type: "enter_confirm", signature: attemptSignature("TZS", 2, "2.00"), mint });
    expect(new Set([a.key, b.key, c.key]).size).toBe(3);
    const reset = attemptReducer(c, { type: "reset" });
    expect(reset).toEqual(initialAttempt);
    const d = attemptReducer(reset, { type: "enter_confirm", signature: attemptSignature("TZS", 2, "2.00"), mint });
    expect(d.key).toBe("key-4");
  });
});

describe("useWithdrawAttempt", () => {
  it("exposes a stable key across re-entries of the same attempt", () => {
    const mint = counter();
    const { result } = renderHook(() => useWithdrawAttempt(mint));
    expect(result.current.key).toBeNull();
    act(() => result.current.enterConfirm("TZS|1|5.00"));
    const first = result.current.key;
    act(() => result.current.enterConfirm("TZS|1|5.00"));
    expect(result.current.key).toBe(first);
    act(() => result.current.enterConfirm("TZS|1|6.00"));
    expect(result.current.key).not.toBe(first);
    act(() => result.current.reset());
    expect(result.current.key).toBeNull();
  });
});
