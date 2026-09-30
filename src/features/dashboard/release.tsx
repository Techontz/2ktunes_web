import { Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared release presentation.
 *
 * `status` is a plain string column and the upload endpoint only ever writes
 * 'pending'; anything else in there was set by an admin through Filament. So the
 * mapping below covers the values the system can actually produce and falls back
 * to neutral rather than inventing a state machine the backend doesn't have.
 */
export function releaseStatusTone(
  status: string | null | undefined,
): "neutral" | "positive" | "attention" | "negative" {
  switch ((status ?? "").toLowerCase()) {
    case "live":
    case "approved":
    case "distributed":
      return "positive";
    case "pending":
    case "in review":
    case "review":
      return "attention";
    case "rejected":
    case "declined":
    case "takedown":
      return "negative";
    default:
      return "neutral";
  }
}

/** Cover art with a typed placeholder — never a broken image box. */
export function Cover({
  src,
  className,
  size = 44,
}: {
  src: string | null | undefined;
  className?: string;
  size?: number;
}) {
  if (!src) {
    return (
      <span
        style={{ width: size, height: size }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.04] text-white/25",
          className,
        )}
        aria-hidden
      >
        <Disc3 style={{ width: size * 0.36, height: size * 0.36 }} strokeWidth={2} />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-[8px] object-cover", className)}
      loading="lazy"
    />
  );
}

export function formatReleaseDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
