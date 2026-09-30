import { motion, useReducedMotion } from "motion/react";
import { PLATFORMS } from "../data";
import PlatformTile from "../art/PlatformTile";
import PhoneMock from "../product/PhoneMock";
import { Band, Card, Eyebrow, Reveal } from "../ui";

const PIPELINE = [
  "Submitted from your dashboard",
  "Checked for artwork & metadata",
  "Delivered to every selected store",
  "Live on your release date",
];

/**
 * Product showcase.
 *
 * The device sits on bone rather than inside a card: a dark chassis on a warm
 * off-white field is what lets the ambient shadow actually read, and it gives
 * the phone the negative space to behave as the visual anchor of the page.
 */
export default function ShowcaseSection() {
  const reduced = useReducedMotion();

  return (
    <Band id="showcase" tone="bone" className="lg:py-32">
      <div className="shell relative">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
          {/* ── Device ── */}
          <div className="order-1 lg:col-span-5">
            <div className="relative">
              {/* A soft ground beneath the device, on-tone with the band. */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[90px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(109,43,255,0.16) 0%, rgba(180,172,150,0.22) 45%, transparent 72%)",
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 48, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduced ? undefined : { y: -10 }}
                className="relative mx-auto w-[17rem] transition-transform sm:w-[18.5rem] lg:w-full lg:max-w-[19.5rem]"
              >
                <PhoneMock />
              </motion.div>
            </div>
          </div>

          {/* ── Copy ── */}
          <div className="order-2 lg:col-span-7 lg:pl-8">
            <Reveal>
              <Eyebrow className="text-volt-deep">One upload</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="t-display mt-5 max-w-[20ch] text-ink">
                Everywhere your listeners already are.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="t-body mt-6 max-w-[52ch] text-ink/60">
                Build a release in minutes. Add your audio, artwork, credits and
                release date, then send it to the platforms where your audience
                listens — and follow every delivery from submitted to live.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
                <div>
                  <p className="t-figure text-ink">150+</p>
                  <p className="mt-1 text-[0.8125rem] font-semibold text-ink/50">
                    stores &amp; platforms
                  </p>
                </div>
                <div>
                  <p className="t-figure text-ink">100%</p>
                  <p className="mt-1 text-[0.8125rem] font-semibold text-ink/50">
                    of your masters, kept
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Supporting delivery card */}
            <Reveal delay={0.22}>
              <Card className="mt-12 bg-ink p-7 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <Eyebrow className="text-white/35">Delivery</Eyebrow>
                    <h3 className="mt-3 text-[1.125rem] font-extrabold tracking-[-0.02em] text-white">
                      What happens after you submit
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {PLATFORMS.slice(0, 5).map((p) => (
                      <PlatformTile
                        key={p.name}
                        platform={p}
                        className="w-8 opacity-85"
                      />
                    ))}
                  </div>
                </div>

                <ol className="mt-7">
                  {PIPELINE.map((step, i) => (
                    <li
                      key={step}
                      className="flex items-center gap-4 border-t border-white/[0.08] py-3.5 last:pb-0"
                    >
                      <span className="text-[0.6875rem] font-extrabold tabular-nums text-lime/80">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[0.875rem] font-semibold text-white/80">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </Band>
  );
}
