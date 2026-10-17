import { afterEach, describe, expect, it, vi } from "vitest";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import { checkoutRedirect, normaliseTzPhone, detectTzNetwork, type PayMethodInfo } from "@/lib/api/payments";
import type { SubscriptionInfo } from "@/lib/api/types";
import PlanPage from "../PlanPage";

const PRO = {
  id: 2, name: "Pro", price: "50000.00", currency: "TZS", price_usd: "20.00",
  prices: [{ currency: "TZS", amount: "50000.00" }, { currency: "USD", amount: "20.00" }],
  duration: 365, description: "For working artists", max_artists: 3, is_active: true, order: 2,
};

const NETWORKS = [
  { key: "mpesa", label: "M-Pesa", prefixes: ["25574", "25575", "25576"] },
  { key: "airtel", label: "Airtel Money", prefixes: ["25568", "25569", "25578"] },
  { key: "mixx", label: "Mixx by Yas", prefixes: ["25565", "25567", "25571", "25577"] },
  { key: "halopesa", label: "Halopesa", prefixes: ["25561", "25562"] },
];

function rows(cur: "TZS" | "USD", opts: { mm?: boolean; card?: boolean; paypal?: boolean } = {}): PayMethodInfo[] {
  const { mm = true, card = true, paypal = false } = opts;
  const row = (key: PayMethodInfo["key"], label: string, currencies: string[], configured: boolean): PayMethodInfo => {
    const code = !currencies.includes(cur) ? "currency_not_supported" : !configured ? "coming_soon" : null;
    return {
      key, label, currencies, configured, available: code === null, reason_code: code,
      reason: code === "currency_not_supported" ? `Available for payments in ${currencies.join(" or ")}` : code ? "Coming soon" : null,
    };
  };
  return [
    { ...row("mobile_money", "Mobile money", ["TZS"], mm), networks: NETWORKS, approval_timeout_seconds: 180 },
    row("card", "Card", ["TZS", "USD"], card),
    row("paypal", "PayPal", ["USD"], paypal),
  ];
}

function subscription(over: Partial<SubscriptionInfo> = {}, opts: Parameters<typeof rows>[1] = {}): SubscriptionInfo {
  return {
    subscription_status: "inactive",
    plan: null,
    expires_at: null,
    pending_payment: null,
    default_currency: "TZS",
    payment_instructions: {
      methods: ["mpesa_tz", "airtel_tz", "mixx_tz", "bank"],
      methods_by_currency: { TZS: ["mpesa_tz", "airtel_tz", "mixx_tz", "bank"], USD: ["bank"] },
      note: "",
      details: { mpesa_lipa_number: "123456" },
      payment_methods: { TZS: rows("TZS", opts), USD: rows("USD", opts) },
    },
    ...over,
  };
}

const quote = (cur: string, minor: number) => ({
  list_minor: minor, final_minor: minor, discount_minor: 0, currency: cur, list: "", final: "", offer: null, referral_applied: false, free_days: null,
});

const payment = (status: string, over: Record<string, unknown> = {}) => ({
  id: 41, status, method: "mobile_money", provider: "sandbox", amount: "50000.00", amount_minor: 5000000, currency: "TZS",
  plan: { id: 2, name: "Pro" }, plan_id: 2, failure_reason: null, expires_at: null, payer_phone_masked: "+255 75X XXX 456",
  network: "M-Pesa", confirmed_at: null, created_at: "2026-10-15T10:00:00Z", ...over,
});

function api(over: Record<string, unknown> = {}, sub = subscription()) {
  return mockApi({
    "GET /plans": { plans: [PRO] },
    "GET /subscription": sub,
    "POST /offers/validate": ({ body }: { body: { currency: string } }) => ({ quote: quote(body.currency, body.currency === "USD" ? 2000 : 5000000) }),
    ...over,
  });
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Choose the Pro plan" }));
  return within(await screen.findByRole("dialog"));
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("phone helpers", () => {
  it("normalises Tanzanian numbers and detects the network", () => {
    expect(normaliseTzPhone("0754 123 456")).toBe("255754123456");
    expect(normaliseTzPhone("+255 754 123 456")).toBe("255754123456");
    expect(normaliseTzPhone("754123456")).toBe("255754123456");
    expect(normaliseTzPhone("0854123456")).toBeNull();
    expect(normaliseTzPhone("12345")).toBeNull();
    expect(detectTzNetwork("068")?.label).toBe("Airtel Money");
    expect(detectTzNetwork("+255 71")?.label).toBe("Mixx by Yas");
    expect(detectTzNetwork("062")?.label).toBe("Halopesa");
    expect(detectTzNetwork("073")).toBeNull();
  });
});

describe("Pay for a plan", () => {
  it("defaults to the server currency and the toggle drives the cards and the dialog", async () => {
    const user = userEvent.setup();
    api({}, subscription({ default_currency: "USD" }));
    renderPage(<PlanPage />, { route: "/dashboard/plan" });

    const toggle = await screen.findByRole("radiogroup", { name: "Currency to pay in" });
    expect(within(toggle).getByRole("radio", { name: "USD" })).toHaveAttribute("aria-checked", "true");
    // USD 20 a year → USD 1.67 a month; TZS is the "or" price.
    expect(screen.getByText("USD 1.67")).toBeInTheDocument();
    expect(screen.getByText("or TZS 50,000")).toBeInTheDocument();

    await user.click(within(toggle).getByRole("radio", { name: "TZS" }));
    expect(screen.getByText("TZS 4,167")).toBeInTheDocument();

    const d = await openDialog(user);
    expect(d.getByRole("radio", { name: "TZS" })).toHaveAttribute("aria-checked", "true");
    expect(await d.findByTestId("amount-due")).toHaveTextContent("TZS 50,000.00");
    await user.click(d.getByRole("radio", { name: "USD" }));
    expect(d.getByTestId("amount-due")).toHaveTextContent("USD 20.00");
    // The page follows the dialog.
    expect(within(toggle).getByRole("radio", { name: "USD" })).toHaveAttribute("aria-checked", "true");
  });

  it("lists mobile money, card and PayPal per currency, with reasons", async () => {
    const user = userEvent.setup();
    api({}, subscription({}, { paypal: true }));
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    const d = await openDialog(user);

    const group = d.getByRole("group", { name: "How would you like to pay?" });
    const names = within(group).getAllByRole("radio").map((r) => (r as HTMLInputElement).value);
    expect(names).toEqual(["mobile_money", "card", "paypal"]);
    expect(d.getByRole("radio", { name: /Mobile money/ })).toBeChecked();
    // Brand marks.
    expect(d.getByText("M-Pesa")).toBeInTheDocument();
    expect(d.getByText("Halopesa")).toBeInTheDocument();
    expect(d.getByRole("img", { name: "Visa" })).toBeInTheDocument();
    expect(d.getByRole("img", { name: "Mastercard" })).toBeInTheDocument();
    expect(d.getByRole("img", { name: "PayPal" })).toBeInTheDocument();
    expect(d.getByText("Powered by Stripe")).toBeInTheDocument();
    // PayPal is USD only: in TZS it offers to switch.
    expect(d.getByText("Tap to pay in USD")).toBeInTheDocument();

    await user.click(d.getByRole("radio", { name: "USD" }));
    expect(d.getByText("Tap to pay in TZS")).toBeInTheDocument();
    expect(d.getByRole("radio", { name: /PayPal/ })).toBeEnabled();
    // Mobile money can't be used in USD: the first available method is picked instead.
    expect(d.getByRole("radio", { name: /Card/ })).toBeChecked();
    expect(d.getByRole("button", { name: "Pay USD 20.00 with card" })).toBeInTheDocument();

    // Tapping mobile money switches the payment to TZS and selects it.
    await user.click(d.getByRole("radio", { name: /Mobile money/ }));
    expect(d.getByRole("radio", { name: "TZS" })).toHaveAttribute("aria-checked", "true");
    expect(d.getByRole("radio", { name: /Mobile money/ })).toBeChecked();
    expect(d.getByLabelText(/Mobile money number/)).toBeInTheDocument();
  });

  it("shows every method as Coming soon until it is connected", async () => {
    const user = userEvent.setup();
    api({}, subscription({}, { mm: false, card: false }));
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    const d = await openDialog(user);
    expect(d.getAllByText("Coming soon")).toHaveLength(3); // mobile money, card and the button
    expect(d.getByRole("radio", { name: /Mobile money/ })).toBeDisabled();
    expect(d.getByRole("radio", { name: /Card/ })).toBeDisabled();
    expect(d.getByRole("radio", { name: /PayPal/ })).toBeDisabled();
    expect(d.getByRole("button", { name: "Coming soon" })).toBeDisabled();
    expect(d.getByText("Online payments are being connected. You will be able to pay here very soon.")).toBeInTheDocument();
    expect(d.queryByText("How to pay")).not.toBeInTheDocument();
    expect(d.queryByLabelText(/Payment reference/)).not.toBeInTheDocument();
    expect(d.queryByLabelText(/Mobile money number/)).not.toBeInTheDocument();
  });

  it("mobile money: validates the phone, waits for the PIN, then activates", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    let polls = 0;
    const m = api({
      "POST /subscribe": {
        status: 202,
        body: { status: true, subscription_status: "pending_payment", action: "await_phone_approval", redirect_url: null, payment: payment("awaiting_approval"), user: {} },
      },
      "GET /subscription/payments/:id": () => {
        polls += 1;
        return polls < 2
          ? { payment: payment("awaiting_approval") }
          : { payment: payment("confirmed"), subscription: { status: "active", expires_at: "2027-10-15T10:00:00Z" } };
      },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    const d = await openDialog(user);
    await d.findByText("Billed yearly. Covers 12 months, about TZS 4,167 a month.");

    const phone = d.getByLabelText(/Mobile money number/);
    await user.type(phone, "0854");
    await user.click(d.getByRole("button", { name: "Pay TZS 50,000.00" }));
    expect(d.getByText("Enter a Tanzanian mobile number, like 0754 123 456.")).toBeInTheDocument();
    expect(m.calls("POST /subscribe")).toHaveLength(0);

    await user.clear(phone);
    await user.type(phone, "0754 123 456");
    expect(d.getByTestId("network")).toHaveTextContent("M-Pesa");
    await user.click(d.getByRole("button", { name: "Pay TZS 50,000.00" }));

    expect(await screen.findByText("Check your phone")).toBeInTheDocument();
    expect(m.calls("POST /subscribe")[0].body).toEqual({ plan_id: 2, currency: "TZS", method: "mobile_money", phone: "255754123456" });
    expect(screen.getByText("Approve the payment of TZS 50,000.00 on +255 754 123 456. Enter your PIN to confirm.")).toBeInTheDocument();
    expect(screen.getByText("3:00")).toBeInTheDocument();

    const profileCalls = m.calls("GET /profile").length;
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(screen.getByText("Check your phone")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(await screen.findByText("You're all set!")).toBeInTheDocument();
    expect(screen.getByText(/Pro is active until/)).toBeInTheDocument();
    // The signed-in user is refreshed so upload pages unlock straight away.
    await vi.waitFor(() => expect(m.calls("GET /profile").length).toBeGreaterThan(profileCalls));
  });

  it("mobile money: a refused push opens a pop-up with the reason", async () => {
    const user = userEvent.setup();
    api({
      "POST /subscribe": {
        status: 422,
        body: {
          status: false,
          code: "insufficient_funds",
          message: "Your Halopesa balance is too low for this payment. Top up and try again.",
          details: { payment_id: 9, network: "halopesa", reason: "Insufficient funds in your Halopesa account. Please top up and try again." },
        },
      },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    const d = await openDialog(user);
    await user.type(d.getByLabelText(/Mobile money number/), "0614100097");
    await user.click(d.getByRole("button", { name: "Pay TZS 50,000.00" }));

    const pop = await screen.findByRole("alertdialog", { name: "Payment not sent" });
    expect(
      within(pop).getByText("Your Halopesa balance is too low for this payment. Top up and try again, or use another number."),
    ).toBeInTheDocument();
    expect(within(pop).getByText('Halopesa said: "Insufficient funds in your Halopesa account. Please top up and try again."')).toBeInTheDocument();

    await user.click(within(pop).getByRole("button", { name: "OK, got it" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    // The pay dialog stays open with the reason, ready to try again.
    expect(d.getByRole("button", { name: "Pay TZS 50,000.00" })).toBeInTheDocument();
  });

  it("mobile money: a declined push offers Try again, and Cancel stops waiting", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    let status = "failed";
    const m = api({
      "POST /subscribe": {
        status: 202,
        body: { status: true, subscription_status: "pending_payment", action: "await_phone_approval", payment: payment("awaiting_approval"), user: {} },
      },
      "GET /subscription/payments/:id": () => ({ payment: payment(status) }),
      "POST /subscription/payments/:id/cancel": { payment: payment("cancelled") },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    const d = await openDialog(user);
    await user.type(d.getByLabelText(/Mobile money number/), "0684123456");
    expect(d.getByTestId("network")).toHaveTextContent("Airtel Money");
    await user.click(d.getByRole("button", { name: "Pay TZS 50,000.00" }));
    await screen.findByText("Check your phone");
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(await screen.findByText("Payment not completed")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    // Back to the form with the number kept.
    expect(screen.getByLabelText(/Mobile money number/)).toHaveValue("684 123 456");

    status = "awaiting_approval";
    await user.click(screen.getByRole("button", { name: "Pay TZS 50,000.00" }));
    await screen.findByText("Check your phone");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await screen.findByRole("button", { name: "Pay TZS 50,000.00" })).toBeInTheDocument();
    expect(m.calls("POST /subscription/payments/:id/cancel")).toHaveLength(1);
  });

  it("card: sends the artist to Stripe Checkout", async () => {
    const user = userEvent.setup();
    const go = vi.spyOn(checkoutRedirect, "go").mockImplementation(() => {});
    const m = api({
      "POST /subscribe": {
        status: 202,
        body: { status: true, subscription_status: "pending_payment", action: "redirect", redirect_url: "https://checkout.stripe.com/c/pay/cs_test_1", payment: payment("processing", { method: "card" }), user: {} },
      },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan" });
    const d = await openDialog(user);
    await user.click(d.getByRole("radio", { name: /Card/ }));
    await user.click(d.getByRole("button", { name: "Pay TZS 50,000.00 with card" }));
    await vi.waitFor(() => expect(go).toHaveBeenCalledWith("https://checkout.stripe.com/c/pay/cs_test_1"));
    expect(m.calls("POST /subscribe")[0].body).toEqual({ plan_id: 2, currency: "TZS", method: "card" });
  });
});

describe("Return from checkout", () => {
  it("polls until the payment is confirmed", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let polls = 0;
    api({
      "GET /subscription/payments/:id": () => {
        polls += 1;
        return polls < 3
          ? { payment: payment("processing", { id: 7, method: "card" }) }
          : { payment: payment("confirmed", { id: 7, method: "card" }), subscription: { status: "active", expires_at: "2027-10-15T10:00:00Z" } };
      },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan?payment=7&result=success" });
    expect(await screen.findByText("Confirming your payment…")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(screen.getByText("Confirming your payment…")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(await screen.findByText("You're all set!")).toBeInTheDocument();
    expect(screen.getByText(/Pro is active until/)).toBeInTheDocument();
    expect(polls).toBe(3);
  });

  it("gives up politely after a minute", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    api({ "GET /subscription/payments/:id": { payment: payment("processing", { id: 7, method: "card" }) } });
    renderPage(<PlanPage />, { route: "/dashboard/plan?payment=7&result=success" });
    await screen.findByText("Confirming your payment…");
    await act(() => vi.advanceTimersByTimeAsync(61_000));
    expect(await screen.findByText("Your payment is being confirmed. We'll notify you.")).toBeInTheDocument();
  });

  it("captures a PayPal order first", async () => {
    const m = api({
      "POST /subscription/payments/:id/paypal-capture": {
        payment: payment("confirmed", { id: 9, method: "paypal", currency: "USD", amount_minor: 2000 }),
        subscription: { status: "active", expires_at: "2027-10-15T10:00:00Z" },
      },
    });
    renderPage(<PlanPage />, { route: "/dashboard/plan?payment=9&result=success&token=ORDER-1&PayerID=X" });
    expect(await screen.findByText("You're all set!")).toBeInTheDocument();
    expect(m.calls("POST /subscription/payments/:id/paypal-capture")).toHaveLength(1);
    expect(m.calls("POST /subscription/payments/:id/paypal-capture")[0].params.id).toBe("9");
  });

  it("says nothing was charged when the artist cancelled", async () => {
    const m = api({ "POST /subscription/payments/:id/cancel": { payment: payment("cancelled", { id: 7 }) } });
    renderPage(<PlanPage />, { route: "/dashboard/plan?payment=7&result=cancel" });
    expect(await screen.findByText("Payment cancelled")).toBeInTheDocument();
    expect(screen.getByText("You have not been charged. Choose a plan below to try again.")).toBeInTheDocument();
    await vi.waitFor(() => expect(m.calls("POST /subscription/payments/:id/cancel")).toHaveLength(1));
  });
});
