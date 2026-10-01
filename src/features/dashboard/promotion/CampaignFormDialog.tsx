import { useState, type FormEvent } from "react";
import { Button, Dialog, Field, Input, Select, Textarea, useToast } from "@/components/ui";
import { FormAlert, InlineLoading, LoadError, useAction } from "@/features/dashboard/components";
import { useLabels, CAMPAIGN_OBJECTIVES } from "@/features/dashboard/marketplace/labels";
import { CountrySelect } from "@/components/forms/CountrySelect";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchRelease, fetchReleaseConfig, fetchReleases } from "@/lib/api/catalog";
import { createCampaign, updateCampaign, type CampaignInput } from "@/lib/api/marketplace";
import type { Campaign, CampaignObjective, CampaignType } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useLanguage } from "@/lib/LanguageContext";
import { minorToDecimal, parseAmount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

const PITCH_KEYS = ["platform", "genre", "mood", "description", "similar_artists"] as const;

/** Create or edit a campaign (POST /campaigns, PATCH /campaigns/{id}). */
export function CampaignFormDialog({
  open,
  onClose,
  campaign,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  onSaved: (c: Campaign) => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={campaign ? c.editTitle : c.createTitle}
      description={c.formIntro}
      closeLabel={t("common.close")}
      size="lg"
    >
      {open && <CampaignForm campaign={campaign ?? null} onClose={onClose} onSaved={onSaved} />}
    </Dialog>
  );
}

function CampaignForm({
  campaign,
  onClose,
  onSaved,
}: {
  campaign: Campaign | null;
  onClose: () => void;
  onSaved: (c: Campaign) => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const { user } = useAuth();
  const { toast } = useToast();

  const ref = useResource(async (signal) => {
    const [config, releases] = await Promise.all([fetchReleaseConfig(), fetchReleases({ per_page: 100 }, { signal })]);
    return { market: config.marketplace, genres: config.genres ?? [], releases: releases.releases };
  }, []);

  const [f, setF] = useState(() => ({
    title: campaign?.title ?? "",
    type: (campaign?.type ?? "creator_campaign") as string,
    objective: (campaign?.objective ?? "") as string,
    release_id: campaign?.release_id ? String(campaign.release_id) : "",
    track_id: campaign?.track_id ? String(campaign.track_id) : "",
    budget: campaign?.budget_minor != null ? minorToDecimal(campaign.budget_minor, campaign.currency) : "",
    currency: campaign?.currency ?? "",
    countries: (campaign?.target_countries ?? []).map((x) => x.toUpperCase()),
    audience: campaign?.target_audience ?? "",
    brief: campaign?.brief ?? "",
    starts_on: campaign?.starts_on ?? "",
    ends_on: campaign?.ends_on ?? "",
    pitch: Object.fromEntries(PITCH_KEYS.map((k) => [k, campaign?.pitch?.[k] ?? ""])) as Record<
      (typeof PITCH_KEYS)[number],
      string
    >,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }));

  const tracks = useResource(
    (signal) => (f.release_id ? fetchRelease(f.release_id, { signal }).then((r) => r.tracks ?? []) : Promise.resolve([])),
    [f.release_id],
  );

  const save = useAction((input: CampaignInput) =>
    campaign ? updateCampaign(campaign.id, input) : createCampaign(input as CampaignInput & { title: string; type: CampaignType }),
  );

  if (ref.loading) return <InlineLoading />;
  if (ref.error || !ref.data) return <LoadError error={ref.error} onRetry={ref.reload} compact />;
  const { market, genres, releases } = ref.data;
  const genreOptions = f.pitch.genre && !genres.includes(f.pitch.genre) ? [f.pitch.genre, ...genres] : genres;
  const currencies = market.currencies;
  const currency =
    f.currency ||
    (user?.preferred_currency && currencies.includes(user.preferred_currency) ? user.preferred_currency : currencies[0] ?? "TZS");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.title.trim()) errs.title = c.fTitleRequired;
    let budget: string | null = null;
    if (f.budget.trim()) {
      const parsed = parseAmount(f.budget, currency);
      if (!parsed) errs.budget = c.fBudgetInvalid;
      else budget = parsed.decimal;
    }
    const countries = f.countries;
    if (f.starts_on && f.ends_on && f.ends_on < f.starts_on) errs.ends_on = c.fEndsInvalid;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const isPitch = f.type === "playlist_pitching";
    const input: CampaignInput = {
      title: f.title.trim(),
      type: f.type as CampaignType,
      objective: (f.objective || null) as CampaignObjective | null,
      release_id: f.release_id ? Number(f.release_id) : null,
      track_id: f.release_id && f.track_id ? Number(f.track_id) : null,
      target_countries: countries.length ? countries : null,
      target_audience: f.audience.trim() || null,
      brief: f.brief.trim() || null,
      starts_on: f.starts_on || null,
      ends_on: f.ends_on || null,
      pitch: isPitch
        ? Object.fromEntries(PITCH_KEYS.map((k) => [k, f.pitch[k].trim() || null]))
        : campaign?.pitch
          ? null
          : undefined,
    };
    // The API ignores a null budget, so only send one that was entered.
    if (budget !== null) {
      input.budget = budget;
      input.currency = currency;
    }
    const res = await save.run(input);
    if (res.ok) {
      toast({ title: campaign ? c.saved2 : c.created, tone: "success" });
      onSaved(res.value);
      onClose();
    }
  };

  const err = (k: string) => errors[k] ?? save.fieldErrors[k];
  const opt = { optional: true, optionalLabel: t("common.optional") };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.fTitle} error={err("title")} required className="sm:col-span-2">
          <Input value={f.title} onChange={(e) => set({ title: e.target.value })} maxLength={120} />
        </Field>
        <Field label={c.fType} error={err("type")} required>
          <Select value={f.type} onChange={(e) => set({ type: e.target.value })}>
            {market.campaign_types.map((x) => (
              <option key={x} value={x}>
                {labels.campaignType(x)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.fObjective} error={err("objective")} {...opt}>
          <Select value={f.objective} onChange={(e) => set({ objective: e.target.value })}>
            <option value="">{c.fObjectiveNone}</option>
            {CAMPAIGN_OBJECTIVES.map((x) => (
              <option key={x} value={x}>
                {labels.objective(x)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.fRelease} error={err("release_id")} {...opt}>
          <Select value={f.release_id} onChange={(e) => set({ release_id: e.target.value, track_id: "" })}>
            <option value="">{c.fReleaseNone}</option>
            {releases.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.release_title} · {r.artist_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.fTrack} error={err("track_id")} {...opt}>
          <Select
            value={f.track_id}
            onChange={(e) => set({ track_id: e.target.value })}
            disabled={!f.release_id || tracks.loading || (tracks.data ?? []).length === 0}
          >
            <option value="">{c.fTrackNone}</option>
            {(tracks.data ?? []).map((tr) => (
              <option key={tr.id} value={String(tr.id)}>
                {tr.track_number}. {tr.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.fBudget} hint={c.fBudgetHint} error={err("budget")} {...opt}>
          <Input inputMode="decimal" value={f.budget} onChange={(e) => set({ budget: e.target.value })} maxLength={20} />
        </Field>
        <Field label={c.fCurrency} error={err("currency")}>
          <Select value={currency} onChange={(e) => set({ currency: e.target.value })}>
            {currencies.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.fCountries} hint={c.fCountriesHint} error={err("target_countries")} className="sm:col-span-2" {...opt}>
          <CountrySelect multiple value={f.countries} onChange={(next) => set({ countries: next })} />
        </Field>
        <Field label={c.fAudience} hint={c.fAudienceHint} error={err("target_audience")} {...opt}>
          <Input value={f.audience} onChange={(e) => set({ audience: e.target.value })} maxLength={1000} />
        </Field>
        <Field label={c.fStarts} error={err("starts_on")} {...opt}>
          <Input type="date" value={f.starts_on} onChange={(e) => set({ starts_on: e.target.value })} />
        </Field>
        <Field label={c.fEnds} error={err("ends_on")} {...opt}>
          <Input type="date" value={f.ends_on} min={f.starts_on || undefined} onChange={(e) => set({ ends_on: e.target.value })} />
        </Field>
        <Field label={c.fBrief} hint={c.fBriefHint} error={err("brief")} className="sm:col-span-2" {...opt}>
          <Textarea value={f.brief} onChange={(e) => set({ brief: e.target.value })} maxLength={5000} rows={4} />
        </Field>
      </div>

      {f.type === "playlist_pitching" && (
        <fieldset className="space-y-4 rounded-card border border-border-subtle p-4">
          <legend className="px-1 text-body-sm font-bold text-text">{c.fPitch}</legend>
          <p className="text-caption text-text-subtle">{c.fPitchIntro}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={c.fPitchPlatform} error={err("pitch.platform")} {...opt}>
              <Input
                value={f.pitch.platform}
                onChange={(e) => set({ pitch: { ...f.pitch, platform: e.target.value } })}
                maxLength={40}
              />
            </Field>
            <Field label={c.fPitchGenre} error={err("pitch.genre")} {...opt}>
              <Select value={f.pitch.genre} onChange={(e) => set({ pitch: { ...f.pitch, genre: e.target.value } })}>
                <option value="">-</option>
                {genreOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={c.fPitchMood} error={err("pitch.mood")} {...opt}>
              <Input value={f.pitch.mood} onChange={(e) => set({ pitch: { ...f.pitch, mood: e.target.value } })} maxLength={120} />
            </Field>
          </div>
          <Field label={c.fPitchDescription} error={err("pitch.description")} {...opt}>
            <Textarea
              value={f.pitch.description}
              onChange={(e) => set({ pitch: { ...f.pitch, description: e.target.value } })}
              maxLength={2000}
              rows={3}
            />
          </Field>
          <Field label={c.fPitchSimilar} error={err("pitch.similar_artists")} {...opt}>
            <Input
              value={f.pitch.similar_artists}
              onChange={(e) => set({ pitch: { ...f.pitch, similar_artists: e.target.value } })}
              maxLength={500}
            />
          </Field>
        </fieldset>
      )}

      {save.error && <FormAlert>{save.error}</FormAlert>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={save.pending}>
          {t("act.cancel")}
        </Button>
        <Button type="submit" loading={save.pending}>
          {campaign ? t("act.save_changes") : t("act.create")}
        </Button>
      </div>
    </form>
  );
}
