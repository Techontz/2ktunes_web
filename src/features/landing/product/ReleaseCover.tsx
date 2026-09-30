import { FEATURED_RELEASE } from "./release";

/**
 * The release sleeve.
 *
 * `<picture>` serves WebP with a JPEG fallback, and the image is eager because
 * it sits inside the product showcase — an empty sleeve is worse than an early
 * byte. `aspect-square` plus `object-cover` on an intrinsically square source
 * means there is nothing to crop and nothing to distort; the parent still needs
 * `shrink-0` inside a flex column, which is what kept it square before.
 */
export default function ReleaseCover({
  className = "",
  /** Small renders don't need the 800px file decoded eagerly. */
  eager = true,
  /**
   * "thumb" serves the 160px variant. Use it anywhere the sleeve renders below
   * roughly 80 CSS px — a full-size texture downscaled into a 32px box is real
   * compositor work, and inside the animated hero field it is measurable.
   */
  size = "full",
}: {
  className?: string;
  eager?: boolean;
  size?: "full" | "thumb";
}) {
  const thumb = size === "thumb";
  const px = thumb ? 160 : 800;

  return (
    <picture className={`block h-full w-full ${className}`}>
      <source
        srcSet={thumb ? FEATURED_RELEASE.thumb : FEATURED_RELEASE.cover}
        type="image/webp"
      />
      <img
        src={thumb ? FEATURED_RELEASE.thumbFallback : FEATURED_RELEASE.coverFallback}
        alt={FEATURED_RELEASE.coverAlt}
        width={px}
        height={px}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </picture>
  );
}
