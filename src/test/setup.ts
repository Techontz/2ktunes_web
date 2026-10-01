import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetCatalogCaches } from "@/lib/api/catalog";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  resetCatalogCaches();
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

// jsdom lacks these; components touch them.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
window.scrollTo = (() => {}) as typeof window.scrollTo;
