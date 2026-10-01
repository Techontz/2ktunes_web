import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toast — brief, non-blocking confirmation.
 *
 *   // once, near the root:
 *   <ToastProvider>…app…</ToastProvider>
 *
 *   // anywhere below:
 *   const { toast } = useToast();
 *   toast({ title: "Release submitted", description: "We'll email you when it's reviewed." });
 *   toast({ title: "Withdrawal failed", tone: "danger", duration: 8000 });
 *
 * Options: title, description?, tone "neutral" | "success" | "danger" | "info",
 *   duration ms (default 5000; 0 = stays until dismissed).
 * Toasts render in a polite live region (assertive for danger), pause while
 * hovered or focused, and each has a labelled dismiss button. Never put the
 * only copy of important information in a toast.
 */

type Tone = "neutral" | "success" | "danger" | "info";
type ToastOptions = {
  title: ReactNode;
  description?: ReactNode;
  tone?: Tone;
  duration?: number;
};
type ToastItem = ToastOptions & { id: number };

type Ctx = { toast: (o: ToastOptions) => number; dismiss: (id: number) => void };
const ToastContext = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const ICON: Record<Tone, ReactNode> = {
  neutral: <Info className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  danger: <AlertTriangle className="h-4 w-4" />,
};
const TONE: Record<Tone, string> = {
  neutral: "text-text-muted",
  info: "text-info",
  success: "text-success",
  danger: "text-danger",
};

function ToastView({
  item,
  onDismiss,
  dismissLabel,
}: {
  item: ToastItem;
  onDismiss: () => void;
  dismissLabel: string;
}) {
  const [paused, setPaused] = useState(false);
  const duration = item.duration ?? 5000;
  const remaining = useRef(duration);
  const started = useRef(Date.now());

  useEffect(() => {
    if (duration === 0 || paused) return;
    started.current = Date.now();
    const timer = setTimeout(onDismiss, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started.current;
    };
  }, [paused, duration, onDismiss]);

  const tone = item.tone ?? "neutral";
  return (
    <li
      role={tone === "danger" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full animate-slide-up items-start gap-3 rounded-card border border-border bg-surface-overlay p-4 text-text shadow-overlay"
    >
      <span aria-hidden className={cn("mt-0.5 shrink-0", TONE[tone])}>
        {ICON[tone]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.9375rem] font-semibold leading-snug">{item.title}</p>
        {item.description && (
          <p className="mt-1 text-body-sm text-text-muted">{item.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={dismissLabel}
        className="-m-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-text-subtle hover:bg-tint/[0.06] hover:text-text"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </li>
  );
}

export function ToastProvider({
  children,
  dismissLabel = "Dismiss notification",
  regionLabel = "Notifications",
}: {
  children: ReactNode;
  dismissLabel?: string;
  regionLabel?: string;
}) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);
  const toast = useCallback((o: ToastOptions) => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-3), { ...o, id }]);
    return id;
  }, []);
  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section aria-label={regionLabel} className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center p-4 sm:justify-end">
        <ol className="flex w-full max-w-sm flex-col gap-2">
          {items.map((item) => (
            <ToastView
              key={item.id}
              item={item}
              dismissLabel={dismissLabel}
              onDismiss={() => dismiss(item.id)}
            />
          ))}
        </ol>
      </section>
    </ToastContext.Provider>
  );
}
