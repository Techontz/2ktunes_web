import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CreatorProfile } from "@/lib/api/types";
import { mockApi } from "@/test/api";
import { makeRelease, makeTrack } from "@/test/fixtures";
import { makeOrder } from "@/test/orders";
import { renderPage } from "@/test/render";
import CreatorDetailPage from "../CreatorDetailPage";

const creator: CreatorProfile = {
  id: 4,
  slug: "dada-dance",
  display_name: "Dada Dance",
  avatar_url: null,
  country: "TZ",
  city: "Arusha",
  languages: ["sw"],
  categories: ["dance"],
  is_available: true,
  turnaround_days: 3,
  total_followers: 150000,
  has_verified_metrics: false,
  from_price_minor: 10_000_000,
  from_price_currency: "TZS",
  // Artist-facing: handles and URLs are always null.
  social_accounts: [
    { id: 1, platform: "tiktok", handle: null as unknown as string, url: null, followers: 150000, avg_views: 40000, engagement_rate_bp: 800, audience_countries: [], metrics_source: "self_reported", verified: false },
  ],
  bio: "Dance creator.",
  status: "approved",
  review_note: null,
  packages: [
    { id: 12, title: "TikTok dance video", platform: "tiktok", description: "A 30 second dance.", deliverable: "1 TikTok post", price_minor: 10_000_000, currency: "TZS", turnaround_days: 3, is_active: true },
  ],
  portfolio: [],
};

function setup() {
  const releases = [makeRelease({ id: 34, release_title: "Bahari", artist_name: "Zuri" })];
  const api = mockApi({
    "GET /creators/:slug": { creator },
    "GET /releases": { releases, meta: { current_page: 1, last_page: 1, per_page: 100, total: 1 }, summary: {} },
    "GET /releases/:id": { release: makeRelease({ id: 34, tracks: [makeTrack({ id: 56, title: "Bahari", track_number: 1 }), makeTrack({ id: 57, title: "Pwani", track_number: 2 })] }) },
    "GET /release-config": { config: { marketplace: { platform_fee_bp: 1500 } } },
    "POST /creator-requests": { order: makeOrder({ status: "requested" }) },
    "GET /orders/:id": { order: makeOrder({ status: "requested" }) },
  });
  renderPage(<CreatorDetailPage />, { route: "/dashboard/creators/dada-dance", path: "/dashboard/creators/:slug" });
  return api;
}

describe("Creator profile and request form", () => {
  it("shows packages with prices before requesting, and no handles or contact links", async () => {
    setup();
    expect(await screen.findByRole("heading", { name: "TikTok dance video" })).toBeInTheDocument();
    expect(screen.getAllByText("TZS 100,000.00").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Request this creator/ })).toBeInTheDocument();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    expect(screen.getByText(/Handles and links stay private/)).toBeInTheDocument();
  });

  it("requests with one of my releases and a track", async () => {
    const user = userEvent.setup();
    const api = setup();
    await user.click(await screen.findByRole("button", { name: /Request this creator/ }));
    const d = within(await screen.findByRole("dialog"));
    // Price summary with the fee note, before anything is sent.
    expect(await d.findByText("Price summary")).toBeInTheDocument();
    expect(d.getByText(/minus the 15% platform fee/)).toBeInTheDocument();

    await user.click(d.getByRole("button", { name: "Send request" }));
    expect(d.getByText("Choose a release.")).toBeInTheDocument();
    expect(api.calls("POST /creator-requests")).toHaveLength(0);

    await user.selectOptions(d.getByRole("combobox", { name: /^Release/ }), "34");
    await vi.waitFor(() => expect(d.getByRole("option", { name: "2. Pwani" })).toBeInTheDocument());
    await user.selectOptions(d.getByRole("combobox", { name: /^Track/ }), "57");
    await user.type(d.getByLabelText(/^Brief/), "Use the chorus");
    await user.click(d.getByRole("button", { name: "Send request" }));

    await vi.waitFor(() => expect(api.calls("POST /creator-requests")).toHaveLength(1));
    expect(api.calls("POST /creator-requests")[0].body).toEqual({
      creator_package_id: 12,
      release_id: 34,
      track_id: 57,
      brief: "Use the chorus",
    });
  });

  it("requests with a song released elsewhere (link, title, artist)", async () => {
    const user = userEvent.setup();
    const api = setup();
    await user.click(await screen.findByRole("button", { name: /Request this creator/ }));
    const d = within(await screen.findByRole("dialog"));
    await user.click(await d.findByRole("radio", { name: /Released elsewhere/ }));
    await user.type(d.getByLabelText(/Link to the song/), "https://open.spotify.com/track/xyz");
    expect(d.getByText("Detected: Spotify")).toBeInTheDocument();
    await user.click(d.getByRole("button", { name: "Send request" }));
    expect(d.getByText("Add the song title.")).toBeInTheDocument();
    await user.type(d.getByLabelText(/Song title/), "Moyo Wangu");
    await user.type(d.getByLabelText(/^Artist/), "Zuri Mwangi");
    await user.click(d.getByRole("button", { name: "Send request" }));

    await vi.waitFor(() => expect(api.calls("POST /creator-requests")).toHaveLength(1));
    expect(api.calls("POST /creator-requests")[0].body).toEqual({
      creator_package_id: 12,
      song_url: "https://open.spotify.com/track/xyz",
      song_title: "Moyo Wangu",
      song_artist: "Zuri Mwangi",
    });
  });
});
