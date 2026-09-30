import { request } from "./client";

/**
 * The authentication endpoints, typed against the responses the running Laravel
 * server actually returns. Every shape below was read off the live API, not
 * inferred from convention.
 *
 *   POST /api/register  201  { message, token, user }
 *   POST /api/login     200  { message, token, user }
 *                       401  { message: "Invalid credentials" }
 *   GET  /api/profile   200  { status, message, user }      (auth:sanctum)
 *   POST /api/logout    200  { status, message }            (auth:sanctum)
 *   POST /api/email/resend                                  (auth:sanctum, throttle:6,1)
 *
 * NOT PRESENT in this backend, so not represented here: any password-reset
 * endpoint, and any Apple provider. `POST /api/google-login` exists but expects
 * a Google profile the client must already hold — see googleLoginAvailable().
 */

/** Mirrors the `users` table as serialised by the API (password is hidden). */
export type AuthUser = {
  id: number;
  name: string;
  email: string;
  /**
   * Present on GET /api/profile and POST /api/login (both return a full row),
   * but ABSENT from POST /api/register, whose `user` is the freshly-created
   * model and therefore only carries the attributes that were set. Hence
   * `undefined` is possible and must be treated as "not verified".
   */
  email_verified_at?: string | null;
  avatar: string | null;
  business_name: string | null;
  first_name: string | null;
  middle_name?: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  city?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  postal_code?: string | null;
  is_admin: boolean;

  /* Subscription. Note the two separate columns: `subscription_plan` is the
     plan NAME (a string) and is what ArtistController matches `plans.name`
     against, while `subscription_plan_id` is the foreign key. The backend writes
     the name on /api/subscribe and leaves the id null, so they can disagree. */
  subscription_plan_id: number | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  subscription_currency?: string | null;
  payment_method?: string | null;

  /* Payout columns: returned here and by /api/royalties, but absent from
     User::$fillable, so no endpoint in this backend can write them. */
  payout_method?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  mobile_money_number?: string | null;

  created_at: string;
  updated_at: string;
};

type TokenResponse = { message: string; token: string; user: AuthUser };

export type LoginPayload = { email: string; password: string };

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  /** Laravel's `confirmed` rule on `password` reads exactly this field name. */
  password_confirmation: string;
};

export function login(payload: LoginPayload) {
  return request<TokenResponse>("/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function register(payload: RegisterPayload) {
  return request<TokenResponse>("/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function fetchProfile(signal?: AbortSignal): Promise<AuthUser> {
  const res = await request<{ status: boolean; message: string; user: AuthUser }>(
    "/profile",
    { signal },
  );
  return res.user;
}

export function logout() {
  return request<{ status: boolean; message: string }>("/logout", {
    method: "POST",
  });
}

export function resendVerificationEmail() {
  return request<unknown>("/email/resend", { method: "POST" });
}

/**
 * Whether "Continue with Google" can actually do anything.
 *
 * `POST /api/google-login` exists and validates `{ email, name?, avatar? }` —
 * i.e. it expects the CLIENT to have completed Google sign-in and to hand over
 * the resulting profile. The backend has no Socialite dependency and no OAuth
 * redirect/callback route, and no Google client ID is configured for the
 * frontend. So the endpoint is real but the flow is not wired end to end, and
 * the button must not pretend otherwise.
 *
 * To finish it: add a Google Identity Services client, obtain the profile, then
 * POST it to /api/google-login and store the returned token exactly as
 * login() does.
 */
export const googleLoginAvailable = false;
