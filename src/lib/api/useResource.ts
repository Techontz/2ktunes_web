import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, ApiNotConfiguredError } from "./client";

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
  reload: () => void;
};

function messageFor(err: unknown): string {
  if (err instanceof ApiNotConfiguredError) {
    return "This build has no API URL configured, so live data can’t be loaded.";
  }
  if (err instanceof ApiError) {
    if (err.isNetwork) return "Couldn’t reach the server. Check your connection.";
    if (err.status >= 500) return "The server had a problem. Try again shortly.";
    if (err.status === 403) return err.message;
    if (err.status === 404) return "Not found.";
    return err.message;
  }
  return "Something went wrong.";
}

export function useResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
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
    setError(null);

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
        setError(messageFor(err));
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

  return { data, loading, refreshing, error, reload };
}

/** Same message mapping, for one-off mutations (withdraw, create artist, …). */
export function errorMessage(err: unknown): string {
  return messageFor(err);
}
