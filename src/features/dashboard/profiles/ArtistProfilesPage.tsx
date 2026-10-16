import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, UserRound } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, Input, RadioCardGroup, Select, useToast, type BadgeTone } from "@/components/ui";
import { FormAlert, InlineLoading, LoadError, PageHeader, PageLoading, useAction } from "@/features/dashboard/components";
import { fetchArtists } from "@/lib/api/catalog";
import { errorCodeOf } from "@/lib/api/errors";
import {
  fetchArtistClaims,
  isNotAvailable,
  isYoutubeChannelUrl,
  requestArtistClaim,
  type ArtistProfileClaim,
  type ArtistStoreProfiles,
  type ChannelOption,
  type ClaimInput,
  type ClaimService,
} from "@/lib/api/distribution";
import type { Artist } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

/**
 * /dashboard/profiles: request access to official artist profiles
 * (DOCS/DISTRIBUTION_PARITY.md section 4). One card per service, each
 * starting with "Select an artist"; the artist's requests for that service
 * are listed under the card. Service names are plain text only (no logos).
 */

const SERVICES: ClaimService[] = ["spotify", "apple_music", "youtube_oac", "tidal"];
const OPEN_STATUSES = ["requested", "in_progress"];

type ArtistRow = Artist & ArtistStoreProfiles;

export default function ArtistProfilesPage() {
  const c = useCopy(COPY);
  const artists = useResource((signal) => fetchArtists({ signal }), []);
  const list = (artists.data?.artists ?? []) as ArtistRow[];

  return (
    <div>
      <PageHeader title={c.title} description={c.description} />
      {artists.loading ? (
        <PageLoading rows={2} />
      ) : artists.error || !artists.data ? (
        <LoadError error={artists.error} onRetry={artists.reload} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<UserRound />}
          title={c.noArtists}
          action={<Button to="/dashboard/artists">{c.addArtist}</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {SERVICES.map((s) => (
            <ServiceCard key={s} service={s} artists={list} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── One service ───────────────────────────────────────────────────── */

function ServiceCard({ service, artists }: { service: ClaimService; artists: ArtistRow[] }) {
  const c = useCopy(COPY);
  const { toast } = useToast();
  const [artistId, setArtistId] = useState<string>(artists.length === 1 ? String(artists[0].id) : "");
  const [option, setOption] = useState<ChannelOption | null>(null);
  const [channelUrl, setChannelUrl] = useState("");
  const [local, setLocal] = useState<Record<string, string>>({});

  const artist = artists.find((a) => String(a.id) === artistId) ?? null;
  const claims = useResource(
    async (signal) => {
      if (!artistId) return [] as ArtistProfileClaim[];
      try {
        return await fetchArtistClaims(Number(artistId), { signal });
      } catch (err) {
        // The list endpoint may not be deployed yet: show the card, not an error.
        if (isNotAvailable(err)) return [] as ArtistProfileClaim[];
        throw err;
      }
    },
    [artistId],
  );
  const mine = (claims.data ?? []).filter((x) => x.service === service);
  const open = mine.some((x) => OPEN_STATUSES.includes(x.status));

  const submit = useAction((id: number, body: ClaimInput) => requestArtistClaim(id, body));

  const titleId = `claim-${service}-title`;
  const meta = c.services[service];
  const label =
    service === "youtube_oac" ? c.request : service === "tidal" ? c.requestVerification : c.requestAccess;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!artist) return;
    let body: ClaimInput;
    if (service === "youtube_oac") {
      const errs: Record<string, string> = {};
      if (!option) errs.channel_option = c.channelOptionRequired;
      if (option === "dedicated") {
        if (!channelUrl.trim()) errs.channel_url = c.channelUrlRequired;
        else if (!isYoutubeChannelUrl(channelUrl)) errs.channel_url = c.channelUrlInvalid;
      }
      setLocal(errs);
      if (Object.keys(errs).length || !option) return;
      body = { service, channel_option: option, channel_url: option === "dedicated" ? channelUrl.trim() : null };
    } else {
      body = { service };
    }
    const res = await submit.run(artist.id, body);
    if (res.ok) {
      toast({ title: c.sent, tone: "success" });
      if (res.value) claims.setData((prev) => [res.value!, ...(prev ?? [])]);
      else claims.reload();
      setOption(null);
      setChannelUrl("");
    }
  };

  const code = errorCodeOf(submit.errorObj);
  const errorBox = !submit.error ? null : code === "claim_needs_delivered_release" ? (
    <FormAlert tone="warning">
      {c.needsRelease(artist?.name ?? "")}{" "}
      <Link to="/dashboard/music" className="font-semibold text-accent-text underline underline-offset-4">
        {c.goToMusic}
      </Link>
    </FormAlert>
  ) : isNotAvailable(submit.errorObj) ? (
    <FormAlert tone="info">{c.notAvailable}</FormAlert>
  ) : (
    <FormAlert>{submit.fieldErrors.channel_url ?? submit.error}</FormAlert>
  );

  return (
    <section aria-labelledby={titleId} className="min-w-0 space-y-3">
      <Card className="flex h-full flex-col">
        <h2 id={titleId} className="text-h4 font-bold">
          {meta.name}
        </h2>
        <p className="mt-1 text-body-sm text-text-muted">{meta.body}</p>

        <form onSubmit={onSubmit} noValidate className="mt-5 flex flex-1 flex-col gap-4">
          <Field label={c.selectArtist}>
            <Select
              value={artistId}
              placeholder={c.selectPlaceholder}
              onChange={(e) => {
                setArtistId(e.target.value);
                setLocal({});
                submit.reset();
              }}
            >
              {artists.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>

          {artist && (
            <>
              {service === "spotify" && <p className="text-body-sm text-text-muted">{c.spotifyNote}</p>}

              {service === "apple_music" && (
                <div className="space-y-1.5 text-body-sm text-text-muted">
                  <p>{c.appleNote}</p>
                  <p>
                    {c.appleNotFound}{" "}
                    <a
                      href="https://artists.apple.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-accent-text underline-offset-4 hover:underline"
                    >
                      {c.appleLink}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </p>
                </div>
              )}

              {service === "youtube_oac" && (
                <>
                  <RadioCardGroup<ChannelOption>
                    legend={c.youtubeLegend}
                    name={`yt-option-${artistId}`}
                    value={option}
                    onChange={(v) => {
                      setOption(v);
                      setLocal((l) => ({ ...l, channel_option: "" }));
                    }}
                    error={local.channel_option || null}
                    options={(["none", "shared", "dedicated"] as const).map((v) => ({
                      value: v,
                      label: c.youtubeOptions[v].label,
                      description: c.youtubeOptions[v].hint,
                    }))}
                  />
                  {option === "dedicated" && (
                    <Field label={c.channelUrl} hint={c.channelUrlHint} error={local.channel_url || null} required>
                      <Input
                        type="url"
                        inputMode="url"
                        placeholder="https://www.youtube.com/@"
                        value={channelUrl}
                        maxLength={255}
                        onChange={(e) => {
                          setChannelUrl(e.target.value);
                          setLocal((l) => ({ ...l, channel_url: "" }));
                        }}
                      />
                    </Field>
                  )}
                </>
              )}

              {service === "tidal" && (
                <div>
                  <h3 className="text-body-sm font-bold text-text">{c.tidalStepsTitle}</h3>
                  <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-body-sm text-text-muted">
                    {c.tidalSteps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}

              {artist.has_delivered_release === false && !submit.error && (
                <p className="text-[0.8125rem] text-text-subtle">{c.needsReleaseHint}</p>
              )}
              {open && <FormAlert tone="info">{c.alreadyOpen}</FormAlert>}
              {errorBox}

              <div className="mt-auto pt-1">
                <Button type="submit" loading={submit.pending} disabled={open}>
                  {label}
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>

      {artist && <ClaimList artistName={artist.name} claims={mine} loading={claims.loading} error={claims.error} onRetry={claims.reload} />}
    </section>
  );
}

/* ── Existing requests under the card ──────────────────────────────── */

const TONES: Record<string, BadgeTone> = {
  requested: "warning",
  in_progress: "info",
  completed: "success",
  rejected: "danger",
};

function ClaimList({
  artistName,
  claims,
  loading,
  error,
  onRetry,
}: {
  artistName: string;
  claims: ArtistProfileClaim[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();

  return (
    <div className="px-1">
      <h3 className="text-body-sm font-bold text-text">{c.claimsTitle(artistName)}</h3>
      {loading ? (
        <InlineLoading label={c.claimsLoading} />
      ) : error ? (
        <LoadError error={error} onRetry={onRetry} compact />
      ) : claims.length === 0 ? (
        <p className="mt-1 text-body-sm text-text-subtle">{c.claimsEmpty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {claims.map((cl) => (
            <li
              key={cl.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border-subtle bg-surface-raised px-3.5 py-2.5"
            >
              <div className="min-w-0 text-body-sm">
                <p className="text-text">{c.requestedOn(formatDate(cl.created_at, locale))}</p>
                {cl.channel_url && <p className="break-all text-text-subtle">{cl.channel_url}</p>}
                {cl.note && <p className="break-words text-text-muted">{cl.note}</p>}
              </div>
              <Badge tone={TONES[cl.status] ?? "neutral"} dot size="sm">
                {c.status[cl.status] ?? cl.status.replace(/_/g, " ")}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
