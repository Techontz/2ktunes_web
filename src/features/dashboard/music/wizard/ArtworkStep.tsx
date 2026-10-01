import { useEffect, useId, useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import { Button, Card, ProgressBar, useToast } from "@/components/ui";
import { attachArtwork } from "@/lib/api/catalog";
import { useErrorMessage } from "@/lib/api/errors";
import { uploadResumable, type UploadProgress } from "@/lib/upload/chunkedUpload";
import { useCopy } from "@/lib/useCopy";
import { FormAlert } from "../../components";
import { COPY } from "../copy";
import { ReleaseCover, useIssueText } from "../shared";
import { useWizard } from "./context";
import { StepFooter } from "./StepFooter";
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

export function ArtworkStep() {
  const c = useCopy(COPY);
  const issueText = useIssueText();
  const toMessage = useErrorMessage();
  const { toast } = useToast();
  const { release, setRelease, config, goTo } = useWizard();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [busy, setBusy] = useState<null | "checking" | "uploading">(null);
  const [showRequired, setShowRequired] = useState(false);

  useEffect(() => () => abort.current?.abort(), []);

  if (!release) return null;
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
      const session = await uploadResumable({
        file,
        kind: "artwork",
        signal: abort.current.signal,
        onProgress: setProgress,
      });
      const updated = await attachArtwork(release.id, { upload_id: session.id });
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
  const hasCover = !!release.cover_image;

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
          <div>
            <p className="mb-2 text-caption font-medium text-text-subtle">{c.artworkCurrent}</p>
            <ReleaseCover src={release.cover_image} title={release.release_title} size="lg" />
            {release.cover?.width && (
              <p className="mt-2 text-caption text-text-subtle">{c.artworkSize(release.cover.width, release.cover.height ?? 0)}</p>
            )}
          </div>
          <div className="min-w-0 space-y-4">
            <h3 className="text-h4 font-bold">{c.artworkTitle}</h3>
            <p className="text-body-sm text-text-muted">{c.artworkRules(cfg.min_px, cfg.max_px, Math.round(cfg.max_kb / 1024))}</p>
            {!hasCover && <p className="text-body-sm text-text-subtle">{c.artworkNone}</p>}
            <input
              ref={input}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              disabled={!!busy}
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <Button
              variant={hasCover ? "secondary" : "primary"}
              leftIcon={<ImageUp />}
              disabled={!!busy}
              onClick={() => input.current?.click()}
            >
              {hasCover ? c.artworkReplace : c.artworkChoose}
            </Button>
            <div aria-live="polite" className="space-y-2">
              {busy === "checking" && <p className="text-body-sm text-text-subtle">{c.artworkChecking}</p>}
              {busy === "uploading" && (
                <ProgressBar value={pct} label={c.artworkUploading} showValue />
              )}
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
            {showRequired && !hasCover && <FormAlert tone="warning">{c.issue.required()}</FormAlert>}
          </div>
        </div>
      </Card>
      <StepFooter
        onBack={() => goTo("info")}
        onNext={() => {
          if (!hasCover) {
            setShowRequired(true);
            return;
          }
          goTo("tracks");
        }}
        nextDisabled={!!busy}
      />
    </div>
  );
}
