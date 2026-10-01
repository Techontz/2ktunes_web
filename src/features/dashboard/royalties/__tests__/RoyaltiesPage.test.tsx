import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/api";
import { renderPage } from "@/test/render";
import RoyaltiesPage from "../RoyaltiesPage";

describe("RoyaltiesPage", () => {
  it("explains empty royalties and statements", async () => {
    mockApi({
      "GET /royalties/breakdown": { by: "month", range: { from: "2025-10-01", to: "2026-10-31" }, rows: [] },
      "GET /royalties/statements": { statements: [] },
    });
    renderPage(<RoyaltiesPage />, { route: "/dashboard/royalties" });
    expect(await screen.findByText("No royalties in this period")).toBeInTheDocument();
    expect(await screen.findByText("No statements yet")).toBeInTheDocument();
  });

  it("renders breakdown rows with totals and switches grouping", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      "GET /royalties/breakdown": ({ query }) =>
        query.get("by") === "territory"
          ? { by: "territory", range: { from: "2025-10-01", to: "2026-10-31" }, rows: [{ label: "??", currency: "TZS", amount_minor: 1000, units: 5, lines: 1 }] }
          : {
              by: "month",
              range: { from: "2025-10-01", to: "2026-10-31" },
              rows: [
                { label: "2026-07", currency: "TZS", amount_minor: "150000", units: 1200, lines: 4 },
                { label: "2026-08", currency: "TZS", amount_minor: 50000, units: 300, lines: 2 },
              ],
            },
      "GET /royalties/statements": {
        statements: [{ id: 1, source: "Spotify", period_start: "2026-07-01", period_end: "2026-07-31", currency: "TZS", amount_minor: "150000", posted_at: "2026-09-10 10:00:00" }],
      },
    });
    renderPage(<RoyaltiesPage />, { route: "/dashboard/royalties" });

    expect((await screen.findAllByText("Jul 2026")).length).toBeGreaterThan(0);
    expect(screen.getByText("TZS 2,000.00")).toBeInTheDocument(); // exact BigInt total
    expect((await screen.findAllByText("Spotify")).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Country" }));
    expect((await screen.findAllByText("Unknown")).length).toBeGreaterThan(0);
    expect(api.calls("GET /royalties/breakdown").at(-1)?.query.get("by")).toBe("territory");
  });
});
