import { useCopy } from "@/lib/useCopy";

/**
 * Human labels for the marketplace's machine values (platforms, creator
 * categories, campaign types, objectives, dispute reasons, devices). Shared by
 * the promotion, marketplace and creator-workspace screens. Unknown values
 * (the server config can grow) fall back to a humanised form of the raw value.
 */

const PLATFORMS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  x: "X",
  snapchat: "Snapchat",
  audiomack: "Audiomack",
  boomplay: "Boomplay",
  spotify: "Spotify",
  apple_music: "Apple Music",
};

const EN = {
  categories: {
    dance: "Dance",
    comedy: "Comedy",
    lifestyle: "Lifestyle",
    fashion: "Fashion",
    beauty: "Beauty",
    music: "Music",
    lip_sync: "Lip sync",
    storytelling: "Storytelling",
    fitness: "Fitness",
    food: "Food",
    travel: "Travel",
    tech: "Tech",
    education: "Education",
    sports: "Sports",
    gaming: "Gaming",
    family: "Family",
    faith: "Faith",
  } as Record<string, string>,
  campaignTypes: {
    creator_campaign: "Creator campaign",
    tiktok_challenge: "TikTok challenge",
    playlist_pitching: "Playlist pitching",
    presave_campaign: "Pre-save campaign",
    social_promotion: "Social media promotion",
    influencer_marketing: "Influencer marketing",
    advertising: "Advertising",
    marketing_package: "Marketing package",
  } as Record<string, string>,
  objectives: {
    awareness: "Awareness",
    streams: "Streams",
    ugc: "Fan-made content (UGC)",
    presaves: "Pre-saves",
    followers: "Followers",
    playlist_consideration: "Playlist consideration",
  } as Record<string, string>,
  disputeReasons: {
    not_delivered: "Not delivered",
    not_as_described: "Not as described",
    late: "Late delivery",
    quality: "Quality problem",
    payment: "Payment problem",
    other: "Other",
  } as Record<string, string>,
  devices: {
    mobile: "Phone",
    tablet: "Tablet",
    desktop: "Computer",
  } as Record<string, string>,
  unknown: "Unknown",
};

const SW: typeof EN = {
  categories: {
    dance: "Densi",
    comedy: "Vichekesho",
    lifestyle: "Mtindo wa maisha",
    fashion: "Mitindo ya mavazi",
    beauty: "Urembo",
    music: "Muziki",
    lip_sync: "Kuigiza kuimba (lip sync)",
    storytelling: "Usimulizi wa hadithi",
    fitness: "Mazoezi ya mwili",
    food: "Chakula",
    travel: "Safari",
    tech: "Teknolojia",
    education: "Elimu",
    sports: "Michezo",
    gaming: "Michezo ya video",
    family: "Familia",
    faith: "Imani",
  },
  campaignTypes: {
    creator_campaign: "Kampeni ya watengeneza maudhui",
    tiktok_challenge: "Changamoto ya TikTok",
    playlist_pitching: "Kupendekeza wimbo kwa playlist",
    presave_campaign: "Kampeni ya pre-save",
    social_promotion: "Utangazaji mitandaoni",
    influencer_marketing: "Masoko kupitia washawishi",
    advertising: "Matangazo",
    marketing_package: "Kifurushi cha masoko",
  },
  objectives: {
    awareness: "Kujulikana zaidi",
    streams: "Kusikilizwa (streams)",
    ugc: "Maudhui yanayotengenezwa na mashabiki (UGC)",
    presaves: "Pre-save",
    followers: "Wafuasi",
    playlist_consideration: "Kuzingatiwa kwenye playlist",
  },
  disputeReasons: {
    not_delivered: "Haikuwasilishwa",
    not_as_described: "Si kama ilivyoelezwa",
    late: "Imechelewa",
    quality: "Tatizo la ubora",
    payment: "Tatizo la malipo",
    other: "Nyingine",
  },
  devices: {
    mobile: "Simu",
    tablet: "Tablet",
    desktop: "Kompyuta",
  },
  unknown: "Haijulikani",
};

export const LABELS = { EN, SW };

export function humanize(value: string | null | undefined): string {
  const s = (value ?? "").replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
}

export function useLabels() {
  const l = useCopy(LABELS);
  return {
    platform: (v: string | null | undefined) => (v ? (PLATFORMS[v] ?? humanize(v)) : "—"),
    category: (v: string | null | undefined) => (v ? (l.categories[v] ?? humanize(v)) : "—"),
    campaignType: (v: string | null | undefined) => (v ? (l.campaignTypes[v] ?? humanize(v)) : "—"),
    objective: (v: string | null | undefined) => (v ? (l.objectives[v] ?? humanize(v)) : "—"),
    disputeReason: (v: string | null | undefined) => (v ? (l.disputeReasons[v] ?? humanize(v)) : "—"),
    device: (v: string | null | undefined) => (v ? (l.devices[v] ?? humanize(v)) : l.unknown),
    unknown: l.unknown,
  };
}

export const CAMPAIGN_OBJECTIVES = [
  "awareness",
  "streams",
  "ugc",
  "presaves",
  "followers",
  "playlist_consideration",
] as const;

export const DISPUTE_REASONS = ["not_delivered", "not_as_described", "late", "quality", "payment", "other"] as const;

/** Country name for an ISO-3166 alpha-2 code in the UI locale; the code if unknown. */
export function countryName(code: string | null | undefined, locale: string): string {
  if (!code) return "—";
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** "TZ, KE ug" → ["TZ","KE","UG"]; null if any entry is not two letters. */
export function parseCountryList(input: string): string[] | null {
  const parts = input
    .split(/[\s,;]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  if (parts.some((p) => !/^[A-Z]{2}$/.test(p))) return null;
  return Array.from(new Set(parts));
}
