import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import SettingsPage from "../SettingsPage";

describe("SettingsPage", () => {
  it("shows password_incorrect under the current password field", async () => {
    const api = mockApi({
      "PATCH /profile": {
        status: 422,
        body: {
          status: false,
          code: "password_incorrect",
          message: "Current password incorrect",
          errors: { current_password: ["Current password incorrect"] },
        },
      },
    });
    const user = userEvent.setup();
    renderPage(<SettingsPage />, { route: "/dashboard/settings" });
    const section = await screen.findByRole("region", { name: "Password" });
    const s = within(section);
    await user.type(s.getByLabelText(/^Current password/), "wrong-pass");
    await user.type(s.getByLabelText(/^New password/), "brand-new-pass");
    await user.type(s.getByLabelText(/^Confirm new password/), "brand-new-pass");
    await user.click(s.getByRole("button", { name: "Change password" }));
    await waitFor(() => expect(api.calls("PATCH /profile")).toHaveLength(1));
    expect(api.calls("PATCH /profile")[0].body).toMatchObject({
      current_password: "wrong-pass",
      new_password: "brand-new-pass",
      new_password_confirmation: "brand-new-pass",
    });
    expect(await s.findByText("Current password incorrect")).toBeInTheDocument();
  });

  it("explains balance_remaining when deleting the account", async () => {
    mockApi({
      "DELETE /delete-account": {
        status: 422,
        body: { status: false, code: "balance_remaining", message: "Withdraw first." },
      },
    });
    const user = userEvent.setup();
    renderPage(<SettingsPage />, { route: "/dashboard/settings" });
    await user.click(await screen.findByRole("button", { name: "Delete my account" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText(/^Current password/), "secret-pass");
    await user.click(within(dialog).getByRole("button", { name: "Delete account" }));
    expect(await screen.findByRole("link", { name: "Go to wallet" })).toHaveAttribute("href", "/dashboard/wallet");
  });
});
