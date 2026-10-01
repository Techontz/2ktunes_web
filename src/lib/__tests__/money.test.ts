import { describe, expect, it } from "vitest";
import {
  bpToPercentInput,
  formatBp,
  formatDecimal,
  formatMinor,
  isZeroDecimal,
  minorToDecimal,
  parseAmount,
  percentToBp,
  toMinor,
} from "@/lib/money";

describe("formatMinor", () => {
  it("formats minor units exactly with the currency code", () => {
    expect(formatMinor(2500000, "TZS", "en-US")).toBe("TZS 25,000.00");
    expect(formatMinor(1999, "USD", "en-US")).toBe("USD 19.99");
    expect(formatMinor(0, "KES", "en-US")).toBe("KES 0.00");
  });

  it("respects zero-decimal currencies", () => {
    expect(formatMinor(150000, "UGX", "en-US")).toBe("UGX 150,000");
  });

  it("never loses precision on large values (no float maths)", () => {
    // 2^53 + 1 minor units would be rounded by a float; BigInt keeps it exact.
    expect(formatMinor("9007199254740993", "USD", "en-US")).toBe("USD 90,071,992,547,409.93");
    expect(formatMinor(10n ** 20n + 7n, "TZS", "en-US")).toBe("TZS 1,000,000,000,000,000,000.07");
  });

  it("handles negatives and an explicit plus sign", () => {
    expect(formatMinor(-5050, "USD", "en-US")).toBe("-USD 50.50");
    expect(formatMinor(5050, "USD", "en-US", { signDisplay: "always" })).toBe("+USD 50.50");
    expect(formatMinor(0, "USD", "en-US", { signDisplay: "always" })).toBe("USD 0.00");
  });

  it("uses locale grouping (Swahili)", () => {
    const out = formatMinor(123456789, "TZS", "sw-TZ");
    expect(out).toContain("TZS");
    expect(out).toMatch(/1[.,\s]234[.,\s]567[.,]89/);
  });

  it("falls back gracefully for an unknown currency code", () => {
    expect(formatMinor(12345, "ZZZ1", "en-US")).toBe("ZZZ1 123.45");
  });

  it("treats junk input as zero rather than NaN", () => {
    expect(formatMinor("abc", "USD", "en-US")).toBe("USD 0.00");
    expect(formatMinor(1.5, "USD", "en-US")).toBe("USD 0.00");
    expect(formatMinor(null, "USD", "en-US")).toBe("USD 0.00");
  });
});

describe("parseAmount", () => {
  it("parses typed amounts into exact minor units and the API decimal string", () => {
    expect(parseAmount("25,000", "TZS")).toEqual({ minor: 2500000n, decimal: "25000.00" });
    expect(parseAmount(" 25000.5 ", "TZS")).toEqual({ minor: 2500050n, decimal: "25000.50" });
    expect(parseAmount("0.1", "USD")).toEqual({ minor: 10n, decimal: "0.10" });
    expect(parseAmount("150000", "UGX")).toEqual({ minor: 150000n, decimal: "150000" });
  });

  it("rejects anything that is not a plain amount", () => {
    expect(parseAmount("", "USD")).toBeNull();
    expect(parseAmount("-5", "USD")).toBeNull();
    expect(parseAmount("1e3", "USD")).toBeNull();
    expect(parseAmount("12.345", "USD")).toBeNull(); // never silently rounds
    expect(parseAmount("10.5", "UGX")).toBeNull();
    expect(parseAmount("abc", "USD")).toBeNull();
  });
});

describe("decimal helpers", () => {
  it("minorToDecimal", () => {
    expect(minorToDecimal(2500050, "TZS")).toBe("25000.50");
    expect(minorToDecimal(-7, "USD")).toBe("-0.07");
    expect(minorToDecimal(500, "UGX")).toBe("500");
  });

  it("formatDecimal formats plan prices from strings", () => {
    expect(formatDecimal("9.99", "USD", "en-US")).toBe("USD 9.99");
    expect(formatDecimal("25000", "TZS", "en-US")).toBe("TZS 25,000.00");
    expect(formatDecimal("0.10", "USD", "en-US")).toBe("USD 0.10");
    expect(formatDecimal("nonsense", "USD", "en-US")).toBe("USD 0.00");
  });

  it("isZeroDecimal", () => {
    expect(isZeroDecimal("0")).toBe(true);
    expect(isZeroDecimal("0.00")).toBe(true);
    expect(isZeroDecimal("9.99")).toBe(false);
  });

  it("toMinor coerces API values", () => {
    expect(toMinor(12)).toBe(12n);
    expect(toMinor("-40")).toBe(-40n);
    expect(toMinor(undefined)).toBe(0n);
  });
});

describe("basis points", () => {
  it("formats bp as a percentage with integer maths", () => {
    expect(formatBp(10000, "en-US")).toBe("100%");
    expect(formatBp(1250, "en-US")).toBe("12.5%");
    expect(formatBp(3333, "en-US")).toBe("33.33%");
    expect(formatBp(5, "en-US")).toBe("0.05%");
  });

  it("parses percentages back to bp", () => {
    expect(percentToBp("33.33")).toBe(3333);
    expect(percentToBp("12,5")).toBe(1250);
    expect(percentToBp("100")).toBe(10000);
    expect(percentToBp("50%")).toBe(5000);
    expect(percentToBp("1.234")).toBeNull();
    expect(percentToBp("x")).toBeNull();
    expect(bpToPercentInput(1250)).toBe("12.5");
    expect(bpToPercentInput(10000)).toBe("100");
  });
});
