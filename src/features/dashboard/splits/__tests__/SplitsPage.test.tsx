import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import SplitsPage from "../SplitsPage";

const release = {
  id: 7,
  release_title: "Nyota",
  version: null,
  artist_name: "Neema Said",
  tracks: [
    { id: 70, track_number: 1, title: "Nyota", version: null },
    { id: 71, track_number: 2, title: "Mwezi", version: null },
  ],
};

function handlers(extra: Record<string, unknown> = {}) {
  return {
    "GET /splits": { sheets: [], invitations: [] },
    "GET /splits/collaborators": { collaborators: [{ email: "juma@example.com", name: "Juma Producer" }] },
    "GET /releases": { releases: [release], meta: { current_page: 1, last_page: 1, per_page: 100, total: 1 }, summary: {} },
    "GET /releases/:id": { release },
    "GET /releases/:id/splits": { sheets: [] },
    "POST /releases/:id/splits": ({ body }: { body: unknown }) => ({
      status: 201,
      body: { status: true, message: "Invitations sent", sheet: { id: 1, status: "pending", ...(body as object) } },
    }),
    ...extra,
  };
}

const track = (name: string) => screen.findByRole("region", { name });

describe("SplitsPage", () => {
  it("picks a release, splits each track, reviews and posts one sheet per track", async () => {
    const api = mockApi(handlers());
    const user = userEvent.setup();
    renderPage(<SplitsPage />, { route: "/dashboard/splits" });

    // Step 1: pick a release.
    const next = await screen.findByRole("button", { name: "Next" });
    expect(next).toBeDisabled();
    await screen.findByRole("option", { name: /Nyota · Neema Said/ });
    await user.selectOptions(screen.getByLabelText("Release"), "7");
    await user.click(next);

    // Track 1: 60% me, 40% a past collaborator.
    const t1 = await track("1. Nyota");
    const share1 = within(t1).getByLabelText("Share");
    await user.clear(share1);
    await user.type(share1, "60");
    expect(within(t1).getByText(/40% left to assign/)).toBeInTheDocument();
    await user.click(within(t1).getByRole("button", { name: "Add collaborator" }));
    const shares1 = within(t1).getAllByLabelText("Share");
    await user.type(shares1[1], "40");
    await user.selectOptions(within(t1).getAllByLabelText("Collaborator")[1], "c:juma@example.com");
    expect(within(t1).getByText("Total = 100%")).toBeInTheDocument();

    // Track 2: someone new is paid back 250 USD first, then 0%.
    const t2 = await track("2. Mwezi");
    await user.click(within(t2).getByRole("button", { name: "Add recoupment" }));
    await user.click(within(t2).getByRole("button", { name: "Add collaborator" }));
    await user.selectOptions(within(t2).getAllByLabelText("Collaborator")[1], "new");
    await user.type(within(t2).getByLabelText("Email"), "asha@example.com");
    await user.type(within(t2).getByLabelText("Name"), "Asha Writer");
    await user.type(within(t2).getAllByLabelText("Recoup first")[1], "250");
    await user.type(within(t2).getAllByLabelText("Then share")[1], "0");

    await user.click(screen.getByRole("button", { name: "Review changes" }));
    expect(await screen.findByRole("heading", { name: "Review changes" })).toBeInTheDocument();
    expect(screen.getByText(/USD\s?250\.00 first, then 0%/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(api.calls("POST /releases/:id/splits")).toHaveLength(2));
    const [a, b] = api.calls("POST /releases/:id/splits");
    expect(a.params.id).toBe("7");
    expect(a.body).toMatchObject({
      track_id: 70,
      shares: [
        { email: "neema@example.com", share_bp: 6000 },
        { email: "juma@example.com", name: "Juma Producer", share_bp: 4000 },
      ],
    });
    expect(b.body).toMatchObject({
      track_id: 71,
      shares: [
        { email: "neema@example.com", share_bp: 10000 },
        { email: "asha@example.com", name: "Asha Writer", share_bp: 0, recoup_minor: 25000, recoup_currency: "USD" },
      ],
    });
    expect((a.body as { shares: object[] }).shares[0]).not.toHaveProperty("recoup_minor");
    // Back on the list tab.
    expect(await screen.findByRole("tab", { name: "Your splits and invitations", selected: true })).toBeInTheDocument();
  });

  it("blocks review while a track does not total 100%", async () => {
    const api = mockApi(handlers());
    const user = userEvent.setup();
    renderPage(<SplitsPage />, { route: "/dashboard/splits?release=7" });

    const t1 = await track("1. Nyota");
    const share = within(t1).getByLabelText("Share");
    await user.clear(share);
    await user.type(share, "80");
    expect(within(t1).getByText("Total = 80%")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Review changes" }));
    expect(within(t1).getByText("Shares must add up to exactly 100%.")).toBeInTheDocument();
    expect(screen.getByText(/Some tracks need attention/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument();
    expect(api.calls("POST /releases/:id/splits")).toHaveLength(0);
  });

  it("shows a friendly message when the splits endpoint is not live yet", async () => {
    mockApi(handlers({ "POST /releases/:id/splits": { status: 501, body: { status: false, message: "Not implemented" } } }));
    const user = userEvent.setup();
    renderPage(<SplitsPage />, { route: "/dashboard/splits?release=7" });
    await track("1. Nyota");
    await user.click(screen.getByRole("button", { name: "Review changes" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));
    expect(await screen.findByText(/still being switched on/)).toBeInTheDocument();
  });

  it("answers an emailed invitation from ?invite= and removes the token", async () => {
    const api = mockApi(handlers({ "POST /splits/respond": { share: { id: 3, status: "accepted" } } }));
    const user = userEvent.setup();
    const token = "t".repeat(48);
    renderPage(<SplitsPage />, { route: `/dashboard/splits?invite=${token}` });
    await user.click(await screen.findByRole("button", { name: "Accept" }));
    await waitFor(() => expect(api.calls("POST /splits/respond")).toHaveLength(1));
    expect(api.calls("POST /splits/respond")[0].body).toEqual({ token, accept: true });
    await waitFor(() => expect(screen.queryByText(/invited to a royalty split/)).not.toBeInTheDocument());
  });
});
