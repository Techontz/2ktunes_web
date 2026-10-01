import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { isDarkTone, Reveal, useMuted, useTone } from "./kit";

/**
 * Destinations, shown as plain text names — never third-party logos or brand
 * colours. Store names are trademarks of their owners; 2kTunes delivers to
 * them through distribution partners and claims no partnership or
 * endorsement. Keep the disclaimer next to any rendering of this list.
 */
const STORES: { name: string; kind: "stream" | "social" | "africa" }[] = [
  { name: "Spotify", kind: "stream" },
  { name: "Apple Music", kind: "stream" },
  { name: "YouTube Music", kind: "stream" },
  { name: "TikTok", kind: "social" },
  { name: "Instagram", kind: "social" },
  { name: "Facebook", kind: "social" },
  { name: "Boomplay", kind: "africa" },
  { name: "Audiomack", kind: "africa" },
  { name: "Deezer", kind: "stream" },
  { name: "Amazon Music", kind: "stream" },
  { name: "Tidal", kind: "stream" },
  { name: "Anghami", kind: "stream" },
  { name: "Shazam", kind: "stream" },
  { name: "Pandora", kind: "stream" },
  { name: "SoundCloud", kind: "stream" },
];

const KIND_DOT = { stream: "bg-accent", social: "bg-brand-400", africa: "bg-orange" } as const;

export function StoreWall({ limit, className }: { limit?: number; className?: string }) {
  const { t } = useLanguage();
  const tone = useTone();
  const { subtle } = useMuted();
  const list = limit ? STORES.slice(0, limit) : STORES;
  const dark = isDarkTone(tone);
  return (
    <div className={className}>
      <ul className="flex flex-wrap gap-2 sm:grid sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {list.map((s, i) => (
          <Reveal
            as="li"
            key={s.name}
            delay={(i % 5) * 50}
            className={cn(
              "group flex h-10 items-center justify-center gap-2 rounded-full border px-3.5 text-center text-[0.875rem] font-bold tracking-[-0.01em] transition-[transform,box-shadow,border-color,color] duration-300 hover:-translate-y-1 sm:h-auto sm:min-h-[5rem] sm:gap-2.5 sm:rounded-card sm:px-3 sm:text-[1.0625rem]",
              dark
                ? "border-white/12 bg-tint/[0.06] text-text hover:border-accent-text/50"
                : "border-border-subtle bg-surface-raised text-text shadow-card-light hover:border-accent/30 hover:text-accent-text hover:shadow-card-hover",
            )}
          >
            <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0 sm:h-2 sm:w-2 rounded-full transition-transform group-hover:scale-125", KIND_DOT[s.kind])} />
            <span className="min-w-0">{s.name}</span>
          </Reveal>
        ))}
      </ul>
      <p className={cn("mt-6 hidden max-w-[60ch] text-[0.875rem] leading-relaxed sm:block", subtle)}>{t("stores.note")}</p>
      <p className={cn("mt-4 text-[0.75rem] sm:mt-2 sm:text-[0.8125rem]", subtle)}>{t("stores.disclaimer")}</p>
    </div>
  );
}

/**
 * Decorative marquee of destination names for dark heroes. aria-hidden: the
 * same list is announced by <StoreWall> further down the page.
 */
export function StoreMarquee({ className }: { className?: string }) {
  const names = STORES.map((s) => s.name);
  const row = (key: string) => (
    <ul key={key} className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12">
      {names.map((n) => (
        <li key={n} className="flex items-center gap-8 whitespace-nowrap sm:gap-12">
          <span className="text-[1rem] font-bold tracking-[-0.01em] text-white/75 sm:text-[1.125rem]">{n}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400/70" />
        </li>
      ))}
    </ul>
  );
  return (
    <div aria-hidden className={cn("fade-x overflow-hidden", className)}>
      <div className="flex w-max animate-rail">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
