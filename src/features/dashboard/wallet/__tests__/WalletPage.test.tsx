import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi, type MockRequest } from "@/test/api";
import { renderPage } from "@/test/render";
import WalletPage from "../WalletPage";
import { META, balance, method, provider, quoteFor, withdrawal } from "./fixtures";

const route = { route: "/dashboard/wallet" };

function baseHandlers(over: Record<string, unknown> = {}) {
  return {
    "GET /wallet": { balances: [], open_withdrawals: [] },
    "GET /payout-methods": { methods: [] },
    "GET /payout-providers": { providers: [] },
    "GET /withdrawals": { withdrawals: [], meta: META },
    "GET /wallet/statement": { entries: [], meta: META },
    ...over,
  };
}

describe("WalletPage", () => {
  it("shows honest empty states when there is no money or history", async () => {
    const user = userEvent.setup();
    const api = mockApi(baseHandlers());
    renderPage(<WalletPage />, route);

    expect(await screen.findByRole("heading", { level: 1, name: "Wallet" })).toBeInTheDocument();
    expect(screen.getByText("No balance yet")).toBeInTheDocument();
    expect(await screen.findByText("No withdrawals yet")).toBeInTheDocument();
    // No balance → no withdraw button.
    expect(screen.queryByRole("button", { name: "Withdraw" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Statement" }));
    expect(await screen.findByText("No transactions yet")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Payout methods" }));
    expect(await screen.findByText("No payout method yet")).toBeInTheDocument();
    expect(api.unmatched).toEqual([]);
  });

  it("labels a sandbox withdrawal and only offers cancel while requested", async () => {
    mockApi(
      baseHandlers({
        "GET /wallet": {
          balances: [balance({ available_minor: 100000, held_minor: 2500000 })],
          open_withdrawals: [withdrawal({ is_sandbox: true })],
        },
        "GET /withdrawals": {
          withdrawals: [withdrawal({ is_sandbox: true }), withdrawal({ id: 12, reference: "WD2", status: "completed" })],
          meta: META,
        },
      }),
    );
    renderPage(<WalletPage />, route);

    const open = await screen.findByRole("region", { name: "Withdrawals in progress" });
    expect(within(open).getAllByText("Sandbox").length).toBeGreaterThan(0);
    expect(within(open).getAllByRole("button", { name: "Cancel withdrawal" }).length).toBeGreaterThan(0);
    // Two tables (open + history) each render desktop + mobile; only `requested` rows get cancel.
    await screen.findAllByText("WD2");
    expect(screen.getAllByRole("button", { name: "Cancel withdrawal" })).toHaveLength(4);
  });
});

describe("Withdraw flow — idempotency", () => {
  it("reuses the key across retries of one attempt and mints a new one when the amount changes", async () => {
    const user = userEvent.setup();
    let posts = 0;
    const api = mockApi(
      baseHandlers({
        "GET /wallet": { balances: [balance({ available_minor: 10000000 })], open_withdrawals: [] },
        "GET /payout-methods": { methods: [method()] },
        "GET /payout-providers": { providers: [provider()] },
        "POST /withdrawals/quote": ({ body }: MockRequest) => {
          const amount = (body as { amount: string }).amount;
          return { quote: quoteFor(Math.round(Number(amount) * 100)) };
        },
        "POST /withdrawals": () => {
          posts += 1;
          if (posts === 1) return { status: 500, body: { status: false, code: "server_error", message: "boom" } };
          if (posts === 2)
            return { status: 422, body: { status: false, code: "password_incorrect", message: "Your password is incorrect." } };
          return { withdrawal: withdrawal() };
        },
      }),
    );
    renderPage(<WalletPage />, route);

    await user.click(await screen.findByRole("button", { name: "Withdraw" }));
    const dialog = await screen.findByRole("dialog");
    const d = within(dialog);

    await user.type(d.getByLabelText("Amount"), "25000");
    await user.click(d.getByRole("button", { name: "Review withdrawal" }));
    await user.click(await d.findByRole("button", { name: "Continue" }));
    expect(api.calls("POST /withdrawals/quote")[0].body).toMatchObject({ amount: "25000.00", currency: "TZS", payout_method_id: 3 });

    // Attempt 1, try 1: server error.
    await user.type(d.getByLabelText("Current password"), "secret-pass");
    await user.click(d.getByRole("button", { name: "Withdraw" }));
    expect(await d.findByText(/server had a problem/i)).toBeInTheDocument();

    // Attempt 1, try 2: wrong password — same key.
    await user.click(d.getByRole("button", { name: "Withdraw" }));
    expect(await d.findByText("That password is incorrect.")).toBeInTheDocument();

    const calls = () => api.calls("POST /withdrawals").map((c) => (c.body as { idempotency_key: string }).idempotency_key);
    expect(calls()).toHaveLength(2);
    expect(calls()[0]).toMatch(/^wd-/);
    expect(calls()[1]).toBe(calls()[0]);

    // Change the amount → new quote → new attempt → new key.
    await user.click(d.getByRole("button", { name: "Change details" }));
    const amount = d.getByLabelText("Amount");
    await user.clear(amount);
    await user.type(amount, "30000");
    await user.click(d.getByRole("button", { name: "Review withdrawal" }));
    await user.click(await d.findByRole("button", { name: "Continue" }));
    await user.type(d.getByLabelText("Current password"), "right-pass");
    await user.click(d.getByRole("button", { name: "Withdraw" }));

    expect(await screen.findByText("Withdrawal requested")).toBeInTheDocument();
    await waitFor(() => expect(calls()).toHaveLength(3));
    expect(calls()[2]).not.toBe(calls()[0]);
    expect(api.calls("POST /withdrawals")[2].body).toMatchObject({
      amount: "30000.00",
      currency: "TZS",
      payout_method_id: 3,
      current_password: "right-pass",
    });
  });
});
