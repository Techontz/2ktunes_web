/**
 * Mock 2kTunes API for visual QA (scripts/screenshot.mjs, SUITE=dashboard).
 *
 * Shapes follow DOCS/API.md and the Laravel controllers. These rows exist
 * only so screenshots show populated layouts; the app itself never ships
 * sample data. One sandbox delivery and one sandbox withdrawal are included
 * so the "Sandbox" badges are visible in QA.
 *
 *   handle(method, pathname, searchParams, body) → { status, body }
 */

const now = "2026-10-01T09:30:00Z";
const meta = (total, per = 20) => ({ current_page: 1, last_page: Math.max(1, Math.ceil(total / per)), per_page: per, total });

export const user = {
  id: 1,
  name: "Neema Said",
  email: "neema@example.com",
  avatar: null,
  business_name: null,
  first_name: "Neema",
  last_name: "Said",
  phone: "255754000000",
  country: "TZ",
  city: "Dar es Salaam",
  is_admin: false,
  account_type: "artist",
  onboarding_completed_at: "2026-02-01T00:00:00Z",
  email_verified_at: "2026-02-01T00:00:00Z",
  email_verified: true,
  has_active_subscription: true,
  has_creator_profile: true,
  subscription_plan_id: 2,
  subscription_plan: "Artist",
  subscription_status: "active",
  subscription_expires_at: "2027-02-01T00:00:00Z",
  locale: "en",
  preferred_currency: "TZS",
  allow_email: true,
  allow_mobile_alerts: false,
  created_at: "2026-02-01T00:00:00Z",
  updated_at: now,
};

const track = (id, n, title, over = {}) => ({
  id,
  release_id: 7,
  track_number: n,
  title,
  version: null,
  primary_artist: "Neema",
  featured_artists: [],
  isrc: `TZA1B26000${id}`,
  isrc_generated: true,
  language: "sw",
  lyrics: null,
  instrumental: false,
  explicit: false,
  is_clean_version: false,
  ai_generated: false,
  preview_start_seconds: null,
  publisher: null,
  ownership: "original",
  primary_genre: null,
  audio_url: null,
  audio: { original_name: `${title.toLowerCase()}.wav`, format: "wav", size: 48_000_000, duration_ms: 214_000, sample_rate: 44100, bit_depth: 24, channels: 2, sha256: "x" },
  credits: [
    { id: id * 10, role: "songwriter", name: "Neema Said", detail: null },
    { id: id * 10 + 1, role: "producer", name: "Juma Mnyampala", detail: null },
  ],
  ...over,
});

const base = {
  artist_id: 3,
  version: null,
  artist_name: "Neema",
  additional_artists: [],
  release_time: null,
  release_timezone: null,
  original_release_date: null,
  previously_released: false,
  record_label: null,
  language: "sw",
  secondary_genre: null,
  c_line_year: "2026",
  c_line_owner: "Neema Said",
  p_line_year: "2026",
  p_line_owner: "Neema Said",
  is_compilation: false,
  upc_generated: true,
  cover_image: null,
  cover: null,
  platforms: ["spotify", "apple_music", "boomplay", "audiomack", "youtube_music", "tiktok"],
  territories: { mode: "worldwide", countries: [] },
  social_options: {},
  agreements: { rights_confirmation: true, distribution_terms: true },
  smart_link_url: null,
  smart_link_enabled: true,
  presave_enabled: true,
  rejection_reason: null,
  submitted_at: null,
  approved_at: null,
  live_at: null,
  created_at: "2026-08-01T10:00:00Z",
  updated_at: "2026-09-28T10:00:00Z",
};

export const releases = [
  {
    ...base,
    id: 7,
    release_title: "Bahari ya Hindi",
    release_type: "EP",
    release_date: "2026-09-12",
    primary_genre: "Bongo Flava",
    upc: "4006381333931",
    status: "live",
    status_label: "Live",
    stage: 5,
    is_editable: false,
    slug: "bahari-ya-hindi-k2j9aa",
    draft_step: "review",
    submitted_at: "2026-08-20T10:00:00Z",
    approved_at: "2026-08-24T10:00:00Z",
    live_at: "2026-09-12T00:00:00Z",
    tracks_count: 3,
    tracks: [track(71, 1, "Bahari"), track(72, 2, "Upepo wa Pwani", { explicit: true }), track(73, 3, "Mawimbi")],
    open_issues: [],
    deliveries: [
      { id: 1, store: { slug: "spotify", name: "Spotify" }, status: "live", is_sandbox: false, live_url: "https://open.spotify.com/album/example", delivered_at: "2026-09-02T10:00:00Z", live_at: "2026-09-12T00:00:00Z" },
      { id: 2, store: { slug: "boomplay", name: "Boomplay" }, status: "live", is_sandbox: false, live_url: "https://www.boomplay.com/albums/example", delivered_at: "2026-09-02T10:00:00Z", live_at: "2026-09-12T00:00:00Z" },
      { id: 3, store: { slug: "apple_music", name: "Apple Music / iTunes" }, status: "delivered", is_sandbox: true, live_url: null, delivered_at: "2026-09-02T10:00:00Z", live_at: null },
    ],
    timeline: [
      { event: "status_changed", from: "draft", to: "submitted", actor_type: "user", note: null, at: "2026-08-20T10:00:00Z" },
      { event: "status_changed", from: "submitted", to: "approved", actor_type: "admin", note: null, at: "2026-08-24T10:00:00Z" },
      { event: "status_changed", from: "approved", to: "live", actor_type: "system", note: null, at: "2026-09-12T00:00:00Z" },
    ],
  },
  {
    ...base,
    id: 8,
    release_title: "Usiku Mwema",
    release_type: "Single",
    release_date: "2026-11-20",
    primary_genre: "Amapiano",
    upc: null,
    status: "changes_requested",
    status_label: "Changes requested",
    stage: 1,
    is_editable: true,
    slug: "usiku-mwema-p0q8zz",
    draft_step: "tracks",
    tracks_count: 1,
    tracks: [track(81, 1, "Usiku Mwema", { audio: null, credits: [] })],
    open_issues: [{ id: 1, field: "cover_image", track_id: null, severity: "blocking", message: "The artwork contains a website address. Remove it and upload again." }],
    deliveries: [],
    timeline: [{ event: "status_changed", from: "submitted", to: "changes_requested", actor_type: "admin", note: "Artwork contains a URL.", at: "2026-09-26T10:00:00Z" }],
  },
  {
    ...base,
    id: 9,
    release_title: "Safari ya Moyo",
    release_type: "Album",
    release_date: null,
    primary_genre: "Afrobeats",
    upc: null,
    status: "draft",
    status_label: "Draft",
    stage: 0,
    is_editable: true,
    slug: "safari-ya-moyo-u7t1bb",
    draft_step: "info",
    tracks_count: 0,
    tracks: [],
    open_issues: [],
    deliveries: [],
    timeline: [],
  },
];

const config = {
  artwork: { min_px: 3000, max_px: 6000, max_kb: 20480, mimes: ["jpg", "jpeg", "png"], must_be_square: true },
  audio: { max_mb: 500, formats: ["wav", "flac", "mp3"], lossless_formats: ["wav", "flac"], min_sample_rate: 44100, min_bit_depth: 16, min_duration_seconds: 30 },
  tracks: { Single: { min: 1, max: 3 }, EP: { min: 2, max: 7 }, Album: { min: 5, max: 50 } },
  min_lead_days: 7,
  recommended_lead_days: 21,
  genres: ["Afrobeats", "Bongo Flava", "Amapiano", "Singeli", "Taarab", "Gospel", "Hip-Hop/Rap", "R&B/Soul"],
  languages: { sw: "Swahili", en: "English", fr: "French", zxx: "No linguistic content" },
  contributor_roles: ["primary_artist", "featured_artist", "producer", "composer", "songwriter", "lyricist", "mixing_engineer", "mastering_engineer"],
  isrc_generation: false,
  upc_generation: false,
  required_agreements: ["rights_confirmation", "distribution_terms"],
  upload_chunk_size: 8388608,
  marketplace: {
    platforms: ["tiktok", "instagram", "youtube", "facebook", "x", "snapchat", "audiomack", "boomplay"],
    categories: ["dance", "comedy", "lifestyle", "fashion", "music", "lip_sync"],
    campaign_types: ["creator_campaign", "tiktok_challenge", "playlist_pitching", "presave_campaign", "social_promotion", "influencer_marketing", "advertising", "marketing_package"],
    currencies: ["TZS", "USD", "KES", "UGX", "NGN"],
    platform_fee_bp: 1500,
  },
};

const stores = [
  ["spotify", "Spotify", "streaming", "available"],
  ["apple_music", "Apple Music / iTunes", "streaming", "available"],
  ["youtube_music", "YouTube Music", "streaming", "available"],
  ["tiktok", "TikTok & CapCut", "social", "available"],
  ["meta", "Instagram & Facebook", "social", "available"],
  ["boomplay", "Boomplay", "streaming", "available"],
  ["audiomack", "Audiomack", "streaming", "available"],
  ["deezer", "Deezer", "streaming", "available"],
  ["shazam", "Shazam", "discovery", "available"],
  ["mdundo", "Mdundo", "streaming", "coming_soon"],
  ["youtube_content_id", "YouTube Content ID", "rights", "coming_soon"],
].map(([slug, name, category, status], i) => ({ id: i + 1, slug, name, category, status }));

const balances = [
  { currency: "TZS", available_minor: 184_250_00, held_minor: 50_000_00, pending_minor: 12_300_00, lifetime_earnings_minor: 412_800_00, withdrawn_minor: 178_550_00 },
  { currency: "USD", available_minor: 4_210, held_minor: 0, pending_minor: 0, lifetime_earnings_minor: 9_875, withdrawn_minor: 5_665 },
];

const withdrawals = [
  { id: 31, reference: "WD-7Q2M9K", status: "processing", currency: "TZS", gross_minor: 50_000_00, fee_minor: 1_000_00, net_minor: 49_000_00, payout_currency: "TZS", payout_amount_minor: 49_000_00, fx_rate: null, destination: "M-Pesa •••• 4821", is_sandbox: false, provider_reference: null, failure_reason: null, created_at: "2026-09-29T08:00:00Z", approved_at: "2026-09-29T12:00:00Z", completed_at: null, failed_at: null },
  { id: 30, reference: "WD-5H1X2P", status: "completed", currency: "TZS", gross_minor: 120_000_00, fee_minor: 2_400_00, net_minor: 117_600_00, payout_currency: "TZS", payout_amount_minor: 117_600_00, fx_rate: null, destination: "Airtel Money •••• 0917", is_sandbox: true, provider_reference: "SBX-001", failure_reason: null, created_at: "2026-08-15T08:00:00Z", approved_at: "2026-08-15T09:00:00Z", completed_at: "2026-08-15T10:00:00Z", failed_at: null },
];

const providers = [
  { id: 1, code: "mpesa_tz", name: "M-Pesa (Vodacom)", type: "mobile_money", country: "TZ", currency: "TZS", min_minor: 10_000_00, max_minor: 5_000_000_00, daily_limit_minor: 10_000_000_00, monthly_limit_minor: null, fee_fixed_minor: 1_000_00, fee_percent_bp: 0, is_sandbox: false, processing: "Processed by the 2kTunes finance team, usually within 1–2 business days." },
  { id: 2, code: "airtel_tz", name: "Airtel Money", type: "mobile_money", country: "TZ", currency: "TZS", min_minor: 10_000_00, max_minor: 3_000_000_00, daily_limit_minor: null, monthly_limit_minor: null, fee_fixed_minor: 0, fee_percent_bp: 150, is_sandbox: true, processing: "Processed automatically." },
  { id: 3, code: "bank_tz", name: "Bank transfer (TZ)", type: "bank", country: "TZ", currency: "TZS", min_minor: 50_000_00, max_minor: null, daily_limit_minor: null, monthly_limit_minor: null, fee_fixed_minor: 5_000_00, fee_percent_bp: 0, is_sandbox: false, processing: "Processed by the 2kTunes finance team, usually within 1–2 business days." },
];

const methods = [
  { id: 1, label: "My M-Pesa", account_name: "Neema Said", masked: "•••• •••• 4821", bank_name: null, is_default: true, provider: { id: 1, code: "mpesa_tz", name: "M-Pesa (Vodacom)", type: "mobile_money", currency: "TZS" }, created_at: "2026-03-01T00:00:00Z" },
];

const ledger = [
  { id: 501, type: "withdrawal", description: "Withdrawal WD-7Q2M9K", account: "held", amount_minor: 50_000_00, balance_after_minor: 50_000_00, currency: "TZS", reference: "tx-4b1e", created_at: "2026-09-29T08:00:00Z" },
  { id: 500, type: "withdrawal", description: "Withdrawal WD-7Q2M9K", account: "available", amount_minor: -50_000_00, balance_after_minor: 184_250_00, currency: "TZS", reference: "tx-4b1e", created_at: "2026-09-29T08:00:00Z" },
  { id: 480, type: "royalty", description: "Royalties — Spotify, August 2026", account: "available", amount_minor: 96_400_00, balance_after_minor: 234_250_00, currency: "TZS", reference: "tx-9ac2", created_at: "2026-09-20T08:00:00Z" },
];

const analytics = {
  range: { from: "2025-10-01", to: "2026-10-01" },
  has_data: true,
  totals: { revenue: [{ currency: "TZS", revenue_minor: 412_800_00 }], streams: 1_284_400, downloads: 210, video_uses: 18_900 },
  by_month: ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09"].map((m, i) => ({ month: m, currency: "TZS", revenue_minor: [42, 61, 88, 104, 117][i] * 1_000_00, streams: [98, 140, 212, 270, 318][i] * 1000 })),
  top_releases: [{ id: 7, label: "Bahari ya Hindi", currency: "TZS", revenue_minor: 398_000_00, units: 1_240_000 }],
  top_tracks: [
    { id: 71, label: "Bahari", currency: "TZS", revenue_minor: 201_000_00, units: 640_000 },
    { id: 72, label: "Upepo wa Pwani", currency: "TZS", revenue_minor: 132_000_00, units: 402_000 },
  ],
  top_stores: [
    { label: "Boomplay", currency: "TZS", revenue_minor: 180_000_00, units: 610_000 },
    { label: "Spotify", currency: "TZS", revenue_minor: 150_000_00, units: 420_000 },
    { label: "TikTok", currency: "TZS", revenue_minor: 40_000_00, units: 18_900 },
  ],
  top_territories: [
    { label: "TZ", currency: "TZS", revenue_minor: 250_000_00, units: 820_000 },
    { label: "KE", currency: "TZS", revenue_minor: 90_000_00, units: 260_000 },
  ],
  by_usage: [
    { label: "stream", currency: "TZS", revenue_minor: 370_000_00, units: 1_284_400 },
    { label: "ugc", currency: "TZS", revenue_minor: 40_000_00, units: 18_900 },
  ],
  smart_links: {
    views: 4_820,
    unique_visitors: 3_910,
    clicks: 1_730,
    presaves: 96,
    by_day: [],
    by_store: [{ label: "boomplay", n: 820 }, { label: "spotify", n: 610 }],
    by_country: [{ label: "TZ", n: 3_100 }, { label: "KE", n: 900 }],
    by_device: [{ label: "mobile", n: 4_300 }, { label: "desktop", n: 520 }],
    by_referrer: [{ label: "instagram.com", n: 2_100 }],
  },
  campaigns: { active_orders: 1, completed_orders: 2 },
};

const creator = {
  id: 4,
  slug: "amani-dances",
  display_name: "Amani Dances",
  avatar_url: null,
  country: "TZ",
  city: "Arusha",
  languages: ["sw", "en"],
  categories: ["dance", "music"],
  is_available: true,
  turnaround_days: 5,
  total_followers: 184_000,
  has_verified_metrics: true,
  from_price_minor: 150_000_00,
  from_price_currency: "TZS",
  social_accounts: [
    { id: 1, platform: "tiktok", handle: "@amanidances", url: "https://www.tiktok.com/@amanidances", followers: 152_000, avg_views: 41_000, engagement_rate_bp: 820, audience_countries: [{ country: "TZ", percent: 71 }], metrics_source: "admin_verified", verified: true, metrics_verified_at: "2026-09-01T00:00:00Z" },
    { id: 2, platform: "instagram", handle: "@amani.dances", url: null, followers: 32_000, avg_views: 6_000, engagement_rate_bp: 410, audience_countries: [], metrics_source: "self_reported", verified: false, metrics_verified_at: null },
  ],
};
const creatorFull = {
  ...creator,
  bio: "Dance creator from Arusha. I build short choreography around new Bongo Flava and Amapiano songs.",
  status: "approved",
  review_note: null,
  completed_orders: 12,
  packages: [
    { id: 11, title: "One TikTok dance video", platform: "tiktok", description: "A 15–30 second original dance to your song, posted on my account.", deliverable: "1 TikTok post", price_minor: 150_000_00, currency: "TZS", turnaround_days: 5, is_active: true },
    { id: 12, title: "Instagram Reel + Story", platform: "instagram", description: null, deliverable: "1 Reel, 1 Story", price_minor: 220_000_00, currency: "TZS", turnaround_days: 7, is_active: true },
  ],
  portfolio: [{ id: 1, platform: "tiktok", url: "https://www.tiktok.com/@amanidances/video/1", title: "Amapiano challenge", views: 210_000 }],
};

const order = {
  id: 5,
  reference: "OR-8K2P1Q",
  title: "One TikTok dance video",
  status: "submitted",
  role: "buyer",
  price_minor: 150_000_00,
  currency: "TZS",
  platform_fee_minor: 22_500_00,
  creator_payout_minor: 127_500_00,
  creator: { id: 4, display_name: "Amani Dances", slug: "amani-dances", avatar_url: null },
  service: null,
  campaign_id: 1,
  brief: "Dance to the chorus of “Bahari”. Tag @neema and use #BahariChallenge.",
  submission_url: "https://www.tiktok.com/@amanidances/video/2",
  submission_notes: "Posted at 7pm EAT for best reach.",
  revision_count: 0,
  due_at: "2026-10-04T00:00:00Z",
  paid_at: "2026-09-25T00:00:00Z",
  accepted_at: "2026-09-25T06:00:00Z",
  submitted_at: "2026-09-29T19:00:00Z",
  completed_at: null,
  created_at: "2026-09-24T00:00:00Z",
  release: { id: 7, title: "Bahari ya Hindi", artist: "Neema", slug: "bahari-ya-hindi-k2j9aa" },
  track: { id: 71, title: "Bahari" },
  messages: [
    { id: 1, body: "Order paid from wallet.", is_system: true, author: null, mine: false, created_at: "2026-09-25T00:00:00Z" },
    { id: 2, body: "Karibu! I'll post it Tuesday evening.", is_system: false, author: "Amani Dances", mine: false, created_at: "2026-09-25T06:10:00Z" },
    { id: 3, body: "Asante sana!", is_system: false, author: "Neema Said", mine: true, created_at: "2026-09-25T07:00:00Z" },
  ],
  disputes: [],
};

const campaign = {
  id: 1,
  user_id: 1,
  release_id: 7,
  track_id: 71,
  title: "#BahariChallenge",
  type: "tiktok_challenge",
  objective: "ugc",
  budget_minor: 600_000_00,
  currency: "TZS",
  target_countries: ["TZ", "KE"],
  target_audience: "18–30, dance and Bongo Flava fans",
  brief: "Short dance videos to the chorus.",
  pitch: null,
  starts_on: "2026-09-20",
  ends_on: "2026-10-20",
  status: "active",
  orders_count: 1,
  created_at: "2026-09-18T00:00:00Z",
  release: { id: 7, release_title: "Bahari ya Hindi", artist_name: "Neema", slug: "bahari-ya-hindi-k2j9aa" },
  track: { id: 71, title: "Bahari" },
  orders: [{ id: 5, reference: "OR-8K2P1Q", title: "One TikTok dance video", status: "submitted", price_minor: 150_000_00, currency: "TZS", created_at: "2026-09-24T00:00:00Z", creator: { id: 4, display_name: "Amani Dances", slug: "amani-dances" }, service: null }],
};

const services = [
  { id: 1, code: "playlist_pitch", name: "Editorial playlist pitching", category: "playlist_pitching", description: "We prepare and submit your pitch to store editorial teams before release.", disclaimer: "Placement is decided by each store's editors. We can't guarantee a placement or a number of streams.", price_minor: 80_000_00, currency: "TZS" },
  { id: 2, code: "social_ads", name: "Social ads setup", category: "advertising", description: "Instagram and TikTok ad set-up with your budget and targeting.", disclaimer: "Ad spend is paid to the platform separately. Results vary.", price_minor: 120_000_00, currency: "TZS" },
];

const notifications = [
  { id: "n1", event: "order.submitted", category: "marketplace", title: "Work delivered", body: "Amani Dances delivered “One TikTok dance video”. Review it within 5 days.", action_path: "/dashboard/orders/5", data: null, read_at: null, created_at: "2026-09-29T19:05:00Z" },
  { id: "n2", event: "release.changes_requested", category: "releases", title: "Changes requested", body: "“Usiku Mwema” needs changes before it can go out.", action_path: "/dashboard/music/8", data: null, read_at: null, created_at: "2026-09-26T10:00:00Z" },
  { id: "n3", event: "royalties.posted", category: "royalties", title: "Royalties posted", body: "TZS 96,400.00 from Spotify (August 2026) is in your wallet.", action_path: "/dashboard/royalties", data: null, read_at: "2026-09-21T08:00:00Z", created_at: "2026-09-20T08:00:00Z" },
];

const tickets = [
  { id: 3, reference: "T8XK2M1Q", category: "payouts", subject: "Withdrawal still processing", status: "awaiting_user", last_activity_at: "2026-09-30T10:00:00Z", created_at: "2026-09-29T12:00:00Z" },
];
const ticket = {
  ...tickets[0],
  messages: [
    { id: 1, body: "My withdrawal WD-7Q2M9K has been processing since yesterday.", is_staff: false, attachment_name: null, created_at: "2026-09-29T12:00:00Z", user: { id: 1, name: "Neema Said" } },
    { id: 2, body: "Habari Neema, M-Pesa payouts are confirmed by our finance team within 1–2 business days. We'll update you here.", is_staff: true, attachment_name: null, created_at: "2026-09-30T10:00:00Z", user: { id: 90, name: "Rehema (Support)" } },
  ],
};

const help = {
  en: [
    { id: 1, slug: "how-withdrawals-work", category: "payouts", title: "How withdrawals work", summary: "Fees, limits and how long M-Pesa, Airtel Money, Mixx and bank payouts take." },
    { id: 2, slug: "artwork-requirements", category: "releases", title: "Artwork requirements", summary: "Size, format and what stores reject." },
  ],
  sw: [
    { id: 3, slug: "jinsi-ya-kutoa-pesa", category: "payouts", title: "Jinsi utoaji wa pesa unavyofanya kazi", summary: "Ada, viwango na muda wa malipo kwa M-Pesa, Airtel Money, Mixx na benki." },
  ],
};

const plans = [
  { id: 1, name: "Free", price: "0.00", currency: "TZS", duration: 365, description: "One artist, pay-as-you-go features.", max_artists: 1, is_active: true, order: 1, features: ["1 artist profile", "Smart links"] },
  { id: 2, name: "Artist", price: "60000.00", currency: "TZS", duration: 365, description: "Unlimited releases for one artist.", max_artists: 1, is_active: true, order: 2, features: ["Unlimited releases", "Pre-save pages", "Priority support"] },
  { id: 3, name: "Label", price: "250000.00", currency: "TZS", duration: 365, description: "For teams managing several artists.", max_artists: 10, is_active: true, order: 3, features: ["Up to 10 artists", "Split sheets", "Team support"] },
];

const splits = {
  sheets: [
    {
      id: 1,
      version: 1,
      status: "pending",
      effective_from: "2026-10-01",
      activated_at: null,
      release: { id: 7, title: "Bahari ya Hindi" },
      track: null,
      shares: [
        { id: 1, name: "Neema Said", email: "neema@example.com", role: "artist", share_bp: 7000, status: "accepted", responded_at: now },
        { id: 2, name: "Juma Mnyampala", email: "juma@example.com", role: "producer", share_bp: 3000, status: "invited", responded_at: null },
      ],
    },
  ],
  invitations: [
    { id: 9, status: "invited", share_bp: 2500, role: "songwriter", release: { id: 55, title: "Kilimanjaro", artist: "Baraka" }, track: null, from: "Baraka Music", sheet_status: "pending", effective_from: "2026-10-05" },
  ],
};

const artists = [
  { id: 3, user_id: 1, name: "Neema", slug: "neema-x1y2", bio: "Singer-songwriter from Dar es Salaam.", country: "TZ", primary_genre: "Bongo Flava", avatar_url: null, spotify_link: "https://open.spotify.com/artist/example", apple_music_link: null, youtube_music_link: null, instagram_link: "https://instagram.com/neema", facebook_link: null, tiktok_link: null, boomplay_link: null, audiomack_link: null, releases_count: 3, created_at: "2026-02-01T00:00:00Z" },
];

const publicRelease = {
  slug: "bahari-ya-hindi-k2j9aa",
  title: "Bahari ya Hindi",
  version: null,
  artist: "Neema",
  type: "EP",
  cover_url: null,
  release_date: "2026-09-12",
  state: "live",
  links: [
    { store: "spotify", name: "Spotify", url: "https://open.spotify.com/album/example" },
    { store: "boomplay", name: "Boomplay", url: "https://www.boomplay.com/albums/example" },
  ],
  presave_enabled: false,
  artist_links: { instagram: "https://instagram.com/neema" },
};

const ok = (payload, status = 200) => ({ status, body: { status: true, ...payload } });

/** Route table: [method, path regex, handler(match, query, body)] */
const routes = [
  ["GET", /^\/profile$|^\/me$/, () => ok({ user })],
  ["GET", /^\/dashboard$/, () =>
    ok({
      balances,
      release_counts: { live: 1, changes_requested: 1, draft: 1 },
      recent_releases: releases,
      analytics: { has_data: true, streams: analytics.totals.streams, video_uses: analytics.totals.video_uses, top_release: analytics.top_releases[0], top_territory: analytics.top_territories[0], top_store: analytics.top_stores[0], by_month: analytics.by_month },
      active_orders: 1,
      open_tickets: 1,
      unread_notifications: 2,
      action_items: [
        { type: "changes_requested", message: "\"Usiku Mwema\" needs changes before it can go out.", path: "/dashboard/music/8" },
        { type: "drafts", message: "You have 1 unfinished draft.", path: "/dashboard/music?status=drafts" },
        { type: "split_invites", message: "You have 1 royalty split invitation to review.", path: "/dashboard/splits" },
      ],
    })],
  ["GET", /^\/analytics$/, () => ok({ analytics })],
  ["GET", /^\/notifications$/, () => ok({ notifications, unread: 2, meta: meta(3, 30) })],
  ["GET", /^\/notification-preferences$/, () =>
    ok({
      preferences: Object.fromEntries(["releases", "royalties", "payouts", "marketplace", "support", "product_updates"].map((k) => [k, { database: true, mail: k !== "product_updates" }])),
      categories: ["releases", "royalties", "payouts", "marketplace", "support", "product_updates"],
    })],
  ["GET", /^\/subscription$/, () =>
    ok({
      subscription_status: "active",
      plan: plans[1],
      expires_at: "2027-02-01T00:00:00Z",
      pending_payment: null,
      payment_instructions: { methods: ["mpesa_tz", "airtel_tz", "mixx_tz", "bank"], note: "Pay using the details shown in the app, then enter your payment reference.", details: { mpesa_lipa_number: "5123456", account_name: "2kTunes Ltd" } },
    })],
  ["GET", /^\/plans$/, () => ok({ plans })],
  ["GET", /^\/release-config$/, () => ok({ config })],
  ["GET", /^\/stores$/, () => ok({ stores })],
  ["GET", /^\/releases$/, (_m, q) => {
    const status = q.get("status");
    const groups = { drafts: ["draft", "changes_requested"], in_review: ["submitted", "under_review"], live: ["live"] };
    const rows = status ? releases.filter((r) => (groups[status] ?? [status]).includes(r.status)) : releases;
    return ok({ releases: rows, meta: meta(rows.length), summary: { drafts: 2, in_review: 0, distributing: 0, live: 1, inactive: 0, all: 3 } });
  }],
  ["GET", /^\/releases\/(\d+)$/, (m) => {
    const r = releases.find((x) => String(x.id) === m[1]);
    return r ? ok({ release: r }) : { status: 404, body: { status: false, code: "not_found", message: "Not found." } };
  }],
  ["GET", /^\/releases\/(\d+)\/validation$/, (m) =>
    ok({
      validation: m[1] === "7"
        ? { ready: true, errors: [], warnings: [], steps: {}, tracks: {} }
        : {
            ready: false,
            errors: [
              { step: "artwork", field: "cover_image", message: "Upload cover artwork.", track_id: null },
              { step: "tracks", field: "audio", message: "Track 1: upload the audio file.", track_id: 81 },
              { step: "contributors", field: "songwriters", message: "Track 1: add at least one songwriter or composer (real names).", track_id: 81 },
            ],
            warnings: [{ step: "schedule", field: "release_date", message: "Tip: releasing 3+ weeks out gives time for playlist pitching and pre-saves.", track_id: null }],
            steps: {},
            tracks: {},
          },
    })],
  ["GET", /^\/releases\/(\d+)\/splits$/, (m) => ok({ sheets: m[1] === "7" ? splits.sheets : [] })],
  ["PATCH", /^\/releases\/(\d+)$/, (m) => ok({ release: releases.find((x) => String(x.id) === m[1]) ?? releases[2] })],
  ["GET", /^\/artists$/, () => ok({ artists, user: { id: 1, subscription_plan: "Artist", plan: plans[1] }, limit: 1 })],
  ["GET", /^\/splits$/, () => ok(splits)],
  ["GET", /^\/wallet$/, () => ok({ balances, open_withdrawals: [withdrawals[0]] })],
  ["GET", /^\/wallet\/statement$/, () => ok({ entries: ledger, meta: meta(ledger.length, 25) })],
  ["GET", /^\/withdrawals$/, () => ok({ withdrawals, meta: meta(withdrawals.length) })],
  ["GET", /^\/payout-providers$/, () => ok({ providers })],
  ["GET", /^\/payout-methods$/, () => ok({ methods })],
  ["GET", /^\/royalties\/breakdown$/, (_m, q) => {
    const by = q.get("by") ?? "month";
    const rows =
      by === "month"
        ? analytics.by_month.map((r) => ({ label: r.month, currency: "TZS", amount_minor: r.revenue_minor, units: r.streams, lines: 40 }))
        : analytics.top_stores.map((r) => ({ label: r.label, currency: "TZS", amount_minor: r.revenue_minor, units: r.units, lines: 12 }));
    return ok({ by, range: { from: "2025-10-01", to: "2026-10-31" }, rows });
  }],
  ["GET", /^\/royalties\/statements$/, () =>
    ok({ statements: [{ id: 1, source: "Spotify", period_start: "2026-08-01", period_end: "2026-08-31", currency: "TZS", amount_minor: "9640000", posted_at: "2026-09-20T08:00:00Z" }] })],
  ["GET", /^\/creators$/, () => ok({ creators: [creator, { ...creator, id: 5, slug: "zuri-vibes", display_name: "Zuri Vibes", country: "KE", city: "Nairobi", total_followers: 61_000, has_verified_metrics: false, from_price_minor: 90_000_00, social_accounts: [{ ...creator.social_accounts[1], id: 3 }] }], meta: meta(2, 24), filters: { platforms: config.marketplace.platforms, categories: config.marketplace.categories } })],
  ["GET", /^\/creators\/([\w-]+)$/, () => ok({ creator: creatorFull })],
  ["GET", /^\/creator\/profile$/, () => ok({ profile: { ...creatorFull, status: "approved" } })],
  ["GET", /^\/campaigns$/, () => ok({ campaigns: [campaign], meta: meta(1) })],
  ["GET", /^\/campaigns\/(\d+)$/, () => ok({ campaign })],
  ["GET", /^\/promotion-services$/, () => ok({ services })],
  ["GET", /^\/orders$/, (_m, q) => ok({ orders: q.get("as") === "creator" ? [] : [order], meta: meta(q.get("as") === "creator" ? 0 : 1) })],
  ["GET", /^\/orders\/(\d+)$/, () => ok({ order })],
  ["GET", /^\/support\/tickets$/, () => ok({ tickets, meta: meta(1) })],
  ["GET", /^\/support\/tickets\/(\d+)$/, () => ok({ ticket })],
  ["GET", /^\/help$/, (_m, q) => ok({ articles: help[q.get("locale") === "sw" ? "sw" : "en"] })],
  ["GET", /^\/help\/([\w-]+)$/, (m) =>
    ok({ article: { ...(help.en.find((a) => a.slug === m[1]) ?? help.en[0]), locale: "en", body: "Withdrawals move money from your available balance to your payout method.\n\nFees and limits depend on the provider and are shown before you confirm." } })],
  ["GET", /^\/public\/releases\/([\w-]+)$/, (m) => (m[1] === publicRelease.slug ? ok({ release: publicRelease }) : { status: 404, body: { status: false, code: "not_found", message: "Not found." } })],
  ["POST", /^\/public\/releases\/([\w-]+)\/events$/, () => ok({}, 202)],
];

export function handle(method, path, query, body) {
  for (const [m, re, fn] of routes) {
    if (m !== method) continue;
    const match = re.exec(path);
    if (match) return fn(match, query, body);
  }
  return null;
}

/** A user who has not finished onboarding (for /onboarding shots). */
export const newUser = { ...user, onboarding_completed_at: null, account_type: "artist", has_creator_profile: false };
