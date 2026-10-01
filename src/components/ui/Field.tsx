import {
  createContext,
  useContext,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Form primitives: Field + Input / PasswordInput / Textarea / Select / Checkbox
 * / RadioCardGroup.
 *
 * <Field> owns the label, hint and error and hands the control its id and
 * aria wiring through context, so a control can never be rendered unlabelled
 * by accident:
 *
 *   <Field label="Email" hint="We'll never share it" error={errors.email}>
 *     <Input type="email" value={v} onChange={…} />
 *   </Field>
 *
 * Field props: label (ReactNode, required), hint?, error?, required?,
 *   optional? (shows "Optional"), labelHidden? (visually hidden label),
 *   optionalLabel? (localised "Optional" text), id?, className.
 * The error replaces the hint (the form never grows by two lines) and is
 * announced via role="alert". Controls get aria-invalid + aria-describedby.
 *
 * Every control also works standalone (pass id / aria-* yourself).
 */

type FieldContextValue = {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required?: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);
export const useFieldContext = () => useContext(FieldContext);

export function Field({
  label,
  hint,
  error,
  required,
  optional,
  optionalLabel = "Optional",
  labelHidden,
  id: idProp,
  className,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  optional?: boolean;
  optionalLabel?: string;
  labelHidden?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const autoId = useId();
  const id = idProp ?? `f${autoId.replace(/:/g, "")}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: !!error, required }}>
      <div className={cn("min-w-0", className)}>
        <label
          htmlFor={id}
          className={cn(
            "mb-2 flex items-baseline justify-between gap-3 text-[0.875rem] font-semibold text-text-muted",
            labelHidden && "sr-only",
          )}
        >
          <span>
            {label}
            {required && (
              <span aria-hidden className="ml-0.5 text-danger">
                *
              </span>
            )}
          </span>
          {optional && (
            <span className="text-[0.75rem] font-medium text-text-subtle">{optionalLabel}</span>
          )}
        </label>
        {children}
        {error ? (
          <p id={errorId} role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger">
            {error}
          </p>
        ) : hint ? (
          <div id={hintId} className="mt-2 text-[0.8125rem] leading-snug text-text-subtle">
            {hint}
          </div>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

/* ── Shared control styling ────────────────────────────────────────── */

export const controlClasses = (invalid?: boolean) =>
  cn(
    "w-full rounded-control border bg-white/[0.035] text-[1rem] text-text",
    "transition-[border-color,box-shadow,background-color] duration-150",
    "placeholder:text-text-subtle/80",
    "outline-none focus-visible:outline-none focus:bg-white/[0.05] focus:ring-[3px]",
    "disabled:cursor-not-allowed disabled:opacity-55",
    invalid
      ? "border-danger/70 focus:border-danger focus:ring-danger/20"
      : "border-border hover:border-border-strong focus:border-accent-text focus:ring-accent/25",
  );

function useControlProps(
  props: { id?: string; "aria-describedby"?: string; "aria-invalid"?: unknown; required?: boolean },
) {
  const ctx = useFieldContext();
  const invalid = ctx?.invalid || props["aria-invalid"] === true || props["aria-invalid"] === "true";
  return {
    id: props.id ?? ctx?.id,
    "aria-describedby": cn(ctx?.describedBy, props["aria-describedby"]) || undefined,
    "aria-invalid": invalid || undefined,
    required: props.required ?? ctx?.required,
    invalid,
  };
}

/* ── Input ─────────────────────────────────────────────────────────── */

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: Ref<HTMLInputElement>;
  /** Decorative element inside the left edge (e.g. a search icon). */
  leading?: ReactNode;
  /** Interactive or decorative element inside the right edge. */
  trailing?: ReactNode;
};

export function Input({ className, leading, trailing, ...props }: InputProps) {
  const { invalid, ...aria } = useControlProps(props);
  return (
    <div className="relative">
      {leading && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-text-subtle [&>svg]:h-4 [&>svg]:w-4"
        >
          {leading}
        </span>
      )}
      <input
        {...props}
        {...aria}
        className={cn(
          controlClasses(invalid),
          "h-11 px-3.5",
          leading && "pl-10",
          trailing && "pr-12",
          className,
        )}
      />
      {trailing && (
        <span className="absolute inset-y-0 right-1 flex items-center">{trailing}</span>
      )}
    </div>
  );
}

/** Password input with an accessible show/hide toggle. */
export function PasswordInput({
  showLabel = "Show password",
  hideLabel = "Hide password",
  ...props
}: Omit<InputProps, "type" | "trailing"> & { showLabel?: string; hideLabel?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <Input
      {...props}
      type={shown ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? hideLabel : showLabel}
          aria-pressed={shown}
          className="flex h-9 w-10 items-center justify-center rounded-[8px] text-text-subtle transition-colors hover:bg-white/[0.06] hover:text-text"
        >
          {shown ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      }
    />
  );
}

/* ── Textarea ──────────────────────────────────────────────────────── */

export function Textarea({
  className,
  rows = 5,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }) {
  const { invalid, ...aria } = useControlProps(props);
  return (
    <textarea
      rows={rows}
      {...props}
      {...aria}
      className={cn(controlClasses(invalid), "min-h-[7rem] resize-y px-3.5 py-3 leading-relaxed", className)}
    />
  );
}

/* ── Select (native, for accessibility and mobile pickers) ─────────── */

export function Select({
  className,
  children,
  placeholder,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  ref?: Ref<HTMLSelectElement>;
  placeholder?: string;
}) {
  const { invalid, ...aria } = useControlProps(props);
  return (
    <div className="relative">
      <select
        {...props}
        {...aria}
        className={cn(
          controlClasses(invalid),
          "h-11 appearance-none pl-3.5 pr-10 [&>option]:bg-surface-overlay [&>option]:text-text",
          className,
        )}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle"
      />
    </div>
  );
}

/* ── Checkbox ──────────────────────────────────────────────────────── */

export function Checkbox({
  label,
  description,
  error,
  className,
  id: idProp,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  error?: string | null;
  ref?: Ref<HTMLInputElement>;
}) {
  const autoId = useId();
  const id = idProp ?? `c${autoId.replace(/:/g, "")}`;
  const descId = description ? `${id}-desc` : undefined;
  const errId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-start gap-3">
        <input
          {...props}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(descId, errId) || undefined}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-[5px] accent-[#6d2bff]"
        />
        <div className="min-w-0">
          <label htmlFor={id} className="text-[0.9375rem] font-medium leading-snug text-text">
            {label}
          </label>
          {description && (
            <p id={descId} className="mt-1 text-[0.8125rem] leading-snug text-text-subtle">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p id={errId} role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ── RadioCardGroup ────────────────────────────────────────────────── */

export type RadioCardOption<V extends string> = {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
};

/**
 * A fieldset of native radios drawn as selectable cards. Arrow keys, form
 * submission and screen-reader semantics all come from the native inputs.
 *
 *   <RadioCardGroup legend="I'm joining as" name="account_type"
 *     value={type} onChange={setType} options={[…]} columns={3} />
 */
export function RadioCardGroup<V extends string>({
  legend,
  name,
  value,
  onChange,
  options,
  error,
  columns = 1,
  className,
}: {
  legend: ReactNode;
  name: string;
  value: V | null;
  onChange: (value: V) => void;
  options: RadioCardOption<V>[];
  error?: string | null;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const autoId = useId();
  const errId = `r${autoId.replace(/:/g, "")}-error`;
  return (
    <fieldset
      className={cn("min-w-0", className)}
      aria-describedby={error ? errId : undefined}
    >
      <legend className="mb-2 text-[0.875rem] font-semibold text-text-muted">{legend}</legend>
      <div
        className={cn(
          "grid gap-2",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
        )}
      >
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                "relative flex cursor-pointer gap-3 rounded-control border p-3.5 transition-colors",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text",
                checked
                  ? "border-accent-text bg-accent-soft"
                  : "border-border bg-white/[0.025] hover:border-border-strong",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {opt.icon && (
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] [&>svg]:h-4 [&>svg]:w-4",
                    checked ? "bg-accent text-white" : "bg-white/[0.06] text-text-muted",
                  )}
                >
                  {opt.icon}
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-[0.9375rem] font-semibold leading-tight text-text">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="mt-1 block text-[0.8125rem] leading-snug text-text-subtle">
                    {opt.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errId} role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
