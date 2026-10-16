import { useMemo } from "react";
import type { ConfigList, ReleaseConfig, ReleaseType, Store, StoreConfirmation } from "@/lib/api/types";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "../copy";

/**
 * Dropdown and radio lists for the upload page, read from GET /release-config
 * (DOCS/DISTRIBUTION_PARITY.md section 5). A list the server doesn't send yet
 * falls back to the local default below, so the page always renders. Labels of
 * keys we know (version types, roles, ownership) come from our own copy.
 */

export type Opt = { value: string; label: string; required?: boolean; platform?: string | null };

/** Accepts ["a"], [{value|key|id, label|name, required}] or {value: label}. */
export function normalizeList(raw: ConfigList | undefined | null): Opt[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const out: Opt[] = [];
    for (const item of raw) {
      if (typeof item === "string" || typeof item === "number") out.push({ value: String(item), label: String(item) });
      else if (item && typeof item === "object") {
        const value = item.value ?? item.key ?? item.id;
        if (value === undefined || value === null) continue;
        out.push({ value: String(value), label: String(item.label ?? item.name ?? value), required: item.required, platform: item.required_with_platform ?? null });
      }
    }
    return out.length ? out : null;
  }
  if (typeof raw === "object") {
    const out = Object.entries(raw).map(([value, label]) => ({ value, label: String(label) }));
    return out.length ? out : null;
  }
  return null;
}

const DEFAULT_PERFORMERS = [
  "Vocals",
  "Background vocals",
  "Rap",
  "Guitar",
  "Bass guitar",
  "Acoustic guitar",
  "Keyboards",
  "Piano",
  "Synthesizer",
  "Drums",
  "Percussion",
  "Drum programming",
  "Saxophone",
  "Trumpet",
  "Violin",
  "Strings",
  "Flute",
  "Marimba",
  "Kalimba",
  "DJ",
  "Choir",
];
const DEFAULT_PRODUCERS = [
  "Producer",
  "Co-producer",
  "Executive producer",
  "Vocal producer",
  "Mixing engineer",
  "Mastering engineer",
  "Recording engineer",
  "Programmer",
  "Arranger",
];
const DEFAULT_TRACK_PRICES = ["0.69", "0.99", "1.29"];
const DEFAULT_ALBUM_PRICES = ["0.69", "0.99", "1.29", "1.99", "2.99", "3.99", "4.99", "5.99", "6.99", "7.99", "8.99", "9.99", "10.99", "11.99", "12.99", "13.99", "14.99"];

export const AGREEMENT_KEYS = ["rights_confirmation", "no_artificial_streams", "youtube_music_ack", "no_name_misuse", "distribution_terms"] as const;
/** Shown only when YouTube Music is one of the chosen stores. */
export const YOUTUBE_AGREEMENT = "youtube_music_ack";

/**
 * Opt-in stores (Snapchat, Roblox): ticking one opens a confirmation, and these
 * agreements are recorded with it. The server requires them while the store is
 * chosen (config/distribution.php `required_with_platform`, Store::CONFIRMATION_AGREEMENTS).
 */
export const CONFIRMATION_AGREEMENTS: Record<StoreConfirmation, string[]> = {
  full_publishing: ["snapchat_full_publishing"],
  roblox_eligibility: ["roblox_full_publishing", "roblox_no_pro", "roblox_not_monetized", "roblox_terms"],
};

/** The agreement keys a store's confirmation records (none for ordinary stores). */
export const confirmationKeys = (store: Pick<Store, "confirmation"> | undefined): string[] =>
  (store?.confirmation && CONFIRMATION_AGREEMENTS[store.confirmation]) || [];

/** Stores ticked on a new release: every available one except the opt-in ones. */
export const defaultPlatforms = (stores: Store[]): string[] =>
  stores.filter((s) => s.status === "available" && s.default_selected !== false).map((s) => s.slug);

/** 1 song = Single, 2 to 6 = EP, 7 or more = Album. */
export function typeForCount(n: number): ReleaseType {
  return n <= 1 ? "Single" : n <= 6 ? "EP" : "Album";
}

/** The most songs a release can have (the album maximum from the config). */
export function maxSongs(config: ReleaseConfig): number {
  const maxes = Object.values(config.tracks ?? {}).map((b) => b?.max ?? 0);
  return Math.max(1, ...maxes, 1) || 50;
}

export function buildOptions(config: ReleaseConfig, c: (typeof COPY)["EN"]) {
  const pick = (raw: ConfigList | undefined, fallback: Opt[]) => normalizeList(raw) ?? fallback;
  const strings = (xs: string[]) => xs.map((x) => ({ value: x, label: x }));
  const keys = (xs: string[]) => xs.map((x) => ({ value: x, label: x }));
  const known = (labels: Record<string, string>) => (o: Opt) => ({ ...o, label: labels[o.value] ?? o.label });
  const ownership = pick(config.ownership_types, keys(["original", "cover"]))
    .filter((o) => o.value === "original" || o.value === "cover")
    .map(known(c.ownershipLabels));
  return {
    versionTypes: pick(config.version_types, keys(["normal", "radio_edit", "other"])).map(known(c.versionLabels)),
    featuredRoles: pick(config.featured_roles, keys(["featuring", "remixer"])).map(known(c.featuredRoleLabels)),
    writerRoles: pick(config.writer_roles, keys(["composer", "lyricist", "songwriter"])).map(known(c.writerRoleLabels)),
    ownership: ownership.length ? ownership : keys(["original", "cover"]).map(known(c.ownershipLabels)),
    performerRoles: pick(config.performer_roles, strings(DEFAULT_PERFORMERS)),
    producerRoles: pick(config.producer_roles, strings(DEFAULT_PRODUCERS)),
    trackPrices: pick(config.track_prices, strings(DEFAULT_TRACK_PRICES)).map((o) => ({ ...o, label: c.price(o.label) })),
    albumPrices: pick(config.album_prices, strings(DEFAULT_ALBUM_PRICES)).map((o) => ({ ...o, label: c.price(o.label) })),
    agreements: (normalizeList(config.agreements) ?? AGREEMENT_KEYS.map((k) => ({ value: k, label: k }))).map((o) => ({
      ...o,
      required: o.required ?? true,
    })),
  };
}

export type UploadOptions = ReturnType<typeof buildOptions>;

/** Upload lists for the current config and language. */
export function useOptions(config: ReleaseConfig): UploadOptions {
  const c = useCopy(COPY);
  return useMemo(() => buildOptions(config, c), [config, c]);
}

/** A sensible default tier: 0.99 for a track, 9.99 (or the middle) for an album. */
export function defaultTier(list: Opt[], preferred: string): string {
  if (list.some((o) => o.value === preferred)) return preferred;
  return list[Math.floor(list.length / 2)]?.value ?? "";
}
