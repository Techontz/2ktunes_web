import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, Select, useToast } from "@/components/ui";
import { FormAlert, InlineLoading, LoadError } from "@/features/dashboard/components";
import { fetchRelease, fetchReleases, fetchReleaseSplits } from "@/lib/api/catalog";
import {
  fetchCollaborators,
  isNotAvailable,
  proposeTrackSplit,
  type Collaborator,
  type TrackSplitShare,
} from "@/lib/api/distribution";
import { errorMessageFor } from "@/lib/api/errors";
import type { Release, SplitSheet, Track } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/LanguageContext";
import { formatBp, formatMinor, parseAmount, percentToBp, bpToPercentInput } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY } from "./copy";

/**
 * The per track split editor (DOCS/DISTRIBUTION_PARITY.md section 3):
 *
 *   1. Pick a release, Next.
 *   2. One table per track. Each row is {share %, collaborator}; "Add
 *      recoupment" turns the rows into {recoup first (USD), then share %}.
 *      Every table must total exactly 100%.
 *   3. Review changes, Confirm: one POST /releases/{id}/splits per track.
 *
 * Shares travel as integer basis points, recoupment as integer USD cents.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL_BP = 10000;
const MAX_ROWS = 20;
const RECOUP_CURRENCY = "USD";

type Who = "" | "me" | "new" | `c:${string}`;
type Row = { key: number; who: Who; email: string; name: string; percent: string; recoup: string };
type Table = { recoup: boolean; rows: Row[] };
type RowField = "who" | "email" | "name" | "percent" | "recoup";
type Step = "pick" | "edit" | "review";

export function SplitEditor({ initialReleaseId, onDone }: { initialReleaseId: number | null; onDone: () => void }) {
  const [step, setStep] = useState<Step>(initialReleaseId ? "edit" : "pick");
  const [releaseId, setReleaseId] = useState<string>(initialReleaseId ? String(initialReleaseId) : "");
  const [tables, setTables] = useState<Record<number, Table> | null>(null);

  const reset = () => {
    setStep("pick");
    setTables(null);
  };

  if (step === "pick" || !releaseId) {
    return (
      <PickRelease
        value={releaseId}
        onChange={(v) => {
          setReleaseId(v);
          setTables(null);
        }}
        onNext={() => setStep("edit")}
      />
    );
  }

  return (
    <ReleaseEditor
      key={releaseId}
      releaseId={Number(releaseId)}
      step={step}
      setStep={setStep}
      tables={tables}
      setTables={setTables}
      onCancel={reset}
      onDone={() => {
        reset();
        onDone();
      }}
    />
  );
}

/* ── Step 1 ─────────────────────────────────────────────────────────── */

function PickRelease({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const c = useCopy(COPY);
  const releases = useResource((signal) => fetchReleases({ per_page: 100, sort: "newest" }, { signal }), []);
  const list = releases.data?.releases ?? [];

  return (
    <Card as="section" aria-labelledby="split-pick-title">
      <h2 id="split-pick-title" className="text-h4 font-bold">
        {c.pickTitle}
      </h2>
      <p className="mt-1 text-body-sm text-text-muted">{c.pickBody}</p>
      <div className="mt-5">
        {releases.loading ? (
          <InlineLoading label={c.loadingReleases} />
        ) : releases.error ? (
          <LoadError error={releases.error} onRetry={releases.reload} compact />
        ) : list.length === 0 ? (
          <div className="space-y-3">
            <p className="text-body-sm text-text-muted">{c.releasesEmpty}</p>
            <Button to="/dashboard/new-release" variant="secondary">
              {c.uploadFirst}
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (value) onNext();
            }}
          >
            <Field label={c.release} className="min-w-0 flex-1">
              <Select value={value} onChange={(e) => onChange(e.target.value)} placeholder={c.releasePlaceholder}>
                {list.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {[r.release_title, r.version ? `(${r.version})` : null, "·", r.artist_name].filter(Boolean).join(" ")}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" disabled={!value} className="sm:mb-0">
              {c.next}
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}

/* ── Steps 2 and 3 ──────────────────────────────────────────────────── */

type Loaded = { release: Release; collaborators: Collaborator[]; sheets: SplitSheet[] };

function ReleaseEditor({
  releaseId,
  step,
  setStep,
  tables,
  setTables,
  onCancel,
  onDone,
}: {
  releaseId: number;
  step: Step;
  setStep: (s: Step) => void;
  tables: Record<number, Table> | null;
  setTables: (t: Record<number, Table> | ((prev: Record<number, Table> | null) => Record<number, Table> | null)) => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  const c = useCopy(COPY);
  const { user } = useAuth();
  const myEmail = (user?.email ?? "").toLowerCase();

  // Collaborators and existing sheets only enrich the editor; a missing
  // endpoint (not deployed yet) must never block it.
  const data = useResource<Loaded>(
    async (signal) => {
      const [release, collaborators, sheets] = await Promise.all([
        fetchRelease(releaseId, { signal }),
        fetchCollaborators({ signal }).catch(() => [] as Collaborator[]),
        fetchReleaseSplits(releaseId, { signal }).catch(() => [] as SplitSheet[]),
      ]);
      return { release, collaborators, sheets };
    },
    [releaseId],
  );

  const tracks: Track[] = useMemo(
    () => [...(data.data?.release.tracks ?? [])].sort((a, b) => a.track_number - b.track_number),
    [data.data],
  );

  // Past collaborators, plus anyone already on a sheet for this release.
  const people: Collaborator[] = useMemo(() => {
    const map = new Map<string, Collaborator>();
    const add = (p: { email: string; name: string }) => {
      const e = p.email.trim().toLowerCase();
      if (!e || e === myEmail || map.has(e)) return;
      map.set(e, { email: e, name: p.name || e });
    };
    for (const p of data.data?.collaborators ?? []) add(p);
    for (const s of data.data?.sheets ?? []) for (const sh of s.shares) add(sh);
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [data.data, myEmail]);

  const nextKey = useRef(1);
  const newRow = (patch: Partial<Row> = {}): Row => ({
    key: nextKey.current++,
    who: "",
    email: "",
    name: "",
    percent: "",
    recoup: "",
    ...patch,
  });

  // Seed one table per track once: from the current sheet when there is one,
  // otherwise a single "Me, 100%" row.
  useEffect(() => {
    if (!data.data || tables) return;
    const seeded: Record<number, Table> = {};
    for (const tr of tracks) {
      const sheet = currentSheet(data.data.sheets, tr.id);
      if (sheet && sheet.shares.length) {
        seeded[tr.id] = {
          recoup: false,
          rows: sheet.shares.map((sh) =>
            newRow({
              who: sh.email.toLowerCase() === myEmail ? "me" : `c:${sh.email.toLowerCase()}`,
              percent: bpToPercentInput(sh.share_bp),
            }),
          ),
        };
      } else {
        seeded[tr.id] = { recoup: false, rows: [newRow({ who: "me", percent: "100" })] };
      }
    }
    setTables(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.data, tracks]);

  if (data.loading || (data.data && !tables && tracks.length > 0)) {
    return (
      <Card>
        <InlineLoading />
      </Card>
    );
  }
  if (data.error || !data.data) {
    return (
      <Card className="space-y-4">
        <LoadError error={data.error} onRetry={data.reload} compact />
        <Button variant="secondary" leftIcon={<ArrowLeft />} onClick={onCancel}>
          {c.changeRelease}
        </Button>
      </Card>
    );
  }

  const release = data.data.release;
  const header = (
    <Card padding="sm" className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-caption font-semibold uppercase tracking-wide text-text-subtle">{c.release}</p>
        <p className="break-words text-body font-bold text-text">
          {release.release_title}
          {release.version ? ` (${release.version})` : ""}
          <span className="font-normal text-text-muted"> · {release.artist_name}</span>
        </p>
      </div>
      {step === "edit" && (
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft />} onClick={onCancel}>
          {c.changeRelease}
        </Button>
      )}
    </Card>
  );

  if (tracks.length === 0 || !tables) {
    return (
      <div className="space-y-4">
        {header}
        <Card>
          <p className="text-body-sm text-text-muted">{c.noTracks}</p>
          <Button className="mt-4" variant="secondary" to={`/dashboard/music/${release.id}`}>
            {release.release_title}
          </Button>
        </Card>
      </div>
    );
  }

  const me = { name: user?.name || user?.email || c.you, email: user?.email ?? "" };

  return (
    <div className="space-y-4">
      {header}
      {step === "edit" ? (
        <EditTables
          tracks={tracks}
          tables={tables}
          setTables={setTables}
          people={people}
          me={me}
          newRow={newRow}
          onCancel={onCancel}
          onReview={() => setStep("review")}
        />
      ) : (
        <ReviewTables
          releaseId={release.id}
          tracks={tracks}
          tables={tables}
          people={people}
          me={me}
          onBack={() => setStep("edit")}
          onDone={onDone}
        />
      )}
    </div>
  );
}

/** The newest sheet for a track that still counts (pending or active). */
function currentSheet(sheets: SplitSheet[], trackId: number): SplitSheet | null {
  const open = sheets.filter((s) => s.track?.id === trackId && (s.status === "active" || s.status === "pending"));
  open.sort((a, b) => b.version - a.version);
  return open[0] ?? null;
}

/* ── Row model ─────────────────────────────────────────────────────── */

type Person = { name: string; email: string };

function resolve(row: Row, people: Collaborator[], me: Person): Person | null {
  if (row.who === "me") return me;
  if (row.who === "new") return { name: row.name.trim(), email: row.email.trim().toLowerCase() };
  if (row.who.startsWith("c:")) {
    const email = row.who.slice(2);
    const p = people.find((x) => x.email === email);
    return { name: p?.name ?? email, email };
  }
  return null;
}

function recoupMinor(row: Row, table: Table): bigint | null {
  if (!table.recoup || !row.recoup.trim()) return 0n;
  const parsed = parseAmount(row.recoup, RECOUP_CURRENCY);
  return parsed ? parsed.minor : null;
}

function validateTable(table: Table, people: Collaborator[], me: Person, c: typeof COPY.EN) {
  const emails = new Map<string, number>();
  for (const r of table.rows) {
    const p = resolve(r, people, me);
    const e = p?.email.toLowerCase();
    if (e) emails.set(e, (emails.get(e) ?? 0) + 1);
  }
  let total = 0;
  const rowErrors = table.rows.map((r) => {
    const errs: Partial<Record<RowField, string>> = {};
    if (!r.who) errs.who = c.collaboratorRequired;
    if (r.who === "new") {
      if (!r.name.trim()) errs.name = c.nameRequired;
      if (!EMAIL_RE.test(r.email.trim())) errs.email = c.emailInvalid;
    }
    const p = resolve(r, people, me);
    if (p?.email && (emails.get(p.email.toLowerCase()) ?? 0) > 1) {
      if (r.who === "new") errs.email = c.emailDuplicate;
      else errs.who = c.emailDuplicate;
    }
    const recoup = recoupMinor(r, table);
    if (recoup === null) errs.recoup = c.recoupInvalid;
    const bp = percentToBp(r.percent);
    if (bp === null || bp > TOTAL_BP) errs.percent = c.percentInvalid;
    else if (bp === 0 && !(recoup && recoup > 0n)) errs.percent = c.percentZero;
    if (bp !== null && bp >= 0) total += bp;
    return errs;
  });
  const ok = total === TOTAL_BP && rowErrors.every((e) => Object.keys(e).length === 0);
  return { rowErrors, total, ok };
}

/* ── Step 2: one table per track ───────────────────────────────────── */

function EditTables({
  tracks,
  tables,
  setTables,
  people,
  me,
  newRow,
  onCancel,
  onReview,
}: {
  tracks: Track[];
  tables: Record<number, Table>;
  setTables: (fn: (prev: Record<number, Table> | null) => Record<number, Table> | null) => void;
  people: Collaborator[];
  me: Person;
  newRow: (patch?: Partial<Row>) => Row;
  onCancel: () => void;
  onReview: () => void;
}) {
  const c = useCopy(COPY);
  const [attempted, setAttempted] = useState(false);

  const results = tracks.map((tr) => validateTable(tables[tr.id], people, me, c));
  const allOk = results.every((r) => r.ok);

  const patchTable = (trackId: number, fn: (t: Table) => Table) =>
    setTables((prev) => (prev ? { ...prev, [trackId]: fn(prev[trackId]) } : prev));

  return (
    <>
      <Card padding="sm">
        <h2 className="text-h4 font-bold">{c.editTitle}</h2>
        <p className="mt-1 text-body-sm text-text-muted">{c.editBody}</p>
      </Card>

      {tracks.map((tr, i) => (
        <TrackTable
          key={tr.id}
          track={tr}
          table={tables[tr.id]}
          result={results[i]}
          showErrors={attempted}
          people={people}
          me={me}
          onChange={(fn) => patchTable(tr.id, fn)}
          newRow={newRow}
        />
      ))}

      {attempted && !allOk && <FormAlert>{c.fixBeforeReview}</FormAlert>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel}>
          {c.cancel}
        </Button>
        <Button
          onClick={() => {
            setAttempted(true);
            if (allOk) onReview();
          }}
        >
          {c.review}
        </Button>
      </div>
    </>
  );
}

function TrackTable({
  track,
  table,
  result,
  showErrors,
  people,
  me,
  onChange,
  newRow,
}: {
  track: Track;
  table: Table;
  result: ReturnType<typeof validateTable>;
  showErrors: boolean;
  people: Collaborator[];
  me: Person;
  onChange: (fn: (t: Table) => Table) => void;
  newRow: (patch?: Partial<Row>) => Row;
}) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const headingId = `split-track-${track.id}`;
  const title = `${track.title}${track.version ? ` (${track.version})` : ""}`;

  const update = (key: number, patch: Partial<Row>) =>
    onChange((t) => ({ ...t, rows: t.rows.map((r) => (r.key === key ? { ...r, ...patch } : r)) }));
  const touch = (key: number, f: RowField) => setTouched((s) => new Set(s).add(`${key}.${f}`));
  const err = (i: number, f: RowField) =>
    showErrors || touched.has(`${table.rows[i].key}.${f}`) ? (result.rowErrors[i][f] ?? null) : null;

  const exact = result.total === TOTAL_BP;

  return (
    <Card as="section" aria-labelledby={headingId}>
      <h3 id={headingId} className="break-words text-h4 font-bold">
        {c.trackHeading(track.track_number, title)}
      </h3>

      <ol className="mt-4 space-y-3">
        {table.rows.map((r, i) => (
          <li
            key={r.key}
            aria-label={c.rowLabel(i + 1)}
            className="rounded-control border border-border-subtle p-3 sm:p-4"
          >
            <div
              className={cn(
                "grid gap-3",
                table.recoup ? "sm:grid-cols-[9rem_8rem_minmax(0,1fr)_auto]" : "sm:grid-cols-[8rem_minmax(0,1fr)_auto]",
              )}
            >
              {table.recoup && (
                <Field label={c.recoupFirst} error={err(i, "recoup")}>
                  <Input
                    inputMode="decimal"
                    value={r.recoup}
                    placeholder="0.00"
                    onChange={(e) => update(r.key, { recoup: e.target.value })}
                    onBlur={() => touch(r.key, "recoup")}
                    trailing={<span className="pr-3 text-body-sm text-text-subtle">{RECOUP_CURRENCY}</span>}
                  />
                </Field>
              )}
              <Field label={table.recoup ? c.thenShare : c.share} error={err(i, "percent")}>
                <Input
                  inputMode="decimal"
                  value={r.percent}
                  placeholder="0"
                  onChange={(e) => update(r.key, { percent: e.target.value })}
                  onBlur={() => touch(r.key, "percent")}
                  trailing={<span className="pr-3 text-body-sm text-text-subtle">%</span>}
                />
              </Field>
              <Field label={c.collaborator} error={err(i, "who")}>
                <Select
                  value={r.who}
                  placeholder={c.collaboratorPlaceholder}
                  onChange={(e) => update(r.key, { who: e.target.value as Who })}
                  onBlur={() => touch(r.key, "who")}
                >
                  <option value="me">{c.me(me.name)}</option>
                  {people.length > 0 && (
                    <optgroup label={c.pastGroup}>
                      {people.map((p) => (
                        <option key={p.email} value={`c:${p.email}`}>
                          {p.name && p.name !== p.email ? `${p.name} (${p.email})` : p.email}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="new">{c.addNew}</option>
                </Select>
              </Field>
              <div className="flex items-end justify-end">
                {table.rows.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={c.removeRow(i + 1)}
                    leftIcon={<Trash2 />}
                    className="sm:mb-1"
                    onClick={() => onChange((t) => ({ ...t, rows: t.rows.filter((x) => x.key !== r.key) }))}
                  >
                    <span className="sm:sr-only">{c.remove}</span>
                  </Button>
                )}
              </div>
            </div>

            {r.who === "new" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label={c.email} error={err(i, "email")}>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    value={r.email}
                    maxLength={255}
                    onChange={(e) => update(r.key, { email: e.target.value })}
                    onBlur={() => touch(r.key, "email")}
                  />
                </Field>
                <Field label={c.name} error={err(i, "name")}>
                  <Input
                    value={r.name}
                    maxLength={120}
                    onChange={(e) => update(r.key, { name: e.target.value })}
                    onBlur={() => touch(r.key, "name")}
                  />
                </Field>
              </div>
            )}
          </li>
        ))}
      </ol>

      {table.recoup && <p className="mt-2 text-[0.8125rem] text-text-subtle">{c.recoupHint}</p>}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {table.rows.length < MAX_ROWS && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus />}
              onClick={() => onChange((t) => ({ ...t, rows: [...t.rows, newRow()] }))}
            >
              {c.addCollaborator}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={table.recoup}
            onClick={() => onChange((t) => ({ ...t, recoup: !t.recoup }))}
          >
            {table.recoup ? c.removeRecoup : c.addRecoup}
          </Button>
        </div>

        <div
          aria-live="polite"
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-control border px-3.5 py-2 text-body-sm",
            exact ? "border-success/30 bg-success-soft" : "border-border-subtle",
          )}
        >
          <span className={cn("inline-flex items-center gap-1.5 font-bold tabular-nums", exact ? "text-success" : "text-text")}>
            {exact && <Check className="h-4 w-4" aria-hidden />}
            {exact ? c.totalOk : c.total(formatBp(result.total, locale))}
          </span>
          {!exact && (
            <span className={result.total > TOTAL_BP ? "text-danger" : "text-text-muted"}>
              {result.total > TOTAL_BP
                ? c.over(formatBp(result.total - TOTAL_BP, locale))
                : c.remaining(formatBp(TOTAL_BP - result.total, locale))}
            </span>
          )}
        </div>
      </div>
      {showErrors && !exact && (
        <p role="alert" className="mt-2 text-body-sm font-medium text-danger">
          {c.totalWrong}
        </p>
      )}
    </Card>
  );
}

/* ── Step 3: review and confirm ────────────────────────────────────── */

function buildShares(table: Table, people: Collaborator[], me: Person): TrackSplitShare[] {
  return table.rows.map((r) => {
    const p = resolve(r, people, me)!;
    const share: TrackSplitShare = {
      name: p.name,
      email: p.email,
      role: r.who === "me" ? "primary_artist" : "collaborator",
      share_bp: percentToBp(r.percent) ?? 0,
    };
    const recoup = recoupMinor(r, table);
    if (recoup && recoup > 0n) {
      share.recoup_minor = Number(recoup);
      share.recoup_currency = RECOUP_CURRENCY;
    }
    return share;
  });
}

function ReviewTables({
  releaseId,
  tracks,
  tables,
  people,
  me,
  onBack,
  onDone,
}: {
  releaseId: number;
  tracks: Track[];
  tables: Record<number, Table>;
  people: Collaborator[];
  me: Person;
  onBack: () => void;
  onDone: () => void;
}) {
  const c = useCopy(COPY);
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payloads = tracks.map((tr) => ({ track: tr, shares: buildShares(tables[tr.id], people, me) }));

  const confirm = async () => {
    setPending(true);
    setError(null);
    const done = new Set(saved);
    for (const p of payloads) {
      if (done.has(p.track.id)) continue;
      try {
        await proposeTrackSplit(releaseId, { track_id: p.track.id, shares: p.shares });
        done.add(p.track.id);
        setSaved(new Set(done));
      } catch (err) {
        setPending(false);
        const msg = isNotAvailable(err) ? c.notAvailable : errorMessageFor(err, t);
        setError(done.size > 0 ? `${c.savedPartly(done.size, payloads.length)} ${msg}` : msg);
        return;
      }
    }
    setPending(false);
    toast({ title: c.saved, tone: "success" });
    onDone();
  };

  return (
    <>
      <Card padding="sm">
        <h2 className="text-h4 font-bold">{c.reviewTitle}</h2>
        <p className="mt-1 text-body-sm text-text-muted">{c.reviewBody}</p>
      </Card>

      {payloads.map(({ track, shares }) => {
        const title = `${track.title}${track.version ? ` (${track.version})` : ""}`;
        return (
          <Card as="section" key={track.id} aria-label={c.trackHeading(track.track_number, title)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="break-words text-h4 font-bold">{c.trackHeading(track.track_number, title)}</h3>
              {saved.has(track.id) && (
                <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-success">
                  <Check className="h-4 w-4" aria-hidden />
                  {c.trackSaved}
                </span>
              )}
            </div>
            <ul className="mt-3 divide-y divide-border-subtle">
              {shares.map((s) => (
                <li key={s.email} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
                  <span className="min-w-0 break-words text-body-sm">
                    <span className="font-semibold text-text">{s.name}</span>
                    {s.email.toLowerCase() === me.email.toLowerCase() ? (
                      <span className="ml-2 text-caption font-medium text-accent-text">{c.you}</span>
                    ) : (
                      <span className="ml-2 break-all text-text-muted">{s.email}</span>
                    )}
                  </span>
                  <span className="text-body-sm font-bold tabular-nums text-text">
                    {s.recoup_minor
                      ? c.reviewRecoup(formatMinor(s.recoup_minor, RECOUP_CURRENCY, locale), formatBp(s.share_bp, locale))
                      : formatBp(s.share_bp, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}

      {error && <FormAlert>{error}</FormAlert>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={onBack} disabled={pending}>
          {c.back}
        </Button>
        <Button onClick={() => void confirm()} loading={pending}>
          {c.confirm}
        </Button>
      </div>
    </>
  );
}
