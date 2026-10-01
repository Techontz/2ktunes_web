import { cn } from "@/lib/utils";

/**
 * The official 2kTunes logo (mark + wordmark), from the brand files in
 * public/brand. Sizes in `em`, so the existing `text-[…]` size classes on
 * callers keep working: the mark is 1.3em tall, the wordmark 0.82em.
 *
 *   <Wordmark />                       auto: follows the surface (.theme-dark → light logo)
 *   <Wordmark tone="dark" />           for deep-purple surfaces (white mark)
 *   <Wordmark tone="light" />          for white / lavender surfaces (purple mark)
 *   <Wordmark variant="mark" />        the "2K" mark alone
 *   <Wordmark invert />                legacy alias of tone="light"
 *
 * Exposed to assistive tech once, as role="img" named "2kTunes" (the
 * <img> parts are alt="").
 */

type Tone = "auto" | "light" | "dark";

const SRC = {
  light: { mark: "/brand/mark-purple.webp", word: "/brand/wordmark-on-light.webp" },
  dark: { mark: "/brand/mark-white.webp", word: "/brand/wordmark-on-dark.webp" },
} as const;

function Lockup({
  tone,
  variant,
  className,
}: {
  tone: "light" | "dark";
  variant: "full" | "mark" | "wordmark";
  className?: string;
}) {
  const s = SRC[tone];
  return (
    <span className={cn("inline-flex shrink-0 select-none items-center gap-[0.42em] leading-none", className)}>
      {variant !== "wordmark" && (
        <img
          src={s.mark}
          alt=""
          width={384}
          height={285}
          draggable={false}
          className="block h-[1.3em] w-auto"
        />
      )}
      {variant !== "mark" && (
        <img
          src={s.word}
          alt=""
          width={560}
          height={90}
          draggable={false}
          className="block h-[0.82em] w-auto"
        />
      )}
    </span>
  );
}

export function Wordmark({
  className,
  invert = false,
  tone,
  variant = "full",
}: {
  className?: string;
  invert?: boolean;
  tone?: Tone;
  variant?: "full" | "mark" | "wordmark";
}) {
  const resolved: Tone = tone ?? (invert ? "light" : "auto");
  // One accessible name for the whole logo; the images themselves are alt="".
  if (resolved !== "auto")
    return (
      <span role="img" aria-label="2kTunes" className={cn("inline-flex leading-none", className)}>
        <Lockup tone={resolved} variant={variant} />
      </span>
    );
  // Auto: both lockups are rendered; CSS shows the one that suits the
  // surrounding surface (.theme-dark → white mark).
  return (
    <span role="img" aria-label="2kTunes" className={cn("inline-flex leading-none", className)}>
      <Lockup tone="light" variant={variant} className="[.theme-dark_&]:hidden" />
      <Lockup tone="dark" variant={variant} className="hidden [.theme-dark_&]:inline-flex" />
    </span>
  );
}

export default Wordmark;
