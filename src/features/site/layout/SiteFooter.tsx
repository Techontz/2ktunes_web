import { Link } from "react-router-dom";
import { Wordmark } from "@/components/brand/Wordmark";
import { useLanguage } from "@/lib/LanguageContext";

const COLUMNS = [
  {
    title: "footer.product",
    links: [
      ["/distribution", "nav.distribution"],
      ["/promotion", "nav.promotion"],
      ["/creators", "nav.creators"],
      ["/royalties", "nav.royalties"],
      ["/pricing", "nav.pricing"],
    ],
  },
  {
    title: "footer.for",
    links: [
      ["/artists", "nav.artists"],
      ["/labels", "nav.labels"],
      ["/creators", "nav.creators"],
    ],
  },
  {
    title: "footer.company",
    links: [
      ["/about", "nav.about"],
      ["/help", "nav.help"],
      ["/contact", "nav.contact"],
    ],
  },
  {
    title: "footer.legal",
    links: [
      ["/legal/terms", "footer.terms"],
      ["/legal/privacy", "footer.privacy"],
      ["/legal/distribution-agreement", "footer.distribution_agreement"],
      ["/legal/acceptable-use", "footer.acceptable_use"],
    ],
  },
] as const;

export default function SiteFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer className="theme-dark relative overflow-hidden bg-[linear-gradient(180deg,#1a0b2e,#13071f)] pb-10 pt-16 text-text md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgb(132_29_198/0.35),transparent_65%)]"
      />
      <div className="shell relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <Link to="/" aria-label={t("nav.home")} className="inline-block rounded-sm text-[1.6rem]">
              <Wordmark tone="dark" />
            </Link>
            <p className="mt-4 max-w-[30ch] text-body text-text-muted">{t("footer.tagline")}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={t(col.title)}>
                <h2 className="t-eyebrow text-accent-text">{t(col.title)}</h2>
                <ul className="mt-4 space-y-3">
                  {col.links.map(([to, key]) => (
                    <li key={to + key}>
                      <Link
                        to={to}
                        className="rounded-sm text-body-sm text-text-muted transition-colors hover:text-white"
                      >
                        {t(key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[0.8125rem] text-text-subtle md:flex-row md:items-center md:justify-between">
          <p>
            © {year} 2kTunes. {t("footer.rights")} {t("footer.made")}
          </p>
          <p>{t("stores.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
