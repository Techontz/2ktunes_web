import { Link } from "react-router-dom";
import { Disc3, Upload } from "lucide-react";
import { useResource } from "@/lib/api/useResource";
import { fetchReleases, platformList } from "@/lib/api/dashboard";
import {
  Badge,
  Button,
  DataState,
  EmptyState,
  PageHeader,
  Panel,
  Skeleton,
} from "./ui";
import { Cover, formatReleaseDate, releaseStatusTone } from "./release";

/**
 * MY MUSIC — GET /api/releases
 *
 * The endpoint returns the caller's releases with their tracks eager-loaded, so
 * the track count on each row is real rather than a second request.
 *
 * The mobile app's equivalent screen calls `GET /api/songs`, which is not a
 * route in this backend — it renders empty forever. This uses the route that
 * exists.
 */
export default function MusicPage() {
  const releases = useResource((signal) => fetchReleases(signal));

  return (
    <>
      <PageHeader
        eyebrow="2K Tunes / Catalogue"
        title="My Music"
        lede="Every release you’ve delivered through 2K Tunes, with the status the backend has recorded for it."
        actions={
          <Link to="/dashboard/upload">
            <Button>
              <Upload className="h-4 w-4" strokeWidth={2.4} aria-hidden />
              New release
            </Button>
          </Link>
        }
      />

      <DataState
        state={releases}
        skeleton={
          <div className="space-y-3">
            <Skeleton className="h-[6.5rem]" />
            <Skeleton className="h-[6.5rem]" />
            <Skeleton className="h-[6.5rem]" />
          </div>
        }
        empty={(list) =>
          list.length === 0 ? (
            <EmptyState
              icon={<Disc3 className="h-5 w-5" strokeWidth={2} />}
              title="Your catalogue is empty"
              action={
                <Link to="/dashboard/upload">
                  <Button>
                    <Upload className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                    Start your first release
                  </Button>
                </Link>
              }
            >
              Once you deliver a single, EP or album it appears here with its
              artwork, tracks and review status.
            </EmptyState>
          ) : null
        }
      >
        {(list) => (
          <ul className="space-y-3">
            {list.map((release) => {
              const platforms = platformList(release.platforms);
              const trackCount = release.tracks?.length ?? 0;
              return (
                <Panel as="li" key={release.id} className="p-0 sm:p-0">
                  <Link
                    to={`/dashboard/music/${release.id}`}
                    className="flex items-center gap-4 p-4 outline-none transition-colors hover:bg-white/[0.025] focus-visible:ring-2 focus-visible:ring-volt-lit/70 sm:gap-5 sm:p-5"
                  >
                    <Cover src={release.cover_image} size={68} className="rounded-[10px]" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[1.0625rem] font-bold tracking-[-0.02em] text-white">
                        {release.release_title}
                      </p>
                      <p className="mt-1 truncate text-[0.875rem] font-semibold text-white/45">
                        {release.artist_name}
                      </p>
                      <p className="mt-2 truncate text-[0.75rem] font-medium text-white/30">
                        {release.release_type}
                        {" · "}
                        {formatReleaseDate(release.release_date)}
                        {trackCount > 0 && ` · ${trackCount} track${trackCount === 1 ? "" : "s"}`}
                        {platforms.length > 0 && ` · ${platforms.length} platforms`}
                      </p>
                    </div>

                    <Badge tone={releaseStatusTone(release.status)}>
                      {release.status ?? "unknown"}
                    </Badge>
                  </Link>
                </Panel>
              );
            })}
          </ul>
        )}
      </DataState>
    </>
  );
}
