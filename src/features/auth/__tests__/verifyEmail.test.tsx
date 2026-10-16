import { describe, expect, it } from "vitest";
import { useEffect } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastProvider } from "@/components/ui";
import { request } from "@/lib/api/client";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { RedirectIfAuthenticated, RequireAuth } from "@/lib/auth/guards";
import { LanguageProvider } from "@/lib/LanguageContext";
import { defaultUser, mockApi } from "@/test/api";
import AuthPage from "../AuthPage";
import VerifyEmailPage, { RESEND_COOLDOWN_SECONDS } from "../VerifyEmailPage";
import { EmailVerifiedPage } from "../RecoveryPages";

const unverified = { ...defaultUser, email_verified: false, email_verified_at: null };
const freshAccount = { ...unverified, onboarding_completed_at: null };

function Where() {
  const loc = useLocation();
  return <p data-testid="where">{loc.pathname + loc.search}</p>;
}

/** A dashboard page that fires one authenticated request on mount. */
function Wallet() {
  useEffect(() => {
    request("/wallet").catch(() => {});
  }, []);
  return <p>wallet page</p>;
}

function renderApp(route: string, { token = "ok" }: { token?: string | null } = {}) {
  if (token) localStorage.setItem("2ktunes.token", token);
  else localStorage.removeItem("2ktunes.token");
  return render(
    <LanguageProvider initial="EN">
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route
                path="/auth"
                element={
                  <RedirectIfAuthenticated>
                    <AuthPage />
                  </RedirectIfAuthenticated>
                }
              />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/email-verified" element={<EmailVerifiedPage />} />
              <Route
                path="/onboarding"
                element={
                  <RequireAuth>
                    <p>onboarding page</p>
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard/*"
                element={
                  <RequireAuth>
                    <Routes>
                      <Route path="music" element={<p>dashboard home</p>} />
                      <Route path="wallet" element={<Wallet />} />
                    </Routes>
                  </RequireAuth>
                }
              />
            </Routes>
            <Where />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

const where = () => screen.getByTestId("where").textContent;

describe("email verification gate", () => {
  it("sends an unverified account from the dashboard to /verify-email, keeping ?next", async () => {
    mockApi({ "GET /profile": { user: unverified } });
    renderApp("/dashboard/wallet?tab=methods");
    await screen.findByRole("heading", { name: "Check your email" });
    expect(where()).toBe(`/verify-email?next=${encodeURIComponent("/dashboard/wallet?tab=methods")}`);
    expect(screen.getByText(defaultUser.email)).toBeInTheDocument();
  });

  it("guards /onboarding too", async () => {
    mockApi({ "GET /profile": { user: freshAccount } });
    renderApp("/onboarding");
    await screen.findByRole("heading", { name: "Check your email" });
    expect(where()).toBe(`/verify-email?next=${encodeURIComponent("/onboarding")}`);
  });

  it("sends a verified user away from /verify-email to the dashboard", async () => {
    mockApi({});
    renderApp("/verify-email");
    await screen.findByText("dashboard home");
    expect(where()).toBe("/dashboard/music");
  });

  it("goes straight to /verify-email after registering", async () => {
    const api = mockApi({
      "POST /register": { status: 201, body: { status: true, message: "ok", token: "new-token", user: freshAccount } },
      "GET /profile": { user: freshAccount },
    });
    renderApp("/auth?mode=register", { token: null });
    await userEvent.type(await screen.findByLabelText("Full name"), "Neema Said");
    await userEvent.type(screen.getByLabelText("Email address"), "neema@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "secret-pass-1");
    await userEvent.type(screen.getByLabelText("Confirm password"), "secret-pass-1");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    await screen.findByRole("heading", { name: "Check your email" });
    expect(where()).toBe("/verify-email");
    expect(api.calls("POST /register")).toHaveLength(1);
    expect(localStorage.getItem("2ktunes.token")).toBe("new-token");
  });

  it("sends an unverified account to /verify-email after logging in", async () => {
    mockApi({
      "POST /login": { message: "ok", token: "t", user: unverified },
      "GET /profile": { user: unverified },
    });
    renderApp("/auth", { token: null });
    await userEvent.type(await screen.findByLabelText("Email address"), "neema@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "secret-pass-1");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    await screen.findByRole("heading", { name: "Check your email" });
    expect(where()).toBe("/verify-email");
  });

  it("routes any 403 email_unverified response to /verify-email without signing out", async () => {
    mockApi({
      "GET /wallet": {
        status: 403,
        body: { status: false, code: "email_unverified", message: "Please confirm your email address to continue." },
      },
      // The profile still says unverified when the verify page polls.
      "GET /profile": (() => {
        let n = 0;
        return () => ({ user: n++ === 0 ? defaultUser : unverified });
      })(),
    });
    renderApp("/dashboard/wallet");
    await screen.findByRole("heading", { name: "Check your email" });
    expect(where()).toBe(`/verify-email?next=${encodeURIComponent("/dashboard/wallet")}`);
    expect(localStorage.getItem("2ktunes.token")).toBe("ok");
  });

  it("resends the email, confirms with a toast and starts a cooldown", async () => {
    const api = mockApi({ "GET /profile": { user: unverified }, "POST /email/resend": { message: "Verification email sent" } });
    renderApp("/verify-email");
    await userEvent.click(await screen.findByRole("button", { name: "Resend email" }));
    await screen.findByText("Email sent");
    expect(screen.getByText(`We sent a new link to ${defaultUser.email}.`)).toBeInTheDocument();
    expect(api.calls("POST /email/resend")).toHaveLength(1);
    const cooling = screen.getByRole("button", { name: `Resend in ${RESEND_COOLDOWN_SECONDS}s` });
    expect(cooling).toBeDisabled();
  });

  it("shows the throttle message when the API rate limits the resend", async () => {
    mockApi({
      "GET /profile": { user: unverified },
      "POST /email/resend": { status: 429, body: { status: false, code: "rate_limited", message: "Too many attempts." } },
    });
    renderApp("/verify-email");
    await userEvent.click(await screen.findByRole("button", { name: "Resend email" }));
    await screen.findByText("Please wait a minute before asking for another email.");
    expect(screen.getByRole("button", { name: /Resend in \d+s/ })).toBeDisabled();
  });

  it("\"I've confirmed it\" says so when still unverified, and moves on once verified", async () => {
    let verified = false;
    mockApi({ "GET /profile": () => ({ user: verified ? defaultUser : unverified }) });
    renderApp(`/verify-email?next=${encodeURIComponent("/dashboard/wallet")}`);
    await userEvent.click(await screen.findByRole("button", { name: "I've confirmed it" }));
    await screen.findByText(/We can't see the confirmation yet/);

    verified = true;
    await userEvent.click(screen.getByRole("button", { name: "I've confirmed it" }));
    await screen.findByText("wallet page");
    expect(where()).toBe("/dashboard/wallet");
  });

  it("continues to onboarding when a new account confirms", async () => {
    let verified = false;
    mockApi({
      "GET /profile": () => ({ user: verified ? { ...freshAccount, email_verified: true, email_verified_at: "2026-10-15T00:00:00Z" } : freshAccount }),
    });
    renderApp("/verify-email");
    await screen.findByRole("heading", { name: "Check your email" });
    verified = true;
    // Coming back to the tab re-checks without a click.
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    await screen.findByText("onboarding page");
    expect(where()).toBe("/onboarding");
  });

  it("changes a mistyped email and sends a new link", async () => {
    let email = defaultUser.email;
    const api = mockApi({
      "GET /profile": () => ({ user: { ...unverified, email } }),
      "PATCH /profile": ({ body }) => {
        email = (body as { email: string }).email;
        return { message: "Profile updated successfully", user: { ...unverified, email } };
      },
    });
    renderApp("/verify-email");
    await userEvent.click(await screen.findByRole("button", { name: "Use a different email" }));
    await userEvent.type(screen.getByLabelText("New email address"), "neema.said@example.com");
    await userEvent.type(screen.getByLabelText("Your password"), "secret-pass-1");
    await userEvent.click(screen.getByRole("button", { name: "Send the link to this email" }));
    await screen.findByText("Email updated");
    expect(api.calls("PATCH /profile")[0].body).toEqual({ email: "neema.said@example.com", current_password: "secret-pass-1" });
    await waitFor(() => expect(screen.getByText("neema.said@example.com", { selector: "strong" })).toBeInTheDocument());
  });

  it("signs out from the verify screen", async () => {
    const api = mockApi({ "GET /profile": { user: unverified }, "POST /logout": { message: "ok" } });
    renderApp("/verify-email");
    await userEvent.click(await screen.findByRole("button", { name: "Sign out" }));
    await screen.findByRole("button", { name: "Log in" });
    expect(api.calls("POST /logout")).toHaveLength(1);
    expect(localStorage.getItem("2ktunes.token")).toBeNull();
  });
});

describe("/email-verified", () => {
  it("signed in: refreshes the user, says Email confirmed and continues to the dashboard", async () => {
    let n = 0;
    const api = mockApi({ "GET /profile": () => ({ user: n++ === 0 ? unverified : defaultUser }) });
    renderApp("/email-verified?status=success");
    await screen.findByRole("heading", { name: "Email confirmed" });
    const cont = await screen.findByRole("link", { name: "Continue" });
    await waitFor(() => expect(api.calls("GET /profile").length).toBeGreaterThanOrEqual(2));
    await waitFor(() => expect(cont).toHaveAttribute("href", "/dashboard/music"));
    await userEvent.click(cont);
    await screen.findByText("dashboard home");
  });

  it("signed out: says Email confirmed and asks to sign in", async () => {
    mockApi({});
    renderApp("/email-verified?status=success", { token: null });
    await screen.findByRole("heading", { name: "Email confirmed" });
    expect(screen.getByText("Your email address is confirmed. Sign in to continue.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/auth");
  });

  it("expired link while signed in offers a resend and a way back", async () => {
    const api = mockApi({ "GET /profile": { user: unverified }, "POST /email/resend": { message: "sent" } });
    renderApp("/email-verified?status=expired");
    await userEvent.click(await screen.findByRole("button", { name: "Send a new verification email" }));
    await screen.findByText("A new verification email is on its way.");
    expect(api.calls("POST /email/resend")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Back to email confirmation" })).toHaveAttribute("href", "/verify-email");
  });
});
