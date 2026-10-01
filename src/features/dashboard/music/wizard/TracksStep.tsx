import { useMemo, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Card, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { addTrack, deleteTrack, reorderTracks, updateTrack, type TrackPatch } from "@/lib/api/catalog";
import { fieldErrorsOf } from "@/lib/api/errors";
import type { Release, Track } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { ConfirmDialog, FormAlert, useAction } from "../../components";
import { COPY } from "../copy";
import { useIssueText } from "../shared";
import { AudioUploader } from "./AudioUploader";
import { useReportSaver, useWizard } from "./context";
import { StepFooter } from "./StepFooter";
import { useAutosave } from "./useAutosave";
import { isValidIsrc, validateTracks } from "./validation";

export function TracksStep() {
  const c = useCopy(COPY);
  const issueText = useIssueText();
  const { release, setRelease, config, goTo } = useWizard();
  const [title, setTitle] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [toDelete, setToDelete] = useState<Track | null>(null);

  const tracks = useMemo(() => release?.tracks ?? [], [release?.tracks]);
  const add = useAction(async (t: string) => addTrack(release!.id, { title: t }));
  const move = useAction(async (order: number[]) => reorderTracks(release!.id, order));

  if (!release) return null;
  const bounds = config.tracks[release.release_type];
  const issues = validateTracks(tracks, release.release_type, config.tracks);
  const general = issues.filter((i) => !i.trackId);
  const withTracks = (next: Track[]) => setRelease({ ...release, tracks: next, tracks_count: next.length } as Release);

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await add.run(title.trim());
    if (res.ok) {
      withTracks([...tracks, res.value]);
      setTitle("");
    }
  };

  const reorder = async (index: number, dir: -1 | 1) => {
    const order = tracks.map((t) => t.id);
    const j = index + dir;
    if (j < 0 || j >= order.length) return;
    [order[index], order[j]] = [order[j], order[index]];
    const res = await move.run(order);
    if (res.ok) {
      const byId = new Map(tracks.map((t) => [t.id, t]));
      withTracks(res.value.map((t) => ({ ...(byId.get(t.id) ?? t), ...t })));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-body-sm text-text-muted">
          {bounds ? c.tracksRules(release.release_type, bounds.min, bounds.max) : null}{" "}
          {c.audioRules(config.audio.formats.join(", ").toUpperCase(), config.audio.max_mb, config.audio.min_sample_rate, config.audio.min_bit_depth)}
        </p>
        <form onSubmit={onAdd} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label={c.newTrackTitle} hint={c.addTrackHint} className="flex-1" error={add.fieldErrors.title}>
            <Input value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Button type="submit" leftIcon={<Plus />} loading={add.pending} disabled={!title.trim()} className="sm:mb-[1.85rem]">
            {c.addTrack}
          </Button>
        </form>
        {add.error && !add.fieldErrors.title && <FormAlert className="mt-3">{add.error}</FormAlert>}
        {move.error && <FormAlert className="mt-3">{move.error}</FormAlert>}
      </Card>

      {showErrors && general.length > 0 && (
        <FormAlert>
          {general.map((i, n) => (
            <p key={n}>{issueText(i)}</p>
          ))}
        </FormAlert>
      )}

      <ol className="space-y-4">
        {tracks.map((t, i) => (
          <li key={t.id}>
            <TrackEditor
              track={t}
              index={i}
              count={tracks.length}
              release={release}
              errors={showErrors ? issues.filter((x) => x.trackId === t.id).map((x) => issueText(x) ?? "") : []}
              onMove={(dir) => void reorder(i, dir)}
              onDelete={() => setToDelete(t)}
              onChange={(next) => withTracks(tracks.map((x) => (x.id === next.id ? { ...x, ...next } : x)))}
              moving={move.pending}
            />
          </li>
        ))}
      </ol>

      <StepFooter
        onBack={() => goTo("artwork")}
        onNext={() => {
          setShowErrors(true);
          if (issues.length === 0) goTo("credits");
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={c.deleteTrackTitle}
        description={c.deleteTrackBody}
        confirmLabel={toDelete ? c.deleteTrack(toDelete.title) : undefined}
        danger
        onConfirm={async () => {
          const target = toDelete!;
          await deleteTrack(target.id);
          withTracks(
            tracks.filter((x) => x.id !== target.id).map((x, n) => ({ ...x, track_number: n + 1 })),
          );
        }}
      />
    </div>
  );
}

type TrackForm = {
  title: string;
  version: string;
  primary_artist: string;
  featured: string;
  language: string;
  isrc: string;
  ownership: NonNullable<Track["ownership"]>;
  publisher: string;
  explicit: boolean;
  is_clean_version: boolean;
  instrumental: boolean;
  ai_generated: boolean;
  lyrics: string;
};

function toForm(t: Track): TrackForm {
  return {
    title: t.title ?? "",
    version: t.version ?? "",
    primary_artist: t.primary_artist ?? "",
    featured: (t.featured_artists ?? []).join(", "),
    language: t.language ?? "",
    isrc: t.isrc && !t.isrc_generated ? t.isrc : "",
    ownership: t.ownership ?? "original",
    publisher: t.publisher ?? "",
    explicit: t.explicit,
    is_clean_version: t.is_clean_version,
    instrumental: t.instrumental,
    ai_generated: t.ai_generated,
    lyrics: t.lyrics ?? "",
  };
}

const nul = (s: string) => (s.trim() ? s.trim() : null);

function toPatch(f: TrackForm): TrackPatch {
  const patch: TrackPatch = {
    version: nul(f.version),
    primary_artist: nul(f.primary_artist),
    featured_artists: f.featured.split(",").map((s) => s.trim()).filter(Boolean),
    language: nul(f.language),
    ownership: f.ownership,
    publisher: nul(f.publisher),
    explicit: f.explicit,
    is_clean_version: f.is_clean_version,
    instrumental: f.instrumental,
    ai_generated: f.ai_generated,
    lyrics: nul(f.lyrics),
  };
  if (f.title.trim()) patch.title = f.title.trim();
  if (!f.isrc.trim() || isValidIsrc(f.isrc)) patch.isrc = nul(f.isrc.replace(/[-\s]/g, "").toUpperCase());
  return patch;
}

function TrackEditor({
  track,
  index,
  count,
  release,
  errors,
  onMove,
  onDelete,
  onChange,
  moving,
}: {
  track: Track;
  index: number;
  count: number;
  release: Release;
  errors: string[];
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onChange: (t: Track) => void;
  moving: boolean;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { config } = useWizard();
  const [form, setForm] = useState<TrackForm>(() => toForm(track));
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const auto = useAutosave(
    form,
    async (f) => {
      try {
        const updated = await updateTrack(track.id, toPatch(f));
        setServerErrors({});
        onChange(updated);
      } catch (err) {
        setServerErrors(fieldErrorsOf(err));
        throw err;
      }
    },
    { delay: 1200 },
  );
  useReportSaver(`track-${track.id}`, auto);
  const set = <K extends keyof TrackForm>(k: K, v: TrackForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const label = track.title || c.trackNumber(index + 1);
  const isrcError = serverErrors.isrc ?? (form.isrc && !isValidIsrc(form.isrc) ? c.issue.isrc_invalid({ n: index + 1 }) : undefined);

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="min-w-0 break-words text-h4 font-bold">
          <span className="mr-2 tabular-nums text-text-subtle">{index + 1}.</span>
          {track.title || c.trackNumber(index + 1)}
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" aria-label={c.moveUp(label)} disabled={index === 0 || moving} onClick={() => onMove(-1)} className="w-9 px-0">
            <ArrowUp className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="sm" aria-label={c.moveDown(label)} disabled={index === count - 1 || moving} onClick={() => onMove(1)} className="w-9 px-0">
            <ArrowDown className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="sm" aria-label={c.deleteTrack(label)} onClick={onDelete} className="w-9 px-0 text-danger">
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <FormAlert>
          {errors.map((e, n) => (
            <p key={n}>{e}</p>
          ))}
        </FormAlert>
      )}

      <AudioUploader track={track} cfg={config.audio} onAttached={onChange} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.trackTitle} required error={serverErrors.title}>
          <Input value={form.title} maxLength={255} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label={c.trackVersion} optional optionalLabel={t("common.optional")} error={serverErrors.version}>
          <Input value={form.version} maxLength={120} onChange={(e) => set("version", e.target.value)} />
        </Field>
        <Field label={c.trackPrimaryArtist} error={serverErrors.primary_artist}>
          <Input value={form.primary_artist} placeholder={release.artist_name} maxLength={255} onChange={(e) => set("primary_artist", e.target.value)} />
        </Field>
        <Field label={c.trackFeatured} hint={c.trackFeaturedHint} optional optionalLabel={t("common.optional")} error={serverErrors.featured_artists}>
          <Input value={form.featured} onChange={(e) => set("featured", e.target.value)} />
        </Field>
        <Field label={c.trackLanguage} error={serverErrors.language}>
          <Select value={form.language} onChange={(e) => set("language", e.target.value)}>
            <option value="">{c.sameAsRelease}</option>
            {Object.entries(config.languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.trackIsrc} hint={c.trackIsrcHint} optional optionalLabel={t("common.optional")} error={isrcError}>
          <Input value={form.isrc} maxLength={15} onChange={(e) => set("isrc", e.target.value.toUpperCase())} placeholder="CC-XXX-YY-NNNNN" />
        </Field>
        <Field label={c.trackOwnership}>
          <Select value={form.ownership} onChange={(e) => set("ownership", e.target.value as TrackForm["ownership"])}>
            <option value="original">{c.own_original}</option>
            <option value="cover">{c.own_cover}</option>
            <option value="remix">{c.own_remix}</option>
            <option value="public_domain">{c.own_public_domain}</option>
          </Select>
        </Field>
        <Field label={c.trackPublisher} hint={c.trackPublisherHint} optional={form.ownership !== "cover"} optionalLabel={t("common.optional")} error={serverErrors.publisher}>
          <Input value={form.publisher} maxLength={255} onChange={(e) => set("publisher", e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox label={c.trackExplicitLabel} checked={form.explicit} onChange={(e) => set("explicit", e.target.checked)} />
        <Checkbox label={c.trackCleanLabel} checked={form.is_clean_version} onChange={(e) => set("is_clean_version", e.target.checked)} />
        <Checkbox label={c.trackInstrumentalLabel} checked={form.instrumental} onChange={(e) => set("instrumental", e.target.checked)} />
        <Checkbox label={c.trackAiLabel} checked={form.ai_generated} onChange={(e) => set("ai_generated", e.target.checked)} />
      </div>
      {!form.instrumental && (
        <details className="group rounded-control border border-border-subtle p-3">
          <summary className="cursor-pointer text-body-sm font-semibold text-text-muted">
            {c.trackLyrics} <span className="font-normal text-text-subtle">({t("common.optional")})</span>
          </summary>
          <Field label={c.trackLyrics} labelHidden className="mt-3" error={serverErrors.lyrics}>
            <Textarea value={form.lyrics} rows={6} maxLength={20000} onChange={(e) => set("lyrics", e.target.value)} />
          </Field>
        </details>
      )}
    </Card>
  );
}
