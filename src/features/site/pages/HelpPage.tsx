import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Minus, Plus, Search, SearchX } from "lucide-react";
import { Button, EmptyState, Input } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { HELP, type HelpArticle, type HelpCategory } from "../content/help";
import { usePageMeta } from "../usePageMeta";
import { Orbs } from "../kit";

/** Lowercase, strip accents and punctuation, so "M-Pesa" matches "mpesa". */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "");
}

export function searchArticles(articles: HelpArticle[], categories: Record<HelpCategory, string>, query: string) {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return articles;
  return articles
    .map((a) => {
      const title = normalise(a.q);
      const hay = normalise([a.q, ...a.a, a.keywords ?? "", categories[a.category]].join(" "));
      if (!terms.every((t) => hay.includes(t))) return null;
      const score = terms.reduce((n, t) => n + (title.includes(t) ? 2 : 1), 0);
      return { a, score };
    })
    .filter((x): x is { a: HelpArticle; score: number } => x !== null)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.a);
}

export default function HelpPage() {
  const { t, pick } = useLanguage();
  const c = pick(HELP);
  usePageMeta(c.meta.title, c.meta.description);

  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const query = params.get("q") ?? "";
  const topic = (params.get("topic") as HelpCategory | null) ?? null;
  const [open, setOpen] = useState<string | null>(location.hash.slice(1) || null);

  useEffect(() => {
    const id = location.hash.slice(1);
    if (id) {
      setOpen(id);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    }
  }, [location.hash]);

  const results = useMemo(() => {
    const byTopic = topic ? c.articles.filter((a) => a.category === topic) : c.articles;
    return searchArticles(byTopic, c.categories, query);
  }, [c, query, topic]);

  const update = (next: { q?: string; topic?: string | null }) => {
    const p = new URLSearchParams(params);
    if (next.q !== undefined) (next.q ? p.set("q", next.q) : p.delete("q"));
    if (next.topic !== undefined) (next.topic ? p.set("topic", next.topic) : p.delete("topic"));
    setParams(p, { replace: true });
  };

  const categories = Object.entries(c.categories) as [HelpCategory, string][];
  // While searching, the best match opens by default so the answer is visible.
  const [touched, setTouched] = useState(false);
  const effectiveOpen = touched || !query ? open : (open ?? results[0]?.id ?? null);
  const toggle = (id: string | null) => {
    setTouched(true);
    setOpen(id);
  };
  const grouped = !query && !topic;

  return (
    <>
      <section className="theme-dark bg-hero relative overflow-hidden pb-14 pt-28 text-text md:pb-20 md:pt-36">
        <Orbs />
        <div className="shell-narrow relative text-center">
          <p className="t-eyebrow mb-4 text-accent-text">{c.hero.eyebrow}</p>
          <h1 className="t-display">{c.hero.title}</h1>
          <p className="t-lead mx-auto mt-4 max-w-[36rem] text-text-muted">{c.hero.lede}</p>
          <form
            role="search"
            className="mx-auto mt-8 max-w-[36rem] text-left"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="help-search" className="sr-only">
              {t("help.search_label")}
            </label>
            <Input
              id="help-search"
              type="search"
              value={query}
              onChange={(e) => {
                setTouched(false);
                setOpen(null);
                update({ q: e.target.value });
              }}
              placeholder={t("help.search_placeholder")}
              leading={<Search />}
              autoComplete="off"
              className="h-12"
            />
          </form>
        </div>
      </section>

      <section className="bg-surface section-y !pt-10">
        <div className="shell grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <nav aria-label={t("help.categories")} className="min-w-0">
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
              {[[null, t("help.all")] as const, ...categories].map(([id, label]) => {
                const active = topic === id;
                return (
                  <li key={id ?? "all"} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => update({ topic: id })}
                      className={cn(
                        "whitespace-nowrap rounded-control px-3.5 py-2 text-left text-[0.9375rem] font-medium transition-colors lg:w-full",
                        active
                          ? "bg-accent text-white shadow-[0_6px_16px_-8px_rgb(132_29_198/0.8)]"
                          : "border border-border-subtle bg-surface-raised text-text-muted hover:text-accent-text lg:border-transparent lg:bg-transparent",
                      )}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0">
            <p aria-live="polite" className="mb-4 min-h-[1.25rem] text-body-sm text-text-subtle">
              {query
                ? results.length === 1
                  ? t("help.result_one", { query })
                  : t("help.results", { count: results.length, query })
                : null}
            </p>

            {results.length === 0 ? (
              <EmptyState
                icon={<SearchX />}
                title={t("help.no_results_title")}
                description={t("help.no_results_body")}
                action={
                  <Button to="/contact" variant="secondary">
                    {t("cta.contact")}
                  </Button>
                }
              />
            ) : grouped ? (
              <div className="space-y-12">
                {categories.map(([id, label]) => (
                  <div key={id}>
                    <h2 className="t-title mb-3">{label}</h2>
                    <ArticleList
                      articles={results.filter((a) => a.category === id)}
                      open={effectiveOpen}
                      setOpen={toggle}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ArticleList articles={results} open={effectiveOpen} setOpen={toggle} />
            )}

            <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-card border border-border-subtle bg-surface-raised p-6 shadow-card-light sm:flex-row sm:items-center sm:p-8">
              <div>
                <h2 className="t-card">{t("help.still_need")}</h2>
                <p className="mt-1.5 text-body text-text-muted">{t("help.still_need_body")}</p>
              </div>
              <Button to="/contact" className="shrink-0">
                {t("cta.contact")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ArticleList({
  articles,
  open,
  setOpen,
}: {
  articles: HelpArticle[];
  open: string | null;
  setOpen: (id: string | null) => void;
}) {
  return (
    <div className="border-t border-border-subtle">
      {articles.map((a) => {
        const expanded = open === a.id;
        return (
          <article key={a.id} id={a.id} className="scroll-mt-24 border-b border-border-subtle">
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`${a.id}-body`}
                onClick={() => setOpen(expanded ? null : a.id)}
                className="flex w-full items-start justify-between gap-6 py-4 text-left text-[1.0625rem] font-semibold leading-snug"
              >
                <span className="min-w-0">{a.q}</span>
                <span aria-hidden className="mt-0.5 shrink-0 text-text-subtle">
                  {expanded ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </span>
              </button>
            </h3>
            <div id={`${a.id}-body`} hidden={!expanded} className="max-w-[64ch] space-y-3 pb-6 pr-10 t-body text-text-muted">
              {a.a.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
