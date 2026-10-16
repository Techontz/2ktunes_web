import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { defaultUser, mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import MusicPage from "../../music/MusicPage";
import { RequirePlan } from "../RequirePlan";

const PLANS = [{ id: 1, name: "Single Artist", price: "39000.00", currency: "TZS", duration: 365, description: null, max_artists: 1, is_active: true }];
const NO_PLAN = { subscription_status: "inactive", plan: null, expires_at: null, pending_payment: null, payment_instructions: { methods: ["mpesa_tz"], note: "", details: {} } };
const noPlanUser = { ...defaultUser, has_active_subscription: false, subscription_status: "inactive" };

describe("RequirePlan", () => {
  it("shows the plan picker instead of the upload page until a plan is active", async () => {
    mockApi({ "GET /profile": { user: noPlanUser }, "GET /plans": { plans: PLANS }, "GET /subscription": NO_PLAN });
    renderPage(
      <RequirePlan>
        <p>Upload form</p>
      </RequirePlan>,
    );
    expect(await screen.findByRole("heading", { name: "Choose a plan to upload your music" })).toBeInTheDocument();
    expect(await screen.findByText("TZS 3,250")).toBeInTheDocument();
    expect(screen.getByText("TZS 39,000 billed yearly")).toBeInTheDocument();
    expect(screen.queryByText("Upload form")).not.toBeInTheDocument();
  });

  it("lets subscribed artists through", async () => {
    mockApi({});
    renderPage(
      <RequirePlan>
        <p>Upload form</p>
      </RequirePlan>,
    );
    expect(await screen.findByText("Upload form")).toBeInTheDocument();
  });

  it("leads My music (the landing page) with the plan picker when there is no plan", async () => {
    mockApi({
      "GET /profile": { user: noPlanUser },
      "GET /plans": { plans: PLANS },
      "GET /subscription": NO_PLAN,
      "GET /releases": { releases: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 }, summary: { all: 0, drafts: 0, in_review: 0, distributing: 0, live: 0, inactive: 0 } },
    });
    renderPage(<MusicPage />, { route: "/dashboard/music" });
    expect(await screen.findByRole("heading", { name: "Pick a plan to release your music" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Choose the Single Artist plan" })).toBeInTheDocument();
  });
});
