# 2ktunes-web

Web app for **2kTunes** — African-first music distribution: *Distribute worldwide. Grow your audience. Get paid locally.*

Public marketing site, authentication and the artist dashboard, talking to the 2kTunes Laravel API (`../2ktunes_app_backend`) with Sanctum bearer tokens.

**Stack:** React 19 · Vite 6 · Tailwind CSS 4 · react-router 7 · lucide-react · Vitest + Testing Library · Playwright (visual QA only).

## Getting started

```bash
npm install
cp .env.example .env.local   # set VITE_API_URL to your API, e.g. http://127.0.0.1:8000
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the Laravel API (no trailing slash). Without it, sign-in and live pricing show a "not configured / being updated" state. |
| `VITE_GOOGLE_CLIENT_ID` | Optional. Shows "Continue with Google" (Google Identity Services); the ID token is posted to `POST /api/google-login` as `{ id_token }`. |
| `VITE_CONTACT_EMAIL` | Optional. Recipient for the contact page's composed email (default `support@2ktunes.com`). |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run typecheck` / `npm run lint` | `tsc --noEmit` |
| `npm test` | Vitest (jsdom) — component and unit tests |
| `npm run screenshots` | Screenshots every public route at 360/390/768/1280/1920 and fails on horizontal overflow. Needs a running dev server (`BASE_URL`, `OUT_DIR`, `WIDTHS`, `ROUTES`, `QA_LANG=SW` env vars; run `npx playwright install chromium` once). |

## Layout

```
src/
  App.tsx                 routes (public pages lazy-loaded; dashboard behind RequireAuth)
  index.css               design tokens (@theme) + marketing type utilities
  components/ui/          design-system primitives — import from "@/components/ui"
  components/brand/       Wordmark
  i18n/                   en.ts (source of truth), sw.ts (typed against en)
  lib/LanguageContext.tsx t() for UI strings, pick({EN,SW}) for long-form copy
  lib/api/                HTTP client, auth + plans endpoints
  lib/auth/               AuthProvider, route guards, safeNext
  features/site/          public site: layout, kit (sections), content/, pages/
  features/auth/          /auth, /forgot-password, /reset-password, /email-verified
  features/dashboard/     authenticated app
```

## Design system

Tokens live in `src/index.css`: palette (`ink`, `carbon`, `bone`, `volt`, `lime`… kept for existing screens) plus **roles** new code should use — `surface`, `surface-raised`, `border`, `text`, `text-muted`, `text-subtle`, `accent`, `success`, `warning`, `danger`, `info` — radii (`rounded-control` 10px, `rounded-card` 14px, `rounded-panel` 20px), shadows, and two type scales: product (`text-caption`, `text-body-sm`, `text-body`, `text-h1…h4`) and marketing (`t-hero`, `t-display`, `t-title`, `t-lead`, `t-body`).

Primitives (each documents its props in a header comment): Button, Card, Field/Input/PasswordInput/Textarea/Select/Checkbox/RadioCardGroup, Badge/StatusBadge, Tabs, Dialog, Sheet, Skeleton/EmptyState/ErrorState, Spinner, Toast, DataTable, Stat, Avatar, ProgressBar, Stepper.

## Content rules

- Store names appear as plain text, never logos, with "Store names are trademarks of their owners; no endorsement implied."
- Never promise streams, playlist placement or editorial features.
- Prices come only from `GET /api/plans`; if unreachable the UI says pricing is being updated.
- Legal pages are drafts, clearly marked "Draft — to be reviewed by counsel".
