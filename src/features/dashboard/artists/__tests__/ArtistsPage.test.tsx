import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
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
      "GET /artists": { artists: [artist], user: { id: 1, plan }, limit: 1 },
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

  it("saves store profile answers and parses the Spotify artist id from the link", async () => {
    const api = mockApi({
      "GET /artists": { artists: [artist], user: { id: 1, plan }, limit: 1 },
      "GET /release-config": { config: { genres: ["Bongo Flava"] } },
      "PATCH /artists/:id": ({ body }: { body: Record<string, unknown> }) => ({ artist: { ...artist, ...body } }),
    });
    const user = userEvent.setup();
    renderPage(<ArtistsPage />);
    await user.click(await screen.findByRole("button", { name: "Edit" }));
    const store = (await screen.findByRole("group", { name: "Store profiles" })) as HTMLElement;
    await user.selectOptions(within(store).getByLabelText("Spotify"), "existing");
    await user.type(within(store).getByLabelText(/Spotify artist link/), "not a link");
    await user.selectOptions(within(store).getByLabelText("Instagram"), "group");
    await user.click(screen.getByRole("button", { name: "Save artist" }));
    expect(await screen.findByText(/Paste a link like https:\/\/open\.spotify\.com/)).toBeInTheDocument();
    expect(api.calls("PATCH /artists/:id")).toHaveLength(0);

    await user.clear(within(store).getByLabelText(/Spotify artist link/));
    await user.type(within(store).getByLabelText(/Spotify artist link/), "https://open.spotify.com/artist/0TnOYISbd1XYRBk9myaseg?si=x");
    await user.click(screen.getByRole("button", { name: "Save artist" }));
    await waitFor(() => expect(api.calls("PATCH /artists/:id")).toHaveLength(1));
    expect(api.calls("PATCH /artists/:id")[0].body).toMatchObject({
      spotify_profile: "existing",
      spotify_artist_id: "0TnOYISbd1XYRBk9myaseg",
      apple_music_profile: null,
      instagram_profile: "group",
    });
  });

  it("shows the linked message instead of the questions once a release is delivered", async () => {
    mockApi({
      "GET /artists": { artists: [{ ...artist, has_delivered_release: true }], user: { id: 1, plan }, limit: 1 },
      "GET /release-config": { config: { genres: [] } },
    });
    const user = userEvent.setup();
    renderPage(<ArtistsPage />);
    await user.click(await screen.findByRole("button", { name: "Edit" }));
    expect(await screen.findByText(/Linked: new releases appear next to/)).toBeInTheDocument();
  });
});
