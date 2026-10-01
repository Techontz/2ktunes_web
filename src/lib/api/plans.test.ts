import { describe, expect, it } from "vitest";
import { formatMoney, normalisePlans } from "./plans";

describe("plans", () => {
  it("normalises API rows, drops inactive plans and sorts by order", () => {
    const plans = normalisePlans([
      { id: 2, name: "Two", price: "29000.00", currency: "tzs", duration: 30, description: null, max_artists: null, is_active: true, order: 2, features: ["A", "B"] },
      { id: 1, name: "One", price: "15000.00", currency: "TZS", duration: 30, description: null, max_artists: 1, is_active: true, order: 1, features: ["X"] },
      { id: 3, name: "Old", price: "1.00", currency: "USD", duration: 30, description: null, max_artists: 1, is_active: false, order: 0 },
    ]);
    expect(plans.map((p) => p.name)).toEqual(["One", "Two"]);
    expect(plans[1]).toMatchObject({ price: 29000, currency: "TZS", features: ["A", "B"], max_artists: 1 });
  });

  it("formats TZS without decimals", () => {
    expect(formatMoney(29000, "TZS", "en-TZ")).toMatch(/^TZS\s?29,000$/);
    expect(formatMoney(19.5, "USD", "en-US")).toMatch(/USD\s?19\.50/);
  });
});
