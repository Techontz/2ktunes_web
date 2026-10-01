import { request } from "./client";
import type { AuthUser } from "./auth";
import type {
  Analytics,
  AnalyticsRange,
  AppNotification,
  DashboardOverview,
  HelpArticle,
  HelpArticleSummary,
  NotificationPreferences,
  Paginated,
  PaymentMethodCode,
  Plan,
  SubscriptionInfo,
  SubscriptionPayment,
  SupportTicket,
  TicketCategory,
} from "./types";

/**
 * Profile, dashboard overview, analytics, notifications, subscription,
 * support and help. Paths and shapes: DOCS/API.md → "Profile & account",
 * "Support", "Public"; verified in AccountController / ProfileController.
 */

type S = { signal?: AbortSignal };

export function fetchDashboard({ signal }: S = {}) {
  return request<DashboardOverview & { status: true }>("/dashboard", { signal });
}

export async function fetchAnalytics(
  params: { range?: AnalyticsRange; from?: string; to?: string; release_id?: number | null },
  { signal }: S = {},
): Promise<Analytics> {
  const res = await request<{ analytics: Analytics }>("/analytics", {
    signal,
    query: { range: params.range, from: params.from, to: params.to, release_id: params.release_id ?? undefined },
  });
  return res.analytics;
}

/* ── Profile ───────────────────────────────────────────────────────── */

export type ProfilePatch = Partial<{
  name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  business_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  postal_code: string | null;
  allow_email: boolean;
  allow_mobile_alerts: boolean;
  locale: "en" | "sw" | "fr";
  preferred_currency: "USD" | "TZS" | "KES" | "UGX" | "NGN";
  account_type: "artist" | "label" | "creator";
  email: string;
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}>;

export async function updateProfile(patch: ProfilePatch): Promise<AuthUser> {
  const res = await request<{ user: AuthUser }>("/profile", { method: "PATCH", body: patch });
  return res.user;
}

export async function uploadProfileAvatar(file: File): Promise<AuthUser> {
  const form = new FormData();
  form.append("avatar", file);
  const res = await request<{ user: AuthUser }>("/profile/avatar", { method: "POST", body: form });
  return res.user;
}

export type OnboardingPayload = Partial<{
  account_type: "artist" | "label" | "creator";
  country: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  locale: "en" | "sw" | "fr";
  preferred_currency: "USD" | "TZS" | "KES" | "UGX" | "NGN";
}>;

export async function completeOnboarding(payload: OnboardingPayload): Promise<AuthUser> {
  const res = await request<{ user: AuthUser }>("/onboarding/complete", { method: "POST", body: payload });
  return res.user;
}

export function logoutAll() {
  return request<{ message: string }>("/logout-all", { method: "POST" });
}

export function deleteAccount(current_password: string, delete_reason?: string) {
  return request<{ message: string }>("/delete-account", {
    method: "DELETE",
    body: { current_password, delete_reason: delete_reason || undefined },
  });
}

/* ── Notifications ─────────────────────────────────────────────────── */

export function fetchNotifications(page = 1, { signal }: S = {}) {
  return request<{ notifications: AppNotification[]; unread: number; meta: Paginated }>("/notifications", {
    signal,
    query: { page },
  });
}

export function markNotificationRead(id: string) {
  return request<{ status: true }>(`/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
}

export function markAllNotificationsRead() {
  return request<{ status: true }>("/notifications/read-all", { method: "POST" });
}

export function fetchNotificationPreferences({ signal }: S = {}) {
  return request<{ preferences: NotificationPreferences; categories: string[] }>("/notification-preferences", {
    signal,
  });
}

export async function saveNotificationPreferences(preferences: NotificationPreferences) {
  const res = await request<{ preferences: NotificationPreferences }>("/notification-preferences", {
    method: "PUT",
    body: { preferences },
  });
  return res.preferences;
}

/* ── Plans & subscription ──────────────────────────────────────────── */

export async function fetchPlanList({ signal }: S = {}): Promise<Plan[]> {
  const res = await request<{ plans: Plan[] }>("/plans", { signal, auth: false });
  return res.plans ?? [];
}

export function fetchSubscription({ signal }: S = {}) {
  return request<SubscriptionInfo>("/subscription", { signal });
}

export function subscribe(payload: {
  plan_id: number;
  payment_method?: PaymentMethodCode;
  payment_reference?: string;
}) {
  return request<{
    message: string;
    subscription_status: "active" | "pending_payment";
    payment: SubscriptionPayment | null;
    user: AuthUser;
  }>("/subscribe", { method: "POST", body: payload });
}

/* ── Support ───────────────────────────────────────────────────────── */

export function fetchTickets(page = 1, { signal }: S = {}) {
  return request<{ tickets: SupportTicket[]; meta: Paginated }>("/support/tickets", { signal, query: { page } });
}

export async function fetchTicket(id: number | string, { signal }: S = {}) {
  const res = await request<{ ticket: SupportTicket }>(`/support/tickets/${id}`, { signal });
  return res.ticket;
}

export async function createTicket(input: {
  category: TicketCategory;
  subject: string;
  body: string;
  release_id?: number | null;
  attachment?: File | null;
}) {
  const form = new FormData();
  form.append("category", input.category);
  form.append("subject", input.subject);
  form.append("body", input.body);
  if (input.release_id) form.append("release_id", String(input.release_id));
  if (input.attachment) form.append("attachment", input.attachment);
  const res = await request<{ ticket: SupportTicket }>("/support/tickets", { method: "POST", body: form });
  return res.ticket;
}

export async function replyTicket(id: number, body: string, attachment?: File | null) {
  const form = new FormData();
  form.append("body", body);
  if (attachment) form.append("attachment", attachment);
  const res = await request<{ ticket: SupportTicket }>(`/support/tickets/${id}/reply`, { method: "POST", body: form });
  return res.ticket;
}

export async function closeTicket(id: number) {
  const res = await request<{ ticket: SupportTicket }>(`/support/tickets/${id}/close`, { method: "POST" });
  return res.ticket;
}

/* ── Help (public) ─────────────────────────────────────────────────── */

export async function fetchHelpArticles(
  params: { q?: string; category?: string; locale: "en" | "sw" },
  { signal }: S = {},
): Promise<HelpArticleSummary[]> {
  const res = await request<{ articles: HelpArticleSummary[] }>("/help", {
    signal,
    auth: false,
    query: params,
  });
  return res.articles ?? [];
}

export async function fetchHelpArticle(slug: string, { signal }: S = {}): Promise<HelpArticle> {
  const res = await request<{ article: HelpArticle }>(`/help/${encodeURIComponent(slug)}`, { signal, auth: false });
  return res.article;
}
