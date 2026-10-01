import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { mockApi } from "@/test/api";
import { makeRelease } from "@/test/fixtures";
import { renderPage } from "@/test/render";
import OverviewPage from "../OverviewPage";

const emptyDashboard = {
  balances: [],
  release_counts: {},
  recent_releases: [],
  analytics: { has_data: false, streams: 0, video_uses: 0, top_release: null, top_territory: null, top_store: null, by_month: [] },
  active_orders: 0,
  open_tickets: 0,
  unread_notifications: 0,
  action_items: [],
};

describe("OverviewPage", () => {
  it("shows honest empty states for a new account — no invented numbers", async () => {
    mockApi({ "GET /dashboard": emptyDashboard });
    renderPage(<OverviewPage />);
    expect(await screen.findByText("No earnings yet")).toBeInTheDocument();
    expect(screen.getByText("No releases yet")).toBeInTheDocument();
    expect(screen.getByText("No performance data yet")).toBeInTheDocument();
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
    expect(screen.queryByText(/Streams \(12 months\)/)).not.toBeInTheDocument();
  });

  it("renders balances, counts, recent releases and action items from the API", async () => {
    mockApi({
      "GET /dashboard": {
        ...emptyDashboard,
        balances: [{ currency: "TZS", available_minor: 2500000, held_minor: 100000, pending_minor: 0, lifetime_earnings_minor: 0, withdrawn_minor: 0 }],
        release_counts: { draft: 2, changes_requested: 1, live: 3 },
        recent_releases: [makeRelease({ id: 9, release_title: "Upepo", status: "live" })],
        action_items: [{ type: "changes_requested", message: '"Upepo" needs changes before it can go out.', path: "/dashboard/music/9" }],
        unread_notifications: 4,
      },
    });
    renderPage(<OverviewPage />);
    expect(await screen.findByText("TZS 25,000.00")).toBeInTheDocument();
    expect(screen.getByText(/TZS 1,000\.00 in withdrawal/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Drafts\s*3/ })).toHaveAttribute("href", "/dashboard/music?status=drafts");
    expect(screen.getByRole("link", { name: /Upepo.*needs changes/ })).toHaveAttribute("href", "/dashboard/music/9");
    expect(screen.getByRole("link", { name: /Unread notifications\s*4/ })).toBeInTheDocument();
  });

  it("speaks Swahili", async () => {
    mockApi({ "GET /dashboard": emptyDashboard });
    renderPage(<OverviewPage />, { language: "SW" });
    expect(await screen.findByText("Bado hakuna mapato")).toBeInTheDocument();
  });
});
