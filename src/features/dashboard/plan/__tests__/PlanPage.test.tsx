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
  it("submits a paid plan with payment method + reference and shows the pending state", async () => {
    const user = userEvent.setup();
    let pending = false;
    const api = mockApi({
      "GET /plans": { plans: PLANS },
      "GET /subscription": () =>
        pending
          ? {
              ...subscription({
                subscription_status: "pending_payment",
                pending_payment: {
                  id: 9,
                  plan_id: 2,
                  amount_minor: 5000000,
                  currency: "TZS",
                  method: "mpesa_tz",
                  payer_reference: "QK12AB34CD",
                  status: "pending",
                  created_at: "2026-10-01T08:00:00Z",
                  plan: { id: 2, name: "Pro" },
                },
              }),
            }
          : subscription(),
      "POST /subscribe": () => {
        pending = true;
        return {
          status: 202,
          body: { status: true, message: "Payment submitted.", subscription_status: "pending_payment", payment: null, user: {} },
        };
      },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });

    await user.click(await screen.findByRole("button", { name: "Choose the Pro plan" }));
    const dialog = await screen.findByRole("dialog");
    const d = within(dialog);
    expect(d.getByText("123456")).toBeInTheDocument();
    expect(d.getByText("M-Pesa Lipa number")).toBeInTheDocument();

    // Both fields are required before anything is sent.
    await user.click(d.getByRole("button", { name: "Submit payment" }));
    expect(api.calls("POST /subscribe")).toHaveLength(0);
    expect(d.getByText("Choose how you paid.")).toBeInTheDocument();

    await user.selectOptions(d.getByLabelText(/Payment method/), "mpesa_tz");
    await user.type(d.getByLabelText(/Payment reference/), "QK12AB34CD");
    await user.click(d.getByRole("button", { name: "Submit payment" }));

    expect(await screen.findByText("Payment awaiting confirmation")).toBeInTheDocument();
    expect(api.calls("POST /subscribe")[0].body).toEqual({
      plan_id: 2,
      payment_method: "mpesa_tz",
      payment_reference: "QK12AB34CD",
    });
    expect(screen.getByText("QK12AB34CD")).toBeInTheDocument();
    // Price on the plan card + amount on the pending payment.
    expect(screen.getAllByText("TZS 50,000.00")).toHaveLength(2);
  });

  it("maps payment_reference_required to the reference field", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /plans": { plans: PLANS },
      "GET /subscription": subscription({ payment_instructions: { methods: ["mpesa_tz"], note: "", details: {} } }),
      "POST /subscribe": {
        status: 422,
        body: { status: false, code: "payment_reference_required", message: "Enter how you paid." },
      },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });

    await user.click(await screen.findByRole("button", { name: "Choose the Pro plan" }));
    const d = within(await screen.findByRole("dialog"));
    expect(d.getByText("Payment details will be sent to you by our support team.")).toBeInTheDocument();
    expect(d.getByRole("link", { name: "Contact support" })).toHaveAttribute("href", "/dashboard/support");
    await user.type(d.getByLabelText(/Payment reference/), "X1");
    await user.click(d.getByRole("button", { name: "Submit payment" }));
    expect(await d.findByText("Enter the payment reference from your receipt.")).toBeInTheDocument();
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
});
