import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { WizardStep } from "./validation";

/**
 * Building blocks of the upload page: plain white cards with a bold heading
 * and a stable anchor, pill switches for short choices, selectable rows for
 * longer ones, and small text buttons. Nothing is folded away.
 */

/** Where `?step=` and the server report's steps scroll to. */
export const SECTION_OF: Record<WizardStep, string> = {
  stores: "stores",
  info: "info",
  artwork: "artwork",
  tracks: "tracks",
  credits: "credits",
  review: "review",
};

export const sectionId = (s: WizardStep) => `section-${SECTION_OF[s]}`;

export function FormCard({
  anchor,
  title,
  hint,
  aside,
  children,
  className,
  number,
  lead = false,
}: {
  /** Anchor id (section-...); the heading gets `${anchor}-title`. */
  anchor?: string;
  title: ReactNode;
  hint?: ReactNode;
  /** Shown at the right end of the heading row (wraps below on phones). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  /** The step number in the outlined circle (2 Artist, 3 Release details...). Extras such as Apple Music credits have none. */
  number?: number;
  /** The first section (Distribution): a larger heading, no circle (the step indicator sits right above it). */
  lead?: boolean;
}) {
  const auto = useId();
  const id = anchor ?? `card-${auto.replace(/:/g, "")}`;
  const indented = number != null;
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("min-w-0 scroll-mt-24 border-t border-nr-line pt-5", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2
          id={`${id}-title`}
          tabIndex={-1}
          className={cn(
            "flex items-center font-bold text-text focus:outline-none",
            lead ? "text-[1.5rem] tracking-[-0.025em] sm:text-[1.875rem] leading-[1.1]" : "gap-3 text-[1.25rem] tracking-[-0.02em] sm:gap-[1.125rem] sm:text-[1.4375rem] leading-[1.15]",
          )}
        >
          {indented && (
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e2dcef] bg-white text-[0.875rem] font-semibold tabular-nums tracking-normal text-accent-text"
            >
              {number}
            </span>
          )}
          {title}
        </h2>
        {aside}
      </div>
      {hint && (
        <p className={cn("max-w-[70ch] text-nr-muted", lead ? "mt-0" : "mt-1", lead ? "text-[0.875rem] sm:text-[0.9375rem]" : "text-[0.8125rem]", indented && "sm:pl-12")}>{hint}</p>
      )}
      <div className={cn(lead ? "mt-[0.8rem]" : "mt-1", indented && "sm:pl-12")}>{children}</div>
    </section>
  );
}

/** One block inside a numbered section (e.g. "Track 2" under Songs), split by a hairline. */
export function SubSection({ id, title, aside, children }: { id?: string; title: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0 border-t border-nr-line pt-6 first:border-t-0 first:pt-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h3 className="text-[0.9375rem] font-bold text-text">{title}</h3>
        {aside}
      </div>
      <div id={id}>{children}</div>
    </div>
  );
}

/** A thin rule between groups inside a card. */
export function Divider() {
  return <hr className="my-6 border-0 border-t border-nr-line" />;
}

/** A plain group of fields under a small subheading, separated by a rule. */
export function SubGroup({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("border-t border-nr-line pt-5", className)}>
      <h3 className="mb-4 text-body-sm font-bold text-text">{title}</h3>
      {children}
    </div>
  );
}

export type RadioOption<T extends string | boolean> = { value: T; label: ReactNode; hint?: ReactNode };

/** Native radios (visually hidden) as a pill switch or selectable rows. Arrow keys work. */
export function RadioList<T extends string | boolean>({
  legend,
  name,
  value,
  onChange,
  options,
  legendHidden,
  error,
  inline,
  disabled,
}: {
  legend: string;
  name: string;
  value: T | null;
  onChange: (v: T) => void;
  options: RadioOption<T>[];
  legendHidden?: boolean;
  error?: string | null;
  /** Options side by side (short labels such as No / Yes). */
  inline?: boolean;
  disabled?: boolean;
}) {
  return (
    <fieldset className="min-w-0" aria-invalid={error ? true : undefined} disabled={disabled}>
      <legend className={cn("mb-2 text-[0.8125rem] font-semibold text-text", legendHidden && "sr-only")}>{legend}</legend>
      {inline ? (
        /* Short choices (No / Yes, Existing / New) as a pill switch. */
        <div className={cn("inline-flex max-w-full flex-wrap gap-0.5 rounded-[8px] border border-nr-line bg-white p-[3px]", disabled && "opacity-55")}>
          {options.map((o) => {
            const on = value === o.value;
            return (
              <label
                key={String(o.value)}
                className={cn(
                  "whitespace-nowrap rounded-[6px] px-3.5 py-[0.4rem] text-[0.8125rem] font-semibold transition-[background-color,color] duration-150",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text",
                  disabled ? "cursor-not-allowed" : "cursor-pointer",
                  on ? "bg-nr-pick text-accent-text" : "text-nr-muted hover:text-text",
                )}
              >
                <input type="radio" name={name} checked={on} onChange={() => onChange(o.value)} className="sr-only" />
                {o.label}
              </label>
            );
          })}
        </div>
      ) : (
        /* Longer choices as selectable rows. */
        <div className="grid gap-2">
          {options.map((o) => {
            const on = value === o.value;
            return (
              <label
                key={String(o.value)}
                className={cn(
                  "flex min-h-10 items-start gap-3 rounded-[8px] border px-3.5 py-2.5 text-[0.875rem] text-text transition-colors duration-150",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text",
                  disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer",
                  on ? "border-nr-pick-line bg-nr-pick" : "border-nr-line bg-white hover:border-[#d6cde8]",
                )}
              >
                <input type="radio" name={name} checked={on} onChange={() => onChange(o.value)} className="sr-only" />
                <span
                  aria-hidden
                  className={cn(
                    "mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px]",
                    on ? "border-accent bg-white" : "border-nr-line-strong bg-white",
                  )}
                >
                  {on && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>
                <span className="min-w-0 break-words">
                  <span className={on ? "font-semibold" : undefined}>{o.label}</span>
                  {o.hint && <span className="block text-caption text-text-subtle">{o.hint}</span>}
                </span>
              </label>
            );
          })}
        </div>
      )}
      {error && <p className="mt-2 text-caption text-danger">{error}</p>}
    </fieldset>
  );
}

/** A No / Yes question as two radios side by side. */
export function YesNo({
  legend,
  name,
  value,
  onChange,
  yes,
  no,
}: {
  legend: string;
  name: string;
  value: boolean;
  onChange: (v: boolean) => void;
  yes: string;
  no: string;
}) {
  return (
    <RadioList<boolean>
      legend={legend}
      name={name}
      value={value}
      onChange={onChange}
      inline
      options={[
        { value: false, label: no },
        { value: true, label: yes },
      ]}
    />
  );
}

/** A small underlined text button ("Add another", "Copy to all tracks"). */
export function TextButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="text-[0.8125rem] font-semibold text-accent-text underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** The page-level name for a numbered section of the new release form. */
export const ReleaseSection = FormCard;
