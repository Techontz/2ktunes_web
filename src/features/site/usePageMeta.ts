import { useEffect } from "react";

const BASE_TITLE = "2kTunes — Distribute worldwide. Grow your audience. Get paid locally.";

/** Sets the document title and meta description for a public page. */
export function usePageMeta(title: string | null, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · 2kTunes` : BASE_TITLE;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    }
  }, [title, description]);
}
