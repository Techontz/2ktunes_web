import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import HelpArticlePage from "../HelpArticlePage";
import SupportPage from "../SupportPage";
import TicketDetailPage from "../TicketDetailPage";

const meta = { current_page: 1, last_page: 1, per_page: 20, total: 0 };
const ticket = {
  id: 9,
  reference: "TABC1234",
  category: "payouts",
  subject: "Withdrawal pending",
  status: "closed",
  last_activity_at: "2026-09-01T10:00:00Z",
  created_at: "2026-09-01T09:00:00Z",
  messages: [
    { id: 1, body: "My M-Pesa withdrawal is still pending.", is_staff: false, attachment_name: "receipt.png", created_at: "2026-09-01T09:00:00Z" },
    { id: 2, body: "It has been paid now.", is_staff: true, attachment_name: null, created_at: "2026-09-01T10:00:00Z" },
  ],
};

describe("Support", () => {
  it("creates a ticket as multipart form data", async () => {
    const api = mockApi({
      "GET /support/tickets": { tickets: [], meta },
      "GET /releases": { releases: [], meta, summary: {} },
      "POST /support/tickets": { status: 201, body: { status: true, ticket: { ...ticket, status: "awaiting_support" } } },
      "GET /support/tickets/:id": { ticket },
    });
    const user = userEvent.setup();
    renderPage(<SupportPage />, { route: "/dashboard/support" });
    expect(await screen.findByText("No tickets yet")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "New ticket" })[0]);
    await user.selectOptions(await screen.findByLabelText(/^Topic/), "payouts");
    await user.type(screen.getByLabelText(/^Subject/), "Withdrawal pending");
    await user.type(screen.getByLabelText(/^Message/), "short");
    await user.click(screen.getByRole("button", { name: "Send ticket" }));
    expect(await screen.findByText("Write at least 10 characters.")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^Message/), " but now long enough");
    await user.click(screen.getByRole("button", { name: "Send ticket" }));
    await waitFor(() => expect(api.calls("POST /support/tickets")).toHaveLength(1));
    const body = api.calls("POST /support/tickets")[0].body as FormData;
    expect(body.get("category")).toBe("payouts");
    expect(body.get("subject")).toBe("Withdrawal pending");
  });

  it("shows the thread and disables replies on a closed ticket", async () => {
    mockApi({ "GET /support/tickets/:id": { ticket } });
    renderPage(<TicketDetailPage />, { route: "/dashboard/support/9", path: "/dashboard/support/:id" });
    expect(await screen.findByText("It has been paid now.")).toBeInTheDocument();
    expect(screen.getByText("2kTunes support")).toBeInTheDocument();
    expect(screen.getByText("receipt.png")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send reply" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open a new ticket" })).toHaveAttribute("href", "/dashboard/support?new=1");
  });

  it("renders a help article as plain paragraphs", async () => {
    mockApi({
      "GET /help/:slug": {
        article: {
          id: 1,
          slug: "artwork",
          category: "releases",
          title: "Artwork requirements",
          summary: null,
          locale: "en",
          body: "First paragraph <b>not html</b>.\n\nSecond paragraph.",
        },
      },
    });
    renderPage(<HelpArticlePage />, { route: "/dashboard/help/artwork", path: "/dashboard/help/:slug" });
    expect(await screen.findByText("First paragraph <b>not html</b>.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph.")).toBeInTheDocument();
  });
});
