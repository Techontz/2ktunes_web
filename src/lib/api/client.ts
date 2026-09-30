/**
 * THE SINGLE HTTP CLIENT
 * ======================
 *
 * Every request to the Laravel API goes through here. There is no second
 * fetch-wrapper anywhere in the app.
 *
 * AUTHENTICATION MECHANISM — SANCTUM PERSONAL ACCESS TOKENS (Bearer)
 * -----------------------------------------------------------------
 * Verified in the backend, not assumed: `ApiController@login` and
 * `ApiController@register` both end with
 * `$user->createToken('auth_token')->plainTextToken` and return the token in the
 * JSON body, and every protected route is behind `auth:sanctum`. That is token
 * auth, so the token travels in an `Authorization: Bearer` header.
 *
 * This is deliberately NOT the Sanctum SPA-cookie flow: there is no
 * `/sanctum/csrf-cookie` call and no `credentials: "include"`, because the
 * backend never issues a session for the API. Adding a CSRF dance here would be
 * cargo-culting a mechanism this backend does not use.
 *
 * ERROR SHAPES — also verified against the running server
 * ------------------------------------------------------
 *   422  { message, errors: { field: [msg, ...] } }   Laravel validation
 *   401  { message: "Invalid credentials" }           bad login
 *   401  { message: "Unauthenticated." }              missing/expired token
 *   500  Laravel's own payload — never surfaced to the user verbatim
 */

export const API_BASE = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? ""
).replace(/\/+$/, "");

/** True when an API base URL has been configured for this build. */
export const apiConfigured = API_BASE.length > 0;

/** Where the bearer token lives. Token auth, so localStorage is correct. */
const TOKEN_KEY = "2ktunes.token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing — the session simply won't persist across reloads */
  }
}

/**
 * A normalised API failure.
 *
 * `fieldErrors` carries Laravel's 422 `errors` map flattened to one message per
 * field, which is what the form needs to render errors next to inputs.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;
  readonly isNetwork: boolean;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> = {},
    isNetwork = false,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.isNetwork = isNetwork;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }
  get isValidation(): boolean {
    return this.status === 422;
  }
}

export class ApiNotConfiguredError extends ApiError {
  constructor() {
    super("API_NOT_CONFIGURED", 0);
    this.name = "ApiNotConfiguredError";
  }
}

/** Called whenever the server rejects our token, so auth state can reset. */
let onUnauthenticated: (() => void) | null = null;
export function setUnauthenticatedHandler(fn: (() => void) | null): void {
  onUnauthenticated = fn;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /**
   * A plain object is sent as JSON. A `FormData` is sent as multipart, which is
   * what `POST /api/releases/upload` and `POST /api/profile/avatar` require —
   * both validate real uploaded files (`image`, `file`), so they cannot be fed
   * JSON.
   */
  body?: unknown;
  /** Attach the bearer token. Default true; login/register pass false. */
  auth?: boolean;
  signal?: AbortSignal;
};

export async function request<T>(
  path: string,
  { method = "GET", body, auth = true, signal }: RequestOptions = {},
): Promise<T> {
  if (!apiConfigured) throw new ApiNotConfiguredError();

  const isMultipart =
    typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  // Never set Content-Type for multipart: the browser has to add the boundary.
  if (body !== undefined && !isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isMultipart
            ? (body as FormData)
            : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // DNS failure, server down, CORS rejection — all land here.
    throw new ApiError("NETWORK", 0, {}, true);
  }

  const raw = await res.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      /* HTML error page or empty body — handled below */
    }
  }

  if (res.ok) return payload as T;

  const data = (payload ?? {}) as {
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (res.status === 401) {
    // Distinguish "your token is no longer valid" from "those credentials are
    // wrong": only the former should tear down the session.
    if (auth) onUnauthenticated?.();
    throw new ApiError(data.message ?? "Unauthenticated.", 401);
  }

  const fieldErrors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(data.errors ?? {})) {
    if (Array.isArray(messages) && messages.length) fieldErrors[field] = messages[0];
  }

  // A 5xx carries Laravel's own diagnostics. Never pass that to a user.
  const message =
    res.status >= 500 ? "SERVER" : (data.message ?? `HTTP ${res.status}`);

  throw new ApiError(message, res.status, fieldErrors);
}
