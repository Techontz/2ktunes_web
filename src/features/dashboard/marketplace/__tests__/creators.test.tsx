import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import CreatorsPage from "../CreatorsPage";

const meta = (total: number) => ({ current_page: 1, last_page: 1, per_page: 24, total });
const filters = { platforms: ["tiktok", "instagram"], categories: ["dance", "comedy"] };

describe("CreatorsPage", () => {
  it("shows an empty state when there are no creators", async () => {
    mockApi({ "GET /creators": { creators: [], meta: meta(0), filters } });
    renderPage(<CreatorsPage />, { route: "/dashboard/creators" });
    expect(await screen.findByText("No creators found")).toBeInTheDocument();
    expect(screen.getByText(/no approved creators on 2kTunes yet/i)).toBeInTheDocument();
  });

  it("labels a creator with only self-reported metrics as Self-reported", async () => {
    const api = mockApi({
      "GET /creators": {
        creators: [
          {
            id: 7,
            slug: "zuri-dances",
            display_name: "Zuri Dances",
            avatar_url: null,
            country: "TZ",
            city: "Dar es Salaam",
            languages: ["sw"],
            categories: ["dance"],
            is_available: true,
            turnaround_days: 3,
            total_followers: 120000,
            has_verified_metrics: false,
            from_price_minor: 5000000,
            from_price_currency: "TZS",
            social_accounts: [
              {
                id: 1,
                platform: "tiktok",
                handle: "zuri",
                url: null,
                followers: 120000,
                avg_views: 30000,
                engagement_rate_bp: 450,
                audience_countries: [],
                metrics_source: "self_reported",
                verified: false,
                metrics_verified_at: null,
              },
            ],
          },
        ],
        meta: meta(1),
        filters,
      },
    });
    renderPage(<CreatorsPage />, { route: "/dashboard/creators?campaign=5" });
    expect(await screen.findByText("Zuri Dances")).toBeInTheDocument();
    expect(screen.getByText("Self-reported")).toBeInTheDocument();
    expect(screen.getByText(/TZS 50,000\.00/)).toBeInTheDocument();
    // The campaign context is carried to the creator's page.
    expect(screen.getByRole("link", { name: /Zuri Dances/ })).toHaveAttribute(
      "href",
      "/dashboard/creators/zuri-dances?campaign=5",
    );
    expect(api.unmatched).toEqual([]);
  });
});
