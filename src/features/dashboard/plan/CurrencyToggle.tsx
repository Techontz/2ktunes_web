import { useId, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * TZS | USD segmented control (a radio group: arrow keys move and select).
 * Used above the plan cards and at the top of the pay dialog.
 */
export function CurrencyToggle({
  value,
  options,
  onChange,
  label,
  size = "md",
  className,
}: {
  value: string;
  options: string[];
  onChange: (currency: string) => void;
  /** Accessible name of the group. */
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  if (options.length < 2) return null;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = options.indexOf(value);
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = options[(i + step + options.length) % options.length];
    onChange(next);
    document.getElementById(`${id}-${next}`)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-full border border-border bg-surface p-0.5", className)}
    >
      {options.map((cur) => {
        const on = cur === value;
        return (
          <button
            key={cur}
            id={`${id}-${cur}`}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(cur)}
            onKeyDown={onKeyDown}
            className={cn(
              "rounded-full font-bold tracking-[0.02em] transition-colors",
              size === "sm" ? "min-w-[3.5rem] px-3 py-1 text-[0.8125rem]" : "min-w-[4.25rem] px-4 py-1.5 text-[0.875rem]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              on ? "bg-accent text-white" : "text-text-muted hover:bg-surface-hover hover:text-text",
            )}
          >
            {cur}
          </button>
        );
      })}
    </div>
  );
}
