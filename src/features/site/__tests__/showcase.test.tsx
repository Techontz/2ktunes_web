import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import { CreatorsSlider, ShowcaseRail } from "../CreatorShowcase";

const creator = {
  slug: "dada-dance",
  display_name: "Dada Dance",
  avatar_url: "https://cdn.example/dada.jpg",
  categories: ["dance", "motivational_speaker"],
  verified: true,
  from_price_minor: 10_000_000,
  from_price_currency: "TZS",
};

const items = [
  {
    id: 7, caption: "Moyo dance", platform: "upload", media_type: "upload",
    video_src: "https://cdn.example/showcase/videos/a.mp4", external_url: null,
    thumbnail_url: "https://cdn.example/showcase/thumbnails/a.png", views_count: 120000, views_source: "self_reported",
    creator,
  },
  {
    id: 8, caption: null, platform: "tiktok", media_type: "external",
    video_src: null, external_url: "https://www.tiktok.com/@dada/video/1",
    thumbnail_url: "https://cdn.example/showcase/thumbnails/b.png", views_count: null, views_source: "self_reported",
    creator: { ...creator, slug: "juma-jokes", display_name: "Juma Jokes", verified: false, categories: ["comedy"] },
  },
];

describe("ShowcaseRail", () => {
  it("renders reels: muted inline videos with a poster, external items linking to the creator", async () => {
    mockApi({ "GET /public/showcase": { items } });
    renderPage(<ShowcaseRail />, { signedIn: false });

    const rail = await screen.findByTestId("showcase-rail");
    expect(screen.getByRole("heading", { name: "Creators who move songs" })).toBeInTheDocument();
    const video = rail.querySelector("video")!;
    expect(video).toHaveAttribute("poster", items[0].thumbnail_url);
    expect(video).toHaveAttribute("preload", "none");
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute("playsinline");
    expect(within(rail).getByRole("button", { name: "Play video by Dada Dance" })).toBeInTheDocument();
    expect(within(rail).getByText("120,000 views, self-reported")).toBeInTheDocument();
    expect(within(rail).getAllByText("from TZS 100,000")).toHaveLength(2);
    expect(within(rail).getByRole("img", { name: "Verified" })).toBeInTheDocument();

    // External post: opens the creator's page (sign-up first when signed out), never the external site.
    const ext = within(rail).getByRole("link", { name: "See Juma Jokes's profile" });
    expect(ext.getAttribute("href")).toBe(`/auth?mode=register&next=${encodeURIComponent("/dashboard/creators/juma-jokes")}`);
    expect(rail.querySelector('a[href^="https://www.tiktok.com"]')).toBeNull();
    expect(within(rail).getAllByRole("link", { name: /^Request/ })).toHaveLength(2);
  });

  it("links straight to the creator profile when signed in", async () => {
    mockApi({ "GET /public/showcase": { items: [items[1]] } });
    renderPage(<ShowcaseRail />);
    const link = await screen.findByRole("link", { name: /^Request/ });
    expect(link).toHaveAttribute("href", "/dashboard/creators/juma-jokes");
  });

  it("hides the section when there are no reels", async () => {
    const api = mockApi({ "GET /public/showcase": { items: [] } });
    renderPage(<ShowcaseRail />, { signedIn: false });
    await new Promise((r) => setTimeout(r, 30));
    expect(api.calls("GET /public/showcase")).toHaveLength(1);
    expect(screen.queryByTestId("showcase-rail")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Creators who move songs" })).not.toBeInTheDocument();
  });
});

describe("CreatorsSlider", () => {
  it("shows creators with photo, localised categories, verified badge and from price", async () => {
    mockApi({ "GET /public/creators": { creators: [{ ...creator, country: "TZ", packages_count: 2 }] } });
    renderPage(<CreatorsSlider />, { signedIn: false, language: "FR" });
    const slider = await screen.findByTestId("creators-slider");
    expect(within(slider).getByRole("heading", { name: "Les créateurs sur 2kTunes" })).toBeInTheDocument();
    expect(within(slider).getByText("Danse")).toBeInTheDocument();
    expect(within(slider).getByText("Orateur motivationnel")).toBeInTheDocument();
    expect(within(slider).getByRole("img", { name: "Vérifié" })).toBeInTheDocument();
    expect(within(slider).getByText(/^à partir de/)).toBeInTheDocument();
    const card = within(slider).getByRole("link", { name: "Voir Dada Dance" });
    expect(card.getAttribute("href")).toBe(`/auth?mode=register&next=${encodeURIComponent("/dashboard/creators/dada-dance")}`);
  });

  it("is hidden when there are no creators", async () => {
    mockApi({ "GET /public/creators": { creators: [] } });
    renderPage(<CreatorsSlider />, { signedIn: false });
    await new Promise((r) => setTimeout(r, 30));
    expect(screen.queryByTestId("creators-slider")).not.toBeInTheDocument();
  });
});
