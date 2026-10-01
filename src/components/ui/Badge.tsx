import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Badge / StatusBadge.
 *
 *   <Badge tone="accent">New</Badge>
 *   <StatusBadge status="pending" />             // "Pending review", amber, with dot
 *   <StatusBadge status="distributed" label="Live" />
 *
 * Badge props: tone neutral | accent | success | warning | danger | info,
 *   dot?: boolean, size sm | md, className.
 * StatusBadge props: status (release / payout / campaign states, unknown
 *   values render neutral with the raw text), label? overrides the text.
 *   Colour is never the only signal — the text always states the status.
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

const STATUS: Record<string, { tone: BadgeTone; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  pending: { tone: "warning", label: "Pending review" },
  submitted: { tone: "warning", label: "Submitted" },
  reviewing: { tone: "info", label: "In review" },
  in_review: { tone: "info", label: "In review" },
  changes_requested: { tone: "warning", label: "Changes requested" },
  approved: { tone: "accent", label: "Approved" },
  processing: { tone: "info", label: "Processing" },
  delivering: { tone: "info", label: "Delivering" },
  distributed: { tone: "success", label: "Live" },
  live: { tone: "success", label: "Live" },
  active: { tone: "success", label: "Active" },
  completed: { tone: "success", label: "Completed" },
  paid: { tone: "success", label: "Paid" },
  rejected: { tone: "danger", label: "Rejected" },
  failed: { tone: "danger", label: "Failed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  taken_down: { tone: "neutral", label: "Taken down" },
  expired: { tone: "neutral", label: "Expired" },
};

export function StatusBadge({
  status,
  label,
  size,
  className,
}: {
  status: string;
  label?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  const key = status.toLowerCase().replace(/[\s-]+/g, "_");
  const meta = STATUS[key] ?? { tone: "neutral" as const, label: status.replace(/_/g, " ") };
  return (
    <Badge tone={meta.tone} dot size={size} className={className}>
      {label ?? meta.label}
    </Badge>
  );
}

export default Badge;
