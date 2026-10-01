import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { useMuted, useTone } from "./kit";

/**
 * Destinations, shown as plain text names — never third-party logos or brand
 * colours. Store names are trademarks of their owners; 2kTunes delivers to
 * them through distribution partners and claims no partnership or
 * endorsement. Keep the disclaimer next to any rendering of this list.
 */
export const STORES: { name: string; kind: "stream" | "social" | "africa" }[] = [
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

export function StoreWall({ limit, className }: { limit?: number; className?: string }) {
  const { t } = useLanguage();
  const tone = useTone();
  const { subtle, line } = useMuted();
  const list = limit ? STORES.slice(0, limit) : STORES;
  return (
    <div className={className}>
      <ul
        className={cn(
          "grid grid-cols-2 overflow-hidden rounded-card border sm:grid-cols-3 lg:grid-cols-5",
          line,
        )}
      >
        {list.map((s) => (
          <li
            key={s.name}
            className={cn(
              "-mb-px -mr-px flex min-h-[4.5rem] items-center justify-center border-b border-r px-3 text-center text-[0.9375rem] font-bold tracking-[-0.01em] sm:min-h-[5.5rem] sm:text-[1.0625rem]",
              line,
              tone === "light" ? "text-ink" : "text-text",
            )}
          >
            {s.name}
          </li>
        ))}
      </ul>
      <p className={cn("mt-5 max-w-[60ch] text-[0.875rem] leading-relaxed", subtle)}>
        {t("stores.note")}
      </p>
      <p className={cn("mt-2 text-[0.8125rem]", subtle)}>{t("stores.disclaimer")}</p>
    </div>
  );
}
