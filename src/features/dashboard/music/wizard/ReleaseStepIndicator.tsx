import { Fragment } from "react";
import { Check } from "lucide-react";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY } from "../copy";
import { useStepCompletion } from "./ReviewStep";
import { RELEASE_STEPS, useReleaseSteps } from "./steps";

/**
 * 1 Distribution, 2 Artist ... 7 Review. The current step is a filled purple
 * circle with a bold label, finished steps show a tick, the rest are grey
 * outlines. Every step is a button that scrolls to its section.
 * Phones get a compact version: the current step's name and seven dots.
 */
export function ReleaseStepIndicator({ className }: { className?: string }) {
  const c = useCopy(COPY);
  const { active, jump } = useReleaseSteps();
  const done = useStepCompletion();
  const total = RELEASE_STEPS.length;
  const name = (k: string) => c.stepNames[k] ?? k;

  return (
    <nav aria-label={c.stepsLabel} className={cn("@container min-w-0", className)}>
      {/* Desktop and tablet: the full row. */}
      <ol className="hidden items-center md:flex lg:pr-4">
        {RELEASE_STEPS.map((s, i) => {
          const current = i === active;
          const finished = done[s.key] && !current;
          return (
            <Fragment key={s.key}>
              {i > 0 && <li aria-hidden className="mx-2.5 h-px min-w-3 flex-1 bg-nr-line @min-[50rem]:mx-3 @min-[60rem]:mx-4" />}
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={current ? "step" : undefined}
                  className="group flex items-center gap-2.5 rounded-full py-1 pr-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text xl:gap-3"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-semibold tabular-nums transition-colors",
                      current
                        ? "bg-accent text-white outline outline-4 outline-accent/12"
                        : finished
                          ? "border border-accent bg-accent-soft text-accent-text"
                          : "border border-[#d9d4e6] bg-white text-nr-muted group-hover:border-accent/50",
                    )}
                  >
                    {finished ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  {/* Narrow rows show only the current step's name; the others keep it for screen readers. */}
                  <span
                    className={cn(
                      "whitespace-nowrap text-[0.75rem] leading-none",
                      current ? "font-bold text-text" : finished ? "font-medium text-text" : "font-medium text-nr-muted group-hover:text-text",
                      !current && "sr-only @min-[50rem]:not-sr-only",
                    )}
                  >
                    {name(s.key)}
                    {(current || finished) && <span className="sr-only">{`, ${current ? c.stepCurrent : c.stepDone}`}</span>}
                  </span>
                </button>
              </li>
            </Fragment>
          );
        })}
      </ol>

      {/* Phones: current step, then a dot per step (each one jumps there). */}
      <div className="md:hidden">
        <p className="flex items-baseline gap-2 text-body-sm">
          <span className="font-bold text-text">{name(RELEASE_STEPS[active].key)}</span>
          <span className="text-caption text-nr-muted">{c.stepOf(active + 1, total)}</span>
        </p>
        <ol className="mt-2.5 flex items-center gap-1.5">
          {RELEASE_STEPS.map((s, i) => {
            const current = i === active;
            return (
              <li key={s.key} className="flex-1">
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={current ? "step" : undefined}
                  aria-label={`${i + 1}. ${name(s.key)}${current ? `, ${c.stepCurrent}` : done[s.key] ? `, ${c.stepDone}` : ""}`}
                  className="flex h-6 w-full items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 w-full rounded-full",
                      current ? "bg-accent" : done[s.key] ? "bg-accent/45" : "bg-[#e6e1f0]",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
