import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ErrorState, Skeleton, Spinner } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Page scaffolding for dashboard screens.
 *
 *   <PageHeader title="Wallet" description="…" actions={<Button>…</Button>}
 *     back={{ to: "/dashboard/music", label: "Catalog" }} meta={<StatusPill …/>} />
 *   <Section title="Ledger" description="…" action={…}>…</Section>
 *   <LoadError error={state.error} onRetry={state.reload} />
 *   <PageLoading />                           // skeleton blocks + sr-only status
 */

export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-5 sm:mb-8", className)}>
      {back && (
        <Link
          to={back.to}
          className="mb-3 inline-flex items-center gap-1.5 rounded-[6px] text-body-sm font-semibold text-text-subtle transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="min-w-0 break-words text-[1.5rem] font-bold leading-tight tracking-[-0.03em] text-text text-balance sm:text-h1">
              {title}
            </h1>
            {meta}
          </div>
          {description && (
            <p className="mt-2 hidden max-w-[60ch] text-body-sm text-text-muted sm:block sm:text-body">{description}</p>
          )}
        </div>
        {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto max-sm:[&>a]:flex-1 max-sm:[&>button]:flex-1">{actions}</div>}
      </div>
    </header>
  );
}

export function Section({
  title,
  description,
  action,
  children,
  className,
  id,
  level = 2,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Heading level of the title (default h2; use 3 inside an h2 section). */
  level?: 2 | 3;
}) {
  const H = level === 3 ? "h3" : "h2";
  return (
    <section className={cn("min-w-0", className)} aria-labelledby={id && title ? `${id}-title` : undefined}>
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {title && (
              <H id={id ? `${id}-title` : undefined} className="text-h4 font-bold tracking-[-0.015em] text-text">
                {title}
              </H>
            )}
            {description && <p className="mt-1 text-body-sm text-text-subtle">{description}</p>}
          </div>
          {action && <div className="flex min-w-0 max-w-full flex-wrap gap-2">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageLoading({ rows = 3 }: { rows?: number }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only" role="status">
        {t("common.loading")}
      </span>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid gap-3 pt-2 sm:grid-cols-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function InlineLoading({ label }: { label?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center py-10 text-text-subtle">
      <Spinner label={label ?? t("common.loading")} />
    </div>
  );
}

export function LoadError({
  error,
  onRetry,
  title,
  compact,
}: {
  error: string | null;
  onRetry?: () => void;
  title?: string;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  if (!error) return null;
  return (
    <ErrorState
      title={title ?? t("err.load_title")}
      description={error}
      onRetry={onRetry}
      retryLabel={t("common.retry")}
      compact={compact}
    />
  );
}

/** Label/value pairs; wraps to one column on phones. */
export function DefinitionList({
  items,
  className,
  columns = 2,
}: {
  items: { label: ReactNode; value: ReactNode; hidden?: boolean }[];
  className?: string;
  columns?: 1 | 2 | 3;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columns >= 2 && "sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className,
      )}
    >
      {items
        .filter((i) => !i.hidden)
        .map((item, idx) => (
          <div key={idx} className="min-w-0">
            <dt className="text-caption font-medium text-text-subtle">{item.label}</dt>
            <dd className="mt-1 min-w-0 break-words text-body-sm text-text">{item.value}</dd>
          </div>
        ))}
    </dl>
  );
}

/** Form-level error/notice banner (role=alert). */
export function FormAlert({
  children,
  tone = "danger",
  className,
}: {
  children: ReactNode;
  tone?: "danger" | "warning" | "info" | "success";
  className?: string;
}) {
  if (!children) return null;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-control border px-4 py-3 text-body-sm",
        tone === "danger" && "border-danger/30 bg-danger-soft text-text",
        tone === "warning" && "border-warning/30 bg-warning-soft text-text",
        tone === "info" && "border-info/30 bg-info-soft text-text",
        tone === "success" && "border-success/30 bg-success-soft text-text",
        className,
      )}
    >
      {children}
    </div>
  );
}
