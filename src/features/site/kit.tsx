import { createContext, useContext, useId, useState, type ReactNode } from "react";
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
 */

export type Tone = "dark" | "raised" | "light" | "accent";
const ToneContext = createContext<Tone>("dark");
export const useTone = () => useContext(ToneContext);

const TONE_CLASS: Record<Tone, string> = {
  dark: "bg-surface text-text",
  raised: "bg-[#131316] text-text",
  light: "bg-bone text-ink",
  accent: "bg-volt text-white",
};

/** Muted/subtle text that stays ≥4.5:1 on each band. */
export function useMuted() {
  const tone = useTone();
  return {
    muted: tone === "light" ? "text-ink-muted" : tone === "accent" ? "text-white/85" : "text-text-muted",
    subtle: tone === "light" ? "text-ink-subtle" : tone === "accent" ? "text-white/85" : "text-text-subtle",
    line: tone === "light" ? "border-line-light" : tone === "accent" ? "border-white/20" : "border-border-subtle",
    card:
      tone === "light"
        ? "bg-white border border-line-light shadow-card-light"
        : tone === "accent"
          ? "bg-white/10 border border-white/15"
          : "bg-surface-raised border border-border-subtle",
    eyebrow: tone === "light" ? "text-volt" : tone === "accent" ? "text-white/90" : "text-accent-text",
  };
}

export function Band({
  tone = "dark",
  id,
  className,
  children,
  labelledBy,
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <ToneContext.Provider value={tone}>
      <section
        id={id}
        aria-labelledby={labelledBy}
        className={cn("relative scroll-mt-20 section-y", TONE_CLASS[tone], className)}
      >
        {children}
      </section>
    </ToneContext.Provider>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  const { eyebrow } = useMuted();
  return <p className={cn("t-eyebrow", eyebrow, className)}>{children}</p>;
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
    <div
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
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  aside,
  tone = "dark",
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lede: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: Tone;
}) {
  return (
    <ToneContext.Provider value={tone}>
      <section
        className={cn(
          "relative overflow-hidden border-b border-border-subtle pb-16 pt-28 md:pb-24 md:pt-36",
          TONE_CLASS[tone],
        )}
      >
        <div
          className={cn(
            "shell grid items-center gap-12",
            aside && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16",
          )}
        >
          <div className="min-w-0">
            <HeroText eyebrow={eyebrow} title={title} lede={lede} />
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
      </section>
    </ToneContext.Provider>
  );
}

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
        <li key={i} className={cn("flex min-w-0 flex-col rounded-card p-6", card)}>
          {(f.icon || f.tag) && (
            <div className="mb-5 flex items-start justify-between gap-3">
              {f.icon && (
                <span
                  aria-hidden
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-control [&>svg]:h-5 [&>svg]:w-5",
                    tone === "light" ? "bg-volt/10 text-volt" : "bg-accent-soft text-accent-text",
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
        </li>
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
        <li key={i} className={cn("flex gap-3 t-body", muted)}>
          <span
            aria-hidden
            className={cn(
              "mt-[0.3em] flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
              tone === "light" ? "bg-volt text-white" : "bg-accent-soft text-accent-text",
            )}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type FaqItem = { q: string; a: ReactNode };

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
                className="flex w-full items-start justify-between gap-6 py-5 text-left text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em]"
              >
                <span className="min-w-0">{item.q}</span>
                <span aria-hidden className="mt-0.5 shrink-0 opacity-70">
                  {expanded ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </span>
              </button>
            </h3>
            <div
              id={`${base}-${i}`}
              role="region"
              aria-labelledby={`${base}-${i}-btn`}
              hidden={!expanded}
              className={cn("t-body max-w-[62ch] pb-6 pr-10", muted)}
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
        tone === "light" ? "text-volt" : tone === "accent" ? "text-white" : "text-accent-text",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
    <Band tone="accent" className="!py-16 md:!py-20">
      <div className="shell flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-[36rem]">
          <h2 className="t-display">{title}</h2>
          {lede && <p className="t-lead mt-4 text-white/85">{lede}</p>}
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button to="/auth?mode=register" variant="inverse" size="lg" shape="pill">
            {t("cta.release")}
          </Button>
          {secondary && (
            <Button to={secondary.to} variant="outline" size="lg" shape="pill" className="text-white">
              {secondary.label}
            </Button>
          )}
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
      <div className={cn("min-w-0", reverse && "lg:order-1")}>{visual}</div>
    </div>
  );
}
