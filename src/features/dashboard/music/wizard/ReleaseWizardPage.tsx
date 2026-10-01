import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { fetchArtists, fetchRelease, fetchReleaseConfig, fetchStores, fetchValidation, updateRelease } from "@/lib/api/catalog";
import type { Release, ReleaseValidation } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { LoadError, PageHeader, PageLoading, StatusPill } from "../../components";
import { COPY } from "../copy";
import { ArtworkStep } from "./ArtworkStep";
import { SaveIndicator, WizardProvider } from "./context";
import { CreditsStep } from "./CreditsStep";
import { InfoStep } from "./InfoStep";
import { ReviewStep } from "./ReviewStep";
import { StoresStep } from "./StoresStep";
import { TracksStep } from "./TracksStep";
import { SERVER_STEP, WIZARD_STEPS, type WizardStep } from "./validation";

/**
 * NEW RELEASE / EDIT RELEASE WIZARD
 *
 *   /dashboard/new-release          step 1 only, until "Create draft" (POST /releases)
 *   /dashboard/music/:id/edit?step= every step; the draft autosaves (PATCH)
 *
 * Steps: info → artwork → tracks → credits → stores → review & submit.
 * "Next" validates the current step on the client (./validation.ts); the step
 * navigator lets people jump anywhere in a draft and shows the server's
 * per-step error counts (GET /releases/{id}/validation). Submitting is gated
 * on the server report being `ready`.
 */
export default function ReleaseWizardPage() {
  const c = useCopy(COPY);
  const { id } = useParams();
  const [params, setParams] = useSearchParams();

  const refs = useResource(
    async () => {
      const [config, stores, artists] = await Promise.all([fetchReleaseConfig(), fetchStores(), fetchArtists()]);
      return { config, stores, artists: artists.artists };
    },
    [],
  );
  const loaded = useResource((signal) => (id ? fetchRelease(id, { signal }) : Promise.resolve(null)), [id]);

  const [release, setReleaseState] = useState<Release | null>(null);
  const [validation, setValidation] = useState<ReleaseValidation | null>(null);
  useEffect(() => {
    if (loaded.data) setReleaseState(loaded.data);
  }, [loaded.data]);

  const releaseId = release?.id ?? null;
  const refreshValidation = useCallback(async () => {
    if (!releaseId) return;
    try {
      setValidation(await fetchValidation(releaseId));
    } catch {
      /* the review step shows its own loading state; the page stays usable */
    }
  }, [releaseId]);
  useEffect(() => {
    void refreshValidation();
  }, [refreshValidation]);

  const refresh = useCallback(async () => {
    if (!releaseId) return null;
    const fresh = await fetchRelease(releaseId);
    setReleaseState(fresh);
    return fresh;
  }, [releaseId]);

  const requested = params.get("step") as WizardStep | null;
  const step: WizardStep = !id ? "info" : requested && WIZARD_STEPS.includes(requested) ? requested : ((SERVER_STEP[release?.draft_step ?? ""] ?? (WIZARD_STEPS.includes(release?.draft_step as WizardStep) ? (release?.draft_step as WizardStep) : "info")));

  const heading = useRef<HTMLHeadingElement>(null);
  const goTo = useCallback(
    (s: WizardStep) => {
      const next = new URLSearchParams(params);
      next.set("step", s);
      setParams(next);
      if (releaseId) void updateRelease(releaseId, { draft_step: s }).catch(() => {});
      window.scrollTo({ top: 0 });
      window.setTimeout(() => heading.current?.focus(), 0);
      void refreshValidation();
    },
    [params, setParams, releaseId, refreshValidation],
  );

  const value = useMemo(
    () =>
      refs.data
        ? {
            release,
            setRelease: setReleaseState,
            refresh,
            config: refs.data.config,
            stores: refs.data.stores,
            artists: refs.data.artists,
            validation,
            refreshValidation,
            goTo,
          }
        : null,
    [refs.data, release, refresh, validation, refreshValidation, goTo],
  );

  const labels: Record<WizardStep, string> = {
    info: c.stepInfo,
    artwork: c.stepArtwork,
    tracks: c.stepTracks,
    credits: c.stepCredits,
    stores: c.stepStores,
    review: c.stepReview,
  };

  if (refs.loading || (id && loaded.loading)) return <PageLoading />;
  if (refs.error) return <LoadError error={refs.error} onRetry={refs.reload} />;
  if (id && (loaded.error || !release)) return <LoadError error={loaded.error} onRetry={loaded.reload} />;
  if (!value) return <PageLoading />;

  if (release && !release.is_editable) {
    return (
      <>
        <PageHeader title={c.wizardEditTitle} back={{ to: `/dashboard/music/${release.id}`, label: release.release_title }} />
        <EmptyState
          title={c.notEditableTitle}
          description={c.notEditableBody}
          action={<Button to={`/dashboard/music/${release.id}`}>{c.viewRelease}</Button>}
        />
      </>
    );
  }

  const stepErrors = (s: WizardStep): number => {
    if (!validation) return 0;
    return validation.errors.filter((e) => (SERVER_STEP[e.step] ?? "review") === s).length;
  };
  const index = WIZARD_STEPS.indexOf(step);

  return (
    <WizardProvider value={value}>
      <PageHeader
        back={release ? { to: `/dashboard/music/${release.id}`, label: release.release_title || c.backToCatalog } : { to: "/dashboard/music", label: c.backToCatalog }}
        title={release ? c.wizardEditTitle : c.wizardNewTitle}
        meta={release ? <StatusPill status={release.status} /> : undefined}
        description={c.wizardDescription}
        actions={release ? <SaveIndicator /> : undefined}
      />

      <nav aria-label={c.stepsLabel} className="mb-6">
        <ol className="relative -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 no-scrollbar xl:grid xl:grid-cols-6">
          {WIZARD_STEPS.map((s, i) => {
            const current = s === step;
            const errors = stepErrors(s);
            const done = !!validation && errors === 0 && i < index;
            const disabled = !release && s !== "info";
            return (
              <li key={s} className="shrink-0">
                <button
                  type="button"
                  disabled={disabled}
                  aria-current={current ? "step" : undefined}
                  onClick={() => goTo(s)}
                  className={cn(
                    "flex h-full w-full items-center gap-2 rounded-control border px-3 py-2 text-left text-body-sm font-semibold transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:cursor-not-allowed disabled:opacity-50",
                    current ? "border-accent-text bg-accent-soft text-text" : "border-border-subtle text-text-muted hover:border-border-strong hover:text-text",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold",
                      done ? "bg-accent text-white" : current ? "bg-white text-ink" : "border border-border-strong",
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="whitespace-nowrap xl:whitespace-normal xl:leading-tight">{labels[s]}</span>
                  {errors > 0 && release && (
                    <span className="ml-auto rounded-full bg-warning-soft px-1.5 text-[0.7rem] font-bold text-warning">
                      {errors}
                      <span className="sr-only"> — {c.stepHasErrors(errors)}</span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <h2 ref={heading} tabIndex={-1} className="mb-4 text-h3 font-bold focus:outline-none">
        {labels[step]}
      </h2>

      {step === "info" && <InfoStep key={release?.id ?? "new"} />}
      {step === "artwork" && <ArtworkStep />}
      {step === "tracks" && <TracksStep />}
      {step === "credits" && <CreditsStep />}
      {step === "stores" && <StoresStep />}
      {step === "review" && <ReviewStep stepLabel={(s) => labels[s]} />}
    </WizardProvider>
  );
}
