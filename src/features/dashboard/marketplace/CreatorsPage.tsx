import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Search, Users } from "lucide-react";
import { Avatar, Badge, Button, Card, Checkbox, EmptyState, Field, Input, Select } from "@/components/ui";
import { CountrySelect } from "@/components/forms/CountrySelect";
import { LoadError, Money, PageHeader, PageLoading, Pagination } from "@/features/dashboard/components";
import { fetchCreators, type CreatorFilters } from "@/lib/api/marketplace";
import type { CreatorSummary } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { countryName, useLabels } from "./labels";
import { TotalMetricsBadge } from "./shared";

const SORTS = ["newest", "followers", "price_low", "price_high"] as const;
type Sort = (typeof SORTS)[number];

function readFilters(sp: URLSearchParams): CreatorFilters {
  const sort = sp.get("sort");
  const min = sp.get("min_followers");
  const page = Number(sp.get("page") ?? "1");
  return {
    q: sp.get("q") || undefined,
    platform: sp.get("platform") || undefined,
    category: sp.get("category") || undefined,
    country: sp.get("country") || undefined,
    min_followers: min && /^\d+$/.test(min) ? Number(min) : undefined,
    verified_only: sp.get("verified_only") === "1" || undefined,
    available_only: sp.get("available_only") === "1" || undefined,
    sort: sort && (SORTS as readonly string[]).includes(sort) && sort !== "newest" ? (sort as CreatorFilters["sort"]) : undefined,
    page: Number.isInteger(page) && page > 1 ? page : undefined,
  };
}

export default function CreatorsPage() {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const [sp, setSp] = useSearchParams();
  const campaign = sp.get("campaign");
  const filters = readFilters(sp);
  const key = JSON.stringify(filters);

  const res = useResource((signal) => fetchCreators(filters, { signal }), [key]);

  // Local form state mirrors the URL until "Apply".
  const [form, setForm] = useState(() => ({
    q: filters.q ?? "",
    platform: filters.platform ?? "",
    category: filters.category ?? "",
    country: filters.country ?? "",
    min_followers: filters.min_followers != null ? String(filters.min_followers) : "",
    verified_only: !!filters.verified_only,
    available_only: !!filters.available_only,
    sort: (filters.sort ?? "newest") as Sort,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep the form in sync when the URL changes (back/forward, clear).
  useEffect(() => {
    setForm({
      q: filters.q ?? "",
      platform: filters.platform ?? "",
      category: filters.category ?? "",
      country: filters.country ?? "",
      min_followers: filters.min_followers != null ? String(filters.min_followers) : "",
      verified_only: !!filters.verified_only,
      available_only: !!filters.available_only,
      sort: (filters.sort ?? "newest") as Sort,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const country = form.country.trim().toUpperCase();
    if (country && !/^[A-Z]{2}$/.test(country)) errs.country = c.countryInvalid;
    const min = form.min_followers.trim().replace(/[\s,]/g, "");
    if (min && !/^\d+$/.test(min)) errs.min_followers = c.minFollowersInvalid;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const next = new URLSearchParams();
    if (campaign) next.set("campaign", campaign);
    if (form.q.trim()) next.set("q", form.q.trim());
    if (form.platform) next.set("platform", form.platform);
    if (form.category) next.set("category", form.category);
    if (country) next.set("country", country);
    if (min) next.set("min_followers", min);
    if (form.verified_only) next.set("verified_only", "1");
    if (form.available_only) next.set("available_only", "1");
    if (form.sort !== "newest") next.set("sort", form.sort);
    setSp(next);
  };

  const clear = () => {
    setErrors({});
    setSp(campaign ? new URLSearchParams({ campaign }) : new URLSearchParams());
  };

  const setPage = (page: number) => {
    const next = new URLSearchParams(sp);
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    setSp(next);
  };

  const hasFilters = Object.entries(filters).some(([k, v]) => k !== "page" && v !== undefined);
  const platforms = res.data?.filters.platforms ?? [];
  const categories = res.data?.filters.categories ?? [];

  return (
    <div>
      <PageHeader title={c.creatorsTitle} description={c.creatorsIntro} />

      {campaign && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-control border border-accent/30 bg-accent-soft px-4 py-3">
          <p className="text-body-sm font-semibold text-text">{c.forCampaign(campaign)}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = new URLSearchParams(sp);
              next.delete("campaign");
              setSp(next);
            }}
          >
            {c.clearCampaign}
          </Button>
        </div>
      )}

      <Card as="section" padding="sm" className="mb-6">
        <h2 className="sr-only">{c.filtersTitle}</h2>
        <form onSubmit={apply} noValidate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={c.search} className="sm:col-span-2">
            <Input
              type="search"
              value={form.q}
              onChange={(e) => setForm({ ...form, q: e.target.value })}
              placeholder={c.searchPlaceholder}
              leading={<Search className="h-4 w-4" aria-hidden />}
              maxLength={80}
            />
          </Field>
          <Field label={c.platform}>
            <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              <option value="">{c.anyPlatform}</option>
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {labels.platform(p)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.category}>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">{c.anyCategory}</option>
              {categories.map((x) => (
                <option key={x} value={x}>
                  {labels.category(x)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.country} hint={c.countryHint} error={errors.country}>
            <CountrySelect value={form.country} onChange={(code) => setForm({ ...form, country: code })} />
          </Field>
          <Field label={c.minFollowers} error={errors.min_followers}>
            <Input
              inputMode="numeric"
              value={form.min_followers}
              onChange={(e) => setForm({ ...form, min_followers: e.target.value })}
            />
          </Field>
          <Field label={c.sort}>
            <Select value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value as Sort })}>
              <option value="newest">{c.sortNewest}</option>
              <option value="followers">{c.sortFollowers}</option>
              <option value="price_low">{c.sortPriceLow}</option>
              <option value="price_high">{c.sortPriceHigh}</option>
            </Select>
          </Field>
          <div className="flex flex-col justify-end gap-3">
            <Checkbox
              label={c.verifiedOnly}
              checked={form.verified_only}
              onChange={(e) => setForm({ ...form, verified_only: e.target.checked })}
            />
            <Checkbox
              label={c.availableOnly}
              checked={form.available_only}
              onChange={(e) => setForm({ ...form, available_only: e.target.checked })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
            <Button type="submit">{c.apply}</Button>
            {hasFilters && (
              <Button type="button" variant="ghost" onClick={clear}>
                {t("act.clear_filters")}
              </Button>
            )}
          </div>
        </form>
      </Card>

      {res.loading ? (
        <PageLoading rows={3} />
      ) : res.error ? (
        <LoadError error={res.error} onRetry={res.reload} />
      ) : res.data!.creators.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={c.noCreatorsTitle}
          description={hasFilters ? c.noCreatorsBody : c.noCreatorsAtAll}
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clear}>
                {t("act.clear_filters")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <section aria-label={c.creatorsTitle}>
          <p className="mb-3 text-body-sm text-text-subtle" aria-live="polite">
            {c.results(res.data!.meta.total)}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {res.data!.creators.map((cr) => (
              <CreatorCard key={cr.id} creator={cr} campaign={campaign} />
            ))}
          </ul>
          <Pagination meta={res.data!.meta} onPage={setPage} />
        </section>
      )}
    </div>
  );
}

function CreatorCard({ creator, campaign }: { creator: CreatorSummary; campaign: string | null }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const href = `/dashboard/creators/${encodeURIComponent(creator.slug)}${campaign ? `?campaign=${encodeURIComponent(campaign)}` : ""}`;
  const place = [creator.city, creator.country ? countryName(creator.country, locale) : null].filter(Boolean).join(", ");
  const platforms = Array.from(new Set(creator.social_accounts.map((s) => s.platform)));

  return (
    <li className="min-w-0">
      <Card padding="none" className="relative flex h-full flex-col gap-4 p-5 transition-colors hover:border-border-strong">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={creator.display_name} src={creator.avatar_url} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-h4 font-bold text-text">
              <Link
                to={href}
                className="rounded-[4px] after:absolute after:inset-0 after:content-[''] hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                aria-label={c.viewProfile(creator.display_name)}
              >
                {creator.display_name}
              </Link>
            </h3>
            {place && (
              <p className="mt-0.5 flex items-center gap-1 text-caption text-text-subtle">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 break-words">{place}</span>
              </p>
            )}
            <p className="mt-1.5">
              <Badge tone={creator.is_available ? "success" : "neutral"} size="sm" dot>
                {creator.is_available ? c.available : c.unavailable}
              </Badge>
            </p>
          </div>
        </div>

        {creator.categories.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label={c.categories}>
            {creator.categories.map((x) => (
              <li key={x}>
                <Badge tone="accent" size="sm">
                  {labels.category(x)}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-border-subtle pt-4">
          <div className="min-w-0">
            <p className="text-caption text-text-subtle">{c.followers}</p>
            <p className="font-bold tabular-nums text-text">{formatCount(creator.total_followers, locale)}</p>
            <div className="mt-1">
              <TotalMetricsBadge accounts={creator.social_accounts} hasVerified={creator.has_verified_metrics} />
            </div>
            {platforms.length > 0 && (
              <p className="mt-1 break-words text-caption text-text-subtle">{platforms.map(labels.platform).join(" · ")}</p>
            )}
          </div>
          <div className="min-w-0 text-right">
            {creator.from_price_minor != null && creator.from_price_currency ? (
              <>
                <p className="text-caption text-text-subtle">{c.fromPrice}</p>
                <Money minor={creator.from_price_minor} currency={creator.from_price_currency} className="font-bold text-text" />
              </>
            ) : (
              <p className="text-caption text-text-subtle">{c.noPackages}</p>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}
