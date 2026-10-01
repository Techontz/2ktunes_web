import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Feedback";

/**
 * Display primitives: Stat, Avatar, ProgressBar, Stepper.
 *
 * Stat — a KPI tile.
 *   <Stat label="Available balance" value="TZS 1,240,000" hint="Updated today"
 *     delta="+12%" deltaTone="up" icon={<Wallet />} loading={false} />
 *   Props: label, value, hint?, delta?, deltaTone? up|down|neutral, icon?,
 *   loading?, className.
 *
 * Avatar — image with initials fallback (also used when the image fails).
 *   <Avatar name="Neema Said" src={url} size="md" />
 *   Props: name (required: alt text + initials), src?, size xs|sm|md|lg, square?.
 *
 * ProgressBar — determinate progress, role="progressbar" with value text.
 *   <ProgressBar value={42} label="Uploading master" showValue />
 *   Props: value, max? (100), label (accessible name; visible unless
 *   labelHidden), showValue?, tone accent|success|warning|danger, size sm|md.
 *
 * Stepper — ordered steps with the current one marked aria-current="step".
 *   <Stepper current={1} steps={[{ id: "a", label: "Upload", description: "…" }, …]} />
 *   Props: steps, current (0-based), orientation horizontal|vertical,
 *   ariaLabel?, completedLabel?. Horizontal collapses to vertical below `sm`.
 */

/* ── Stat ─────────────────────────────────────────────────────────── */

export function Stat({
  label,
  value,
  hint,
  delta,
  deltaTone = "neutral",
  icon,
  loading,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  delta?: ReactNode;
  deltaTone?: "up" | "down" | "neutral";
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-card border border-border-subtle bg-surface-raised p-5 shadow-raised",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-body-sm font-medium text-text-subtle">{label}</p>
        {icon && (
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent-soft text-accent-text [&>svg]:h-4 [&>svg]:w-4"
          >
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-32" />
      ) : (
        <p className="mt-2 truncate text-[1.625rem] font-bold leading-tight tracking-[-0.025em] tabular-nums text-text">
          {value}
        </p>
      )}
      {(delta || hint) && !loading && (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-caption text-text-subtle">
          {delta && (
            <span
              className={cn(
                "font-semibold",
                deltaTone === "up" && "text-success",
                deltaTone === "down" && "text-danger",
              )}
            >
              {delta}
            </span>
          )}
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── Avatar ───────────────────────────────────────────────────────── */

const AVATAR = {
  xs: "h-6 w-6 text-[0.625rem]",
  sm: "h-8 w-8 text-[0.6875rem]",
  md: "h-10 w-10 text-[0.8125rem]",
  lg: "h-14 w-14 text-[1rem]",
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = "md",
  square,
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof AVATAR;
  square?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const shape = square ? "rounded-[8px]" : "rounded-full";
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={cn("shrink-0 object-cover", AVATAR[size], shape, className)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-accent-soft font-bold text-accent-text",
        AVATAR[size],
        shape,
        className,
      )}
    >
      <span aria-hidden>{initials(name)}</span>
    </span>
  );
}

/* ── ProgressBar ──────────────────────────────────────────────────── */

const BAR_TONE = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  labelHidden,
  showValue,
  tone = "accent",
  size = "md",
  className,
}: {
  value: number;
  max?: number;
  label: string;
  labelHidden?: boolean;
  showValue?: boolean;
  tone?: keyof typeof BAR_TONE;
  size?: "sm" | "md";
  className?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), max);
  const pct = max > 0 ? Math.round((clamped / max) * 100) : 0;
  return (
    <div className={cn("min-w-0", className)}>
      {(!labelHidden || showValue) && (
        <div className="mb-2 flex items-baseline justify-between gap-3 text-body-sm">
          <span className={cn("truncate text-text-muted", labelHidden && "sr-only")}>{label}</span>
          {showValue && <span className="tabular-nums text-text">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={`${pct}%`}
        className={cn(
          "w-full overflow-hidden rounded-full bg-tint/[0.08]",
          size === "sm" ? "h-1.5" : "h-2",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", BAR_TONE[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Stepper ──────────────────────────────────────────────────────── */

export type Step = { id: string; label: ReactNode; description?: ReactNode };

export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  ariaLabel = "Progress",
  completedLabel = "completed",
  className,
}: {
  steps: Step[];
  current: number;
  orientation?: "horizontal" | "vertical";
  ariaLabel?: string;
  /** Screen-reader suffix for finished steps (pass a translation). */
  completedLabel?: string;
  className?: string;
}) {
  const horizontal = orientation === "horizontal";
  return (
    <ol
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col gap-4",
        horizontal && "sm:flex-row sm:gap-0",
        className,
      )}
    >
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={step.id}
            aria-current={active ? "step" : undefined}
            className={cn("relative flex min-w-0 gap-3", horizontal && "sm:flex-1 sm:flex-col sm:gap-3 sm:pr-4")}
          >
            <div className={cn("flex items-center", horizontal && "sm:w-full")}>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-bold",
                  done && "bg-accent text-white",
                  active && "bg-accent-soft text-accent-text ring-2 ring-inset ring-accent",
                  !done && !active && "border border-border-strong text-text-subtle",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
              </span>
              {horizontal && i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn("ml-3 hidden h-px flex-1 sm:block", done ? "bg-accent" : "bg-border")}
                />
              )}
            </div>
            <div className="min-w-0">
              <p className={cn("text-body-sm font-semibold", active || done ? "text-text" : "text-text-subtle")}>
                {step.label}
                {done && <span className="sr-only"> ({completedLabel})</span>}
              </p>
              {step.description && (
                <p className="mt-0.5 text-caption text-text-subtle">{step.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
