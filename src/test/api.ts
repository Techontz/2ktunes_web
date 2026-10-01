import { vi } from "vitest";

/**
 * A tiny fetch mock for page tests.
 *
 *   const api = mockApi({
 *     "GET /releases": { releases: [], meta: {...}, summary: {...} },
 *     "GET /releases/:id": ({ params }) => ({ release: makeRelease({ id: Number(params.id) }) }),
 *     "POST /withdrawals": ({ body }) => ({ status: 422, body: { status: false, code: "insufficient_funds", message: "…" } }),
 *   });
 *   …
 *   expect(api.calls("POST /withdrawals")[0].body).toMatchObject({ idempotency_key: … });
 *
 * A handler value is either the JSON payload (sent as `{status:true, ...payload}`
 * with HTTP 200), or a function returning a payload, or `{ status, body }` to
 * control the response exactly. Unmatched requests get a 404
 * `{status:false, code:"not_found"}` and are recorded in `api.unmatched`.
 * `GET /profile` answers with `defaultUser` unless overridden.
 */

export type MockRequest = {
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
};
export type MockResponse = { status: number; body: unknown };
type HandlerResult = unknown | MockResponse;
export type Handler = HandlerResult | ((req: MockRequest) => HandlerResult | Promise<HandlerResult>);

export const defaultUser = {
  id: 1,
  name: "Neema Said",
  email: "neema@example.com",
  avatar: null,
  business_name: null,
  first_name: "Neema",
  last_name: "Said",
  phone: null,
  country: "TZ",
  is_admin: false,
  account_type: "artist",
  onboarding_completed_at: "2026-01-01T00:00:00Z",
  email_verified_at: "2026-01-01T00:00:00Z",
  email_verified: true,
  has_active_subscription: true,
  has_creator_profile: false,
  subscription_plan_id: 1,
  subscription_plan: "Pro",
  subscription_status: "active",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function isResponse(v: unknown): v is MockResponse {
  return !!v && typeof v === "object" && "status" in v && "body" in v && typeof (v as MockResponse).status === "number";
}

function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(":")) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

export function mockApi(handlers: Record<string, Handler>) {
  const log: (MockRequest & { key: string })[] = [];
  const unmatched: string[] = [];
  const all: Record<string, Handler> = {
    "GET /profile": { user: defaultUser },
    "GET /notifications": { notifications: [], unread: 0, meta: { current_page: 1, last_page: 1, per_page: 30, total: 0 } },
    ...handlers,
  };

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const method = (init?.method ?? "GET").toUpperCase();
    const path = url.pathname.replace(/^\/api/, "");
    let body: unknown = undefined;
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    } else if (init?.body !== undefined) {
      body = init.body;
    }

    for (const [key, handler] of Object.entries(all)) {
      const [m, pattern] = key.split(" ");
      if (m !== method) continue;
      const params = match(pattern, path);
      if (!params) continue;
      const req: MockRequest = { method, path, params, query: url.searchParams, body };
      log.push({ ...req, key });
      const result = typeof handler === "function" ? await (handler as (r: MockRequest) => unknown)(req) : handler;
      const res: MockResponse = isResponse(result)
        ? result
        : { status: 200, body: { status: true, ...(result as object) } };
      return new Response(JSON.stringify(res.body), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    unmatched.push(`${method} ${path}`);
    return new Response(JSON.stringify({ status: false, code: "not_found", message: "Not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  });

  vi.stubGlobal("fetch", fetchMock);
  return {
    fetch: fetchMock,
    unmatched,
    calls: (key: string) => log.filter((c) => c.key === key),
  };
}
