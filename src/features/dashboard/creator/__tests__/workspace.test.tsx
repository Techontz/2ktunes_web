import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import CreatorWorkspacePage from "../CreatorWorkspacePage";

const config = {
  config: {
    marketplace: {
      platforms: ["tiktok", "instagram"],
      categories: ["dance", "comedy"],
      campaign_types: ["creator_campaign"],
      currencies: ["TZS", "USD"],
      platform_fee_bp: 1500,
    },
  },
};

describe("CreatorWorkspacePage", () => {
  it("shows the start form without a profile and saves it with PUT /creator/profile", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      "GET /release-config": config,
      "GET /creator/profile": { profile: null },
      "PUT /creator/profile": ({ body }) => ({
        profile: {
          id: 1,
          slug: "zuri",
          avatar_url: null,
          status: "draft",
          review_note: null,
          total_followers: 0,
          has_verified_metrics: false,
          from_price_minor: null,
          from_price_currency: null,
          social_accounts: [],
          packages: [],
          portfolio: [],
          bio: null,
          country: null,
          city: null,
          languages: [],
          categories: [],
          turnaround_days: null,
          is_available: true,
          ...(body as object),
        },
      }),
    });
    renderPage(<CreatorWorkspacePage />, { route: "/dashboard/creator" });

    expect(await screen.findByRole("heading", { name: "Start your creator profile" })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Display name/), "Zuri");
    await user.type(screen.getByRole("combobox", { name: /^Country/ }), "tanz");
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: "Swahili" }));
    await user.click(screen.getByRole("checkbox", { name: "Dance" }));
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    await waitFor(() => expect(api.calls("PUT /creator/profile")).toHaveLength(1));
    expect(api.calls("PUT /creator/profile")[0].body).toMatchObject({
      display_name: "Zuri",
      country: "TZ",
      languages: ["sw"],
      categories: ["dance"],
      is_available: true,
    });
    // The workspace replaces the start form.
    expect(await screen.findByRole("heading", { name: "Creator workspace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeInTheDocument();
  });
});
