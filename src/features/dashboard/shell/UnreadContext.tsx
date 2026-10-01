import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fetchNotifications } from "@/lib/api/account";

/**
 * Unread-notification count for the bell. Read from GET /notifications
 * (`unread`) on mount, every 60 s while the tab is visible, and whenever a
 * page calls `refresh()` / `setUnread()` after marking items read.
 */
type Ctx = { unread: number | null; refresh: () => void; setUnread: (n: number) => void };

const UnreadContext = createContext<Ctx>({ unread: null, refresh: () => {}, setUnread: () => {} });

export function UnreadProvider({ children }: { children: ReactNode }) {
  const [unread, setUnread] = useState<number | null>(null);
  const controller = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    fetchNotifications(1, { signal: c.signal })
      .then((res) => setUnread(typeof res.unread === "number" ? res.unread : 0))
      .catch(() => {
        /* the bell simply shows no count if this fails */
      });
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 60_000);
    return () => {
      window.clearInterval(id);
      controller.current?.abort();
    };
  }, [refresh]);

  const value = useMemo(() => ({ unread, refresh, setUnread }), [unread, refresh]);
  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}

export function useUnread() {
  return useContext(UnreadContext);
}
