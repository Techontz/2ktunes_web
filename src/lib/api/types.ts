/**
 * Response types for the 2kTunes API, mirrored from DOCS/API.md and verified
 * against the Laravel controllers/resources in 2ktunes_app_backend.
 *
 * Envelope: every success is `{ status: true, ...payload }` (flat — there is
 * no `data` key); the endpoint helpers in this folder return the payload.
 * Money is integer minor units + ISO currency. Dates are ISO-8601 strings.
 */

export type Paginated = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

/* ───────────────────────────── Account ───────────────────────────── */

export type Balance = {
  currency: string;
  available_minor: number;
  held_minor: number;
  pending_minor: number;
  lifetime_earnings_minor: number;
  withdrawn_minor: number;
};

export type ActionItem = {
  type: "verify_email" | "changes_requested" | "drafts" | "plan" | "payout_method" | "split_invites" | string;
  message: string;
  path: string;
};

type RevenueRow = { currency: string; revenue_minor: number };
export type LabelledRevenue = {
  id?: number;
  label: string | null;
  currency: string;
  revenue_minor: number;
  units: number;
};
export type MonthRow = { month: string; currency: string; revenue_minor: number; streams: number };

export type DashboardOverview = {
  balances: Balance[];
  release_counts: Record<string, number>;
  recent_releases: Release[];
  analytics: {
    has_data: boolean;
    streams: number;
    video_uses: number;
    top_release: LabelledRevenue | null;
    top_territory: LabelledRevenue | null;
    top_store: LabelledRevenue | null;
    by_month: MonthRow[];
  };
  active_orders: number;
  open_tickets: number;
  unread_notifications: number;
  action_items: ActionItem[];
};

export type CountRow = { label: string | null; n: number };

type SmartLinkStats = {
  views: number;
  unique_visitors: number;
  clicks: number;
  presaves: number;
  by_day: { day: string; type: string; n: number }[];
  by_store: CountRow[];
  by_country: CountRow[];
  by_device: CountRow[];
  by_referrer: CountRow[];
};

export type Analytics = {
  range: { from: string; to: string };
  has_data: boolean;
  totals: { revenue: RevenueRow[]; streams: number; downloads: number; video_uses: number };
  by_month: MonthRow[];
  top_releases: LabelledRevenue[];
  top_tracks: LabelledRevenue[];
  top_stores: LabelledRevenue[];
  top_territories: LabelledRevenue[];
  by_usage: LabelledRevenue[];
  smart_links: SmartLinkStats;
  campaigns: { active_orders: number; completed_orders: number };
};

export type AnalyticsRange = "7d" | "30d" | "90d" | "12m" | "custom";

export type AppNotification = {
  id: string;
  event: string;
  category: string;
  title: string;
  body: string;
  action_path: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

type NotificationChannel = { database: boolean; mail: boolean };
export type NotificationPreferences = Record<string, NotificationChannel>;

export type Plan = {
  id: number;
  name: string;
  /** Decimal string in major units, e.g. "9.99". */
  price: string;
  currency: string | null;
  /** Optional second price in USD (decimal string), set by the admin. */
  price_usd?: string | null;
  /** Every currency the plan can be paid in, main price first. */
  prices?: { currency: string; amount: string }[] | null;
  duration: number | null;
  description: string | null;
  max_artists: number | null;
  is_active?: boolean;
  order?: number | null;
  features?: string[] | null;
  /** Same list as `prices`, codes only. */
  currencies?: string[] | null;
  /** Best current price for the viewer, quoted in the requested currency, or null. */
  offer?: PlanOffer | null;
};

/** `offer` on GET /plans (DOCS/API.md, Offers and pricing). */
export type PlanOffer = {
  headline: string;
  type: "percent_off" | "fixed_off" | "fixed_price" | "free" | "referral" | string;
  list_minor: number;
  final_minor: number;
  final: string;
  currency: string;
  ends_at: string | null;
  free_days: number | null;
  referral_applied: boolean;
};

export type SubscriptionPayment = {
  id: number;
  plan_id: number;
  amount_minor: number;
  currency: string;
  method: string;
  payer_reference: string;
  status: "pending" | "confirmed" | "rejected" | string;
  review_note?: string | null;
  created_at: string;
  plan?: { id: number; name: string } | null;
  /** Offer breakdown (what is due is `amount_minor`). */
  list_minor?: number | null;
  discount_minor?: number | null;
  final_minor?: number | null;
  offer_id?: number | null;
  referral_id?: number | null;
  free_days?: number | null;
};

export type SubscriptionInfo = {
  subscription_status: "active" | "inactive" | "pending_payment" | "expired" | string;
  plan: Plan | null;
  expires_at: string | null;
  pending_payment: SubscriptionPayment | null;
  payment_instructions: {
    methods: string[];
    /** Which of `methods` accept each currency (mobile money is TZS only). */
    methods_by_currency?: Record<string, string[]>;
    note: string;
    details: Record<string, string>;
  };
};

export type PaymentMethodCode = "mpesa_tz" | "airtel_tz" | "mixx_tz" | "bank" | "card";

/* ───────────────────────────── Support & help ───────────────────────────── */

export type TicketCategory =
  | "release"
  | "royalties"
  | "payouts"
  | "account"
  | "marketplace"
  | "technical"
  | "other";

export type TicketMessage = {
  id: number;
  body: string;
  is_staff: boolean;
  attachment_name: string | null;
  created_at: string;
  user?: { id: number; name: string } | null;
};

export type SupportTicket = {
  id: number;
  reference: string;
  category: TicketCategory;
  subject: string;
  status: "awaiting_support" | "awaiting_user" | "open" | "resolved" | "closed" | string;
  last_activity_at: string | null;
  created_at: string;
  messages?: TicketMessage[];
};

export type HelpArticleSummary = {
  id: number;
  slug: string;
  category: string;
  title: string;
  summary: string | null;
};
export type HelpArticle = HelpArticleSummary & { body: string; locale: string; updated_at?: string };

/* ───────────────────────────── Catalog ───────────────────────────── */

export type ReleaseType = "Single" | "EP" | "Album";

export type ReleaseStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "scheduled"
  | "delivering"
  | "delivered"
  | "partially_delivered"
  | "live"
  | "takedown_requested"
  | "taken_down"
  | "rejected";

export type Credit = { id?: number; role: string; name: string; detail?: string | null };

export type Track = {
  id: number;
  release_id: number;
  track_number: number;
  title: string;
  version: string | null;
  primary_artist: string | null;
  featured_artists: string[];
  isrc: string | null;
  isrc_generated: boolean;
  language: string | null;
  lyrics: string | null;
  instrumental: boolean;
  explicit: boolean;
  is_clean_version: boolean;
  ai_generated: boolean;
  preview_start_seconds: number | null;
  publisher: string | null;
  ownership: "original" | "cover" | "remix" | "public_domain" | null;
  primary_genre: string | null;
  audio_url: string | null;
  audio: {
    original_name: string | null;
    format: string | null;
    size: number | null;
    duration_ms: number | null;
    sample_rate: number | null;
    bit_depth: number | null;
    channels: number | null;
    sha256: string | null;
  } | null;
  credits?: Credit[];
};

type ReleaseIssue = {
  id: number;
  field: string | null;
  track_id: number | null;
  severity: string;
  message: string;
  created_at?: string;
};

export type Delivery = {
  id: number;
  store: { slug: string; name: string };
  status: string;
  is_sandbox: boolean;
  live_url: string | null;
  delivered_at: string | null;
  live_at: string | null;
};

type TimelineEvent = {
  event: string;
  from: string | null;
  to: string | null;
  actor_type: string | null;
  note: string | null;
  at: string;
};

export type Territories = { mode: "worldwide" | "include" | "exclude"; countries: string[] };

export type Release = {
  id: number;
  user_id?: number;
  artist_id: number | null;
  release_title: string;
  version: string | null;
  artist_name: string;
  additional_artists: { name: string; role: string }[];
  release_type: ReleaseType;
  release_date: string | null;
  release_time: string | null;
  release_timezone: string | null;
  original_release_date: string | null;
  previously_released: boolean;
  record_label: string | null;
  language: string | null;
  primary_genre: string | null;
  secondary_genre: string | null;
  c_line_year: string | number | null;
  c_line_owner: string | null;
  p_line_year: string | number | null;
  p_line_owner: string | null;
  is_compilation: boolean;
  upc: string | null;
  upc_generated: boolean;
  cover_image: string | null;
  cover: { width: number | null; height: number | null } | null;
  platforms: string[];
  territories: Territories;
  social_options: Record<string, boolean>;
  agreements: Record<string, boolean | string>;
  status: ReleaseStatus;
  status_label: string;
  stage: number;
  is_editable: boolean;
  rejection_reason: string | null;
  slug: string | null;
  smart_link_url: string | null;
  smart_link_enabled: boolean;
  presave_enabled: boolean;
  draft_step: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  live_at: string | null;
  created_at: string;
  updated_at: string;
  tracks_count: number | null;
  tracks?: Track[];
  open_issues?: ReleaseIssue[];
  deliveries?: Delivery[];
  timeline?: TimelineEvent[];
};

export type ReleaseGroup = "drafts" | "in_review" | "distributing" | "live" | "inactive";
export type ReleaseSummary = Record<ReleaseGroup | "all", number>;

export type ValidationItem = {
  step: string;
  field: string;
  message: string;
  track_id: number | null;
};

export type ReleaseValidation = {
  ready: boolean;
  errors: ValidationItem[];
  warnings: ValidationItem[];
  steps: Record<string, { complete: boolean; errors: number }>;
  tracks: Record<string, { complete: boolean; errors: number }>;
};

export type Store = {
  id: number;
  slug: string;
  name: string;
  category: string;
  status: "available" | "coming_soon";
};

export type ReleaseConfig = {
  artwork: { min_px: number; max_px: number; max_kb: number; mimes: string[]; must_be_square: boolean };
  audio: {
    max_mb: number;
    formats: string[];
    lossless_formats: string[];
    min_sample_rate: number;
    min_bit_depth: number;
    min_duration_seconds: number;
  };
  tracks: Record<ReleaseType, { min: number; max: number }>;
  min_lead_days: number;
  recommended_lead_days: number;
  genres: string[];
  languages: Record<string, string>;
  contributor_roles: string[];
  isrc_generation: boolean;
  upc_generation: boolean;
  required_agreements: string[];
  upload_chunk_size: number;
  marketplace: {
    platforms: string[];
    categories: string[];
    campaign_types: string[];
    currencies: string[];
    platform_fee_bp: number;
  };
};

export type Artist = {
  id: number;
  user_id: number;
  name: string;
  slug?: string | null;
  bio?: string | null;
  country?: string | null;
  primary_genre?: string | null;
  avatar_url: string | null;
  spotify_link: string | null;
  apple_music_link: string | null;
  youtube_music_link: string | null;
  instagram_link: string | null;
  facebook_link: string | null;
  tiktok_link?: string | null;
  boomplay_link?: string | null;
  audiomack_link?: string | null;
  releases_count?: number;
  created_at: string;
};

export type ArtistsResponse = {
  artists: Artist[];
  user: { id: number; plan: Plan | null };
  limit: number | null;
};

/* ───────────────────────────── Uploads ───────────────────────────── */

export type UploadKind = "audio" | "artwork" | "attachment";

export type UploadSession = {
  id: string;
  kind: UploadKind;
  filename: string;
  size: number;
  chunk_size: number;
  total_chunks: number;
  received_chunks: number[];
  status: "pending" | "complete" | "failed" | "consumed";
  sha256: string | null;
  inspection: {
    format?: string | null;
    sample_rate?: number | null;
    bit_depth?: number | null;
    channels?: number | null;
    duration_ms?: number | null;
    width?: number | null;
    height?: number | null;
    errors?: string[];
    warnings?: string[];
  } | null;
  error: string | null;
  expires_at: string;
};

/* ───────────────────────────── Splits ───────────────────────────── */

export type SplitShare = {
  id: number;
  name: string;
  email: string;
  role: string | null;
  share_bp: number;
  status: "invited" | "accepted" | "declined" | string;
  responded_at: string | null;
};

export type SplitSheet = {
  id: number;
  version: number;
  status: "pending" | "active" | "superseded" | "cancelled" | string;
  effective_from: string | null;
  activated_at: string | null;
  release: { id: number; title?: string };
  track: { id: number; title: string } | null;
  shares: SplitShare[];
};

export type SplitInvitation = {
  id: number;
  status: string;
  share_bp: number;
  role: string | null;
  release: { id: number; title: string; artist: string };
  track: { id: number; title: string } | null;
  from: string | null;
  sheet_status: string;
  effective_from: string | null;
};

/* ───────────────────────────── Money ───────────────────────────── */

type WithdrawalStatus =
  | "requested"
  | "approved"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "rejected";

export type Withdrawal = {
  id: number;
  reference: string;
  status: WithdrawalStatus;
  currency: string;
  gross_minor: number;
  fee_minor: number;
  net_minor: number;
  payout_currency: string;
  payout_amount_minor: number;
  fx_rate: string | null;
  destination: string | null;
  is_sandbox: boolean;
  provider_reference: string | null;
  failure_reason: string | null;
  created_at: string;
  approved_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
};

export type LedgerEntry = {
  id: number;
  type: string;
  description: string | null;
  account: "available" | "held";
  amount_minor: number;
  balance_after_minor: number;
  currency: string;
  reference: string;
  created_at: string;
};

/** Payout method families (GET /payout-providers → `type`). No card payouts. */
export type PayoutType = "mobile_money" | "bank" | "bank_international" | "wallet";

type PayoutFieldType = "text" | "email" | "tel" | "select" | "country";

/** One input the provider needs; POST /payout-methods takes `{[key]: value}`. */
export type PayoutField = {
  key: string;
  label: string;
  type: PayoutFieldType | (string & {});
  required: boolean;
  options?: { value: string; label: string }[] | null;
  hint?: string | null;
  max?: number | null;
};

export type PayoutProvider = {
  id: number;
  code: string;
  name: string;
  type: PayoutType | (string & {});
  /** ISO-2, or null for international/wallet providers. */
  country: string | null;
  currency: string;
  min_minor: number;
  max_minor: number | null;
  daily_limit_minor?: number | null;
  monthly_limit_minor?: number | null;
  fee_fixed_minor: number;
  fee_percent_bp: number;
  is_sandbox: boolean;
  /** English processing note from the API, e.g. "Processed manually…". */
  processing?: string | null;
  /** Ordered form schema for POST /payout-methods. */
  fields: PayoutField[];
};

/** GET /payout-methods item. Numbers and emails are never returned in full. */
export type PayoutMethod = {
  id: number;
  provider_code: string;
  type: PayoutType | (string & {});
  label: string | null;
  /** Masked, human summary, e.g. "CRDB Bank ···· 4821" or "PayPal j***@gmail.com". */
  display: string;
  is_default: boolean;
  account_name: string | null;
  bank_name: string | null;
  provider: { id: number; code: string; name: string; type: string; currency: string } | null;
  created_at: string | null;
};

export type WithdrawalQuote = {
  currency: string;
  gross_minor: number;
  fee_minor: number;
  net_minor: number;
  payout_currency: string;
  payout_amount_minor: number;
  payout_fee_minor: number;
  fx_rate: string | null;
  limits: {
    min_minor: number;
    max_minor: number | null;
    daily_limit_minor: number | null;
    monthly_limit_minor: number | null;
    currency: string;
  };
};

export type BreakdownBy = "month" | "store" | "release" | "track" | "territory" | "usage" | "statement";

export type BreakdownRow = {
  label: string | null;
  currency: string;
  amount_minor: number;
  units: number;
  lines: number;
};

export type RoyaltyStatement = {
  id: number;
  source: string;
  period_start: string;
  period_end: string;
  currency: string;
  amount_minor: number | string;
  posted_at: string | null;
};

/* ───────────────────────────── Marketplace ───────────────────────────── */

export type MetricsSource = "self_reported" | "admin_verified" | "platform_verified";

export type SocialAccount = {
  id?: number;
  platform: string;
  handle: string;
  url: string | null;
  followers: number | null;
  avg_views: number | null;
  engagement_rate_bp: number | null;
  audience_countries: { country: string; percent: number }[];
  metrics_source?: MetricsSource;
  verified?: boolean;
  metrics_verified_at?: string | null;
};

export type CreatorPackage = {
  id: number;
  title: string;
  platform: string;
  description: string | null;
  deliverable: string | null;
  price_minor: number;
  currency: string;
  turnaround_days: number;
  is_active: boolean;
};

export type PortfolioItem = {
  id: number;
  platform: string;
  /** "upload" (a video file on 2kTunes) or "external" (a link). */
  media_type?: "upload" | "external" | string;
  url: string | null;
  title: string | null;
  caption?: string | null;
  video_src?: string | null;
  thumbnail_url?: string | null;
  /** Always self-reported by the creator. */
  views: number | null;
  views_source?: "self_reported" | string;
  featured_on_home?: boolean;
};

type CreatorProfileStatus = "draft" | "pending_review" | "approved" | "rejected" | "suspended";

export type CreatorSummary = {
  id: number;
  slug: string;
  display_name: string;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  languages: string[];
  categories: string[];
  is_available: boolean;
  turnaround_days: number | null;
  total_followers: number;
  has_verified_metrics: boolean;
  from_price_minor: number | null;
  from_price_currency: string | null;
  social_accounts: SocialAccount[];
};

export type CreatorProfile = CreatorSummary & {
  bio: string | null;
  status: CreatorProfileStatus;
  review_note: string | null;
  packages: CreatorPackage[];
  portfolio: PortfolioItem[];
  completed_orders?: number;
};

export type PromotionService = {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string | null;
  disclaimer: string | null;
  price_minor: number;
  currency: string;
};

export type CampaignType =
  | "creator_campaign"
  | "tiktok_challenge"
  | "playlist_pitching"
  | "presave_campaign"
  | "social_promotion"
  | "influencer_marketing"
  | "advertising"
  | "marketing_package";

export type CampaignObjective =
  | "awareness"
  | "streams"
  | "ugc"
  | "presaves"
  | "followers"
  | "playlist_consideration";

export type OrderStatus =
  | "requested"
  | "under_review"
  | "forwarded"
  | "awaiting_payment"
  | "pending_payment"
  | "in_progress"
  | "submitted"
  | "disputed"
  | "completed"
  | "rejected"
  | "declined"
  | "expired"
  | "cancelled"
  | "refunded";

export type OrderTimelineEvent = {
  from: string | null;
  to: string;
  label: string | null;
  actor: "artist" | "creator" | "staff" | "system" | string;
  note: string | null;
  at: string;
};

export type OrderMessage = {
  id: number;
  body: string;
  is_system: boolean;
  was_redacted?: boolean;
  author?: "artist" | "creator" | "2kTunes" | string | null;
  mine: boolean;
  created_at: string;
};

export type OrderSong = {
  source: "catalog" | "external" | string;
  release_id: number | null;
  track_id: number | null;
  title: string | null;
  artist: string | null;
  url: string | null;
  platform: string | null;
  /** Detail only: the link, or a 30 minute signed audio URL for catalog songs. */
  listen_url?: string | null;
};

/** GET /orders, GET /orders/{id} (DOCS/API.md, Creator requests). */
export type Order = {
  id: number;
  reference: string;
  kind: "creator_request" | "service" | string;
  title: string;
  status: OrderStatus;
  status_label?: string | null;
  role: "buyer" | "creator";
  price_minor: number;
  currency: string;
  /** Filled for the creator only. */
  platform_fee_minor: number | null;
  creator_payout_minor: number | null;
  creator: { id: number; display_name: string; slug: string; avatar_url: string | null } | null;
  /** Creator view only. */
  artist?: { display_name: string } | null;
  package?: { id: number; title: string; platform: string; turnaround_days: number } | null;
  service: { id: number; name: string; category: string } | null;
  campaign_id: number | null;
  song?: OrderSong | null;
  brief: string | null;
  preferred_post_date?: string | null;
  creator_note?: string | null;
  submission_urls?: string[];
  submission_notes: string | null;
  fix_note?: string | null;
  fix_count?: number;
  close_reason?: string | null;
  close_note?: string | null;
  respond_by?: string | null;
  pay_by?: string | null;
  due_at: string | null;
  payment?: { method: string | null; paid_at: string | null; manual_reference_submitted: boolean } | null;
  overdue?: boolean;
  forwarded_at?: string | null;
  accepted_at: string | null;
  submitted_at: string | null;
  verified_at?: string | null;
  completed_at: string | null;
  closed_at?: string | null;
  created_at: string;
  can?: Partial<Record<"cancel" | "pay" | "accept" | "decline" | "submit" | "dispute" | "message", boolean>>;
  release?: { id: number; title: string; artist: string; slug: string | null } | null;
  timeline?: OrderTimelineEvent[];
  messages?: OrderMessage[];
  disputes?: {
    id: number;
    reason: string;
    status: string;
    resolution: string | null;
    resolution_note: string | null;
    created_at: string;
    resolved_at: string | null;
  }[];
};

export type Campaign = {
  id: number;
  user_id: number;
  release_id: number | null;
  track_id: number | null;
  title: string;
  type: CampaignType;
  objective: CampaignObjective | null;
  budget_minor: number | null;
  currency: string | null;
  target_countries: string[] | null;
  target_audience: string | null;
  brief: string | null;
  pitch: Record<string, string | null> | null;
  starts_on: string | null;
  ends_on: string | null;
  status: string;
  orders_count?: number;
  created_at: string;
  release?: { id: number; release_title: string; artist_name: string; slug?: string | null } | null;
  track?: { id: number; title: string } | null;
  /** Raw order rows on GET /campaigns/{id} (not the presented Order shape). */
  orders?: {
    id: number;
    reference: string;
    title: string;
    status: OrderStatus;
    price_minor: number;
    currency: string;
    created_at: string;
    creator?: { id: number; display_name: string; slug: string } | null;
    service?: { id: number; name: string; category: string } | null;
  }[];
};

/* ───────────────────────────── Public ───────────────────────────── */

export type PublicSmartLink = {
  slug: string;
  title: string;
  version: string | null;
  artist: string;
  type: string;
  cover_url: string | null;
  release_date: string | null;
  state: "live" | "upcoming" | "pending";
  links: { store: string; name: string; url: string }[];
  presave_enabled: boolean;
  artist_links: Partial<Record<"instagram" | "tiktok" | "youtube", string>>;
};
