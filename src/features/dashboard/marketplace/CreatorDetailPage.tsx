import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ExternalLink, Info, MapPin, Package, Play, ShieldCheck } from "lucide-react";
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
import type { CreatorPackage, PortfolioItem, SocialAccount } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatBp, formatCount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY } from "./copy";
import { CreatorRequestDialog, type RequestTarget } from "./CreatorRequestDialog";
import { countryName, useLabels } from "./labels";
import { REQ_COPY } from "./requestCopy";
import { MetricsBadge } from "./shared";

/**
 * A creator's public profile for artists: packages and prices first (every
 * price is visible before requesting), then about, audience numbers and past
 * work. No contact details or social handles are ever shown: everything goes
 * through 2kTunes.
 */
export default function CreatorDetailPage() {
  const { slug = "" } = useParams();
  const [sp] = useSearchParams();
  const campaign = sp.get("campaign");
  const c = useCopy(COPY);
  const r = useCopy(REQ_COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const res = useResource((signal) => fetchCreator(slug, { signal }), [slug]);
  const [target, setTarget] = useState<RequestTarget | null>(null);

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
  const packages = cr.packages.filter((p) => p.is_active).sort((a, b) => a.price_minor - b.price_minor);
  const request = (p: CreatorPackage) => setTarget({ pkg: p, creatorName: cr.display_name });

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

      {cr.categories.length > 0 && (
        <ul className="-mt-2 mb-6 flex flex-wrap gap-1.5 sm:-mt-4" aria-label={c.categories}>
          {cr.categories.map((x) => (
            <li key={x}>
              <Badge tone="accent" size="sm">
                {labels.category(x)}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <Section title={c.packagesTitle} description={r.pricesNote} id="packages">
            {packages.length === 0 ? (
              <EmptyState compact icon={<Package />} title={c.noPackagesBody} />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {packages.map((p) => (
                  <li key={p.id} className="min-w-0">
                    <Card className="flex h-full flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="min-w-0 break-words text-h4 font-bold text-text">{p.title}</h3>
                        <Money minor={p.price_minor} currency={p.currency} className="text-h4 font-extrabold text-text" />
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
                          <Button onClick={() => request(p)} fullWidth aria-label={`${r.requestCreator}: ${p.title}`}>
                            {r.requestCreator}
                          </Button>
                        </div>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={c.about} id="about">
            <Card>
              <p className="whitespace-pre-line break-words text-body-sm text-text-muted">{cr.bio || c.noBio}</p>
              <DefinitionList
                className="mt-5"
                items={[
                  { label: c.languages, value: cr.languages.length ? cr.languages.join(", ").toUpperCase() : "-" },
                  { label: c.turnaround, value: cr.turnaround_days ? c.days(cr.turnaround_days) : "-" },
                  { label: c.completedOrders, value: formatCount(cr.completed_orders ?? 0, locale) },
                ]}
              />
            </Card>
          </Section>

          <Section title={c.socialTitle} description={r.socialNoHandles} id="socials">
            {cr.social_accounts.length === 0 ? (
              <EmptyState compact title={c.noSocial} />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {cr.social_accounts.map((s, i) => (
                  <SocialCard key={s.id ?? `${s.platform}-${i}`} account={s} />
                ))}
              </ul>
            )}
          </Section>

          <Section title={c.portfolioTitle} id="portfolio">
            {cr.portfolio.length === 0 ? (
              <EmptyState compact title={c.noPortfolio} />
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {cr.portfolio.map((item) => (
                  <PortfolioTile key={item.id} item={item} />
                ))}
              </ul>
            )}
          </Section>
        </div>

        <aside className="min-w-0">
          <Card variant="sunken" className="lg:sticky lg:top-24">
            <h2 className="flex items-center gap-2 text-h4 font-bold text-text">
              <Info className="h-4 w-4 text-accent-text" aria-hidden />
              {r.howTitle}
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-body-sm text-text-muted">
              <li>{r.how1}</li>
              <li>{r.how2}</li>
              <li>{r.how3}</li>
            </ol>
            <p className="mt-3 text-body-sm font-semibold text-text">{r.how4}</p>
            <p className="mt-4 flex gap-2 border-t border-border-subtle pt-4 text-caption text-text-subtle">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent-text" aria-hidden />
              <span>{r.noContact}</span>
            </p>
          </Card>
        </aside>
      </div>

      <CreatorRequestDialog
        target={target}
        onClose={() => setTarget(null)}
        campaignId={campaign && /^\d+$/.test(campaign) ? Number(campaign) : null}
      />
    </div>
  );
}

/** Audience numbers per platform. Handles and profile links are never shown to artists. */
function SocialCard({ account: s }: { account: SocialAccount }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const verified = s.metrics_source && s.metrics_source !== "self_reported";

  return (
    <li className="min-w-0">
      <Card padding="sm" className="h-full">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-bold text-text">{labels.platform(s.platform)}</p>
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

/** A 9:16 tile: uploaded videos play inline (on demand), links open in a new tab. */
function PortfolioTile({ item }: { item: PortfolioItem }) {
  const c = useCopy(COPY);
  const r = useCopy(REQ_COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const [playing, setPlaying] = useState(false);
  const title = item.caption || item.title || `${c.example} · ${labels.platform(item.platform)}`;
  const views = item.views != null ? r.selfReportedViews(formatCount(item.views, locale)) : null;

  const media = (
    <div className="relative aspect-[9/16] overflow-hidden rounded-card bg-[linear-gradient(160deg,#2a0f4a,#6e16a8)]">
      {item.video_src && playing ? (
        <video
          src={item.video_src}
          poster={item.thumbnail_url ?? undefined}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : item.thumbnail_url ? (
        <img src={item.thumbnail_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      {!playing && (
        <>
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgb(16_6_30/0.85))]" />
          {item.platform && item.platform !== "upload" && (
            <span className="absolute left-2 top-2">
              <Badge tone="neutral" size="sm" className="bg-black/45 text-white ring-0 backdrop-blur">
                {labels.platform(item.platform)}
              </Badge>
            </span>
          )}
          <span aria-hidden className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-brand-800 shadow-overlay">
              {item.video_src ? <Play className="ml-0.5 h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
            </span>
          </span>
          <span className="absolute inset-x-2 bottom-2 text-left text-white">
            <span className="line-clamp-2 block text-caption font-semibold">{title}</span>
            {views && <span className="mt-0.5 block text-[0.6875rem] text-white/80">{views}</span>}
          </span>
        </>
      )}
    </div>
  );

  return (
    <li className="min-w-0">
      {item.video_src ? (
        playing ? (
          media
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={r.watchExample(title)}
            className={cn("block w-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text")}
          >
            {media}
          </button>
        )
      ) : item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={r.openExample(title)}
          className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          {media}
        </a>
      ) : (
        media
      )}
    </li>
  );
}
