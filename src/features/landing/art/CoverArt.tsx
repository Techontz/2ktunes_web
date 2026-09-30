/**
 * 2K Tunes — generative cover-art system.
 *
 * The landing page ships no stock photography. Instead every release sleeve is
 * an original, deterministic composition built from eight art-directed
 * templates and a curated palette. Everything is sized in container units
 * (`cqw`), so a single cover reads correctly at 44px in a footer rail and at
 * 420px in the hero wall.
 */

import { memo } from "react";

export type CoverStyle =
  | "orbit"
  | "stack"
  | "halo"
  | "split"
  | "wave"
  | "type"
  | "rings"
  | "grid";

export type Cover = {
  id: string;
  /** Release title. Invented for 2K Tunes — not a real catalogue. */
  title: string;
  /** Artist alias. Invented. */
  artist: string;
  style: CoverStyle;
  from: string;
  to: string;
  /** Foreground colour for type + geometry. */
  ink: string;
  accent: string;
};

/* ── Art layers ─────────────────────────────────────────────────────── */

function Layers({ cover }: { cover: Cover }) {
  const { style, ink, accent } = cover;

  switch (style) {
    case "orbit":
      return (
        <>
          <span
            className="absolute rounded-full"
            style={{
              width: "78cqw",
              height: "78cqw",
              left: "34cqw",
              top: "-14cqw",
              background: accent,
              opacity: 0.92,
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: "62cqw",
              height: "62cqw",
              left: "-22cqw",
              top: "38cqw",
              border: `0.9cqw solid ${ink}`,
              opacity: 0.5,
            }}
          />
        </>
      );

    case "stack":
      return (
        <>
          {[92, 74, 58, 38, 24].map((w, i) => (
            <span
              key={i}
              className="absolute"
              style={{
                left: "8cqw",
                top: `${26 + i * 11}cqw`,
                width: `${w * 0.8}cqw`,
                height: "5cqw",
                borderRadius: "3cqw",
                background: i === 1 ? accent : ink,
                opacity: i === 1 ? 1 : 0.85 - i * 0.12,
              }}
            />
          ))}
        </>
      );

    case "halo":
      return (
        <>
          <span
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${accent} 0%, transparent 58%)`,
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: "34cqw",
              height: "34cqw",
              left: "33cqw",
              top: "23cqw",
              border: `0.7cqw solid ${ink}`,
              opacity: 0.75,
            }}
          />
        </>
      );

    case "split":
      return (
        <>
          <span
            className="absolute inset-0"
            style={{
              background: accent,
              clipPath: "polygon(0 100%, 100% 22%, 100% 100%)",
            }}
          />
          <span
            className="absolute"
            style={{
              width: "26cqw",
              height: "26cqw",
              right: "10cqw",
              top: "12cqw",
              borderRadius: "50%",
              background: ink,
              opacity: 0.9,
            }}
          />
        </>
      );

    case "wave":
      return (
        <>
          <span
            className="absolute"
            style={{
              inset: "-20%",
              background: `repeating-linear-gradient(74deg, ${ink} 0 1.4cqw, transparent 1.4cqw 6cqw)`,
              opacity: 0.42,
            }}
          />
          <span
            className="absolute"
            style={{
              left: "12cqw",
              top: "50cqw",
              width: "56cqw",
              height: "26cqw",
              borderRadius: "50% 50% 0 0",
              background: accent,
            }}
          />
        </>
      );

    case "type":
      return (
        <span
          className="absolute select-none"
          style={{
            left: "-6cqw",
            top: "-16cqw",
            fontSize: "104cqw",
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.08em",
            color: accent,
            opacity: 0.95,
          }}
        >
          {cover.artist.charAt(0)}
        </span>
      );

    case "rings":
      return (
        <>
          {[86, 66, 46, 26].map((s, i) => (
            <span
              key={s}
              className="absolute rounded-full"
              style={{
                width: `${s}cqw`,
                height: `${s}cqw`,
                left: `${(100 - s) / 2}cqw`,
                top: `${18 + (86 - s) / 2}cqw`,
                border: `${i === 1 ? 2.2 : 0.8}cqw solid ${i === 1 ? accent : ink}`,
                opacity: i === 1 ? 1 : 0.45,
              }}
            />
          ))}
        </>
      );

    case "grid":
      return (
        <>
          <span
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${ink} 0.9cqw, transparent 0.9cqw)`,
              backgroundSize: "9cqw 9cqw",
              opacity: 0.4,
            }}
          />
          <span
            className="absolute"
            style={{
              left: "16cqw",
              top: "20cqw",
              width: "44cqw",
              height: "44cqw",
              background: accent,
              borderRadius: "2cqw",
              transform: "rotate(-9deg)",
            }}
          />
        </>
      );
  }
}

/* ── Cover ──────────────────────────────────────────────────────────── */

type Props = {
  cover: Cover;
  /** Hide the caption on very small renders (rails, thumbnails). */
  caption?: boolean;
  className?: string;
};

const CoverArt = memo(function CoverArt({
  cover,
  caption = true,
  className = "",
}: Props) {
  return (
    <div
      className={`grain relative isolate h-full w-full overflow-hidden ${className}`}
      style={{
        containerType: "inline-size",
        background: `linear-gradient(152deg, ${cover.from} 0%, ${cover.to} 100%)`,
      }}
      role="img"
      aria-label={`${cover.title} by ${cover.artist} — 2K Tunes release artwork`}
    >
      <Layers cover={cover} />

      {/* Sleeve depth: a soft top-light and a grounded bottom. */}
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 34%, rgba(0,0,0,0.42) 100%)",
        }}
      />

      {caption && (
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ padding: "6cqw" }}
        >
          <p
            style={{
              fontSize: "5cqw",
              letterSpacing: "0.16em",
              fontWeight: 700,
              color: cover.ink,
              opacity: 0.72,
              textTransform: "uppercase",
            }}
          >
            {cover.artist}
          </p>
          <p
            style={{
              fontSize: "9.5cqw",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              fontWeight: 800,
              color: cover.ink,
              marginTop: "1.5cqw",
            }}
          >
            {cover.title}
          </p>
        </div>
      )}
    </div>
  );
});

export default CoverArt;
