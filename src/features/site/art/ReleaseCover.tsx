import { FEATURED_RELEASE } from "./release";

/**
 * Release artwork (real BLESSINGS EP artwork by Conrad Bubex — see release.ts).
 * WebP with JPEG fallback, explicit dimensions so it never shifts layout.
 */
export default function ReleaseCover({
  className = "",
  eager = false,
  size = "full",
  alt,
}: {
  className?: string;
  eager?: boolean;
  size?: "full" | "thumb";
  /** Pass "" when the cover is decorative next to the visible title. */
  alt?: string;
}) {
  const thumb = size === "thumb";
  const px = thumb ? 160 : 800;
  return (
    <picture className={`block h-full w-full ${className}`}>
      <source srcSet={thumb ? FEATURED_RELEASE.thumb : FEATURED_RELEASE.cover} type="image/webp" />
      <img
        src={thumb ? FEATURED_RELEASE.thumbFallback : FEATURED_RELEASE.coverFallback}
        alt={alt ?? FEATURED_RELEASE.coverAlt}
        width={px}
        height={px}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </picture>
  );
}
