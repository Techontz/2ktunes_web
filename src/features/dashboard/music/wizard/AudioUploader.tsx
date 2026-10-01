import { useEffect, useRef, useState } from "react";
import { FileAudio, RotateCcw, Upload, X } from "lucide-react";
import { Button, ProgressBar } from "@/components/ui";
import { attachAudio } from "@/lib/api/catalog";
import { useErrorMessage } from "@/lib/api/errors";
import type { ReleaseConfig, Track } from "@/lib/api/types";
import { isRetryable, uploadResumable, type UploadPhase } from "@/lib/upload/chunkedUpload";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "../copy";
import { formatBytes, formatDuration, useIssueText } from "../shared";
import { validateAudioFile } from "./validation";

type State =
  | { kind: "idle" }
  | { kind: "running"; phase: UploadPhase | "attaching"; pct: number }
  | { kind: "error"; message: string; retryable: boolean }
  | { kind: "done"; warnings: string[] };

/**
 * Upload (or replace) one track's master through a resumable upload session,
 * then attach it (POST /tracks/{id}/audio {upload_id}). Progress is shown as a
 * bar and announced in a polite live region at each phase and every 25 %.
 * A failed upload can be retried with the same file; choosing the same file
 * again later resumes from the chunks the server already has.
 */
export function AudioUploader({
  track,
  cfg,
  onAttached,
}: {
  track: Track;
  cfg: ReleaseConfig["audio"];
  onAttached: (t: Track) => void;
}) {
  const c = useCopy(COPY);
  const toMessage = useErrorMessage();
  const issueText = useIssueText();
  const input = useRef<HTMLInputElement>(null);
  const file = useRef<File | null>(null);
  const abort = useRef<AbortController | null>(null);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [announce, setAnnounce] = useState("");
  const lastAnnounced = useRef<string>("");

  useEffect(() => () => abort.current?.abort(), []);

  const phaseLabel = (p: UploadPhase | "attaching") =>
    p === "hashing" ? c.audioHashing : p === "uploading" ? c.audioUploading : p === "finalizing" ? c.audioFinalizing : c.audioAttaching;

  const say = (phase: UploadPhase | "attaching", pct: number) => {
    const bucket = `${phase}:${Math.floor(pct / 25)}`;
    if (bucket === lastAnnounced.current) return;
    lastAnnounced.current = bucket;
    setAnnounce(c.audioProgress(phaseLabel(phase), pct));
  };

  const start = async (f: File) => {
    const problems = validateAudioFile(f, cfg);
    if (problems.length) {
      setState({ kind: "error", message: problems.map((p) => issueText(p)).join(" "), retryable: false });
      return;
    }
    file.current = f;
    abort.current = new AbortController();
    setState({ kind: "running", phase: "hashing", pct: 0 });
    try {
      const session = await uploadResumable({
        file: f,
        kind: "audio",
        signal: abort.current.signal,
        onProgress: (p) => {
          const pct = p.total ? Math.round((p.loaded / p.total) * 100) : 0;
          setState({ kind: "running", phase: p.phase === "done" ? "finalizing" : p.phase, pct });
          say(p.phase === "done" ? "finalizing" : p.phase, pct);
        },
      });
      setState({ kind: "running", phase: "attaching", pct: 100 });
      say("attaching", 100);
      const updated = await attachAudio(track.id, session.id);
      onAttached(updated);
      setState({ kind: "done", warnings: session.inspection?.warnings ?? [] });
      setAnnounce(c.audioDone);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setState({ kind: "idle" });
        setAnnounce(c.audioCancelled);
      } else {
        setState({ kind: "error", message: toMessage(err), retryable: isRetryable(err) });
        setAnnounce(`${c.audioFailed}. ${toMessage(err)}`);
      }
    } finally {
      if (input.current) input.current.value = "";
    }
  };

  const a = track.audio;
  const running = state.kind === "running";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-body-sm">
          <FileAudio className="h-4 w-4 shrink-0 text-text-subtle" aria-hidden />
          {a ? (
            <span className="min-w-0 break-words text-text">
              <span className="font-semibold">{a.original_name ?? c.audioTitle}</span>
              <span className="text-text-subtle">
                {" · "}
                {c.audioFacts(
                  (a.format ?? "").toUpperCase(),
                  a.sample_rate ? `${a.sample_rate / 1000} kHz` : "-",
                  a.bit_depth ? `${a.bit_depth}-bit` : "-",
                  formatDuration(a.duration_ms),
                )}
                {a.size ? ` · ${formatBytes(a.size)}` : ""}
              </span>
            </span>
          ) : (
            <span className="text-warning">{c.trackNoAudio}</span>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept={cfg.formats.map((f) => `.${f}`).join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void start(f);
          }}
        />
        {running ? (
          <Button variant="ghost" size="sm" leftIcon={<X />} onClick={() => abort.current?.abort()}>
            {c.audioCancel}
          </Button>
        ) : (
          <Button variant={a ? "secondary" : "primary"} size="sm" leftIcon={<Upload />} onClick={() => input.current?.click()}>
            {a ? c.audioReplace : c.audioChoose}
          </Button>
        )}
      </div>

      {running && (
        <ProgressBar
          value={state.pct}
          label={phaseLabel(state.phase)}
          showValue
          size="sm"
          tone={state.phase === "hashing" ? "warning" : "accent"}
        />
      )}
      {state.kind === "error" && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-body-sm">
          <span className="min-w-0 flex-1 break-words">
            <span className="font-semibold">{c.audioFailed}.</span> {state.message}
            {state.retryable && <span className="block text-caption text-text-subtle">{c.audioResumeHint}</span>}
          </span>
          {state.retryable && file.current && (
            <Button size="sm" variant="secondary" leftIcon={<RotateCcw />} onClick={() => void start(file.current!)}>
              {c.audioRetry}
            </Button>
          )}
        </div>
      )}
      {state.kind === "done" && state.warnings.length > 0 && (
        <p className="rounded-control border border-warning/30 bg-warning-soft px-3 py-2 text-body-sm">
          <span className="font-semibold">{c.audioWarning}: </span>
          {state.warnings.join(" ")}
        </p>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
