import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Atmosphere from "./Atmosphere";
import ArtistPlate from "./ArtistPlate";
import { ARTIST_PLATES } from "./artistPlates";
import {
  AlbumGrid,
  CountriesPanel,
  EarningsPanel,
  ReleasePanel,
  StreamsPanel,
  WalletPanel,
  WaveformPanel,
  WaveformStrip,
} from "./panels";
import { useParallax } from "./useParallax";

/**
 * ARTIST-SYSTEM BACKGROUND
 * ========================
 *
 * The 2K Tunes ecosystem running quietly behind the headline:
 * artist → release → audience → streams → analytics → earnings → growth.
 *
 * LAYOUT — TWO LANES AND A CORRIDOR
 * The panels live in two vertical flex stacks pinned to the left and right
 * edges, and the whole middle stays empty for the hero copy. The lanes are flow
 * layouts, not absolutely-positioned percentages, and that matters: the hero's
 * height changes a lot between breakpoints, so hand-placed percentages that
 * clear each other at 1440 silently overlap at 1024. Stacking with a gap makes
 * panel-on-panel collision structurally impossible rather than something to
 * re-check after every edit.
 *
 * LANE WIDTH IS THE REAL CONSTRAINT, AND IT IS CONTINUOUS
 * The headline is the widest element on the page, so the free lane is only 20px
 * at 360, 121px at 768, 161px at 1024, 206px at 1280 and 286px at 1440. A
 * stepped per-breakpoint offset cannot track that: sizing the xl step for 1280
 * over-crops 1440 by 80px, and sizing it for 1440 puts a card through the
 * headline at 1280. So the offset is a calc instead.
 *
 * Above ~1270px the headline's font-size hits its clamp ceiling and its width
 * settles at ~868px, which makes the lane exactly `50vw - 434px`. Clearing the
 * lane's WIDEST panel with a 24px gutter therefore reduces to a one-liner —
 * `min(calc(50vw - 714px), 1.5rem)`, where 714 = 434 + 256 + 24 —
 * and the `min()` stops the stack drifting inward on very wide screens so it
 * keeps hugging the viewport edge. Below that ceiling the headline scales with
 * the viewport instead, so the lg step uses the proportional form.
 *
 * The result is a constant 24px of clearance at every width, cards cropping
 * against the edge deliberately, and no per-breakpoint numbers to re-tune. The
 * collision test is what holds this honest.
 *
 * DENSITY IS PROGRESSIVE
 * Panels are added only as a lane genuinely gains room, never scaled down to
 * squeeze in. Below lg there is no usable lane at all, so those breakpoints use
 * the space above and below the copy instead.
 *
 * MOTION BUDGET
 * One rAF loop for the entire system (useParallax), CSS keyframes for the
 * floating and the ambient light, two scroll-linked transforms. Only transform,
 * opacity and filter are animated.
 */

const CLOCKS = {
  a: "layer-float-a",
  b: "layer-float-b",
  c: "layer-float-c",
  d: "layer-float-d",
} as const;

/**
 * One element of the system.
 *
 * Three nested nodes on purpose: the outer node handles the entrance, the middle
 * node owns the parallax translate (a CSS-variable transform, so it costs
 * nothing per frame), and the inner node owns the float keyframes. Combining
 * parallax and float on one node would mean one overwriting the other.
 */
function Slot({
  children,
  depth,
  delay,
  clock,
  className = "",
  recede = false,
}: {
  children: ReactNode;
  /** Parallax multiplier: 0.6 far → 2 near. */
  depth: number;
  delay: number;
  clock: keyof typeof CLOCKS;
  className?: string;
  recede?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <div
        style={{
          transform: `translate3d(calc(var(--px, 0px) * ${depth}), calc(var(--py, 0px) * ${depth}), 0)`,
          willChange: "transform",
        }}
      >
        <div
          className={CLOCKS[clock]}
          style={
            recede
              ? { filter: "blur(0.6px) brightness(0.82)", opacity: 0.9 }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * A lane. Starts below the fixed navigation so no panel is ever tucked under it,
 * and its horizontal offset is what keeps the whole stack clear of the headline.
 */
function Lane({
  side,
  className = "",
  children,
}: {
  side: "left" | "right";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute top-[4.5rem] flex flex-col gap-6 xl:gap-7 ${
        side === "left" ? "left-0 items-start" : "right-0 items-end"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function ArtistSystemBackground() {
  const reduced = !!useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<HTMLDivElement>(null);

  useParallax(root, { range: 12, enabled: !reduced });

  /* Scroll depth: the system drifts up and swells very slightly as the hero
     leaves, so you feel like you are moving through it rather than past it. */
  const { scrollYProgress } = useScroll({
    target: scope,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-9%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  const photos = ARTIST_PLATES;

  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden bg-ink">
      {/* The mask lives on a static wrapper, not on the transformed element.
          Carrying both on one node made every scroll frame re-rasterise the
          masked layer instead of just re-compositing it, which was enough to
          push the hero onto a 30fps cadence. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, #000 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 88%, transparent 100%)",
        }}
      >
        <motion.div
          ref={root}
          /* The field fills its stage, which by construction excludes the
             destination rail. */
          className="absolute inset-0"
          style={reduced ? undefined : { y, scale, opacity }}
        >
          <Atmosphere />

          {/* ── LEFT LANE — the artist and their numbers ── */}
          <Lane side="left" className="hidden lg:flex lg:ml-[calc(15.7vw-240px)] xl:ml-[min(calc(50vw-714px),1.5rem)]">
            {/* Photography renders only when it exists. Sleeve artwork is not a
                stand-in for a portrait, so until files are dropped into
                background/artistPlates.ts the background is a pure product and
                data ecosystem — honest, and complete on its own terms. */}
            {photos[0].src && (
              <Slot depth={0.6} delay={0.18} clock="a" recede>
                <ArtistPlate index={0} className="h-[19rem] w-[17rem] rounded-2xl" />
              </Slot>
            )}

            <Slot depth={1.4} delay={0.34} clock="c">
              <StreamsPanel />
            </Slot>

            <Slot depth={1.7} delay={0.5} clock="b" className="hidden xl:block">
              <EarningsPanel />
            </Slot>

            {/* The clearest single signal that music is being processed. */}
            <Slot depth={1.9} delay={0.62} clock="d" className="hidden xl:block">
              <WaveformPanel />
            </Slot>

            <Slot depth={1.5} delay={0.78} clock="a" className="hidden 2xl:block">
              <CountriesPanel />
            </Slot>
          </Lane>

          {/* ── RIGHT LANE — release, audience, catalogue, money ── */}
          <Lane side="right" className="hidden lg:flex lg:mr-[calc(15.7vw-280px)] xl:mr-[min(calc(50vw-714px),1.5rem)]">
            <Slot depth={1.6} delay={0.42} clock="c">
              <ReleasePanel />
            </Slot>

            <Slot depth={1.3} delay={0.86} clock="b">
              <AlbumGrid />
            </Slot>

            {/* A crowd is the one thing sleeve artwork cannot stand in for. */}
            {photos[2].src && (
              <Slot depth={0.8} delay={0.3} clock="d" recede>
                <ArtistPlate index={2} className="h-[10rem] w-[20rem] rounded-2xl" />
              </Slot>
            )}

            <Slot depth={1.9} delay={0.98} clock="a" className="hidden 2xl:block">
              <WalletPanel />
            </Slot>
          </Lane>

          {/* ── MD — the top zone, not side lanes ──
              Measured at 768: 286px of clear space above the copy, but only 158px
              below it, and these panels are 142–145px tall. So both live in the
              top band, side by side — a 256px card at each 4% inset leaves 196px
              between them — and both start below the fixed nav. Putting one below
              the copy instead pushed it into the primary CTA by 13px. */}

          <Slot
            depth={1.8}
            delay={0.6}
            clock="d"
            className="absolute left-[4%] top-[4.5rem] hidden md:block lg:hidden"
          >
            <WaveformPanel />
          </Slot>

          <Slot
            depth={1.5}
            delay={0.42}
            clock="c"
            className="absolute right-[4%] top-[4.5rem] hidden md:block lg:hidden"
          >
            <ReleasePanel />
          </Slot>

          {/* ── BELOW MD — atmosphere only ──
              Measured, not assumed: at 360×740 the hero leaves 112px above the copy
              and 27px below it, and the fixed nav claims 64px of that. There is no
              honest room for a product card, and a card half-tucked under the nav
              reads as a bug rather than a crop. So small screens get the
              atmosphere — violet blooms, the globe, the lime signal trails — plus
              a bare waveform strip, which fits the 48px gap a card cannot. Full
              panels return at md, where the space genuinely exists. */}

          <Slot
            depth={1.6}
            delay={0.5}
            clock="d"
            className="absolute inset-x-4 top-[4.5rem] md:hidden"
          >
            <WaveformStrip />
          </Slot>
        </motion.div>
      </div>

      {/* ── LEGIBILITY ──
          The corridor is already dark by composition, so this stays a light
          touch: a soft centre well plus edge falloff. Deliberately not obvious. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 52% 46% at 50% 44%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.32) 55%, transparent 84%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{ background: "rgba(4,2,10,0.32)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink via-ink/80 to-transparent"
      />
    </div>
  );
}
