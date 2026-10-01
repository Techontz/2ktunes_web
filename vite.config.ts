/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv, type Plugin } from "vite";

/**
 * Production builds must know where the API lives.
 *
 * Without VITE_API_URL the app cannot sign anyone in (it shows a "not
 * configured" state rather than guessing a host), so a production build with
 * no API URL fails loudly here instead of shipping a dead site. Set
 * ALLOW_MISSING_API_URL=1 to build anyway (e.g. a marketing-only preview).
 * A loopback URL only warns: `npm run build && npm run preview` against a
 * local API is a legitimate workflow, but it must never be deployed.
 */
function requireApiUrl(mode: string): Plugin {
  return {
    name: "2ktunes:require-api-url",
    apply: "build",
    configResolved() {
      const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
      const url = (env.VITE_API_URL ?? "").trim();
      if (!url) {
        if (env.ALLOW_MISSING_API_URL === "1" || env.ALLOW_MISSING_API_URL === "true") {
          console.warn("\n[2ktunes] VITE_API_URL is not set: this build cannot sign in or load live data.\n");
          return;
        }
        throw new Error(
          "[2ktunes] VITE_API_URL is not set. Production builds need the API base URL " +
            "(e.g. VITE_API_URL=https://api.2ktunes.com npm run build). " +
            "Set ALLOW_MISSING_API_URL=1 to build without one.",
        );
      }
      let parsed: URL | null = null;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error(`[2ktunes] VITE_API_URL is not a valid absolute URL: "${url}"`);
      }
      if (/^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|\[::1\])$/i.test(parsed.hostname)) {
        console.warn(
          `\n[2ktunes] WARNING: VITE_API_URL points at a loopback host (${parsed.host}). ` +
            "Fine for a local preview; do NOT deploy this build.\n",
        );
      } else if (parsed.protocol !== "https:") {
        console.warn(
          `\n[2ktunes] WARNING: VITE_API_URL is not https (${parsed.origin}); ` +
            "an https site cannot call it (mixed content).\n",
        );
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), requireApiUrl(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // Explicit: no source maps in production output.
    sourcemap: false,
  },
  server: {
    // Set DISABLE_HMR=true to turn off hot reload (e.g. when an agent is
    // editing files and flicker is unwanted).
    hmr: process.env.DISABLE_HMR !== "true",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
    // Tests talk to a mocked API (src/test/api.ts); the client needs a base URL.
    env: { VITE_API_URL: "http://api.test" },
    // userEvent-driven page tests can exceed the 5s default on a loaded CI machine.
    testTimeout: 15000,
  },
}));
