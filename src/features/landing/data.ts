/**
 * 2K Tunes landing-page content.
 *
 * Release titles and artist aliases below are original fixtures written for
 * this page — they are product demonstrations, not a real catalogue or real
 * people. Numbers shown in the analytics and earnings sections are likewise
 * illustrative sample data and are labelled as such in the UI.
 */

import type { Cover } from "./art/CoverArt";

/**
 * The catalogue is sequenced dark → bright → mid, repeating. That rhythm is
 * what keeps the hero wall from going muddy: whichever arc of the ring happens
 * to be facing the camera, it always holds all three tonal weights.
 */
export const COVERS: Cover[] = [
  // dark
  { id: "c01", title: "Mwanzo", artist: "Nala K", style: "orbit", from: "#1B0B3B", to: "#4A11CC", ink: "#FFFFFF", accent: "#CBF24C" },
  // bright
  { id: "c02", title: "Kigali Tape", artist: "Juma X", style: "grid", from: "#F7F5EE", to: "#DAD5C4", ink: "#101010", accent: "#6D2BFF" },
  // mid
  { id: "c03", title: "Bahari Kali", artist: "Msafiri 7", style: "wave", from: "#0A5560", to: "#14A3AC", ink: "#F2F0EA", accent: "#FFC94A" },

  { id: "c04", title: "Moto Room", artist: "Kijivu", style: "type", from: "#0C0C0C", to: "#262626", ink: "#FFFFFF", accent: "#CBF24C" },
  { id: "c05", title: "Zanzibar Gold", artist: "Lulu B", style: "halo", from: "#FFD873", to: "#EE9F17", ink: "#241703", accent: "#FFF4D6" },
  { id: "c06", title: "Dar After Dark", artist: "Sauti Room", style: "split", from: "#141046", to: "#3B2AC0", ink: "#F2F0EA", accent: "#8A5CFF" },

  { id: "c07", title: "Nyota", artist: "Zuhura", style: "orbit", from: "#12040C", to: "#4A0C2A", ink: "#FFFFFF", accent: "#E1421F" },
  { id: "c08", title: "Sauti Mpya", artist: "Imani W", style: "rings", from: "#E2F786", to: "#A6D42A", ink: "#16210A", accent: "#FFFFFF" },
  { id: "c09", title: "Ngoma Ya Leo", artist: "Tembo Club", style: "stack", from: "#8C3A0B", to: "#E1622A", ink: "#F2F0EA", accent: "#FFC94A" },

  { id: "c10", title: "Usiku Mrefu", artist: "Kito 9", style: "grid", from: "#0A0A0A", to: "#1D1D1D", ink: "#F2F0EA", accent: "#8A5CFF" },
  { id: "c11", title: "Pwani", artist: "Rehema", style: "stack", from: "#9ACEF7", to: "#3B82D9", ink: "#06203D", accent: "#FFFFFF" },
  { id: "c12", title: "Taarab Future", artist: "Neema S", style: "wave", from: "#241059", to: "#6D2BFF", ink: "#F2F0EA", accent: "#CBF24C" },

  { id: "c13", title: "Mapenzi", artist: "Keziah M", style: "halo", from: "#2B0518", to: "#8A1147", ink: "#FFFFFF", accent: "#FF9EC4" },
  { id: "c14", title: "Tumaini", artist: "Amani L", style: "rings", from: "#EFEDE4", to: "#C9C3B2", ink: "#101010", accent: "#E1421F" },
  { id: "c15", title: "Serengeti Bass", artist: "Simba Crew", style: "rings", from: "#0E3A1C", to: "#1F8F42", ink: "#F2F0EA", accent: "#CBF24C" },

  { id: "c16", title: "Bongo Vol. 4", artist: "DJ Moto", style: "type", from: "#1C0404", to: "#6E1212", ink: "#FFFFFF", accent: "#FFC94A" },
  { id: "c17", title: "Mto", artist: "Obi Plus", style: "split", from: "#FFC0D0", to: "#F2547D", ink: "#2B0512", accent: "#FFFFFF" },
  { id: "c18", title: "Kilimanjaro", artist: "Baraka T", style: "orbit", from: "#1E1804", to: "#7A6210", ink: "#F2F0EA", accent: "#CBF24C" },
];


/* ── Streaming + social destinations ───────────────────────────────── */

export type Platform = {
  name: string;
  /** Squircle tile colour. */
  bg: string;
  /** Glyph colour on the tile. */
  fg: string;
  mark: string;
};

export const PLATFORMS: Platform[] = [
  { name: "Spotify", bg: "#1DB954", fg: "#000000", mark: "spotify" },
  { name: "Apple Music", bg: "#FA243C", fg: "#FFFFFF", mark: "note" },
  { name: "YouTube Music", bg: "#FF0033", fg: "#FFFFFF", mark: "play" },
  { name: "TikTok", bg: "#010101", fg: "#FFFFFF", mark: "tiktok" },
  { name: "Instagram", bg: "#C7288E", fg: "#FFFFFF", mark: "instagram" },
  { name: "Facebook", bg: "#1877F2", fg: "#FFFFFF", mark: "facebook" },
  { name: "Amazon Music", bg: "#25D1DA", fg: "#0E1D25", mark: "wave" },
  { name: "Deezer", bg: "#A238FF", fg: "#FFFFFF", mark: "bars" },
  { name: "Tidal", bg: "#0A0A0A", fg: "#FFFFFF", mark: "tidal" },
  { name: "Boomplay", bg: "#F25C05", fg: "#FFFFFF", mark: "play" },
  { name: "Audiomack", bg: "#FFA200", fg: "#0E0E0E", mark: "bars" },
  { name: "SoundCloud", bg: "#FF5500", fg: "#FFFFFF", mark: "wave" },
  { name: "Anghami", bg: "#1B0B3B", fg: "#FFFFFF", mark: "note" },
  { name: "Pandora", bg: "#3668FF", fg: "#FFFFFF", mark: "bars" },
  { name: "Napster", bg: "#0A0A0A", fg: "#CBF24C", mark: "note" },
  { name: "iHeartRadio", bg: "#C6002B", fg: "#FFFFFF", mark: "play" },
];

/* ── Payout methods ─────────────────────────────────────────────────── */

/**
 * Payout methods.
 *
 * IMPORTANT — every entry here is `planned`, and the UI labels it as such.
 *
 * Verified in 2ktunes_app_backend: `POST /api/royalties/withdraw`
 * (RoyaltyController@withdraw) validates an amount and a free-text `method`
 * string, enforces a $25 minimum, and writes a `royalty_transactions` row. There
 * is no provider SDK, no gateway credentials and no automated disbursement
 * anywhere in the codebase. Presenting any of these as a live integration would
 * be a false claim, so none of them is marked available.
 *
 * When a provider is genuinely integrated, change its `status` to "live".
 */
export type Payout = {
  name: string;
  region: string;
  tint: string;
  initials: string;
  status: "live" | "planned";
};

export const PAYOUTS: Payout[] = [
  { name: "M-Pesa", region: "Tanzania · Kenya", tint: "#00A94F", initials: "M", status: "planned" },
  { name: "Airtel Money", region: "Tanzania · Uganda", tint: "#E1421F", initials: "A", status: "planned" },
  { name: "Mixx by Yas", region: "Tanzania", tint: "#6D2BFF", initials: "Y", status: "planned" },
  { name: "HaloPesa", region: "Tanzania", tint: "#FFC94A", initials: "H", status: "planned" },
  { name: "Bank transfer", region: "Local & international", tint: "#F2F0EA", initials: "B", status: "planned" },
  { name: "MTN MoMo", region: "Uganda · Rwanda", tint: "#FFC94A", initials: "MTN", status: "planned" },
];

/** Real, backend-enforced: RoyaltyController@withdraw rejects under $25. */
export const MIN_WITHDRAWAL_USD = 25;

/* ── Illustrative analytics fixtures ───────────────────────────────── */

export const TERRITORIES = [
  { name: "Tanzania", share: 34, streams: "418K" },
  { name: "Kenya", share: 19, streams: "233K" },
  { name: "Nigeria", share: 13, streams: "159K" },
  { name: "United Kingdom", share: 11, streams: "135K" },
  { name: "South Africa", share: 8, streams: "98K" },
  { name: "United States", share: 7, streams: "86K" },
];

export const PLATFORM_SPLIT = [
  { name: "Spotify", value: 41, color: "#1DB954" },
  { name: "YouTube Music", value: 24, color: "#FF0033" },
  { name: "Boomplay", value: 17, color: "#F25C05" },
  { name: "Apple Music", value: 11, color: "#F2F0EA" },
  { name: "Audiomack", value: 7, color: "#FFA200" },
];

/** 18 months of stream volume — drives the sparkline in the analytics band. */
export const TREND = [
  8, 11, 10, 14, 18, 17, 23, 29, 27, 34, 41, 46, 44, 55, 63, 71, 78, 92,
];

/* ── Nav + footer ──────────────────────────────────────────────────── */

/**
 * Navigation.
 *
 * Every entry resolves to a section that exists on this page. "Resources" was
 * removed rather than shipped as a dead link — there is no resources content
 * yet, and an empty nav item costs more trust than a missing one. Add it back
 * when there is somewhere for it to go.
 */
export const NAV = [
  { label: "Distribution", href: "#distribution" },
  { label: "Promotion", href: "#promotion" },
  { label: "Analytics", href: "#analytics" },
  { label: "Pricing", href: "#pricing" },
];

/**
 * Footer.
 *
 * Same rule: on-page anchors only. Help Center, Blog, Careers, Terms and
 * Privacy are deliberately absent until those pages exist.
 */
export const FOOTER_COLUMNS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "Distribution", href: "#distribution" },
      { label: "Promotion", href: "#promotion" },
      { label: "Analytics", href: "#analytics" },
      { label: "Royalties", href: "#wallet" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Global reach", href: "#distribution" },
      { label: "Local payouts", href: "#wallet" },
      { label: "Artist ownership", href: "#ownership" },
      { label: "For labels", href: "#pricing" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Create an account", href: "/auth" },
      { label: "Log in", href: "/auth" },
    ],
  },
];
