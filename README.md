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

| Variable | Required in production? | Default | Purpose |
|---|---|---|---|
| `VITE_API_URL` | **Yes** — `npm run build` fails without it | none | Base URL of the Laravel API, no trailing slash (e.g. `https://api.2ktunes.com`). Requests go to `${VITE_API_URL}/api/…`. The app never guesses a host: if a build somehow has none, sign-in and live data show a "not configured" state. A loopback value (`127.0.0.1`, `localhost`) only prints a build warning, for local `npm run preview`; never deploy such a build. Must be `https` when the site is. |
| `VITE_GOOGLE_CLIENT_ID` | No | empty (button hidden) | Shows "Continue with Google". The Google Identity script (`accounts.google.com/gsi/client`) is only loaded when this is set. The ID token is posted to `POST /api/google-login` as `{ id_token }`. |
| `VITE_CONTACT_EMAIL` | No | `support@2ktunes.com` | Recipient for the contact page's composed email. |
| `ALLOW_MISSING_API_URL` | No (build-time only) | unset | `1` lets `npm run build` succeed without `VITE_API_URL` (e.g. a marketing-only preview). Not exposed to the browser. |

`VITE_*` values are inlined into the public JavaScript bundle. Never put secrets in them.

## Deploying

- **SPA fallback is required.** Every unknown path must serve `dist/index.html` with status 200, so deep links (`/dashboard/wallet`, `/legal/terms`) and public smart links (`/r/<slug>`) work on reload and when shared. Examples: Netlify `/* /index.html 200`; Vercel `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`; nginx `try_files $uri /index.html;`. Real files in `dist/` (`/assets/*`, `/robots.txt`, `/sitemap.xml`, `/favicon.svg`) must still be served as-is.
- Cache `dist/assets/*` long-term (content-hashed names) and `index.html` with `no-cache`, so a deploy is picked up and old lazy chunks are not requested. If a stale chunk still fails to load, the top-level error boundary shows a "Reload page" screen.
- The backend's `FRONTEND_URL` must be this site's origin: it builds `smart_link_url` (`{FRONTEND_URL}/r/{slug}`), the email-verification redirect and password-reset links. The dashboard falls back to `window.location.origin` only when the API sends no `smart_link_url`.
- CORS on the API must allow this site's origin (bearer tokens; no cookies or credentials).
- No source maps are emitted (`build.sourcemap: false`).
- `public/robots.txt` and `public/sitemap.xml` assume the production domain **https://2ktunes.com**. Update both if the site lives elsewhere. Smart links (`/r/…`) stay crawlable on purpose (public release pages; unknown slugs are `noindex`); the dashboard, onboarding, account and auth/reset paths are disallowed.
- SEO caveat: this is a client-rendered SPA. Titles and descriptions are set per page at runtime (Google renders JS), but link-preview bots (WhatsApp, X, Facebook) read only the static `index.html` tags, so every shared link, including smart links, previews with the site-wide title and description. Per-release previews need server-side rendering or an edge function. There is no `og:image` yet.
- No analytics, trackers or cookies are loaded. The only third-party requests are Google Fonts (stylesheet and font files) and, when `VITE_GOOGLE_CLIENT_ID` is set, the Google Identity script on the sign-in page (Google may set its own cookies there, so mention it in the privacy policy before enabling it). `localStorage` holds the session token, the language choice and resumable-upload ids (cleared on sign-out). A cookie banner is not needed for this build.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run typecheck` / `npm run lint` | `tsc --noEmit` (there is no ESLint setup; `lint` is an alias for the typecheck) |
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
