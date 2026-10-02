import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Disc3, Link2, ShieldCheck } from "lucide-react";
import { Button, Dialog, Field, Input, RadioCardGroup, Select, Textarea, useToast } from "@/components/ui";
import { FormAlert, InlineLoading, Money, useAction } from "@/features/dashboard/components";
import { fetchRelease, fetchReleaseConfig, fetchReleases } from "@/lib/api/catalog";
import { createCreatorRequest, type CreatorRequestInput } from "@/lib/api/marketplace";
import type { CreatorPackage, Track } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { todayIso } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { formatBp } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { useLabels } from "./labels";
import { detectPlatform, isHttpUrl } from "./platform";
import { REQ_COPY } from "./requestCopy";

/** Mirrors config/marketplace.php `platform_fee_bp` when the config can't be read. */
const DEFAULT_FEE_BP = 1500;

export type RequestTarget = { pkg: CreatorPackage; creatorName: string };

/**
 * "Request this creator": pick the song (one of my releases and a track, or
 * a link to a song released elsewhere), add an optional brief and preferred
 * post date, see the price and fee, then POST /creator-requests. Nothing is
 * charged here: the artist pays after the creator accepts.
 */
export function CreatorRequestDialog({
  target,
  onClose,
  campaignId,
}: {
  target: RequestTarget | null;
  onClose: () => void;
  campaignId?: number | null;
}) {
  const c = useCopy(REQ_COPY);
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={!!target}
      onClose={busy ? () => {} : onClose}
      dismissible={!busy}
      title={target ? c.requestTitle(target.pkg.title) : ""}
      description={c.requestIntro}
      closeLabel={t("common.close")}
      size="lg"
      footer={
        target ? (
          <>
            <Button variant="ghost" onClick={onClose} disabled={busy}>
              {t("act.cancel")}
            </Button>
            <Button type="submit" form="creator-request-form" loading={busy}>
              {c.sendRequest}
            </Button>
          </>
        ) : undefined
      }
    >
      {target && <RequestForm target={target} campaignId={campaignId} onBusy={setBusy} onDone={onClose} />}
    </Dialog>
  );
}

type Source = "catalog" | "external";

function RequestForm({
  target,
  campaignId,
  onBusy,
  onDone,
}: {
  target: RequestTarget;
  campaignId?: number | null;
  onBusy: (b: boolean) => void;
  onDone: () => void;
}) {
  const c = useCopy(REQ_COPY);
  const { t, locale } = useLanguage();
  const labels = useLabels();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pkg } = target;

  const data = useResource(async (signal) => {
    const [list, config] = await Promise.all([
      fetchReleases({ per_page: 100, sort: "newest" }, { signal }).catch(() => null),
      fetchReleaseConfig().catch(() => null),
    ]);
    return {
      releases: list?.releases ?? [],
      feeBp: config?.marketplace?.platform_fee_bp ?? DEFAULT_FEE_BP,
    };
  }, []);

  const [source, setSource] = useState<Source>("catalog");
  const [releaseId, setReleaseId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [brief, setBrief] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const send = useAction((input: CreatorRequestInput) => createCreatorRequest(input));

  useEffect(() => onBusy(send.pending), [send.pending, onBusy]);

  // No releases yet: default to a link.
  useEffect(() => {
    if (data.data && data.data.releases.length === 0) setSource("external");
  }, [data.data]);

  // Load the chosen release's tracks.
  useEffect(() => {
    setTrackId("");
    setTracks(null);
    if (!releaseId) return;
    const ctrl = new AbortController();
    fetchRelease(releaseId, { signal: ctrl.signal })
      .then((r) => setTracks(r.tracks ?? []))
      .catch(() => setTracks([]));
    return () => ctrl.abort();
  }, [releaseId]);

  const detected = isHttpUrl(url) ? detectPlatform(url) : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (source === "catalog" && !releaseId) errs.release_id = c.releaseRequired;
    if (source === "external") {
      if (!isHttpUrl(url)) errs.song_url = c.songUrlInvalid;
      if (!title.trim()) errs.song_title = c.songTitleRequired;
      if (!artist.trim()) errs.song_artist = c.songArtistRequired;
    }
    if (date && date < todayIso()) errs.preferred_post_date = c.postDateInvalid;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const base = {
      creator_package_id: pkg.id,
      brief: brief.trim() || null,
      preferred_post_date: date || null,
      campaign_id: campaignId ?? null,
    };
    const input: CreatorRequestInput =
      source === "catalog"
        ? { ...base, release_id: Number(releaseId), track_id: trackId ? Number(trackId) : null }
        : { ...base, song_url: url.trim(), song_title: title.trim(), song_artist: artist.trim() };
    const res = await send.run(input);
    if (res.ok) {
      toast({ title: c.requestSent, description: c.requestSentBody, tone: "success" });
      onDone();
      navigate(`/dashboard/orders/${res.value.id}`);
    }
  };

  const err = (k: string) => errors[k] ?? send.fieldErrors[k];
  const opt = { optional: true, optionalLabel: t("common.optional") };
  const releases = data.data?.releases ?? [];
  const fee = formatBp(data.data?.feeBp ?? DEFAULT_FEE_BP, locale);
  const fieldOnly = Object.keys(send.fieldErrors).some((k) =>
    ["release_id", "track_id", "song_url", "song_title", "song_artist", "brief", "preferred_post_date"].includes(k),
  );

  return (
    <form id="creator-request-form" onSubmit={submit} noValidate className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-control border border-border-subtle bg-surface-sunken px-4 py-3">
        <div className="min-w-0">
          <p className="break-words font-semibold text-text">{pkg.title}</p>
          <p className="text-caption text-text-subtle">
            {target.creatorName} · {labels.platform(pkg.platform)}
          </p>
        </div>
        <Money minor={pkg.price_minor} currency={pkg.currency} className="text-h4 font-bold text-text" />
      </div>

      {data.loading ? (
        <InlineLoading />
      ) : (
        <RadioCardGroup<Source>
          legend={c.songSource}
          name="request-song-source"
          value={source}
          onChange={setSource}
          columns={2}
          options={[
            { value: "catalog", label: c.sourceCatalog, description: c.sourceCatalogHint, icon: <Disc3 /> },
            { value: "external", label: c.sourceExternal, description: c.sourceExternalHint, icon: <Link2 /> },
          ]}
        />
      )}

      {!data.loading && source === "catalog" && (
        releases.length === 0 ? (
          <FormAlert tone="info">{c.noReleases}</FormAlert>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={c.release} error={err("release_id")} required>
              <Select value={releaseId} onChange={(e) => setReleaseId(e.target.value)} placeholder={c.chooseRelease}>
                {releases.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.release_title} · {r.artist_name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={c.track} error={err("track_id")} {...opt}>
              <Select
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                disabled={!releaseId || tracks === null}
              >
                <option value="">{releaseId && tracks === null ? c.tracksLoading : c.firstTrack}</option>
                {(tracks ?? []).map((tr) => (
                  <option key={tr.id} value={String(tr.id)}>
                    {tr.track_number}. {tr.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )
      )}

      {!data.loading && source === "external" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={c.songUrl}
            hint={detected ? c.detected(labels.platform(detected)) : c.songUrlHint}
            error={err("song_url")}
            required
            className="sm:col-span-2"
          >
            <Input
              type="url"
              inputMode="url"
              placeholder="https://"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              maxLength={1024}
            />
          </Field>
          <Field label={c.songTitle} error={err("song_title")} required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} />
          </Field>
          <Field label={c.songArtist} error={err("song_artist")} required>
            <Input value={artist} onChange={(e) => setArtist(e.target.value)} maxLength={255} />
          </Field>
        </div>
      )}

      <Field label={c.brief} hint={c.briefHint} error={err("brief")} {...opt}>
        <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={5000} rows={4} />
      </Field>
      <p className="-mt-2 flex gap-2 text-caption text-text-subtle">
        <ShieldCheck className="mt-px h-4 w-4 shrink-0 text-accent-text" aria-hidden />
        <span>{c.contactNote}</span>
      </p>

      <Field label={c.postDate} error={err("preferred_post_date")} className="sm:max-w-[16rem]" {...opt}>
        <Input type="date" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <section aria-labelledby="req-summary" className="rounded-card border border-accent/25 bg-accent-soft/60 p-4">
        <h3 id="req-summary" className="text-body-sm font-bold text-text">
          {c.summaryTitle}
        </h3>
        <dl className="mt-2 space-y-1.5 text-body-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-text-muted">{c.packagePrice}</dt>
            <dd>
              <Money minor={pkg.price_minor} currency={pkg.currency} className="text-text" />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-accent/15 pt-1.5">
            <dt className="font-semibold text-text">{c.youPay}</dt>
            <dd>
              <Money minor={pkg.price_minor} currency={pkg.currency} className="font-bold text-text" />
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-caption text-text-muted">{c.turnaround(pkg.turnaround_days)}</p>
        <p className="mt-2 text-caption font-semibold text-text">{c.payLater}</p>
        <p className="mt-1 text-caption text-text-muted">{c.feeNote(fee)}</p>
      </section>

      {send.error && !fieldOnly && <FormAlert>{send.error}</FormAlert>}
    </form>
  );
}
