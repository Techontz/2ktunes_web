import { useEffect } from "react";

const BASE_TITLE = "2kTunes · Distribute worldwide. Grow your audience. Get paid locally.";

/** The description shipped in index.html, captured once so pages can restore it. */
let defaultDescription: string | null = null;
function baseDescription(): string {
  if (defaultDescription === null) {
    defaultDescription =
      document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  }
  return defaultDescription;
}

function setMeta(name: string, content: string | null) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (content === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Sets the document title and meta description for a public page.
 *
 * A page that passes no description gets the site default back, so a
 * description never leaks from the previously visited page. `noindex` adds
 * `<meta name="robots" content="noindex">` while the page is mounted (used by
 * the 404 page: an SPA answers every path with HTTP 200).
 */
export function usePageMeta(
  title: string | null,
  description?: string,
  { noindex = false }: { noindex?: boolean } = {},
) {
  useEffect(() => {
    const fallback = baseDescription();
    document.title = title ? `${title} · 2kTunes` : BASE_TITLE;
    setMeta("description", description || fallback);
  }, [title, description]);

  useEffect(() => {
    if (!noindex) return;
    setMeta("robots", "noindex");
    return () => setMeta("robots", null);
  }, [noindex]);
}
