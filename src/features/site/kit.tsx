import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Marketing-site building blocks. Every public page is composed from these so
 * rhythm, type and spacing stay identical from page to page.
 *
 *   Band           full-width tonal section (dark | raised | light | accent)
 *   SectionHeader  eyebrow + title + lede, left or centred
 *   PageHero       the opening band of every inner page
 *   FeatureGrid    icon + title + body cards
 *   Checklist      ticked list
 *   Faq            accessible disclosure list
 *   CtaBand        the closing call to action
 *   TextLink       arrowed inline link
 *   Reveal / useReveal   fade + slide-up on scroll (IntersectionObserver)
 *   Orbs, EqBars, ArtistPhoto   decorative brand motifs
 *
 * Tones: `dark` and `accent` render inside `.theme-dark`, so every role token
 * (text-muted, border-subtle, accent-text…) switches to its deep-purple value
 * automatically; `raised` (white) and `light` (lavender) use the light roles.
 */

export type Tone = "dark" | "raised" | "light" | "accent";
const ToneContext = createContext<Tone>("raised");
export const useTone = () => useContext(ToneContext);

export const isDarkTone = (tone: Tone) => tone === "dark" || tone === "accent";

const TONE_CLASS: Record<Tone, string> = {
  dark: "theme-dark bg-band text-text",
  raised: "bg-white text-text",
  light: "bg-bone text-text",
  accent: "theme-dark bg-brand text-white",
};

/** Muted/subtle text, lines and cards that stay ≥4.5:1 on each band. */
export function useMuted() {
  const tone = useTone();
  const accent = tone === "accent";
  return {
    muted: accent ? "text-white/90" : "text-text-muted",
    subtle: accent ? "text-white/90" : "text-text-subtle",
    line: accent ? "border-white/20" : "border-border-subtle",
    card: isDarkTone(tone)
      ? "bg-tint/[0.06] border border-white/12 backdrop-blur-sm"
      : "bg-surface-raised border border-border-subtle shadow-card-light",
    eyebrow: accent ? "text-white/90" : "text-accent-text",
  };
}

/* ── Scroll reveal ─────────────────────────────────────────────────── */

/**
 * Adds `data-shown="true"` once the element scrolls into view. Pair with the
 * `.reveal` class (index.css). Reduced motion, no IntersectionObserver
 * (tests, old engines) → shown immediately.
 */
function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-shown", "true");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.setAttribute("data-shown", "true");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  style,
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ── Decorative motifs ─────────────────────────────────────────────── */

/** Slow-drifting blurred brand-colour orbs (decorative). */
export function Orbs({ className, variant = "hero" }: { className?: string; variant?: "hero" | "band" }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <span className="absolute -right-[10%] -top-[20%] h-[34rem] w-[34rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(158_79_224/0.55),transparent_62%)] blur-2xl" />
      <span
        className="absolute -bottom-[25%] -left-[12%] h-[30rem] w-[30rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(132_29_198/0.45),transparent_62%)] blur-2xl"
        style={{ animationDelay: "-8s", animationDuration: "28s" }}
      />
      {variant === "hero" && (
        <span
          className="absolute left-[38%] top-[30%] h-[16rem] w-[16rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(247_147_30/0.16),transparent_65%)] blur-2xl"
          style={{ animationDelay: "-14s", animationDuration: "32s" }}
        />
      )}
    </div>
  );
}

const EQ = [0.55, 0.9, 0.4, 1, 0.7, 0.45, 0.85, 0.6, 0.95, 0.5, 0.75, 0.4];

/** Animated equaliser bars (decorative). */
export function EqBars({ className, bars = 12 }: { className?: string; bars?: number }) {
  return (
    <span aria-hidden className={cn("inline-flex h-6 items-end gap-[3px]", className)}>
      {EQ.slice(0, bars).map((h, i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom animate-eq rounded-full bg-current"
          style={{
            height: `${h * 100}%`,
            animationDelay: `${-i * 0.13}s`,
            animationDuration: `${0.9 + (i % 4) * 0.18}s`,
          }}
        />
      ))}
    </span>
  );
}

/** Responsive artist photo (owner's lifestyle shots 1–5 in public/images/artists). */
const ARTIST_PHOTOS = {
  1: { w: 736, h: 1308 },
  2: { w: 600, h: 1200 },
  3: { w: 736, h: 1313 },
  4: { w: 736, h: 1313 },
  5: { w: 564, h: 846 },
} as const;
type ArtistPhotoId = keyof typeof ARTIST_PHOTOS;

export function ArtistPhoto({
  id,
  className,
  sizes = "(min-width: 1024px) 22rem, 60vw",
  eager,
  position,
}: {
  id: ArtistPhotoId;
  className?: string;
  sizes?: string;
  eager?: boolean;
  position?: string;
}) {
  const { w, h } = ARTIST_PHOTOS[id];
  return (
    <img
      src={`/images/artists/artist-${id}-sm.webp`}
      srcSet={`/images/artists/artist-${id}-sm.webp 480w, /images/artists/artist-${id}-lg.webp ${w}w`}
      sizes={sizes}
      width={w}
      height={h}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : undefined}
      className={cn("block h-full w-full object-cover", className)}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}

/* ── Layout blocks ─────────────────────────────────────────────────── */

export function Band({
  tone = "dark",
  id,
  className,
  children,
  labelledBy,
  decor = true,
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
  /** Orbs on dark bands (default on). */
  decor?: boolean;
}) {
  return (
    <ToneContext.Provider value={tone}>
      <section
        id={id}
        aria-labelledby={labelledBy}
        className={cn("relative scroll-mt-20 overflow-hidden section-y", TONE_CLASS[tone], className)}
      >
        {decor && tone === "dark" && <Orbs variant="band" className="opacity-70" />}
        {tone === "light" && (
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-lavender-grid opacity-60 [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />
        )}
        <div className="relative">{children}</div>
      </section>
    </ToneContext.Provider>
  );
}

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  const { eyebrow } = useMuted();
  return (
    <p className={cn("t-eyebrow inline-flex items-center gap-2", eyebrow, className)}>
      <span aria-hidden className="h-[2px] w-5 rounded-full bg-current opacity-70" />
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  as: H = "h2",
  id,
  className,
  size = "display",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  size?: "display" | "title";
}) {
  const { muted } = useMuted();
  return (
    <Reveal
      className={cn(
        align === "center" ? "mx-auto max-w-[44rem] text-center" : "max-w-[40rem]",
        className,
      )}
    >
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <H id={id} className={size === "display" ? "t-display" : "t-title"}>
        {title}
      </H>
      {lede && <p className={cn("t-lead mt-5", muted)}>{lede}</p>}
    </Reveal>
  );
}

const HERO_PHOTOS: ArtistPhotoId[] = [1, 3, 4, 2, 5];

export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  aside,
  tone = "dark",
  photo,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lede: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: Tone;
  /** Artist photo shown softly behind the right side when there is no aside. */
  photo?: ArtistPhotoId;
}) {
  const dark = isDarkTone(tone);
  return (
    <ToneContext.Provider value={tone}>
      <section
        className={cn(
          "relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36",
          dark ? "theme-dark bg-hero text-text" : TONE_CLASS[tone],
        )}
      >
        {dark && <Orbs />}
        {dark && !aside && photo && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] md:block"
            style={{
              maskImage: "linear-gradient(90deg, transparent 0%, #000 50%), linear-gradient(180deg, #000 65%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 50%), linear-gradient(180deg, #000 65%, transparent 100%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          >
            <ArtistPhoto id={photo} eager sizes="48vw" className="opacity-60 mix-blend-luminosity" position="50% 25%" />
            <span className="absolute inset-0 bg-[linear-gradient(135deg,rgb(132_29_198/0.45),rgb(26_11_46/0.35))] mix-blend-color" />
          </div>
        )}
        <div
          className={cn(
            "shell relative grid items-center gap-12",
            aside && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16",
          )}
        >
          <div className="min-w-0 animate-slide-up">
            <HeroText eyebrow={eyebrow} title={title} lede={lede} />
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
          </div>
          {aside && <div className="min-w-0 animate-fade-in">{aside}</div>}
        </div>
      </section>
    </ToneContext.Provider>
  );
}

export { HERO_PHOTOS };

function HeroText({ eyebrow, title, lede }: { eyebrow: ReactNode; title: ReactNode; lede: ReactNode }) {
  const { muted } = useMuted();
  return (
    <>
      <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
      <h1 className="t-hero max-w-[16ch]">{title}</h1>
      <p className={cn("t-lead mt-6 max-w-[38rem]", muted)}>{lede}</p>
    </>
  );
}

export type Feature = { icon?: ReactNode; title: ReactNode; body: ReactNode; tag?: ReactNode };

export function FeatureGrid({
  items,
  columns = 3,
  className,
}: {
  items: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const { muted, card } = useMuted();
  const tone = useTone();
  return (
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {items.map((f, i) => (
        <Reveal
          as="li"
          key={i}
          delay={(i % 4) * 80}
          className={cn(
            "group flex min-w-0 flex-col rounded-card p-6",
            card,
            isDarkTone(tone) ? "transition-colors duration-300 hover:bg-tint/[0.1]" : "lift hover:border-accent/25",
          )}
        >
          {(f.icon || f.tag) && (
            <div className="mb-5 flex items-start justify-between gap-3">
              {f.icon && (
                <span
                  aria-hidden
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-[12px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 [&>svg]:h-5 [&>svg]:w-5",
                    isDarkTone(tone)
                      ? "bg-accent-soft text-accent-text"
                      : "bg-[linear-gradient(135deg,#9e4fe0,#6e16a8)] text-white shadow-[0_8px_18px_-8px_rgb(132_29_198/0.7)]",
                  )}
                >
                  {f.icon}
                </span>
              )}
              {f.tag}
            </div>
          )}
          <h3 className="t-card">{f.title}</h3>
          <p className={cn("t-body mt-2.5", muted)}>{f.body}</p>
        </Reveal>
      ))}
    </ul>
  );
}

export function Checklist({ items, className }: { items: ReactNode[]; className?: string }) {
  const { muted } = useMuted();
  const tone = useTone();
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item, i) => (
        <Reveal as="li" key={i} delay={i * 60} className={cn("flex gap-3 t-body", muted)}>
          <span
            aria-hidden
            className={cn(
              "mt-[0.3em] flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
              isDarkTone(tone) ? "bg-accent-soft text-accent-text" : "bg-accent text-white",
            )}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="min-w-0">{item}</span>
        </Reveal>
      ))}
    </ul>
  );
}

type FaqItem = { q: string; a: ReactNode };

/** Disclosure list: real buttons with aria-expanded/aria-controls. */
export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId().replace(/:/g, "");
  const { muted, line } = useMuted();
  return (
    <div className={cn("border-t", line, className)}>
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <div key={i} className={cn("border-b", line)}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`${base}-${i}`}
                id={`${base}-${i}-btn`}
                onClick={() => setOpen(expanded ? null : i)}
                className="group flex w-full items-start justify-between gap-6 py-5 text-left text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] transition-colors hover:text-accent-text"
              >
                <span className="min-w-0">{item.q}</span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                    expanded
                      ? "border-accent bg-accent text-white"
                      : "border-border-strong text-text-muted group-hover:border-accent-text group-hover:text-accent-text",
                  )}
                >
                  {expanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
            </h3>
            <div
              id={`${base}-${i}`}
              role="region"
              aria-labelledby={`${base}-${i}-btn`}
              hidden={!expanded}
              className={cn("t-body max-w-[62ch] animate-fade-in pb-6 pr-10", muted)}
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TextLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  const tone = useTone();
  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-sm font-semibold underline-offset-4 hover:underline",
        tone === "accent" ? "text-white" : "text-accent-text",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}

/** The closing call to action used at the bottom of every page. */
export function CtaBand({
  title,
  lede,
  secondary,
}: {
  title: ReactNode;
  lede?: ReactNode;
  secondary?: { label: string; to: string };
}) {
  const { t } = useLanguage();
  return (
    <Band tone="accent" className="!py-0">
      <div className="shell grid items-center gap-10 py-16 md:grid-cols-[minmax(0,1fr)_auto] md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <Reveal className="max-w-[38rem]">
          <EqBars className="mb-6 h-7 text-white/80" />
          <h2 className="t-display">{title}</h2>
          {lede && <p className="t-lead mt-4 text-white/90">{lede}</p>}
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button to="/auth?mode=register" variant="inverse" size="lg" shape="pill">
              {t("cta.release")}
            </Button>
            {secondary && (
              <Button to={secondary.to} variant="outline" size="lg" shape="pill" className="text-white">
                {secondary.label}
              </Button>
            )}
          </div>
        </Reveal>
        <div aria-hidden className="relative hidden h-[19rem] lg:block">
          <div className="absolute right-[42%] top-6 h-[15rem] w-[10.5rem] rotate-[-6deg] overflow-hidden rounded-[22px] border-4 border-white/15 shadow-overlay">
            <ArtistPhoto id={4} sizes="11rem" position="50% 20%" />
          </div>
          <div className="absolute right-2 top-0 h-[17rem] w-[11.5rem] rotate-[5deg] animate-float-slow overflow-hidden rounded-[22px] border-4 border-white/20 shadow-overlay">
            <ArtistPhoto id={5} sizes="12rem" position="50% 30%" />
          </div>
        </div>
      </div>
    </Band>
  );
}

/** Two-column band: copy on one side, a visual on the other. */
export function Split({
  children,
  visual,
  reverse,
  className,
}: {
  children: ReactNode;
  visual: ReactNode;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20", className)}>
      <div className={cn("min-w-0", reverse && "lg:order-2")}>{children}</div>
      <Reveal delay={120} className={cn("min-w-0", reverse && "lg:order-1")}>
        {visual}
      </Reveal>
    </div>
  );
}
