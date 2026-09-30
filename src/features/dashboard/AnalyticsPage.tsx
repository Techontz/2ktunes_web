import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { useResource } from "@/lib/api/useResource";
import { fetchReleases } from "@/lib/api/dashboard";
import { DataState, PageHeader, Panel, SectionLabel, Skeleton } from "./ui";

/**
 * ANALYTICS — THE ONE SURFACE WITH NO BACKEND
 * ===========================================
 *
 * There is no streaming-analytics endpoint in this API. Not a partial one: no
 * plays, listeners, saves, playlist adds, territory or platform breakdown, and
 * no time series of any kind. `royalty_transactions` records money moving, not
 * consumption, and nothing else in the schema stores performance data.
 *
 * So this page shows no numbers. Drawing a chart here would mean generating the
 * data, and an invented stream count is worse than an empty screen — it's a
 * figure an artist might make decisions on.
 *
 * What IS real is the list below: the releases this account has delivered, which
 * is exactly the set that would be measured. When a reporting endpoint lands,
 * this page is where it plugs in — one `useResource` call and the per-release
 * rows already have somewhere to put their figures.
 */
export default function AnalyticsPage() {
  const releases = useResource((signal) => fetchReleases(signal));

  return (
    <>
      <PageHeader
        eyebrow="2K Tunes / Performance"
        title="Analytics"
        lede="Streaming performance isn’t available yet — the API doesn’t report it."
      />

      <Panel className="flex flex-col items-start gap-5 p-7">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/[0.09] bg-white/[0.03] text-white/35"
          aria-hidden
        >
          <BarChart3 className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-[1.125rem] font-bold text-white">
            No streaming data is being reported yet
          </p>
          <p className="mt-2.5 max-w-[58ch] text-[0.875rem] font-medium leading-relaxed text-white/40">
            2K Tunes doesn’t yet receive play counts, listener numbers or
            platform breakdowns from the stores, so there is nothing truthful to
            chart here. Rather than show estimated or placeholder figures, this
            page stays empty until real reporting exists.
          </p>
          <p className="mt-3 max-w-[58ch] text-[0.875rem] font-medium leading-relaxed text-white/40">
            What you earn from streams{" "}
            <em className="not-italic text-white/70">is</em> tracked — see{" "}
            <Link
              to="/dashboard/earnings"
              className="font-bold text-volt-lit underline decoration-volt-lit/40 underline-offset-4"
            >
              Earnings
            </Link>
            .
          </p>
        </div>
      </Panel>

      <section className="mt-10">
        <SectionLabel>Releases that will be measured</SectionLabel>
        <div className="mt-4">
          <DataState state={releases} skeleton={<Skeleton className="h-[8rem]" />}>
            {(list) =>
              list.length === 0 ? (
                <Panel>
                  <p className="text-[0.875rem] font-medium text-white/40">
                    You haven’t delivered a release yet.
                  </p>
                </Panel>
              ) : (
                <Panel className="p-0 sm:p-0">
                  <ul>
                    {list.map((release, i) => (
                      <li
                        key={release.id}
                        className={`flex items-center justify-between gap-4 p-4 sm:px-5 ${
                          i > 0 ? "border-t border-white/[0.06]" : ""
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[0.9375rem] font-bold text-white">
                            {release.release_title}
                          </span>
                          <span className="block truncate text-[0.75rem] font-medium text-white/35">
                            {release.artist_name}
                          </span>
                        </span>
                        <span className="shrink-0 text-[0.8125rem] font-semibold text-white/25">
                          No data
                        </span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )
            }
          </DataState>
        </div>
      </section>
    </>
  );
}
