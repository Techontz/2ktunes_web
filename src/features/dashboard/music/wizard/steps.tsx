import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * The seven steps of the new release page, in the order the step indicator
 * shows them. The page stays one scrolling form: each step is a section with
 * a stable anchor, and the tracker follows the scroll position so the
 * indicator and the bottom bar always name the section on screen.
 *
 * Artwork lives in the sticky right column on desktop, so it never wins on
 * scroll there; clicking it (or "Continue to Artwork") still selects it.
 */
export const RELEASE_STEPS = [
  { key: "distribution", anchor: "section-stores" },
  { key: "artist", anchor: "section-artist" },
  { key: "details", anchor: "section-info" },
  { key: "tracks", anchor: "section-tracks" },
  { key: "profiles", anchor: "section-profiles" },
  { key: "artwork", anchor: "section-artwork" },
  { key: "review", anchor: "section-review" },
] as const;

export type ReleaseStepKey = (typeof RELEASE_STEPS)[number]["key"];

/** Pixels below the top of the window where a section counts as "current". */
const LINE = 180;

type Ctx = { active: number; jump: (i: number) => void };
const StepContext = createContext<Ctx | null>(null);

export function useReleaseSteps(): Ctx {
  const ctx = useContext(StepContext);
  if (!ctx) throw new Error("useReleaseSteps outside StepTracker");
  return ctx;
}

/** Scroll to a step's section and focus its heading (screen readers land there too). */
export function scrollToStep(i: number) {
  const anchor = RELEASE_STEPS[i]?.anchor;
  if (!anchor) return;
  const el = document.getElementById(anchor);
  el?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  (document.getElementById(`${anchor}-title`) ?? el)?.focus?.({ preventScroll: true });
}

/** True when the element sits in a sticky column (desktop cover panel). */
function inStickyColumn(el: HTMLElement): boolean {
  const col = el.closest<HTMLElement>("[data-sticky-column]");
  return !!col && getComputedStyle(col).position === "sticky";
}

export function StepTracker({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  // After a click the smooth scroll passes other sections; ignore them until it settles.
  const lockedUntil = useRef(0);

  const measure = useCallback(() => {
    if (Date.now() < lockedUntil.current) return;
    const doc = document.documentElement;
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
      setActive(RELEASE_STEPS.length - 1);
      return;
    }
    let current = 0;
    RELEASE_STEPS.forEach((s, i) => {
      const el = document.getElementById(s.anchor);
      if (!el || inStickyColumn(el)) return;
      if (el.getBoundingClientRect().top <= LINE) current = i;
    });
    setActive(current);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  const jump = useCallback((i: number) => {
    const n = Math.max(0, Math.min(RELEASE_STEPS.length - 1, i));
    lockedUntil.current = Date.now() + 900;
    setActive(n);
    scrollToStep(n);
  }, []);

  const value = useMemo(() => ({ active, jump }), [active, jump]);
  return <StepContext.Provider value={value}>{children}</StepContext.Provider>;
}
