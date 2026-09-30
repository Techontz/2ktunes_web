import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useResource } from "@/lib/api/useResource";
import { fetchRelease, platformList } from "@/lib/api/dashboard";
import { Badge, DataState, Panel, SectionLabel, Skeleton } from "./ui";
import { Cover, formatReleaseDate, releaseStatusTone } from "./release";

/**
 * RELEASE DETAIL — GET /api/releases/{id}
 *
 * The endpoint scopes by `user_id`, so another user's id returns 404 rather than
 * their release; the "Not found." state is that response, surfaced honestly.
 *
 * Only fields the API actually returns are rendered — a null column shows as an
 * em dash rather than being hidden, so the screen never implies data exists
 * where it doesn't.
 */

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-white/[0.06] py-3.5">
      <dt className="shrink-0 text-[0.8125rem] font-medium text-white/40">{label}</dt>
      <dd className="min-w-0 truncate text-right text-[0.875rem] font-semibold text-white">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function ReleaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const release = useResource((signal) => fetchRelease(id!, signal), [id]);

  return (
    <>
      <Link
        to="/dashboard/music"
        className="mb-6 inline-flex items-center gap-2 text-[0.8125rem] font-bold text-white/45 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-volt-lit/70"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
        My Music
      </Link>

      <DataState
        state={release}
        skeleton={
          <div className="space-y-4">
            <Skeleton className="h-[11rem]" />
            <Skeleton className="h-[16rem]" />
          </div>
        }
      >
        {(data) => {
          const platforms = platformList(data.platforms);
          const tracks = data.tracks ?? [];
          return (
            <>
              <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <Cover src={data.cover_image} size={148} className="rounded-[14px]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.5625rem] font-bold uppercase tracking-[0.22em] text-white/25">
                    {data.release_type}
                  </p>
                  <h1 className="mt-3 text-[1.875rem] font-extrabold leading-[1.03] tracking-[-0.04em] text-white sm:text-[2.375rem]">
                    {data.release_title}
                  </h1>
                  <p className="mt-2.5 text-[1rem] font-semibold text-white/50">
                    {data.artist_name}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge tone={releaseStatusTone(data.status)}>
                      {data.status ?? "unknown"}
                    </Badge>
                    <span className="text-[0.75rem] font-medium text-white/30">
                      {formatReleaseDate(data.release_date)}
                    </span>
                  </div>
                </div>
              </header>

              <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_20rem]">
                {/* ── TRACKS ── */}
                <section className="min-w-0">
                  <SectionLabel>
                    Tracks {tracks.length > 0 && `(${tracks.length})`}
                  </SectionLabel>
                  <div className="mt-4">
                    {tracks.length === 0 ? (
                      <Panel>
                        <p className="text-[0.875rem] font-medium text-white/40">
                          No tracks are attached to this release.
                        </p>
                      </Panel>
                    ) : (
                      <Panel className="p-0 sm:p-0">
                        <ul>
                          {tracks.map((track, i) => (
                            <li
                              key={track.id}
                              className={`p-4 sm:px-5 ${i > 0 ? "border-t border-white/[0.06]" : ""}`}
                            >
                              <div className="flex items-baseline gap-4">
                                <span className="w-5 shrink-0 text-[0.8125rem] font-bold tabular-nums text-white/25">
                                  {track.track_number}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[0.9375rem] font-bold text-white">
                                    {track.title}
                                  </span>
                                  {(track.version ||
                                    (track.featured_artists?.length ?? 0) > 0) && (
                                    <span className="mt-0.5 block truncate text-[0.75rem] font-medium text-white/35">
                                      {[
                                        track.version,
                                        track.featured_artists?.length
                                          ? `feat. ${track.featured_artists.join(", ")}`
                                          : null,
                                      ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </span>
                                  )}
                                </span>
                                {track.explicit && <Badge tone="neutral">Explicit</Badge>}
                              </div>

                              {track.audio_file && (
                                <audio
                                  controls
                                  preload="none"
                                  src={track.audio_file}
                                  className="mt-3 h-9 w-full"
                                >
                                  <a href={track.audio_file}>Open audio file</a>
                                </audio>
                              )}

                              {track.isrc && (
                                <p className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white/25">
                                  ISRC {track.isrc}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </Panel>
                    )}
                  </div>
                </section>

                {/* ── METADATA ── */}
                <aside className="min-w-0 space-y-4">
                  <Panel>
                    <SectionLabel>Release details</SectionLabel>
                    <dl className="mt-3">
                      <Detail label="Type" value={data.release_type} />
                      <Detail label="Release date" value={formatReleaseDate(data.release_date)} />
                      <Detail label="Primary genre" value={data.primary_genre} />
                      <Detail label="Secondary genre" value={data.secondary_genre} />
                      <Detail label="Language" value={data.language} />
                      <Detail label="Record label" value={data.record_label} />
                      <Detail label="UPC" value={data.upc} />
                    </dl>
                  </Panel>

                  <Panel>
                    <SectionLabel>Platforms</SectionLabel>
                    {platforms.length === 0 ? (
                      <p className="mt-3 text-[0.8125rem] font-medium text-white/35">
                        No platforms recorded on this release.
                      </p>
                    ) : (
                      <ul className="mt-3.5 flex flex-wrap gap-1.5">
                        {platforms.map((platform) => (
                          <li key={platform}>
                            <Badge tone="neutral">{platform}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>
                </aside>
              </div>
            </>
          );
        }}
      </DataState>
    </>
  );
}
