import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { usePageMeta } from "../usePageMeta";
import { Orbs } from "../kit";

const LINKS = [
  ["/distribution", "nav.distribution"],
  ["/pricing", "nav.pricing"],
  ["/help", "nav.help"],
  ["/contact", "nav.contact"],
] as const;

export default function NotFoundPage() {
  const { t } = useLanguage();
  usePageMeta(t("nf.title"), t("nf.body"), { noindex: true });
  return (
    <section className="theme-dark bg-hero relative flex min-h-[80svh] items-center overflow-hidden pb-20 pt-28 text-text">
      <Orbs />
      <div className="shell-narrow relative">
        <p className="t-eyebrow text-accent-text">{t("nf.eyebrow")}</p>
        <h1 className="t-display mt-4">{t("nf.title")}</h1>
        <p className="t-lead mt-4 max-w-[34rem] text-text-muted">{t("nf.body")}</p>
        <div className="mt-8">
          <Button to="/" size="lg">
            {t("common.back_home")}
          </Button>
        </div>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-card border border-border-subtle bg-border-subtle backdrop-blur sm:grid-cols-2">
          {LINKS.map(([to, key]) => (
            <li key={to} className="bg-surface/80">
              <Link
                to={to}
                className="flex items-center justify-between px-5 py-4 text-body font-semibold transition-colors hover:bg-tint/[0.03]"
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
