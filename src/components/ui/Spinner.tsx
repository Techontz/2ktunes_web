import { cn } from "@/lib/utils";

/**
 * Spinner — an indeterminate activity indicator.
 *
 *   <Spinner />                       decorative (inside a busy button)
 *   <Spinner label="Loading plans" /> announced to screen readers
 *
 * Props: size "sm" | "md" | "lg", label?: string, className.
 */
const SIZES = { sm: "h-4 w-4 border-[1.5px]", md: "h-5 w-5 border-2", lg: "h-8 w-8 border-2" };

export function Spinner({
  size = "md",
  label,
  className,
}: {
  size?: keyof typeof SIZES;
  label?: string;
  className?: string;
}) {
  const circle = (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent opacity-80",
        SIZES[size],
        className,
      )}
    />
  );
  if (!label) return circle;
  return (
    <span role="status" className="inline-flex items-center">
      {circle}
      <span className="sr-only">{label}</span>
    </span>
  );
}
