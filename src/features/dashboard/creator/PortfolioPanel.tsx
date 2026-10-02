import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Film, ImageIcon, Link2, Play, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, Input, ProgressBar, RadioCardGroup, Textarea, useToast } from "@/components/ui";
import { ConfirmDialog, FormAlert, useAction } from "@/features/dashboard/components";
import { useLabels } from "@/features/dashboard/marketplace/labels";
import { detectPlatform } from "@/features/dashboard/marketplace/platform";
import { addPortfolioItem, deletePortfolioItem, type PortfolioInput } from "@/lib/api/marketplace";
import type { CreatorProfile, PortfolioItem } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { WORK_COPY } from "./workCopy";

/** config/marketplace.php: portfolio_max_items and showcase_video_max_kb (51200). */
export const MAX_ITEMS = 12;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_THUMB_BYTES = 4 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Client-side check mirroring CreatorController@storePortfolio. */
export function videoProblem(file: File): "type" | "size" | null {
  if (!VIDEO_TYPES.includes(file.type)) return "type";
  if (file.size > MAX_VIDEO_BYTES) return "size";
  return null;
}

export function PortfolioPanel({
  profile,
  onChanged,
}: {
  profile: CreatorProfile;
  platforms?: string[];
  onChanged: () => void;
}) {
  const w = useCopy(WORK_COPY);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [removing, setRemoving] = useState<PortfolioItem | null>(null);
  const items = profile.portfolio;
  const labels = useLabels();
  const titleOf = (i: PortfolioItem) => i.caption || i.title || `${w.item} · ${labels.platform(i.platform)}`;

  return (
    <div className="space-y-5">
      <p className="max-w-[70ch] text-body-sm text-text-muted">{w.portfolioIntro(MAX_ITEMS)}</p>
      {items.length === 0 ? (
        <EmptyState compact icon={<Film />} title={w.empty} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((i) => (
            <PortfolioCard key={i.id} item={i} title={titleOf(i)} onRemove={() => setRemoving(i)} />
          ))}
        </ul>
      )}

      {items.length >= MAX_ITEMS ? (
        <FormAlert tone="info">{w.full(MAX_ITEMS)}</FormAlert>
      ) : (
        <AddItem onAdded={onChanged} />
      )}

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={w.removeTitle}
        description={removing ? titleOf(removing) : undefined}
        confirmLabel={t("act.remove")}
        danger
        onConfirm={async () => {
          if (!removing) return;
          await deletePortfolioItem(removing.id);
          toast({ title: w.removed, tone: "success" });
          onChanged();
        }}
      />
    </div>
  );
}

function PortfolioCard({ item, title, onRemove }: { item: PortfolioItem; title: string; onRemove: () => void }) {
  const w = useCopy(WORK_COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  return (
    <li className="min-w-0">
      <Card padding="none" className="overflow-hidden">
        <div className="relative aspect-[9/16] bg-[linear-gradient(160deg,#2a0f4a,#6e16a8)]">
          {item.video_src ? (
            <video
              src={item.video_src}
              poster={item.thumbnail_url ?? undefined}
              preload="none"
              controls
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
              aria-label={title}
            />
          ) : item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span aria-hidden className="absolute inset-0 flex items-center justify-center text-white/80">
              {item.url ? <Link2 className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </span>
          )}
          <span className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
            <Badge tone="neutral" size="sm" className="bg-black/50 text-white ring-0">
              {item.media_type === "upload" || item.platform === "upload" ? w.uploadedVideo : labels.platform(item.platform)}
            </Badge>
            {item.featured_on_home && (
              <Badge tone="accent" size="sm" className="bg-accent text-white">
                <Sparkles className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
                {w.featured}
              </Badge>
            )}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2 p-3">
          <div className="min-w-0">
            {item.url && !item.video_src ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="line-clamp-2 break-words text-body-sm font-semibold text-text hover:text-accent-text">
                {title}
              </a>
            ) : (
              <p className="line-clamp-2 break-words text-body-sm font-semibold text-text">{title}</p>
            )}
            {item.views != null && <p className="mt-0.5 text-caption text-text-subtle">{w.selfReported(formatCount(item.views, locale))}</p>}
          </div>
          <Button variant="ghost" size="sm" aria-label={w.remove(title)} onClick={onRemove} className="-mr-1 shrink-0 px-2">
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </Card>
    </li>
  );
}

type Mode = "upload" | "link";

function AddItem({ onAdded }: { onAdded: () => void }) {
  const w = useCopy(WORK_COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const { toast } = useToast();
  const videoInput = useRef<HTMLInputElement>(null);
  const thumbInput = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("upload");
  const [video, setVideo] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [views, setViews] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const add = useAction((input: PortfolioInput) => addPortfolioItem(input, (f) => setProgress(f)));

  // Preview the chosen thumbnail; free the object URL afterwards.
  useEffect(() => {
    if (!thumb || typeof URL.createObjectURL !== "function") {
      setThumbUrl(null);
      return;
    }
    const u = URL.createObjectURL(thumb);
    setThumbUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [thumb]);

  const pickVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!f) return;
    const problem = videoProblem(f);
    setErrors((p) => ({ ...p, video: problem === "type" ? w.videoType : problem === "size" ? w.videoSize : "" }));
    setVideo(problem ? null : f);
  };
  const pickThumb = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!f) return;
    const bad = !IMAGE_TYPES.includes(f.type) ? w.thumbnailType : f.size > MAX_THUMB_BYTES ? w.thumbnailSize : "";
    setErrors((p) => ({ ...p, thumbnail: bad }));
    setThumb(bad ? null : f);
  };

  const detected = mode === "link" && /^https:\/\//i.test(url.trim()) ? detectPlatform(url) : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === "upload" && !video) errs.video = errors.video || w.videoRequired;
    if (mode === "link" && !/^https:\/\/\S+\.\S+/i.test(url.trim())) errs.url = w.linkInvalid;
    const v = views.trim().replace(/[\s,.]/g, "");
    if (v && !/^\d{1,10}$/.test(v)) errs.views = w.wholeNumber;
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setProgress(mode === "upload" ? 0 : null);
    const res = await add.run({
      video: mode === "upload" ? video : null,
      url: mode === "link" ? url.trim() : null,
      platform: mode === "link" && detected && ["tiktok", "instagram", "youtube", "facebook", "x", "snapchat", "audiomack", "boomplay"].includes(detected) ? detected : null,
      thumbnail: thumb,
      caption: caption.trim() || null,
      views: v ? Number(v) : null,
    });
    setProgress(null);
    if (res.ok) {
      toast({ title: w.added, tone: "success" });
      setVideo(null);
      setThumb(null);
      setUrl("");
      setCaption("");
      setViews("");
      onAdded();
    }
  };

  const err = (k: string) => errors[k] || add.fieldErrors[k];
  const opt = { optional: true, optionalLabel: t("common.optional") };
  const pct = progress != null ? Math.round(progress * 100) : null;

  return (
    <Card as="section" aria-labelledby="portfolio-add-title">
      <h3 id="portfolio-add-title" className="mb-4 text-h4 font-bold text-text">
        {w.addTitle}
      </h3>
      <form onSubmit={submit} noValidate className="space-y-4">
        <RadioCardGroup<Mode>
          legend={w.modeLabel}
          name="portfolio-mode"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setErrors({});
            add.reset();
          }}
          columns={2}
          options={[
            { value: "upload", label: w.modeUpload, description: w.modeUploadHint, icon: <Upload /> },
            { value: "link", label: w.modeLink, description: w.modeLinkHint, icon: <Link2 /> },
          ]}
        />

        {mode === "upload" ? (
          <Field label={w.video} hint={w.videoHint} error={err("video")} required>
            <div className="flex flex-wrap items-center gap-3">
              <input ref={videoInput} type="file" accept="video/mp4,video/webm" className="sr-only" tabIndex={-1} aria-hidden onChange={pickVideo} />
              <Button type="button" variant="secondary" size="sm" leftIcon={<Film />} onClick={() => videoInput.current?.click()} disabled={add.pending}>
                {video ? w.videoChange : w.videoChoose}
              </Button>
              {video && (
                <span className="min-w-0 truncate text-body-sm text-text">
                  {video.name} · {(video.size / 1024 / 1024).toFixed(1)} MB
                </span>
              )}
            </div>
          </Field>
        ) : (
          <Field label={w.link} hint={detected ? w.detected(labels.platform(detected)) : w.linkHint} error={err("url")} required>
            <Input type="url" inputMode="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={1024} />
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
          <Field label={w.thumbnail} hint={w.thumbnailHint} error={err("thumbnail")} {...opt}>
            <div className="flex items-center gap-3">
              <span className="relative flex h-20 w-[2.8125rem] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border-subtle bg-surface-sunken">
                {thumbUrl ? <img src={thumbUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-text-subtle" aria-hidden />}
              </span>
              <input ref={thumbInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden onChange={pickThumb} />
              <Button type="button" variant="secondary" size="sm" onClick={() => thumbInput.current?.click()} disabled={add.pending}>
                {w.thumbnailChoose}
              </Button>
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
            <Field label={w.caption} error={err("caption")} {...opt}>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} rows={2} />
            </Field>
            <Field label={w.views} hint={w.viewsHint} error={err("views")} {...opt}>
              <Input inputMode="numeric" value={views} onChange={(e) => setViews(e.target.value)} />
            </Field>
          </div>
        </div>

        {pct != null && add.pending && <ProgressBar value={pct} label={w.uploading(pct)} showValue />}
        {add.error && !Object.keys(add.fieldErrors).length && <FormAlert>{add.error}</FormAlert>}
        <div className="flex justify-end">
          <Button type="submit" leftIcon={<Plus />} loading={add.pending}>
            {w.add}
          </Button>
        </div>
      </form>
    </Card>
  );
}
