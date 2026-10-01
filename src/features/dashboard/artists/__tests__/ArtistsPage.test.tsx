import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import ArtistsPage from "../ArtistsPage";

const plan = { id: 1, name: "Pro", price: "9.99", currency: "USD", duration: 30, description: null, max_artists: 1 };
const artist = {
  id: 3,
  user_id: 1,
  name: "Neema Said",
  avatar_url: null,
  primary_genre: "Bongo Flava",
  country: "TZ",
  releases_count: 2,
  spotify_link: null,
  apple_music_link: null,
  youtube_music_link: null,
  instagram_link: null,
  facebook_link: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("ArtistsPage", () => {
  it("lists artists with the plan limit and explains a 403 artist_limit", async () => {
    const api = mockApi({
      "GET /artists": { artists: [artist], user: { id: 1, subscription_plan: "Pro", plan }, limit: 1 },
      "GET /release-config": { config: { genres: ["Bongo Flava"] } },
      "POST /artists": { status: 403, body: { status: false, code: "artist_limit", message: "Artist limit reached." } },
    });
    const user = userEvent.setup();
    renderPage(<ArtistsPage />);
    expect(await screen.findByRole("heading", { name: "Neema Said" })).toBeInTheDocument();
    expect(screen.getByText(/1 of 1 artist profile used/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add artist" }));
    await user.type(await screen.findByLabelText(/^Artist name/), "Juma");
    await user.click(screen.getByRole("button", { name: "Create artist" }));
    await waitFor(() => expect(api.calls("POST /artists")).toHaveLength(1));
    expect(await screen.findByRole("link", { name: "Compare plans" })).toHaveAttribute("href", "/dashboard/plan");
  });
});
