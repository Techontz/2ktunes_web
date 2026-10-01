import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Release } from "@/lib/api/types";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import PromotionPage from "../PromotionPage";

function makeRelease(over: Partial<Release>): Release {
  return {
    id: 1,
    release_title: "Jua Kali",
    version: null,
    artist_id: 1,
    artist_name: "Neema",
    additional_artists: [],
    release_type: "Single",
    release_date: "2026-11-01",
    release_time: null,
    release_timezone: null,
    original_release_date: null,
    previously_released: false,
    record_label: null,
    language: "sw",
    primary_genre: "Bongo Flava",
    secondary_genre: null,
    c_line_year: null,
    c_line_owner: null,
    p_line_year: null,
    p_line_owner: null,
    is_compilation: false,
    upc: null,
    upc_generated: false,
    cover_image: null,
    cover: null,
    platforms: [],
    territories: { mode: "worldwide", countries: [] },
    social_options: {},
    agreements: {},
    status: "draft",
    status_label: "Draft",
    stage: 0,
    is_editable: true,
    rejection_reason: null,
    slug: "jua-kali-abc123",
    smart_link_url: "https://2ktunes.test/r/jua-kali-abc123",
    smart_link_enabled: true,
    presave_enabled: false,
    draft_step: null,
    submitted_at: null,
    approved_at: null,
    live_at: null,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    tracks_count: 1,
    ...over,
  };
}

const list = (releases: Release[]) => ({
  releases,
  meta: { current_page: 1, last_page: 1, per_page: 100, total: releases.length },
  summary: { drafts: 0, in_review: 0, distributing: 0, live: 0, inactive: 0, all: releases.length },
});

describe("Promotion · smart links", () => {
  it("shows a submitted release's settings read-only", async () => {
    const api = mockApi({
      "GET /releases": list([makeRelease({ status: "submitted", status_label: "Submitted", is_editable: false })]),
    });
    renderPage(<PromotionPage />, { route: "/dashboard/promotion" });
    expect(await screen.findByText("Jua Kali")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByText(/lock once a release is submitted/i)).toBeInTheDocument();
    expect(screen.getByText("https://2ktunes.test/r/jua-kali-abc123")).toBeInTheDocument();
    expect(api.calls("PATCH /releases/:id")).toHaveLength(0);
  });

  it("lets a draft toggle its smart-link settings via PATCH /releases/:id", async () => {
    const user = userEvent.setup();
    const draft = makeRelease({});
    const api = mockApi({
      "GET /releases": list([draft]),
      "PATCH /releases/:id": ({ body }) => ({ release: { ...draft, ...(body as object) } }),
    });
    renderPage(<PromotionPage />, { route: "/dashboard/promotion" });
    expect(await screen.findByText(/Goes public once the release is submitted/)).toBeInTheDocument();
    const presave = screen.getByRole("checkbox", { name: /Pre-save on/ });
    expect(presave).not.toBeChecked();
    await user.click(presave);
    await waitFor(() => expect(api.calls("PATCH /releases/:id")).toHaveLength(1));
    const call = api.calls("PATCH /releases/:id")[0];
    expect(call.params.id).toBe("1");
    expect(call.body).toEqual({ presave_enabled: true });
    await waitFor(() => expect(screen.getByRole("checkbox", { name: /Pre-save on/ })).toBeChecked());
  });
});
