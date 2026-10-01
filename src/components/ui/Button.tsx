import {
  cloneElement,
  isValidElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

/**
 * Button — the one clickable control.
 *
 * Renders a <button>, a router <Link> (`to`), a plain <a> (`href`), or styles
 * its single child (`asChild`) — so a link that looks like a button is still a
 * link to assistive tech.
 *
 *   <Button>Save</Button>
 *   <Button variant="secondary" size="sm" leftIcon={<Plus />}>Add</Button>
 *   <Button to="/auth?mode=register" shape="pill" size="lg">Release Your Music</Button>
 *   <Button href="mailto:hi@2ktunes.com" variant="outline">Email us</Button>
 *   <Button loading>Saving…</Button>           // disabled + aria-busy + spinner
 *   <Button asChild><label htmlFor="f">Upload</label></Button>
 *
 * Props
 *   variant   primary | secondary | outline | ghost | danger | inverse
 *             (legacy aliases: "yellow" → primary)
 *   size      sm | md | lg  (legacy "xl" → lg)
 *   shape     default (10px radius) | pill (marketing CTAs only)
 *   loading   boolean — shows a spinner, disables, sets aria-busy
 *   leftIcon / rightIcon  ReactNode, rendered aria-hidden
 *   fullWidth boolean
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "inverse"
  | "yellow";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Exclude<ButtonVariant, "yellow">, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-pressed disabled:bg-accent/50",
  secondary:
    "border border-border bg-white/[0.06] text-text hover:border-border-strong hover:bg-white/[0.1]",
  outline:
    "border border-current/25 bg-transparent text-current hover:border-current/50 hover:bg-current/[0.06]",
  ghost: "bg-transparent text-current hover:bg-current/[0.08]",
  danger: "bg-[#d23a1f] text-white hover:bg-[#bf321a] active:bg-[#a82b16]",
  inverse: "bg-white text-ink hover:bg-bone-2 active:bg-bone",
};

const SIZES: Record<Exclude<ButtonSize, "xl">, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-[0.875rem]",
  md: "h-11 gap-2 px-5 text-[0.9375rem]",
  lg: "h-12 gap-2 px-6 text-[1rem]",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: "default" | "pill";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
};

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    to?: undefined;
    href?: undefined;
    asChild?: false;
    ref?: Ref<HTMLButtonElement>;
  };
type AsRouterLink = CommonProps &
  Omit<LinkProps, keyof CommonProps> & {
    to: LinkProps["to"];
    href?: undefined;
    asChild?: false;
    ref?: Ref<HTMLAnchorElement>;
  };
type AsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
    to?: undefined;
    asChild?: false;
    ref?: Ref<HTMLAnchorElement>;
  };
type AsChild = CommonProps & {
  asChild: true;
  children: ReactElement<{ className?: string }>;
  to?: undefined;
  href?: undefined;
};

export type ButtonProps = AsButton | AsRouterLink | AsAnchor | AsChild;

export function buttonClasses({
  variant = "primary",
  size = "md",
  shape = "default",
  fullWidth,
  className,
}: Pick<CommonProps, "variant" | "size" | "shape" | "fullWidth" | "className">) {
  const v = variant === "yellow" ? "primary" : variant;
  const s = size === "xl" ? "lg" : size;
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-semibold tracking-[-0.01em]",
    "transition-[background-color,border-color,color,opacity,transform] duration-150 active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text",
    shape === "pill" ? "rounded-full" : "rounded-control",
    VARIANTS[v],
    SIZES[s],
    fullWidth && "w-full",
    className,
  );
}

function Content({
  loading,
  leftIcon,
  rightIcon,
  children,
}: Pick<CommonProps, "loading" | "leftIcon" | "rightIcon" | "children">) {
  return (
    <>
      {loading ? (
        <Spinner size="sm" />
      ) : leftIcon ? (
        <span aria-hidden className="inline-flex shrink-0 [&>svg]:h-4 [&>svg]:w-4">
          {leftIcon}
        </span>
      ) : null}
      {children}
      {rightIcon && (
        <span aria-hidden className="inline-flex shrink-0 [&>svg]:h-4 [&>svg]:w-4">
          {rightIcon}
        </span>
      )}
    </>
  );
}

export function Button(props: ButtonProps) {
  const {
    variant,
    size,
    shape,
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth,
    className,
    children,
    ...rest
  } = props;
  const classes = buttonClasses({ variant, size, shape, fullWidth, className });

  if ("asChild" in rest && rest.asChild) {
    if (!isValidElement<{ className?: string }>(children)) return null;
    return cloneElement(children, {
      className: cn(classes, children.props.className),
    });
  }

  if ("to" in rest && rest.to !== undefined) {
    const { asChild: _a, ...linkProps } = rest as Omit<AsRouterLink, keyof CommonProps>;
    return (
      <Link {...linkProps} className={classes}>
        <Content leftIcon={leftIcon} rightIcon={rightIcon}>
          {children}
        </Content>
      </Link>
    );
  }

  if ("href" in rest && rest.href !== undefined) {
    const { asChild: _a, ...anchorProps } = rest as Omit<AsAnchor, keyof CommonProps>;
    return (
      <a {...anchorProps} className={classes}>
        <Content leftIcon={leftIcon} rightIcon={rightIcon}>
          {children}
        </Content>
      </a>
    );
  }

  const {
    asChild: _a,
    type = "button",
    disabled,
    ...buttonProps
  } = rest as Omit<AsButton, keyof CommonProps>;
  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      <Content loading={loading} leftIcon={leftIcon} rightIcon={rightIcon}>
        {children}
      </Content>
    </button>
  );
}

export default Button;
