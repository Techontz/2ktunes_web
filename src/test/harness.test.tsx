import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { fetchWallet } from "@/lib/api/wallet";
import { useResource } from "@/lib/api/useResource";
import { Money } from "@/features/dashboard/components";
import { useAuth } from "@/lib/auth/AuthProvider";
import { mockApi } from "./api";
import { renderPage } from "./render";

function Probe() {
  const { data, error } = useResource((s) => fetchWallet({ signal: s }));
  const { user } = useAuth();
  if (error) return <p>error: {error}</p>;
  if (!data) return <p>loading</p>;
  return (
    <p>
      {user?.name ?? "anon"} <Money minor={data.balances[0].available_minor} currency="TZS" />
    </p>
  );
}

describe("test harness", () => {
  it("serves mocked API payloads through the real client and providers", async () => {
    const api = mockApi({
      "GET /wallet": { balances: [{ currency: "TZS", available_minor: 2500000 }], open_withdrawals: [] },
    });
    renderPage(<Probe />);
    expect(await screen.findByText(/TZS 25,000\.00/)).toBeInTheDocument();
    expect(await screen.findByText(/Neema Said/)).toBeInTheDocument();
    expect(api.unmatched).toEqual([]);
  });

  it("maps errors to translated copy", async () => {
    mockApi({ "GET /wallet": { status: 500, body: { status: false, code: "server_error" } } });
    renderPage(<Probe />, { language: "SW" });
    expect(await screen.findByText(/Seva imepata tatizo/)).toBeInTheDocument();
  });
});
