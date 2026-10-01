import { describe, expect, it, vi } from "vitest";
import { ApiError, request } from "./client";
import { errorMessageFor } from "./errors";
import { mockApi } from "@/test/api";

const t = (k: string) => `t:${k}`;

async function failure(p: Promise<unknown>): Promise<ApiError> {
  try {
    await p;
  } catch (e) {
    return e as ApiError;
  }
  throw new Error("expected the request to fail");
}

describe("API client error normalisation", () => {
  it("never surfaces a 5xx body or message", async () => {
    mockApi({ "GET /x": { status: 500, body: { status: false, message: "SQLSTATE[42S02] secret", details: { trace: "…" } } } });
    const err = await failure(request("/x"));
    expect(err.status).toBe(500);
    expect(err.message).toBe("SERVER");
    expect(err.body).toBeNull();
    expect(err.details).toBeNull();
    expect(errorMessageFor(err, t)).toBe("t:err.server");
  });

  it("shows the API's own message for an unknown 4xx business code", async () => {
    mockApi({ "POST /x": { status: 409, body: { status: false, code: "brand_new_rule", message: "You can't do that yet." } } });
    const err = await failure(request("/x", { method: "POST", body: {} }));
    expect(err.code).toBe("brand_new_rule");
    expect(errorMessageFor(err, t)).toBe("You can't do that yet.");
  });

  it("falls back to generic copy for a non-JSON error page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>Bad gateway</html>", { status: 502 })));
    const err = await failure(request("/x"));
    expect(errorMessageFor(err, t)).toBe("t:err.server");
  });

  it("uses translated copy for 404, 429 and 403 forbidden", async () => {
    mockApi({
      "GET /a": { status: 404, body: { status: false, code: "not_found", message: "No query results for model [App\\\\Release]" } },
      "GET /b": { status: 429, body: { status: false, code: "rate_limited", message: "Too Many Attempts." } },
      "GET /c": { status: 403, body: { status: false, code: "forbidden", message: "This action is unauthorized." } },
    });
    expect(errorMessageFor(await failure(request("/a")), t)).toBe("t:err.not_found");
    expect(errorMessageFor(await failure(request("/b")), t)).toBe("t:err.rate_limited");
    expect(errorMessageFor(await failure(request("/c")), t)).toBe("t:err.forbidden");
  });

  it("maps a transport failure to the network message", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }));
    const err = await failure(request("/x"));
    expect(err.isNetwork).toBe(true);
    expect(errorMessageFor(err, t)).toBe("t:err.network");
  });

  it("maps a thrown non-API value to generic copy", () => {
    expect(errorMessageFor(new Error("boom"), t)).toBe("t:err.generic");
    expect(errorMessageFor(undefined, t)).toBe("t:err.generic");
  });
});
