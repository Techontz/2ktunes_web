import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import NotificationsPage from "../NotificationsPage";

const meta = { current_page: 1, last_page: 1, per_page: 30, total: 2 };
const prefs = {
  preferences: {
    releases: { database: true, mail: true },
    royalties: { database: true, mail: false },
    payouts: { database: true, mail: true },
    marketplace: { database: true, mail: true },
    support: { database: true, mail: true },
    product_updates: { database: false, mail: false },
  },
  categories: ["releases", "royalties", "payouts", "marketplace", "support", "product_updates"],
};

const items = [
  {
    id: "a1",
    event: "release.live",
    category: "releases",
    title: "Nyota is live",
    body: "Your release is now on Spotify.",
    action_path: "/dashboard/music/7",
    data: null,
    read_at: null,
    created_at: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "a2",
    event: "payout.paid",
    category: "payouts",
    title: "Withdrawal paid",
    body: "TZS 25,000 was sent to your M-Pesa.",
    action_path: null,
    data: null,
    read_at: "2026-09-01T00:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
  },
];

describe("NotificationsPage", () => {
  it("shows an empty state when there are no notifications", async () => {
    mockApi({ "GET /notification-preferences": prefs });
    renderPage(<NotificationsPage />);
    expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mark all as read" })).not.toBeInTheDocument();
  });

  it("marks all as read through the API", async () => {
    const api = mockApi({
      "GET /notifications": { notifications: items, unread: 1, meta },
      "POST /notifications/read-all": {},
      "GET /notification-preferences": prefs,
    });
    const user = userEvent.setup();
    renderPage(<NotificationsPage />);
    expect(await screen.findByText("Nyota is live")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mark all as read" }));
    await waitFor(() => expect(api.calls("POST /notifications/read-all")).toHaveLength(1));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Mark all as read" })).not.toBeInTheDocument());
  });

  it("saves preference changes with PUT", async () => {
    const api = mockApi({
      "GET /notification-preferences": prefs,
      "PUT /notification-preferences": ({ body }) => body as object,
    });
    const user = userEvent.setup();
    renderPage(<NotificationsPage />);
    await user.click(await screen.findByLabelText(/Email, Royalties/, {}, { timeout: 3000 }));
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    await waitFor(() => expect(api.calls("PUT /notification-preferences")).toHaveLength(1));
    expect(api.calls("PUT /notification-preferences")[0].body).toMatchObject({
      preferences: { royalties: { database: true, mail: true } },
    });
  });
});
