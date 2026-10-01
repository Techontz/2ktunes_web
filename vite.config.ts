/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
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
  },
});
