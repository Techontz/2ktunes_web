import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CalendarClock, CheckCircle2, Disc3, ExternalLink, Instagram, Music2, Play, Youtube } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button, Checkbox, Field, Input, Skeleton } from "@/components/ui";
import { LoadError, useAction } from "@/features/dashboard/components";
import { LanguageSwitch } from "@/features/site/layout/LanguageSwitch";
import { usePageMeta } from "@/features/site/usePageMeta";
import { ApiError } from "@/lib/api/client";
import { fetchPublicRelease, logSmartLinkEvent, presave } from "@/lib/api/marketplace";
import type { PublicSmartLink } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

/**
 * /r/:slug — the public release landing page ("smart link").
 *
 * Mobile-first and standalone (no site or dashboard chrome). Exactly one
 * `view` event is logged per page load — the ref guard survives React
 * StrictMode's mount → unmount → mount. Store clicks log a `click` event
 * fire-and-forget; the link itself is a real <a>, so navigation never waits
 * on analytics. Sandbox links never reach this page (the API filters them).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SmartLinkPage() {
  const { slug = "" } = useParams();
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const res = useResource((signal) => fetchPublicRelease(slug, { signal }), [slug]);
  const release = res.data;


  const viewLogged = useRef<string | null>(null);
  useEffect(() => {
    if (!release || viewLogged.current === slug) return;
    viewLogged.current = slug;
    logSmartLinkEvent(slug, "view").catch(() => {
      /* analytics must never break the page */
    });
  }, [release, slug]);

  const notFound = res.errorObj instanceof ApiError && res.errorObj.status === 404;
  usePageMeta(
    release ? `${release.title} — ${release.artist}` : null,
    release ? c.by(release.artist) : undefined,
    { noindex: notFound },
  );

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-surface text-text">
      {release?.cover_url && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <img src={release.cover_url} alt="" className="h-full w-full scale-110 object-cover opacity-25 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-surface/80 to-surface" />
        </div>
      )}

      <header className="relative z-10 flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" aria-label={t("nav.home")} className="rounded-sm text-[1.125rem]">
          <Wordmark />
        </Link>
        <LanguageSwitch />
      </header>

      <main id="main" className="relative z-10 flex flex-1 justify-center px-4 pb-10 pt-4 sm:pt-8">
        <div className="w-full min-w-0 max-w-[26rem]">
          {res.loading ? (
            <LoadingState label={c.loading} />
          ) : notFound ? (
            <NotFound />
          ) : res.error || !release ? (
            <LoadError error={res.error} onRetry={res.reload} />
          ) : (
            <ReleaseView release={release} slug={slug} />
          )}
        </div>
      </main>

      <footer className="relative z-10 flex flex-col items-center gap-1 px-4 pb-6 text-caption text-text-subtle">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          {c.poweredBy} <Wordmark className="text-[0.95rem]" />
        </Link>
        <Link to="/distribution" className="rounded-sm underline-offset-4 hover:text-text hover:underline">
          {c.distributeCta}
        </Link>
      </footer>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div aria-busy="true">
      <span role="status" className="sr-only">
        {label}
      </span>
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mx-auto mt-6 h-7 w-3/4" />
      <Skeleton className="mx-auto mt-3 h-4 w-1/2" />
      <div className="mt-8 space-y-2.5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  const c = useCopy(COPY);
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <span
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-text-muted"
      >
        <Disc3 className="h-6 w-6" />
      </span>
      <h1 className="mt-5 text-h3 font-bold">{c.notFoundTitle}</h1>
      <p className="mt-2 max-w-[34ch] text-body-sm text-text-muted">{c.notFoundBody}</p>
      <Button to="/" className="mt-6">
        {c.goHome}
      </Button>
    </div>
  );
}

function ReleaseView({ release, slug }: { release: PublicSmartLink; slug: string }) {
  const c = useCopy(COPY);
  const [params] = useSearchParams();
  const { locale } = useLanguage();
  const typeLabel =
    release.type === "Single" ? c.typeSingle : release.type === "EP" ? c.typeEP : release.type === "Album" ? c.typeAlbum : release.type;
  const date = release.release_date ? formatDate(release.release_date, locale) : null;

  return (
    <article>
      {params.get("unsubscribed") === "1" && (
        <p role="status" className="mb-4 rounded-card border border-border-subtle bg-surface-raised px-4 py-3 text-center text-caption text-text-muted">
          {c.unsubscribed}
        </p>
      )}
      <div className="overflow-hidden rounded-card border border-border-subtle bg-surface-raised shadow-raised">
        {release.cover_url ? (
          <img
            src={release.cover_url}
            alt={c.coverAlt(release.title, release.artist)}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={c.coverAlt(release.title, release.artist)}
            className="flex aspect-square w-full items-center justify-center bg-surface-sunken text-text-subtle"
          >
            <Disc3 className="h-16 w-16" aria-hidden />
          </div>
        )}
      </div>

      <header className="mt-6 text-center">
        <h1 className="break-words text-h2 font-extrabold leading-tight tracking-[-0.03em]">
          {release.title}
          {release.version && <span className="font-semibold text-text-muted"> ({release.version})</span>}
        </h1>
        <p className="mt-1.5 break-words text-body font-semibold text-text-muted">{release.artist}</p>
        <p className="mt-2 text-caption text-text-subtle">
          {[typeLabel, date ? (release.state === "live" ? c.releasedOn(date) : c.outOn(date)) : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <div className="mt-7">
        {release.state === "live" ? (
          <StoreLinks release={release} slug={slug} />
        ) : release.state === "upcoming" ? (
          <Notice icon={<CalendarClock />} title={c.upcomingTitle}>
            {date ? c.upcomingBody(date) : c.upcomingBodyNoDate}
          </Notice>
        ) : (
          <Notice icon={<Music2 />} title={c.pendingTitle}>
            {c.pendingBody}
          </Notice>
        )}

        {release.state !== "live" && release.presave_enabled && <PresaveForm slug={slug} />}
      </div>

      <ArtistLinks links={release.artist_links} />
    </article>
  );
}

function StoreLinks({ release, slug }: { release: PublicSmartLink; slug: string }) {
  const c = useCopy(COPY);
  if (!release.links.length) {
    return <p className="text-center text-body-sm text-text-muted">{c.noLinks}</p>;
  }
  return (
    <section aria-labelledby="listen-heading">
      <h2 id="listen-heading" className="mb-3 text-center text-caption font-bold uppercase tracking-[0.14em] text-text-subtle">
        {c.listenOn}
      </h2>
      <ul className="overflow-hidden rounded-card border border-border-subtle bg-surface-raised/90 backdrop-blur">
        {release.links.map((l, i) => (
          <li key={`${l.store}-${i}`} className={i > 0 ? "border-t border-border-subtle" : undefined}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.listenAria(l.name)}
              onClick={() => {
                logSmartLinkEvent(slug, "click", l.store).catch(() => {
                  /* fire-and-forget */
                });
              }}
              className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-text"
            >
              <span className="min-w-0 break-words text-body font-semibold">{l.name}</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-body-sm font-semibold text-text">
                <Play className="h-3.5 w-3.5" aria-hidden />
                {c.play}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Notice({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-border-subtle bg-surface-raised/90 p-5 text-center backdrop-blur">
      <span
        aria-hidden
        className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent-text [&>svg]:h-5 [&>svg]:w-5"
      >
        {icon}
      </span>
      <h2 className="mt-3 text-h4 font-bold">{title}</h2>
      <p className="mt-1.5 text-body-sm text-text-muted">{children}</p>
    </section>
  );
}

function PresaveForm({ slug }: { slug: string }) {
  const c = useCopy(COPY);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [local, setLocal] = useState<{ email?: string; consent?: string }>({});
  const [done, setDone] = useState<string | null>(null);
  const action = useAction((e: string) => presave(slug, e));

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const next: { email?: string; consent?: string } = {};
    if (!EMAIL_RE.test(email.trim())) next.email = c.emailRequired;
    if (!consent) next.consent = c.consentRequired;
    setLocal(next);
    if (next.email || next.consent) return;
    const r = await action.run(email.trim());
    if (r.ok) setDone(c.notifySuccess);
  };

  const notAvailable = action.errorObj instanceof ApiError && action.errorObj.status === 404;
  const generalError = notAvailable
    ? c.notifyUnavailable
    : action.error && !action.fieldErrors.email && !action.fieldErrors.consent
      ? action.error
      : null;

  return (
    <section
      aria-labelledby="notify-heading"
      className="mt-4 rounded-card border border-border-subtle bg-surface-raised/90 p-5 backdrop-blur"
    >
      <h2 id="notify-heading" className="text-h4 font-bold">
        {c.notifyTitle}
      </h2>
      {/* Always mounted, so the success message is announced when it appears. */}
      <div aria-live="polite" role="status">
        {done && (
          <p className="mt-3 flex items-start gap-2 rounded-control border border-success/30 bg-success-soft px-3.5 py-3 text-body-sm font-medium text-text">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            {done}
          </p>
        )}
      </div>
      {!done && (
        <form onSubmit={submit} noValidate className="mt-2 space-y-4">
          <p className="text-body-sm text-text-muted">{c.notifyBody}</p>
          <Field label={c.email} error={local.email ?? action.fieldErrors.email} required>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
          </Field>
          <Checkbox
            label={c.consent}
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            error={local.consent ?? action.fieldErrors.consent}
            required
          />
          {generalError && (
            <p role="alert" className="text-body-sm font-medium text-danger">
              {generalError}
            </p>
          )}
          <Button type="submit" fullWidth loading={action.pending}>
            {c.notify}
          </Button>
        </form>
      )}
    </section>
  );
}

function ArtistLinks({ links }: { links: PublicSmartLink["artist_links"] }) {
  const c = useCopy(COPY);
  const items = (
    [
      { key: "instagram", label: c.instagram, icon: <Instagram /> },
      { key: "tiktok", label: c.tiktok, icon: <Music2 /> },
      { key: "youtube", label: c.youtube, icon: <Youtube /> },
    ] as const
  ).filter((i) => {
    const url = links?.[i.key];
    return typeof url === "string" && /^https?:\/\//i.test(url);
  });
  if (!items.length) return null;
  return (
    <section aria-labelledby="follow-heading" className="mt-8 text-center">
      <h2 id="follow-heading" className="text-caption font-bold uppercase tracking-[0.14em] text-text-subtle">
        {c.followArtist}
      </h2>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {items.map((i) => (
          <li key={i.key}>
            <a
              href={links[i.key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.followAria(i.label)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white/[0.04] px-4 text-body-sm font-semibold text-text transition-colors hover:border-border-strong hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text [&>svg]:h-4 [&>svg]:w-4"
            >
              {i.icon}
              {i.label}
              <ExternalLink className="!h-3 !w-3 text-text-subtle" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
