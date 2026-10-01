import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
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

describe("ReleaseWizardPage", () => {
  const refs = {
    "GET /release-config": { config: releaseConfig },
    "GET /stores": { stores },
    "GET /artists": { artists: [{ id: 3, name: "Neema", avatar_url: null }], user: { id: 1, plan: null }, limit: 1 },
  };

  it("new release: step 1 blocks on missing fields, then creates the draft", async () => {
    const api = mockApi({
      ...refs,
      "POST /releases": ({ body }) => ({ status: 201, body: { status: true, release: makeRelease({ id: 42, ...(body as object) }) } }),
      "GET /releases/:id": { release: makeRelease({ id: 42 }) },
      "GET /releases/:id/validation": { validation: { ready: false, errors: [], warnings: [], steps: {}, tracks: {} } },
      "PATCH /releases/:id": { release: makeRelease({ id: 42 }) },
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, { route: "/dashboard/new-release", path: "/dashboard/new-release" });

    await user.click(await screen.findByRole("button", { name: /Create draft/ }));
    expect(api.calls("POST /releases")).toHaveLength(0);
    expect(screen.getAllByText("This is required.").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("radio", { name: /Single/ }));
    await user.type(screen.getByLabelText(/Release title/), "Bahari");
    await user.selectOptions(screen.getByLabelText(/Primary genre/), "Bongo Flava");
    await user.selectOptions(screen.getByLabelText(/Language of title/), "sw");
    await user.type(screen.getByLabelText(/Release date/), "2027-01-15");
    await user.click(screen.getByRole("button", { name: /Create draft/ }));

    await waitFor(() => expect(api.calls("POST /releases")).toHaveLength(1));
    expect(api.calls("POST /releases")[0].body).toMatchObject({
      release_type: "Single",
      release_title: "Bahari",
      artist_id: 3,
      primary_genre: "Bongo Flava",
      language: "sw",
      release_date: "2027-01-15",
      c_line_owner: "Neema",
    });
  });

  it("locked releases can't be edited", async () => {
    mockApi({ ...refs, "GET /releases/:id": { release: makeRelease({ status: "live", is_editable: false }) } });
    renderPage(<ReleaseWizardPage />, { route: "/dashboard/music/7/edit", path: "/dashboard/music/:id/edit" });
    expect(await screen.findByText("This release can't be edited")).toBeInTheDocument();
  });

  it("tracks step: Next is blocked until every track has audio", async () => {
    mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ tracks: [makeTrack({ audio: null })] }) },
      "GET /releases/:id/validation": { validation: { ready: false, errors: [], warnings: [], steps: {}, tracks: {} } },
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, { route: "/dashboard/music/7/edit?step=tracks", path: "/dashboard/music/:id/edit" });
    await user.click(await screen.findByRole("button", { name: "Next" }));
    expect(await screen.findByText("Track 1: upload the audio.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload audio" })).toBeInTheDocument();
  });

  it("stores step: territories use a country multi-select and PATCH ISO codes", async () => {
    const api = mockApi({
      ...refs,
      "GET /releases/:id": { release: makeRelease({ platforms: ["spotify"] }) },
      "GET /releases/:id/validation": { validation: { ready: false, errors: [], warnings: [], steps: {}, tracks: {} } },
      "PATCH /releases/:id": ({ body }) => ({ release: makeRelease({ platforms: ["spotify"], ...(body as object) }) }),
    });
    const user = userEvent.setup();
    renderPage(<ReleaseWizardPage />, { route: "/dashboard/music/7/edit?step=stores", path: "/dashboard/music/:id/edit" });

    await user.click(await screen.findByRole("radio", { name: /Only selected countries/ }));
    // No free-text code box any more.
    expect(screen.queryByRole("textbox", { name: /Countries/ })).not.toBeInTheDocument();
    const picker = screen.getByRole("combobox", { name: /Countries/ });
    await user.type(picker, "Kenya");
    await user.keyboard("{Enter}");
    await user.type(picker, "Tanz");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Remove Kenya" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => {
      const patches = api.calls("PATCH /releases/:id").map((c) => c.body as { territories?: unknown });
      expect(patches.some((b) => JSON.stringify(b.territories) === JSON.stringify({ mode: "include", countries: ["KE", "TZ"] }))).toBe(true);
    });
  });
});
