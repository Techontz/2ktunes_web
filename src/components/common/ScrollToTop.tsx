import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Jumps to the top on route change, unless the URL targets an anchor. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
