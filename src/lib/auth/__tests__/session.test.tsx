import { describe, expect, it } from "vitest";
import { useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { request } from "@/lib/api/client";
import { useAuth, AuthProvider } from "@/lib/auth/AuthProvider";
import { RedirectIfAuthenticated, RequireAuth } from "@/lib/auth/guards";
import { LanguageProvider } from "@/lib/LanguageContext";
import { mockApi } from "@/test/api";

/** Shows where the router ended up. */
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

function SignOut() {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={() => void logout()}>
      sign out
    </button>
  );
}

function renderApp(route: string, { token }: { token?: string } = {}) {
  if (token) localStorage.setItem("2ktunes.token", token);
  return render(
    <LanguageProvider initial="EN">
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/auth"
              element={
                <RedirectIfAuthenticated>
                  <p>auth page</p>
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <RequireAuth>
                  <Routes>
                    <Route index element={<p>dashboard home</p>} />
                    <Route path="wallet" element={<Wallet />} />
                    <Route path="settings" element={<SignOut />} />
                  </Routes>
                </RequireAuth>
              }
            />
          </Routes>
          <Where />
        </AuthProvider>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

const where = () => screen.getByTestId("where").textContent;

describe("session handling", () => {
  it("sends a signed-out visitor to /auth with the deep link in ?next", async () => {
    mockApi({});
    renderApp("/dashboard/wallet?tab=methods");
    await screen.findByText("auth page");
    expect(where()).toBe(`/auth?next=${encodeURIComponent("/dashboard/wallet?tab=methods")}`);
  });

  it("treats an expired stored token (401 on /profile) as signed out and clears it", async () => {
    mockApi({ "GET /profile": { status: 401, body: { status: false, code: "unauthenticated", message: "Unauthenticated." } } });
    renderApp("/dashboard/wallet", { token: "expired" });
    await screen.findByText("auth page");
    expect(where()).toBe(`/auth?next=${encodeURIComponent("/dashboard/wallet")}`);
    expect(localStorage.getItem("2ktunes.token")).toBeNull();
  });

  it("signs out and redirects when a request 401s mid-session", async () => {
    mockApi({ "GET /wallet": { status: 401, body: { status: false, code: "unauthenticated", message: "Unauthenticated." } } });
    renderApp("/dashboard/wallet", { token: "revoked-later" });
    await screen.findByText("auth page");
    expect(where()).toBe(`/auth?next=${encodeURIComponent("/dashboard/wallet")}`);
    expect(localStorage.getItem("2ktunes.token")).toBeNull();
  });

  it("keeps a signed-in user off /auth and ignores an off-site ?next", async () => {
    mockApi({});
    renderApp(`/auth?next=${encodeURIComponent("//evil.example")}`, { token: "ok" });
    await screen.findByText("dashboard home");
    expect(where()).toBe("/dashboard");
  });

  it("does not loop when ?next points back at /auth", async () => {
    mockApi({});
    renderApp(`/auth?next=${encodeURIComponent("/auth?next=/auth")}`, { token: "ok" });
    await screen.findByText("dashboard home");
    expect(where()).toBe("/dashboard");
  });

  it("logout revokes the token server-side and clears local session state", async () => {
    const api = mockApi({ "POST /logout": { message: "Logged out." } });
    localStorage.setItem("2ktunes.upload.audio.abc.123", "session-1");
    localStorage.setItem("2ktunes.lang", "SW");
    renderApp("/dashboard/settings", { token: "ok" });
    await userEvent.click(await screen.findByRole("button", { name: "sign out" }));
    await screen.findByText("auth page");
    expect(api.calls("POST /logout")).toHaveLength(1);
    expect(localStorage.getItem("2ktunes.token")).toBeNull();
    expect(localStorage.getItem("2ktunes.upload.audio.abc.123")).toBeNull();
    // A device preference, not account data: it survives sign-out.
    expect(localStorage.getItem("2ktunes.lang")).toBe("SW");
  });

  it("still clears locally when the logout call fails (offline)", async () => {
    mockApi({ "POST /logout": { status: 500, body: { status: false, code: "server_error", message: "x" } } });
    renderApp("/dashboard/settings", { token: "ok" });
    await userEvent.click(await screen.findByRole("button", { name: "sign out" }));
    await waitFor(() => expect(localStorage.getItem("2ktunes.token")).toBeNull());
    await screen.findByText("auth page");
  });
});
