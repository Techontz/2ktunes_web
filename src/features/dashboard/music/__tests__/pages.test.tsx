import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { emptyMeta, makeRelease, makeTrack, releaseConfig, stores } from "@/test/fixtures";
import { renderPage } from "@/test/render";
import MusicPage from "../MusicPage";
import ReleaseDetailPage from "../ReleaseDetailPage";
import ReleaseWizardPage from "../wizard/ReleaseWizardPage";

const summary = { drafts: 0, in_review: 0, distributing: 0, live: 0, inactive: 0, all: 0 };

describe("MusicPage (catalog)", () => {
  it("shows the first-release empty state", async () => {
    mockApi({ "GET /releases": { releases: [], meta: emptyMeta, summary } });
    renderPage(<MusicPage />, { route: "/dashboard/music" });
    expect(await screen.findByText("No releases yet")).toBeInTheDocument();
  });

  it("passes the status filter from the URL to the API and lists releases", async () => {
    const api = mockApi({
      "GET /releases": {
        releases: [makeRelease({ release_title: "Upepo", status: "changes_requested" })],
        meta: { ...emptyMeta, total: 1 },
        summary: { ...summary, drafts: 1, all: 1 },
      },
    });
    renderPage(<MusicPage />, { route: "/dashboard/music?status=drafts" });
    expect((await screen.findAllByText("Upepo")).length).toBeGreaterThan(0);
    expect(api.calls("GET /releases")[0].query.get("status")).toBe("drafts");
    expect(screen.getByRole("button", { name: /Drafts\s*1/ })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("ReleaseDetailPage state machine", () => {
  const render = (over: Parameters<typeof makeRelease>[0]) => {
    const api = mockApi({
      "GET /releases/:id": { release: makeRelease(over) },
      "GET /release-config": { config: releaseConfig },
      "GET /stores": { stores },
    });
    renderPage(<ReleaseDetailPage />, { route: "/dashboard/music/7", path: "/dashboard/music/:id" });
    return api;
  };

  it("draft: edit, submit and delete, no takedown", async () => {
    render({ status: "draft", is_editable: true });
    expect(await screen.findByRole("link", { name: "Continue editing" })).toHaveAttribute("href", "/dashboard/music/7/edit");
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete draft" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request takedown" })).not.toBeInTheDocument();
  });

  it("submitted: only withdraw", async () => {
    render({ status: "submitted", is_editable: false, stage: 1 });
    expect(await screen.findByRole("button", { name: "Withdraw submission" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continue editing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit for review" })).not.toBeInTheDocument();
  });

  it("live: takedown needs a reason and posts it", async () => {
    const api = render({ status: "live", is_editable: false, stage: 5 });
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Request takedown" }));
    const dialog = await screen.findByRole("alertdialog");
    api.fetch.mockClear();
    mockApi({
      "GET /releases/:id": { release: makeRelease({ status: "takedown_requested", is_editable: false }) },
      "POST /releases/:id/takedown": ({ body }) => ({ release: makeRelease({ status: "takedown_requested" }), echo: body }),
      "GET /release-config": { config: releaseConfig },
    });
    await user.click(screen.getAllByRole("button", { name: "Request takedown" }).at(-1)!);
    expect(await screen.findByText(/At least 5 characters/)).toBeInTheDocument();
    await user.type(screen.getByRole("textbox"), "Wrong master uploaded");
    await user.click(screen.getAllByRole("button", { name: "Request takedown" }).at(-1)!);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  });

  it("changes_requested: shows review issues and the sandbox badge on sandbox deliveries", async () => {
    render({
      status: "changes_requested",
      is_editable: true,
      stage: 1,
      open_issues: [{ id: 1, field: "cover_image", track_id: null, severity: "blocking", message: "Artwork has a store logo." }],
      deliveries: [
        { id: 1, store: { slug: "spotify", name: "Spotify" }, status: "delivered", is_sandbox: true, live_url: null, delivered_at: null, live_at: null },
      ],
    });
    expect(await screen.findByText("Artwork has a store logo.")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("tab", { name: /Stores & delivery/ }));
    expect(await screen.findByText("Sandbox")).toBeInTheDocument();
  });

  it("submit is blocked by server validation and links to the failing step", async () => {
    mockApi({
      "GET /releases/:id": { release: makeRelease() },
      "GET /release-config": { config: releaseConfig },
      "GET /releases/:id/validation": {
        validation: {
          ready: false,
          warnings: [],
          steps: {},
          tracks: {},
          errors: [{ step: "artwork", field: "cover_image", message: "Upload cover artwork.", track_id: null }],
        },
      },
    });
    renderPage(<ReleaseDetailPage />, { route: "/dashboard/music/7", path: "/dashboard/music/:id" });
    await userEvent.setup().click(await screen.findByRole("button", { name: "Submit for review" }));
    expect(await screen.findByText("Upload cover artwork.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fix in the editor" })).toHaveAttribute("href", "/dashboard/music/7/edit?step=artwork");
  });
});

describe("ReleaseWizardPage (upload page per DISTRIBUTION_PARITY.md)", () => {
  const neema = { id: 3, name: "Neema", avatar_url: null };
  const refs = {
    "GET /release-config": { config: releaseConfig },
    "GET /stores": { stores },
    "GET /artists": { artists: [neema], user: { id: 1, plan: null }, limit: 3 },
  };
  const moreStores = [
    ...stores,
    { id: 4, slug: "apple_music", name: "Apple Music", category: "streaming", status: "available" },
    { id: 5, slug: "youtube_music", name: "YouTube Music", category: "streaming", status: "available" },
  ];
  const notReady = (errors: unknown[] = []) => ({ validation: { ready: false, errors, warnings: [], steps: {}, tracks: {} } });
  const edit = { route: "/dashboard/music/7/edit", path: "/dashboard/music/:id/edit" };
  const fresh = { route: "/dashboard/new-release", path: "/dashboard/new-release" };
  const trackEcho = (id = 11) => ({ body }: { body: unknown }) => ({ track: makeTrack({ id, ...(body as object) } as Partial<ReturnType<typeof makeTrack>>) });
  const someBody = (calls: { body: unknown }[], test: (b: Record<string, unknown>) => boolean) => calls.some((c) => test(c.body as Record<string, unknown>));

  it("new release: numbered steps on the left (stores first), cover and summary card on the right, Submit in the bottom bar", async () => {
    mockApi(refs);
    renderPage(<ReleaseWizardPage />, fresh);
    await screen.findByRole("heading", { level: 2, name: /Release details/ });
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    // Numbered sections carry their step number in a circle before the title.
    expect(headings).toEqual(["Where should it go?", "Cover art", "2Artist", "3Release details", "4Song", "5Profiles", "7Review"]);
    expect(screen.getByRole("heading", { level: 3, name: "Agreements" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Track 1" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Release summary" })).getByRole("button", { name: "Choose image" })).toBeEnabled();
    expect(screen.getByRole("heading", { level: 3, name: "Store profiles for Neema" })).toBeInTheDocument();
    // Cover art is the first card; the summary panel holds the checklist; one Submit button in the bar.
    expect(screen.getAllByText("Step 1 of 7").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Submit release" })).toHaveLength(1);
    expect(document.querySelector("[data-submitbar]")).toContainElement(screen.getByRole("button", { name: "Submit release" }));
    expect(screen.queryByRole("heading", { name: "Preview" })).not.toBeInTheDocument();
    // A single: no album price, no album title, no Apple card without Apple Music.
    expect(screen.getByLabelText(/Number of songs/)).toHaveValue("1");
    expect(screen.queryByRole("textbox", { name: /Album title/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Album price/)).not.toBeInTheDocument();
    expect(screen.getByText("This release is a single.")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Spotify" })).toBeChecked();
    // The track card holds every 1.1 field, radios stacked.
    for (const g of ["Featured artists in the title?", "Version in the title?", "Dolby Atmos version?", "Original or cover?", "Explicit lyrics?", "Is this a radio edit?", "Lyrics or instrumental?", "Preview clip start"]) {
      expect(screen.getByRole("group", { name: g })).toBeInTheDocument();
    }
    expect(screen.getByRole("group", { name: /Was AI used/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Already have an ISRC?" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Track price/)).toHaveValue("0.99");
    expect(screen.getByLabelText(/^Lyrics/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload audio" })).toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "Songwriter 1" })).getByLabelText(/Last name/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit release" })).toBeInTheDocument();
    // Five agreements minus the YouTube one (YouTube Music isn't a store here).
    expect(within(document.getElementById("section-review")!).getAllByRole("checkbox")).toHaveLength(4);
  });

  it("number of songs drives the track cards and the release type", async () => {
    const api = mockApi({
      ...refs,
      "POST /releases": ({ body }) => ({ status: 201, body: { status: true, release: makeRelease({ id: 42, tracks: [], ...(body as object) }) } }),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ id: 42, tracks: [], ...(body as object) }) }),
      "GET /releases/:id/validation": notReady(),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    await user.selectOptions(await screen.findByLabelText(/Number of songs/), "3");
    expect(screen.getAllByRole("heading", { level: 3, name: /^Track \d$/ })).toHaveLength(3);
    expect(screen.getByText("This release is an EP.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Album price/)).toHaveValue("9.99");
    await user.type(screen.getByRole("textbox", { name: /Album title/ }), "Bahari");
    await waitFor(() => expect(api.calls("POST /releases")).toHaveLength(1), { timeout: 3000 });
    expect(api.calls("POST /releases")[0].body).toMatchObject({ release_type: "EP", release_title: "Bahari", album_price: "9.99" });

    await user.selectOptions(screen.getByLabelText(/Number of songs/), "7");
    expect(screen.getAllByRole("heading", { level: 3, name: /^Track \d$/ })).toHaveLength(7);
    await waitFor(() => expect(someBody(api.calls("PATCH /releases/:id"), (b) => b.release_type === "Album")).toBe(true), { timeout: 3000 });

    // Empty cards go without a question.
    await user.selectOptions(screen.getByLabelText(/Number of songs/), "1");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3, name: /^Track \d$/ })).toHaveLength(1);
    expect(screen.queryByRole("textbox", { name: /Album title/ })).not.toBeInTheDocument();
    await waitFor(() => expect(someBody(api.calls("PATCH /releases/:id"), (b) => b.release_type === "Single")).toBe(true), { timeout: 3000 });
    // Renders up to seven full track cards; slow under a parallel run.
  }, 150_000);

  it("removing cards that hold saved songs asks first, then deletes those tracks", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ release_type: "EP", tracks: [makeTrack({ id: 11 }), makeTrack({ id: 12, title: "Upepo", track_number: 2 })] }) },
      "GET /releases/:id/validation": notReady(),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ ...(body as object) }) }),
      "DELETE /tracks/:id": { message: "Deleted" },
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);
    await user.selectOptions(await screen.findByLabelText(/Number of songs/), "1");
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(/Upepo/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Remove songs" }));
    await waitFor(() => expect(api.calls("DELETE /tracks/:id")).toHaveLength(1));
    expect(api.calls("DELETE /tracks/:id")[0].path).toBe("/tracks/12");
    expect(screen.getAllByRole("heading", { level: 3, name: /^Track \d$/ })).toHaveLength(1);
  });

  it("a single: typing the song title creates the draft (titled after the song), then the track, and saves songwriter name parts", async () => {
    const api = mockApi({
      ...refs,
      "POST /releases": ({ body }) => ({ status: 201, body: { status: true, release: makeRelease({ id: 42, tracks: [], ...(body as object) }) } }),
      "POST /releases/:id/tracks": ({ body }) => ({ status: 201, body: { status: true, track: makeTrack({ id: 77, release_id: 42, ...(body as object) }) } }),
      "PATCH /tracks/:id": trackEcho(77),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ id: 42, ...(body as object) }) }),
      "GET /releases/:id/validation": notReady(),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    const writer = within(await screen.findByRole("group", { name: "Songwriter 1" }));
    await user.type(writer.getByLabelText(/First name/), "Neema");
    await user.type(writer.getByLabelText(/Last name/), "Said");
    const songTitle = screen.getByLabelText(/Song title/);
    await user.type(songTitle, "Upepo");
    await waitFor(() => expect(api.calls("POST /releases/:id/tracks")).toHaveLength(1), { timeout: 3000 });
    expect(api.calls("POST /releases")).toHaveLength(1);
    expect(api.calls("POST /releases")[0].body).toMatchObject({ release_type: "Single", release_title: "Upepo", artist_id: 3, platforms: ["spotify", "boomplay"] });
    expect(api.calls("POST /releases/:id/tracks")[0].body).toMatchObject({ title: "Upepo" });
    await waitFor(() => expect(window.location.pathname).toBe("/dashboard/music/42/edit"));
    expect(screen.getByLabelText(/Song title/)).toBe(songTitle);
    await waitFor(
      () =>
        expect(
          someBody(
            api.calls("PATCH /tracks/:id"),
            (b) => JSON.stringify(b.credits) === JSON.stringify([{ role: "songwriter", name: "Neema Said", first_name: "Neema", middle_name: null, last_name: "Said", detail: null }]),
          ),
        ).toBe(true),
      { timeout: 3000 },
    );
    expect(api.calls("POST /releases")).toHaveLength(1);
  });

  it("featured artists are saved as {name, role} rows and the title preview follows", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ tracks: [makeTrack()] }) },
      "GET /releases/:id/validation": notReady(),
      "PATCH /tracks/:id": trackEcho(),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);
    await user.click(within(await screen.findByRole("group", { name: "Featured artists in the title?" })).getByRole("radio", { name: "Yes" }));
    await user.type(screen.getByRole("textbox", { name: "Name 1" }), "Juma");
    await user.click(screen.getByRole("button", { name: "Add another" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Role 2" }), "remixer");
    await user.type(screen.getByRole("textbox", { name: "Name 2" }), "DJ K");
    await user.click(within(screen.getByRole("group", { name: "Version in the title?" })).getByRole("radio", { name: "Radio edit" }));
    expect(screen.getByTestId("title-preview-1")).toHaveTextContent("Bahari (feat. Juma) [DJ K Remix] [Radio Edit]");
    // The store-style preview bar in the card shows the same title.
    expect(screen.getByTestId("song-preview-1")).toHaveTextContent("Bahari (feat. Juma) [DJ K Remix] [Radio Edit]");
    await waitFor(
      () =>
        expect(
          someBody(
            api.calls("PATCH /tracks/:id"),
            (b) =>
              JSON.stringify(b.featured_artists) === JSON.stringify([{ name: "Juma", role: "featuring" }, { name: "DJ K", role: "remixer" }]) &&
              b.version_type === "radio_edit" &&
              b.version === null,
          ),
        ).toBe(true),
      { timeout: 3000 },
    );
  });

  it("a cover song asks for the original artist, title and writers instead of songwriter rows", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ tracks: [makeTrack()] }) },
      "GET /releases/:id/validation": notReady(),
      "PATCH /tracks/:id": trackEcho(),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);
    await user.click(within(await screen.findByRole("group", { name: "Original or cover?" })).getByRole("radio", { name: "Cover song" }));
    expect(screen.queryByRole("group", { name: "Songwriter 1" })).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/Original artist/), "Remmy Ongala");
    await user.type(screen.getByLabelText(/Original song title/), "Mambo kwa soksi");
    await user.type(screen.getByLabelText(/Original songwriters/), "Remmy Ongala");
    await waitFor(
      () =>
        expect(
          someBody(
            api.calls("PATCH /tracks/:id"),
            (b) =>
              b.ownership === "cover" &&
              b.cover_original_artist === "Remmy Ongala" &&
              b.cover_original_title === "Mambo kwa soksi" &&
              b.cover_original_writers === "Remmy Ongala",
          ),
        ).toBe(true),
      { timeout: 3000 },
    );
  });

  it("the Apple Music credits card shows only while Apple Music is chosen and saves performer rows", async () => {
    const api = mockApi({
      ...refs,
      "GET /stores": { stores: moreStores },
      "GET /releases/:id": { release: makeRelease({ platforms: ["spotify", "apple_music"], tracks: [makeTrack({ credits: [] })] }) },
      "GET /releases/:id/validation": notReady(),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ ...(body as object) }) }),
      "PATCH /tracks/:id": trackEcho(),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);
    const card = await screen.findByRole("heading", { level: 2, name: "Apple Music credits" });
    expect(card).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Instrument or role (Performers 1)" }), "Vocals");
    await user.type(screen.getByRole("textbox", { name: "Name (Performers 1)" }), "Neema Said");
    await waitFor(
      () =>
        expect(
          someBody(api.calls("PATCH /tracks/:id"), (b) => JSON.stringify(b.credits) === JSON.stringify([{ role: "performer", name: "Neema Said", detail: "Vocals" }])),
        ).toBe(true),
      { timeout: 3000 },
    );
    await user.click(screen.getByRole("checkbox", { name: "Apple Music" }));
    expect(screen.queryByRole("heading", { level: 2, name: "Apple Music credits" })).not.toBeInTheDocument();
  });

  it("the YouTube Music agreement shows only when YouTube Music is chosen", async () => {
    mockApi({ ...refs, "GET /stores": { stores: moreStores } });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    const agreements = () => within(document.getElementById("section-review")!).getAllByRole("checkbox");
    expect(await screen.findByRole("checkbox", { name: /YouTube Music also lets YouTube/ })).toBeInTheDocument();
    expect(agreements()).toHaveLength(5);
    expect(screen.getByRole("heading", { level: 2, name: "Apple Music credits" })).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "YouTube Music" }));
    expect(screen.queryByRole("checkbox", { name: /YouTube Music also lets YouTube/ })).not.toBeInTheDocument();
    expect(agreements()).toHaveLength(4);
  });

  it("As soon as possible saves release_asap, hides the date and shows in the summary", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease() },
      "GET /releases/:id/validation": notReady(),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ ...(body as object) }) }),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);
    await user.click(within(await screen.findByRole("group", { name: "Release date" })).getByRole("radio", { name: /As soon as possible/ }));
    expect(screen.queryByLabelText(/^Date/)).not.toBeInTheDocument();
    await waitFor(() => expect(someBody(api.calls("PATCH /releases/:id"), (b) => b.release_asap === true && b.release_date === null)).toBe(true), {
      timeout: 3000,
    });
  });

  it("adds a new artist inline, then saves its store profiles on the artist", async () => {
    const api = mockApi({
      ...refs,
      "POST /artists": ({ body }) => ({ status: 201, body: { status: true, artist: { id: 9, avatar_url: null, ...(body as object) } } }),
      "PATCH /artists/:id": ({ body }) => ({ artist: { id: 9, name: "Zuchu", avatar_url: null, ...(body as object) } }),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    await user.click(await screen.findByRole("button", { name: "Add new artist" }));
    await user.type(screen.getByLabelText(/New artist name/), "Zuchu");
    await user.click(screen.getByRole("button", { name: "Save artist" }));
    await waitFor(() => expect(api.calls("POST /artists")).toHaveLength(1));
    expect(api.calls("POST /artists")[0].body).toMatchObject({ name: "Zuchu" });
    expect(await screen.findByRole("heading", { level: 3, name: "Store profiles for Zuchu" })).toBeInTheDocument();
    await user.click(within(screen.getByRole("group", { name: "Spotify" })).getByRole("radio", { name: /Existing profile/ }));
    await user.type(screen.getByLabelText(/Spotify profile link/), "https://open.spotify.com/artist/0123456789abcdefghijkl?si=x");
    await user.click(within(screen.getByRole("group", { name: "Instagram" })).getByRole("radio", { name: "No profile yet" }));
    await waitFor(
      () =>
        expect(
          someBody(
            api.calls("PATCH /artists/:id"),
            (b) => b.spotify_profile === "existing" && b.spotify_artist_id === "0123456789abcdefghijkl" && b.instagram_profile === "none",
          ),
        ).toBe(true),
      { timeout: 3000 },
    );
  });

  it("with no artist yet, profile tiles and social links show and go in the POST /artists body", async () => {
    const api = mockApi({
      ...refs,
      "GET /artists": { artists: [], user: { id: 1, plan: null }, limit: 1 },
      "POST /artists": ({ body }) => ({ status: 201, body: { status: true, artist: { id: 9, avatar_url: null, ...(body as object) } } }),
      "PATCH /artists/:id": ({ body }) => ({ artist: { id: 9, name: "Zuchu", avatar_url: null, ...(body as object) } }),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    expect(await screen.findByRole("heading", { level: 3, name: "Store profiles" })).toBeInTheDocument();
    const social = within(screen.getByRole("group", { name: "Social links" }));
    for (const name of ["Instagram", "TikTok", "Facebook", "Boomplay", "Audiomack"]) {
      expect(social.getByLabelText(new RegExp(`${name} profile link`))).toBeInTheDocument();
    }
    await user.type(screen.getByLabelText(/New artist name/), "Zuchu");
    expect(screen.getByRole("heading", { level: 3, name: "Store profiles for Zuchu" })).toBeInTheDocument();
    await user.click(within(screen.getByRole("group", { name: "Spotify" })).getByRole("radio", { name: /Existing profile/ }));
    await user.type(screen.getByLabelText(/Spotify profile link/), "https://open.spotify.com/artist/0123456789abcdefghijkl");
    await user.click(within(screen.getByRole("group", { name: "Facebook" })).getByRole("radio", { name: "No profile yet" }));
    await user.type(social.getByLabelText(/Instagram profile link/), "https://instagram.com/zuchu");
    await user.type(social.getByLabelText(/TikTok profile link/), "https://tiktok.com/@zuchu");
    await user.click(screen.getByRole("button", { name: "Save artist" }));
    await waitFor(() => expect(api.calls("POST /artists")).toHaveLength(1));
    expect(api.calls("POST /artists")[0].body).toEqual({
      name: "Zuchu",
      spotify_profile: "existing",
      spotify_link: "https://open.spotify.com/artist/0123456789abcdefghijkl",
      spotify_artist_id: "0123456789abcdefghijkl",
      // First-upload defaults: existing profile for stores, no social profile yet.
      apple_music_profile: "existing",
      youtube_music_profile: "existing",
      instagram_profile: "none",
      facebook_profile: "none",
      instagram_link: "https://instagram.com/zuchu",
      tiktok_link: "https://tiktok.com/@zuchu",
    });
    // Created: the same tiles now autosave on the artist.
    expect(await screen.findByLabelText(/Artist name/)).toHaveValue("9");
  });

  it("hides Add new artist once the plan's artist limit is reached and links to upgrade", async () => {
    mockApi({ ...refs, "GET /artists": { artists: [neema], user: { id: 1, plan: null }, limit: 1 } });
    renderPage(<ReleaseWizardPage />, fresh);
    expect(await screen.findByText(/Your plan includes 1 artist/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add new artist" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upgrade to add more" })).toHaveAttribute("href", "/dashboard/plan");
  });

  it("shows profiles saved on an earlier upload as connected, with Edit", async () => {
    const saved = { ...neema, spotify_profile: "existing", spotify_link: "https://open.spotify.com/artist/abc" };
    mockApi({ ...refs, "GET /artists": { artists: [saved], user: { id: 1, plan: null }, limit: 3 } });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    expect(await screen.findByText("Connected: https://open.spotify.com/artist/abc")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    expect(screen.getByRole("textbox", { name: /Spotify/ })).toHaveValue("https://open.spotify.com/artist/abc");
  });

  it("released before: the moving group holds UPC and every track's ISRC field opens", async () => {
    mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ tracks: [makeTrack()] }) },
      "GET /releases/:id/validation": notReady(),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ tracks: [makeTrack()], ...(body as object) }) }),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);
    // Not released before: UPC sits in Codes and rights, ISRC behind its link.
    expect(await screen.findAllByLabelText(/UPC/)).toHaveLength(1);
    expect(screen.queryByRole("group", { name: "Moving from another distributor?" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Already have an ISRC?" })).toBeInTheDocument();

    await user.click(within(screen.getByRole("group", { name: "Released before?" })).getByRole("radio", { name: "Yes" }));
    const moving = within(screen.getByRole("group", { name: "Moving from another distributor?" }));
    expect(moving.getByLabelText(/Original date/)).toBeInTheDocument();
    expect(moving.getByLabelText(/UPC/)).toBeInTheDocument();
    expect(moving.getByText(/same UPC and the same ISRCs/)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/UPC/)).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Already have an ISRC?" })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^ISRC/)).toBeInTheDocument();
    expect(screen.getByText("Use this song's existing ISRC.")).toBeInTheDocument();
  });

  it("© and ℗ are prefilled and editing the owners PATCHes the release", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ c_line_owner: null, p_line_owner: null, record_label: null }) },
      "GET /releases/:id/validation": notReady(),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ ...(body as object) }) }),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);
    const c = await screen.findByLabelText(/© owner/);
    const p = screen.getByLabelText(/℗ owner/);
    // Empty on the server: shown from the artist.
    expect(c).toHaveValue("Neema");
    expect(p).toHaveValue("Neema");
    expect(screen.getByLabelText(/© year/)).toHaveValue("2026");
    await user.tripleClick(c);
    await user.keyboard("Neema Music");
    await user.tripleClick(p);
    await user.keyboard("Bahari Records");
    await waitFor(
      () =>
        expect(
          someBody(api.calls("PATCH /releases/:id"), (b) => b.c_line_owner === "Neema Music" && b.p_line_owner === "Bahari Records" && b.c_line_year === "2026"),
        ).toBe(true),
      { timeout: 3000 },
    );
  });

  it("server errors show on the © / ℗ fields", async () => {
    mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease() },
      "GET /releases/:id/validation": notReady(),
      "PATCH /releases/:id": {
        status: 422,
        body: { status: false, code: "validation_failed", message: "Check the fields.", errors: { c_line_owner: ["The © owner is too long."] } },
      },
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);
    const c = await screen.findByLabelText(/© owner/);
    await user.type(c, "x");
    expect(await screen.findByText("The © owner is too long.", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(c).toHaveAttribute("aria-invalid", "true");
  });

  it("an artist with a delivered release shows its store profiles as linked", async () => {
    mockApi({ ...refs, "GET /artists": { artists: [{ ...neema, has_delivered_release: true }], user: { id: 1, plan: null }, limit: 1 } });
    renderPage(<ReleaseWizardPage />, fresh);
    expect(await screen.findAllByText("Linked: this release appears next to your other releases.")).toHaveLength(3);
    expect(screen.getByRole("group", { name: "Instagram" })).toBeInTheDocument();
  });

  it("shows a failed background create at the top of the page", async () => {
    mockApi({
      ...refs,
      "POST /releases": { status: 500, body: { status: false, code: "server_error", message: "Server is down." } },
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    await user.type(await screen.findByLabelText(/Song title/), "Bahari");
    expect(await screen.findByText(/We couldn't start this release/, {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("locked releases can't be edited", async () => {
    mockApi({ ...refs, "GET /releases/:id": { release: makeRelease({ status: "live", is_editable: false }) } });
    renderPage(<ReleaseWizardPage />, edit);
    expect(await screen.findByText("This release can't be edited")).toBeInTheDocument();
  });

  it("a draft with no stores gets every available store ticked and saved", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ platforms: [] }) },
      "GET /releases/:id/validation": notReady(),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ ...(body as object) }) }),
    });
    renderPage(<ReleaseWizardPage />, edit);
    expect(await screen.findByRole("checkbox", { name: "Spotify" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Boomplay" })).toBeChecked();
    await waitFor(
      () => expect(someBody(api.calls("PATCH /releases/:id"), (b) => JSON.stringify(b.platforms) === JSON.stringify(["spotify", "boomplay"]))).toBe(true),
      { timeout: 3000 },
    );
  });

  it("territories default to worldwide and PATCH ISO codes", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ platforms: ["spotify"] }) },
      "GET /releases/:id/validation": notReady(),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ platforms: ["spotify"], ...(body as object) }) }),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, { ...edit, route: "/dashboard/music/7/edit?step=stores" });

    const territories = await screen.findByRole("combobox", { name: "Territories" });
    expect(territories).toHaveValue("worldwide");
    expect(screen.getByText("Global release")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /Countries/ })).not.toBeInTheDocument();
    await user.selectOptions(territories, "include");
    const picker = screen.getByRole("combobox", { name: /Countries/ });
    await user.type(picker, "Kenya");
    await user.keyboard("{Enter}");
    await user.type(picker, "Tanz");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Remove Kenya" })).toBeInTheDocument();
    await waitFor(
      () =>
        expect(
          someBody(api.calls("PATCH /releases/:id"), (b) => JSON.stringify(b.territories) === JSON.stringify({ mode: "include", countries: ["KE", "TZ"] })),
        ).toBe(true),
      { timeout: 3000 },
    );
  });

  it("submit is gated on the server report: nothing shows before trying, then only what's missing", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": {
        release: makeRelease({ tracks: [makeTrack({ audio: null, credits: [] })], agreements: { rights_confirmation: true, distribution_terms: true } }),
      },
      "GET /releases/:id/validation": notReady([
        { step: "tracks", field: "audio", message: "Track 1 needs audio.", track_id: 11 },
        { step: "basics", field: "language", message: "Choose a language.", track_id: null },
      ]),
      "PATCH /releases/:id": { release: makeRelease() },
      "POST /releases/:id/submit": { release: makeRelease({ status: "submitted" }) },
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);

    const submit = await screen.findByRole("button", { name: "Submit release" });
    await waitFor(() => expect(api.calls("GET /releases/:id/validation").length).toBeGreaterThan(0));
    expect(screen.queryByText("Track 1 needs audio.")).not.toBeInTheDocument();

    await user.click(submit);
    const link = await screen.findByRole("button", { name: "Track 1 needs audio." });
    expect(screen.getByRole("button", { name: "Choose a language." })).toBeInTheDocument();
    expect(screen.getByText("Track 1: upload the audio.")).toBeInTheDocument();
    expect(screen.getByText("Track 1: add at least one songwriter, composer or lyricist.")).toBeInTheDocument();
    expect(api.calls("POST /releases/:id/submit")).toHaveLength(0);

    await user.click(link);
    expect(document.getElementById("track-11")).toHaveFocus();

    // The list can be closed, and comes back on the next attempt.
    await user.click(screen.getByRole("button", { name: "Close this list" }));
    expect(screen.queryByRole("button", { name: "Track 1 needs audio." })).not.toBeInTheDocument();
    await user.click(submit);
    expect(await screen.findByRole("button", { name: "Track 1 needs audio." })).toBeInTheDocument();
  });

  it("seven-step indicator: Continue moves to the next step and Submit stays reachable on every step", async () => {
    mockApi(refs);
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    const steps = await screen.findByRole("navigation", { name: "Release steps" });
    for (const name of ["Distribution", "Artist", "Release details", "Tracks", "Profiles", "Artwork", "Review"]) {
      expect(within(steps).getAllByRole("button", { name: new RegExp(name) }).length).toBeGreaterThan(0);
    }
    const bar = document.querySelector("[data-submitbar]") as HTMLElement;
    // Step 1: Continue to Artist, and Submit is still there as a quiet action.
    expect(within(bar).getByRole("button", { name: "Submit release" })).toBeInTheDocument();
    await user.click(within(bar).getByRole("button", { name: /Continue to Artist/ }));
    expect(within(bar).getByText("Step 2 of 7")).toBeInTheDocument();
    expect(within(bar).getByRole("button", { name: /Continue to Release details/ })).toBeInTheDocument();
    // Jumping to the last step turns the primary button into Submit (still exactly one).
    await user.click(within(steps).getAllByRole("button", { name: /Review/ })[0]);
    expect(within(bar).getByText("Step 7 of 7")).toBeInTheDocument();
    expect(within(bar).getAllByRole("button", { name: "Submit release" })).toHaveLength(1);
    expect(within(bar).queryByRole("button", { name: /Continue to/ })).not.toBeInTheDocument();
  });

  it("every store shows at once as a plain checkbox grid, and search covers every store", async () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ id: 100 + i, slug: `store_${i}`, name: i === 22 ? "Claro Música" : `Store ${i}`, category: "streaming", status: "available" }));
    mockApi({ ...refs, "GET /stores": { stores: [...many, { id: 999, slug: "soon", name: "Soon Store", category: "streaming", status: "coming_soon" }] } });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    // No folding: the 25th store is there from the start.
    expect(await screen.findByRole("checkbox", { name: "Claro Música" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Store 24" })).toBeChecked();
    expect(screen.queryByRole("button", { name: /more stores/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Soon Store" })).not.toBeInTheDocument();
    expect(screen.getByText("25 stores selected")).toBeInTheDocument();
    // Search ignores accents.
    await user.type(screen.getByRole("searchbox", { name: "Search stores" }), "claro musica");
    expect(screen.getByRole("checkbox", { name: "Claro Música" })).toBeChecked();
    expect(screen.queryByRole("checkbox", { name: "Store 1" })).not.toBeInTheDocument();
  });

  describe("opt-in stores (Snapchat, Roblox)", () => {
    const optIn = [
      ...stores,
      { id: 20, slug: "snapchat", name: "Snapchat", category: "social", status: "available", default_selected: false, confirmation: "full_publishing" },
      { id: 21, slug: "roblox", name: "Roblox (beta)", category: "social", status: "available", default_selected: false, confirmation: "roblox_eligibility" },
    ];
    const ROBLOX_KEYS = ["roblox_full_publishing", "roblox_no_pro", "roblox_not_monetized", "roblox_terms"];
    const setup = (release = makeRelease({ platforms: ["spotify"] })) => {
      const api = mockApi({
        ...refs,
        "GET /stores": { stores: optIn },
        "GET /releases/:id": { release },
        "GET /releases/:id/validation": notReady(),
        "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ ...release, ...(body as object) }) }),
      });
      renderPage(<ReleaseWizardPage />, edit);
      return { api, user: userEvent.setup() };
    };
    const review = () => within(document.getElementById("section-review")!);
    const agreementsSaved = (api: ReturnType<typeof mockApi>, test: (a: Record<string, boolean>) => boolean) =>
      someBody(api.calls("PATCH /releases/:id"), (b) => !!b.agreements && test(b.agreements as Record<string, boolean>));

    it("a new release ticks every store except the opt-in ones, and Select all skips them", async () => {
      mockApi({ ...refs, "GET /stores": { stores: optIn } });
      const user = userEvent.setup();
      renderPage(<ReleaseWizardPage />, fresh);
      expect(await screen.findByRole("checkbox", { name: "Spotify" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Boomplay" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Snapchat" })).not.toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Roblox (beta)" })).not.toBeChecked();
      expect(screen.getByText("2 stores selected")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Clear all" }));
      expect(screen.getByRole("checkbox", { name: "Spotify" })).not.toBeChecked();
      await user.click(screen.getByRole("button", { name: "Select all" }));
      expect(screen.getByRole("checkbox", { name: "Spotify" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Snapchat" })).not.toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Roblox (beta)" })).not.toBeChecked();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("an existing draft with no stores saves the default selection without them", async () => {
      const { api } = setup(makeRelease({ platforms: [] }));
      expect(await screen.findByRole("checkbox", { name: "Snapchat" })).not.toBeChecked();
      await waitFor(
        () => expect(someBody(api.calls("PATCH /releases/:id"), (b) => JSON.stringify(b.platforms) === JSON.stringify(["spotify", "boomplay"]))).toBe(true),
        { timeout: 3000 },
      );
    });

    it("Snapchat asks about the publishing: No leaves it off, Yes ticks it and records the agreement; unticking clears it", async () => {
      const { api, user } = setup();
      await user.click(await screen.findByRole("checkbox", { name: "Snapchat" }));
      let dialog = await screen.findByRole("dialog", { name: "Do you own 100% of the publishing rights for this release?" });
      expect(dialog).toHaveTextContent("Snapchat can only accept releases from artists with full publishing rights to the music.");
      await user.click(within(dialog).getByRole("button", { name: "No, I don't" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "Snapchat" })).not.toBeChecked();
      expect(review().queryByRole("checkbox", { name: /Snapchat: I own 100%/ })).not.toBeInTheDocument();

      await user.click(screen.getByRole("checkbox", { name: "Snapchat" }));
      dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: "Yes, I own 100% of the publishing" }));
      expect(screen.getByRole("checkbox", { name: "Snapchat" })).toBeChecked();
      expect(review().getByRole("checkbox", { name: /Snapchat: I own 100% of the publishing rights/ })).toBeChecked();
      await waitFor(() => expect(agreementsSaved(api, (a) => a.snapchat_full_publishing === true)).toBe(true), { timeout: 3000 });
      await waitFor(
        () => expect(someBody(api.calls("PATCH /releases/:id"), (b) => Array.isArray(b.platforms) && (b.platforms as string[]).includes("snapchat"))).toBe(true),
        { timeout: 3000 },
      );

      await user.click(screen.getByRole("checkbox", { name: "Snapchat" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "Snapchat" })).not.toBeChecked();
      expect(review().queryByRole("checkbox", { name: /Snapchat: I own 100%/ })).not.toBeInTheDocument();
      await waitFor(() => expect(agreementsSaved(api, (a) => a.snapchat_full_publishing === false)).toBe(true), { timeout: 3000 });
    });

    it("Roblox needs all four confirmations before Continue; Cancel leaves it off", async () => {
      const { api, user } = setup();
      await user.click(await screen.findByRole("checkbox", { name: "Roblox (beta)" }));
      let dialog = await screen.findByRole("dialog", { name: "Roblox eligibility requirements" });
      expect(dialog).toHaveTextContent("To distribute to Roblox, confirm:");
      expect(within(dialog).getByRole("link", { name: /Roblox Music Terms of Service/ })).toHaveAttribute(
        "href",
        "https://en.help.roblox.com/hc/en-us/articles/115004647846",
      );
      expect(within(dialog).getByRole("link", { name: /Roblox Music Terms of Service/ })).toHaveAttribute("target", "_blank");
      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "Roblox (beta)" })).not.toBeChecked();

      await user.click(screen.getByRole("checkbox", { name: "Roblox (beta)" }));
      dialog = await screen.findByRole("dialog", { name: "Roblox eligibility requirements" });
      const go = within(dialog).getByRole("button", { name: "Continue" });
      const boxes = within(dialog).getAllByRole("checkbox");
      expect(boxes).toHaveLength(4);
      expect(boxes.every((b) => !(b as HTMLInputElement).checked)).toBe(true);
      for (const box of boxes.slice(0, 3)) {
        await user.click(box);
        expect(go).toBeDisabled();
      }
      await user.click(boxes[3]);
      expect(go).toBeEnabled();
      await user.click(go);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "Roblox (beta)" })).toBeChecked();
      expect(review().getByRole("checkbox", { name: /Roblox: I am not registered/ })).toBeChecked();
      await waitFor(() => expect(agreementsSaved(api, (a) => ROBLOX_KEYS.every((k) => a[k] === true))).toBe(true), { timeout: 3000 });

      // Unticking clears all four; ticking again asks again with empty boxes.
      await user.click(screen.getByRole("checkbox", { name: "Roblox (beta)" }));
      await waitFor(() => expect(agreementsSaved(api, (a) => ROBLOX_KEYS.every((k) => a[k] === false))).toBe(true), { timeout: 3000 });
      await user.click(screen.getByRole("checkbox", { name: "Roblox (beta)" }));
      dialog = await screen.findByRole("dialog", { name: "Roblox eligibility requirements" });
      expect(within(dialog).getByRole("button", { name: "Continue" })).toBeDisabled();
    });
  });

  it("Save as draft creates the draft and confirms", async () => {
    const api = mockApi({
      ...refs,
      "POST /releases": ({ body }) => ({ status: 201, body: { status: true, release: makeRelease({ id: 42, tracks: [], ...(body as object) }) } }),
      "GET /releases/:id/validation": notReady(),
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ id: 42, ...(body as object) }) }),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, fresh);
    await user.click(await screen.findByRole("button", { name: "Save as draft" }));
    await waitFor(() => expect(api.calls("POST /releases")).toHaveLength(1));
    expect(await screen.findByText("Draft saved.")).toBeInTheDocument();
  });

  it("submit goes through once the server says ready and every agreement is ticked", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ cover_image: "https://cdn.test/c.jpg" }) },
      "GET /releases/:id/validation": { validation: { ready: true, errors: [], warnings: [], steps: {}, tracks: {} } },
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ ...(body as object) }) }),
      "POST /releases/:id/submit": { release: makeRelease({ status: "submitted" }) },
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, edit);

    await user.click(await screen.findByRole("button", { name: "Submit release" }));
    expect((await screen.findAllByText("Please confirm to continue.")).length).toBe(4);
    expect(api.calls("POST /releases/:id/submit")).toHaveLength(0);

    for (const name of [/I own or control/, /sell streams/, /another artist's name/, /distribution terms/]) {
      await user.click(screen.getByRole("checkbox", { name }));
    }
    await user.click(screen.getByRole("button", { name: "Submit release" }));
    await waitFor(() => expect(api.calls("POST /releases/:id/submit")).toHaveLength(1));
  });
});
