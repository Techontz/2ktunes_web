import { type Dispatch, type SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useErrorMessage } from "@/lib/api/errors";
import type { ReleasePatch } from "@/lib/api/catalog";
import type { Artist, Release, ReleaseConfig, ReleaseValidation, Store } from "@/lib/api/types";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "../copy";
import type { SaveStatus } from "./useAutosave";
import type { WizardStep } from "./validation";

/**
 * Shared state for the one-page release form: the draft, reference data and
 * an aggregated autosave indicator (every section reports its savers here).
 */

/**
 * What a section contributes to the draft when it is created in the
 * background: its fields, and `commit` to mark them as saved afterwards.
 */
export type DraftPart = () => { patch: ReleasePatch; commit: () => void };

type Saver = { status: SaveStatus; error: unknown; flush: () => Promise<boolean> };

type Ctx = {
  release: Release | null;
  /** Accepts a value or an updater (song blocks update the track list concurrently). */
  setRelease: Dispatch<SetStateAction<Release | null>>;
  /** Re-read the draft from the server (after track/artwork changes). */
  refresh: () => Promise<Release | null>;
  config: ReleaseConfig;
  stores: Store[];
  artists: Artist[];
  /** How many artist profiles the plan allows (GET /artists `limit`); null when unknown. */
  artistLimit: number | null;
  validation: ReleaseValidation | null;
  /** Re-read the server report; resolves with it (null if it couldn't load). */
  refreshValidation: (id?: number) => Promise<ReleaseValidation | null>;
  /** Scroll to a section and focus its heading. */
  goTo: (step: WizardStep) => void;
  /** True once someone tried to submit: every section shows its problems. */
  attempted: boolean;
  setAttempted: (v: boolean) => void;
  /**
   * The draft, creating it silently first if it doesn't exist yet (from every
   * registered part). Resolves null if creating it failed.
   */
  ensureRelease: () => Promise<Release | null>;
  /** The last error from creating the draft, shown near the title. */
  createError: unknown;
  registerDraftPart: (key: string, part: DraftPart | null) => void;
  registerSaver: (key: string, saver: Saver | null) => void;
  /** Flush every pending autosave; resolves false if any failed. */
  flushAll: () => Promise<boolean>;
};

const WizardContext = createContext<Ctx | null>(null);

export function useWizard(): Ctx {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard outside the release wizard");
  return ctx;
}

export function WizardProvider({
  value,
  children,
}: {
  value: Omit<Ctx, "registerSaver" | "flushAll">;
  children: ReactNode;
}) {
  const savers = useRef(new Map<string, Saver>());
  const [tick, setTick] = useState(0);
  const registerSaver = useCallback((key: string, saver: Saver | null) => {
    const prev = savers.current.get(key);
    if (saver) {
      if (prev && prev.status === saver.status && prev.error === saver.error) {
        savers.current.set(key, saver);
        return;
      }
      savers.current.set(key, saver);
    } else if (prev) savers.current.delete(key);
    else return;
    setTick((n) => n + 1);
  }, []);
  const flushAll = useCallback(async () => {
    const results = await Promise.all([...savers.current.values()].map((s) => s.flush()));
    return results.every(Boolean);
  }, []);
  const ctx = useMemo(() => ({ ...value, registerSaver, flushAll }), [value, registerSaver, flushAll]);
  // A new array whenever a saver's state changes, so the indicator re-renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const list = useMemo(() => [...savers.current.values()], [tick]);
  return (
    <WizardContext.Provider value={ctx}>
      <SaverList.Provider value={list}>{children}</SaverList.Provider>
    </WizardContext.Provider>
  );
}

const SaverList = createContext<Saver[]>([]);

/** Contribute a section's fields to the background draft creation. */
export function useDraftPart(key: string, part: DraftPart) {
  const { registerDraftPart } = useWizard();
  const ref = useRef(part);
  ref.current = part;
  useEffect(() => {
    registerDraftPart(key, () => ref.current());
    return () => registerDraftPart(key, null);
  }, [key, registerDraftPart]);
}

/** Publish an autosave's state to the page indicator. */
export function useReportSaver(key: string, saver: Saver) {
  const { registerSaver } = useWizard();
  const { status, error, flush } = saver;
  useEffect(() => {
    registerSaver(key, { status, error, flush });
  }, [key, status, error, flush, registerSaver]);
  useEffect(() => () => registerSaver(key, null), [key, registerSaver]);
}

/** "Saving… / All changes saved / Couldn't save: Retry", announced politely. */
export function SaveIndicator() {
  const c = useCopy(COPY);
  const toMessage = useErrorMessage();
  const all = useContext(SaverList);
  const failed = all.find((s) => s.status === "error");
  const saving = all.some((s) => s.status === "saving");
  const saved = all.some((s) => s.status === "saved");

  return (
    <div aria-live="polite" className="flex min-h-9 flex-wrap items-center gap-2 text-caption">
      {failed ? (
        <>
          <AlertCircle className="h-4 w-4 text-danger" aria-hidden />
          <span className="text-danger">
            {c.saveStateError}
            {toMessage(failed.error)}
          </span>
          <Button size="sm" variant="ghost" onClick={() => void failed.flush()}>
            {c.saveRetry}
          </Button>
        </>
      ) : saving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-text-subtle" aria-hidden />
          <span className="text-text-subtle">{c.saveStateSaving}</span>
        </>
      ) : saved ? (
        <>
          <Check className="h-4 w-4 text-success" aria-hidden />
          <span className="text-text-subtle">{c.saveStateSaved}</span>
        </>
      ) : null}
    </div>
  );
}
