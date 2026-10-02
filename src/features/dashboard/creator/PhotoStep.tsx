import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Camera, Check, Upload } from "lucide-react";
import { Badge, Button, Card, useToast } from "@/components/ui";
import { useAction } from "@/features/dashboard/components";
import { uploadCreatorAvatar } from "@/lib/api/marketplace";
import type { CreatorProfile } from "@/lib/api/types";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY } from "./copy";
import { WORK_COPY } from "./workCopy";

/** CreatorController@avatar: jpg/png/webp, up to 4 MB. */
export const PHOTO_MAX_BYTES = 4 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function photoProblem(file: File): "type" | "size" | null {
  if (!PHOTO_TYPES.includes(file.type)) return "type";
  if (file.size > PHOTO_MAX_BYTES) return "size";
  return null;
}

/**
 * A square photo picker with a live preview (cropped to a square the way
 * artists will see it). Controlled: the parent decides when to upload.
 */
export function PhotoPicker({
  file,
  currentUrl,
  name,
  onPick,
  busy,
  error,
}: {
  file: File | null;
  currentUrl?: string | null;
  name: string;
  onPick: (file: File) => void;
  busy?: boolean;
  error?: string | null;
}) {
  const w = useCopy(WORK_COPY);
  const c = useCopy(COPY);
  const input = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!file || typeof URL.createObjectURL !== "function") {
      setPreview(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const problem = photoProblem(f);
    if (problem) {
      setLocalError(problem === "type" ? c.avatarType : c.avatarSize);
      return;
    }
    setLocalError(null);
    onPick(f);
  };

  const src = preview ?? currentUrl ?? null;
  const message = localError ?? error ?? null;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span
        className={cn(
          "relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border-2",
          src ? "border-accent/40" : "border-dashed border-border-strong bg-surface-sunken",
        )}
      >
        {src ? (
          <img src={src} alt={w.photoPreview} className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-7 w-7 text-text-subtle" aria-hidden />
        )}
        {src && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-inset ring-white/30" />}
      </span>
      <div className="min-w-0 flex-1">
        <p id={hintId} className="text-caption text-text-subtle">
          {w.photoHint}
        </p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={pick}
          data-testid="creator-photo-input"
        />
        <Button
          type="button"
          variant={src ? "secondary" : "primary"}
          size="sm"
          className="mt-2"
          leftIcon={<Upload />}
          loading={busy}
          aria-describedby={hintId}
          onClick={() => input.current?.click()}
        >
          {src ? w.photoChange : w.photoChoose}
        </Button>
        <span className="sr-only">{name}</span>
        {message && (
          <p role="alert" className="mt-2 text-body-sm font-medium text-danger">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Workspace step 1: the profile photo is required before submitting for
 * review (422 profile_incomplete otherwise). Uploads as soon as a photo is
 * picked; done state shows a check.
 */
export function PhotoStep({ profile, onSaved }: { profile: CreatorProfile; onSaved: (p: CreatorProfile) => void }) {
  const w = useCopy(WORK_COPY);
  const c = useCopy(COPY);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const upload = useAction((f: File) => uploadCreatorAvatar(f));
  const has = !!profile.avatar_url;

  const onPick = async (f: File) => {
    setFile(f);
    const res = await upload.run(f);
    if (res.ok) {
      toast({ title: c.avatarSaved, tone: "success" });
      onSaved(res.value);
    } else {
      setFile(null);
    }
  };

  return (
    <Card variant={has ? "raised" : "accent"} className="mb-6" aria-labelledby="photo-step-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="photo-step-title" className="text-h4 font-bold text-text">
          {w.photoStepTitle}
        </h2>
        {has ? (
          <Badge tone="success" size="sm">
            <Check className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
            {c.avatarSaved}
          </Badge>
        ) : (
          <Badge tone="warning" size="sm">
            {w.photoMissing}
          </Badge>
        )}
      </div>
      <p className="mb-4 max-w-[60ch] text-body-sm text-text-muted">{w.photoStepBody}</p>
      <PhotoPicker
        file={file}
        currentUrl={profile.avatar_url}
        name={profile.display_name}
        onPick={(f) => void onPick(f)}
        busy={upload.pending}
        error={upload.fieldErrors.avatar ?? upload.error}
      />
    </Card>
  );
}
