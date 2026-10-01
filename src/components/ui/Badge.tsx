import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Badge.
 *
 *   <Badge tone="accent">New</Badge>
 *   <Badge tone="success" dot>Live</Badge>
 *
 * Props: tone neutral | accent | success | warning | danger | info,
 *   dot?: boolean, size sm | md, className.
 * Colour is never the only signal — the text always states the status.
 */

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-tint/[0.07] text-text-muted ring-1 ring-inset ring-border-subtle",
  accent: "bg-accent-soft text-accent-text ring-1 ring-inset ring-accent/15",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

export function Badge({
  tone = "neutral",
  dot,
  size = "md",
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[0.6875rem]" : "px-2.5 py-1 text-[0.75rem]",
        TONES[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      <span className="truncate">{children}</span>
    </span>
  );
}
