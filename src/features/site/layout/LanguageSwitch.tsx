import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Language dropdown. The trigger shows the current code (EN / SW / FR); the
 * menu lists each language by its own name so a reader finds theirs without
 * knowing the current one.
 */
/** `bare`: no box around the trigger (the dashboard top bar). */
export function LanguageSwitch({ className, bare = false }: { className?: string; bare?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === language) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) items.current[focusIdx]?.focus();
  }, [open, focusIdx]);

  const openMenu = () => {
    setFocusIdx(Math.max(0, SUPPORTED_LANGUAGES.findIndex((l) => l.code === language)));
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const n = SUPPORTED_LANGUAGES.length;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((i) => (i - 1 + n) % n);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusIdx(n - 1);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrap} className={cn("relative inline-flex", className)}>
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${t("common.language")}: ${current.name}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-control text-text transition-colors hover:bg-tint/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text",
          bare ? "h-10 px-2 text-[0.8125rem] font-medium" : "h-9 border border-border-subtle bg-tint/[0.03] px-2.5 text-[0.75rem] font-bold tracking-[0.04em]",
        )}
      >
        <Globe className={cn(bare ? "h-[1.1rem] w-[1.1rem] text-text" : "h-3.5 w-3.5 text-text-subtle")} strokeWidth={bare ? 1.75 : 2} aria-hidden />
        <span lang={current.code.toLowerCase()}>{current.short}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", bare ? "text-text" : "text-text-subtle", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <ul
          id={menuId}
          role="menu"
          aria-label={t("common.language")}
          onKeyDown={onMenuKey}
          className="absolute right-0 top-full z-50 mt-2 w-44 animate-fade-in rounded-card border border-border bg-surface-overlay p-1.5 shadow-overlay"
        >
          {SUPPORTED_LANGUAGES.map((l, i) => {
            const active = l.code === language;
            return (
              <li key={l.code} role="none">
                <button
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  tabIndex={i === focusIdx ? 0 : -1}
                  lang={l.code.toLowerCase()}
                  onClick={() => {
                    setLanguage(l.code);
                    close();
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left text-body-sm font-semibold transition-colors hover:bg-tint/[0.06] hover:text-text focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text",
                    active ? "text-text" : "text-text-muted",
                  )}
                >
                  <span>{l.name}</span>
                  {active && <Check className="h-4 w-4 text-accent-text" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
