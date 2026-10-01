import { StrictMode } from "react";
import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import SmartLinkPage from "../SmartLinkPage";

const base = {
  slug: "abc",
  title: "Nyota",
  version: null,
  artist: "Neema Said",
  type: "Single",
  cover_url: "https://cdn.test/cover.jpg",
  release_date: "2026-09-01",
  artist_links: { instagram: "https://instagram.com/neema" },
};

const live = {
  ...base,
  state: "live",
  presave_enabled: false,
  links: [
    { store: "spotify", name: "Spotify", url: "https://open.spotify.com/album/1" },
    { store: "boomplay", name: "Boomplay", url: "https://boomplay.com/albums/1" },
  ],
};

const renderLink = (ui = <SmartLinkPage />) =>
  renderPage(ui, { route: "/r/abc", path: "/r/:slug", signedIn: false });

describe("SmartLinkPage", () => {
  it("logs exactly one view event on load, even under StrictMode", async () => {
    const api = mockApi({
      "GET /public/releases/:slug": { release: live },
      "POST /public/releases/:slug/events": { status: 202, body: { status: true } },
    });
    renderLink(
      <StrictMode>
        <SmartLinkPage />
      </StrictMode>,
    );
    expect(await screen.findByRole("heading", { level: 1, name: /Nyota/ })).toBeInTheDocument();
    await waitFor(() => expect(api.calls("POST /public/releases/:slug/events")).toHaveLength(1));
    // Give any duplicate effect a chance to fire.
    await new Promise((r) => setTimeout(r, 30));
    const views = api.calls("POST /public/releases/:slug/events");
    expect(views).toHaveLength(1);
    expect(views[0].body).toEqual({ type: "view" });
  });

  it("renders store links for a live release and logs clicks", async () => {
    const api = mockApi({
      "GET /public/releases/:slug": { release: live },
      "POST /public/releases/:slug/events": { status: 202, body: { status: true } },
    });
    renderLink();
    const spotify = await screen.findByRole("link", { name: /Listen on Spotify/ });
    expect(spotify).toHaveAttribute("href", "https://open.spotify.com/album/1");
    expect(spotify).toHaveAttribute("target", "_blank");
    expect(spotify).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: /Listen on Boomplay/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Cover art for Nyota by Neema Said/ })).toBeInTheDocument();

    spotify.addEventListener("click", (e) => e.preventDefault());
    await userEvent.setup().click(spotify);
    await waitFor(() =>
      expect(api.calls("POST /public/releases/:slug/events").map((c) => c.body)).toContainEqual({
        type: "click",
        store: "spotify",
      }),
    );
  });

  it("posts a presave with consent for an upcoming release", async () => {
    const api = mockApi({
      "GET /public/releases/:slug": {
        release: { ...base, state: "upcoming", release_date: "2026-12-01", presave_enabled: true, links: [] },
      },
      "POST /public/releases/:slug/events": { status: 202, body: { status: true } },
      "POST /public/releases/:slug/presave": { status: 201, body: { status: true, message: "ok" } },
    });
    const user = userEvent.setup();
    renderLink();
    await user.type(await screen.findByLabelText(/Email address/), "fan@example.com");
    await user.click(screen.getByRole("button", { name: "Notify me" }));
    // Consent is required first.
    expect(await screen.findByText(/Tick the box/)).toBeInTheDocument();
    expect(api.calls("POST /public/releases/:slug/presave")).toHaveLength(0);

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Notify me" }));
    expect(await screen.findByText(/You're on the list/)).toBeInTheDocument();
    expect(api.calls("POST /public/releases/:slug/presave")[0].body).toEqual({
      email: "fan@example.com",
      consent: true,
    });
  });

  it("shows a friendly not-found page on 404", async () => {
    mockApi({});
    renderLink();
    expect(await screen.findByRole("heading", { name: /couldn't find this release/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to 2kTunes" })).toHaveAttribute("href", "/");
  });
});
