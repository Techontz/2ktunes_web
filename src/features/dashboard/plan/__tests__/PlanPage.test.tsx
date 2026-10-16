import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import type { SubscriptionInfo } from "@/lib/api/types";
import PlanPage from "../PlanPage";

const PLANS = [
  { id: 1, name: "Starter", price: "0", currency: "TZS", duration: 365, description: "Try it out", max_artists: 1, is_active: true, order: 1 },
  { id: 2, name: "Pro", price: "50000.00", currency: "TZS", duration: 365, description: "For working artists", max_artists: 3, is_active: true, order: 2 },
];

function subscription(over: Partial<SubscriptionInfo> = {}): SubscriptionInfo {
  return {
    subscription_status: "inactive",
    plan: null,
    expires_at: null,
    pending_payment: null,
    payment_instructions: {
      methods: ["mpesa_tz", "airtel_tz", "mixx_tz", "bank"],
      note: "Pay using the details shown in the app, then enter your payment reference.",
      details: { mpesa_lipa_number: "123456" },
    },
    ...over,
  };
}

describe("PlanPage", () => {
  it("offers mobile money, card and PayPal only, each Coming soon until connected", async () => {
    const user = userEvent.setup();
    const api = mockApi({ "GET /plans": { plans: PLANS }, "GET /subscription": subscription() });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });

    // Sold per year, shown per month: 50,000 / 12.
    expect(await screen.findByText("TZS 4,167")).toBeInTheDocument();
    expect(screen.getByText("TZS 50,000 billed yearly")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Choose the Pro plan" }));
    const d = within(await screen.findByRole("dialog"));
    expect(d.getByText("Pay TZS 50,000 for one year of Pro.")).toBeInTheDocument();
    expect(d.getByTestId("amount-due")).toHaveTextContent("TZS 50,000.00");
    expect(d.getByText("Billed yearly. Covers 12 months, about TZS 4,167 a month.")).toBeInTheDocument();

    const radios = d.getAllByRole("radio").filter((r) => (r as HTMLInputElement).name === "pay-method");
    expect(radios.map((r) => (r as HTMLInputElement).value)).toEqual(["mobile_money", "card", "paypal"]);
    radios.forEach((r) => expect(r).toBeDisabled());
    expect(d.getAllByText("Coming soon").length).toBeGreaterThanOrEqual(2);
    expect(d.getByText("Online payments are being connected. You will be able to pay here very soon.")).toBeInTheDocument();
    expect(d.getByRole("button", { name: "Coming soon" })).toBeDisabled();

    // No manual payment UI at all.
    expect(d.queryByText("How to pay")).not.toBeInTheDocument();
    expect(d.queryByLabelText(/Payment reference/)).not.toBeInTheDocument();
    expect(d.queryByLabelText(/Payment method/)).not.toBeInTheDocument();
    expect(d.queryByText("123456")).not.toBeInTheDocument();
    expect(d.queryByText(/payment reference/i)).not.toBeInTheDocument();
    expect(api.calls("POST /subscribe")).toHaveLength(0);
  });

  it("switches the amount to USD when the admin set a USD price", async () => {
    const user = userEvent.setup();
    const both = { ...PLANS[1], price_usd: "20.00", prices: [{ currency: "TZS", amount: "50000.00" }, { currency: "USD", amount: "20.00" }] };
    mockApi({ "GET /plans": { plans: [both] }, "GET /subscription": subscription() });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });

    expect(await screen.findByText("or USD 20")).toBeInTheDocument();
    expect(screen.getByText("/ month")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Choose the Pro plan" }));
    const d = within(await screen.findByRole("dialog"));
    // TZS | USD toggle next to the amount.
    await user.click(d.getByRole("radio", { name: "USD" }));
    expect(d.getByTestId("amount-due")).toHaveTextContent("USD 20.00");
    expect(d.getByText("Available for payments in TZS")).toBeInTheDocument();
  });

  it("still shows a manual payment recorded for Finance", async () => {
    mockApi({
      "GET /plans": { plans: PLANS },
      "GET /subscription": subscription({
        subscription_status: "pending_payment",
        pending_payment: {
          id: 9, plan_id: 2, amount_minor: 5000000, currency: "TZS", method: "mpesa_tz", payer_reference: "QK12AB34CD",
          status: "pending", created_at: "2026-10-01T08:00:00Z", plan: { id: 2, name: "Pro" },
        },
      }),
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    expect(await screen.findByText("Payment awaiting confirmation")).toBeInTheDocument();
    expect(screen.getByText("QK12AB34CD")).toBeInTheDocument();
  });

  it("activates a free plan after confirmation", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      "GET /plans": { plans: PLANS },
      "GET /subscription": subscription(),
      "POST /subscribe": { message: "Subscription active", subscription_status: "active", payment: null, user: {} },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    await user.click(await screen.findByRole("button", { name: "Choose the Starter plan" }));
    await user.click(await screen.findByRole("button", { name: "Activate plan" }));
    expect(await screen.findByText("Starter plan is active")).toBeInTheDocument();
    expect(api.calls("POST /subscribe")[0].body).toEqual({ plan_id: 1 });
  });

  it("marks the current plan with a Renew button and rounds the monthly price", async () => {
    const user = userEvent.setup();
    const plans = [
      { ...PLANS[1], id: 1, name: "Single Artist", price: "39000.00", max_artists: 1 },
      { ...PLANS[1], id: 2, name: "2 Artists", price: "59000.00", max_artists: 2, features: ["Everything in Single Artist"] },
    ];
    mockApi({
      "GET /plans": { plans },
      "GET /subscription": subscription({ subscription_status: "active", plan: plans[0] as never, expires_at: "2027-02-01T00:00:00Z" }),
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });

    expect(await screen.findByRole("heading", { level: 1, name: "Change or renew your plan" })).toBeInTheDocument();
    expect(await screen.findByText("TZS 3,250")).toBeInTheDocument();
    expect(screen.getByText("TZS 4,917")).toBeInTheDocument();
    expect(screen.getAllByText("Current plan")).toHaveLength(1);
    expect(screen.getByText("Everything in Single Artist")).toBeInTheDocument();
    const renew = screen.getByRole("button", { name: "Renew the Single Artist plan" });
    expect(renew).toHaveTextContent("Renew plan");
    expect(screen.getByRole("button", { name: "Choose the 2 Artists plan" })).toHaveTextContent("Choose plan");
    expect(screen.getByText("Prices are shown per month. You pay once for the full year.")).toBeInTheDocument();
    // Renewing opens the same pay dialog for the same plan.
    await user.click(renew);
    expect(await screen.findByRole("dialog")).toHaveTextContent("Single Artist");
  });
});
