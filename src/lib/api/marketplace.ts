import { request } from "./client";
import type {
  Campaign,
  CampaignObjective,
  CampaignType,
  CreatorPackage,
  CreatorProfile,
  CreatorSummary,
  Order,
  OrderStatus,
  Paginated,
  PortfolioItem,
  PromotionService,
  PublicSmartLink,
  SocialAccount,
} from "./types";

/**
 * Promotion, creators marketplace, campaigns, orders, creator workspace and
 * the public smart-link endpoints. DOCS/API.md → "Creators & marketplace",
 * "Public"; verified in CreatorController / MarketplaceController /
 * CampaignController / OrderController / PublicController.
 */

type S = { signal?: AbortSignal };

/* ── Promotion services (public) ───────────────────────────────────── */

export async function fetchPromotionServices({ signal }: S = {}): Promise<PromotionService[]> {
  const res = await request<{ services: PromotionService[] }>("/promotion-services", { signal, auth: false });
  return res.services ?? [];
}

/* ── Browse creators ───────────────────────────────────────────────── */

export type CreatorFilters = {
  q?: string;
  country?: string;
  platform?: string;
  category?: string;
  min_followers?: number;
  max_price_minor?: number;
  currency?: string;
  verified_only?: boolean;
  available_only?: boolean;
  sort?: "followers" | "price_low" | "price_high" | "newest";
  page?: number;
};

export function fetchCreators(filters: CreatorFilters = {}, { signal }: S = {}) {
  return request<{
    creators: CreatorSummary[];
    meta: Paginated;
    filters: { platforms: string[]; categories: string[] };
  }>("/creators", {
    signal,
    query: {
      ...filters,
      verified_only: filters.verified_only || undefined,
      available_only: filters.available_only || undefined,
    },
  });
}

export async function fetchCreator(slug: string, { signal }: S = {}): Promise<CreatorProfile> {
  const res = await request<{ creator: CreatorProfile }>(`/creators/${encodeURIComponent(slug)}`, { signal });
  return res.creator;
}

/* ── Creator workspace (own profile) ───────────────────────────────── */

export async function fetchMyCreatorProfile({ signal }: S = {}): Promise<CreatorProfile | null> {
  const res = await request<{ profile: CreatorProfile | null }>("/creator/profile", { signal });
  return res.profile;
}

export type CreatorProfileInput = {
  display_name: string;
  bio?: string | null;
  country?: string | null;
  city?: string | null;
  languages?: string[];
  categories?: string[];
  turnaround_days?: number | null;
  is_available?: boolean;
  social_accounts?: Omit<SocialAccount, "id" | "metrics_source" | "verified" | "metrics_verified_at">[];
};

export async function saveMyCreatorProfile(input: CreatorProfileInput): Promise<CreatorProfile> {
  const res = await request<{ profile: CreatorProfile }>("/creator/profile", { method: "PUT", body: input });
  return res.profile;
}

export async function uploadCreatorAvatar(file: File): Promise<CreatorProfile> {
  const form = new FormData();
  form.append("avatar", file);
  const res = await request<{ profile: CreatorProfile }>("/creator/profile/avatar", { method: "POST", body: form });
  return res.profile;
}

export function submitCreatorProfile() {
  return request<{ message: string; profile_status: string }>("/creator/profile/submit", { method: "POST" });
}

export type PackageInput = {
  title: string;
  platform: string;
  /** Decimal string in major units. */
  price: string;
  currency: string;
  turnaround_days: number;
  description?: string | null;
  deliverable?: string | null;
  is_active?: boolean;
};

export async function createPackage(input: PackageInput): Promise<CreatorPackage> {
  const res = await request<{ package: CreatorPackage }>("/creator/packages", { method: "POST", body: input });
  return res.package;
}

export async function updatePackage(id: number, input: PackageInput): Promise<CreatorPackage> {
  const res = await request<{ package: CreatorPackage }>(`/creator/packages/${id}`, { method: "PATCH", body: input });
  return res.package;
}

export function deletePackage(id: number) {
  return request<{ message: string }>(`/creator/packages/${id}`, { method: "DELETE" });
}

export async function addPortfolioItem(input: {
  platform: string;
  url: string;
  title?: string | null;
  views?: number | null;
}): Promise<PortfolioItem> {
  const res = await request<{ item: PortfolioItem }>("/creator/portfolio", { method: "POST", body: input });
  return res.item;
}

export function deletePortfolioItem(id: number) {
  return request<{ message: string }>(`/creator/portfolio/${id}`, { method: "DELETE" });
}

/* ── Campaigns ─────────────────────────────────────────────────────── */

export function fetchCampaigns(page = 1, { signal }: S = {}) {
  return request<{ campaigns: Campaign[]; meta: Paginated }>("/campaigns", { signal, query: { page } });
}

export async function fetchCampaign(id: number | string, { signal }: S = {}): Promise<Campaign> {
  const res = await request<{ campaign: Campaign }>(`/campaigns/${id}`, { signal });
  return res.campaign;
}

export type CampaignInput = Partial<{
  title: string;
  type: CampaignType;
  release_id: number | null;
  track_id: number | null;
  objective: CampaignObjective | null;
  /** Decimal string in major units. */
  budget: string | null;
  currency: string;
  target_countries: string[] | null;
  target_audience: string | null;
  brief: string | null;
  pitch: Partial<Record<"platform" | "genre" | "mood" | "description" | "similar_artists", string | null>> | null;
  starts_on: string | null;
  ends_on: string | null;
}>;

export async function createCampaign(input: CampaignInput & { title: string; type: CampaignType }): Promise<Campaign> {
  const res = await request<{ campaign: Campaign }>("/campaigns", { method: "POST", body: input });
  return res.campaign;
}

export async function updateCampaign(id: number, input: CampaignInput): Promise<Campaign> {
  const res = await request<{ campaign: Campaign }>(`/campaigns/${id}`, { method: "PATCH", body: input });
  return res.campaign;
}

export async function cancelCampaign(id: number): Promise<Campaign> {
  const res = await request<{ campaign: Campaign }>(`/campaigns/${id}/cancel`, { method: "POST" });
  return res.campaign;
}

/* ── Orders ────────────────────────────────────────────────────────── */

export async function createOrder(
  campaignId: number,
  input: { creator_package_id: number; brief?: string | null } | { promotion_service_id: number; brief?: string | null },
): Promise<Order> {
  const res = await request<{ order: Order }>(`/campaigns/${campaignId}/orders`, { method: "POST", body: input });
  return res.order;
}

export function fetchOrders(
  params: { as?: "buyer" | "creator"; status?: OrderStatus | string; page?: number } = {},
  { signal }: S = {},
) {
  return request<{ orders: Order[]; meta: Paginated }>("/orders", { signal, query: params });
}

export async function fetchOrder(id: number | string, { signal }: S = {}): Promise<Order> {
  const res = await request<{ order: Order }>(`/orders/${id}`, { signal });
  return res.order;
}

async function orderAction(id: number, action: string, body?: unknown): Promise<Order> {
  const res = await request<{ order: Order }>(`/orders/${id}/${action}`, { method: "POST", body });
  return res.order;
}

export const payOrderFromWallet = (id: number) => orderAction(id, "pay");
export const acceptOrder = (id: number) => orderAction(id, "accept");
export const declineOrder = (id: number, reason: string) => orderAction(id, "decline", { reason });
export const submitOrderWork = (id: number, url: string, notes?: string | null) =>
  orderAction(id, "submit", { url, notes: notes || undefined });
export const requestOrderRevision = (id: number, note: string) => orderAction(id, "revision", { note });
export const completeOrder = (id: number) => orderAction(id, "complete");
export const cancelOrder = (id: number) => orderAction(id, "cancel");

export type DisputeReason = "not_delivered" | "not_as_described" | "late" | "quality" | "payment" | "other";

export function disputeOrder(id: number, reason: DisputeReason, details: string) {
  return request<{ message: string; dispute: unknown }>(`/orders/${id}/dispute`, {
    method: "POST",
    body: { reason, details },
  });
}

export function sendOrderMessage(id: number, body: string) {
  return request<{ message: unknown }>(`/orders/${id}/messages`, { method: "POST", body: { body } });
}

/* ── Public smart link (no auth) ───────────────────────────────────── */

export async function fetchPublicRelease(slug: string, { signal }: S = {}): Promise<PublicSmartLink> {
  const res = await request<{ release: PublicSmartLink }>(`/public/releases/${encodeURIComponent(slug)}`, {
    signal,
    auth: false,
  });
  return res.release;
}

export function logSmartLinkEvent(slug: string, type: "view" | "click", store?: string) {
  return request<{ status: true }>(`/public/releases/${encodeURIComponent(slug)}/events`, {
    method: "POST",
    auth: false,
    body: store ? { type, store } : { type },
  });
}

export function presave(slug: string, email: string) {
  return request<{ message: string }>(`/public/releases/${encodeURIComponent(slug)}/presave`, {
    method: "POST",
    auth: false,
    body: { email, consent: true },
  });
}
