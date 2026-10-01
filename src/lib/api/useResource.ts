import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { errorMessageFor } from "./errors";

/**
 * One fetch-on-mount hook for the dashboard's read endpoints.
 *
 * Deliberately small: every dashboard screen needs the same four states
 * (loading / error / empty / data) and the same "try again" affordance, and
 * duplicating that per page is how inconsistent error handling starts.
 *
 * Requests are aborted on unmount, and a 401 needs no handling here — the API
 * client's unauthenticated hook already tears down the session, which makes the
 * route guard redirect to /auth.
 */

export type ResourceState<T> = {
  data: T | null;
  /** True only while there is nothing to show yet. A reload keeps the old data
   *  on screen — blanking a panel back to a skeleton after every write throws
   *  away whatever the user was just told (a success message, their place in a
   *  list) and reads as a flicker. */
  loading: boolean;
  /** True during a background refetch that already has data behind it. */
  refreshing: boolean;
  /** A message safe to show a user; never a raw server diagnostic. */
  error: string | null;
  /** The thrown value behind `error` (e.g. to branch on `ApiError.status`). */
  errorObj: unknown;
  reload: () => void;
  /** Replace the data locally (after a mutation that returned the fresh row). */
  setData: (next: T | ((prev: T | null) => T | null)) => void;
};

export function useResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorObj, setErrorObj] = useState<unknown>(null);
  const [nonce, setNonce] = useState(0);
  const { t } = useLanguage();
  const hasData = useRef(false);

  // Keep the latest fetcher without making it a dependency: an inline closure
  // would otherwise re-run the effect on every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    let live = true;

    if (hasData.current) setRefreshing(true);
    else setLoading(true);
    setErrorObj(null);

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (!live) return;
        hasData.current = true;
        setData(result);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        if (!live || controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setErrorObj(err ?? new Error("unknown"));
        setLoading(false);
        setRefreshing(false);
      });

    return () => {
      live = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const setDataPublic = useCallback((next: T | ((prev: T | null) => T | null)) => {
    setData((prev) => (typeof next === "function" ? (next as (p: T | null) => T | null)(prev) : next));
  }, []);

  const error = errorObj ? errorMessageFor(errorObj, t) : null;
  return { data, loading, refreshing, error, errorObj, reload, setData: setDataPublic };
}
