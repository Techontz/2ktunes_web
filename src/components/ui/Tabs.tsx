import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Tabs — WAI-ARIA tabs with roving tabindex and arrow/Home/End keys.
 *
 *   <Tabs value={tab} onValueChange={setTab}>          // or defaultValue="a"
 *     <TabList aria-label="Account">
 *       <Tab value="login">Log in</Tab>
 *       <Tab value="register">Create account</Tab>
 *     </TabList>
 *     <TabPanel value="login">…</TabPanel>
 *     <TabPanel value="register">…</TabPanel>
 *   </Tabs>
 *
 * Tabs props: value? / defaultValue? / onValueChange?, variant
 *   "segmented" (pill track, for 2–4 options) | "underline" (page sections).
 * TabList: aria-label (required), fullWidth?.
 * Tab: value, disabled?. TabPanel: value, keepMounted?.
 */

type Ctx = {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
  variant: "segmented" | "underline";
};
const TabsContext = createContext<Ctx | null>(null);
function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab components must be inside <Tabs>");
  return ctx;
}
const safe = (v: string) => v.replace(/[^a-zA-Z0-9_-]/g, "_");

export function Tabs({
  value: controlled,
  defaultValue = "",
  onValueChange,
  variant = "segmented",
  className,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  variant?: "segmented" | "underline";
  className?: string;
  children: ReactNode;
}) {
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const baseId = `t${useId().replace(/:/g, "")}`;
  const setValue = (v: string) => {
    if (controlled === undefined) setInner(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, setValue, baseId, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({
  className,
  fullWidth,
  children,
  ...aria
}: {
  className?: string;
  fullWidth?: boolean;
  children: ReactNode;
  "aria-label": string;
}) {
  const { variant } = useTabs();
  const ref = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    );
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next >= 0) {
      e.preventDefault();
      tabs[next].focus();
      tabs[next].click();
    }
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={aria["aria-label"]}
      onKeyDown={onKeyDown}
      className={cn(
        variant === "segmented"
          ? "inline-flex max-w-full gap-1 overflow-x-auto rounded-control border border-border-subtle bg-white/[0.04] p-1 no-scrollbar"
          : "flex gap-6 overflow-x-auto border-b border-border no-scrollbar",
        fullWidth && "flex w-full [&>*]:flex-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Tab({
  value,
  disabled,
  className,
  children,
}: {
  value: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { value: active, setValue, baseId, variant } = useTabs();
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${safe(value)}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${safe(value)}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => setValue(value)}
      className={cn(
        "whitespace-nowrap text-[0.9375rem] font-semibold transition-colors disabled:opacity-50",
        variant === "segmented"
          ? cn(
              "h-9 rounded-[8px] px-4",
              selected ? "bg-white/[0.1] text-text shadow-raised" : "text-text-subtle hover:text-text",
            )
          : cn(
              "-mb-px border-b-2 pb-3 pt-1",
              selected
                ? "border-accent-text text-text"
                : "border-transparent text-text-subtle hover:text-text",
            ),
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({
  value,
  keepMounted,
  className,
  children,
}: {
  value: string;
  keepMounted?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { value: active, baseId } = useTabs();
  const selected = active === value;
  if (!selected && !keepMounted) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${safe(value)}`}
      aria-labelledby={`${baseId}-tab-${safe(value)}`}
      hidden={!selected}
      tabIndex={0}
      className={cn("focus-visible:outline-offset-4", className)}
    >
      {children}
    </div>
  );
}
