import { request } from "./client";

/**
 * The authentication endpoints.
 *
 *   POST /api/register         201 { message, token, user }
 *                                  body { name, email, password, password_confirmation, account_type }
 *   POST /api/login            200 { message, token, user }
 *                              401 { message: "Invalid credentials" }
 *                              429 { message }                         (throttled)
 *   POST /api/google-login     200 { message, token, user }            body { id_token }
 *   GET  /api/profile          200 { status, message, user }           (auth:sanctum)
 *   POST /api/logout           200 { status, message }                 (auth:sanctum)
 *   POST /api/email/resend     200 { status, message }                 (auth:sanctum)
 *   POST /api/forgot-password  200 { status: true, message }           always generic
 *   POST /api/reset-password   200 { status: true, message } | 422 { message, errors }
 *
 * Password minimum length is 8 (backend rule).
 */

export const PASSWORD_MIN = 8;

export type AccountType = "artist" | "label" | "creator";
export const ACCOUNT_TYPES: AccountType[] = ["artist", "label", "creator"];

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

  /** artist | label | creator, chosen at registration. */
  account_type?: AccountType | null;
  /** Null until the post-registration onboarding flow is finished. */
  onboarding_completed_at?: string | null;
  /** Staff role for the admin console; null for everyone else. */
  admin_role?: string | null;

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

  /* Computed by UserResource on every user payload. */
  email_verified?: boolean;
  has_active_subscription?: boolean;
  is_staff?: boolean;
  permissions?: string[];
  has_creator_profile?: boolean;
  status?: string | null;
  subscription_expires_at?: string | null;
  locale?: string | null;
  preferred_currency?: string | null;
  allow_email?: boolean | number | null;
  allow_mobile_alerts?: boolean | number | null;

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
  account_type: AccountType;
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

type StatusResponse = { status: boolean; message: string };

export function resendVerificationEmail() {
  return request<StatusResponse>("/email/resend", { method: "POST" });
}

/** Always resolves with a generic message; never reveals whether the email exists. */
export function forgotPassword(email: string) {
  return request<StatusResponse>("/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export type ResetPasswordPayload = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export function resetPassword(payload: ResetPasswordPayload) {
  return request<StatusResponse>("/reset-password", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

/** Exchanges a Google Identity Services credential (JWT) for a 2kTunes session. */
export function googleLogin(idToken: string) {
  return request<TokenResponse>("/google-login", {
    method: "POST",
    body: { id_token: idToken },
    auth: false,
  });
}

/** Google OAuth web client id; the Google button renders only when this is set. */
export const GOOGLE_CLIENT_ID =
  ((import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "").trim();

/** Whether "Continue with Google" should be offered in this build. */
export const googleLoginAvailable = GOOGLE_CLIENT_ID.length > 0;
