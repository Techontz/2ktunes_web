import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * The existing language switcher, restyled for the auth surface.
 *
 * Same LanguageContext, same five locales, same `setLanguage` call — this is a
 * visual change only. Kept deliberately small: a code, a chevron, and a compact
 * menu, rather than the full-width dropdown the old header used.
 */
const LANGUAGES = [
  { code: "EN", name: "English" },
  { code: "SW", name: "Kiswahili" },
  { code: "FR", name: "Français" },
  { code: "PT", name: "Português" },
  { code: "ES", name: "Español" },
] as const;

export default function LanguagePicker() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="flex h-11 items-center gap-1.5 rounded-lg px-2.5 text-[0.8125rem] font-semibold text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white"
      >
        {language}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={2.2}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Language"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-20 mt-1.5 w-40 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0C0C10] p-1 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]"
          >
            {LANGUAGES.map((l) => {
              const active = l.code === language;
              return (
                <li key={l.code} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setLanguage(l.code);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[0.8125rem] font-medium transition-colors",
                      active
                        ? "bg-white/[0.07] text-white"
                        : "text-white/55 hover:bg-white/[0.05] hover:text-white",
                    )}
                  >
                    {l.name}
                    <span className="text-[0.6875rem] font-bold text-white/30">
                      {l.code}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
