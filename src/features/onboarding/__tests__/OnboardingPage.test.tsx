import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultUser, mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import OnboardingPage from "../OnboardingPage";

const config = {
  genres: ["Afrobeats", "Bongo Flava"],
  languages: { sw: "Swahili", en: "English", zxx: "No linguistic content" },
  marketplace: { platforms: [], categories: ["dance", "comedy"], campaign_types: [], currencies: [], platform_fee_bp: 1000 },
};

describe("OnboardingPage", () => {
  it("completes and POSTs /onboarding/complete with the chosen account type", async () => {
    const newUser = { ...defaultUser, onboarding_completed_at: null, account_type: "artist", country: null };
    let completed = false;
    const api = mockApi({
      "GET /profile": () => ({ user: completed ? { ...newUser, onboarding_completed_at: "2026-10-01T00:00:00Z" } : newUser }),
      "GET /release-config": { config },
      "POST /onboarding/complete": ({ body }) => {
        completed = true;
        return { user: { ...newUser, ...(body as object), onboarding_completed_at: "2026-10-01T00:00:00Z" } };
      },
    });
    const user = userEvent.setup();
    renderPage(<OnboardingPage />, { route: "/onboarding" });

    await user.click(await screen.findByRole("radio", { name: /Creator/ }));
    const first = screen.getByLabelText(/First name/);
    await user.clear(first);
    await user.type(first, "Amani");
    await user.selectOptions(screen.getByLabelText(/^Country/), "KE");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Creator path skips the artist step.
    expect(await screen.findByRole("heading", { name: "Creator profile" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Skip for now" }));

    await waitFor(() => expect(api.calls("POST /onboarding/complete")).toHaveLength(1));
    expect(api.calls("POST /onboarding/complete")[0].body).toMatchObject({
      account_type: "creator",
      first_name: "Amani",
      country: "KE",
      preferred_currency: "KES",
      locale: "en",
    });
  });

  it("asks for the country before continuing", async () => {
    mockApi({
      "GET /profile": { user: { ...defaultUser, onboarding_completed_at: null, country: null } },
      "GET /artists": { artists: [], user: { id: 1, subscription_plan: null, plan: null }, limit: null },
      "GET /release-config": { config },
    });
    const user = userEvent.setup();
    renderPage(<OnboardingPage />, { route: "/onboarding" });
    await user.click(await screen.findByRole("button", { name: "Continue" }));
    expect(await screen.findByText("Choose your country.")).toBeInTheDocument();
  });
});
