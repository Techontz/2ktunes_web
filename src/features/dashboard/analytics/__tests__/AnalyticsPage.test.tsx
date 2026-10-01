import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import type { Analytics } from "@/lib/api/types";
import AnalyticsPage from "../AnalyticsPage";

const META = { current_page: 1, last_page: 1, per_page: 100, total: 0 };
const SUMMARY = { drafts: 0, in_review: 0, distributing: 0, live: 0, inactive: 0, all: 0 };

function analytics(over: Partial<Analytics> = {}): Analytics {
  return {
    range: { from: "2025-10-01", to: "2026-10-01" },
    has_data: false,
    totals: { revenue: [], streams: 0, downloads: 0, video_uses: 0 },
    by_month: [],
    top_releases: [],
    top_tracks: [],
    top_stores: [],
    top_territories: [],
    by_usage: [],
    smart_links: {
      views: 0,
      unique_visitors: 0,
      clicks: 0,
      presaves: 0,
      by_day: [],
      by_store: [],
      by_country: [],
      by_device: [],
      by_referrer: [],
    },
    campaigns: { active_orders: 0, completed_orders: 0 },
    ...over,
  };
}

describe("AnalyticsPage", () => {
  it("shows an honest empty state and no numbers when has_data is false", async () => {
    const api = mockApi({
      "GET /releases": { releases: [], meta: META, summary: SUMMARY },
      "GET /analytics": { analytics: analytics() },
    });
    renderPage(<AnalyticsPage />, { route: "/dashboard/analytics" });

    expect(await screen.findByText("No store data for this period yet")).toBeInTheDocument();
    expect(screen.queryByText("Streams")).not.toBeInTheDocument();
    expect(screen.queryByText("Downloads")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Smart links" })).not.toBeInTheDocument();
    expect(screen.queryByText(/TZS|USD/)).not.toBeInTheDocument();
    expect(api.calls("GET /analytics")[0].query.get("range")).toBe("12m");
  });

  it("still shows smart-link activity without store data, and refetches per range", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      "GET /releases": { releases: [], meta: META, summary: SUMMARY },
      "GET /analytics": {
        analytics: analytics({
          smart_links: {
            views: 42,
            unique_visitors: 30,
            clicks: 12,
            presaves: 0,
            by_day: [],
            by_store: [{ label: "spotify", n: 9 }],
            by_country: [{ label: "TZ", n: 40 }],
            by_device: [],
            by_referrer: [],
          },
        }),
      },
    });
    renderPage(<AnalyticsPage />, { route: "/dashboard/analytics" });

    const links = await screen.findByRole("region", { name: "Smart links" });
    expect(within(links).getByText("42")).toBeInTheDocument();
    expect(within(links).getByText("Spotify")).toBeInTheDocument();
    expect(screen.getByText("No store data for this period yet")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "30 days" }));
    await screen.findAllByText("No store data for this period yet");
    expect(api.calls("GET /analytics").at(-1)?.query.get("range")).toBe("30d");
  });

  it("renders totals, a monthly chart and top lists from real API numbers", async () => {
    mockApi({
      "GET /releases": { releases: [], meta: META, summary: SUMMARY },
      "GET /analytics": {
        analytics: analytics({
          has_data: true,
          totals: { revenue: [{ currency: "TZS", revenue_minor: 1234500 }], streams: 5400, downloads: 3, video_uses: 7 },
          by_month: [
            { month: "2026-07", currency: "TZS", revenue_minor: 1000000, streams: 4000 },
            { month: "2026-08", currency: "TZS", revenue_minor: 234500, streams: 1400 },
          ],
          top_territories: [{ label: "TZ", currency: "TZS", revenue_minor: 1234500, units: 5400 }],
        }),
      },
    });
    renderPage(<AnalyticsPage />, { route: "/dashboard/analytics" });

    expect(await screen.findByText("Revenue (TZS)")).toBeInTheDocument();
    expect(screen.getByText("5,400")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Monthly revenue and streams in TZS" })).toBeInTheDocument();
    expect(screen.getByText("Tanzania")).toBeInTheDocument();
  });
});
