import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Disc3, Plus, Search } from "lucide-react";
import { Button, DataTable, EmptyState, Field, Input, Select, type Column } from "@/components/ui";
import { fetchReleases } from "@/lib/api/catalog";
import type { Release, ReleaseGroup } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { ChipGroup, LoadError, PageHeader, Pagination, StatusPill } from "../components";
import { COPY } from "./copy";
import { ReleaseCover } from "./shared";

type Filter = "all" | ReleaseGroup;
const FILTERS: Filter[] = ["all", "drafts", "in_review", "distributing", "live", "inactive"];
type Sort = "newest" | "oldest" | "release_date" | "title";

/**
 * Catalog — GET /releases with status groups (summary counts), search, type
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
  const labels: Record<Filter, string> = {
    all: c.filterAll,
    drafts: c.filterDrafts,
    in_review: c.filterInReview,
    distributing: c.filterDistributing,
    live: c.filterLive,
    inactive: c.filterInactive,
  };
  const filtered = status !== "all" || !!q || !!type;

  const columns: Column<Release>[] = [
    {
      key: "release",
      header: c.colRelease,
      primary: true,
      cell: (r) => (
        <Link
          to={`/dashboard/music/${r.id}`}
          className="flex min-w-0 items-center gap-3 rounded-[8px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          <ReleaseCover src={r.cover_image} title={r.release_title} size="sm" />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-text">
              {r.release_title || "-"}
              {r.version ? <span className="font-normal text-text-subtle"> ({r.version})</span> : null}
            </span>
            <span className="block truncate text-caption text-text-subtle">{r.artist_name || "-"}</span>
          </span>
        </Link>
      ),
    },
    { key: "type", header: c.colType, cell: (r) => r.release_type },
    { key: "tracks", header: c.colTracks, cell: (r) => c.tracksCount(r.tracks_count ?? 0), hideOnMobile: true },
    { key: "date", header: c.colDate, cell: (r) => formatDate(r.release_date, locale) },
    { key: "status", header: c.colStatus, cell: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title={c.listTitle}
        description={c.listDescription}
        actions={
          <Button to="/dashboard/new-release" leftIcon={<Plus />}>
            {c.newRelease}
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
          <DataTable
            caption={c.listTitle}
            rows={state.data?.releases ?? []}
            columns={columns}
            getRowKey={(r) => r.id}
            loading={state.loading}
            empty={
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
                      {c.newRelease}
                    </Button>
                  }
                />
              )
            }
          />
          <Pagination meta={state.data?.meta} onPage={(p) => update({ page: String(p) })} />
        </div>
      )}
    </>
  );
}
