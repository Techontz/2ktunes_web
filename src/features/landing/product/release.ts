import coverWebp from "@/assets/artwork/blessings-ep-cover.webp";
import coverJpg from "@/assets/artwork/blessings-ep-cover.jpg";
import thumbWebp from "@/assets/artwork/blessings-ep-cover-sm.webp";
import thumbJpg from "@/assets/artwork/blessings-ep-cover-sm.jpg";

/**
 * THE RELEASE SHOWN IN THE PRODUCT MOCKS
 * ======================================
 *
 * One source of truth for the release that appears inside the phone and in the
 * hero background's now-playing panel, so the two can never drift apart.
 *
 * THE ARTWORK
 * -----------
 * `src/assets/artwork/blessings-ep-cover*.{webp,jpg}` is real BLESSINGS EP
 * artwork by Conrad Bubex, derived from the 12756×12756 master at
 * `~/Desktop/PICS/BLESSING EP - COVER.jpg` (150MB) and resized to 800×800 —
 * 82KB as WebP, which is about 1800× smaller and still twice the pixels the
 * largest on-screen use needs. Vite fingerprints both files, so no build
 * configuration was required.
 *
 * NOTE ON WHICH COVER THIS IS: the master on disk is the tracklist variant of
 * the sleeve (it lists "03 Meant To Be", which is this release). If you want the
 * front cover instead — portrait, "THE ONE GENERATION PRESENTS", "THE FRESH
 * PRINCE CONRAD BUBEX" — drop that file over
 * `src/assets/artwork/blessings-ep-cover.webp` at 800×800 and nothing else needs
 * to change.
 *
 * TITLE CASING
 * ------------
 * "meant2 be" is lowercase deliberately — it is how the track is styled. Do not
 * let a text-transform or a title-case helper touch it.
 *
 * TRUTHFULNESS
 * ------------
 * This is a product demonstration of the 2K Tunes release flow. Nothing here
 * asserts that the track is currently distributed by 2K Tunes, which is why the
 * status screen reads "Release preview" and never "Live on Spotify" or
 * "Available everywhere".
 */
export const FEATURED_RELEASE = {
  /** Lowercase on purpose. */
  title: "meant2 be",
  artist: "Conrad Bubex",
  type: "Single",
  project: "BLESSINGS EP",
  cover: coverWebp,
  /** JPEG fallback for the rare browser without WebP. */
  coverFallback: coverJpg,
  /**
   * 160px variant for the small thumbnails.
   *
   * Not premature optimisation: pointing the 32px now-playing thumb at the
   * 800px file made the compositor hold and resample a full-size texture inside
   * the animated hero field, and it cost the hero half its frame rate.
   */
  thumb: thumbWebp,
  thumbFallback: thumbJpg,
  coverAlt:
    "BLESSINGS EP cover artwork by Conrad Bubex",
} as const;
