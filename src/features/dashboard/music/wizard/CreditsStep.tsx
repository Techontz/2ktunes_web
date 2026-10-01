import { useState } from "react";
import { Copy, Plus, X } from "lucide-react";
import { Button, Card, EmptyState, Field, Input, Select, useToast } from "@/components/ui";
import { copyTrackMetadata, updateTrack } from "@/lib/api/catalog";
import { fieldErrorsOf } from "@/lib/api/errors";
import type { Credit, Release, Track } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { FormAlert, useAction } from "../../components";
import { COPY } from "../copy";
import { useIssueText } from "../shared";
import { useReportSaver, useWizard } from "./context";
import { StepFooter } from "./StepFooter";
import { useAutosave } from "./useAutosave";
import { WRITER_ROLES, validateCredits } from "./validation";

type Row = { role: string; name: string; detail: string };

export function CreditsStep() {
  const c = useCopy(COPY);
  const issueText = useIssueText();
  const { release, setRelease, refresh, goTo } = useWizard();
  const [showErrors, setShowErrors] = useState(false);
  const [rows, setRows] = useState<Record<number, Row[]>>({});
  const [nonce, setNonce] = useState(0);
  if (!release) return null;
  const tracks = release.tracks ?? [];

  // Validate what's on screen (unsaved edits included).
  const current = tracks.map((t) => ({
    id: t.id,
    ownership: t.ownership,
    credits: (rows[t.id] ?? (t.credits ?? []).map(toRow)).map((r) => ({ role: r.role, name: r.name })),
  }));
  const issues = validateCredits(current);

  const onTrackChange = (next: Track) =>
    setRelease({ ...release, tracks: tracks.map((x) => (x.id === next.id ? { ...x, ...next } : x)) } as Release);

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-h4 font-bold">{c.creditsTitle}</h3>
        <p className="mt-1 max-w-[70ch] text-body-sm text-text-muted">{c.creditsBody}</p>
      </Card>
      {tracks.length === 0 ? (
        <EmptyState compact title={c.noTracksForCredits} action={<Button onClick={() => goTo("tracks")}>{c.stepTracks}</Button>} />
      ) : (
        <ol className="space-y-4">
          {tracks.map((t, i) => (
            <li key={`${t.id}-${nonce}`}>
              <TrackCredits
                track={t}
                index={i}
                multi={tracks.length > 1}
                errors={showErrors ? issues.filter((x) => x.trackId === t.id).map((x) => issueText(x) ?? "") : []}
                onRows={(r) => setRows((m) => ({ ...m, [t.id]: r }))}
                onSaved={onTrackChange}
                onCopied={async () => {
                  await refresh();
                  setRows({});
                  setNonce((n) => n + 1);
                }}
              />
            </li>
          ))}
        </ol>
      )}
      <StepFooter
        onBack={() => goTo("tracks")}
        onNext={() => {
          setShowErrors(true);
          if (issues.length === 0) goTo("stores");
        }}
      />
    </div>
  );
}

const toRow = (cr: Credit): Row => ({ role: cr.role, name: cr.name ?? "", detail: cr.detail ?? "" });

function TrackCredits({
  track,
  index,
  multi,
  errors,
  onRows,
  onSaved,
  onCopied,
}: {
  track: Track;
  index: number;
  multi: boolean;
  errors: string[];
  onRows: (rows: Row[]) => void;
  onSaved: (t: Track) => void;
  onCopied: () => Promise<void>;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { toast } = useToast();
  const { config } = useWizard();
  const [rows, setRowsState] = useState<Row[]>(() => {
    const initial = (track.credits ?? []).map(toRow);
    return initial.length ? initial : [{ role: "songwriter", name: "", detail: "" }];
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const setRows = (r: Row[]) => {
    setRowsState(r);
    onRows(r);
  };

  // Only complete rows are sent; the list replaces the track's credits.
  const payload = rows
    .filter((r) => r.role && r.name.trim())
    .map((r) => ({ role: r.role, name: r.name.trim(), detail: r.detail.trim() || null }));
  const auto = useAutosave(
    payload,
    async (credits) => {
      try {
        onSaved(await updateTrack(track.id, { credits }));
        setServerError(null);
      } catch (err) {
        const fe = fieldErrorsOf(err);
        setServerError(Object.values(fe)[0] ?? null);
        throw err;
      }
    },
    { delay: 1000 },
  );
  useReportSaver(`credits-${track.id}`, auto);

  const copy = useAction(async () => {
    await auto.flush();
    return copyTrackMetadata(track.id, ["credits"]);
  });

  const roles = config.contributor_roles;
  const hasWriter = rows.some((r) => WRITER_ROLES.includes(r.role) && r.name.trim());

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="min-w-0 break-words text-h4 font-bold">
          <span className="mr-2 tabular-nums text-text-subtle">{index + 1}.</span>
          {track.title}
        </h3>
        {multi && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Copy />}
            loading={copy.pending}
            disabled={!hasWriter}
            onClick={async () => {
              const res = await copy.run();
              if (res.ok) {
                toast({ title: c.creditsCopied(res.value.updated), tone: "success" });
                await onCopied();
              }
            }}
          >
            {c.copyCredits}
          </Button>
        )}
      </div>
      {errors.length > 0 && (
        <FormAlert>
          {errors.map((e, n) => (
            <p key={n}>{e}</p>
          ))}
        </FormAlert>
      )}
      {serverError && <FormAlert>{serverError}</FormAlert>}
      {copy.error && <FormAlert>{copy.error}</FormAlert>}
      {rows.length === 0 && <p className="text-body-sm text-text-subtle">{c.noCredits}</p>}
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li
            key={i}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-control border border-border-subtle p-3 sm:grid-cols-[12rem_minmax(0,1fr)_10rem_auto] sm:border-0 sm:p-0"
          >
            <Field label={c.creditRole} className="col-span-2 sm:col-span-1">
              <Select value={r.role} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {c.creditRoles[role] ?? role}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={c.creditName} className="col-span-2 sm:col-span-1">
              <Input value={r.name} maxLength={255} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            </Field>
            <Field label={c.creditDetail} optional optionalLabel={t("common.optional")}>
              <Input value={r.detail} maxLength={120} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))} />
            </Field>
            <div className="flex items-end">
              <Button variant="ghost" aria-label={c.removeCredit(r.name)} onClick={() => setRows(rows.filter((_, j) => j !== i))} className="w-11 px-0">
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button variant="secondary" size="sm" leftIcon={<Plus />} onClick={() => setRows([...rows, { role: "songwriter", name: "", detail: "" }])}>
        {c.addCredit}
      </Button>
    </Card>
  );
}
