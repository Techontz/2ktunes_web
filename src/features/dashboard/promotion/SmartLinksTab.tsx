import { useState } from "react";
import { BarChart3, Disc3, ExternalLink, Link2, Lock } from "lucide-react";
import { Badge, Button, Card, Checkbox, Dialog, EmptyState, Field, Select, Stat, useToast } from "@/components/ui";
import { CopyButton, FormAlert, InlineLoading, LoadError, PageLoading, StatGrid, StatusPill, useAction } from "@/features/dashboard/components";
import { countryName, useLabels } from "@/features/dashboard/marketplace/labels";
import { fetchAnalytics } from "@/lib/api/account";
import { fetchReleases, updateRelease } from "@/lib/api/catalog";
import type { CountRow, Release } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

const HIDDEN = ["draft", "rejected", "taken_down"];

export function smartLinkUrl(r: Pick<Release, "smart_link_url" | "slug">): string | null {
  if (r.smart_link_url) return r.smart_link_url;
  return r.slug ? `${window.location.origin}/r/${r.slug}` : null;
}

export function SmartLinksTab() {
  const c = useCopy(COPY);
  const res = useResource((signal) => fetchReleases({ per_page: 100 }, { signal }), []);
  const [stats, setStats] = useState<Release | null>(null);

  if (res.loading) return <PageLoading rows={2} />;
  if (res.error) return <LoadError error={res.error} onRetry={res.reload} />;
  const releases = res.data!.releases;

  const replace = (r: Release) =>
    res.setData((prev) => (prev ? { ...prev, releases: prev.releases.map((x) => (x.id === r.id ? { ...x, ...r } : x)) } : prev));

  return (
    <div>
      <p className="mb-5 max-w-[65ch] text-body-sm text-text-muted">{c.linksIntro}</p>
      {releases.length === 0 ? (
        <EmptyState
          icon={<Disc3 />}
          title={c.noReleasesTitle}
          description={c.noReleasesBody}
          action={<Button to="/dashboard/new-release">{c.newRelease}</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {releases.map((r) => (
            <SmartLinkRow key={r.id} release={r} onSaved={replace} onStats={() => setStats(r)} />
          ))}
        </ul>
      )}
      <StatsDialog release={stats} onClose={() => setStats(null)} />
    </div>
  );
}

function SmartLinkRow({
  release: r,
  onSaved,
  onStats,
}: {
  release: Release;
  onSaved: (r: Release) => void;
  onStats: () => void;
}) {
  const c = useCopy(COPY);
  const { toast } = useToast();
  const url = smartLinkUrl(r);
  const isPublic = r.smart_link_enabled && !HIDDEN.includes(r.status);
  const save = useAction((patch: { smart_link_enabled?: boolean; presave_enabled?: boolean }) => updateRelease(r.id, patch));

  const toggle = async (patch: { smart_link_enabled?: boolean; presave_enabled?: boolean }) => {
    const res = await save.run(patch);
    if (res.ok) {
      onSaved(res.value);
      toast({ title: c.saved, tone: "success" });
    }
  };

  let state: { tone: "success" | "neutral" | "warning"; text: string };
  if (!r.smart_link_enabled) state = { tone: "neutral", text: c.linkOff };
  else if (r.status === "draft") state = { tone: "warning", text: c.linkNotYet };
  else if (HIDDEN.includes(r.status)) state = { tone: "neutral", text: c.linkHidden };
  else state = { tone: "success", text: c.linkPublic };

  return (
    <li className="min-w-0">
      <Card padding="sm" className="space-y-4">
        <div className="flex min-w-0 flex-wrap items-start gap-3">
          {r.cover_image ? (
            <img src={r.cover_image} alt={c.cover(r.release_title)} className="h-14 w-14 shrink-0 rounded-[8px] object-cover" />
          ) : (
            <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] bg-white/[0.06] text-text-subtle">
              <Disc3 className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-bold text-text">{r.release_title}</h3>
            <p className="break-words text-caption text-text-subtle">{r.artist_name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusPill status={r.status} label={r.status_label || undefined} />
              <Badge tone={state.tone} size="sm">
                {state.text}
              </Badge>
            </div>
          </div>
        </div>

        {url ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-control border border-border-subtle bg-surface-sunken px-3 py-2">
            <Link2 className="h-4 w-4 shrink-0 text-text-subtle" aria-hidden />
            <span className="sr-only">{c.linkUrl(r.release_title)}: </span>
            <code className="min-w-0 flex-1 break-all text-caption text-text">{url}</code>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={url} label={c.copyLink} />
              {isPublic && (
                <Button
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="ghost"
                  size="sm"
                  leftIcon={<ExternalLink />}
                  aria-label={c.openLinkLabel(r.release_title)}
                >
                  {c.openLink}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-caption text-text-subtle">{c.noSlug}</p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          {r.is_editable ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Checkbox
                label={c.smartLinkToggle}
                description={c.smartLinkToggleHint}
                checked={r.smart_link_enabled}
                disabled={save.pending}
                onChange={(e) => toggle({ smart_link_enabled: e.target.checked })}
              />
              <Checkbox
                label={c.presaveToggle}
                description={c.presaveToggleHint}
                checked={r.presave_enabled}
                disabled={save.pending}
                onChange={(e) => toggle({ presave_enabled: e.target.checked })}
              />
            </div>
          ) : (
            <div className="min-w-0 space-y-1">
              <dl className="flex flex-wrap gap-x-5 gap-y-1 text-body-sm">
                <div className="flex gap-1.5">
                  <dt className="text-text-subtle">{c.smartLinkLabel}:</dt>
                  <dd className="font-semibold text-text">{r.smart_link_enabled ? c.on : c.off}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-text-subtle">{c.presaveLabel}:</dt>
                  <dd className="font-semibold text-text">{r.presave_enabled ? c.on : c.off}</dd>
                </div>
              </dl>
              <p className="flex items-start gap-1.5 text-caption text-text-subtle">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {c.lockedNote}
              </p>
            </div>
          )}
          <Button variant="secondary" size="sm" leftIcon={<BarChart3 />} onClick={onStats} aria-label={c.statsLabel(r.release_title)}>
            {c.stats}
          </Button>
        </div>
        {save.error && <FormAlert>{save.error}</FormAlert>}
      </Card>
    </li>
  );
}

/* ── Stats ─────────────────────────────────────────────────────────── */

type Range = "7d" | "30d" | "90d" | "12m";

function StatsDialog({ release, onClose }: { release: Release | null; onClose: () => void }) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  return (
    <Dialog
      open={!!release}
      onClose={onClose}
      title={release ? c.statsTitle(release.release_title) : ""}
      description={c.statsIntro}
      closeLabel={t("common.close")}
      size="lg"
    >
      {release && <StatsBody releaseId={release.id} />}
    </Dialog>
  );
}

function StatsBody({ releaseId }: { releaseId: number }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const [range, setRange] = useState<Range>("30d");
  const res = useResource((signal) => fetchAnalytics({ range, release_id: releaseId }, { signal }), [range, releaseId]);
  const s = res.data?.smart_links;
  const empty = s && s.views + s.clicks + s.presaves === 0;

  return (
    <div className="space-y-5">
      <Field label={c.range} className="max-w-xs">
        <Select value={range} onChange={(e) => setRange(e.target.value as Range)}>
          <option value="7d">{c.range7}</option>
          <option value="30d">{c.range30}</option>
          <option value="90d">{c.range90}</option>
          <option value="12m">{c.range12m}</option>
        </Select>
      </Field>
      {res.loading ? (
        <InlineLoading />
      ) : res.error || !s ? (
        <LoadError error={res.error} onRetry={res.reload} compact />
      ) : empty ? (
        <EmptyState compact icon={<BarChart3 />} title={c.noStatsTitle} description={c.noStatsBody} />
      ) : (
        <>
          <StatGrid className="xl:grid-cols-2">
            <Stat label={c.views} value={formatCount(s.views, locale)} />
            <Stat label={c.unique} value={formatCount(s.unique_visitors, locale)} />
            <Stat label={c.clicks} value={formatCount(s.clicks, locale)} />
            <Stat label={c.presaves} value={formatCount(s.presaves, locale)} />
          </StatGrid>
          <div className="grid gap-5 sm:grid-cols-2">
            <CountList title={c.byStore} rows={s.by_store} format={(l) => (l ? labels.platform(l) : c.direct)} />
            <CountList title={c.byCountry} rows={s.by_country} format={(l) => countryName(l, locale)} />
            <CountList title={c.byDevice} rows={s.by_device} format={(l) => labels.device(l)} />
            <CountList title={c.byReferrer} rows={s.by_referrer} format={(l) => l || c.direct} />
          </div>
        </>
      )}
    </div>
  );
}

function CountList({ title, rows, format }: { title: string; rows: CountRow[]; format: (label: string | null) => string }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const max = Math.max(1, ...rows.map((r) => Number(r.n) || 0));
  return (
    <section className="min-w-0">
      <h3 className="mb-2 text-body-sm font-bold text-text">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-caption text-text-subtle">{c.noneYet}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={`${r.label}-${i}`} className="min-w-0">
              <div className="flex items-baseline justify-between gap-3 text-body-sm">
                <span className="min-w-0 break-words text-text-muted">{format(r.label)}</span>
                <span className="shrink-0 font-semibold tabular-nums text-text">{formatCount(r.n, locale)}</span>
              </div>
              <div aria-hidden className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(((Number(r.n) || 0) / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
