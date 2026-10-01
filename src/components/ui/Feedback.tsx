import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

/**
 * Loading, empty and error states — every data view needs all three.
 *
 *   <Skeleton className="h-5 w-40" />            one bar
 *   <SkeletonText lines={3} />                   a paragraph placeholder
 *
 *   <EmptyState icon={<Disc3 />} title="No releases yet"
 *     description="Your first release will appear here."
 *     action={<Button to="/dashboard/upload">Upload</Button>} />
 *
 *   <ErrorState title="Couldn't load earnings" description={error}
 *     onRetry={reload} retryLabel="Try again" />
 *
 * Skeleton: className (size it), rounded? sm|md|full. Decorative
 *   (aria-hidden); wrap the loading region in aria-busy yourself or use a
 *   Spinner with a label.
 * EmptyState: icon?, title, description?, action?, compact?, className.
 * ErrorState: title, description?, onRetry?, retryLabel?, retrying?,
 *   compact?, className. Uses role="alert".
 */

export function Skeleton({
  className,
  rounded = "md",
}: {
  className?: string;
  rounded?: "sm" | "md" | "full";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-shimmer bg-tint/[0.07]",
        rounded === "sm" && "rounded-[4px]",
        rounded === "md" && "rounded-[8px]",
        rounded === "full" && "rounded-full",
        className,
      )}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span aria-hidden className={cn("block space-y-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-3/5" : "w-full")} />
      ))}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-border-strong/70 bg-surface-raised/60 text-center",
        compact ? "px-5 py-8" : "px-6 py-14",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-control bg-accent-soft text-accent-text [&>svg]:h-5 [&>svg]:w-5"
      >
        {icon ?? <Inbox />}
      </span>
      <h3 className="mt-4 text-h4 font-bold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-[42ch] text-body-sm text-text-subtle">{description}</p>
      )}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  retrying,
  compact,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-card border border-danger/25 bg-danger-soft/40 text-center",
        compact ? "px-5 py-8" : "px-6 py-12",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-control bg-danger-soft text-danger"
      >
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-h4 font-bold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-[46ch] text-body-sm text-text-muted">{description}</p>
      )}
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onRetry}
          loading={retrying}
          leftIcon={<RefreshCw />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
