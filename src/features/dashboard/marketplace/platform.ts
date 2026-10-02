/**
 * Guess the platform of a song or post link from its host, for a helpful
 * "Detected: Spotify" hint. The API derives the stored platform itself.
 */
const HOSTS: [RegExp, string][] = [
  [/(^|\.)open\.spotify\.com$|(^|\.)spotify\.(com|link)$/, "spotify"],
  [/(^|\.)music\.apple\.com$|(^|\.)itunes\.apple\.com$/, "apple_music"],
  [/(^|\.)music\.youtube\.com$/, "youtube_music"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "youtube"],
  [/(^|\.)boomplay\.com$|(^|\.)boomplaymusic\.com$/, "boomplay"],
  [/(^|\.)audiomack\.com$/, "audiomack"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.watch$/, "facebook"],
  [/(^|\.)soundcloud\.com$/, "soundcloud"],
  [/(^|\.)deezer\.com$|(^|\.)deezer\.page\.link$/, "deezer"],
  [/(^|\.)mdundo\.com$/, "mdundo"],
  [/(^|\.)snapchat\.com$/, "snapchat"],
  [/(^|\.)x\.com$|(^|\.)twitter\.com$/, "x"],
];

/** A full http(s) URL with a dotted host. */
export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function detectPlatform(value: string): string | null {
  try {
    const host = new URL(value.trim()).hostname.toLowerCase().replace(/^www\.|^m\./, "");
    return HOSTS.find(([re]) => re.test(host))?.[1] ?? null;
  } catch {
    return null;
  }
}
