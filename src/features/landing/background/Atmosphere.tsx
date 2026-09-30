/**
 * The atmospheric floor of the artist-system background: black depth, slow
 * violet blooms, the wireframe globe, and the signal trails that carry streams
 * out of it toward the artist's earnings.
 *
 * Everything is CSS gradients and one small SVG. No raster assets, so there is
 * nothing to download and nothing to go blurry on a high-density screen.
 *
 * The blooms carry no blur() filter. A radial gradient already falls off softly,
 * so the filter was redundant — and a large blurred texture is one of the most
 * expensive things a compositor can be asked to re-rasterise on every frame.
 */
export default function Atmosphere() {
  return (
    <>
      {/* Violet blooms. Three of them, all on 30s+ cycles at different phases,
          so the light never appears to loop. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[8%] top-[6%] h-[38rem] w-[38rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(109,43,255,0.42) 0%, rgba(74,17,204,0.16) 45%, transparent 72%)",
          animation: "bloom-drift 34s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[6%] top-[14%] h-[34rem] w-[34rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(138,92,255,0.36) 0%, transparent 70%)",
          animation: "bloom-drift 41s ease-in-out infinite reverse",
          willChange: "transform, opacity",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-14%] left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(90,32,200,0.34) 0%, transparent 72%)",
          animation: "bloom-drift 29s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
      />

      {/* Wireframe globe — a dot lattice masked to a sphere, with a lime
          landmass hint. It anchors the composition's lower centre. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-16%] left-1/2 hidden h-[26rem] w-[26rem] -translate-x-1/2 md:block"
        /* Deliberately static: two masked dot lattices are expensive to
           re-rasterise and the drift was imperceptible. */
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage:
              "radial-gradient(rgba(167,139,255,0.5) 1px, transparent 1px)",
            backgroundSize: "9px 9px",
            maskImage:
              "radial-gradient(circle at 50% 50%, #000 62%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 50%, #000 62%, transparent 72%)",
            opacity: 0.55,
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage:
              "radial-gradient(rgba(203,242,76,0.7) 1px, transparent 1px)",
            backgroundSize: "9px 9px",
            maskImage:
              "radial-gradient(ellipse 26% 30% at 58% 44%, #000 40%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 26% 30% at 58% 44%, #000 40%, transparent 70%)",
            opacity: 0.75,
          }}
        />
      </div>

      {/* Signal trails: streams leaving the globe and arriving at the right-hand
          product stack. Dashes flow slowly along each path. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[38%] hidden h-[24rem] w-[62%] overflow-visible md:block"
        viewBox="0 0 600 320"
        preserveAspectRatio="none"
      >
        {[
          { d: "M0 300 C 150 296, 300 250, 430 150 C 500 96, 560 60, 600 40", c: "rgba(167,139,255,0.5)", w: 1, dur: "9s" },
          { d: "M0 312 C 160 306, 320 268, 450 176 C 520 126, 570 92, 600 74", c: "rgba(203,242,76,0.42)", w: 1, dur: "11s" },
          { d: "M0 288 C 140 284, 290 232, 420 126 C 490 70, 555 36, 600 18", c: "rgba(138,92,255,0.34)", w: 1, dur: "13s" },
          { d: "M0 320 C 170 316, 340 288, 470 206 C 535 162, 575 132, 600 116", c: "rgba(203,242,76,0.24)", w: 1, dur: "15s" },
        ].map((t, i) => (
          <path
            key={i}
            d={t.d}
            fill="none"
            stroke={t.c}
            strokeWidth={t.w}
            strokeDasharray="6 14"
            style={{ animation: `trail-flow ${t.dur} linear infinite` }}
          />
        ))}
      </svg>
    </>
  );
}
