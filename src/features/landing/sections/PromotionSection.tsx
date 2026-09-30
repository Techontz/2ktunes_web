import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { COVERS } from "../data";
import CoverArt from "../art/CoverArt";
import { Band, Card, Eyebrow, Opener, Reveal } from "../ui";

/** Illustrative campaign figures. */
const BARS = [22, 31, 27, 44, 39, 58, 71, 64, 88, 96];

function CampaignCard() {
  const cover = COVERS[8];

  return (
    <div className="relative w-full max-w-sm">
      <Card className="bg-carbon-2 p-5 ring-1 ring-white/10 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            <CoverArt cover={cover} caption={false} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.9375rem] font-extrabold tracking-[-0.02em] text-white">
              {cover.title}
            </p>
            <p className="truncate text-[0.75rem] font-medium text-white/45">
              {cover.artist} · 14-day campaign
            </p>
          </div>
          <span className="ml-auto rounded-full bg-amber/15 px-2.5 py-1 text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-amber">
            Live
          </span>
        </div>

        <div className="mt-6 flex h-20 items-end gap-1.5">
          {BARS.map((h, i) => (
            <motion.span
              key={i}
              initial={{ height: 6 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                delay: 0.15 + i * 0.05,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex-1 rounded-t-[4px]"
              style={{
                background: i > 6 ? "#FFC94A" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-5">
          <div>
            <p className="text-[1.5rem] font-extrabold tracking-[-0.03em] text-white">
              48.2K
            </p>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white/35">
              creator videos
            </p>
          </div>
          <div>
            <p className="text-[1.5rem] font-extrabold tracking-[-0.03em] text-amber">
              +214%
            </p>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white/35">
              saves vs. baseline
            </p>
          </div>
        </div>
      </Card>

      <p className="mt-3 text-center text-[0.6875rem] font-medium text-white/25">
        Sample campaign data, shown for illustration
      </p>
    </div>
  );
}

const TILES = [
  {
    t: "Pitch to editorial playlists",
    d: "Submit releases for playlist consideration across major streaming services, with the metadata curators actually look for.",
    tone: "paper",
  },
  {
    t: "Run social campaigns",
    d: "Turn a hook into a trend. Brief creators, seed your sound and watch short-video pickup build week over week.",
    tone: "amber",
  },
  {
    t: "Get expert guidance",
    d: "Release strategy, artwork checks and rollout timing from a team that knows the East African market.",
    tone: "slab",
  },
] as const;

export default function PromotionSection() {
  return (
    <Band id="promotion" tone="carbon">
      <div className="shell">
        <Opener
          eyebrow="Promotion"
          title="Distribution is only the beginning."
          deck="Uploading your song is the easy part. Growing an audience for it is the work — so 2K Tunes puts promotion tools and real opportunities next to your catalogue instead of selling them separately."
        />

        <div className="mt-14 md:mt-20">
          <Reveal>
            <Card className="bg-slab">
              <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:p-14">
                <div>
                  <h3 className="t-card text-white">
                    Get in front of the
                    <br className="hidden sm:block" />{" "}
                    <span className="text-amber">right audience</span>
                  </h3>
                  <p className="t-body mt-5 max-w-[46ch] text-white/55">
                    Reach creators who make videos, curators who build playlists,
                    and listeners who follow the sound you are part of. Every
                    campaign reports back so you learn what worked before the next
                    release.
                  </p>

                  <div className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
                    <div>
                      <p className="t-figure text-white">40+</p>
                      <p className="mt-1 text-[0.8125rem] font-semibold text-white/45">
                        markets you can target
                      </p>
                    </div>
                    <div>
                      <p className="t-figure text-white">Weekly</p>
                      <p className="mt-1 text-[0.8125rem] font-semibold text-white/45">
                        pitching windows
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <CampaignCard />
                </div>
              </div>
            </Card>
          </Reveal>

          <div className="mt-4 grid gap-4 md:mt-5 md:gap-5 lg:grid-cols-3">
            {TILES.map((tile, i) => (
              <Reveal key={tile.t} delay={i * 0.07}>
                <Card
                  className={`h-full p-7 sm:p-9 ${
                    tile.tone === "paper"
                      ? "bg-paper"
                      : tile.tone === "amber"
                        ? "grain bg-amber"
                        : "bg-slab"
                  }`}
                >
                  <div className="relative flex h-full flex-col">
                    <h3
                      className={`t-card ${
                        tile.tone === "slab" ? "text-white" : "text-ink"
                      }`}
                    >
                      {tile.t}
                    </h3>
                    <p
                      className={`t-body mt-4 ${
                        tile.tone === "slab" ? "text-white/50" : "text-ink/65"
                      }`}
                    >
                      {tile.d}
                    </p>
                    <span
                      className={`mt-8 inline-flex h-9 w-9 items-center justify-center rounded-full ${
                        tile.tone === "slab"
                          ? "bg-white/10 text-white"
                          : "bg-ink/10 text-ink"
                      }`}
                    >
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                    </span>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Band>
  );
}
