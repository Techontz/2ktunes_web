import {
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * THE DASHBOARD'S SHARED PRIMITIVES
 * =================================
 *
 * These reuse the existing design system rather than introducing a second one:
 * the same Figtree/`.tunes` typography, the same `#050505` ground, the same
 * `bg-white/[0.03]` + `border-white/[0.11]` surface, the same 14px radius, and
 * the same accent roles the landing and auth screens already established —
 * volt for action, lime for settled/positive, amber for pending/attention,
 * clay for failure.
 *
 * No new tokens, no new fonts, no component library.
 */

/* ───────────────────────────────── TEXT ───────────────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="min-w-0">
        <p className="text-[0.5625rem] font-bold uppercase tracking-[0.22em] text-white/25">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.035em] text-white sm:text-[2.125rem]">
          {title}
        </h1>
        {lede && (
          <p className="mt-2.5 max-w-[46ch] text-[0.9375rem] font-medium leading-relaxed text-white/45">
            {lede}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.5625rem] font-bold uppercase tracking-[0.22em] text-white/25">
      {children}
    </p>
  );
}

/* ─────────────────────────────── SURFACES ─────────────────────────────── */

export function Panel({
  className,
  children,
  as: Tag = "div",
  ...rest
}: {
  className?: string;
  children: ReactNode;
  /** `form` and `li` are used often enough to be worth the polymorphism. */
  as?: "div" | "section" | "form" | "li";
} & Omit<React.FormHTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <Tag
      {...rest}
      className={cn(
        /* min-w-0: a grid/flex child defaults to min-width:auto, so a panel
           containing a row that can't shrink (a truncating title next to a
           badge) widens its own track and pushes the page into horizontal
           scroll. This is the fix at the container level; the rows inside carry
           their own min-w-0 for the same reason. */
        "min-w-0 rounded-[16px] border border-white/[0.08] bg-white/[0.022] p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A single figure. The value is a string the caller has already formatted — the
 * tile never does arithmetic, so it can't disagree with the API.
 */
export function StatTile({
  label,
  value,
  meta,
  tone = "default",
}: {
  label: string;
  value: string;
  meta?: ReactNode;
  tone?: "default" | "positive" | "attention";
}) {
  return (
    <Panel className="flex flex-col justify-between gap-5">
      <p className="text-[0.8125rem] font-semibold text-white/40">{label}</p>
      <div>
        <p
          className={cn(
            "text-[1.75rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums sm:text-[2rem]",
            tone === "positive" && "text-lime",
            tone === "attention" && "text-amber",
            tone === "default" && "text-white",
          )}
        >
          {value}
        </p>
        {meta && (
          <p className="mt-2 text-[0.75rem] font-medium text-white/30">{meta}</p>
        )}
      </div>
    </Panel>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "positive" | "attention" | "negative" | "accent";
}) {
  const tones: Record<string, string> = {
    neutral: "border-white/[0.12] bg-white/[0.04] text-white/55",
    positive: "border-lime/30 bg-lime/[0.08] text-lime",
    attention: "border-amber/30 bg-amber/[0.08] text-amber",
    negative: "border-clay/35 bg-clay/[0.08] text-clay",
    accent: "border-volt-lit/35 bg-volt/[0.12] text-volt-lit",
  };
  return (
    <span
      className={cn(
        // shrink-0 + nowrap: a badge is a fixed marker, so it must never be the
        // thing that decides a row's minimum width, nor break across lines.
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1",
        "text-[0.6875rem] font-bold uppercase tracking-[0.08em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/* ──────────────────────────────── CONTROLS ────────────────────────────── */

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-[12px] text-[0.875rem] font-bold " +
  "transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-volt-lit/70 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  busy = false,
  className,
  children,
  ...props
}: {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  busy?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary: "bg-volt text-white hover:bg-volt-lit",
    ghost:
      "border border-white/[0.11] text-white/70 hover:border-white/20 hover:bg-white/[0.05] hover:text-white",
    danger:
      "border border-clay/40 text-clay hover:border-clay/70 hover:bg-clay/[0.08]",
  };
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={cn(
        BUTTON_BASE,
        variants[variant],
        size === "sm" ? "h-9 px-3.5" : "h-11 px-5",
        className,
      )}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} aria-hidden />}
      {children}
    </button>
  );
}

const CONTROL =
  "w-full rounded-[12px] border bg-white/[0.03] px-3.5 text-[0.9375rem] font-medium text-white " +
  "transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-volt-lit/70 " +
  "placeholder:font-normal placeholder:text-white/25 disabled:cursor-not-allowed disabled:opacity-50";

export function Field({
  label,
  error,
  hint,
  className,
  ...input
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const describedBy = error ? `${id}-e` : hint ? `${id}-h` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.8125rem] font-semibold text-white/65">
        {label}
      </label>
      <input
        {...input}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          CONTROL,
          "h-[3rem]",
          error
            ? "border-clay/70 focus:border-clay"
            : "border-white/[0.11] hover:border-white/20 focus:border-volt",
          // file inputs need their own button treatment
          input.type === "file" &&
            "py-2.5 file:mr-3 file:rounded-[8px] file:border-0 file:bg-white/[0.08] file:px-3 file:py-1.5 file:text-[0.8125rem] file:font-semibold file:text-white/80",
        )}
      />
      {error ? (
        <p id={`${id}-e`} role="alert" className="mt-2 text-[0.75rem] font-medium text-clay">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-h`} className="mt-2 text-[0.75rem] font-medium text-white/30">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function SelectField({
  label,
  error,
  hint,
  className,
  children,
  ...select
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.8125rem] font-semibold text-white/65">
        {label}
      </label>
      <select
        {...select}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL,
          "h-[3rem] appearance-none bg-[#101010] pr-9",
          error
            ? "border-clay/70 focus:border-clay"
            : "border-white/[0.11] hover:border-white/20 focus:border-volt",
        )}
      >
        {children}
      </select>
      {error ? (
        <p role="alert" className="mt-2 text-[0.75rem] font-medium text-clay">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-[0.75rem] font-medium text-white/30">{hint}</p>
      ) : null}
    </div>
  );
}

/* ───────────────────────────── ASYNC STATES ───────────────────────────── */

export function Notice({
  tone = "attention",
  title,
  children,
  action,
}: {
  tone?: "attention" | "negative" | "accent" | "neutral";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const tones: Record<string, string> = {
    attention: "border-amber/25 bg-amber/[0.05] text-amber",
    negative: "border-clay/30 bg-clay/[0.05] text-clay",
    accent: "border-volt-lit/25 bg-volt/[0.07] text-volt-lit",
    neutral: "border-white/[0.1] bg-white/[0.03] text-white/70",
  };
  return (
    <div className={cn("rounded-[14px] border p-4 sm:p-5", tones[tone])}>
      <p className="text-[0.875rem] font-bold">{title}</p>
      {children && (
        <div className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-white/45">
          {children}
        </div>
      )}
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[12px] bg-white/[0.05]", className)}
      aria-hidden
    />
  );
}

/**
 * Renders the four states of a remote resource so no page invents its own.
 * `empty` is only consulted once data has actually arrived.
 */
export function DataState<T>({
  state,
  skeleton,
  empty,
  children,
}: {
  state: {
    data: T | null;
    loading: boolean;
    error: string | null;
    reload: () => void;
  };
  skeleton?: ReactNode;
  empty?: (data: T) => ReactNode;
  children: (data: T) => ReactNode;
}) {
  // `loading` is true only before the first result, so a reload after a write
  // leaves the current view (and any success message inside it) on screen.
  if (state.loading) {
    return (
      <>
        {skeleton ?? (
          <div className="space-y-3" role="status" aria-label="Loading">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}
      </>
    );
  }

  if (state.error) {
    return (
      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2.5 text-[0.875rem] font-semibold text-clay">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
          {state.error}
        </p>
        <Button variant="ghost" size="sm" onClick={state.reload}>
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
          Try again
        </Button>
      </Panel>
    );
  }

  if (!state.data) return null;

  const emptyNode = empty?.(state.data);
  if (emptyNode) return <>{emptyNode}</>;

  return <>{children(state.data)}</>;
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Panel className="flex flex-col items-center px-6 py-14 text-center">
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/[0.09] bg-white/[0.03] text-white/35"
        aria-hidden
      >
        {icon}
      </div>
      <p className="text-[1.0625rem] font-bold text-white">{title}</p>
      {children && (
        <p className="mt-2.5 max-w-[42ch] text-[0.875rem] font-medium leading-relaxed text-white/40">
          {children}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </Panel>
  );
}
