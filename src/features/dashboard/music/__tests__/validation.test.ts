import { describe, expect, it } from "vitest";
import type { ReleaseConfig, ReleaseValidation } from "@/lib/api/types";
import {
  addDays,
  firstByField,
  isValidIsrc,
  isValidUpc,
  parseCountryList,
  serverIssuesByStep,
  validateAgreements,
  validateArtworkFile,
  validateAudioFile,
  validateCredits,
  validateInfo,
  validateStores,
  validateTracks,
  type InfoValues,
} from "../wizard/validation";

const TODAY = "2026-10-01";

const info = (over: Partial<InfoValues> = {}): InfoValues => ({
  release_type: "Single",
  release_title: "Bahari",
  artist_id: 3,
  artist_name: "",
  version: "",
  primary_genre: "Bongo Flava",
  secondary_genre: "",
  language: "sw",
  release_date: "2026-11-01",
  previously_released: false,
  original_release_date: "",
  record_label: "",
  c_line_year: "2026",
  c_line_owner: "Neema Said",
  p_line_year: "2026",
  p_line_owner: "Neema Said",
  upc: "",
  ...over,
});

const codes = (issues: { field: string; code: string }[]) => issues.map((i) => `${i.field}:${i.code}`);

describe("validateInfo (step 1)", () => {
  it("passes a complete release", () => {
    expect(validateInfo(info(), { today: TODAY, minLeadDays: 7 })).toEqual([]);
  });

  it("requires the basics", () => {
    const issues = validateInfo(
      info({ release_type: "", release_title: " ", artist_id: null, artist_name: "", primary_genre: "", language: "", release_date: "" }),
      { today: TODAY, minLeadDays: 7 },
    );
    expect(codes(issues)).toEqual([
      "release_type:required",
      "release_title:required",
      "artist:required",
      "primary_genre:required",
      "language:required",
      "release_date:required",
    ]);
  });

  it("accepts a typed artist name instead of a profile", () => {
    expect(validateInfo(info({ artist_id: null, artist_name: "Neema" }), { today: TODAY, minLeadDays: 7 })).toEqual([]);
  });

  it("enforces the minimum lead time for new releases only", () => {
    const soon = validateInfo(info({ release_date: "2026-10-05" }), { today: TODAY, minLeadDays: 7 });
    expect(soon).toEqual([{ field: "release_date", code: "date_too_soon", params: { days: 7, date: "2026-10-08" } }]);
    expect(validateInfo(info({ release_date: "2026-10-08" }), { today: TODAY, minLeadDays: 7 })).toEqual([]);
    // A re-release may go out sooner, but needs a past original date.
    expect(
      codes(validateInfo(info({ release_date: "2026-10-02", previously_released: true }), { today: TODAY, minLeadDays: 7 })),
    ).toEqual(["original_release_date:required"]);
    expect(
      codes(
        validateInfo(info({ previously_released: true, original_release_date: "2027-01-01" }), { today: TODAY, minLeadDays: 7 }),
      ),
    ).toEqual(["original_release_date:date_in_future"]);
  });

  it("checks © / ℗ lines and UPC", () => {
    const issues = validateInfo(info({ c_line_year: "26", p_line_year: "2099", c_line_owner: "", upc: "123456789013" }), {
      today: TODAY,
      minLeadDays: 7,
    });
    expect(codes(issues)).toEqual(["c_line_year:year_invalid", "p_line_year:year_invalid", "c_line_owner:required", "upc:upc_invalid"]);
  });
});

describe("codes", () => {
  it("validates UPC/EAN check digits like the backend", () => {
    expect(isValidUpc("036000291452")).toBe(true); // UPC-A
    expect(isValidUpc("4006381333931")).toBe(true); // EAN-13
    expect(isValidUpc("036000291453")).toBe(false);
    expect(isValidUpc("12345")).toBe(false);
  });

  it("validates ISRCs with or without dashes", () => {
    expect(isValidIsrc("TZ-A1B-26-00001")).toBe(true);
    expect(isValidIsrc("tza1b2600001")).toBe(true);
    expect(isValidIsrc("TZ-A1B-26-001")).toBe(false);
  });

  it("adds calendar days", () => {
    expect(addDays("2026-12-28", 7)).toBe("2027-01-04");
  });
});

const artworkCfg: ReleaseConfig["artwork"] = { min_px: 3000, max_px: 6000, max_kb: 20480, mimes: ["jpg", "jpeg", "png"], must_be_square: true };

describe("validateArtworkFile (step 2)", () => {
  it("accepts a square 3000px JPG", () => {
    expect(validateArtworkFile({ type: "image/jpeg", size: 5_000_000, width: 3000, height: 3000 }, artworkCfg)).toEqual([]);
  });

  it("reports every problem with the numbers the user needs", () => {
    const issues = validateArtworkFile({ type: "image/gif", size: 30 * 1024 * 1024, width: 400, height: 300 }, artworkCfg);
    expect(codes(issues)).toEqual(["cover_image:file_type", "cover_image:file_too_large", "cover_image:not_square", "cover_image:too_small"]);
    expect(firstByField(issues).cover_image.code).toBe("file_type");
    expect(issues[2].params).toEqual({ w: 400, h: 300 });
  });

  it("rejects oversized dimensions", () => {
    expect(codes(validateArtworkFile({ type: "image/png", size: 1000, width: 7000, height: 7000 }, artworkCfg))).toEqual([
      "cover_image:too_big",
    ]);
  });
});

const audioCfg: ReleaseConfig["audio"] = {
  max_mb: 500,
  formats: ["wav", "flac", "mp3"],
  lossless_formats: ["wav", "flac"],
  min_sample_rate: 44100,
  min_bit_depth: 16,
  min_duration_seconds: 30,
};
const bounds: ReleaseConfig["tracks"] = { Single: { min: 1, max: 3 }, EP: { min: 2, max: 7 }, Album: { min: 5, max: 50 } };
const audio = { original_name: "a.wav", format: "wav", size: 1, duration_ms: 1, sample_rate: 44100, bit_depth: 16, channels: 2, sha256: "x" };

describe("tracks (step 3)", () => {
  it("validates the audio file before uploading", () => {
    expect(validateAudioFile({ name: "Master.WAV", size: 100 }, audioCfg)).toEqual([]);
    expect(codes(validateAudioFile({ name: "song.m4a", size: 600 * 1024 * 1024 }, audioCfg))).toEqual([
      "audio:file_type",
      "audio:file_too_large",
    ]);
  });

  it("enforces track counts per release type", () => {
    expect(codes(validateTracks([], "EP", bounds))).toEqual(["tracks:tracks_too_few"]);
    const four = Array.from({ length: 4 }, (_, i) => ({ id: i + 1, title: `T${i}`, audio, explicit: false, is_clean_version: false, isrc: null }));
    expect(codes(validateTracks(four, "Single", bounds))).toEqual(["tracks:tracks_too_many"]);
    expect(validateTracks(four, "EP", bounds)).toEqual([]);
  });

  it("flags missing titles/audio, explicit+clean and bad or duplicate ISRCs per track", () => {
    const issues = validateTracks(
      [
        { id: 10, title: "", audio: null, explicit: true, is_clean_version: true, isrc: "TZA1B2600001" },
        { id: 11, title: "Two", audio, explicit: false, is_clean_version: false, isrc: "TZ-A1B-26-00001" },
        { id: 12, title: "Three", audio, explicit: false, is_clean_version: false, isrc: "nope" },
      ],
      "EP",
      bounds,
    );
    expect(issues.map((i) => `${i.trackId}:${i.code}`)).toEqual([
      "10:track_title_missing",
      "10:track_audio_missing",
      "10:explicit_and_clean",
      "11:isrc_duplicate",
      "12:isrc_invalid",
    ]);
  });
});

describe("validateCredits (step 4)", () => {
  it("requires a songwriter/composer/lyricist unless public domain", () => {
    const issues = validateCredits([
      { id: 1, ownership: "original", credits: [{ role: "producer", name: "Kid" }] },
      { id: 2, ownership: "public_domain", credits: [] },
      { id: 3, ownership: "original", credits: [{ role: "composer", name: "Neema Said" }] },
      { id: 4, ownership: "cover", credits: [{ role: "songwriter", name: "  " }] },
    ]);
    expect(issues.map((i) => `${i.trackId}:${i.code}`)).toEqual(["1:writer_missing", "4:credit_name_missing", "4:writer_missing"]);
  });
});

describe("validateStores (step 5)", () => {
  const available = ["spotify", "boomplay"];
  it("needs at least one available store", () => {
    expect(codes(validateStores({ platforms: [], territories: { mode: "worldwide", countries: [] } }, available))).toEqual([
      "platforms:stores_none",
    ]);
    expect(
      codes(validateStores({ platforms: ["spotify", "mdundo"], territories: { mode: "worldwide", countries: [] } }, available)),
    ).toEqual(["platforms:stores_unavailable"]);
  });

  it("needs valid countries when territories are restricted", () => {
    expect(codes(validateStores({ platforms: ["spotify"], territories: { mode: "include", countries: [] } }, available))).toEqual([
      "territories:countries_missing",
    ]);
    expect(
      codes(validateStores({ platforms: ["spotify"], territories: { mode: "exclude", countries: ["TZ", "KEN"] } }, available)),
    ).toEqual(["territories:country_invalid"]);
    expect(parseCountryList("tz, KE ,ug tz")).toEqual(["TZ", "KE", "UG"]);
  });
});

describe("review (step 6)", () => {
  it("requires every mandatory agreement", () => {
    expect(codes(validateAgreements({ rights_confirmation: true }, ["rights_confirmation", "distribution_terms"]))).toEqual([
      "distribution_terms:agreement_missing",
    ]);
    expect(validateAgreements({ rights_confirmation: true, distribution_terms: true }, ["rights_confirmation", "distribution_terms"])).toEqual([]);
  });

  it("groups server validation errors under the wizard step that fixes them", () => {
    const v: ReleaseValidation = {
      ready: false,
      warnings: [],
      steps: {},
      tracks: {},
      errors: [
        { step: "schedule", field: "release_date", message: "Choose a date", track_id: null },
        { step: "rights", field: "c_line_year", message: "Add the © year.", track_id: null },
        { step: "contributors", field: "songwriters", message: "Track 1: add a writer", track_id: 5 },
        { step: "agreements", field: "distribution_terms", message: "Accept the terms", track_id: null },
      ],
    };
    const by = serverIssuesByStep(v);
    expect(by.info.map((e) => e.field)).toEqual(["release_date", "c_line_year"]);
    expect(by.credits).toHaveLength(1);
    expect(by.review).toHaveLength(1);
    expect(by.stores).toHaveLength(0);
  });
});
