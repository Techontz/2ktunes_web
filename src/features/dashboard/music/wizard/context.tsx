import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useErrorMessage } from "@/lib/api/errors";
import type { Artist, Release, ReleaseConfig, ReleaseValidation, Store } from "@/lib/api/types";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "../copy";
import type { SaveStatus } from "./useAutosave";
import type { WizardStep } from "./validation";

/**
 * Shared state for the release wizard steps: the draft, reference data and
 * an aggregated autosave indicator (every step reports its savers here).
 */

type Saver = { status: SaveStatus; error: unknown; flush: () => Promise<boolean> };

type Ctx = {
  release: Release | null;
  setRelease: (r: Release) => void;
  /** Re-read the draft from the server (after track/artwork changes). */
  refresh: () => Promise<Release | null>;
  config: ReleaseConfig;
  stores: Store[];
  artists: Artist[];
  validation: ReleaseValidation | null;
  refreshValidation: () => Promise<void>;
  goTo: (step: WizardStep) => void;
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

/** Publish an autosave's state to the page indicator. */
export function useReportSaver(key: string, saver: Saver) {
  const { registerSaver } = useWizard();
  const { status, error, flush } = saver;
  useEffect(() => {
    registerSaver(key, { status, error, flush });
  }, [key, status, error, flush, registerSaver]);
  useEffect(() => () => registerSaver(key, null), [key, registerSaver]);
}

/** "Saving… / All changes saved / Couldn't save — Retry", announced politely. */
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
