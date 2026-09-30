import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one input primitive the whole auth experience is built from.
 *
 * Restrained on purpose: a carbon surface, a hairline border, a 14px radius and
 * a violet border on focus. No pill shapes, no glow, no drop shadows — the field
 * should read as a product control, not a marketing element.
 *
 * Accessibility is structural rather than decorative: the label is a real
 * `<label>` bound by id, the error is wired through `aria-describedby` and
 * `aria-invalid`, and the reveal control is a real button with an accessible
 * name that changes with its state.
 */
export default function AuthField({
  label,
  error,
  hint,
  reveal = false,
  revealLabels,
  className,
  ...input
}: {
  label: string;
  error?: string;
  /** Small helper under the field. Only shown when there is no error. */
  hint?: React.ReactNode;
  /** Adds the show/hide password control. */
  reveal?: boolean;
  revealLabels?: { show: string; hide: string };
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block text-[0.875rem] font-semibold text-white/70"
      >
        {label}
      </label>

      <div className="relative">
        <input
          {...input}
          id={id}
          type={reveal ? (shown ? "text" : "password") : input.type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-[3.25rem] w-full rounded-[14px] border bg-white/[0.03] px-4 text-[1rem] font-medium text-white",
            "transition-colors duration-200",
            /* A box-shadow ring rather than an outline. `outline-none` on the
               element beat the base-layer rule, and Tailwind's `outline-2` sets
               only the width — so the style stayed `none` and every input was
               silently shipping with no visible focus ring. */
            "outline-none focus-visible:ring-2 focus-visible:ring-volt-lit/70",
            "placeholder:font-normal placeholder:text-white/25",
            reveal && "pr-12",
            error
              ? "border-clay/70 focus:border-clay"
              : "border-white/[0.11] hover:border-white/20 focus:border-volt",
          )}
        />

        {reveal && revealLabels && (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? revealLabels.hide : revealLabels.show}
            aria-pressed={shown}
            className="absolute right-1.5 top-1.5 flex h-10 w-10 items-center justify-center rounded-[10px] text-white/40 transition-colors hover:text-white/80"
          >
            {shown ? (
              <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
            )}
          </button>
        )}
      </div>

      {/* Errors replace hints rather than stacking, so the form never jumps by
          more than one line. */}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-[0.75rem] font-medium text-clay"
        >
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="mt-2">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
