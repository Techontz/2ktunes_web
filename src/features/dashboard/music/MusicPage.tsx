import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Disc3, Plus, Search } from "lucide-react";
import { Button, EmptyState, Field, Input, Select, Skeleton } from "@/components/ui";
import { fetchReleases, fetchStores } from "@/lib/api/catalog";
import type { Release, ReleaseGroup } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ChipGroup, LoadError, PageHeader, Pagination, StatusPill } from "../components";
import { PlanPicker } from "../plan/PlanPicker";
import { COPY } from "./copy";
import { ReleaseCover } from "./shared";

type Filter = "all" | ReleaseGroup;
const FILTERS: Filter[] = ["all", "drafts", "in_review", "distributing", "live", "inactive"];
type Sort = "newest" | "oldest" | "release_date" | "title";

/**
 * My music (catalog), laid out like DistroKid's list: one row per release
 * with a status dot, cover, title / type / artist and the stores it goes to.
 * GET /releases with status groups (summary counts), search, type
 * and sort, all mirrored in the URL (?status=drafts is linked from the
 * overview's action items).
 */
export default function MusicPage() {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const [params, setParams] = useSearchParams();

  const status = (FILTERS as string[]).includes(params.get("status") ?? "") ? (params.get("status") as Filter) : "all";
  const type = params.get("type") ?? "";
  const sort = (params.get("sort") as Sort) || "newest";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const q = params.get("q") ?? "";
  const [search, setSearch] = useState(q);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "" || (k === "status" && v === "all") || (k === "sort" && v === "newest") || (k === "page" && v === "1")) {
        next.delete(k);
      } else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  // Debounced search → URL.
  useEffect(() => {
    if (search === q) return;
    const id = window.setTimeout(() => update({ q: search.trim() || null, page: null }), 350);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const state = useResource(
    (signal) =>
      fetchReleases(
        { status: status === "all" ? undefined : status, type: type || undefined, q: q || undefined, sort, page, per_page: 20 },
        { signal },
      ),
    [status, type, q, sort, page],
  );

  const summary = state.data?.summary;
  const { user } = useAuth();
  const needsPlan = !!user && !user.has_active_subscription;
  const labels: Record<Filter, string> = {
    all: c.filterAll,
    drafts: c.filterDrafts,
    in_review: c.filterInReview,
    distributing: c.filterDistributing,
    live: c.filterLive,
    inactive: c.filterInactive,
  };
  const filtered = status !== "all" || !!q || !!type;

  const stores = useResource(() => fetchStores(), []);
  const storeName = (slug: string) => stores.data?.find((x) => x.slug === slug)?.name ?? slug;
  const rows = state.data?.releases ?? [];

  // No active plan: the plan picker comes first (uploads are locked until then).
  // Releases from an earlier plan still list below it.
  if (needsPlan && !state.loading && !(summary && summary.all > 0)) {
    return (
      <div className="rounded-card border border-border-subtle bg-[radial-gradient(90%_55%_at_50%_0%,rgb(132_29_198/0.22),transparent_70%)] px-4 py-10 sm:px-8 sm:py-14">
        <PlanPicker />
      </div>
    );
  }

  return (
    <>
      {needsPlan && (
        <div className="mb-8 rounded-card border border-border-subtle bg-[radial-gradient(90%_55%_at_50%_0%,rgb(132_29_198/0.22),transparent_70%)] px-4 py-10 sm:px-8 sm:py-14">
          <PlanPicker />
        </div>
      )}
      <PageHeader
        title={c.listTitle}
        description={c.listDescription}
        actions={
          <Button to="/dashboard/new-release" leftIcon={<Plus />}>
            {c.uploadMusic}
          </Button>
        }
      />

      <ChipGroup
        label={c.filterLabel}
        value={status}
        onChange={(v) => update({ status: v, page: null })}
        options={FILTERS.map((f) => ({ value: f, label: labels[f], count: summary ? summary[f] : null }))}
        className="mb-4"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_11rem]">
        <Field label={c.searchLabel} labelHidden>
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={c.searchPlaceholder}
            leading={<Search />}
          />
        </Field>
        <Field label={c.typeLabel} labelHidden>
          <Select value={type} onChange={(e) => update({ type: e.target.value || null, page: null })} aria-label={c.typeLabel}>
            <option value="">{c.typeAny}</option>
            <option value="Single">{c.typeSingle}</option>
            <option value="EP">{c.typeEP}</option>
            <option value="Album">{c.typeAlbum}</option>
          </Select>
        </Field>
        <Field label={c.sortLabel} labelHidden>
          <Select value={sort} onChange={(e) => update({ sort: e.target.value, page: null })} aria-label={c.sortLabel}>
            <option value="newest">{c.sortNewest}</option>
            <option value="oldest">{c.sortOldest}</option>
            <option value="release_date">{c.sortReleaseDate}</option>
            <option value="title">{c.sortTitle}</option>
          </Select>
        </Field>
      </div>

      {state.error && !state.data ? (
        <LoadError error={state.error} onRetry={state.reload} />
      ) : (
        <div aria-busy={state.refreshing || undefined} className={state.refreshing ? "opacity-70 transition-opacity" : undefined}>
          {state.loading ? (
            <ul aria-hidden className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border-subtle bg-surface-raised">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-4 px-4 py-4 sm:px-6">
                  <Skeleton className="h-16 w-16 rounded-[10px] sm:h-20 sm:w-20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </li>
              ))}
            </ul>
          ) : rows.length === 0 ? (
            filtered ? (
              <EmptyState
                icon={<Search />}
                title={c.emptyFilteredTitle}
                description={c.emptyFilteredBody}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch("");
                      setParams(new URLSearchParams(), { replace: true });
                    }}
                  >
                    {c.filterAll}
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<Disc3 />}
                title={c.emptyAllTitle}
                description={c.emptyAllBody}
                action={
                  <Button to="/dashboard/new-release" leftIcon={<Plus />}>
                    {c.uploadMusic}
                  </Button>
                }
              />
            )
          ) : (
            <ul aria-label={c.listTitle} className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border-subtle bg-surface-raised">
              {rows.map((r) => (
                <ReleaseRow key={r.id} release={r} storeName={storeName} locale={locale} />
              ))}
            </ul>
          )}
          <Pagination meta={state.data?.meta} onPage={(p) => update({ page: String(p) })} />
        </div>
      )}
    </>
  );
}

const DOT: Record<string, string> = {
  live: "bg-success",
  draft: "bg-text-subtle/50",
  changes_requested: "bg-warning",
  rejected: "bg-danger",
  takedown_requested: "bg-danger",
  taken_down: "bg-danger",
};

function ReleaseRow({ release: r, storeName, locale }: { release: Release; storeName: (slug: string) => string; locale: string }) {
  const c = useCopy(COPY);
  const typeLabel = r.release_type === "Single" ? c.typeSingle : r.release_type === "EP" ? c.typeEP : c.typeAlbum;
  const platforms = r.platforms ?? [];
  const shown = platforms.slice(0, 3).map(storeName);
  return (
    <li>
      <Link
        to={`/dashboard/music/${r.id}`}
        className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-tint/[0.025] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text sm:gap-5 sm:px-6"
      >
        <span aria-hidden className={cn("hidden h-2.5 w-2.5 shrink-0 rounded-full sm:block", DOT[r.status] ?? "bg-accent")} />
        <ReleaseCover src={r.cover_image} title={r.release_title} size="md" className="sm:h-20 sm:w-20" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[1.0625rem] font-semibold text-text group-hover:text-accent-text">
            {r.release_title || "-"}
            {r.version ? <span className="font-normal text-text-subtle"> ({r.version})</span> : null}
          </span>
          <span className="block truncate text-body-sm text-text-subtle">
            {typeLabel} · {c.tracksCount(r.tracks_count ?? 0)}
          </span>
          <span className="block truncate text-body-sm text-text-subtle">{r.artist_name || "-"}</span>
          <span className="mt-1.5 block md:hidden">
            <StatusPill status={r.status} />
          </span>
        </span>
        <span className="hidden w-56 shrink-0 text-body-sm text-text-muted lg:block">
          {platforms.length ? (
            <>
              {shown.join(", ")}
              {platforms.length > 3 && <span className="text-text-subtle"> {c.storesMore(platforms.length - 3)}</span>}
            </>
          ) : (
            <span className="text-text-subtle">{c.storesNone}</span>
          )}
        </span>
        <span className="hidden w-32 shrink-0 text-body-sm text-text-muted sm:block">{formatDate(r.release_date, locale)}</span>
        <span className="hidden w-44 shrink-0 justify-end md:flex">
          <StatusPill status={r.status} />
        </span>
      </Link>
    </li>
  );
}
