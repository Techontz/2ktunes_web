import { motion } from "motion/react";
import { PLATFORMS } from "../data";
import PlatformTile from "../art/PlatformTile";
import { Band, Card, Eyebrow, Opener, Reveal } from "../ui";

/**
 * Platform constellation. Tiles sit on a hand-tuned scatter rather than a grid
 * so the card reads as artwork instead of a logo dump.
 */
const SCATTER = [
  { x: 5, y: 10, s: 66 },
  { x: 39, y: 3, s: 54 },
  { x: 69, y: 13, s: 74 },
  { x: 20, y: 36, s: 50 },
  { x: 54, y: 33, s: 62 },
  { x: 84, y: 42, s: 46 },
  { x: 4, y: 60, s: 58 },
  { x: 34, y: 63, s: 70 },
  { x: 64, y: 59, s: 48 },
  { x: 87, y: 73, s: 56 },
  { x: 16, y: 85, s: 44 },
  { x: 49, y: 86, s: 52 },
];

function Constellation() {
  return (
    <div className="relative h-64 w-full sm:h-72">
      {SCATTER.map((p, i) => (
        <motion.div
          key={PLATFORMS[i].name}
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            delay: 0.05 + i * 0.045,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s }}
        >
          <PlatformTile platform={PLATFORMS[i]} />
        </motion.div>
      ))}
    </div>
  );
}

const REACH = [
  {
    k: "Streaming",
    d: "Spotify, Apple Music, YouTube Music, Deezer, Tidal, Amazon Music.",
  },
  {
    k: "Africa-first",
    d: "Boomplay and Audiomack, where a huge share of the continent listens.",
  },
  {
    k: "Short video",
    d: "TikTok, Instagram and Facebook, where records break now.",
  },
];

export default function DistributeSection() {
  return (
    <Band id="distribution" tone="carbon">
      <div className="shell">
        <Opener
          eyebrow="Distribution"
          title={
            <>
              One upload.
              <br />
              <span className="text-volt-lit">Global reach.</span>
            </>
          }
          deck="Send a release once and 2K Tunes delivers it to the streaming services, short-video platforms and social apps where audiences actually find new music — worldwide, with your metadata intact."
        />

        <div className="mt-14 grid gap-4 md:mt-20 md:gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Card className="h-full bg-slab p-7 sm:p-10">
              <Eyebrow className="text-white/35">The ecosystem</Eyebrow>
              <h3 className="t-card mt-4 max-w-[22ch] text-white">
                Streaming, social, and short video
              </h3>
              <Constellation />
            </Card>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5">
            <Card className="flex h-full flex-col justify-between bg-carbon-2 p-7 ring-1 ring-white/[0.07] sm:p-10">
              <div>
                <Eyebrow className="text-white/35">Where it lands</Eyebrow>
                <dl className="mt-7">
                  {REACH.map((r, i) => (
                    <div
                      key={r.k}
                      className={`py-5 ${i > 0 ? "border-t border-white/[0.08]" : "pt-0"}`}
                    >
                      <dt className="text-[1.0625rem] font-extrabold tracking-[-0.02em] text-white">
                        {r.k}
                      </dt>
                      <dd className="mt-1.5 text-[0.875rem] font-medium leading-relaxed text-white/45">
                        {r.d}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <p className="mt-8 border-t border-white/[0.08] pt-7 text-[0.75rem] font-medium leading-relaxed text-white/30">
                Platform names identify the stores 2K Tunes delivers to. All
                trademarks belong to their respective owners.
              </p>
            </Card>
          </Reveal>
        </div>
      </div>
    </Band>
  );
}
