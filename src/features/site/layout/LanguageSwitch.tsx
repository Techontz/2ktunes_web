import { SUPPORTED_LANGUAGES } from "@/i18n";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * EN / SW toggle. A radio group of two buttons: visible, one tap, no menu to
 * open — with only two languages a dropdown is ceremony.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div
      role="radiogroup"
      aria-label={t("common.language")}
      className={cn(
        "inline-flex h-9 items-center rounded-control border border-border-subtle bg-white/[0.03] p-0.5",
        className,
      )}
    >
      {SUPPORTED_LANGUAGES.map((l) => {
        const active = l.code === language;
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={l.name}
            lang={l.code.toLowerCase()}
            onClick={() => setLanguage(l.code)}
            className={cn(
              "h-full min-w-9 rounded-[8px] px-2 text-[0.75rem] font-bold tracking-[0.04em] transition-colors",
              active ? "bg-white/[0.12] text-text" : "text-text-subtle hover:text-text",
            )}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
