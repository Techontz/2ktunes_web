import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { usePageMeta } from "../usePageMeta";

const LINKS = [
  ["/distribution", "nav.distribution"],
  ["/pricing", "nav.pricing"],
  ["/help", "nav.help"],
  ["/contact", "nav.contact"],
] as const;

export default function NotFoundPage() {
  const { t } = useLanguage();
  usePageMeta(t("nf.title"));
  return (
    <section className="flex min-h-[80svh] items-center bg-surface pb-20 pt-28">
      <div className="shell-narrow">
        <p className="t-eyebrow text-accent-text">{t("nf.eyebrow")}</p>
        <h1 className="t-display mt-4">{t("nf.title")}</h1>
        <p className="t-lead mt-4 max-w-[34rem] text-text-muted">{t("nf.body")}</p>
        <div className="mt-8">
          <Button to="/" size="lg">
            {t("common.back_home")}
          </Button>
        </div>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-card border border-border-subtle bg-border-subtle sm:grid-cols-2">
          {LINKS.map(([to, key]) => (
            <li key={to} className="bg-surface">
              <Link
                to={to}
                className="flex items-center justify-between px-5 py-4 text-body font-semibold transition-colors hover:bg-white/[0.03]"
              >
                {t(key)}
                <ArrowRight aria-hidden className="h-4 w-4 text-text-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
