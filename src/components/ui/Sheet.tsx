import { useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Portal, useFocusTrap, useScrollLock } from "./internal/overlay";

/**
 * Sheet (drawer) — a modal panel that slides in from an edge. Same
 * accessibility contract as Dialog: aria-modal, focus trap, Escape, backdrop
 * click, focus restore, scroll lock.
 *
 *   <Sheet open={open} onClose={close} side="right" title="Filters">…</Sheet>
 *
 * Props: open, onClose, title (visible, or `titleHidden` for sr-only),
 *   side "right" | "left" | "bottom", width? (CSS width for left/right,
 *   default min(24rem, 100vw)), header? (replaces the default title row but
 *   the title stays as the accessible name), children, footer?, closeLabel?,
 *   className? (panel).
 */
export function Sheet({
  open,
  onClose,
  title,
  titleHidden,
  side = "right",
  width = "min(24rem, 100vw)",
  header,
  footer,
  closeLabel = "Close",
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  titleHidden?: boolean;
  side?: "right" | "left" | "bottom";
  width?: string;
  header?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  className?: string;
  children?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `sheet${useId().replace(/:/g, "")}`;
  useScrollLock(open);
  useFocusTrap(panelRef, open, onClose);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[70]">
        <div aria-hidden className="absolute inset-0 animate-fade-in bg-night/55 backdrop-blur-[2px]" onClick={onClose} />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          style={side === "bottom" ? undefined : { width }}
          className={cn(
            "absolute flex flex-col bg-surface-overlay text-text shadow-overlay focus-visible:outline-none",
            side === "right" && "inset-y-0 right-0 animate-slide-in-right border-l border-border",
            side === "left" && "inset-y-0 left-0 animate-slide-in-left border-r border-border",
            side === "bottom" &&
              "inset-x-0 bottom-0 max-h-[88svh] animate-slide-up rounded-t-panel border-t border-border",
            className,
          )}
        >
          {header ? (
            <>
              <h2 id={titleId} className="sr-only">
                {title}
              </h2>
              {header}
            </>
          ) : (
            <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-3">
              <h2 id={titleId} className={cn("text-h4 font-bold", titleHidden && "sr-only")}>
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="-mr-2 ml-auto flex h-11 w-11 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-tint/[0.06] hover:text-text"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-t border-border-subtle p-4">{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}

export default Sheet;
