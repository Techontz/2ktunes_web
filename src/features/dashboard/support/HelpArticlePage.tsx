import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui";
import { LoadError, PageHeader, PageLoading } from "@/features/dashboard/components";
import { ApiError } from "@/lib/api/client";
import { fetchHelpArticle } from "@/lib/api/account";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { StillNeedHelp } from "./HelpPage";

/**
 * /dashboard/help/:slug — one article. The body is plain text from the API:
 * paragraphs split on blank lines, single line breaks kept. It is never
 * injected as HTML.
 */
export default function HelpArticlePage() {
  const { slug = "" } = useParams();
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const res = useResource((signal) => fetchHelpArticle(slug, { signal }), [slug]);
  const back = { to: "/dashboard/help", label: c.backToHelp };

  if (res.loading) return <PageLoading rows={1} />;
  if (res.error || !res.data) {
    const notFound = res.errorObj instanceof ApiError && res.errorObj.status === 404;
    return (
      <div>
        <PageHeader title={c.helpTitle} back={back} />
        <LoadError error={res.error} onRetry={notFound ? undefined : res.reload} />
        <StillNeedHelp className="mt-8" />
      </div>
    );
  }

  const a = res.data;
  const paragraphs = (a.body ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article>
      <PageHeader
        back={back}
        title={a.title}
        meta={<Badge tone="accent">{c.helpCategories[a.category] ?? a.category.replace(/[-_]/g, " ")}</Badge>}
        description={a.summary ?? undefined}
      />
      <div className="max-w-[68ch] space-y-4 text-body leading-relaxed text-text-muted">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line break-words">
            {p}
          </p>
        ))}
      </div>
      {a.updated_at && <p className="mt-6 text-caption text-text-subtle">{c.updated(formatDate(a.updated_at, locale))}</p>}
      <StillNeedHelp className="mt-10 max-w-[68ch]" />
    </article>
  );
}
