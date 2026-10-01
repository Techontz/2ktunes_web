import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultUser, mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import SplitsPage from "../SplitsPage";

const release = {
  id: 7,
  release_title: "Nyota",
  version: null,
  artist_name: "Neema Said",
  tracks: [{ id: 70, track_number: 1, title: "Nyota", version: null }],
};

function handlers(extra: Record<string, unknown> = {}) {
  return {
    "GET /splits": { sheets: [], invitations: [] },
    "GET /releases": { releases: [release], meta: { current_page: 1, last_page: 1, per_page: 100, total: 1 }, summary: {} },
    "GET /releases/:id": { release },
    "POST /releases/:id/splits": ({ body }: { body: unknown }) => ({
      status: 201,
      body: { status: true, message: "Invitations sent", sheet: { id: 1, status: "pending", ...(body as object) } },
    }),
    ...extra,
  };
}

describe("SplitsPage", () => {
  it("keeps submit disabled until shares total exactly 100% and posts integer basis points", async () => {
    const api = mockApi(handlers());
    const user = userEvent.setup();
    renderPage(<SplitsPage />, { route: "/dashboard/splits?release=7" });

    const dialog = await screen.findByRole("dialog");
    const submit = within(dialog).getByRole("button", { name: "Send invitations" });
    await within(dialog).findByRole("option", { name: /Nyota — Neema Said/ });
    await waitFor(() => expect(within(dialog).getByLabelText(/^Release/)).toHaveValue("7"));
    expect(submit).toBeDisabled();

    // Owner row is prefilled with the signed-in user.
    await waitFor(() => expect(within(dialog).getAllByLabelText(/^Email/)[0]).toHaveValue(defaultUser.email));
    const percents = () => within(dialog).getAllByLabelText(/^Share \(%\)/);
    await user.type(percents()[0], "62.5");
    expect(submit).toBeDisabled();

    await user.click(within(dialog).getByRole("button", { name: "Add collaborator" }));
    await user.type(within(dialog).getAllByLabelText(/^Name/)[1], "Juma Producer");
    await user.type(within(dialog).getAllByLabelText(/^Email/)[1], "juma@example.com");
    await user.type(percents()[1], "37");
    expect(within(dialog).getByText(/0\.5% left to assign/)).toBeInTheDocument();
    expect(submit).toBeDisabled();

    await user.type(percents()[1], ".5");
    expect(within(dialog).getByText("Adds up to 100%")).toBeInTheDocument();
    expect(submit).toBeEnabled();

    await user.click(submit);
    await waitFor(() => expect(api.calls("POST /releases/:id/splits")).toHaveLength(1));
    const call = api.calls("POST /releases/:id/splits")[0];
    expect(call.params.id).toBe("7");
    const body = call.body as { shares: { share_bp: number; email: string }[] };
    expect(body.shares.map((s) => s.share_bp)).toEqual([6250, 3750]);
    expect(body.shares.every((s) => Number.isInteger(s.share_bp))).toBe(true);
    expect(body.shares[1].email).toBe("juma@example.com");
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
