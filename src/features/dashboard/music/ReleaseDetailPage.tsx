import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, ExternalLink, Pencil, Send, Trash2, Undo2, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Stepper,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  useToast,
} from "@/components/ui";
import {
  deleteRelease,
  fetchRelease,
  fetchReleaseConfig,
  fetchReleaseSplits,
  fetchStores,
  fetchValidation,
  requestTakedown,
  submitRelease,
  withdrawSubmission,
} from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/errors";
import type { Release, ReleaseValidation, ValidationItem } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate, formatDateTime } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { countryName } from "@/lib/countries";
import { formatBp } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import {
  ConfirmDialog,
  CopyButton,
  DefinitionList,
  FormAlert,
  LoadError,
  PageHeader,
  PageLoading,
  SandboxBadge,
  Section,
  StatusPill,
} from "../components";
import { COPY } from "./copy";
import { ReleaseCover, formatDuration, isSmartLinkPublic, smartLinkUrl } from "./shared";
import { SERVER_STEP } from "./wizard/validation";

type TabKey = "overview" | "tracks" | "stores" | "smartlink" | "splits" | "history" | "issues";
const TAKEDOWN_FROM = new Set(["delivered", "partially_delivered", "live"]);

/**
 * Release detail — GET /releases/{id} (tracks, issues, deliveries, timeline).
 * Actions follow the state machine (app/Domain/Release/ReleaseStatus):
 *   draft / changes_requested → edit, submit (draft → also delete)
 *   submitted                 → withdraw back to draft
 *   delivered / partially_delivered / live → request takedown
 */
export default function ReleaseDetailPage() {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const toMessage = useErrorMessage();

  const state = useResource((signal) => fetchRelease(id!, { signal }), [id]);
  const languages = useResource(() => fetchReleaseConfig().then((cfg) => cfg.languages), []);
  const [dialog, setDialog] = useState<null | "withdraw" | "takedown" | "delete">(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitProblem, setSubmitProblem] = useState<
    null | { kind: "plan" } | { kind: "invalid"; errors: ValidationItem[] } | { kind: "error"; message: string }
  >(null);

  const tabParam = params.get("tab") as TabKey | null;

  if (state.loading) return <PageLoading />;
  if (state.error || !state.data) return <LoadError error={state.error} onRetry={state.reload} />;
  const r = state.data;

  const showIssues = (r.open_issues?.length ?? 0) > 0 || r.status === "changes_requested";
  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: "overview", label: c.tabOverview },
    { key: "tracks", label: c.tabTracks, badge: r.tracks?.length },
    { key: "stores", label: c.tabStores },
    { key: "smartlink", label: c.tabSmartLink },
    { key: "splits", label: c.tabSplits },
    { key: "history", label: c.tabHistory },
    ...(showIssues ? [{ key: "issues" as const, label: c.tabIssues, badge: r.open_issues?.length }] : []),
  ];
  const tab: TabKey = tabs.some((t) => t.key === tabParam) ? (tabParam as TabKey) : showIssues ? "issues" : "overview";
  const setTab = (v: string) => {
    const next = new URLSearchParams(params);
    if (v === "overview") next.delete("tab");
    else next.set("tab", v);
    setParams(next, { replace: true });
  };

  const trySubmit = async () => {
    setSubmitting(true);
    setSubmitProblem(null);
    try {
      const v: ReleaseValidation = await fetchValidation(r.id);
      if (!v.ready) {
        setSubmitProblem({ kind: "invalid", errors: v.errors });
        return;
      }
      await submitRelease(r.id);
      toast({ title: c.submitted, tone: "success" });
      state.reload();
    } catch (err) {
      if (err instanceof ApiError && err.code === "subscription_required") setSubmitProblem({ kind: "plan" });
      else if (err instanceof ApiError && err.code === "release_incomplete") {
        const v = (err.details?.validation ?? null) as ReleaseValidation | null;
        setSubmitProblem({ kind: "invalid", errors: v?.errors ?? [] });
      } else setSubmitProblem({ kind: "error", message: toMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const actions: ReactNode[] = [];
  if (r.is_editable) {
    actions.push(
      <Button key="edit" variant="secondary" leftIcon={<Pencil />} to={`/dashboard/music/${r.id}/edit`}>
        {c.continueEditing}
      </Button>,
      <Button key="submit" leftIcon={<Send />} loading={submitting} onClick={trySubmit}>
        {submitting ? c.submitting : c.submit}
      </Button>,
    );
  }
  if (r.status === "draft") {
    actions.push(
      <Button key="delete" variant="ghost" leftIcon={<Trash2 />} onClick={() => setDialog("delete")}>
        {c.deleteDraft}
      </Button>,
    );
  }
  if (r.status === "submitted") {
    actions.push(
      <Button key="withdraw" variant="secondary" leftIcon={<Undo2 />} onClick={() => setDialog("withdraw")}>
        {c.withdraw}
      </Button>,
    );
  }
  if (TAKEDOWN_FROM.has(r.status)) {
    actions.push(
      <Button key="takedown" variant="secondary" leftIcon={<XCircle />} onClick={() => setDialog("takedown")}>
        {c.takedown}
      </Button>,
    );
  }

  return (
    <>
      <PageHeader
        back={{ to: "/dashboard/music", label: c.backToCatalog }}
        title={
          <>
            {r.release_title || "—"}
            {r.version && <span className="font-normal text-text-subtle"> ({r.version})</span>}
          </>
        }
        meta={<StatusPill status={r.status} size="md" />}
        description={`${r.release_type} · ${c.by(r.artist_name || "—")}`}
        actions={actions.length ? actions : undefined}
      />

      {submitProblem && (
        <FormAlert tone={submitProblem.kind === "error" ? "danger" : "warning"} className="mb-6">
          {submitProblem.kind === "plan" && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {c.subscriptionRequired}
              <Link to="/dashboard/plan" className="font-semibold text-accent-text underline underline-offset-2">
                {c.choosePlan}
              </Link>
            </span>
          )}
          {submitProblem.kind === "error" && submitProblem.message}
          {submitProblem.kind === "invalid" && (
            <div>
              <p className="font-semibold">{c.notReadyTitle}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {submitProblem.errors.slice(0, 8).map((e, i) => (
                  <li key={i}>{e.message}</li>
                ))}
              </ul>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                to={`/dashboard/music/${r.id}/edit?step=${SERVER_STEP[submitProblem.errors[0]?.step] ?? "review"}`}
              >
                {c.fixInWizard}
              </Button>
            </div>
          )}
        </FormAlert>
      )}

      <div className="mb-8 grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <ReleaseCover src={r.cover_image} title={r.release_title} size="lg" />
        <div className="min-w-0 space-y-4">
          {r.status === "rejected" ? (
            <FormAlert tone="danger">
              <p className="font-semibold">{c.rejectionTitle}</p>
              {r.rejection_reason && <p className="mt-1">{r.rejection_reason}</p>}
            </FormAlert>
          ) : (
            <div>
              <p className="mb-3 text-caption font-medium text-text-subtle">{c.stageLabel}</p>
              <Stepper
                ariaLabel={c.stageLabel}
                completedLabel={t("common.completed")}
                current={Math.min(Math.max(r.stage, 0), c.stages.length - 1)}
                steps={c.stages.map((label, i) => ({ id: String(i), label }))}
              />
            </div>
          )}
          {r.status === "changes_requested" && (
            <FormAlert tone="warning">
              <p className="font-semibold">{c.changesTitle}</p>
              <p className="mt-1">{c.changesBody}</p>
            </FormAlert>
          )}
          {!r.is_editable && <p className="text-caption text-text-subtle">{c.lockedNote}</p>}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} variant="underline">
        <TabList aria-label={c.tabsLabel} className="mb-6">
          {tabs.map((t) => (
            <Tab key={t.key} value={t.key}>
              {t.label}
              {t.badge ? <span className="ml-1.5 text-text-subtle tabular-nums">{t.badge}</span> : null}
            </Tab>
          ))}
        </TabList>

        <TabPanel value="overview">
          <OverviewTab r={r} languages={languages.data ?? {}} />
        </TabPanel>
        <TabPanel value="tracks">
          <TracksTab r={r} />
        </TabPanel>
        <TabPanel value="stores">
          <StoresTab r={r} />
        </TabPanel>
        <TabPanel value="smartlink">
          <SmartLinkTab r={r} />
        </TabPanel>
        <TabPanel value="splits">
          <SplitsTab r={r} />
        </TabPanel>
        <TabPanel value="history">
          <HistoryTab r={r} />
        </TabPanel>
        {showIssues && (
          <TabPanel value="issues">
            <IssuesTab r={r} />
          </TabPanel>
        )}
      </Tabs>

      <ConfirmDialog
        open={dialog === "withdraw"}
        onClose={() => setDialog(null)}
        title={c.withdrawTitle}
        description={c.withdrawBody}
        confirmLabel={c.withdraw}
        onConfirm={async () => {
          await withdrawSubmission(r.id);
          toast({ title: c.withdrawn, tone: "success" });
          state.reload();
        }}
      />
      <ConfirmDialog
        open={dialog === "takedown"}
        onClose={() => setDialog(null)}
        title={c.takedownTitle}
        description={c.takedownBody}
        confirmLabel={c.takedown}
        danger
        reason={{ label: c.takedownReason, hint: c.takedownHint, minLength: 5 }}
        onConfirm={async (reason) => {
          await requestTakedown(r.id, reason);
          toast({ title: c.takedownRequested, tone: "success" });
          state.reload();
        }}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        title={c.deleteTitle}
        description={c.deleteBody}
        confirmLabel={c.deleteDraft}
        danger
        onConfirm={async () => {
          await deleteRelease(r.id);
          toast({ title: c.deleted, tone: "success" });
          navigate("/dashboard/music", { replace: true });
        }}
      />
    </>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────────── */

function OverviewTab({ r, languages }: { r: Release; languages: Record<string, string> }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const territories =
    r.territories?.mode === "include"
      ? c.onlyIn(r.territories.countries.map((cc) => countryName(cc, locale)).join(", "))
      : r.territories?.mode === "exclude"
        ? c.exceptIn(r.territories.countries.map((cc) => countryName(cc, locale)).join(", "))
        : c.worldwide;
  return (
    <Card>
      <DefinitionList
        columns={3}
        items={[
          { label: c.fType, value: r.release_type },
          { label: c.fArtist, value: r.artist_name || c.none },
          {
            label: c.fAdditional,
            value: r.additional_artists.map((a) => a.name).join(", "),
            hidden: !r.additional_artists?.length,
          },
          { label: c.fVersion, value: r.version, hidden: !r.version },
          { label: c.fGenre, value: [r.primary_genre, r.secondary_genre].filter(Boolean).join(" / ") || c.none },
          { label: c.fLanguage, value: r.language ? (languages[r.language] ?? r.language) : c.none },
          { label: c.fReleaseDate, value: formatDate(r.release_date, locale) },
          { label: c.fOriginalDate, value: formatDate(r.original_release_date, locale), hidden: !r.previously_released },
          { label: c.fLabel, value: r.record_label || c.none },
          { label: c.fCLine, value: r.c_line_owner ? `© ${r.c_line_year ?? ""} ${r.c_line_owner}` : c.none },
          { label: c.fPLine, value: r.p_line_owner ? `℗ ${r.p_line_year ?? ""} ${r.p_line_owner}` : c.none },
          { label: c.fUpc, value: r.upc || c.upcPending },
          { label: c.fTerritories, value: territories },
          { label: c.fSubmitted, value: formatDateTime(r.submitted_at, locale), hidden: !r.submitted_at },
          { label: c.fApproved, value: formatDateTime(r.approved_at, locale), hidden: !r.approved_at },
          { label: c.fLive, value: formatDateTime(r.live_at, locale), hidden: !r.live_at },
        ]}
      />
    </Card>
  );
}

function TracksTab({ r }: { r: Release }) {
  const c = useCopy(COPY);
  const tracks = r.tracks ?? [];
  if (!tracks.length) return <EmptyState compact title={c.noTracks} />;
  return (
    <ol className="space-y-3">
      {tracks.map((t) => (
        <li key={t.id}>
          <Card padding="sm">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p className="font-semibold text-text">
                  <span className="mr-2 tabular-nums text-text-subtle">{t.track_number}.</span>
                  {t.title}
                  {t.version && <span className="font-normal text-text-subtle"> ({t.version})</span>}
                </p>
                <p className="mt-0.5 text-caption text-text-subtle">
                  {[t.primary_artist, t.featured_artists?.length ? `feat. ${t.featured_artists.join(", ")}` : null]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {t.explicit && <Badge size="sm" tone="warning">{c.trackExplicit}</Badge>}
                {t.instrumental && <Badge size="sm">{c.trackInstrumental}</Badge>}
                <Badge size="sm">{t.isrc || c.isrcPending}</Badge>
              </div>
            </div>
            {t.audio ? (
              <div className="mt-3 space-y-2">
                <p className="text-caption text-text-subtle">
                  {[
                    t.audio.format?.toUpperCase(),
                    t.audio.sample_rate ? `${t.audio.sample_rate / 1000} kHz` : null,
                    t.audio.bit_depth ? `${t.audio.bit_depth}-bit` : null,
                    formatDuration(t.audio.duration_ms),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {t.audio_url && (
                  <audio controls preload="none" src={t.audio_url} className="w-full max-w-md" aria-label={c.audioPreview(t.title)} />
                )}
              </div>
            ) : (
              <p className="mt-3 text-caption text-warning">{c.trackNoAudio}</p>
            )}
            {!!t.credits?.length && (
              <p className="mt-3 text-caption text-text-muted">
                <span className="font-semibold text-text-subtle">{c.credits}: </span>
                {t.credits.map((cr) => `${cr.name} (${c.creditRoles[cr.role] ?? cr.role})`).join(", ")}
              </p>
            )}
          </Card>
        </li>
      ))}
    </ol>
  );
}

function StoresTab({ r }: { r: Release }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const stores = useResource(() => fetchStores(), []);
  const name = (slug: string) => stores.data?.find((s) => s.slug === slug)?.name ?? slug;
  const deliveries = r.deliveries ?? [];
  return (
    <div className="space-y-8">
      <Section title={c.selectedStores}>
        {r.platforms?.length ? (
          <ul className="flex flex-wrap gap-2">
            {r.platforms.map((p) => (
              <li key={p}>
                <Badge>{name(p)}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-text-subtle">{c.noStores}</p>
        )}
      </Section>
      <Section title={c.deliveriesTitle}>
        {deliveries.length === 0 ? (
          <EmptyState compact title={c.deliveriesEmpty} />
        ) : (
          <ul className="divide-y divide-border-subtle rounded-card border border-border-subtle">
            {deliveries.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-semibold text-text">{d.store.name}</span>
                  <StatusPill status={d.status} />
                  {d.is_sandbox && <SandboxBadge />}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-caption text-text-subtle">
                  {d.live_at ? c.liveAt(formatDate(d.live_at, locale)) : d.delivered_at ? c.deliveredAt(formatDate(d.delivered_at, locale)) : null}
                  {d.live_url && !d.is_sandbox && (
                    <a
                      href={d.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-accent-text hover:underline"
                    >
                      {c.openInStore(d.store.name)}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function SmartLinkTab({ r }: { r: Release }) {
  const c = useCopy(COPY);
  const url = smartLinkUrl(r);
  const isPublic = isSmartLinkPublic(r);
  return (
    <Card>
      <h2 className="text-h4 font-bold">{c.smartLinkTitle}</h2>
      <p className="mt-1 max-w-[60ch] text-body-sm text-text-muted">{c.smartLinkBody}</p>
      {!url ? (
        <p className="mt-4 text-body-sm text-text-subtle">{c.noSlug}</p>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {!r.smart_link_enabled ? (
              <Badge>{c.smartLinkDisabled}</Badge>
            ) : isPublic ? (
              <Badge tone="success" dot>
                {c.smartLinkPublic}
              </Badge>
            ) : (
              <Badge tone="warning" dot>
                {c.smartLinkNotYet}
              </Badge>
            )}
            <Badge>{r.presave_enabled ? c.presaveOn : c.presaveOff}</Badge>
          </div>
          <p className="break-all rounded-control border border-border-subtle bg-surface-sunken px-3 py-2 font-mono text-body-sm text-text">
            {url}
          </p>
          {!isPublic && r.smart_link_enabled && <p className="text-caption text-text-subtle">{c.smartLinkNotYetBody}</p>}
          <div className="flex flex-wrap gap-2">
            <CopyButton value={url} />
            {isPublic && (
              <Button variant="secondary" size="sm" href={url} target="_blank" rel="noopener noreferrer" rightIcon={<ExternalLink />}>
                {c.openPage}
              </Button>
            )}
            <Button variant="ghost" size="sm" to="/dashboard/promotion">
              {c.statsInPromotion}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function SplitsTab({ r }: { r: Release }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const sheets = useResource((signal) => fetchReleaseSplits(r.id, { signal }), [r.id]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-[60ch] text-body-sm text-text-muted">{c.splitsBody}</p>
        <Button variant="secondary" size="sm" to={`/dashboard/splits?release=${r.id}`}>
          {c.manageSplits}
        </Button>
      </div>
      {sheets.error ? (
        <LoadError error={sheets.error} onRetry={sheets.reload} compact />
      ) : sheets.loading ? null : !sheets.data?.length ? (
        <EmptyState compact title={c.splitsEmpty} />
      ) : (
        <ul className="space-y-3">
          {sheets.data.map((s) => (
            <li key={s.id}>
              <Card padding="sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{c.version(s.version)}</span>
                  <StatusPill status={s.status} />
                  <span className="text-caption text-text-subtle">
                    {s.track ? s.track.title : c.wholeRelease}
                    {s.effective_from ? ` · ${c.effectiveFrom(formatDate(s.effective_from, locale))}` : ""}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {s.shares.map((sh) => (
                    <li key={sh.id} className="flex flex-wrap items-center justify-between gap-2 text-body-sm">
                      <span className="min-w-0 break-words text-text">
                        {sh.name} <span className="text-text-subtle">· {sh.email}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums">{formatBp(sh.share_bp, locale)}</span>
                        <StatusPill status={sh.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryTab({ r }: { r: Release }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const events = [...(r.timeline ?? [])].reverse();
  if (!events.length) return <EmptyState compact title={c.historyEmpty} />;
  const actor = (a: string | null) => (a === "user" ? c.byYou : a === "admin" || a === "staff" ? c.byTeam : c.bySystem);
  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span aria-hidden className="absolute -left-[1.62rem] top-1.5 h-2.5 w-2.5 rounded-full bg-accent-text" />
          <div className="flex flex-wrap items-center gap-2">
            {e.to ? <StatusPill status={e.to} /> : <span className="font-semibold">{e.event.replace(/[._]/g, " ")}</span>}
            <span className="text-caption text-text-subtle">
              {formatDateTime(e.at, locale)} · {actor(e.actor_type)}
            </span>
          </div>
          {e.note && <p className="mt-1.5 break-words text-body-sm text-text-muted">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}

function IssuesTab({ r }: { r: Release }) {
  const c = useCopy(COPY);
  const issues = r.open_issues ?? [];
  const trackTitle = (id: number | null) => r.tracks?.find((t) => t.id === id)?.title ?? null;
  return (
    <div className="space-y-4">
      {r.status === "changes_requested" && <p className="text-body-sm text-text-muted">{c.changesBody}</p>}
      {issues.length === 0 ? (
        <EmptyState compact title={c.issuesEmpty} />
      ) : (
        <ul className="space-y-2">
          {issues.map((i) => (
            <li key={i.id}>
              <Card padding="sm" className="flex gap-3">
                <AlertTriangle
                  className={i.severity === "blocking" || i.severity === "error" ? "mt-0.5 h-4 w-4 shrink-0 text-danger" : "mt-0.5 h-4 w-4 shrink-0 text-warning"}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="break-words text-body-sm text-text">{i.message}</p>
                  <p className="mt-1 text-caption text-text-subtle">
                    {[i.track_id ? c.issueTrack(trackTitle(i.track_id) ?? `#${i.track_id}`) : null, i.field ? c.issueField(i.field) : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {r.is_editable && (
        <Button leftIcon={<Pencil />} to={`/dashboard/music/${r.id}/edit`}>
          {c.continueEditing}
        </Button>
      )}
    </div>
  );
}
