import type { Credit, ReleaseConfig, ReleaseType, ReleaseValidation, Track, ValidationItem } from "@/lib/api/types";

/**
 * RELEASE WIZARD — STEP VALIDATION (pure, no React)
 *
 * The client mirrors the server's rules (app/Services/Releases/ReleaseValidator
 * and the controllers' request rules) so people see problems while typing.
 * The SERVER stays the authority: the review step shows GET
 * /releases/{id}/validation verbatim, and submit is gated on its `ready`.
 *
 * Validators return `Issue[]` with a message code + params; the UI turns codes
 * into EN/SW copy.
 */

export type WizardStep = "info" | "artwork" | "tracks" | "credits" | "stores" | "review";
export const WIZARD_STEPS: WizardStep[] = ["info", "artwork", "tracks", "credits", "stores", "review"];

/** ReleaseValidator::STEPS → the wizard step that fixes it. */
export const SERVER_STEP: Record<string, WizardStep> = {
  basics: "info",
  rights: "info",
  schedule: "info",
  artwork: "artwork",
  tracks: "tracks",
  contributors: "credits",
  stores: "stores",
  agreements: "review",
};

export type IssueCode =
  | "required"
  | "too_long"
  | "date_too_soon"
  | "date_in_future"
  | "year_invalid"
  | "upc_invalid"
  | "isrc_invalid"
  | "isrc_duplicate"
  | "tracks_too_few"
  | "tracks_too_many"
  | "track_title_missing"
  | "track_audio_missing"
  | "explicit_and_clean"
  | "writer_missing"
  | "credit_name_missing"
  | "stores_none"
  | "stores_unavailable"
  | "countries_missing"
  | "country_invalid"
  | "agreement_missing"
  | "file_type"
  | "file_too_large"
  | "not_square"
  | "too_small"
  | "too_big";

export type Issue = {
  field: string;
  code: IssueCode;
  params?: Record<string, string | number>;
  trackId?: number;
};

/* ── Helpers ───────────────────────────────────────────────────────── */

const blank = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

/** YYYY-MM-DD `days` after `today` (both local calendar dates). */
export function addDays(today: string, days: number): string {
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/** GTIN-12/13 check digit — CodeGenerator::isValidUpc on the backend. */
export function isValidUpc(code: string): boolean {
  const digits = code.replace(/\D/g, "");
  if (digits.length !== 12 && digits.length !== 13) return false;
  const body = digits.slice(0, -1).split("").reverse();
  const sum = body.reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 3 : 1), 0);
  return String((10 - (sum % 10)) % 10) === digits.slice(-1);
}

/** CC-XXX-YY-NNNNN with or without dashes — CodeGenerator::isValidIsrc. */
export function isValidIsrc(isrc: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(isrc.replace(/[-\s]/g, "").toUpperCase());
}

export const WRITER_ROLES = ["songwriter", "composer", "lyricist"];

/* ── Step 1: release info (basics + rights + schedule) ─────────────── */

export type InfoValues = {
  release_type: ReleaseType | "";
  release_title: string;
  artist_id: number | null;
  artist_name: string;
  version: string;
  primary_genre: string;
  secondary_genre: string;
  language: string;
  release_date: string;
  previously_released: boolean;
  original_release_date: string;
  record_label: string;
  c_line_year: string;
  c_line_owner: string;
  p_line_year: string;
  p_line_owner: string;
  upc: string;
};

export function validateInfo(
  v: InfoValues,
  { today, minLeadDays }: { today: string; minLeadDays: number },
): Issue[] {
  const out: Issue[] = [];
  if (!v.release_type) out.push({ field: "release_type", code: "required" });
  if (blank(v.release_title)) out.push({ field: "release_title", code: "required" });
  else if (v.release_title.length > 255) out.push({ field: "release_title", code: "too_long", params: { max: 255 } });
  if (!v.artist_id && blank(v.artist_name)) out.push({ field: "artist", code: "required" });
  if (blank(v.primary_genre)) out.push({ field: "primary_genre", code: "required" });
  if (blank(v.language)) out.push({ field: "language", code: "required" });

  if (blank(v.release_date)) {
    out.push({ field: "release_date", code: "required" });
  } else if (!v.previously_released) {
    const earliest = addDays(today, minLeadDays);
    if (v.release_date < earliest) {
      out.push({ field: "release_date", code: "date_too_soon", params: { days: minLeadDays, date: earliest } });
    }
  }
  if (v.previously_released) {
    if (blank(v.original_release_date)) out.push({ field: "original_release_date", code: "required" });
    else if (v.original_release_date > today) out.push({ field: "original_release_date", code: "date_in_future" });
  }

  const maxYear = Number(today.slice(0, 4)) + 1;
  for (const f of ["c_line_year", "p_line_year"] as const) {
    if (blank(v[f])) out.push({ field: f, code: "required" });
    else if (!/^\d{4}$/.test(v[f]) || Number(v[f]) < 1900 || Number(v[f]) > maxYear) {
      out.push({ field: f, code: "year_invalid", params: { max: maxYear } });
    }
  }
  for (const f of ["c_line_owner", "p_line_owner"] as const) {
    if (blank(v[f])) out.push({ field: f, code: "required" });
  }
  if (!blank(v.upc) && !isValidUpc(v.upc)) out.push({ field: "upc", code: "upc_invalid" });
  return out;
}

/* ── Step 2: artwork ───────────────────────────────────────────────── */

type ImageFacts = { type: string; size: number; width: number; height: number };

export function validateArtworkFile(img: ImageFacts, cfg: ReleaseConfig["artwork"]): Issue[] {
  const out: Issue[] = [];
  const ext = img.type.toLowerCase();
  if (!["image/jpeg", "image/jpg", "image/png"].includes(ext)) out.push({ field: "cover_image", code: "file_type" });
  if (img.size > cfg.max_kb * 1024) {
    out.push({ field: "cover_image", code: "file_too_large", params: { mb: Math.round(cfg.max_kb / 1024) } });
  }
  if (cfg.must_be_square && img.width !== img.height) {
    out.push({ field: "cover_image", code: "not_square", params: { w: img.width, h: img.height } });
  }
  if (Math.min(img.width, img.height) < cfg.min_px) {
    out.push({ field: "cover_image", code: "too_small", params: { min: cfg.min_px, w: img.width, h: img.height } });
  }
  if (Math.max(img.width, img.height) > cfg.max_px) {
    out.push({ field: "cover_image", code: "too_big", params: { max: cfg.max_px, w: img.width, h: img.height } });
  }
  return out;
}

/* ── Step 3: tracks ────────────────────────────────────────────────── */

export function validateAudioFile(file: { name: string; size: number }, cfg: ReleaseConfig["audio"]): Issue[] {
  const out: Issue[] = [];
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!cfg.formats.includes(ext)) {
    out.push({ field: "audio", code: "file_type", params: { formats: cfg.formats.join(", ").toUpperCase() } });
  }
  if (file.size > cfg.max_mb * 1024 * 1024) out.push({ field: "audio", code: "file_too_large", params: { mb: cfg.max_mb } });
  return out;
}

type TrackLike = Pick<Track, "id" | "title" | "audio" | "explicit" | "is_clean_version" | "isrc"> & {
  audio_url?: string | null;
};

export function validateTracks(
  tracks: TrackLike[],
  type: ReleaseType | "",
  bounds: ReleaseConfig["tracks"] | null,
): Issue[] {
  const out: Issue[] = [];
  const b = type && bounds ? bounds[type] : null;
  if (b && tracks.length < b.min) out.push({ field: "tracks", code: "tracks_too_few", params: { min: b.min, type } });
  if (b && tracks.length > b.max) out.push({ field: "tracks", code: "tracks_too_many", params: { max: b.max, type } });
  if (!b && tracks.length === 0) out.push({ field: "tracks", code: "tracks_too_few", params: { min: 1, type: type || "" } });
  const seen = new Set<string>();
  tracks.forEach((t, i) => {
    const n = i + 1;
    if (blank(t.title)) out.push({ field: "title", code: "track_title_missing", params: { n }, trackId: t.id });
    if (!t.audio && !t.audio_url) out.push({ field: "audio", code: "track_audio_missing", params: { n }, trackId: t.id });
    if (t.explicit && t.is_clean_version) out.push({ field: "explicit", code: "explicit_and_clean", params: { n }, trackId: t.id });
    if (!blank(t.isrc)) {
      const norm = (t.isrc as string).replace(/[-\s]/g, "").toUpperCase();
      if (!isValidIsrc(norm)) out.push({ field: "isrc", code: "isrc_invalid", params: { n }, trackId: t.id });
      else if (seen.has(norm)) out.push({ field: "isrc", code: "isrc_duplicate", params: { n }, trackId: t.id });
      seen.add(norm);
    }
  });
  return out;
}

/* ── Step 4: credits ───────────────────────────────────────────────── */

export function validateCredits(
  tracks: (Pick<Track, "id" | "ownership"> & { credits?: Credit[] })[],
): Issue[] {
  const out: Issue[] = [];
  tracks.forEach((t, i) => {
    const n = i + 1;
    const credits = t.credits ?? [];
    if (credits.some((c) => blank(c.name))) {
      out.push({ field: "credits", code: "credit_name_missing", params: { n }, trackId: t.id });
    }
    const hasWriter = credits.some((c) => WRITER_ROLES.includes(c.role) && !blank(c.name));
    if (!hasWriter && t.ownership !== "public_domain") {
      out.push({ field: "credits", code: "writer_missing", params: { n }, trackId: t.id });
    }
  });
  return out;
}

/* ── Step 5: stores & territories ──────────────────────────────────── */

export function validateStores(
  v: { platforms: string[]; territories: { mode: string; countries: string[] } },
  availableSlugs: string[],
): Issue[] {
  const out: Issue[] = [];
  if (v.platforms.length === 0) out.push({ field: "platforms", code: "stores_none" });
  const bad = v.platforms.filter((p) => !availableSlugs.includes(p));
  if (bad.length) out.push({ field: "platforms", code: "stores_unavailable", params: { stores: bad.join(", ") } });
  if (v.territories.mode !== "worldwide") {
    if (v.territories.countries.length === 0) out.push({ field: "territories", code: "countries_missing" });
    const invalid = v.territories.countries.filter((c) => !/^[A-Z]{2}$/.test(c));
    if (invalid.length) out.push({ field: "territories", code: "country_invalid", params: { codes: invalid.join(", ") } });
  }
  return out;
}

/** "tz, KE ,ug" → ["TZ","KE","UG"] (deduplicated). */
export function parseCountryList(input: string): string[] {
  return [...new Set(input.split(/[\s,;]+/).map((s) => s.trim().toUpperCase()).filter(Boolean))];
}

/* ── Step 6: review / agreements ───────────────────────────────────── */

export function validateAgreements(agreements: Record<string, unknown>, required: string[]): Issue[] {
  return required.filter((a) => agreements[a] !== true).map((a) => ({ field: a, code: "agreement_missing" as const }));
}

/* ── Server report → steps ─────────────────────────────────────────── */

export function serverIssuesByStep(v: ReleaseValidation | null): Record<WizardStep, ValidationItem[]> {
  const out: Record<WizardStep, ValidationItem[]> = {
    info: [],
    artwork: [],
    tracks: [],
    credits: [],
    stores: [],
    review: [],
  };
  for (const e of v?.errors ?? []) out[SERVER_STEP[e.step] ?? "review"].push(e);
  return out;
}

/** First field error per field (for <Field error>). */
export function firstByField(issues: Issue[]): Record<string, Issue> {
  const out: Record<string, Issue> = {};
  for (const i of issues) if (!out[i.field]) out[i.field] = i;
  return out;
}
