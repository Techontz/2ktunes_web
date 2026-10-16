import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { Checkbox, useToast } from "@/components/ui";
import { submitRelease, updateRelease } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/errors";
import type { ValidationItem } from "@/lib/api/types";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { FormAlert } from "../../components";
import { COPY } from "../copy";
import { useIssueText } from "../shared";
import { cn } from "@/lib/utils";
import {
  SaveIndicator,
  useDraftPart,
  useReportSaver,
  useWizard,
} from "./context";
import { ArtworkStep } from "./ArtworkStep";
import { FormCard, sectionId } from "./layout";
import { CONFIRMATION_AGREEMENTS, confirmationKeys, useOptions, YOUTUBE_AGREEMENT, type Opt } from "./options";
import { useReleaseForm, useUpload } from "./state";
import { trackDisplayTitle } from "./TracksStep";
import { RELEASE_STEPS, useReleaseSteps, type ReleaseStepKey } from "./steps";
import { useAutosave } from "./useAutosave";
import { SERVER_STEP, validateAgreements, WRITER_ROLES } from "./validation";

/** Server field names whose input has a different id on the page. */
const FIELD_ID: Record<string, string> = {
  artist_name: "artist",
  artist_id: "artist",
};

/** Scroll to the input behind a server problem (or its card) and focus it. */
function scrollToIssue(e: ValidationItem) {
  const el =
    (e.track_id ? document.getElementById(`track-${e.track_id}`) : null) ??
    document.getElementById(`wiz-${FIELD_ID[e.field] ?? e.field}`) ??
    document.getElementById(
      `${sectionId(SERVER_STEP[e.step] ?? "review")}-title`,
    ) ??
    document.getElementById(sectionId(SERVER_STEP[e.step] ?? "review"));
  el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  el?.focus({ preventScroll: true });
}

const isYouTubeMusic = (slug: string) =>
  slug === "youtube_music" || slug === "youtube";

/** Every opt-in store agreement key (Snapchat, Roblox). */
const CONFIRM_KEYS = Object.values(CONFIRMATION_AGREEMENTS).flat();

/**
 * The agreements shown for the chosen stores, and which of them are required.
 * Store-tied ones (YouTube Music, and the opt-in stores' confirmations) show
 * only while their store is chosen; the confirmations are then required.
 */
function useAgreementList() {
  const { config, stores } = useWizard();
  const { platforms } = useUpload();
  const opts = useOptions(config);
  const youtube = platforms.some(isYouTubeMusic);
  return useMemo(() => {
    const chosen = new Set(platforms);
    const needed = new Set(stores.filter((st) => chosen.has(st.slug)).flatMap(confirmationKeys));
    // Older servers don't list the confirmations; they are still recorded.
    const list: Opt[] = [
      ...opts.agreements,
      ...CONFIRM_KEYS.filter((k) => !opts.agreements.some((a) => a.value === k)).map((k) => ({ value: k, label: k, required: false })),
    ];
    const isConfirm = (a: Opt) => CONFIRM_KEYS.includes(a.value);
    const shown = list.filter((a) => {
      if (a.value === YOUTUBE_AGREEMENT) return youtube;
      if (isConfirm(a)) return needed.has(a.value) || (!!a.platform && chosen.has(a.platform));
      return !a.platform || chosen.has(a.platform);
    });
    // Older servers also list required keys separately.
    const required = [
      ...new Set([
        ...shown.filter((a) => a.required || isConfirm(a)).map((a) => a.value),
        ...config.required_agreements.filter((k) =>
          shown.some((a) => a.value === k),
        ),
      ]),
    ];
    return { shown, required, all: list.map((a) => a.value) };
  }, [opts.agreements, youtube, platforms, stores, config.required_agreements]);
}

type AgreementsCtx = {
  agreements: Record<string, boolean>;
  setAgreements: (
    fn: (a: Record<string, boolean>) => Record<string, boolean>,
  ) => void;
};
const Agreements = createContext<AgreementsCtx | null>(null);
/** The release's agreements (the Stores card records the opt-in store confirmations here). */
export const useAgreements = () => {
  const ctx = useContext(Agreements);
  if (!ctx) throw new Error("useAgreements outside AgreementsProvider");
  return ctx;
};

/**
 * The agreements' state and autosave, shared by the Agreements card (left
 * column) and the summary panel's submit button (right column).
 */
export function AgreementsProvider({ children }: { children: ReactNode }) {
  const { release, setRelease, refreshValidation } = useWizard();
  const { all } = useAgreementList();
  const [agreements, setAgreementsState] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        all.map((k) => [k, release?.agreements?.[k] === true]),
      ),
  );
  const auto = useAutosave(
    { agreements },
    async (v) => {
      setRelease(await updateRelease(release!.id, v));
      await refreshValidation();
    },
    { delay: 600, enabled: !!release },
  );
  useReportSaver("review", auto);
  useDraftPart("review", () => {
    const snapshot = { agreements };
    return { patch: snapshot, commit: () => auto.rebase(snapshot) };
  });
  const value = useMemo(
    () => ({
      agreements,
      setAgreements: (
        fn: (a: Record<string, boolean>) => Record<string, boolean>,
      ) => setAgreementsState(fn),
    }),
    [agreements],
  );
  return <Agreements.Provider value={value}>{children}</Agreements.Provider>;
}

/** Agreements: one clean list of checkboxes. */
export function AgreementsCard() {
  const c = useCopy(COPY);
  const issueText = useIssueText();
  const { attempted } = useWizard();
  const { agreements, setAgreements } = useAgreements();
  const { shown, required } = useAgreementList();
  const labels = c as unknown as Record<string, string>;
  return (
    <FormCard anchor="section-review" number={7} title={c.reviewSectionTitle} hint={c.reviewSectionHint}>
      <h3 className="mb-4 text-[0.9375rem] font-semibold text-text">{c.upAgreements}</h3>
      <div className="max-w-[72ch] space-y-4">
        {shown.map((a) => {
          const k = a.value;
          const isRequired = required.includes(k);
          return (
            <Checkbox
              key={k}
              id={`wiz-${k}`}
              label={
                labels[`agree_${k}`] ??
                (a.label !== k ? a.label : k.replace(/_/g, " "))
              }
              required={isRequired}
              checked={agreements[k] === true}
              error={
                attempted && isRequired && agreements[k] !== true
                  ? issueText({ field: k, code: "agreement_missing" })
                  : null
              }
              onChange={(e) =>
                setAgreements((x) => ({ ...x, [k]: e.target.checked }))
              }
            />
          );
        })}
        <Link
          to="/legal/distribution-agreement"
          target="_blank"
          className="inline-block text-body-sm font-semibold text-accent-text underline-offset-2 hover:underline"
        >
          {c.termsLink}
        </Link>
      </div>
    </FormCard>
  );
}

function jumpTo(anchor: string) {
  const el = document.getElementById(anchor);
  el?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  (document.getElementById(`${anchor}-title`) ?? el)?.focus?.({
    preventScroll: true,
  });
}

function Mark({ done }: { done: boolean }) {
  return done ? (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
    </span>
  ) : (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center"
      aria-hidden
    >
      <span className="h-2 w-2 rounded-full bg-border" />
    </span>
  );
}

/**
 * The sticky summary panel (right column on desktop, after the form on
 * phones): cover art, the release as it will read, its songs with audio
 * state, a checklist that jumps to each section, then save state and Submit.
 */
/** What is done and what is missing, shared by the summary panel and the submit bar. */
function useChecklist() {
  const c = useCopy(COPY);
  const { release } = useWizard();
  const { platforms, blocks } = useUpload();
  const { form, issues } = useReleaseForm();
  const { agreements } = useAgreements();
  const { required } = useAgreementList();
  const byId = new Map((release?.tracks ?? []).map((t) => [t.id, t]));
  const trackOf = (i: number) => {
    const b = blocks[i];
    return b?.trackId ? byId.get(b.trackId) : undefined;
  };
  const apple = platforms.includes("apple_music");

  const withAudio = blocks.filter((_, i) => {
    const t = trackOf(i);
    return !!(t?.audio || t?.audio_url);
  }).length;
  const creditsDone = blocks.every((_, i) => {
    const t = trackOf(i);
    if (!t) return false;
    const credits = t.credits ?? [];
    const writers =
      t.ownership === "cover"
        ? !!t.cover_original_artist
        : credits.some(
            (cr) => WRITER_ROLES.includes(cr.role) && cr.name?.trim(),
          );
    const appleOk =
      !apple ||
      (credits.some((cr) => cr.role === "performer") &&
        credits.some((cr) => cr.role === "producer"));
    return writers && appleOk;
  });
  const checklist: { key: string; label: string; done: boolean; anchor: string }[] = [
    {
      key: "stores",
      label: c.chkStores,
      done: platforms.length > 0,
      anchor: "section-stores",
    },
    {
      key: "details",
      label: c.chkDetails,
      done: issues.filter((i) => i.field !== "artist").length === 0,
      anchor: "section-info",
    },
    { key: "artist", label: c.chkArtist, done: !!form.artist_id, anchor: "section-artist" },
    {
      key: "cover",
      label: c.chkCover,
      done: !!release?.cover_image,
      anchor: "section-artwork",
    },
    {
      key: "songs",
      label: c.chkSongs(withAudio, blocks.length),
      done: withAudio === blocks.length,
      anchor: "section-tracks",
    },
    {
      key: "credits",
      label: c.chkCredits,
      done: creditsDone,
      anchor: apple ? "section-credits" : "section-tracks",
    },
    {
      key: "agreements",
      label: c.chkAgreements,
      done: validateAgreements(agreements, required).length === 0,
      anchor: "section-review",
    },
  ];

  return { checklist, trackOf, done: checklist.filter((i) => i.done).length };
}

/** Which of the seven steps are complete (drives the ticks in the step indicator). */
export function useStepCompletion(): Record<ReleaseStepKey, boolean> {
  const { checklist } = useChecklist();
  const ok = (k: string) => checklist.find((i) => i.key === k)?.done ?? false;
  return {
    distribution: ok("stores"),
    artist: ok("artist"),
    details: ok("details"),
    tracks: ok("songs") && ok("credits"),
    // Store profiles are optional: done once the artist they belong to is chosen.
    profiles: ok("artist"),
    artwork: ok("cover"),
    review: ok("agreements"),
  };
}

export function SummaryPanel() {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const { platforms, blocks } = useUpload();
  const { form, title, artist, type } = useReleaseForm();
  const { checklist, trackOf } = useChecklist();
  const date = form.release_asap
    ? c.dateAsap
    : form.release_date
      ? formatDate(form.release_date, locale)
      : c.pvNone;
  const rows: [string, string][] = [
    [c.sumType, c.sumTypeLine(type, blocks.length)],
    [c.pvDate, date],
    [c.pvLabel, form.record_label.trim() || c.pvIndependent],
    [c.pvStores, c.pvStoresCount(platforms.length)],
  ];

  return (
    <section
      aria-label={c.summaryLabel}
      className="min-w-0 rounded-[12px] border border-[#eeebf5] bg-white p-5 sm:px-6 sm:pt-5"
    >
      {/* Cover art upload heads this card. */}
      <ArtworkStep />

      {/* A compact summary of the release as it will read, then the checklist. */}
      <div className="mt-5 border-t border-nr-line pt-4">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-nr-muted">{c.summaryTitle}</p>
        <p className="mt-2 break-words text-[1rem] font-bold leading-tight text-text">
          {title.trim() || c.untitled}
        </p>
        <p className="mt-0.5 break-words text-[0.8125rem] text-nr-muted">
          {artist?.name ?? c.pvNone}
        </p>
        <dl
          className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-[0.8125rem]"
          data-testid="summary-facts"
        >
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-nr-muted">{k}</dt>
              <dd className="break-words text-right text-text">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 border-t border-nr-line pt-4">
        <p className="mb-1.5 text-[0.75rem] font-semibold text-nr-muted">
          {c.pvSongs}
        </p>
        <ol className="space-y-1">
          {blocks.map((b, i) => {
            const t = trackOf(i);
            const ok = !!(t?.audio || t?.audio_url);
            const name = t
              ? trackDisplayTitle(t, c)
              : i === 0 && title
                ? title
                : c.trackHeading(i + 1);
            return (
              <li key={b.key} className="flex items-start gap-2.5 text-[0.8125rem]">
                <span className="w-4 shrink-0 text-right tabular-nums text-nr-subtle">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 break-words text-text">
                  {name}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[0.75rem]",
                    ok ? "text-success" : "text-nr-subtle",
                  )}
                >
                  {ok ? c.sumAudioOk : c.sumAudioMissing}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-4 border-t border-nr-line pt-4">
        <p className="mb-1 text-[0.75rem] font-semibold text-nr-muted">
          {c.chkTitle}
        </p>
        <ul className="grid gap-x-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {checklist.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => jumpTo(item.anchor)}
                className="flex w-full items-center gap-2 rounded-[6px] px-1 py-1 text-left text-[0.8125rem] text-text hover:bg-nr-soft focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-text"
              >
                <Mark done={item.done} />
                <span
                  className={cn(
                    "min-w-0 flex-1",
                    !item.done && "text-nr-muted",
                  )}
                >
                  {item.label}
                </span>
                <span className="sr-only">{`, ${item.done ? c.chkDone : c.chkTodo}`}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Always on screen: a white bar fixed to the bottom of the window (above the
 * phone tab bar). Left: "Step N of 7" and a thin progress line. Right: Save as
 * draft (flushes every autosave, creating the draft if needed) and the primary
 * action, "Continue to {next step}", which becomes "Submit release" on the last
 * step or once every step is complete. Before that, Submit stays reachable as
 * a quiet text button, so it is never hidden. The "Still missing" list and
 * submit problems open above the bar.
 */
export function ReleaseFooterActions() {
  const { agreements } = useAgreements();
  const { checklist } = useChecklist();
  const c = useCopy(COPY);
  const navigate = useNavigate();
  const { toast } = useToast();
  const toMessage = useErrorMessage();
  const {
    release,
    validation,
    refreshValidation,
    flushAll,
    attempted,
    setAttempted,
    ensureRelease,
  } = useWizard();
  const { active, jump } = useReleaseSteps();
  const { required } = useAgreementList();
  const [problem, setProblem] = useState<null | "plan" | string>(null);
  // The "still missing" box can be closed; the next Submit shows it again.
  const [hideMissing, setHideMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const missingAgreements = validateAgreements(agreements, required);

  const submit = async () => {
    setProblem(null);
    setHideMissing(false);
    setAttempted(true);
    setSubmitting(true);
    try {
      const target = await ensureRelease();
      if (!target) return;
      if (!(await flushAll())) return;
      const fresh = await refreshValidation(target.id);
      if (missingAgreements.length || fresh?.ready !== true) return;
      await submitRelease(target.id);
      toast({ title: c.submitted, tone: "success" });
      navigate(`/dashboard/music/${target.id}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "subscription_required")
        setProblem("plan");
      else if (err instanceof ApiError && err.code === "release_incomplete") {
        await refreshValidation();
        setProblem(err.message);
      } else setProblem(toMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /** Save as draft: create the draft if needed, then flush every pending autosave. */
  const saveDraft = async () => {
    setSaving(true);
    try {
      const target = await ensureRelease();
      const ok = !!target && (await flushAll());
      toast(ok ? { title: c.draftSaved, tone: "success" } : { title: c.draftSaveFailed, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  // Agreement problems show on the checkboxes themselves.
  const missing =
    attempted && validation && !validation.ready
      ? validation.errors.filter((e) => SERVER_STEP[e.step] !== "review")
      : [];

  const total = RELEASE_STEPS.length;
  const last = active >= total - 1;
  const allDone = checklist.every((i) => i.done);
  const submitIsPrimary = last || allDone;
  const nextName = last ? "" : (c.stepNames[RELEASE_STEPS[active + 1].key] ?? "");
  return (
    <div
      data-submitbar
      className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-[#ece8f4] bg-white lg:bottom-0"
    >
      <div className="mx-auto w-full max-w-[calc(94.25rem+4rem)] px-4 sm:px-6 lg:px-8">
        <div
          aria-live="polite"
          className="max-h-[40vh] space-y-3 overflow-y-auto pt-3 empty:hidden empty:pt-0"
        >
          {missing.length > 0 && !hideMissing && (
            <FormAlert tone="warning">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{c.missingTitle}</p>
                <button
                  type="button"
                  onClick={() => setHideMissing(true)}
                  aria-label={c.missingClose}
                  className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-black/5 hover:text-text focus-visible:outline-2 focus-visible:outline-accent-text"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <ul className="mt-2 space-y-1">
                {missing.map((e, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="text-left underline underline-offset-2 hover:text-accent-text"
                      onClick={() => scrollToIssue(e)}
                    >
                      {e.message}
                    </button>
                  </li>
                ))}
              </ul>
            </FormAlert>
          )}
          {problem && (
            <FormAlert tone={problem === "plan" ? "warning" : "danger"}>
              {problem === "plan" ? (
                <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  {c.subscriptionRequired}
                  <Link
                    to="/dashboard/plan"
                    className="font-semibold text-accent-text underline underline-offset-2"
                  >
                    {c.choosePlan}
                  </Link>
                </span>
              ) : (
                problem
              )}
            </FormAlert>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 sm:h-[3.125rem] sm:flex-nowrap sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <p className="shrink-0 text-[0.8125rem] text-nr-muted">
              {c.stepOf(active + 1, total)}
            </p>
            <div
              role="progressbar"
              aria-label={c.stepOf(active + 1, total)}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-valuenow={active + 1}
              className="h-[5px] w-full max-w-[13.75rem] overflow-hidden rounded-full bg-[#efe8fb]"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300"
                style={{ width: `${Math.round(((active + 1) / total) * 100)}%` }}
              />
            </div>
            <div className="hidden min-w-0 xl:block">
              {release && <SaveIndicator />}
            </div>
          </div>
          {!submitIsPrimary && (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="shrink-0 whitespace-nowrap text-[0.8125rem] font-semibold text-accent-text underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:opacity-60"
            >
              {c.submitReleaseBtn}
            </button>
          )}
          <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto sm:gap-5">
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={saving}
              className="inline-flex h-[2.375rem] flex-1 items-center justify-center whitespace-nowrap rounded-[8px] border border-[#dcd6e8] bg-white px-3.5 sm:flex-none text-[0.8125rem] font-semibold text-text transition-colors hover:bg-nr-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:opacity-60 sm:px-5"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              {c.saveDraft}
            </button>
            <button
              type="button"
              onClick={submitIsPrimary ? submit : () => jump(active + 1)}
              disabled={submitIsPrimary && submitting}
              aria-busy={submitIsPrimary && submitting ? true : undefined}
              className="inline-flex h-[2.375rem] flex-[1.4] items-center justify-center gap-2.5 whitespace-nowrap rounded-[8px] bg-nr-primary px-4 sm:flex-none text-[0.8125rem] font-semibold text-white transition-colors hover:bg-nr-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:opacity-70 sm:px-5"
            >
              {submitIsPrimary && submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {submitIsPrimary ? c.submitReleaseBtn : c.continueTo(nextName)}
              {!submitIsPrimary && <ArrowRight className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Older name, kept for imports. */
export const SubmitBar = ReleaseFooterActions;
