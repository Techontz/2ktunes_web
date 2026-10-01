import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LifeBuoy, Search } from "lucide-react";
import { Button, Card, EmptyState, Field, Input, Skeleton } from "@/components/ui";
import { ChipGroup, LoadError, PageHeader } from "@/features/dashboard/components";
import { fetchHelpArticles } from "@/lib/api/account";
import type { HelpArticleSummary } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

/** /dashboard/help — searchable help centre in the current language. */
export default function HelpPage() {
  const c = useCopy(COPY);
  const { language } = useLanguage();
  const locale = language === "SW" ? "sw" : "en";
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  // Debounce typing so every keystroke isn't a request.
  useEffect(() => {
    const id = window.setTimeout(() => setQ(query.trim()), 300);
    return () => window.clearTimeout(id);
  }, [query]);

  const res = useResource(
    (signal) =>
      fetchHelpArticles({ locale, q: q || undefined, category: category === "all" ? undefined : category }, { signal }),
    [locale, q, category],
  );

  const labelFor = (cat: string) => c.helpCategories[cat] ?? cat.replace(/[-_]/g, " ");
  const known = Object.keys(c.helpCategories);
  const extra = [...new Set((res.data ?? []).map((a) => a.category))].filter((x) => !known.includes(x));
  const options = [
    { value: "all", label: c.all },
    ...[...known, ...extra].map((k) => ({ value: k, label: labelFor(k) })),
  ];

  const articles = res.data ?? [];
  const groups = new Map<string, HelpArticleSummary[]>();
  for (const a of articles) groups.set(a.category, [...(groups.get(a.category) ?? []), a]);
  const filtered = !!q || category !== "all";

  return (
    <div>
      <PageHeader title={c.helpTitle} description={c.helpDescription} />

      <div className="space-y-4">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="max-w-xl">
          <Field label={c.search} labelHidden>
            <Input
              type="search"
              leading={<Search />}
              placeholder={c.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Field>
        </form>
        <ChipGroup label={c.filterLabel} value={category} onChange={setCategory} options={options} />
      </div>

      <div className="mt-6">
        {res.loading ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : res.error ? (
          <LoadError error={res.error} onRetry={res.reload} />
        ) : articles.length === 0 ? (
          <EmptyState
            icon={<Search />}
            title={c.helpEmptyTitle}
            description={filtered ? c.helpEmptyBody : c.helpEmptyNone}
            action={
              <Button to="/dashboard/support?new=1" variant="secondary">
                {c.openTicket}
              </Button>
            }
          />
        ) : (
          <>
            <p className="sr-only" aria-live="polite">
              {c.resultCount(articles.length)}
            </p>
            <div className="space-y-8">
              {[...groups.entries()].map(([cat, list]) => (
                <section key={cat} aria-labelledby={`help-cat-${cat}`}>
                  <h2 id={`help-cat-${cat}`} className="mb-3 text-h4 font-bold">
                    {labelFor(cat)}
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {list.map((a) => (
                      <li key={a.id} className="min-w-0">
                        <Link
                          to={`/dashboard/help/${encodeURIComponent(a.slug)}`}
                          className="group flex h-full items-start justify-between gap-3 rounded-card border border-border-subtle bg-surface-raised p-4 transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text sm:p-5"
                        >
                          <span className="min-w-0">
                            <span className="block break-words font-semibold text-text group-hover:text-accent-text">
                              {a.title}
                            </span>
                            {a.summary && (
                              <span className="mt-1 block break-words text-body-sm text-text-subtle">{a.summary}</span>
                            )}
                          </span>
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-subtle" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>

      <StillNeedHelp className="mt-10" />
    </div>
  );
}

export function StillNeedHelp({ className }: { className?: string }) {
  const c = useCopy(COPY);
  return (
    <Card variant="accent" className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" aria-hidden />
          <div className="min-w-0">
            <h2 className="text-body font-bold">{c.stillNeedHelp}</h2>
            <p className="mt-1 text-body-sm text-text-muted">{c.stillNeedHelpBody}</p>
          </div>
        </div>
        <Button to="/dashboard/support?new=1" className="w-full sm:w-auto">
          {c.openTicket}
        </Button>
      </div>
    </Card>
  );
}
