import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Instagram, Pause, Play, Youtube } from "lucide-react";
import { useLabels } from "@/features/dashboard/marketplace/labels";
import { shortMoney } from "@/features/growth/referralText";
import { fetchPublicCreators, fetchShowcase, type PublicCreator, type ShowcaseItem } from "@/lib/api/growth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Band, SectionHeader, TextLink } from "./kit";

/**
 * Two marketplace sections for the home page:
 *
 *  - CreatorsSlider (GET /public/creators): a gently auto-scrolling row of
 *    approved creators with photos, near the top of the page.
 *  - ShowcaseRail (GET /public/showcase): "Creators who move songs", a rail
 *    of vertical 9:16 reels. Uploaded videos autoplay muted only while on
 *    screen; external posts show a thumbnail and open the creator's page.
 *
 * Both hide themselves when empty (or when the API is unreachable), and
 * reduced motion turns every automatic movement off. Taps go to the
 * creator's profile; signed-out visitors go to sign-up first, with `next`.
 */

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Where a creator card leads: the profile, or sign-up first (then back via `next`). */
export function useCreatorHref() {
  const { status } = useAuth();
  return (slug: string) => {
    const path = `/dashboard/creators/${encodeURIComponent(slug)}`;
    return status === "authenticated" ? path : `/auth?mode=register&next=${encodeURIComponent(path)}`;
  };
}

function usePublic<T>(fetcher: (signal: AbortSignal) => Promise<T[]>) {
  const [items, setItems] = useState<T[] | null>(null);
  const ref = useRef(fetcher);
  ref.current = fetcher;
  useEffect(() => {
    const ctrl = new AbortController();
    ref
      .current(ctrl.signal)
      .then(setItems)
      .catch(() => setItems([]));
    return () => ctrl.abort();
  }, []);
  return items;
}

/* ── Creators slider ───────────────────────────────────────────────── */

const SPEED = 0.35; // px per frame: a slow drift, not a carousel

export function CreatorsSlider() {
  const { t } = useLanguage();
  const creators = usePublic((signal) => fetchPublicCreators({ signal }));
  const scroller = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [auto, setAuto] = useState(false);
  const resume = useRef<number | undefined>(undefined);

  // Gentle auto-scroll (ping-pong), paused on hover, touch or focus; off with reduced motion.
  useEffect(() => {
    const el = scroller.current;
    if (!el || !creators?.length || prefersReducedMotion() || paused) {
      setAuto(false);
      return;
    }
    if (el.scrollWidth <= el.clientWidth + 4) return;
    setAuto(true);
    let dir = 1;
    let pos = el.scrollLeft;
    let raf = 0;
    const step = () => {
      const max = el.scrollWidth - el.clientWidth;
      pos = Math.min(max, Math.max(0, pos + SPEED * dir));
      if (pos >= max - 0.5) dir = -1;
      else if (pos <= 0.5) dir = 1;
      el.scrollLeft = pos;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [creators, paused]);

  useEffect(() => () => window.clearTimeout(resume.current), []);

  const pause = useCallback(() => {
    window.clearTimeout(resume.current);
    setPaused(true);
  }, []);
  const resumeLater = useCallback((ms = 2500) => {
    window.clearTimeout(resume.current);
    resume.current = window.setTimeout(() => setPaused(false), ms);
  }, []);

  if (!creators || creators.length === 0) return null;

  const nudge = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    pause();
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    resumeLater(6000);
  };

  return (
    <section aria-labelledby="creators-rail-title" className="relative overflow-hidden bg-white pb-2 pt-8 text-text sm:pb-4 sm:pt-12" data-testid="creators-slider">
      <div className="shell">
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
          <div className="min-w-0">
            <h2 id="creators-rail-title" className="t-title">
              {t("creators.rail_title")}
            </h2>
            <p className="mt-1.5 hidden max-w-[40rem] text-body text-text-muted sm:block">{t("creators.rail_lede")}</p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label={t("creators.prev")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-text transition-colors hover:border-border-strong"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label={t("creators.next")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-text transition-colors hover:border-border-strong"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <ul
          ref={scroller}
          onMouseEnter={pause}
          onMouseLeave={() => resumeLater(800)}
          onTouchStart={pause}
          onTouchEnd={() => resumeLater(3000)}
          onFocus={pause}
          onBlur={() => resumeLater(1500)}
          className={cn(
            "-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-0 sm:gap-4 sm:px-0",
            // Snap fights programmatic drift, so it is only on while the row is still.
            auto ? "snap-none" : "snap-x snap-mandatory scroll-px-4 sm:scroll-px-0",
          )}
        >
          {creators.map((cr) => (
            <CreatorCard key={cr.slug} creator={cr} />
          ))}
        </ul>
        <TextLink to="/creators" className="mt-3 sm:mt-5">
          {t("creators.browse_all")}
        </TextLink>
      </div>
    </section>
  );
}

function CreatorCard({ creator: cr }: { creator: PublicCreator }) {
  const { t, locale } = useLanguage();
  const labels = useLabels();
  const href = useCreatorHref()(cr.slug);
  const price =
    cr.from_price_minor != null && cr.from_price_currency
      ? t("creators.from", { price: shortMoney(cr.from_price_minor, cr.from_price_currency, locale) })
      : null;
  return (
    <li className="w-[10.5rem] shrink-0 snap-start sm:w-[12.5rem]">
      <Link
        to={href}
        aria-label={t("creators.view", { name: cr.display_name })}
        className="group block rounded-[18px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
      >
        <span className="relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-[linear-gradient(160deg,#2a0f4a,#841dc6)] shadow-card-light">
          {cr.avatar_url && (
            <img
              src={cr.avatar_url}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(16_6_30/0.7))]" />
          {price && (
            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[0.75rem] font-bold text-brand-800 shadow">
              {price}
            </span>
          )}
        </span>
        <span className="mt-2.5 flex items-center gap-1 text-body-sm font-bold text-text">
          <span className="min-w-0 truncate">{cr.display_name}</span>
          {cr.verified && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-accent-text" aria-label={t("creators.verified")} role="img" />
          )}
        </span>
        {cr.categories.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-1">
            {cr.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-accent-text">
                {labels.category(cat)}
              </span>
            ))}
          </span>
        )}
      </Link>
    </li>
  );
}

/* ── Showcase reels ────────────────────────────────────────────────── */

export function ShowcaseRail() {
  const { t } = useLanguage();
  const items = usePublic((signal) => fetchShowcase({ signal }));
  if (!items || items.length === 0) return null;
  return (
    <Band tone="light" labelledBy="showcase-title">
      <div className="shell">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader id="showcase-title" title={t("showcase.title")} lede={t("showcase.lede")} />
          <TextLink to="/creators" className="shrink-0">
            {t("creators.browse_all")}
          </TextLink>
        </div>
        <ul
          className="-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-8 -mb-5 no-scrollbar sm:mx-0 sm:mt-10 sm:scroll-px-0 sm:gap-4 sm:px-0"
          data-testid="showcase-rail"
        >
          {items.map((item) => (
            <ReelCard key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </Band>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "instagram") return <Instagram className="h-3.5 w-3.5" aria-hidden />;
  if (platform === "youtube") return <Youtube className="h-3.5 w-3.5" aria-hidden />;
  if (platform === "tiktok")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.77a5.7 5.7 0 0 0-.77-.05 5.68 5.68 0 1 0 5.68 5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
      </svg>
    );
  return <Play className="h-3.5 w-3.5" aria-hidden />;
}

function ReelCard({ item }: { item: ShowcaseItem }) {
  const { t, locale } = useLanguage();
  const labels = useLabels();
  const href = useCreatorHref()(item.creator.slug);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const isUpload = !!item.video_src;
  const name = item.creator.display_name;
  const price =
    item.creator.from_price_minor != null && item.creator.from_price_currency
      ? t("creators.from", { price: shortMoney(item.creator.from_price_minor, item.creator.from_price_currency, locale) })
      : null;

  // Autoplay (muted) only while most of the card is on screen; never with reduced motion.
  useEffect(() => {
    const el = video.current;
    if (!el || !isUpload || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && !userPaused) {
          el.play().catch(() => {
            /* autoplay refused: the play button still works */
          });
        } else {
          el.pause();
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isUpload, userPaused]);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      setUserPaused(false);
      el.play().catch(() => {});
    } else {
      setUserPaused(true);
      el.pause();
    }
  };

  return (
    <li className="w-[62vw] max-w-[15rem] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] sm:max-w-none lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]">
      <article className="relative aspect-[9/16] overflow-hidden rounded-[20px] bg-[linear-gradient(160deg,#2a0f4a,#6e16a8)] shadow-[0_18px_40px_-20px_rgb(42_8_70/0.6)]">
        {isUpload ? (
          <video
            ref={video}
            src={item.video_src ?? undefined}
            poster={item.thumbnail_url ?? undefined}
            muted
            loop
            playsInline
            preload="none"
            aria-label={item.caption ?? name}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Link to={href} aria-label={t("showcase.open", { name })} className="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white">
            {item.thumbnail_url && (
              <img src={item.thumbnail_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </Link>
        )}

        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(16_6_30/0.35),transparent_28%,transparent_50%,rgb(16_6_30/0.9))]" />

        {/* Top: platform + play/pause */}
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-2">
          {!isUpload && item.platform ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[0.6875rem] font-semibold text-white backdrop-blur">
              <PlatformIcon platform={item.platform} />
              {labels.platform(item.platform)}
            </span>
          ) : (
            <span />
          )}
          {isUpload && (
            <button
              type="button"
              onClick={toggle}
              aria-label={t(playing ? "showcase.pause" : "showcase.play", { name })}
              aria-pressed={playing}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-white"
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="ml-0.5 h-4 w-4" aria-hidden />}
            </button>
          )}
        </div>

        {/* Bottom: creator, category, price, request */}
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          {item.caption && <p className="mb-2 line-clamp-2 text-[0.8125rem] font-medium text-white/90">{item.caption}</p>}
          <Link to={href} className="flex min-w-0 items-center gap-2 rounded-[8px] focus-visible:outline-2 focus-visible:outline-white">
            {item.creator.avatar_url ? (
              <img src={item.creator.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full border border-white/40 object-cover" />
            ) : (
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-[0.75rem] font-bold">
                {name.slice(0, 1)}
              </span>
            )}
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-body-sm font-bold">
                <span className="truncate">{name}</span>
                {item.creator.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-[#d6b4ff]" aria-label={t("creators.verified")} role="img" />}
              </span>
              {item.creator.categories[0] && (
                <span className="block truncate text-[0.6875rem] text-white/75">{labels.category(item.creator.categories[0])}</span>
              )}
            </span>
          </Link>
          {price && <p className="mt-2 truncate text-[0.75rem] font-semibold text-white/90">{price}</p>}
          <Link
            to={href}
            className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-full bg-white px-3 text-[0.8125rem] font-bold text-brand-800 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t("showcase.request")}
            <span className="sr-only">: {name}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          {item.views_count != null && item.views_count > 0 && (
            <p className="mt-1.5 text-[0.6875rem] text-white/65">{t("showcase.views", { views: formatCount(item.views_count, locale) })}</p>
          )}
        </div>
      </article>
    </li>
  );
}
