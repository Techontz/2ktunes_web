import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card — a bounded surface.
 *
 *   <Card>
 *     <CardHeader title="Balance" description="Updated daily" action={<Button size="sm">…</Button>} />
 *     <CardBody>…</CardBody>
 *     <CardFooter>…</CardFooter>
 *   </Card>
 *
 * Props
 *   variant  raised (default: white card on the light theme, deep purple in .theme-dark)
 *            | outline | sunken | light (always white)
 *            | accent (violet-tinted) — legacy "glass"/"dark" map to accent/sunken
 *   padding  none | sm | md | lg   (default md; use "none" with CardHeader/Body)
 *   interactive  adds hover affordance (for cards that are links)
 *   as       "div" | "section" | "article" | "li"
 */

const VARIANTS = {
  raised: "bg-surface-raised border border-border-subtle shadow-raised",
  outline: "bg-transparent border border-border",
  sunken: "bg-surface-sunken border border-border-subtle",
  light: "bg-white text-ink border border-line-light shadow-card-light",
  accent: "bg-accent-soft border border-accent/30",
} as const;

const PADDING = { none: "", sm: "p-4", md: "p-5 sm:p-6", lg: "p-6 sm:p-8" } as const;

export type CardVariant = keyof typeof VARIANTS | "glass" | "dark";

export function Card({
  variant = "raised",
  padding = "md",
  interactive,
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  variant?: CardVariant;
  padding?: keyof typeof PADDING;
  interactive?: boolean;
  as?: "div" | "section" | "article" | "li";
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  const v = variant === "glass" ? "accent" : variant === "dark" ? "sunken" : variant;
  return (
    <Tag
      {...rest}
      className={cn(
        "relative min-w-0 rounded-card",
        VARIANTS[v],
        PADDING[padding],
        interactive &&
          "lift hover:border-accent/30",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
  titleAs: H = "h3",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  titleAs?: "h2" | "h3" | "h4";
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
      <div className="min-w-0">
        <H className="text-h4 font-bold tracking-[-0.015em]">{title}</H>
        {description && <p className="mt-1 text-body-sm text-text-subtle">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={cn("px-5 py-5 sm:px-6", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 border-t border-border-subtle px-5 py-4 sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
