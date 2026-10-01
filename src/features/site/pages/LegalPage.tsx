import { Link, useParams } from "react-router-dom";
import { FileWarning } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { LEGAL, LEGAL_UPDATED, type LegalDocId } from "../content/legal";
import { usePageMeta } from "../usePageMeta";
import NotFoundPage from "./NotFoundPage";

const DOC_KEYS: Record<LegalDocId, string> = {
  terms: "footer.terms",
  privacy: "footer.privacy",
  "distribution-agreement": "footer.distribution_agreement",
  "acceptable-use": "footer.acceptable_use",
};

export default function LegalPage() {
  const { doc } = useParams();
  if (!doc || !(doc in LEGAL)) return <NotFoundPage />;
  return <LegalDocument id={doc as LegalDocId} />;
}

function LegalDocument({ id }: { id: LegalDocId }) {
  const { t, pick, locale } = useLanguage();
  const d = pick(LEGAL[id]);
  usePageMeta(d.title, d.summary);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(LEGAL_UPDATED));

  return (
    <article className="bg-surface pb-20 pt-28 md:pb-28 md:pt-36">
      <div className="shell grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <aside className="order-2 lg:order-1">
          <div className="lg:sticky lg:top-24">
            <nav aria-label={t("legal.contents")} className="hidden lg:block">
              <p className="t-eyebrow mb-4 text-text-subtle">{t("legal.contents")}</p>
              <ul className="space-y-2">
                {d.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="block rounded-sm text-body-sm text-text-muted hover:text-text">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label={t("legal.other")} className="lg:mt-10">
              <p className="t-eyebrow mb-4 text-text-subtle">{t("legal.other")}</p>
              <ul className="space-y-2">
                {(Object.keys(DOC_KEYS) as LegalDocId[]).map((key) => (
                  <li key={key}>
                    <Link
                      to={`/legal/${key}`}
                      aria-current={key === id ? "page" : undefined}
                      className={cn(
                        "block rounded-sm text-body-sm",
                        key === id ? "font-semibold text-text" : "text-text-muted hover:text-text",
                      )}
                    >
                      {t(DOC_KEYS[key])}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <div className="order-1 min-w-0 max-w-[46rem] lg:order-2">
          <div
            role="note"
            className="mb-10 flex gap-3 rounded-card border border-warning/30 bg-warning-soft p-4 sm:p-5"
          >
            <FileWarning aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="font-semibold text-warning">{t("legal.draft")}</p>
              <p className="mt-1 text-body-sm text-text-muted">{t("legal.draft_body")}</p>
            </div>
          </div>

          <h1 className="t-display">{d.title}</h1>
          <p className="t-lead mt-4 text-text-muted">{d.summary}</p>
          <p className="mt-4 text-body-sm text-text-subtle">{t("legal.updated", { date })}</p>

          <div className="mt-12 space-y-10">
            {d.sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
                <h2 id={`${s.id}-h`} className="text-h3 font-bold tracking-[-0.02em]">
                  {s.heading}
                </h2>
                <div className="mt-3 space-y-3 t-body text-text-muted">
                  {s.body.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
