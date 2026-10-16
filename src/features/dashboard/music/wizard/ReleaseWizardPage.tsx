import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button, EmptyState } from "@/components/ui";
import {
  createRelease,
  fetchArtists,
  fetchRelease,
  fetchReleaseConfig,
  fetchStores,
  fetchValidation,
  type ReleasePatch,
} from "@/lib/api/catalog";
import type { Release, ReleaseValidation } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useCopy } from "@/lib/useCopy";
import { LoadError, PageHeader, PageLoading, StatusPill } from "../../components";
import { COPY } from "../copy";
import { FormAlert } from "../../components";
import { useErrorMessage } from "@/lib/api/errors";
import { fieldErrorsOf } from "@/lib/api/errors";
import { WizardProvider, useWizard, type DraftPart } from "./context";
import { FormCard, sectionId } from "./layout";
import { ArtistCard, NewArtistProvider, ProfilesCard, ReleaseDetailsCard } from "./ReleaseFields";
import { AgreementsCard, AgreementsProvider, ReleaseFooterActions, SummaryPanel } from "./ReviewStep";
import { ReleaseStepIndicator } from "./ReleaseStepIndicator";
import { StepTracker } from "./steps";
import { ReleaseFormProvider, UploadStateProvider } from "./state";
import { StoresSelectAll, StoresStep } from "./StoresStep";
import { TracksStep } from "./TracksStep";
import { WIZARD_STEPS, type WizardStep } from "./validation";

/**
 * NEW RELEASE / EDIT RELEASE: one long upload page whose sections and fields
 * follow DOCS/DISTRIBUTION_PARITY.md section 1 exactly (the contract with the
 * backend, mapped from how live distributors collect release data).
 *
 *   /dashboard/new-release      the whole form, usable straight away. The draft
 *                               (POST /releases) is created silently once a
 *                               title is typed, or when a cover or song needs
 *                               it; the address bar then becomes .../edit
 *                               without a navigation, so nothing remounts.
 *   /dashboard/music/:id/edit   the same form for an existing draft
 *   ...?step=artwork            scrolls to that card (old links keep working)
 *
 * Layout: on desktop the form fills the left column (Release details,
 * Artist with its store profiles, Stores, one card per track, Apple Music
 * credits when Apple Music is chosen, Agreements) and a sticky summary on the
 * right holds the cover art, the release as it will read, a checklist and
 * Submit. On phones the summary follows the form. Every card autosaves once
 * the draft exists; submitting is gated on the server report
 * (GET /releases/{id}/validation) being `ready`.
 */
export default function ReleaseWizardPage() {
  const c = useCopy(COPY);
  const { id } = useParams();
  const [params, setParams] = useSearchParams();

  const refs = useResource(async () => {
    const [config, stores, artists] = await Promise.all([fetchReleaseConfig(), fetchStores(), fetchArtists()]);
    return { config, stores, artists: artists.artists, artistLimit: artists.limit ?? null };
  }, []);
  const loaded = useResource((signal) => (id ? fetchRelease(id, { signal }) : Promise.resolve(null)), [id]);

  const [release, setReleaseState] = useState<Release | null>(null);
  const [validation, setValidation] = useState<ReleaseValidation | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [createError, setCreateError] = useState<unknown>(null);
  const releaseRef = useRef<Release | null>(null);
  releaseRef.current = release;
  useEffect(() => {
    if (loaded.data) setReleaseState(loaded.data);
  }, [loaded.data]);

  const releaseId = release?.id ?? null;
  const refreshValidation = useCallback(async (forId?: number) => {
    const target = forId ?? releaseId;
    if (!target) return null;
    try {
      const v = await fetchValidation(target);
      setValidation(v);
      return v;
    } catch {
      /* the submit area copes without a report; the page stays usable */
      return null;
    }
  }, [releaseId]);

  // Re-check against the server shortly after anything on the draft changes.
  useEffect(() => {
    if (!releaseId) return;
    const t = window.setTimeout(() => void refreshValidation(), 700);
    return () => window.clearTimeout(t);
  }, [release, releaseId, refreshValidation]);

  const refresh = useCallback(async () => {
    if (!releaseId) return null;
    const fresh = await fetchRelease(releaseId);
    setReleaseState(fresh);
    return fresh;
  }, [releaseId]);

  /* Background draft creation */
  const parts = useRef(new Map<string, DraftPart>());
  const registerDraftPart = useCallback((key: string, part: DraftPart | null) => {
    if (part) parts.current.set(key, part);
    else parts.current.delete(key);
  }, []);
  const creating = useRef<Promise<Release | null> | null>(null);
  const ensureRelease = useCallback(async (): Promise<Release | null> => {
    if (releaseRef.current) return releaseRef.current;
    if (creating.current) return creating.current;
    creating.current = (async () => {
      const got = [...parts.current.values()].map((p) => p());
      const body = Object.assign({}, ...got.map((g) => g.patch)) as ReleasePatch;
      try {
        const created = await createRelease({
          ...body,
          release_type: body.release_type ?? "Single",
          release_title: body.release_title || c.untitled,
        });
        // Mark what was sent as saved before the sections switch autosave on.
        got.forEach((g) => g.commit());
        releaseRef.current = created;
        setReleaseState(created);
        setCreateError(null);
        // Same page, new address: no navigation, so focus and typing survive.
        window.history.replaceState(window.history.state, "", `/dashboard/music/${created.id}/edit`);
        return created;
      } catch (err) {
        setCreateError(err);
        return null;
      } finally {
        creating.current = null;
      }
    })();
    return creating.current;
  }, [c.untitled]);

  const goTo = useCallback((s: WizardStep) => {
    // Credits sit in the Apple Music card when it is shown, otherwise in the track cards.
    const id = document.getElementById(sectionId(s)) ? sectionId(s) : s === "credits" ? "section-tracks" : sectionId(s);
    document.getElementById(id)?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    (document.getElementById(`${id}-title`) ?? document.getElementById(id))?.focus({ preventScroll: true });
  }, []);

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
            artistLimit: refs.data.artistLimit,
            validation,
            refreshValidation,
            goTo,
            attempted,
            setAttempted,
            ensureRelease,
            createError,
            registerDraftPart,
          }
        : null,
    [refs.data, release, refresh, validation, refreshValidation, goTo, attempted, ensureRelease, createError, registerDraftPart],
  );

  // ?step=artwork (old links): scroll there once the page is on screen,
  // then drop the parameter.
  const requested = params.get("step") as WizardStep | null;
  const ready = !!value && (!id || !!release);
  useEffect(() => {
    if (!ready || !requested || !WIZARD_STEPS.includes(requested)) return;
    const t = window.setTimeout(() => {
      goTo(requested);
      const next = new URLSearchParams(params);
      next.delete("step");
      setParams(next, { replace: true });
    }, 50);
    return () => window.clearTimeout(t);
  }, [ready, requested, goTo, params, setParams]);

  if (refs.loading || (id && loaded.loading)) return <PageLoading />;
  if (refs.error) return <LoadError error={refs.error} onRetry={refs.reload} />;
  if (id && (loaded.error || !loaded.data)) return <LoadError error={loaded.error} onRetry={loaded.reload} />;
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
  // Loaded but not yet copied into state (one render): keep the form steady.
  if (id && !release) return <PageLoading />;

  return (
    <WizardProvider value={value}>
      {/* Soft lavender wash with light streaks in the top right corner (CSS only). */}
      <div aria-hidden className="nr-backdrop" />
      <div className="nr-page relative z-[1] w-full">
        <header className="mb-6 lg:mb-[1.45rem]">
          <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.24em] text-nr-muted">
            {id ? c.wizardEditTitle : c.wizardNewTitle}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 lg:mt-2">
            <h1 className="text-[2.125rem] font-bold leading-[1.05] tracking-[-0.03em] text-[#0f0820] sm:text-[2.5rem] lg:text-[2.95rem]">
              {id ? c.wizardEditTitle : c.wizardNewTitle}
            </h1>
            {id && release && <StatusPill status={release.status} />}
          </div>
          <p className="mt-2.5 max-w-[60rem] text-[0.9375rem] leading-snug text-nr-muted lg:mt-[0.3rem] lg:text-[1rem]">{c.nrIntro}</p>
        </header>
        <UploadStateProvider>
          <ReleaseFormProvider>
            <UploadForm />
          </ReleaseFormProvider>
        </UploadStateProvider>
      </div>
    </WizardProvider>
  );
}

/**
 * Desktop: the step indicator and the numbered form on the left, a sticky
 * cover art card (with a compact summary) on the right. Tablets and phones:
 * one column, the cover card right after Distribution. The bottom bar is
 * fixed to the window.
 */
function UploadForm() {
  const c = useCopy(COPY);
  const toMessage = useErrorMessage();
  const { createError } = useWizard();
  const createMessage = createError && !Object.keys(fieldErrorsOf(createError)).length ? `${c.createFailed}${toMessage(createError)}` : null;
  return (
    <AgreementsProvider>
      <NewArtistProvider>
        <StepTracker>
          <div className="grid pb-44 sm:pb-32 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-x-10 lg:pb-24 xl:grid-cols-[minmax(0,1fr)_27rem] xl:gap-x-[2.875rem]">
            <ReleaseStepIndicator className="lg:col-start-1" />
            {createMessage && <FormAlert className="mt-6 lg:col-start-1">{createMessage}</FormAlert>}
            <FormCard
              anchor={sectionId("stores")}
              lead
              title={c.upStores}
              hint={c.storesPickHint}
              aside={<StoresSelectAll />}
              className="mt-7 border-t-0 pt-0 lg:col-start-1 lg:mt-[2.15rem]"
            >
              <StoresStep />
            </FormCard>
            <aside
              data-sticky-column
              className="mt-8 min-w-0 lg:sticky lg:top-[4.75rem] lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:mt-[0.55rem] lg:max-h-[calc(100vh-8.5rem)] lg:self-start lg:overflow-y-auto lg:[scrollbar-width:thin]"
            >
              <SummaryPanel />
            </aside>
            <div className="mt-[1.375rem] min-w-0 space-y-[1.375rem] lg:col-start-1">
              <ArtistCard />
              <ReleaseDetailsCard />
              <TracksStep />
              <ProfilesCard />
              <AgreementsCard />
            </div>
          </div>
          <ReleaseFooterActions />
        </StepTracker>
      </NewArtistProvider>
    </AgreementsProvider>
  );
}
