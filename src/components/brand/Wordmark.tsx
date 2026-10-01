import { cn } from "@/lib/utils";

/**
 * The 2kTunes wordmark, set in type (no image request, crisp at any size).
 * The full stop is the mark's single point of colour.
 *
 * Props: invert (dark ink for light surfaces), className (size via text-*).
 */
export function Wordmark({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-baseline font-extrabold tracking-[-0.045em]",
        invert ? "text-ink" : "text-white",
        className,
      )}
    >
      <span className="font-black">2k</span>
      <span>Tunes</span>
      <span aria-hidden className={invert ? "text-volt" : "text-volt-lit"}>
        .
      </span>
    </span>
  );
}

export default Wordmark;
