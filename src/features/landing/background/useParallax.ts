import { useEffect, type RefObject } from "react";

/**
 * Pointer parallax for the artist-system background.
 *
 * The whole system moves from a single pair of CSS custom properties written on
 * one element. Each layer then consumes them inside its own transform with its
 * own depth multiplier:
 *
 *     transform: translate3d(calc(var(--px) * 1.5), calc(var(--py) * 1.5), 0)
 *
 * That means one JS write per animation frame no matter how many panels are on
 * screen, and every layer's movement is composited by CSS on the GPU. A
 * per-panel motion value would have meant a dozen springs all ticking.
 *
 * Travel is capped at `range` px (default 12) so nothing ever drifts out of its
 * safe visual area, and the listener is never attached at all when the user has
 * asked for reduced motion.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  { range = 12, enabled = true }: { range?: number; enabled?: boolean } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    // Coarse pointers have no hover position to track.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      // Ease toward the pointer so the system glides instead of snapping.
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      el.style.setProperty("--px", `${currentX.toFixed(2)}px`);
      el.style.setProperty("--py", `${currentY.toFixed(2)}px`);

      // Park the loop once the motion is visually settled.
      if (
        Math.abs(targetX - currentX) < 0.05 &&
        Math.abs(targetY - currentY) < 0.05
      ) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      // Pointer right → system drifts left, which reads as depth.
      targetX = -((e.clientX / window.innerWidth) * 2 - 1) * range;
      targetY = -((e.clientY / window.innerHeight) * 2 - 1) * range;
      wake();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    };
  }, [ref, range, enabled]);
}
