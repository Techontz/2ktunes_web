import { ARTIST_PLATES } from "./artistPlates";

/**
 * An artist-photography slot in the background composition.
 *
 * DROPPING IN REAL PHOTOGRAPHY
 * ----------------------------
 * Put the files in `src/assets/artists/` and list them in
 * `background/artistPlates.ts`. Nothing else needs to change — this component
 * applies the grade, the vignette and the motion.
 *
 * Until then the slot is not rendered at all. Sleeve artwork is not a stand-in
 * for a portrait or a crowd, and no stock photography is used, so the background
 * simply runs as a product-and-data ecosystem until real photography arrives.
 *
 * The grade is what keeps a supplied photo on-brand: a violet duotone wash, a
 * lime rim on the shadow side, and a vignette that lets the plate sink into the
 * black field instead of sitting on it as a rectangle.
 */
export default function ArtistPlate({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) {
  const plate = ARTIST_PLATES[index];

  return (
    <div
      data-bg-surface=""
      className={`relative overflow-hidden ${className}`}
      style={{ boxShadow: "0 30px 70px -30px rgba(0,0,0,0.95)" }}
    >
      {/* Subject */}
      <div
        className="absolute inset-0"
        style={{ animation: "plate-breathe 26s ease-in-out infinite" }}
      >
        <img
          src={plate.src!}
          alt={plate.alt}
          /* Part of the hero, so it must not be lazy — an empty hero is worse
             than an early byte. */
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Violet duotone grade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-color"
        style={{ background: "rgba(88,40,190,0.5)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, rgba(138,92,255,0.18) 0%, transparent 46%, rgba(6,4,14,0.6) 100%)",
        }}
      />

      {/* Vignette so the plate dissolves into the field rather than sitting on
          it as a rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 78% 78% at 45% 40%, transparent 32%, rgba(4,2,10,0.86) 100%)",
        }}
      />

      {/* A single lime rim light on the shadow side */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(255deg, rgba(203,242,76,0.16) 0%, transparent 26%)",
        }}
      />
    </div>
  );
}
