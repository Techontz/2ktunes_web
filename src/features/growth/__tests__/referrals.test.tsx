import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import ReferralsPage from "@/features/dashboard/referrals/ReferralsPage";
import { InviteCard } from "@/features/dashboard/referrals/InviteCard";
import AuthPage from "@/features/auth/AuthPage";
import JoinPage from "../JoinPage";

const friendGets = {
  mode: "percent",
  discount_bp: 2000,
  plans: [{ plan_id: 1, plan_name: "Basic Plan", duration_days: 365, list_minor: 2_000_000, price_minor: 1_600_000, currency: "TZS" }],
  text: "20% off your first plan",
};

const newUser = {
  id: 9, name: "Amani", email: "amani@example.com", avatar: null, business_name: null, first_name: null, last_name: null,
  phone: null, country: null, onboarding_completed_at: null, created_at: "2026-10-02T00:00:00Z", updated_at: "2026-10-02T00:00:00Z",
};

async function fillAndRegister(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "Amani Juma");
  await user.type(screen.getByLabelText("Email address"), "amani@example.com");
  await user.type(screen.getByLabelText("Password"), "secret123");
  await user.type(screen.getByLabelText("Confirm password"), "secret123");
  await user.click(screen.getByRole("button", { name: "Create account" }));
}

describe("/join/:code", () => {
  it("welcomes a valid invite and registers with the referral code", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      "GET /public/referral/:code": ({ params }) => ({
        referral: { valid: true, code: params.code.toUpperCase(), referrer_name: "Zuri", friend_gets: friendGets, message: "Invited by Zuri" },
      }),
      "POST /register": { status: 201, body: { status: true, message: "ok", token: "t", user: newUser, referral: { applied: true, reason: null } } },
      "GET /profile": { user: newUser },
    });
    renderPage(<JoinPage />, { route: "/join/k7m2q9xa", path: "/join/:code", signedIn: false });

    expect(await screen.findByRole("heading", { name: "Zuri invited you to 2kTunes" })).toBeInTheDocument();
    expect(screen.getByText("20% off your first plan")).toBeInTheDocument();
    expect(screen.getAllByText("Invite code K7M2Q9XA").length).toBeGreaterThan(0);
    expect(api.calls("GET /public/referral/:code")[0].params.code).toBe("K7M2Q9XA");

    await fillAndRegister(user);
    await vi.waitFor(() => expect(api.calls("POST /register")).toHaveLength(1));
    expect(api.calls("POST /register")[0].body).toMatchObject({ referral_code: "K7M2Q9XA", email: "amani@example.com" });
    expect(await screen.findByText("Invite applied")).toBeInTheDocument();
  });

  it("lets people join with a gentle note when the code is not valid", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      "GET /public/referral/:code": { referral: { valid: false, code: "NOPE1234" } },
      "POST /register": { status: 201, body: { status: true, message: "ok", token: "t", user: newUser } },
      "GET /profile": { user: newUser },
    });
    renderPage(<JoinPage />, { route: "/join/NOPE1234", path: "/join/:code", signedIn: false });
    expect(await screen.findByText(/isn't active, but you can still join/)).toBeInTheDocument();
    expect(screen.queryByText(/invited you/)).not.toBeInTheDocument();
    await fillAndRegister(user);
    await vi.waitFor(() => expect(api.calls("POST /register")).toHaveLength(1));
    expect(api.calls("POST /register")[0].body).not.toHaveProperty("referral_code");
  });

  it("the auth page reads ?ref= and sends it", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      "POST /register": { status: 201, body: { status: true, message: "ok", token: "t", user: newUser, referral: { applied: false, reason: "self_referral" } } },
      "GET /profile": { user: newUser },
    });
    renderPage(<AuthPage />, { route: "/auth?mode=register&ref=abcd2345", signedIn: false });
    expect(await screen.findByText("Invite code ABCD2345")).toBeInTheDocument();
    await fillAndRegister(user);
    await vi.waitFor(() => expect(api.calls("POST /register")).toHaveLength(1));
    expect(api.calls("POST /register")[0].body).toMatchObject({ referral_code: "ABCD2345" });
    expect(await screen.findByText("You can't use your own invite link.")).toBeInTheDocument();
  });
});

const summary = (enabled: boolean) => ({
  referral: {
    code: "K7M2Q9XA",
    link: "https://2ktunes.com/join/K7M2Q9XA",
    program: {
      enabled,
      friend_gets: friendGets,
      you_get: { type: "wallet_credit", amount_minor: 500_000, currency: "TZS", free_days: 0, text: "x" },
      reward_trigger: "on_first_paid_subscription",
      hold_days: 7,
      max_rewards_per_month: 10,
    },
    stats: { joined: 3, qualified: 2, rewarded: 1, pending_rewards: 1, rejected: 0, earned: [{ currency: "TZS", amount_minor: 500_000 }], free_days_earned: 0 },
    referrals: [
      { id: 5, initials: "AJ", status: "qualified", reward_pending: true, reward_skipped: false, joined_at: "2026-09-01T00:00:00Z", qualified_at: "2026-09-10T00:00:00Z", reward_due_at: "2026-09-17T00:00:00Z", rewarded_at: null },
      { id: 4, initials: "NM", status: "rewarded", reward_pending: false, reward_skipped: false, joined_at: "2026-08-01T00:00:00Z", qualified_at: "2026-08-03T00:00:00Z", reward_due_at: null, rewarded_at: "2026-08-10T00:00:00Z" },
    ],
  },
});

describe("Invite artists page", () => {
  it("shows the link, share buttons, rewards, stats and friends' initials", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    const user = userEvent.setup();
    mockApi({ "GET /referrals": summary(true) });
    renderPage(<ReferralsPage />, { route: "/dashboard/referrals" });

    expect(await screen.findByTestId("referral-link")).toHaveTextContent("https://2ktunes.com/join/K7M2Q9XA");
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
    for (const name of ["WhatsApp", "X", "Facebook", "Telegram"]) expect(screen.getByRole("link", { name })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "WhatsApp" }).getAttribute("href")).toContain("wa.me");
    expect(screen.getByText("20% off your first plan")).toBeInTheDocument();
    expect(screen.getByText(/TZS 5,000 in your wallet for each friend who joins and starts a paid plan/)).toBeInTheDocument();

    const stats = screen.getByRole("heading", { name: "Your invites" }).closest("section")!;
    expect(within(stats).getByText("Joined").parentElement?.parentElement).toHaveTextContent("3");
    expect(within(stats).getByText("TZS 5,000.00")).toBeInTheDocument();
    expect(screen.getAllByText("AJ").length).toBeGreaterThan(0);
    expect(screen.getByText("Qualified", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(/Reward due/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: "https://2ktunes.com/join/K7M2Q9XA" }));
    Reflect.deleteProperty(navigator, "share");
  });

  it("shows a friendly coming-soon state when the program is off", async () => {
    mockApi({ "GET /referrals": summary(false) });
    renderPage(<ReferralsPage />, { route: "/dashboard/referrals" });
    expect(await screen.findByText("Invites are coming soon")).toBeInTheDocument();
    expect(screen.queryByTestId("referral-link")).not.toBeInTheDocument();
  });

  it("the overview card appears only while the program is enabled", async () => {
    mockApi({ "GET /referrals": summary(true) });
    const { unmount } = renderPage(<InviteCard />, { route: "/dashboard" });
    expect(await screen.findByText("Invite artists, earn rewards")).toBeInTheDocument();
    unmount();
    mockApi({ "GET /referrals": summary(false) });
    renderPage(<InviteCard />, { route: "/dashboard" });
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText("Invite artists, earn rewards")).not.toBeInTheDocument();
  });
});
