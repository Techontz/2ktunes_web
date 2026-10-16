import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import ArtistProfilesPage from "../ArtistProfilesPage";

const plan = { id: 1, name: "Pro", price: "9.99", currency: "USD", duration: 30, description: null, max_artists: 1 };
const artist = {
  id: 3,
  user_id: 1,
  name: "Neema Said",
  avatar_url: null,
  spotify_link: null,
  apple_music_link: null,
  youtube_music_link: null,
  instagram_link: null,
  facebook_link: null,
  has_delivered_release: true,
  created_at: "2026-01-01T00:00:00Z",
};
const claim = (over: Record<string, unknown>) => ({
  id: 1,
  artist_id: 3,
  service: "spotify",
  status: "in_progress",
  channel_option: null,
  channel_url: null,
  note: null,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
  ...over,
});

const card = (name: string) => screen.findByRole("region", { name });

describe("ArtistProfilesPage", () => {
  it("lists claims per service and requests a YouTube channel with the channel link", async () => {
    const api = mockApi({
      "GET /artists": { artists: [artist], user: { id: 1, plan }, limit: 1 },
      "GET /artists/:id/claims": { claims: [claim({})] },
      "POST /artists/:id/claims": ({ body }: { body: Record<string, unknown> }) => ({
        status: 201,
        body: { status: true, claim: claim({ id: 2, status: "requested", ...body }) },
      }),
    });
    const user = userEvent.setup();
    renderPage(<ArtistProfilesPage />);

    // Every service is plain text; the open Spotify request blocks a duplicate.
    const spotify = await card("Spotify for Artists");
    expect(await within(spotify).findByText("In progress")).toBeInTheDocument();
    expect(within(spotify).getByRole("button", { name: "Request access" })).toBeDisabled();
    expect(within(await card("Apple Music for Artists")).getByRole("link", { name: /artists\.apple\.com/ })).toHaveAttribute(
      "href",
      "https://artists.apple.com",
    );
    expect(within(await card("Tidal")).getByText(/Sign in to tidal\.com/)).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();

    const yt = await card("YouTube Official Artist Channel");
    await user.click(within(yt).getByLabelText(/A channel just for this artist/));
    await user.click(within(yt).getByRole("button", { name: "Request" }));
    expect(within(yt).getByText("Paste the link to this artist's channel.")).toBeInTheDocument();
    expect(api.calls("POST /artists/:id/claims")).toHaveLength(0);

    await user.type(within(yt).getByLabelText(/Channel link/), "https://www.youtube.com/@neemasaid");
    await user.click(within(yt).getByRole("button", { name: "Request" }));
    await waitFor(() => expect(api.calls("POST /artists/:id/claims")).toHaveLength(1));
    const call = api.calls("POST /artists/:id/claims")[0];
    expect(call.params.id).toBe("3");
    expect(call.body).toEqual({
      service: "youtube_oac",
      channel_option: "dedicated",
      channel_url: "https://www.youtube.com/@neemasaid",
    });
    expect(await within(yt).findByText("Requested")).toBeInTheDocument();
  });

  it("explains claim_needs_delivered_release inline", async () => {
    mockApi({
      "GET /artists": { artists: [{ ...artist, has_delivered_release: false }], user: { id: 1, plan }, limit: 1 },
      "GET /artists/:id/claims": { claims: [] },
      "POST /artists/:id/claims": {
        status: 422,
        body: { status: false, code: "claim_needs_delivered_release", message: "Artist has no delivered release." },
      },
    });
    const user = userEvent.setup();
    renderPage(<ArtistProfilesPage />);
    const tidal = await card("Tidal");
    await user.click(within(tidal).getByRole("button", { name: "Request verification" }));
    expect(
      await within(tidal).findByText(/Neema Said needs at least one release delivered to stores/),
    ).toBeInTheDocument();
    expect(within(tidal).getByRole("link", { name: "Go to my music" })).toHaveAttribute("href", "/dashboard/music");
  });

  it("still shows the cards when the claims endpoints are not deployed", async () => {
    mockApi({ "GET /artists": { artists: [artist], user: { id: 1, plan }, limit: 1 } });
    const user = userEvent.setup();
    renderPage(<ArtistProfilesPage />);
    const spotify = await card("Spotify for Artists");
    expect(await within(spotify).findByText("No requests yet.")).toBeInTheDocument();
    await user.click(within(spotify).getByRole("button", { name: "Request access" }));
    expect(await within(spotify).findByText(/still being switched on/)).toBeInTheDocument();
  });
});
