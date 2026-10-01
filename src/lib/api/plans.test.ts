import { describe, expect, it } from "vitest";
import { currenciesOf, DEFAULT_PLANS, formatMoney, normalisePlans, priceIn } from "./plans";

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

  it("lists the TZS and USD prices the admin set", () => {
    const [both, tzsOnly, fromList] = normalisePlans([
      { id: 1, name: "Single Artist", price: "39000.00", currency: "TZS", price_usd: "15.00", duration: 365, description: null, max_artists: 1, order: 1 },
      { id: 2, name: "2 Artists", price: "59000.00", currency: "TZS", price_usd: null, duration: 365, description: null, max_artists: 2, order: 2 },
      { id: 3, name: "Label", price: "99000.00", currency: "TZS", prices: [{ currency: "TZS", amount: "99000.00" }, { currency: "usd", amount: "38.00" }], duration: 365, description: null, max_artists: 5, order: 3 },
    ]);
    expect(both.prices).toEqual([{ currency: "TZS", amount: 39000 }, { currency: "USD", amount: 15 }]);
    expect(tzsOnly.prices).toEqual([{ currency: "TZS", amount: 59000 }]);
    expect(priceIn(fromList, "USD")).toEqual({ currency: "USD", amount: 38 });
    expect(priceIn(tzsOnly, "USD")).toBeNull();
    expect(currenciesOf([tzsOnly, both])).toEqual(["TZS", "USD"]);
  });

  it("ships yearly launch plans as the offline fallback", () => {
    expect(DEFAULT_PLANS.map((p) => [p.name, p.price, p.duration, p.max_artists])).toEqual([
      ["Single Artist", 39000, 365, 1],
      ["2 Artists", 59000, 365, 2],
    ]);
  });

  it("formats TZS without decimals", () => {
    expect(formatMoney(29000, "TZS", "en-TZ")).toMatch(/^TZS\s?29,000$/);
    expect(formatMoney(19.5, "USD", "en-US")).toMatch(/USD\s?19\.50/);
  });
});
