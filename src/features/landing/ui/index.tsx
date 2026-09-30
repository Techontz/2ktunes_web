/**
 * Shared primitives for the 2K Tunes landing page.
 *
 * Small on purpose: a band (the alternating full-width colour field), a
 * scroll-reveal wrapper, a pill CTA, the wordmark, and an eyebrow label. Every
 * section is composed from these so the rhythm stays consistent.
 */

import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { cn } from "@/lib/utils";

/* ── Band ───────────────────────────────────────────────────────────── */

const TONES = {
  ink: "bg-ink text-white",
  carbon: "bg-carbon text-white",
  bone: "bg-bone text-ink",
  clay: "bg-clay-deep text-bone",
  volt: "bg-volt text-white",
} as const;

export type Tone = keyof typeof TONES;

export function Band({
  id,
  tone = "bone",
  className,
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full scroll-mt-16 overflow-hidden py-20 md:py-24 lg:py-28",
        TONES[tone],
        className,
      )}
    >
      {children}
    </section>
  );
}

/* ── Reveal ─────────────────────────────────────────────────────────── */

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -8% 0px" }}
      transition={{ delay }}
      /* min-w-0 so a marquee child (w-max) can never stretch a grid column. */
      className={cn("min-w-0", className)}
    >
      {children}
    </motion.div>
  );
}

/* ── Type helpers ───────────────────────────────────────────────────── */

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("t-eyebrow", className)}>{children}</p>;
}

/** Centred section opener: eyebrow + headline + optional deck. */
export function Opener({
  eyebrow,
  title,
  deck,
  align = "center",
  tone = "dark",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  deck?: ReactNode;
  align?: "center" | "left";
  tone?: "dark" | "light";
  className?: string;
}) {
  const muted = tone === "dark" ? "text-white/55" : "text-ink/55";
  const dim = tone === "dark" ? "text-white/40" : "text-ink/40";

  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <Eyebrow className={cn("mb-5", dim)}>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="t-display">{title}</h2>
      </Reveal>
      {deck && (
        <Reveal delay={0.12}>
          <p className={cn("t-body mt-6", muted)}>{deck}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ── CTA pill ───────────────────────────────────────────────────────── */

type PillProps = {
  to?: string;
  href?: string;
  variant?: "light" | "dark" | "outlineLight" | "outlineDark" | "volt";
  size?: "md" | "lg";
  className?: string;
  children: ReactNode;
};

const PILL_VARIANTS = {
  light:
    "bg-white text-ink hover:bg-bone shadow-[0_10px_40px_-16px_rgba(255,255,255,0.5)]",
  dark: "bg-ink text-white hover:bg-slab",
  outlineLight:
    "border border-white/25 text-white hover:border-white hover:bg-white hover:text-ink",
  outlineDark:
    "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-white",
  volt: "bg-volt text-white hover:bg-volt-lit",
} as const;

export function Pill({
  to,
  href,
  variant = "light",
  size = "md",
  className,
  children,
}: PillProps) {
  const classes = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-all duration-300 active:scale-[0.97]",
    size === "lg" ? "h-14 px-8 text-[1.0625rem]" : "h-12 px-6 text-[0.9375rem]",
    PILL_VARIANTS[variant],
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}

/* ── Wordmark ───────────────────────────────────────────────────────── */

export function Wordmark({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-baseline gap-[0.11em] tracking-[-0.055em]",
        invert ? "text-ink" : "text-white",
        className,
      )}
    >
      <span className="font-black">2K</span>
      {/* The full stop is the single point of colour in the mark. */}
      <span className="font-extrabold">
        Tunes
        <span className={invert ? "text-volt" : "text-volt-lit"}>.</span>
      </span>
    </span>
  );
}

/* ── Card ───────────────────────────────────────────────────────────── */

export function Card({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-[28px] md:rounded-[32px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
