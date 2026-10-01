import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Dialog, Field, Input, Select } from "@/components/ui";
import { FormAlert, InlineLoading, LoadError, useAction } from "@/features/dashboard/components";
import { fetchRelease, fetchReleases, proposeSplit } from "@/lib/api/catalog";
import type { SplitSheet } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { todayIso } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatBp, percentToBp } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY, ROLE_KEYS } from "./copy";

/**
 * The "New split sheet" form. Shares are typed as percentages and sent as
 * integer basis points (percentToBp); the submit button only enables when
 * every row is valid and the total is exactly 10000 bp.
 */

type Row = { key: number; name: string; email: string; role: string; percent: string };
type RowField = "name" | "email" | "percent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL_BP = 10000;

export function NewSplitDialog({
  open,
  onClose,
  initialReleaseId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  initialReleaseId: number | null;
  onCreated: (sheet: SplitSheet, message: string) => void;
}) {
  const c = useCopy(COPY);
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const nextKey = useRef(2);

  const releases = useResource((signal) => fetchReleases({ per_page: 100, sort: "newest" }, { signal }), []);
  const [releaseId, setReleaseId] = useState<string>(initialReleaseId ? String(initialReleaseId) : "");
  const [trackId, setTrackId] = useState("");
  const [effective, setEffective] = useState("");
  const [rows, setRows] = useState<Row[]>(() => [
    { key: 1, name: user?.name ?? "", email: user?.email ?? "", role: "primary_artist", percent: "" },
  ]);
  // If the profile arrives after the form opened, prefill the owner row once.
  useEffect(() => {
    if (!user) return;
    setRows((rs) =>
      rs.map((r) => (r.key === 1 && !r.name && !r.email ? { ...r, name: user.name ?? "", email: user.email ?? "" } : r)),
    );
  }, [user]);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [attempted, setAttempted] = useState(false);

  const release = useResource(
    (signal) => (releaseId ? fetchRelease(releaseId, { signal }) : Promise.resolve(null)),
    [releaseId],
  );
  const tracks = releaseId && release.data && String(release.data.id) === releaseId ? (release.data.tracks ?? []) : [];

  const submit = useAction(() =>
    proposeSplit(Number(releaseId), {
      track_id: trackId ? Number(trackId) : null,
      effective_from: effective || null,
      shares: rows.map((r) => ({
        name: r.name.trim(),
        email: r.email.trim(),
        role: r.role || null,
        share_bp: percentToBp(r.percent) ?? 0,
      })),
    }),
  );

  /* ── Validation ─────────────────────────────────────────────────── */

  const rowErrors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      const e = r.email.trim().toLowerCase();
      if (e) counts.set(e, (counts.get(e) ?? 0) + 1);
    }
    return rows.map((r) => {
      const errs: Partial<Record<RowField, string>> = {};
      if (!r.name.trim()) errs.name = c.nameRequired;
      const email = r.email.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) errs.email = c.emailInvalid;
      else if ((counts.get(email) ?? 0) > 1) errs.email = c.emailDuplicate;
      const bp = percentToBp(r.percent);
      if (bp === null || bp <= 0 || bp > TOTAL_BP) errs.percent = c.percentInvalid;
      return errs;
    });
  }, [rows, c]);

  const total = rows.reduce((sum, r) => {
    const bp = percentToBp(r.percent);
    return sum + (bp !== null && bp > 0 ? bp : 0);
  }, 0);
  const rowsValid = rowErrors.every((e) => Object.keys(e).length === 0);
  const effectiveInvalid = !!effective && effective < todayIso();
  const canSubmit = !!releaseId && rowsValid && total === TOTAL_BP && !effectiveInvalid;

  const showErr = (i: number, f: RowField) => {
    const server = submit.fieldErrors[`shares.${i}.${f === "percent" ? "share_bp" : f}`];
    if (server) return server;
    return attempted || touched.has(`${rows[i].key}.${f}`) ? (rowErrors[i][f] ?? null) : null;
  };

  const update = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const touch = (key: number, f: RowField) => setTouched((s) => new Set(s).add(`${key}.${f}`));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!canSubmit) return;
    const res = await submit.run();
    if (res.ok) {
      onCreated(res.value.sheet, res.value.sheet?.status === "active" ? c.createdActive : c.created);
    }
  };

  const serverShareErrors = Object.keys(submit.fieldErrors).some((k) => k.startsWith("shares"));
  const releaseList = releases.data?.releases ?? [];
  const formId = "new-split-form";

  return (
    <Dialog
      open={open}
      onClose={submit.pending ? () => {} : onClose}
      dismissible={!submit.pending}
      size="lg"
      title={c.formTitle}
      description={c.formDescription}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submit.pending}>
            {c.cancel}
          </Button>
          <Button type="submit" form={formId} loading={submit.pending} disabled={!canSubmit}>
            {c.submit}
          </Button>
        </>
      }
    >
      {releases.loading ? (
        <InlineLoading label={c.loadingReleases} />
      ) : releases.error ? (
        <LoadError error={releases.error} onRetry={releases.reload} compact />
      ) : releaseList.length === 0 ? (
        <p className="text-body-sm text-text-muted">{c.releasesEmpty}</p>
      ) : (
        <form id={formId} onSubmit={onSubmit} noValidate className="space-y-5">
          {submit.error && !serverShareErrors && <FormAlert>{submit.error}</FormAlert>}
          {submit.error && serverShareErrors && <FormAlert>{t("err.fix_fields")}</FormAlert>}

          <Field label={c.release} error={submit.fieldErrors.release_id} required>
            <Select
              value={releaseId}
              onChange={(e) => {
                setReleaseId(e.target.value);
                setTrackId("");
              }}
              placeholder={c.releasePlaceholder}
            >
              {releaseList.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {[r.release_title, r.version ? `(${r.version})` : null, "—", r.artist_name].filter(Boolean).join(" ")}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={c.trackLabel} hint={c.trackHint} error={submit.fieldErrors.track_id}>
              <Select
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                disabled={!releaseId || release.loading}
              >
                <option value="">{c.wholeRelease}</option>
                {tracks.map((tr) => (
                  <option key={tr.id} value={String(tr.id)}>
                    {`${tr.track_number}. ${tr.title}${tr.version ? ` (${tr.version})` : ""}`}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={c.effective}
              hint={c.effectiveHint}
              error={effectiveInvalid ? c.effectivePast : submit.fieldErrors.effective_from}
              optional
              optionalLabel={t("common.optional")}
            >
              <Input type="date" min={todayIso()} value={effective} onChange={(e) => setEffective(e.target.value)} />
            </Field>
          </div>

          <fieldset className="min-w-0">
            <legend className="mb-2 text-[0.875rem] font-semibold text-text-muted">{c.sharesLegend}</legend>
            <ol className="space-y-3">
              {rows.map((r, i) => (
                <li
                  key={r.key}
                  className="rounded-control border border-border-subtle bg-white/[0.02] p-3.5"
                  aria-label={c.rowLabel(i + 1)}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-body-sm font-semibold text-text">
                      {c.rowLabel(i + 1)}
                      {user?.email && r.email.trim().toLowerCase() === user.email.toLowerCase() && (
                        <span className="ml-2 text-caption font-medium text-accent-text">{c.you}</span>
                      )}
                    </span>
                    {rows.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={c.removeRow(i + 1)}
                        leftIcon={<Trash2 />}
                        onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                      >
                        <span className="sr-only sm:not-sr-only">{t("act.remove")}</span>
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={c.shareName} error={showErr(i, "name")} required>
                      <Input
                        value={r.name}
                        maxLength={120}
                        onChange={(e) => update(r.key, { name: e.target.value })}
                        onBlur={() => touch(r.key, "name")}
                      />
                    </Field>
                    <Field label={c.shareEmail} error={showErr(i, "email")} required>
                      <Input
                        type="email"
                        inputMode="email"
                        value={r.email}
                        maxLength={255}
                        onChange={(e) => update(r.key, { email: e.target.value })}
                        onBlur={() => touch(r.key, "email")}
                      />
                    </Field>
                    <Field label={c.shareRole} error={submit.fieldErrors[`shares.${i}.role`]}>
                      <Select value={r.role} onChange={(e) => update(r.key, { role: e.target.value })}>
                        {ROLE_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {c.roles[k]}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label={c.sharePercent} error={showErr(i, "percent")} required>
                      <Input
                        inputMode="decimal"
                        value={r.percent}
                        placeholder="50"
                        onChange={(e) => update(r.key, { percent: e.target.value })}
                        onBlur={() => touch(r.key, "percent")}
                        trailing={<span className="pr-3 text-body-sm text-text-subtle">%</span>}
                      />
                    </Field>
                  </div>
                </li>
              ))}
            </ol>
            {rows.length < 20 && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                leftIcon={<Plus />}
                onClick={() => {
                  const key = nextKey.current++;
                  setRows((rs) => [...rs, { key, name: "", email: "", role: "collaborator", percent: "" }]);
                }}
              >
                {c.addRow}
              </Button>
            )}
          </fieldset>

          <div
            aria-live="polite"
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 rounded-control border px-4 py-3 text-body-sm",
              total === TOTAL_BP ? "border-success/30 bg-success-soft" : "border-border-subtle bg-white/[0.03]",
            )}
          >
            <span className="font-semibold text-text">
              {c.total}: <span className="tabular-nums">{formatBp(total, locale)}</span>
            </span>
            <span className={total > TOTAL_BP ? "text-danger" : total === TOTAL_BP ? "text-success" : "text-text-muted"}>
              {total === TOTAL_BP
                ? c.exact
                : total > TOTAL_BP
                  ? c.over(formatBp(total - TOTAL_BP, locale))
                  : c.remaining(formatBp(TOTAL_BP - total, locale))}
            </span>
          </div>
        </form>
      )}
    </Dialog>
  );
}
