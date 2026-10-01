import { useId, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Portal, useFocusTrap, useScrollLock } from "./internal/overlay";

/**
 * Dialog — a modal window.
 *
 *   const [open, setOpen] = useState(false);
 *   <Dialog open={open} onClose={() => setOpen(false)}
 *     title="Withdraw funds" description="Paid to your default method"
 *     footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button>Confirm</Button></>}>
 *     …body…
 *   </Dialog>
 *
 * Accessibility: role="dialog" + aria-modal, labelled by the title and
 * described by the description; focus moves in on open (to `initialFocusRef`
 * or the first focusable element), Tab is trapped, Escape and backdrop click
 * call onClose (disable with `dismissible={false}` for destructive flows in
 * progress), and focus returns to the trigger on close. Body scroll is locked.
 *
 * Props: open, onClose, title, description?, children, footer?, size sm|md|lg,
 *   dismissible? (default true), closeLabel? (default "Close"),
 *   initialFocusRef?, role? "dialog" | "alertdialog".
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
  closeLabel = "Close",
  initialFocusRef,
  role = "dialog",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  dismissible?: boolean;
  closeLabel?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  role?: "dialog" | "alertdialog";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const titleId = `dlg${id}-title`;
  const descId = `dlg${id}-desc`;

  useScrollLock(open);
  useFocusTrap(panelRef, open, dismissible ? onClose : undefined, initialFocusRef);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          aria-hidden
          className="absolute inset-0 animate-fade-in bg-night/60 backdrop-blur-[2px]"
          onClick={dismissible ? onClose : undefined}
        />
        <div
          ref={panelRef}
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={cn(
            "relative flex max-h-[92svh] w-full animate-slide-up flex-col overflow-hidden max-sm:max-h-[94svh]",
            "rounded-t-panel border border-border bg-surface-overlay text-text shadow-overlay sm:rounded-panel",
            size === "sm" && "sm:max-w-sm",
            size === "md" && "sm:max-w-lg",
            size === "lg" && "sm:max-w-2xl",
            "focus-visible:outline-none",
          )}
        >
          {/* Grab handle: on phones the dialog is a bottom sheet. */}
          <span aria-hidden className="mx-auto mt-2 block h-1 w-10 shrink-0 rounded-full bg-tint/[0.18] sm:hidden" />
          <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-3 sm:px-6 sm:pt-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-[1.25rem] font-bold leading-tight tracking-[-0.02em] sm:text-h3">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1.5 text-body-sm text-text-muted">
                  {description}
                </p>
              )}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-text-subtle transition-colors hover:bg-tint/[0.06] hover:text-text"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            )}
          </div>
          {children && (
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-body-sm text-text-muted sm:px-6">
              {children}
            </div>
          )}
          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t border-border-subtle px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:pb-4 [&>*]:max-sm:h-12 [&>*]:max-sm:w-full">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
