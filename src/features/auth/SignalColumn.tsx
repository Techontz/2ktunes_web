import { motion } from "motion/react";
import { FEATURED_RELEASE } from "@/features/landing/product/release";
import ReleaseCover from "@/features/landing/product/ReleaseCover";

/**
 * THE CENTRE SIGNAL
 * =================
 *
 * The bridge between the artist (left) and the platform (right). Measured, not
 * guessed: the gap between the brand copy and the form ran 261px at 1280, 378px
 * at 1440 and 731px at 1920 — 38% of a large screen was dead.
 *
 * It is NOT a third column. It is an overlay owned by the authentication zone
 * and anchored to that zone's leading edge, so it reads as music crossing into
 * the product rather than as an illustration parked between two panels. The auth
 * zone positions it; this component only draws it.
 *
 *     sleeves  ╲
 *               ~~~~~~ waveform ~~~~~~
 *                        │
 *                   release tile
 *                        │
 *                         ╲  form
 *
 * It is deliberately small. A waveform at 17rem, one release tile, two hairline
 * signal paths, one very low radial. Nothing here is a dashboard, and nothing is
 * a floating glass card.
 *
 * MOTION BUDGET — four animated layers, all reusing keyframes the project
 * already ships (wave-scan, trail-flow, float-d, live-pulse). No blur filters,
 * no backdrop-filter: the hero's 60fps was won by removing exactly those and
 * this screen is not giving it back.
 *
 * ACCESSIBILITY — the whole column is decorative. The release it depicts is
 * already described in the product sections of the site, so it is marked
 * aria-hidden rather than read out as if it were account data.
 */

/**
 * Deterministic bar heights — random() would reshuffle on every render.
 *
 * Three summed sines at unrelated frequencies. Two produced a clean symmetric
 * envelope that read as a decorative bowtie rather than audio; real signal is
 * irregular.
 */
const BARS = Array.from({ length: 48 }, (_, i) => {
  const a = Math.sin(i * 0.42) * 0.5 + 0.5;
  const b = Math.sin(i * 0.91 + 1.7) * 0.5 + 0.5;
  const c = Math.sin(i * 0.17 + 0.4) * 0.5 + 0.5;
  return 0.14 + a * 0.34 + b * 0.2 + c * 0.32;
});

/** A hairline dashed run with a slow travelling dash. */
function Path({
  d,
  className = "",
  delay = 0,
}: {
  d: string;
  className?: string;
  delay?: number;
}) {
  return (
    <svg
      className={`pointer-events-none absolute overflow-visible ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="rgba(167,139,255,0.34)"
        strokeWidth="0.6"
        strokeDasharray="3 6"
        vectorEffect="non-scaling-stroke"
        style={{ animation: `trail-flow 14s linear ${delay}s infinite` }}
      />
    </svg>
  );
}

export default function SignalColumn() {
  const r = FEATURED_RELEASE;

  return (
    <div
      aria-hidden
      className="pointer-events-none relative flex h-full w-full flex-col items-center justify-center"
    >
      {/* One atmospheric source, sitting behind the signal. A plain radial —
          large enough to give depth, low enough never to read as a purple blob. */}
      <div
        className="pointer-events-none absolute left-1/2 top-[46%] h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(109,43,255,0.13) 0%, transparent 66%)",
        }}
      />

      {/* Signal out: descends toward the form, but STOPS AT THE COLUMN EDGE.
          An earlier version overhung 42% into the form column and measurably
          crossed the Google button, the confirm-password field and the primary
          CTA by 53–102px. Pointing at the form reads as continuation; touching
          it is a collision. */}
      <Path
        d="M0 6 C 22 12, 40 40, 70 62 C 84 72, 94 80, 100 86"
        className="right-0 top-[60%] h-[34%] w-[52%]"
        delay={2}
      />

      {/* ── The signal itself ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
        /* Slightly above true centre — the composition is asymmetric on
           purpose, with the tile hanging below and offset. */
        className="relative -mt-[7rem] w-[17rem]"
      >
        {/* Signal in, anchored to the WAVEFORM rather than to the column.
            Positioned as a share of column height it could not track the block's
            fixed -mt offset, and clipped the label by 14px at 1440 and 1920 while
            looking fine at 1280. Anchored here it always meets the bars' left
            edge, at any viewport height. */}
        <Path
          d="M0 92 C 26 88, 44 56, 72 32 C 84 22, 93 14, 100 8"
          /* 6.5rem, not 11: at 1280 the longer run reached 47px past the brand
             copy's right edge, and 8rem left only 1px of clearance. A shorter
             diagonal still reads as a signal and can't collide. */
          className="-left-[6.5rem] top-[2.6rem] h-[7.5rem] w-[6.5rem]"
        />

        <p className="mb-3 text-center text-[0.5625rem] font-bold uppercase tracking-[0.22em] text-white/25">
          Audio received
        </p>

        <div className="relative flex h-14 items-center gap-[2px] overflow-hidden">
          {BARS.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${h * 100}%`,
                /* A brighter core with the edges falling away, so the run reads
                   as one signal rather than 48 separate bars. */
                background:
                  i % 11 === 5
                    ? "rgba(203,242,76,0.75)"
                    : "rgba(138,92,255,0.72)",
                /* Peak sits left of centre and falls away slowly, so the run
                   reads as one asymmetric signal instead of a mirrored shape. */
                opacity:
                  0.34 + 0.6 * Math.max(0, 1 - Math.abs(i - 19) / 27),
              }}
            />
          ))}
          {/* The one moving element: a read-head crossing every few seconds. */}
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-16"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(203,242,76,0.22), transparent)",
              animation: "wave-scan 9s linear infinite",
            }}
          />
        </div>
      </motion.div>

      {/* Connector between waveform and tile. */}
      <motion.span
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.34 }}
        className="relative mt-5 block h-12 w-px origin-top"
        style={{
          background:
            "linear-gradient(to bottom, rgba(167,139,255,0.4), rgba(167,139,255,0.06))",
        }}
      />

      {/* ── Release tile ── small product data, offset right of the axis ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative ml-10 mt-5"
      >
        <div
          className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-3.5"
          style={{
            boxShadow: "0 28px 60px -34px rgba(0,0,0,0.95)",
            animation: "float-d 13s ease-in-out infinite",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
              <ReleaseCover size="thumb" eager={false} />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-white/35">
                {r.project}
              </span>
              <span className="mt-1 block truncate text-[0.9375rem] font-extrabold tracking-[-0.02em] text-white">
                {r.title}
              </span>
              <span className="block truncate text-[0.6875rem] font-medium text-white/45">
                {r.artist}
              </span>
            </span>
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
            <span className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-lime"
                style={{ animation: "live-pulse 4s ease-in-out infinite" }}
              />
              <span className="text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-lime">
                Release ready
              </span>
            </span>
            <span className="text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-white/25">
              {r.type}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
