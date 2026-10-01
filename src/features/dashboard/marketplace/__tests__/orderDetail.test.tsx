import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import type { Order } from "@/lib/api/types";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import OrderDetailPage from "../OrderDetailPage";

function makeOrder(over: Partial<Order> = {}): Order {
  return {
    id: 42,
    reference: "OR261001ABCDEF",
    title: "TikTok video · Zuri Dances",
    status: "pending_payment",
    role: "buyer",
    price_minor: 5000000,
    currency: "TZS",
    platform_fee_minor: 750000,
    creator_payout_minor: 4250000,
    creator: { id: 7, display_name: "Zuri Dances", slug: "zuri-dances", avatar_url: null },
    service: null,
    campaign_id: 3,
    brief: "Dance to the chorus.",
    submission_url: null,
    submission_notes: null,
    revision_count: 0,
    due_at: "2026-10-10T00:00:00Z",
    paid_at: null,
    accepted_at: null,
    submitted_at: null,
    completed_at: null,
    created_at: "2026-10-01T08:00:00Z",
    release: null,
    track: null,
    messages: [
      { id: 1, body: "Order created.", is_system: true, author: null, mine: false, created_at: "2026-10-01T08:00:00Z" },
    ],
    disputes: [],
    ...over,
  };
}

const render = (order: Order) => {
  mockApi({ "GET /orders/:id": { order } });
  renderPage(<OrderDetailPage />, { route: `/dashboard/orders/${order.id}`, path: "/dashboard/orders/:id" });
};

describe("OrderDetailPage", () => {
  it("offers Pay from wallet to the buyer of an unpaid order", async () => {
    render(makeOrder());
    expect(await screen.findByRole("button", { name: "Pay from wallet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel order" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept order" })).not.toBeInTheDocument();
  });

  it("offers Accept and Decline (and no Pay) to the creator of an awaiting order", async () => {
    render(makeOrder({ role: "creator", status: "awaiting_creator", paid_at: "2026-10-01T09:00:00Z" }));
    expect(await screen.findByRole("button", { name: "Accept order" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decline" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pay from wallet" })).not.toBeInTheDocument();
    // Creator sees their payout and the platform fee.
    expect(screen.getByText("Your payout")).toBeInTheDocument();
  });

  it("shows no action buttons on a completed order", async () => {
    render(makeOrder({ status: "completed", completed_at: "2026-10-05T09:00:00Z" }));
    expect(await screen.findByText(/nothing for you to do/i)).toBeInTheDocument();
    for (const name of [
      "Pay from wallet",
      "Cancel order",
      "Accept delivery",
      "Request a revision",
      "Open a dispute",
      "Accept order",
      "Decline",
      "Submit work",
    ]) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
  });
});
