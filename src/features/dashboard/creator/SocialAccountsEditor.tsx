import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Field, Input, Select, useToast } from "@/components/ui";
import { FormAlert, useAction } from "@/features/dashboard/components";
import { useLabels } from "@/features/dashboard/marketplace/labels";
import { MetricsBadge } from "@/features/dashboard/marketplace/shared";
import { saveMyCreatorProfile, type CreatorProfileInput } from "@/lib/api/marketplace";
import type { CreatorProfile, MetricsSource } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { bpToPercentInput, percentToBp } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { profileFields } from "./ProfileForm";

const MAX_ACCOUNTS = 8;

type Row = {
  key: string;
  platform: string;
  handle: string;
  url: string;
  followers: string;
  avg_views: string;
  engagement: string;
  audience: string;
  source: MetricsSource | null;
};

let seq = 0;
const nextKey = () => `row-${++seq}`;

function rowsFrom(p: CreatorProfile): Row[] {
  return p.social_accounts.map((a) => ({
    key: nextKey(),
    platform: a.platform,
    handle: a.handle,
    url: a.url ?? "",
    followers: a.followers != null ? String(a.followers) : "",
    avg_views: a.avg_views != null ? String(a.avg_views) : "",
    engagement: a.engagement_rate_bp != null ? bpToPercentInput(a.engagement_rate_bp) : "",
    audience: (a.audience_countries ?? []).map((x) => `${x.country} ${x.percent}`).join(", "),
    source: a.metrics_source ?? "self_reported",
  }));
}

const int = (s: string): number | null | undefined => {
  const v = s.trim().replace(/[\s,_]/g, "");
  if (!v) return null;
  return /^\d{1,10}$/.test(v) && Number(v) <= 2_000_000_000 ? Number(v) : undefined;
};

function parseAudience(s: string): { country: string; percent: number }[] | null {
  const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
  const out: { country: string; percent: number }[] = [];
  for (const p of parts) {
    const m = /^([A-Za-z]{2})\s*[:\s]\s*(\d{1,3})\s*%?$/.exec(p);
    if (!m || Number(m[2]) > 100) return null;
    out.push({ country: m[1].toUpperCase(), percent: Number(m[2]) });
  }
  return out.length > 10 ? null : out;
}

/**
 * Edit the list of social accounts. Saved through PUT /creator/profile, which
 * replaces the profile including social_accounts, so the current profile
 * fields are sent along. The API keeps an account's verification only while
 * its handle, followers, average views and engagement are unchanged.
 */
export function SocialAccountsEditor({
  profile,
  platforms,
  onSaved,
}: {
  profile: CreatorProfile;
  platforms: string[];
  onSaved: (p: CreatorProfile) => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>(() => rowsFrom(profile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useAction((input: CreatorProfileInput) => saveMyCreatorProfile(input));

  const update = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const add = () =>
    setRows((rs) => [
      ...rs,
      {
        key: nextKey(),
        platform: "",
        handle: "",
        url: "",
        followers: "",
        avg_views: "",
        engagement: "",
        audience: "",
        source: null,
      },
    ]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const seen = new Set<string>();
    const accounts: NonNullable<CreatorProfileInput["social_accounts"]> = [];
    rows.forEach((r, i) => {
      const k = (f: string) => `social_accounts.${i}.${f}`;
      if (!r.platform) errs[k("platform")] = c.platformRequired;
      else if (seen.has(r.platform)) errs[k("platform")] = c.platformDuplicate;
      seen.add(r.platform);
      if (!r.handle.trim()) errs[k("handle")] = c.handleRequired;
      if (r.url.trim() && !/^https?:\/\/\S+\.\S+/i.test(r.url.trim())) errs[k("url")] = c.urlInvalid;
      const followers = int(r.followers);
      if (followers === undefined) errs[k("followers")] = c.wholeNumber;
      const avg = int(r.avg_views);
      if (avg === undefined) errs[k("avg_views")] = c.wholeNumber;
      let bp: number | null = null;
      if (r.engagement.trim()) {
        const v = percentToBp(r.engagement);
        if (v === null || v > 10000) errs[k("engagement_rate_bp")] = c.engagementInvalid;
        else bp = v;
      }
      const audience = r.audience.trim() ? parseAudience(r.audience) : [];
      if (audience === null) errs[k("audience_countries")] = c.audienceInvalid;
      accounts.push({
        platform: r.platform,
        handle: r.handle.trim(),
        url: r.url.trim() || null,
        followers: followers ?? null,
        avg_views: avg ?? null,
        engagement_rate_bp: bp,
        audience_countries: audience ?? [],
      });
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const res = await save.run({ ...profileFields(profile), social_accounts: accounts });
    if (res.ok) {
      toast({ title: c.accountsSaved, tone: "success" });
      setRows(rowsFrom(res.value));
      onSaved(res.value);
    }
  };

  const err = (i: number, f: string) => errors[`social_accounts.${i}.${f}`] ?? save.fieldErrors[`social_accounts.${i}.${f}`];
  const opt = { optional: true, optionalLabel: t("common.optional") };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="max-w-[70ch] text-body-sm text-text-muted">
        {c.socialIntro(t("metrics.self_reported"), t("metrics.admin_verified"), t("metrics.platform_verified"))}
      </p>
      <FormAlert tone="info">{c.socialReset}</FormAlert>

      {rows.length === 0 ? (
        <EmptyState compact title={c.socialEmpty} />
      ) : (
        <ol className="space-y-4">
          {rows.map((r, i) => (
            <li key={r.key}>
              <Card padding="sm">
                <fieldset className="min-w-0">
                  <legend className="text-body-sm font-bold text-text">
                    {r.platform ? labels.platform(r.platform) : c.accountN(i + 1)}
                  </legend>
                  <div className="mb-3 mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <MetricsBadge source={r.source ?? "self_reported"} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 />}
                        aria-label={c.removeAccount(i + 1)}
                        onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                      >
                        {t("act.remove")}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label={c.platform} error={err(i, "platform")} required>
                      <Select
                        value={r.platform}
                        onChange={(e) => update(r.key, { platform: e.target.value })}
                        placeholder={c.choosePlatform}
                      >
                        {platforms.map((p) => (
                          <option key={p} value={p}>
                            {labels.platform(p)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label={c.handle} error={err(i, "handle")} required>
                      <Input value={r.handle} onChange={(e) => update(r.key, { handle: e.target.value })} maxLength={80} />
                    </Field>
                    <Field label={c.url} error={err(i, "url")} {...opt}>
                      <Input type="url" inputMode="url" value={r.url} onChange={(e) => update(r.key, { url: e.target.value })} maxLength={512} />
                    </Field>
                    <Field label={c.followers} error={err(i, "followers")} {...opt}>
                      <Input inputMode="numeric" value={r.followers} onChange={(e) => update(r.key, { followers: e.target.value })} />
                    </Field>
                    <Field label={c.avgViews} error={err(i, "avg_views")} {...opt}>
                      <Input inputMode="numeric" value={r.avg_views} onChange={(e) => update(r.key, { avg_views: e.target.value })} />
                    </Field>
                    <Field label={c.engagement} error={err(i, "engagement_rate_bp")} {...opt}>
                      <Input inputMode="decimal" value={r.engagement} onChange={(e) => update(r.key, { engagement: e.target.value })} />
                    </Field>
                    <Field
                      label={c.audience}
                      hint={c.audienceHint}
                      error={err(i, "audience_countries")}
                      className="sm:col-span-2 lg:col-span-3"
                      {...opt}
                    >
                      <Input value={r.audience} onChange={(e) => update(r.key, { audience: e.target.value })} />
                    </Field>
                  </div>
                </fieldset>
              </Card>
            </li>
          ))}
        </ol>
      )}

      {save.error && <FormAlert>{save.error}</FormAlert>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {rows.length < MAX_ACCOUNTS ? (
          <Button type="button" variant="secondary" leftIcon={<Plus />} onClick={add}>
            {c.addAccount}
          </Button>
        ) : (
          <p className="text-caption text-text-subtle">{c.maxAccounts(MAX_ACCOUNTS)}</p>
        )}
        <Button type="submit" loading={save.pending}>
          {c.saveAccounts}
        </Button>
      </div>
    </form>
  );
}
