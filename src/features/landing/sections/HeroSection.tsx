import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { PLATFORMS } from "../data";
import PlatformTile from "../art/PlatformTile";
import ArtistSystemBackground from "../background/ArtistSystemBackground";
import { Pill } from "../ui";

/**
 * Hero.
 *
 * The background is the 2K Tunes artist system — artist, release, audience,
 * streams, analytics, earnings — running quietly behind the headline. It replaces
 * the earlier rotating sleeve cylinder; a circular carousel is someone else's
 * motion identity, and this one is ours.
 *
 * The copy and CTAs are unchanged, and the background keeps its centre corridor
 * dark by composition so nothing bright ever crosses the headline.
 */

function Copy() {
  return (
    <>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 flex items-center gap-2.5 text-[0.5625rem] font-bold uppercase leading-none tracking-[0.14em] text-white/45 sm:mb-7 sm:text-[0.6875rem] sm:tracking-[0.18em]"
      >
        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
        Music distribution from East Africa
      </motion.p>

      <h1 className="t-hero max-w-[19ch] text-white">
        {["Your music", "deserves the world."].map((line, i) => (
          <span key={line} className="block overflow-hidden pb-[0.06em]">
            <motion.span
              initial={{ y: "108%" }}
              animate={{ y: "0%" }}
              transition={{
                duration: 1,
                delay: 1.02 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="block"
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.28, ease: [0.22, 1, 0.36, 1] }}
        className="t-body mt-6 max-w-[42ch] text-white/60 sm:mt-7 md:max-w-[52ch]"
      >
        Release globally, keep control of your work, and get paid through the
        payment methods that actually work where you live.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.42, ease: [0.22, 1, 0.36, 1] }}
        className="mt-9 flex w-full flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center"
      >
        <Pill to="/auth" variant="light" size="lg" className="sm:px-9">
          Get started
        </Pill>
        <Pill href="#showcase" variant="outlineLight" size="lg">
          See how it works
        </Pill>
      </motion.div>
    </>
  );
}

function Rail() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1.6 }}
      className="relative z-10"
    >
      <p className="t-eyebrow mb-5 text-center text-white/30 sm:mb-6">
        Delivered to 150+ stores and platforms
      </p>
      <div className="fade-x w-full overflow-hidden">
        <div className="animate-rail-slow flex w-max gap-4 md:gap-6">
          {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
            <PlatformTile
              key={`${p.name}-${i}`}
              platform={p}
              className="w-11 shrink-0 opacity-70 md:w-14"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "34%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[92svh] flex-col overflow-hidden bg-ink pb-12 md:min-h-[96svh] md:pb-16"
    >
      {/* The stage holds the background and the copy, and the destination rail
          sits outside it. That is structural rather than cosmetic: the section
          centres its content, so the rail's distance from the section's bottom
          edge changes with viewport height, and a background sized with a fixed
          bottom offset ran straight through the rail at 768. Scoping the
          background to the stage makes the overlap impossible at any height. */}
      <div className="relative flex flex-1 flex-col justify-center pt-28 md:pt-32">
        <ArtistSystemBackground />

        <motion.div
          style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}
          className="shell relative z-10 flex flex-col items-center text-center"
        >
          <Copy />
        </motion.div>
      </div>

      <div className="relative z-20 mt-10 md:mt-12">
        <Rail />
      </div>
    </section>
  );
}
