import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/lib/LanguageContext";
import { formatMinor } from "@/lib/money";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import type { SubscriptionInfo } from "@/lib/api/types";
import PlanPage from "@/features/dashboard/plan/PlanPage";
import { PlanCards } from "@/features/site/PlanCards";
import { pickBannerOffer } from "@/features/site/layout/OfferBar";
import { OfferPrice } from "../OfferPrice";

const fmt = (minor: number, cur: string) => formatMinor(minor, cur, "en-TZ");
const renderOffer = (offer: Parameters<typeof OfferPrice>[0]["offer"]) =>
  render(
    <LanguageProvider initial="EN">
      <OfferPrice offer={offer} format={fmt} period="per year" />
    </LanguageProvider>,
  );

describe("OfferPrice", () => {
  it("strikes through the list price and shows the final price, badge and end date", () => {
    renderOffer({ headline: "Launch offer", list_minor: 2_000_000, final_minor: 1_500_000, currency: "TZS", ends_at: "2026-12-31T20:59:59Z" });
    expect(screen.getByText("Launch offer")).toBeInTheDocument();
    expect(screen.getByText("TZS 15,000.00")).toBeInTheDocument();
    const was = screen.getByText("TZS 20,000.00");
    expect(was.closest("s")).not.toBeNull();
    expect(screen.getByText("Was TZS 20,000.00")).toBeInTheDocument();
    expect(screen.getByText(/^Ends /)).toBeInTheDocument();
    expect(screen.getByText("per year")).toBeInTheDocument();
  });

  it("shows Free for a free offer", () => {
    renderOffer({ headline: "Joining is free", list_minor: 2_000_000, final_minor: 0, currency: "TZS" });
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("TZS 20,000.00").closest("s")).not.toBeNull();
    expect(screen.queryByText("per year")).not.toBeInTheDocument();
  });

  it("shows Free for N days for a free_days offer", () => {
    renderOffer({ headline: "Try it", list_minor: 2_000_000, final_minor: 0, currency: "TZS", free_days: 30 });
    expect(screen.getByText("Free for 30 days")).toBeInTheDocument();
    expect(screen.getByText("Then TZS 20,000.00")).toBeInTheDocument();
  });
});

describe("Public pricing with offers", () => {
  it("shows the offer on the plan card in the chosen currency", async () => {
    const api = mockApi({
      "GET /plans": ({ query }) => ({
        plans: [
          {
            id: 1, name: "Single Artist", price: "20000.00", currency: "TZS", duration: 365, description: null, max_artists: 1, is_active: true, order: 1,
            prices: [{ currency: "TZS", amount: "20000.00" }],
            offer: query.get("currency") === "TZS"
              ? { headline: "Launch offer", type: "percent_off", list_minor: 2_000_000, final_minor: 1_500_000, final: "15000.00", currency: "TZS", ends_at: null, free_days: null, referral_applied: false }
              : null,
          },
        ],
      }),
    });
    renderPage(<PlanCards />, { signedIn: false });
    expect(await screen.findByText("Launch offer")).toBeInTheDocument();
    expect(screen.getByText("TZS 15,000").closest("s")).toBeNull();
    expect(screen.getByText("TZS 20,000").closest("s")).not.toBeNull();
    expect(api.calls("GET /plans")[0].query.get("currency")).toBe("TZS");
  });

  it("picks a banner offer anyone can use (no code, not referral-only)", () => {
    const base = { description: null, percent_bp: null, amount_minor: null, currency: null, free_days: null, plan_ids: null, starts_at: null, ends_at: null };
    const offers = [
      { ...base, id: 1, headline: "Code only", type: "percent_off", audience: "everyone", requires_code: true },
      { ...base, id: 2, headline: "Friends", type: "percent_off", audience: "referred", requires_code: false },
      { ...base, id: 3, headline: "Joining is free", type: "free", audience: "first_subscription", requires_code: false },
    ];
    expect(pickBannerOffer(offers)?.id).toBe(3);
    expect(pickBannerOffer(offers, [3])).toBeNull();
  });
});

/* ── Dashboard plan purchase ───────────────────────────────────────── */

const PRO = { id: 2, name: "Pro", price: "50000.00", currency: "TZS", duration: 365, description: null, max_artists: 3, is_active: true, order: 2 };
const sub: SubscriptionInfo = {
  subscription_status: "inactive",
  plan: null,
  expires_at: null,
  pending_payment: null,
  payment_instructions: { methods: ["mpesa_tz", "bank"], note: "", details: { mpesa_lipa_number: "123456" } },
};
const quote = (over: Record<string, unknown> = {}) => ({
  quote: {
    list_minor: 5_000_000, final_minor: 5_000_000, discount_minor: 0, currency: "TZS", list: "50000.00", final: "50000.00",
    offer: null, referral_applied: false, free_days: null, ...over,
  },
});

describe("Plan page offers and promo codes", () => {
  it("shows a plan's offer struck through on the card", async () => {
    mockApi({
      "GET /plans": {
        plans: [{ ...PRO, offer: { headline: "Launch offer", type: "percent_off", list_minor: 5_000_000, final_minor: 4_000_000, final: "40000.00", currency: "TZS", ends_at: null, free_days: null, referral_applied: false } }],
      },
      "GET /subscription": sub,
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    expect(await screen.findByText("Launch offer")).toBeInTheDocument();
    expect(screen.getByText("TZS 50,000.00").closest("s")).not.toBeNull();
    expect(screen.getByText("TZS 40,000.00")).toBeInTheDocument();
  });

  it("validates a promo code and pays the discounted amount", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      "GET /plans": { plans: [PRO] },
      "GET /subscription": sub,
      "POST /offers/validate": ({ body }) => {
        const code = (body as { code?: string }).code;
        if (code === "NOPE") return { status: 422, body: { status: false, code: "offer_code_invalid", message: "Invalid code." } };
        return code
          ? quote({ final_minor: 3_000_000, discount_minor: 2_000_000, final: "30000.00", offer: { id: 9, headline: "Studio deal", type: "percent_off", ends_at: null } })
          : quote();
      },
      "POST /subscribe": { status: 202, body: { status: true, message: "ok", subscription_status: "pending_payment", payment: null, user: {} } },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    await user.click(await screen.findByRole("button", { name: "Choose the Pro plan" }));
    const d = within(await screen.findByRole("dialog"));
    await vi.waitFor(() => expect(api.calls("POST /offers/validate")).toHaveLength(1));
    expect(api.calls("POST /offers/validate")[0].body).toEqual({ plan_id: 2, currency: "TZS" });

    await user.click(d.getByRole("button", { name: /Have a code/ }));
    await user.type(d.getByLabelText("Promo code"), "NOPE");
    await user.click(d.getByRole("button", { name: "Apply" }));
    expect(await d.findByText("That code is not valid.")).toBeInTheDocument();

    await user.clear(d.getByLabelText("Promo code"));
    await user.type(d.getByLabelText("Promo code"), "studio20");
    await user.click(d.getByRole("button", { name: "Apply" }));
    expect(await d.findByText("Code applied: Studio deal")).toBeInTheDocument();
    expect(d.getByTestId("amount-due")).toHaveTextContent("TZS 30,000.00");
    expect(api.calls("POST /offers/validate").at(-1)?.body).toEqual({ plan_id: 2, currency: "TZS", code: "studio20" });

    await user.selectOptions(d.getByLabelText(/Payment method/), "mpesa_tz");
    await user.type(d.getByLabelText(/Payment reference/), "QK1");
    await user.click(d.getByRole("button", { name: "Submit payment" }));
    await vi.waitFor(() => expect(api.calls("POST /subscribe")).toHaveLength(1));
    expect(api.calls("POST /subscribe")[0].body).toEqual({
      plan_id: 2,
      currency: "TZS",
      code: "studio20",
      payment_method: "mpesa_tz",
      payment_reference: "QK1",
    });
  });

  it("activates at once when the quoted price is 0, with no payment step", async () => {
    const user = userEvent.setup();
    let active = false;
    const api = mockApi({
      "GET /plans": { plans: [PRO] },
      "GET /subscription": () => (active ? { ...sub, subscription_status: "active", plan: PRO, expires_at: "2026-11-01T00:00:00Z" } : sub),
      "POST /offers/validate": quote({ final_minor: 0, discount_minor: 5_000_000, final: "0.00", free_days: 30, offer: { id: 3, headline: "Joining is free", type: "free", ends_at: null } }),
      "POST /subscribe": () => {
        active = true;
        return { message: "Subscription active", subscription_status: "active", payment: { amount_minor: 0, status: "confirmed", method: "offer" }, user: {} };
      },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    await user.click(await screen.findByRole("button", { name: "Choose the Pro plan" }));
    const d = within(await screen.findByRole("dialog"));
    expect(await d.findByRole("button", { name: "Activate now" })).toBeInTheDocument();
    expect(d.getByText("Free for 30 days")).toBeInTheDocument();
    // No payment instructions, method or reference.
    expect(d.queryByText("How to pay")).not.toBeInTheDocument();
    expect(d.queryByLabelText(/Payment reference/)).not.toBeInTheDocument();

    await user.click(d.getByRole("button", { name: "Activate now" }));
    await vi.waitFor(() => expect(api.calls("POST /subscribe")).toHaveLength(1));
    expect(api.calls("POST /subscribe")[0].body).toEqual({ plan_id: 2, currency: "TZS" });
    expect(await screen.findByText("Pro plan is active")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
