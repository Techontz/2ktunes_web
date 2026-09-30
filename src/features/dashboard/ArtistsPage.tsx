import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, UserRound } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { errorMessage, useResource } from "@/lib/api/useResource";
import { createArtist, fetchArtists } from "@/lib/api/dashboard";
import {
  Button,
  DataState,
  EmptyState,
  Field,
  Notice,
  PageHeader,
  Panel,
  SectionLabel,
  Skeleton,
} from "./ui";

/**
 * ARTISTS — GET /api/artists, POST /api/artists
 *
 * The artist limit is a real product rule, enforced server-side: the controller
 * resolves the caller's plan by NAME (`plans.name` = `users.subscription_plan`)
 * and refuses to create beyond `plan.max_artists`.
 *
 * Two of its refusals are 403s that the UI must not disguise:
 *
 *   • "No active subscription plan found."  — the account has no
 *     `subscription_plan`, or no `plans` row matches that name.
 *   • "Artist limit reached for your subscription."
 *
 * Both are shown verbatim, because they describe the user's real situation. The
 * client does not pre-empt them with its own guess at the limit — it only
 * disables the form once the count provably reaches a known maximum.
 */
export default function ArtistsPage() {
  const artists = useResource((signal) => fetchArtists(signal));
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    setError(null);
    setFieldError(null);

    const value = name.trim();
    if (!value) {
      setFieldError("Enter the artist name.");
      return;
    }

    setBusy(true);
    try {
      await createArtist(value);
      setName("");
      artists.reload();
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 422)) {
        // The backend's own words: plan missing, limit reached, or duplicate.
        if (err.fieldErrors.name) setFieldError(err.fieldErrors.name);
        else setError(err.message);
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="2K Tunes / Roster"
        title="Artists"
        lede="The artist names you can release under. How many you get is set by your plan and enforced by the backend."
      />

      <DataState
        state={artists}
        skeleton={
          <div className="grid gap-4 lg:grid-cols-[1fr_21rem]">
            <Skeleton className="h-[14rem]" />
            <Skeleton className="h-[14rem]" />
          </div>
        }
      >
        {(data) => {
          const max = data.user.plan?.max_artists ?? null;
          const atLimit = max != null && data.artists.length >= max;

          return (
            <div className="grid gap-4 lg:grid-cols-[1fr_21rem]">
              <section className="min-w-0">
                {data.artists.length === 0 ? (
                  <EmptyState
                    icon={<UserRound className="h-5 w-5" strokeWidth={2} />}
                    title="No artists yet"
                  >
                    Add the name you release music under. It’s what appears on
                    Spotify, Apple Music and every other platform you deliver to.
                  </EmptyState>
                ) : (
                  <Panel className="p-0 sm:p-0">
                    <ul>
                      {data.artists.map((artist, i) => (
                        <li
                          key={artist.id}
                          className={`flex items-center gap-4 p-4 sm:px-5 ${
                            i > 0 ? "border-t border-white/[0.06]" : ""
                          }`}
                        >
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-volt/20 text-[0.8125rem] font-bold text-volt-lit"
                            aria-hidden
                          >
                            {artist.name.trim().charAt(0).toUpperCase() || "•"}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.9375rem] font-bold text-white">
                              {artist.name}
                            </span>
                            <span className="block text-[0.75rem] font-medium text-white/30">
                              Added{" "}
                              {new Date(artist.created_at).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                )}
              </section>

              <aside className="min-w-0 space-y-4">
                <Panel as="form" onSubmit={submit}>
                  <SectionLabel>Add an artist</SectionLabel>

                  <div className="mt-4">
                    <Field
                      label="Artist name"
                      placeholder="e.g. Conrad Bubex"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      error={fieldError ?? undefined}
                      disabled={atLimit}
                      maxLength={255}
                      hint={
                        max != null
                          ? `${data.artists.length} of ${max} used on the ${data.user.plan?.name} plan`
                          : undefined
                      }
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="mt-4 rounded-[11px] border border-clay/30 bg-clay/[0.07] px-3.5 py-2.5 text-[0.8125rem] font-medium text-clay"
                    >
                      {error}
                    </p>
                  )}

                  <Button type="submit" busy={busy} disabled={atLimit} className="mt-5 w-full">
                    <Plus className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                    Add artist
                  </Button>
                </Panel>

                {atLimit && (
                  <Notice
                    tone="accent"
                    title="You’ve used every artist slot on your plan"
                    action={
                      <Link
                        to="/dashboard/plan"
                        className="text-[0.8125rem] font-bold text-volt-lit underline decoration-volt-lit/40 underline-offset-4"
                      >
                        See plans
                      </Link>
                    }
                  >
                    Upgrading raises the limit. The number of slots comes from
                    the plan’s <code className="text-white/60">max_artists</code>{" "}
                    value.
                  </Notice>
                )}

                {!data.user.plan && (
                  <Notice tone="attention" title="No plan resolved for this account">
                    The backend matches your subscription by plan name, and it
                    found no match — so creating an artist will be refused until
                    a plan is active.
                  </Notice>
                )}
              </aside>
            </div>
          );
        }}
      </DataState>
    </>
  );
}
