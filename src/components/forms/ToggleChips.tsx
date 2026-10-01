import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A fieldset of toggle chips (aria-pressed buttons) for picking several
 * values from a short list — categories, languages. `max` disables the
 * remaining chips once reached.
 */
export function ToggleChips({
  legend,
  hint,
  options,
  value,
  onChange,
  max,
  error,
}: {
  legend: string;
  hint?: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  error?: string | null;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-[0.875rem] font-semibold text-text-muted">{legend}</legend>
      {hint && <p className="mb-2 text-[0.8125rem] text-text-subtle">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          const disabled = !on && value.length >= max;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-body-sm font-semibold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:opacity-45",
                on
                  ? "border-accent-text bg-accent-soft text-text"
                  : "border-border bg-white/[0.03] text-text-muted hover:border-border-strong hover:text-text",
              )}
            >
              {on && <Check className="h-3.5 w-3.5" aria-hidden />}
              {o.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
