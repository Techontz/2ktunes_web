import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ExternalLink, Info, MapPin, Package } from "lucide-react";
import { Avatar, Badge, Button, Card, EmptyState } from "@/components/ui";
import {
  DefinitionList,
  LoadError,
  Money,
  PageHeader,
  PageLoading,
  Section,
} from "@/features/dashboard/components";
import { fetchCreator } from "@/lib/api/marketplace";
import type { CreatorPackage, SocialAccount } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatBp, formatCount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { countryName, useLabels } from "./labels";
import { OrderDialog, type OrderTarget } from "./OrderDialog";
import { MetricsBadge } from "./shared";

export default function CreatorDetailPage() {
  const { slug = "" } = useParams();
  const [sp] = useSearchParams();
  const campaign = sp.get("campaign");
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const res = useResource((signal) => fetchCreator(slug, { signal }), [slug]);
  const [target, setTarget] = useState<OrderTarget | null>(null);

  const back = { to: `/dashboard/creators${campaign ? `?campaign=${encodeURIComponent(campaign)}` : ""}`, label: c.backToCreators };

  if (res.loading) return <PageLoading />;
  if (res.error || !res.data)
    return (
      <div>
        <PageHeader title={c.creatorsTitle} back={back} />
        <LoadError error={res.error} onRetry={res.reload} />
      </div>
    );

  const cr = res.data;
  const place = [cr.city, cr.country ? countryName(cr.country, locale) : null].filter(Boolean).join(", ");
  const packages = cr.packages.filter((p) => p.is_active);

  const order = (p: CreatorPackage) =>
    setTarget({ kind: "package", id: p.id, title: p.title, priceMinor: p.price_minor, currency: p.currency });

  return (
    <div>
      <PageHeader
        back={back}
        title={
          <span className="flex min-w-0 items-center gap-3">
            <span aria-hidden className="shrink-0">
              <Avatar name={cr.display_name} src={cr.avatar_url} size="lg" />
            </span>
            <span className="min-w-0 break-words">{cr.display_name}</span>
          </span>
        }
        meta={
          <Badge tone={cr.is_available ? "success" : "neutral"} dot>
            {cr.is_available ? c.available : c.unavailable}
          </Badge>
        }
        description={
          place ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {place}
            </span>
          ) : undefined
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <Section title={c.about} id="about">
            <Card>
              <p className="whitespace-pre-line break-words text-body-sm text-text-muted">{cr.bio || c.noBio}</p>
              <DefinitionList
                className="mt-5"
                items={[
                  { label: c.languages, value: cr.languages.length ? cr.languages.join(", ").toUpperCase() : "—" },
                  {
                    label: c.categories,
                    value: cr.categories.length ? cr.categories.map(labels.category).join(", ") : "—",
                  },
                  { label: c.turnaround, value: cr.turnaround_days ? c.days(cr.turnaround_days) : "—" },
                  { label: c.completedOrders, value: formatCount(cr.completed_orders ?? 0, locale) },
                ]}
              />
            </Card>
          </Section>

          <Section title={c.socialTitle} description={c.socialIntro} id="socials">
            {cr.social_accounts.length === 0 ? (
              <EmptyState compact title={c.noSocial} />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {cr.social_accounts.map((s) => (
                  <SocialCard key={s.id ?? s.platform} account={s} />
                ))}
              </ul>
            )}
          </Section>

          <Section title={c.packagesTitle} description={c.packagesIntro} id="packages">
            {packages.length === 0 ? (
              <EmptyState compact icon={<Package />} title={c.noPackagesBody} />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {packages.map((p) => (
                  <li key={p.id} className="min-w-0">
                    <Card className="flex h-full flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="min-w-0 break-words text-h4 font-bold text-text">{p.title}</h3>
                        <Money minor={p.price_minor} currency={p.currency} className="font-bold text-text" />
                      </div>
                      <p className="text-caption text-text-subtle">
                        {labels.platform(p.platform)} · {c.days(p.turnaround_days)}
                      </p>
                      {p.deliverable && (
                        <p className="break-words text-body-sm text-text">
                          <span className="font-semibold">{c.deliverable}: </span>
                          {p.deliverable}
                        </p>
                      )}
                      {p.description && (
                        <p className="whitespace-pre-line break-words text-body-sm text-text-muted">{p.description}</p>
                      )}
                      {cr.is_available && (
                        <div className="mt-auto pt-2">
                          <Button onClick={() => order(p)} fullWidth>
                            {c.orderPackage}
                          </Button>
                        </div>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={c.portfolioTitle} id="portfolio">
            {cr.portfolio.length === 0 ? (
              <EmptyState compact title={c.noPortfolio} />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {cr.portfolio.map((item) => {
                  const title = item.title || `${c.example} · ${labels.platform(item.platform)}`;
                  return (
                    <li key={item.id} className="min-w-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={c.openExample(title)}
                        className="flex h-full min-w-0 items-start justify-between gap-3 rounded-card border border-border-subtle bg-surface-raised p-4 transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                      >
                        <span className="min-w-0">
                          <span className="block break-words font-semibold text-text">{title}</span>
                          <span className="mt-1 block text-caption text-text-subtle">
                            {labels.platform(item.platform)}
                            {item.views != null && ` · ${c.views(formatCount(item.views, locale))}`}
                          </span>
                        </span>
                        <ExternalLink className="h-4 w-4 shrink-0 text-text-subtle" aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </div>

        <aside className="min-w-0">
          <Card variant="sunken" className="lg:sticky lg:top-24">
            <h2 className="flex items-center gap-2 text-h4 font-bold text-text">
              <Info className="h-4 w-4 text-accent-text" aria-hidden />
              {c.howItWorksTitle}
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-text-muted">
              <li>{c.howItWorks1}</li>
              <li>{c.howItWorks2}</li>
              <li>{c.howItWorks3}</li>
              <li className="font-semibold text-text">{c.howItWorks4}</li>
            </ul>
          </Card>
        </aside>
      </div>

      <OrderDialog open={!!target} onClose={() => setTarget(null)} target={target} defaultCampaignId={campaign} />
    </div>
  );
}

function SocialCard({ account: s }: { account: SocialAccount }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const platform = labels.platform(s.platform);
  const handle = s.handle.startsWith("@") ? s.handle : `@${s.handle}`;
  const verified = s.metrics_source && s.metrics_source !== "self_reported";

  return (
    <li className="min-w-0">
      <Card padding="sm" className="h-full">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-caption font-semibold uppercase tracking-wide text-text-subtle">{platform}</p>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={c.openAccount(platform, handle)}
                className="inline-flex items-center gap-1 break-all font-semibold text-accent-text hover:underline"
              >
                {handle}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
            ) : (
              <p className="break-all font-semibold text-text">{handle}</p>
            )}
          </div>
          <MetricsBadge source={s.metrics_source} />
        </div>
        <DefinitionList
          className="mt-4"
          items={[
            { label: c.followers, value: s.followers != null ? formatCount(s.followers, locale) : c.notShared },
            { label: c.avgViews, value: s.avg_views != null ? formatCount(s.avg_views, locale) : c.notShared },
            {
              label: c.engagement,
              value: s.engagement_rate_bp != null ? formatBp(s.engagement_rate_bp, locale) : c.notShared,
            },
            {
              label: c.audience,
              value: s.audience_countries.length
                ? s.audience_countries.map((a) => `${countryName(a.country, locale)} ${a.percent}%`).join(", ")
                : c.notShared,
            },
          ]}
        />
        {verified && s.metrics_verified_at && (
          <p className="mt-3 text-caption text-text-subtle">{c.verifiedOn(formatDate(s.metrics_verified_at, locale))}</p>
        )}
      </Card>
    </li>
  );
}
