import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CreatorProfile } from "@/lib/api/types";
import { mockApi } from "@/test/api";
import { makeOrder } from "@/test/orders";
import { renderPage } from "@/test/render";
import CreatorWorkspacePage from "../CreatorWorkspacePage";
import { videoProblem } from "../PortfolioPanel";

const config = {
  config: {
    marketplace: { platforms: ["tiktok", "instagram"], categories: ["dance"], campaign_types: [], currencies: ["TZS"], platform_fee_bp: 1500 },
  },
};

function profile(over: Partial<CreatorProfile> = {}): CreatorProfile {
  return {
    id: 1, slug: "dada", display_name: "Dada Dance", avatar_url: "https://cdn.example/dada.jpg", country: "TZ", city: null,
    languages: ["sw"], categories: ["dance"], is_available: true, turnaround_days: 3, total_followers: 0,
    has_verified_metrics: false, from_price_minor: null, from_price_currency: null, social_accounts: [],
    bio: "Dancer", status: "approved", review_note: null, packages: [], portfolio: [],
    ...over,
  };
}

const forwarded = makeOrder({
  id: 77,
  role: "creator",
  status: "forwarded",
  platform_fee_minor: 1_500_000,
  creator_payout_minor: 8_500_000,
  artist: { display_name: "Zuri Mwangi" },
  respond_by: new Date(Date.now() + 2 * 86_400_000 + 3_600_000).toISOString(),
  can: { accept: true, decline: true },
});

describe("Creator workspace: requests", () => {
  it("lists forwarded requests with a countdown, then accepts with a note and declines with a reason", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      "GET /release-config": config,
      "GET /creator/profile": { profile: profile() },
      "GET /orders": ({ query }) => ({
        orders: query.get("status") === "forwarded" ? [forwarded] : [],
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      }),
      "POST /orders/:id/accept": { order: { ...forwarded, status: "awaiting_payment" } },
      "POST /orders/:id/decline": { order: { ...forwarded, status: "declined" } },
    });
    renderPage(<CreatorWorkspacePage />, { route: "/dashboard/creator?tab=requests" });

    expect(await screen.findByText("Moyo Wangu · Zuri Mwangi")).toBeInTheDocument();
    expect(screen.getByText("2 days left")).toBeInTheDocument();
    expect(screen.getByText("TZS 85,000.00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open the song/ })).toHaveAttribute("href", "https://open.spotify.com/track/abc");

    await user.click(screen.getByRole("button", { name: "Accept" }));
    let d = within(await screen.findByRole("alertdialog"));
    await user.type(d.getByLabelText(/Note to the artist/), "Friday evening");
    await user.click(d.getByRole("button", { name: "Accept" }));
    await vi.waitFor(() => expect(api.calls("POST /orders/:id/accept")).toHaveLength(1));
    expect(api.calls("POST /orders/:id/accept")[0]).toMatchObject({ params: { id: "77" }, body: { note: "Friday evening" } });

    await user.click(await screen.findByRole("button", { name: "Decline" }));
    d = within(await screen.findByRole("alertdialog"));
    await user.click(d.getByRole("button", { name: "Decline" }));
    expect(api.calls("POST /orders/:id/decline")).toHaveLength(0); // a reason is required
    await user.type(d.getByLabelText(/Reason/), "Not my style");
    await user.click(d.getByRole("button", { name: "Decline" }));
    await vi.waitFor(() => expect(api.calls("POST /orders/:id/decline")).toHaveLength(1));
    expect(api.calls("POST /orders/:id/decline")[0].body).toEqual({ reason: "Not my style" });
  });

  it("submits post links for work in progress", async () => {
    const user = userEvent.setup();
    const active = { ...forwarded, status: "in_progress" as const, due_at: "2026-10-09T00:00:00Z", can: { submit: true } };
    const api = mockApi({
      "GET /release-config": config,
      "GET /creator/profile": { profile: profile() },
      "GET /orders": { orders: [active], meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 } },
      "POST /orders/:id/submit": { order: { ...active, status: "submitted" } },
    });
    renderPage(<CreatorWorkspacePage />, { route: "/dashboard/creator?tab=active" });
    await user.click(await screen.findByRole("button", { name: "Submit post links" }));
    const d = within(await screen.findByRole("dialog"));
    await user.type(d.getByLabelText(/Post link 1/), "https://www.tiktok.com/@dada/video/9");
    await user.click(d.getByRole("button", { name: "Submit post links" }));
    await vi.waitFor(() => expect(api.calls("POST /orders/:id/submit")).toHaveLength(1));
    expect(api.calls("POST /orders/:id/submit")[0].body).toEqual({ urls: ["https://www.tiktok.com/@dada/video/9"] });
  });

  it("shows pending (held, not withdrawable) apart from available earnings", async () => {
    mockApi({
      "GET /release-config": config,
      "GET /creator/profile": { profile: profile() },
      "GET /creator/earnings": {
        earnings: [{ currency: "TZS", pending_minor: 8_500_000, pending_orders: 1, pending_withdrawable: false, available_minor: 1_200_000, lifetime_earned_minor: 3_400_000 }],
        platform_fee_bp: 1500,
        note: "x",
      },
    });
    renderPage(<CreatorWorkspacePage />, { route: "/dashboard/creator?tab=earnings" });
    const pending = (await screen.findByText(/^Pending · TZS/)).closest("div[aria-labelledby], [aria-labelledby]") as HTMLElement;
    expect(within(pending).getByText("TZS 85,000.00")).toBeInTheDocument();
    expect(within(pending).getByText("Not withdrawable")).toBeInTheDocument();
    expect(within(pending).getByText(/moves to your wallet when 2kTunes verifies your post/)).toBeInTheDocument();
    const available = screen.getByText(/^Available · TZS/).closest("[aria-labelledby]") as HTMLElement;
    expect(within(available).getByText("TZS 12,000.00")).toBeInTheDocument();
    expect(within(available).getByRole("link", { name: /Go to wallet/ })).toHaveAttribute("href", "/dashboard/wallet");
    expect(screen.getByText(/15% platform fee/)).toBeInTheDocument();
  });
});

describe("Creator workspace: required photo", () => {
  it("blocks submitting for review until a profile photo is uploaded", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const api = mockApi({
      "GET /release-config": config,
      "GET /creator/profile": { profile: profile({ status: "draft", avatar_url: null }) },
      "POST /creator/profile/avatar": { profile: profile({ status: "draft", avatar_url: "https://cdn.example/new.jpg" }) },
    });
    renderPage(<CreatorWorkspacePage />, { route: "/dashboard/creator?tab=profile" });

    expect(await screen.findByRole("heading", { name: "Step 1: add your profile photo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeDisabled();
    expect(screen.getByText("Add a profile photo before you submit for review.")).toBeInTheDocument();

    // Wrong type is refused client-side.
    const input = screen.getByTestId("creator-photo-input");
    await user.upload(input, new File(["x"], "doc.pdf", { type: "application/pdf" }));
    expect(await screen.findByText("Use a JPG, PNG or WebP image.")).toBeInTheDocument();
    expect(api.calls("POST /creator/profile/avatar")).toHaveLength(0);

    await user.upload(input, new File(["img"], "me.png", { type: "image/png" }));
    await vi.waitFor(() => expect(api.calls("POST /creator/profile/avatar")).toHaveLength(1));
    expect(api.calls("POST /creator/profile/avatar")[0].body).toBeInstanceOf(FormData);
    await vi.waitFor(() => expect(screen.getByRole("button", { name: "Submit for review" })).toBeEnabled());
  });

  it("refuses portfolio videos that are not MP4/WebM or larger than 50 MB", () => {
    const big = new File(["x"], "big.mp4", { type: "video/mp4" });
    Object.defineProperty(big, "size", { value: 51 * 1024 * 1024 });
    expect(videoProblem(big)).toBe("size");
    expect(videoProblem(new File(["x"], "a.mov", { type: "video/quicktime" }))).toBe("type");
    expect(videoProblem(new File(["x"], "a.webm", { type: "video/webm" }))).toBeNull();
  });
});
