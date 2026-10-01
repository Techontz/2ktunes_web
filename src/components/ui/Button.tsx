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
 *   size      sm | md | lg
 *   shape     default (10px radius) | pill (marketing CTAs only)
 *   loading   boolean — shows a spinner, disables, sets aria-busy
 *   leftIcon / rightIcon  ReactNode, rendered aria-hidden
 *   fullWidth boolean
 */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "inverse";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-[0_8px_22px_-10px_rgb(132_29_198/0.7)] hover:bg-accent-hover hover:shadow-[0_12px_28px_-10px_rgb(132_29_198/0.8)] active:bg-accent-pressed disabled:bg-accent/50",
  secondary:
    "border border-border bg-surface-raised text-text shadow-[0_1px_2px_rgb(42_8_70/0.05)] hover:border-border-strong hover:bg-surface-hover",
  outline:
    "border border-current/25 bg-transparent text-current hover:border-current/50 hover:bg-current/[0.06]",
  ghost: "bg-transparent text-current hover:bg-current/[0.08]",
  danger: "bg-[#c2261b] text-white hover:bg-[#a91f15] active:bg-[#8f1a12]",
  inverse: "bg-white text-brand-800 shadow-[0_8px_24px_-12px_rgb(26_11_46/0.5)] hover:bg-brand-50 active:bg-brand-100",
};

const SIZES: Record<ButtonSize, string> = {
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

type ButtonProps = AsButton | AsRouterLink | AsAnchor | AsChild;

function buttonClasses({
  variant = "primary",
  size = "md",
  shape = "default",
  fullWidth,
  className,
}: Pick<CommonProps, "variant" | "size" | "shape" | "fullWidth" | "className">) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-semibold tracking-[-0.01em]",
    "transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-200 ease-out hover:-translate-y-px active:translate-y-0",
    "disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text",
    shape === "pill" ? "rounded-full" : "rounded-control",
    VARIANTS[variant],
    SIZES[size],
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
