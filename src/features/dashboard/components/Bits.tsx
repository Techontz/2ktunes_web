import { useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, FlaskConical } from "lucide-react";
import { Badge, Button, type BadgeTone } from "@/components/ui";
import type { Paginated } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { formatMinor, type MinorInput } from "@/lib/money";
import { cn } from "@/lib/utils";

/* ── Status pill ───────────────────────────────────────────────────── */

const TONE: Record<string, BadgeTone> = {
  draft: "neutral",
  submitted: "warning",
  under_review: "info",
  changes_requested: "warning",
  approved: "accent",
  scheduled: "accent",
  delivering: "info",
  delivered: "success",
  partially_delivered: "warning",
  live: "success",
  takedown_requested: "warning",
  taken_down: "neutral",
  rejected: "danger",
  pending: "warning",
  queued: "info",
  failed: "danger",
  requested: "warning",
  processing: "info",
  completed: "success",
  cancelled: "neutral",
  pending_payment: "warning",
  awaiting_creator: "info",
  accepted: "accent",
  in_progress: "info",
  revision_requested: "warning",
  declined: "danger",
  disputed: "danger",
  refunded: "neutral",
  awaiting_support: "info",
  awaiting_user: "warning",
  open: "info",
  resolved: "success",
  closed: "neutral",
  pending_review: "warning",
  suspended: "danger",
  invited: "warning",
  active: "success",
  inactive: "neutral",
  superseded: "neutral",
  confirmed: "success",
  expired: "neutral",
};

/** A translated status badge. Unknown values show humanised raw text. */
export function StatusPill({
  status,
  label,
  size = "sm",
  className,
}: {
  status: string | null | undefined;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { t } = useLanguage();
  const key = (status ?? "").toLowerCase();
  const translated = t(`status.${key}`);
  const text = label ?? (translated === `status.${key}` ? key.replace(/_/g, " ") : translated);
  return (
    <Badge tone={TONE[key] ?? "neutral"} dot size={size} className={className}>
      {text || "—"}
    </Badge>
  );
}

/* ── Sandbox / demo marker ─────────────────────────────────────────── */

/** Visible marker for rows the API flags `is_sandbox` (no real delivery/money). */
export function SandboxBadge({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <span title={t("badge.sandbox_hint")} className={cn("inline-flex", className)}>
      <Badge tone="warning" size="sm">
        <FlaskConical className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
        {t("badge.sandbox")}
        <span className="sr-only"> — {t("badge.sandbox_hint")}</span>
      </Badge>
    </span>
  );
}

/* ── Money ─────────────────────────────────────────────────────────── */

export function Money({
  minor,
  currency,
  signDisplay,
  className,
}: {
  minor: MinorInput;
  currency: string | null | undefined;
  signDisplay?: "auto" | "always";
  className?: string;
}) {
  const { locale } = useLanguage();
  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>
      {formatMinor(minor, currency, locale, { signDisplay })}
    </span>
  );
}

/* ── Pagination ────────────────────────────────────────────────────── */

export function Pagination({
  meta,
  onPage,
  className,
}: {
  meta: Paginated | null | undefined;
  onPage: (page: number) => void;
  className?: string;
}) {
  const { t } = useLanguage();
  if (!meta || meta.last_page <= 1) return null;
  return (
    <nav aria-label={t("act.pagination")} className={cn("mt-4 flex items-center justify-between gap-3", className)}>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<ChevronLeft />}
        disabled={meta.current_page <= 1}
        onClick={() => onPage(meta.current_page - 1)}
      >
        {t("act.previous")}
      </Button>
      <span className="text-body-sm text-text-subtle" aria-live="polite">
        {t("act.page_of", { page: meta.current_page, pages: meta.last_page })}
      </span>
      <Button
        variant="secondary"
        size="sm"
        rightIcon={<ChevronRight />}
        disabled={meta.current_page >= meta.last_page}
        onClick={() => onPage(meta.current_page + 1)}
      >
        {t("act.next")}
      </Button>
    </nav>
  );
}

/* ── Copy to clipboard ─────────────────────────────────────────────── */

export function CopyButton({
  value,
  label,
  size = "sm",
  variant = "secondary",
}: {
  value: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "secondary" | "ghost" | "outline";
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant={variant}
      size={size}
      leftIcon={copied ? <Check /> : <Copy />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard blocked — the value is visible on screen to copy by hand */
        }
      }}
    >
      <span aria-live="polite">{copied ? t("act.copied") : (label ?? t("act.copy"))}</span>
    </Button>
  );
}

/* ── Filter chips (single choice) ──────────────────────────────────── */

export function ChipGroup<V extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: V;
  onChange: (v: V) => void;
  options: { value: V; label: ReactNode; count?: number | null }[];
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 no-scrollbar", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-body-sm font-semibold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text",
              active
                ? "border-accent-text bg-accent-soft text-text"
                : "border-border bg-white/[0.03] text-text-muted hover:border-border-strong hover:text-text",
            )}
          >
            {o.label}
            {typeof o.count === "number" && (
              <span className={cn("tabular-nums", active ? "text-accent-text" : "text-text-subtle")}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Stat grid helper ──────────────────────────────────────────────── */

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}
