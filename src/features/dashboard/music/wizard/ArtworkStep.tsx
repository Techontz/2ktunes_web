import { useEffect, useId, useRef, useState } from "react";
import { ChevronRight, HelpCircle, Image as ImageIcon, Lightbulb } from "lucide-react";
import { ProgressBar, useToast } from "@/components/ui";
import { attachArtwork } from "@/lib/api/catalog";
import { useErrorMessage } from "@/lib/api/errors";
import { uploadResumable, type UploadProgress } from "@/lib/upload/chunkedUpload";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { FormAlert } from "../../components";
import { COPY } from "../copy";
import { useIssueText } from "../shared";
import { useWizard } from "./context";
import { validateArtworkFile, type Issue } from "./validation";

/** Reads pixel dimensions without uploading anything. */
function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    img.src = url;
  });
}

/**
 * Cover art panel: header with a requirements tooltip and "Choose image",
 * a dashed drop zone (click or drop), the rules, upload progress and errors,
 * then expandable tips. Upload: chunked via /uploads (kind artwork), then
 * POST /releases/{id}/artwork.
 */
export function ArtworkStep() {
  const tipId = useId().replace(/:/g, "");
  const c = useCopy(COPY);
  const issueText = useIssueText();
  const toMessage = useErrorMessage();
  const { toast } = useToast();
  const { release, setRelease, config, attempted, ensureRelease } = useWizard();
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [busy, setBusy] = useState<null | "checking" | "uploading">(null);

  useEffect(() => () => abort.current?.abort(), []);
  const cfg = config.artwork;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIssues([]);
    setBusy("checking");
    let size: { width: number; height: number };
    try {
      size = await readImageSize(file);
    } catch {
      setBusy(null);
      setError(c.artworkReadError);
      return;
    }
    const found = validateArtworkFile({ type: file.type, size: file.size, ...size }, cfg);
    if (found.length) {
      setIssues(found);
      setBusy(null);
      return;
    }
    setBusy("uploading");
    abort.current = new AbortController();
    try {
      // The cover needs a draft to attach to; create it now if needed.
      const target = await ensureRelease();
      if (!target) return;
      const session = await uploadResumable({
        file,
        kind: "artwork",
        signal: abort.current.signal,
        onProgress: setProgress,
      });
      const updated = await attachArtwork(target.id, { upload_id: session.id });
      setRelease(updated);
      toast({ title: c.artworkSaved, tone: "success" });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) setError(toMessage(err));
    } finally {
      setBusy(null);
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  const pct = progress && progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
  const hasCover = !!release?.cover_image;
  const [over, setOver] = useState(false);
  const [tips, setTips] = useState(false);
  const mb = Math.round(cfg.max_kb / 1024);
  const pick = () => input.current?.click();

  return (
    <div id="section-artwork" className="min-w-0 scroll-mt-24">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 id="section-artwork-title" tabIndex={-1} className="text-[1.25rem] font-bold tracking-[-0.02em] text-text focus:outline-none sm:text-[1.375rem]">
            {c.upCover}
          </h2>
          {/* Requirements on hover or focus. */}
          <span className="group relative inline-flex">
            <button
              type="button"
              aria-label={c.coverHelp}
              aria-describedby={`${tipId}-tip`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-nr-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-text"
            >
              <HelpCircle className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} aria-hidden />
            </button>
            <span
              id={`${tipId}-tip`}
              role="tooltip"
              className="invisible absolute left-1/2 top-full z-30 mt-2 w-60 -translate-x-1/2 rounded-[8px] bg-nr-nav px-3 py-2 text-[0.75rem] leading-snug text-white opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
            >
              {c.coverRule1(cfg.min_px, cfg.max_px, mb)} {c.coverRule2}
            </span>
          </span>
        </div>
        <button
          type="button"
          disabled={!!busy}
          onClick={pick}
          className="inline-flex h-[2.125rem] shrink-0 items-center gap-2 rounded-[8px] border border-nr-line bg-white px-3 text-[0.8125rem] font-semibold text-text transition-colors hover:border-[#d6cde8] hover:bg-nr-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:cursor-not-allowed disabled:opacity-55"
        >
          <ImageIcon className="h-4 w-4" aria-hidden />
          {hasCover ? c.artworkReplace : c.artworkChoose}
        </button>
      </div>

      {/* The whole area is a drop zone; the button above is the keyboard path. */}
      <button
        type="button"
        onClick={pick}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void onFile(e.dataTransfer.files?.[0]);
        }}
        disabled={!!busy}
        tabIndex={-1}
        aria-hidden
        className={cn(
          "relative mt-[0.95rem] flex w-full items-center justify-center overflow-hidden rounded-[10px] border border-dashed transition-colors",
          hasCover ? "aspect-square border-transparent" : "aspect-square border-[#cfc4e3] bg-nr-soft hover:border-accent/50 lg:aspect-[384/328]",
          over && "border-accent bg-nr-pick",
        )}
      >
        {hasCover ? (
          <img src={release!.cover_image!} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center px-6 text-center">
            <ImageIcon className="h-11 w-11 text-[#5d4f84]" strokeWidth={1.5} aria-hidden />
            <span className="mt-4 text-[0.9375rem] text-[#4f4472]">{c.coverDrop}</span>
            <span className="mt-1 text-[0.8125rem] text-nr-muted">{c.coverBrowse}</span>
          </span>
        )}
      </button>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        disabled={!!busy}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <div className="mt-4 space-y-3">
        <p className="text-[0.75rem] leading-[1.4] text-nr-muted">
          {c.coverRule1(cfg.min_px, cfg.max_px, mb)}
          <br />
          {c.coverRule2}
          {release?.cover?.width && <span className="mt-1 block text-text">{c.artworkSize(release.cover.width, release.cover.height ?? 0)}</span>}
        </p>
        <div aria-live="polite" className="space-y-2 empty:hidden">
          {busy === "checking" && <p className="text-body-sm text-nr-muted">{c.artworkChecking}</p>}
          {busy === "uploading" && <ProgressBar value={pct} label={c.artworkUploading} showValue size="sm" />}
        </div>
        {issues.length > 0 && (
          <FormAlert>
            <ul className="list-disc space-y-1 pl-5">
              {issues.map((i, n) => (
                <li key={n}>{issueText(i)}</li>
              ))}
            </ul>
          </FormAlert>
        )}
        {error && <FormAlert>{error}</FormAlert>}
        {attempted && !hasCover && <FormAlert>{c.issue.required()}</FormAlert>}
      </div>

      <div className="mt-5 border-t border-nr-line pt-4">
        <div className="rounded-[10px] bg-nr-soft">
          <button
            type="button"
            aria-expanded={tips}
            aria-controls={`${tipId}-more`}
            onClick={() => setTips((v) => !v)}
            className="flex w-full items-center gap-3.5 rounded-[10px] py-3 pl-2.5 pr-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
          >
            <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nr-pick text-[#4f4472]">
              <Lightbulb className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.75rem] font-bold text-text">{c.coverTipsTitle}</span>
              <span className="mt-0.5 block text-[0.75rem] leading-[1.4] text-nr-muted">{c.coverTipsBody}</span>
            </span>
            <ChevronRight aria-hidden className={cn("h-4 w-4 shrink-0 text-nr-muted transition-transform", tips && "rotate-90")} />
          </button>
          {tips && (
            <ul id={`${tipId}-more`} className="list-disc space-y-1 pb-3.5 pl-[4.9rem] pr-4 text-[0.75rem] leading-[1.4] text-nr-muted">
              {c.coverTipsMore.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/** The page-level name for the cover art panel. */
export const CoverArtUploader = ArtworkStep;
