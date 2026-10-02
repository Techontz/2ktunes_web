import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Order } from "@/lib/api/types";
import { makeOrder } from "@/test/orders";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import OrderDetailPage from "../OrderDetailPage";

const wallet = (available: number) => ({
  balances: [{ currency: "TZS", available_minor: available, held_minor: 0, pending_minor: 0, lifetime_earnings_minor: 0, withdrawn_minor: 0 }],
  open_withdrawals: [],
});

const open = (order: Order, extra: Parameters<typeof mockApi>[0] = {}) => {
  const api = mockApi({ "GET /orders/:id": { order }, ...extra });
  renderPage(<OrderDetailPage />, { route: `/dashboard/orders/${order.id}`, path: "/dashboard/orders/:id" });
  return api;
};

describe("OrderDetailPage (artist)", () => {
  it("shows the pay-by deadline, the timeline and the actions for an accepted request", async () => {
    open(makeOrder());
    expect(await screen.findByRole("button", { name: "Pay now" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel request" })).toBeInTheDocument();
    expect(screen.getByText(/^Pay by /)).toBeInTheDocument();
    const timeline = screen.getByRole("heading", { name: "Timeline" }).closest("section")!;
    expect(within(timeline).getByText("With the creator")).toBeInTheDocument();
    // People's notes show; system boilerplate does not.
    expect(within(timeline).getByText("Posting Friday")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
  });

  it("pays from the wallet, showing the balance first", async () => {
    const user = userEvent.setup();
    const api = open(makeOrder(), {
      "GET /wallet": wallet(25_000_000),
      "POST /orders/:id/pay": ({ body }) => ({ message: "Paid", order: makeOrder({ status: "in_progress", ...(body as object) }) }),
    });
    await user.click(await screen.findByRole("button", { name: "Pay now" }));
    const d = within(await screen.findByRole("dialog"));
    expect(await d.findByText("TZS 250,000.00")).toBeInTheDocument();
    await user.click(d.getByRole("button", { name: "Pay from wallet" }));
    await vi.waitFor(() => expect(api.calls("POST /orders/:id/pay")).toHaveLength(1));
    expect(api.calls("POST /orders/:id/pay")[0].body).toEqual({ method: "wallet" });
    expect(await screen.findByText("Paid. The creator can start now.")).toBeInTheDocument();
  });

  it("blocks a wallet payment the balance can't cover", async () => {
    const user = userEvent.setup();
    open(makeOrder(), { "GET /wallet": wallet(100) });
    await user.click(await screen.findByRole("button", { name: "Pay now" }));
    const d = within(await screen.findByRole("dialog"));
    expect(await d.findByText(/balance is too low/)).toBeInTheDocument();
    expect(d.getByRole("button", { name: "Pay from wallet" })).toBeDisabled();
  });

  it("submits a manual mobile money reference", async () => {
    const user = userEvent.setup();
    const api = open(makeOrder(), {
      "GET /wallet": wallet(0),
      "GET /subscription": {
        subscription_status: "active",
        plan: null,
        expires_at: null,
        pending_payment: null,
        payment_instructions: { methods: ["mpesa_tz"], note: "", details: { mpesa_lipa_number: "555123" } },
      },
      "POST /orders/:id/pay": {
        status: 202,
        body: { status: true, message: "Payment reference received.", order: makeOrder({ payment: { method: "mpesa_tz", paid_at: null, manual_reference_submitted: true } }) },
      },
    });
    await user.click(await screen.findByRole("button", { name: "Pay now" }));
    const d = within(await screen.findByRole("dialog"));
    await user.click(d.getByRole("radio", { name: /Mobile money or bank/ }));
    expect(await d.findByText("555123")).toBeInTheDocument();
    await user.click(d.getByRole("button", { name: "Send reference" }));
    expect(d.getByText("Choose how you paid.")).toBeInTheDocument();
    await user.selectOptions(d.getByLabelText(/Payment method/, { selector: "select" }), "mpesa_tz");
    await user.type(d.getByLabelText(/Transaction reference/), "QK12AB34CD");
    await user.click(d.getByRole("button", { name: "Send reference" }));
    await vi.waitFor(() => expect(api.calls("POST /orders/:id/pay")).toHaveLength(1));
    expect(api.calls("POST /orders/:id/pay")[0].body).toEqual({
      method: "manual",
      payment_method: "mpesa_tz",
      payment_reference: "QK12AB34CD",
    });
    expect(await screen.findByText("Reference received")).toBeInTheDocument();
  });

  it("cancels an unpaid request", async () => {
    const user = userEvent.setup();
    const api = open(makeOrder(), { "POST /orders/:id/cancel": { order: makeOrder({ status: "cancelled", can: {} }) } });
    await user.click(await screen.findByRole("button", { name: "Cancel request" }));
    const d = within(await screen.findByRole("alertdialog"));
    await user.click(d.getByRole("button", { name: "Cancel request" }));
    await vi.waitFor(() => expect(api.calls("POST /orders/:id/cancel")).toHaveLength(1));
  });

  it("shows the delivered post links and redacted messages once submitted", async () => {
    open(
      makeOrder({
        status: "submitted",
        submission_urls: ["https://www.tiktok.com/@x/video/1", "https://www.instagram.com/reel/2"],
        submission_notes: "Posted at 7pm",
        payment: { method: "wallet", paid_at: "2026-10-03T09:00:00Z", manual_reference_submitted: false },
        can: { cancel: false, pay: false, dispute: true, message: true },
        messages: [
          { id: 9, body: "Call me on [contact details removed]", is_system: false, was_redacted: true, author: "creator", mine: false, created_at: "2026-10-04T09:00:00Z" },
        ],
      }),
    );
    expect(await screen.findByText("Delivered, being verified")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Post 1/ })).toHaveAttribute("href", "https://www.tiktok.com/@x/video/1");
    expect(screen.getByRole("link", { name: /Post 2/ })).toBeInTheDocument();
    expect(screen.getByText("Contact details removed")).toBeInTheDocument();
    expect(screen.getByText(/Contact details are removed automatically/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open a dispute" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pay now" })).not.toBeInTheDocument();
  });

  it("shows no actions on a completed order", async () => {
    open(makeOrder({ status: "completed", can: {} }));
    expect(await screen.findByText(/Nothing for you to do/)).toBeInTheDocument();
    for (const name of ["Pay now", "Cancel request", "Open a dispute", "Accept", "Decline", "Submit post links"]) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
  });
});

describe("OrderDetailPage (creator)", () => {
  const creatorOrder = (over: Partial<Order> = {}) =>
    makeOrder({
      role: "creator",
      status: "forwarded",
      platform_fee_minor: 1_500_000,
      creator_payout_minor: 8_500_000,
      artist: { display_name: "Zuri Mwangi" },
      respond_by: "2026-10-04T09:00:00Z",
      pay_by: null,
      can: { accept: true, decline: true, message: true },
      ...over,
    });

  it("accepts with an optional note", async () => {
    const user = userEvent.setup();
    const api = open(creatorOrder(), { "POST /orders/:id/accept": { order: creatorOrder({ status: "awaiting_payment", can: {} }) } });
    expect(await screen.findByText("Your payout")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Accept" }));
    const d = within(await screen.findByRole("alertdialog"));
    await user.type(d.getByLabelText(/Note to the artist/), "Posting Friday");
    await user.click(d.getByRole("button", { name: "Accept" }));
    await vi.waitFor(() => expect(api.calls("POST /orders/:id/accept")).toHaveLength(1));
    expect(api.calls("POST /orders/:id/accept")[0].body).toEqual({ note: "Posting Friday" });
  });

  it("declines with a reason", async () => {
    const user = userEvent.setup();
    const api = open(creatorOrder(), { "POST /orders/:id/decline": { order: creatorOrder({ status: "declined", can: {} }) } });
    await user.click(await screen.findByRole("button", { name: "Decline" }));
    const d = within(await screen.findByRole("alertdialog"));
    await user.type(d.getByLabelText(/Reason/), "Fully booked this week");
    await user.click(d.getByRole("button", { name: "Decline" }));
    await vi.waitFor(() => expect(api.calls("POST /orders/:id/decline")).toHaveLength(1));
    expect(api.calls("POST /orders/:id/decline")[0].body).toEqual({ reason: "Fully booked this week" });
  });

  it("submits several post links with notes, and shows a fix request", async () => {
    const user = userEvent.setup();
    const order = creatorOrder({ status: "in_progress", fix_note: "Use the chorus, not the intro", can: { submit: true, dispute: true, message: true } });
    const api = open(order, { "POST /orders/:id/submit": { order: creatorOrder({ status: "submitted", can: {} }) } });
    expect((await screen.findAllByText("Use the chorus, not the intro")).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Submit post links" }));
    const d = within(await screen.findByRole("dialog"));
    await user.type(d.getByLabelText(/Post link 1/), "not a link");
    await user.click(d.getByRole("button", { name: "Submit post links" }));
    expect(d.getByText(/starting with https/)).toBeInTheDocument();
    await user.clear(d.getByLabelText(/Post link 1/));
    await user.type(d.getByLabelText(/Post link 1/), "https://www.tiktok.com/@dada/video/1");
    await user.click(d.getByRole("button", { name: "Add another link" }));
    await user.type(d.getByLabelText(/Post link 2/), "https://www.instagram.com/reel/abc");
    await user.type(d.getByLabelText(/Notes for 2kTunes/), "Both live");
    await user.click(d.getByRole("button", { name: "Submit post links" }));
    await vi.waitFor(() => expect(api.calls("POST /orders/:id/submit")).toHaveLength(1));
    expect(api.calls("POST /orders/:id/submit")[0].body).toEqual({
      urls: ["https://www.tiktok.com/@dada/video/1", "https://www.instagram.com/reel/abc"],
      notes: "Both live",
    });
  });
});
