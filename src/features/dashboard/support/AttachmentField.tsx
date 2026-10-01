import { useId, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { ATTACHMENT_ACCEPT, COPY, attachmentProblem } from "./copy";

/** Optional single-file attachment with client-side type/size checks. */
export function AttachmentField({
  file,
  onChange,
  serverError,
  disabled,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  serverError?: string | null;
  disabled?: boolean;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const id = `att${useId().replace(/:/g, "")}`;
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const shown = error ?? serverError ?? null;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3 text-[0.875rem] font-semibold text-text-muted">
        <label htmlFor={id}>{c.attachment}</label>
        <span className="text-[0.75rem] font-medium text-text-subtle">{t("common.optional")}</span>
      </div>
      <input
        ref={ref}
        id={id}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        disabled={disabled}
        aria-describedby={`${id}-desc`}
        aria-invalid={shown ? true : undefined}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (!f) return;
          const p = attachmentProblem(f);
          if (p) {
            setError(p === "type" ? c.attachmentType : c.attachmentSize);
            onChange(null);
            e.target.value = "";
            return;
          }
          setError(null);
          onChange(f);
        }}
        className="block w-full min-w-0 text-body-sm text-text-muted file:mr-3 file:h-9 file:rounded-control file:border file:border-border file:bg-white/[0.06] file:px-3.5 file:text-body-sm file:font-semibold file:text-text hover:file:bg-white/[0.1]"
      />
      {file && (
        <div className="mt-2 flex min-w-0 items-center gap-2 text-body-sm text-text">
          <Paperclip className="h-4 w-4 shrink-0 text-text-subtle" aria-hidden />
          <span className="min-w-0 break-all">{file.name}</span>
          <Button
            variant="ghost"
            size="sm"
            aria-label={c.removeAttachment}
            onClick={() => {
              onChange(null);
              if (ref.current) ref.current.value = "";
            }}
            disabled={disabled}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}
      <p
        id={`${id}-desc`}
        role={shown ? "alert" : undefined}
        className={shown ? "mt-2 text-[0.8125rem] font-medium text-danger" : "mt-2 text-[0.8125rem] text-text-subtle"}
      >
        {shown ?? c.attachmentHint}
      </p>
    </div>
  );
}
