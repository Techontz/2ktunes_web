import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi, type MockRequest } from "@/test/api";
import { renderPage } from "@/test/render";
import type { PayoutProvider } from "@/lib/api/types";
import WalletPage from "../WalletPage";
import { META } from "./fixtures";

/* GET /payout-providers, exactly per the backend contract. */
const base = {
  country: "TZ",
  currency: "TZS",
  min_minor: 100000,
  max_minor: 500000000,
  fee_fixed_minor: 50000,
  fee_percent_bp: 0,
  is_sandbox: false,
};
const name = { key: "account_name", label: "Account holder name", type: "text", required: true, max: 120 };
const PROVIDERS: PayoutProvider[] = [
  { ...base, id: 1, code: "mpesa_tz", name: "M-Pesa", type: "mobile_money", processing: "Processed automatically.", fields: [name, { key: "account_number", label: "Phone number", type: "tel", required: true, max: 20 }] },
  { ...base, id: 2, code: "airtel_tz", name: "Airtel Money", type: "mobile_money", fields: [name, { key: "account_number", label: "Phone number", type: "tel", required: true, max: 20 }] },
  { ...base, id: 3, code: "mixx_tz", name: "Mixx by Yas", type: "mobile_money", fields: [name, { key: "account_number", label: "Phone number", type: "tel", required: true, max: 20 }] },
  {
    ...base,
    id: 4,
    code: "bank_tz",
    name: "Bank transfer (Tanzania)",
    type: "bank",
    processing: "Processed manually by 2kTunes finance within 1-2 business days.",
    fields: [
      name,
      {
        key: "bank_name",
        label: "Bank",
        type: "select",
        required: true,
        options: [
          { value: "NMB", label: "NMB Bank" },
          { value: "CRDB", label: "CRDB Bank" },
          { value: "NBC", label: "NBC" },
          { value: "other", label: "Other" },
        ],
      },
      { key: "bank_name_other", label: "Bank name", type: "text", required: false, max: 120 },
      { key: "account_number", label: "Account number", type: "text", required: true, max: 40 },
    ],
  },
  {
    ...base,
    id: 5,
    code: "bank_usd",
    name: "International bank transfer (SWIFT)",
    type: "bank_international",
    country: null,
    currency: "USD",
    min_minor: 5000,
    max_minor: 1000000,
    fee_fixed_minor: 2500,
    processing: "Processed manually by 2kTunes finance.",
    fields: [
      name,
      { key: "bank_name", label: "Bank name", type: "text", required: true, max: 120 },
      { key: "bank_country", label: "Bank country", type: "country", required: true },
      { key: "swift_code", label: "SWIFT / BIC", type: "text", required: true, max: 11, hint: "8 or 11 characters" },
      { key: "account_number", label: "IBAN or account number", type: "text", required: true, max: 34 },
      { key: "routing_number", label: "Routing number", type: "text", required: false, max: 34 },
      { key: "bank_address", label: "Bank address", type: "text", required: false, max: 255 },
      { key: "account_holder_address", label: "Account holder address", type: "text", required: true, max: 255 },
    ],
  },
  ...(["paypal", "payoneer", "wise"] as const).map((code, i) => ({
    ...base,
    id: 6 + i,
    code,
    name: code === "paypal" ? "PayPal" : code === "payoneer" ? "Payoneer" : "Wise",
    type: "wallet",
    country: null,
    currency: "USD",
    min_minor: 1000,
    max_minor: 1000000,
    fee_fixed_minor: 0,
    fee_percent_bp: 200,
    processing: "Processed manually by 2kTunes finance.",
    fields: [{ key: "account_email", label: "Account email", type: "email", required: true, max: 190 }],
  })),
];

function setup(over: Record<string, unknown> = {}) {
  const api = mockApi({
    "GET /wallet": { balances: [], open_withdrawals: [] },
    "GET /payout-methods": { methods: [] },
    "GET /payout-providers": { providers: PROVIDERS },
    "GET /withdrawals": { withdrawals: [], meta: META },
    "GET /wallet/statement": { entries: [], meta: META },
    "POST /payout-methods": ({ body }: MockRequest) => ({
      status: 201,
      body: {
        status: true,
        method: { id: 99, provider_code: "x", type: "wallet", label: null, display: "Saved", is_default: true, ...(body as object) },
      },
    }),
    ...over,
  });
  return api;
}

/** Click + paste: much faster than per-key typing for long values. */
async function fill(user: ReturnType<typeof userEvent.setup>, el: HTMLElement, text: string) {
  await user.click(el);
  await user.paste(text);
}

async function openDialog() {
  const user = userEvent.setup();
  renderPage(<WalletPage />, { route: "/dashboard/wallet?tab=methods" });
  await user.click(await screen.findByRole("tab", { name: "Payout methods" }));
  await user.click(await screen.findByRole("button", { name: "Add payout method" }));
  const dialog = await screen.findByRole("dialog");
  return { user, d: within(dialog) };
}

describe("Add payout method", () => {
  it("type → provider → dynamic fields for mobile money", async () => {
    const api = setup();
    const { user, d } = await openDialog();

    // Step 1: one card per type that has providers, plus the honest notes.
    for (const label of ["Mobile money", "Local bank (Tanzania)", "International bank (SWIFT)", "PayPal / Payoneer / Wise"]) {
      expect(d.getByRole("radio", { name: new RegExp(label.replace(/[()/]/g, ".")) })).toBeInTheDocument();
    }
    expect(d.getByText(/Card payouts aren’t available/)).toBeInTheDocument();
    expect(d.getByText("Withdrawals are processed by the 2kTunes finance team.")).toBeInTheDocument();
    expect(d.getAllByText(/International methods are paid in USD at the exchange rate shown/).length).toBeGreaterThan(0);

    await user.click(d.getByRole("radio", { name: /Mobile money/ }));
    await user.click(d.getByRole("button", { name: "Continue" }));

    // Step 2: three mobile money providers.
    expect(d.getByRole("group", { name: "Choose a provider" })).toBeInTheDocument();
    await user.click(d.getByRole("radio", { name: /M-Pesa/ }));
    await user.click(d.getByRole("button", { name: "Continue" }));

    // Step 3: fields from the schema, translated labels, phone hint.
    const phone = d.getByLabelText(/Mobile money number/);
    expect(phone).toHaveAttribute("type", "tel");
    expect(d.getByText(/0754 123 456/)).toBeInTheDocument();
    await fill(user, d.getByLabelText(/Account holder name/), "Neema Said");
    await fill(user, phone, "0754123456");
    await fill(user, d.getByLabelText(/Current password/), "secret-pass");
    await user.click(d.getByRole("button", { name: "Save payout method" }));

    await waitFor(() => expect(api.calls("POST /payout-methods")).toHaveLength(1));
    expect(api.calls("POST /payout-methods")[0].body).toEqual({
      payout_provider_id: 1,
      account_name: "Neema Said",
      account_number: "0754123456",
      label: null,
      is_default: true,
      current_password: "secret-pass",
    });
  });

  it("local bank: choosing “Other bank” requires bank_name_other", async () => {
    const api = setup();
    const { user, d } = await openDialog();
    await user.click(d.getByRole("radio", { name: /Local bank/ }));
    await user.click(d.getByRole("button", { name: "Continue" }));

    // Single provider in the type → straight to its form.
    const bank = d.getByLabelText(/^Bank name/);
    expect(within(bank).getByRole("option", { name: "CRDB Bank" })).toBeInTheDocument();
    expect(d.queryByLabelText(/Other bank’s name/)).not.toBeInTheDocument();
    await user.selectOptions(bank, "other");
    expect(within(bank).getByRole("option", { name: "Other bank" })).toBeInTheDocument();

    await fill(user, d.getByLabelText(/Account holder name/), "Neema Said");
    await fill(user, d.getByLabelText(/Account number/), "0150123456");
    await fill(user, d.getByLabelText(/Current password/), "pw-123456");
    await user.click(d.getByRole("button", { name: "Save payout method" }));
    expect(d.getByText("This field is required.")).toBeInTheDocument();
    expect(api.calls("POST /payout-methods")).toHaveLength(0);

    await fill(user, d.getByLabelText(/Other bank’s name/), "Azania Bank");
    await user.click(d.getByRole("button", { name: "Save payout method" }));
    await waitFor(() => expect(api.calls("POST /payout-methods")).toHaveLength(1));
    expect(api.calls("POST /payout-methods")[0].body).toMatchObject({
      payout_provider_id: 4,
      bank_name: "other",
      bank_name_other: "Azania Bank",
      account_number: "0150123456",
    });
  });

  it("SWIFT: renders every field, a country picker, and posts ISO + upper-case SWIFT", async () => {
    const api = setup();
    const { user, d } = await openDialog();
    await user.click(d.getByRole("radio", { name: /International bank/ }));
    await user.click(d.getByRole("button", { name: "Continue" }));

    expect(d.getByText(/paid in USD at the exchange rate shown/)).toBeInTheDocument();
    for (const label of [/Account holder name/, /^Bank name/, /SWIFT \/ BIC code/, /IBAN or account number/, /Routing \/ sort code/, /^Bank address/, /Account holder address/]) {
      expect(d.getByLabelText(label)).toBeInTheDocument();
    }
    await fill(user, d.getByLabelText(/Account holder name/), "Neema Said");
    await fill(user, d.getByLabelText(/^Bank name/), "Barclays");
    await user.type(d.getByRole("combobox", { name: /Bank country/ }), "United King");
    await user.keyboard("{Enter}");
    await fill(user, d.getByLabelText(/SWIFT \/ BIC code/), "barcgb22");
    await fill(user, d.getByLabelText(/IBAN or account number/), "GB33BUKB20201555555555");
    await fill(user, d.getByLabelText(/Account holder address/), "1 Uhuru St, Dar es Salaam");
    await fill(user, d.getByLabelText(/Current password/), "pw-123456");
    await user.click(d.getByRole("button", { name: "Save payout method" }));

    await waitFor(() => expect(api.calls("POST /payout-methods")).toHaveLength(1));
    const body = api.calls("POST /payout-methods")[0].body as Record<string, unknown>;
    expect(body).toMatchObject({
      payout_provider_id: 5,
      account_name: "Neema Said",
      bank_name: "Barclays",
      bank_country: "GB",
      swift_code: "BARCGB22",
      account_number: "GB33BUKB20201555555555",
      account_holder_address: "1 Uhuru St, Dar es Salaam",
    });
    expect(body).not.toHaveProperty("routing_number");
  });

  it("PayPal: picks the wallet provider and validates the email", async () => {
    const api = setup();
    const { user, d } = await openDialog();
    await user.click(d.getByRole("radio", { name: /PayPal \/ Payoneer \/ Wise/ }));
    await user.click(d.getByRole("button", { name: "Continue" }));
    await user.click(d.getByRole("radio", { name: /PayPal/ }));
    await user.click(d.getByRole("button", { name: "Continue" }));

    const email = d.getByLabelText(/Account email/);
    expect(email).toHaveAttribute("type", "email");
    await fill(user, email, "not-an-email");
    await fill(user, d.getByLabelText(/Current password/), "pw-123456");
    await user.click(d.getByRole("button", { name: "Save payout method" }));
    expect(d.getByText(/Enter a valid email address/)).toBeInTheDocument();

    await user.clear(email);
    await fill(user, email, "neema@example.com");
    await user.click(d.getByRole("button", { name: "Save payout method" }));
    await waitFor(() => expect(api.calls("POST /payout-methods")).toHaveLength(1));
    expect(api.calls("POST /payout-methods")[0].body).toMatchObject({ payout_provider_id: 6, account_email: "neema@example.com" });
  });

  it("shows server validation errors inline per field", async () => {
    setup({
      "POST /payout-methods": {
        status: 422,
        body: {
          status: false,
          code: "validation_failed",
          message: "The given data was invalid.",
          errors: { account_email: ["This PayPal account can't receive payments."] },
        },
      },
    });
    const { user, d } = await openDialog();
    await user.click(d.getByRole("radio", { name: /PayPal \/ Payoneer \/ Wise/ }));
    await user.click(d.getByRole("button", { name: "Continue" }));
    await user.click(d.getByRole("radio", { name: /Wise/ }));
    await user.click(d.getByRole("button", { name: "Continue" }));
    await fill(user, d.getByLabelText(/Account email/), "neema@example.com");
    await fill(user, d.getByLabelText(/Current password/), "pw-123456");
    await user.click(d.getByRole("button", { name: "Save payout method" }));

    const email = d.getByLabelText(/Account email/);
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(d.getByText("This PayPal account can't receive payments.")).toBeInTheDocument();
    expect(d.getByText("Check the highlighted fields.")).toBeInTheDocument();
  });

  it("lists saved methods by their display string and type", async () => {
    setup({
      "GET /payout-methods": {
        methods: [
          { id: 1, provider_code: "bank_usd", type: "bank_international", label: null, display: "Barclays •••• 5555", is_default: true },
          { id: 2, provider_code: "paypal", type: "wallet", label: "Main PayPal", display: "PayPal · n•••@example.com", is_default: false },
        ],
      },
    });
    const user = userEvent.setup();
    renderPage(<WalletPage />, { route: "/dashboard/wallet" });
    await user.click(await screen.findByRole("tab", { name: "Payout methods" }));
    expect(await screen.findByText("Barclays •••• 5555")).toBeInTheDocument();
    expect(screen.getByText("PayPal · n•••@example.com")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "International bank transfer (SWIFT)" })).toBeInTheDocument();
    expect(screen.getByText(/International bank \(SWIFT\) · USD/)).toBeInTheDocument();
  });

  it("speaks French", async () => {
    setup();
    const user = userEvent.setup();
    renderPage(<WalletPage />, { route: "/dashboard/wallet", language: "FR" });
    await user.click(await screen.findByRole("tab", { name: /paiement/i }));
    const add = await screen.findAllByRole("button", { name: /Ajouter/ });
    await user.click(add[0]);
    const d = within(await screen.findByRole("dialog"));
    expect(d.getByRole("radio", { name: /Banque internationale \(SWIFT\)/ })).toBeInTheDocument();
  });
});
