/**
 * ARTIST PHOTOGRAPHY FOR THE HERO BACKGROUND — DROP-IN POINT
 * =========================================================
 *
 * There is no artist photography in this repository, so every slot below has
 * `src: null` and renders original 2K Tunes sleeve artwork under the violet
 * grade instead. The composition is complete either way; photography simply
 * makes it stronger.
 *
 * TO ADD REAL PHOTOGRAPHY
 * -----------------------
 *   1. Put the files in `src/assets/artists/` (any web format; prefer .webp or
 *      .avif — Vite fingerprints and serves them from the existing pipeline, so
 *      no build changes are needed).
 *   2. Import each one and set it as `src` below. Vite resolves the import to a
 *      hashed URL at build time.
 *   3. Write a real `alt` describing the subject.
 *
 *      import micArtist from "@/assets/artists/mic-artist.webp";
 *      ...
 *      { src: micArtist, alt: "Artist performing into a microphone on stage" }
 *
 * SIZING GUIDANCE
 * ---------------
 * `portrait` slots render at roughly 380×470 CSS px at 1440 and are cropped with
 * object-fit: cover, so supply about 760×940 for a 2× screen. `crowd` renders
 * about 400×250, so supply about 800×500. Larger than that is wasted bytes —
 * these sit behind a headline under a heavy grade.
 *
 * LICENSING
 * ---------
 * Use photography you own or have cleared. Do not drop in stock images of
 * identifiable people without a model release.
 */

export type ArtistPlateSource = {
  /** An imported image URL, or null to fall back to sleeve artwork. */
  src: string | null;
  /** Describe the subject. Ignored while `src` is null. */
  alt: string;
  /** Where this plate sits in the composition. */
  role: "portrait-left-top" | "portrait-left-bottom" | "crowd-right";
};

export const ARTIST_PLATES: ArtistPlateSource[] = [
  {
    src: null,
    alt: "",
    role: "portrait-left-top",
  },
  {
    src: null,
    alt: "",
    role: "portrait-left-bottom",
  },
  {
    src: null,
    alt: "",
    role: "crowd-right",
  },
];
