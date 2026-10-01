import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced autosave of a serialisable value.
 *
 *   const auto = useAutosave(values, (v) => updateRelease(id, toPatch(v)), { enabled: !!id });
 *   auto.status  // idle | saving | saved | error
 *   await auto.flush()   // save now (before "Next"/"Submit"); resolves true on success
 *
 * The first value is the baseline (already saved). Saves are serialised: a
 * change made while a save is in flight is saved right after it. Pending
 * changes are flushed when the component unmounts, and the browser warns
 * before closing the tab while a save is pending.
 */
export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<unknown>,
  { delay = 1000, enabled = true }: { delay?: number; enabled?: boolean } = {},
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<unknown>(null);
  const baseline = useRef(JSON.stringify(value));
  const latest = useRef(value);
  latest.current = value;
  const saveRef = useRef(save);
  saveRef.current = save;
  const timer = useRef<number | undefined>(undefined);
  const inflight = useRef<Promise<boolean> | null>(null);
  const mounted = useRef(true);

  const run = useCallback(async (): Promise<boolean> => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    if (inflight.current) await inflight.current;
    const snapshot = latest.current;
    const json = JSON.stringify(snapshot);
    if (json === baseline.current) return true;
    if (mounted.current) setStatus("saving");
    const p = (async () => {
      try {
        await saveRef.current(snapshot);
        baseline.current = json;
        if (mounted.current) {
          setError(null);
          setStatus(JSON.stringify(latest.current) === json ? "saved" : "saving");
        }
        return true;
      } catch (err) {
        if (mounted.current) {
          setError(err);
          setStatus("error");
        }
        return false;
      }
    })();
    inflight.current = p;
    const ok = await p;
    inflight.current = null;
    return ok;
  }, []);

  const serialized = JSON.stringify(value);
  useEffect(() => {
    if (!enabled || serialized === baseline.current) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void run(), delay);
    return () => window.clearTimeout(timer.current);
  }, [serialized, enabled, delay, run]);

  // Warn before leaving with unsaved edits; flush them on unmount.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(latest.current) !== baseline.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (enabled && JSON.stringify(latest.current) !== baseline.current) void run();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  /** Treat `v` as already saved (e.g. after loading fresh server data). */
  const rebase = useCallback((v: T) => {
    baseline.current = JSON.stringify(v);
  }, []);

  return { status, error, flush: run, rebase, dirty: serialized !== baseline.current };
}
