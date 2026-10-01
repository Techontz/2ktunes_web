/**
 * Visual QA: screenshots routes at several widths and reports horizontal
 * overflow, console errors and (for the dashboard) API calls the mock
 * doesn't know.
 *
 *   VITE_API_URL=http://qa-api.local npm run dev   # another terminal
 *   node scripts/screenshot.mjs
 *
 * SUITES
 *   site       public marketing + auth routes (WIDTHS × LANG_CODE)
 *   dashboard  signed-in dashboard, onboarding and the public smart link.
 *              The API is mocked with Playwright route interception
 *              (scripts/qa/mockApi.mjs) — any request whose path starts with
 *              /api/ is answered locally, so the dev server only needs SOME
 *              VITE_API_URL to be set. Runs the DASH_MATRIX width:lang pairs.
 *   all        both (default)
 *
 * Env:
 *   BASE_URL    default http://localhost:3000
 *   OUT_DIR     default ./screenshots
 *   SUITE       site | dashboard | all (default all)
 *   WIDTHS      site suite widths, default 360,390,768,1280,1920
 *   DASH_MATRIX dashboard width:lang pairs, default 360:EN,1280:EN,360:SW
 *   ROUTES      comma list to limit routes (matched by substring)
 *   LANG_CODE   EN | SW for the site suite (default EN)
 *   FULL        "0" for viewport-only shots
 *   FORMAT      png (default) | jpg (much smaller files)
 *
 * Exit code 1 if any page overflows horizontally.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { handle as mockHandle, user as mockUser, newUser as mockNewUser } from "./qa/mockApi.mjs";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = process.env.OUT_DIR ?? "screenshots";
const WIDTHS = (process.env.WIDTHS ?? "360,390,768,1280,1920").split(",").map(Number);
const LANG = process.env.LANG_CODE ?? process.env.QA_LANG ?? "EN";
const FULL = process.env.FULL !== "0";
const SUITE = process.env.SUITE ?? "all";
const FORMAT = process.env.FORMAT === "jpg" ? "jpg" : "png";
const DASH_MATRIX = (process.env.DASH_MATRIX ?? "360:EN,1280:EN,360:SW").split(",").map((p) => {
  const [w, l] = p.split(":");
  return { width: Number(w), lang: (l ?? "EN").toUpperCase() };
});

const ALL_ROUTES = [
  "/",
  "/distribution",
  "/promotion",
  "/creators",
  "/royalties",
  "/pricing",
  "/artists",
  "/labels",
  "/about",
  "/help",
  "/help?q=mpesa",
  "/contact",
  "/legal/terms",
  "/legal/privacy",
  "/legal/distribution-agreement",
  "/legal/acceptable-use",
  "/this-page-does-not-exist",
  "/auth",
  "/auth?mode=register",
  "/forgot-password",
  "/reset-password?token=abc&email=artist%40example.com",
  "/reset-password",
  "/email-verified?status=success",
  "/email-verified?status=expired",
];

const filter = process.env.ROUTES?.split(",").filter(Boolean);
const pick = (list) => (filter ? list.filter((r) => filter.some((f) => (r.path ?? r).includes(f))) : list);
const routes = pick(ALL_ROUTES);

/** Dashboard + signed-in routes; `as: "new"` signs in as a not-yet-onboarded user. */
const DASHBOARD_ROUTES = pick([
  { path: "/dashboard" },
  { path: "/dashboard/music" },
  { path: "/dashboard/music?status=drafts" },
  { path: "/dashboard/music/7" },
  { path: "/dashboard/music/7?tab=tracks" },
  { path: "/dashboard/music/7?tab=stores" },
  { path: "/dashboard/music/7?tab=splits" },
  { path: "/dashboard/music/8" },
  { path: "/dashboard/new-release" },
  { path: "/dashboard/music/8/edit?step=info" },
  { path: "/dashboard/music/8/edit?step=tracks" },
  { path: "/dashboard/music/8/edit?step=credits" },
  { path: "/dashboard/music/8/edit?step=stores" },
  { path: "/dashboard/music/8/edit?step=review" },
  { path: "/dashboard/promotion" },
  { path: "/dashboard/promotion?tab=campaigns" },
  { path: "/dashboard/promotion?tab=services" },
  { path: "/dashboard/promotion/campaigns/1" },
  { path: "/dashboard/creators" },
  { path: "/dashboard/creators/amani-dances" },
  { path: "/dashboard/orders" },
  { path: "/dashboard/orders/5" },
  { path: "/dashboard/creator" },
  { path: "/dashboard/analytics" },
  { path: "/dashboard/royalties" },
  { path: "/dashboard/wallet" },
  { path: "/dashboard/wallet?tab=statement" },
  { path: "/dashboard/wallet?tab=methods" },
  { path: "/dashboard/plan" },
  { path: "/dashboard/splits" },
  { path: "/dashboard/artists" },
  { path: "/dashboard/notifications" },
  { path: "/dashboard/support" },
  { path: "/dashboard/support/3" },
  { path: "/dashboard/help" },
  { path: "/dashboard/help/how-withdrawals-work" },
  { path: "/dashboard/settings" },
  { path: "/onboarding", as: "new" },
  { path: "/r/bahari-ya-hindi-k2j9aa", signedOut: true },
  { path: "/r/does-not-exist", signedOut: true },
]);

const slug = (r) =>
  r === "/" ? "home" : r.replace(/^\//, "").replace(/[/?&=%.]+/g, "_").replace(/_+$/, "");

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const problems = [];
const consoleErrors = [];
const unknownApi = new Set();

async function measure(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [];
    if (doc.scrollWidth > window.innerWidth) {
      const clipped = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          if (getComputedStyle(p).overflowX !== "visible" && p.getBoundingClientRect().right <= window.innerWidth + 1) return true;
        }
        return false;
      };
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.right > window.innerWidth + 1 && r.width > 0 && !clipped(el)) {
          offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
          if (offenders.length > 5) break;
        }
      }
      if (!offenders.length) {
        // Nothing unclipped sticks out: report the widest raw offenders so the cause is still visible.
        const raw = [...document.querySelectorAll("body *")]
          .map((el) => [el, el.getBoundingClientRect()])
          .filter(([el, r]) => {
            if (r.right <= window.innerWidth + 1 || r.width === 0 || clipped(el)) return false;
            const pr = el.parentElement?.getBoundingClientRect();
            return !pr || pr.right <= window.innerWidth + 1; // outermost element that sticks out
          })
          .sort((a, b) => b[1].right - a[1].right)
          .slice(0, 4);
        // Overflowing text inside a fixed-width block does not widen the block's own rect.
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        for (let n = walker.nextNode(); n && raw.length < 8; n = walker.nextNode()) {
          if (!n.textContent.trim()) continue;
          range.selectNodeContents(n);
          const r = range.getBoundingClientRect();
          if (r.right > window.innerWidth + 1 && r.width > 0 && !clipped(n)) raw.push([n.parentElement, r, n.textContent.trim().slice(0, 40)]);
        }
        // Deepest non-clipping boxes whose content is wider than themselves (propagate overflow upward).
        const spill = [...document.querySelectorAll("body, body *")].filter((el) => {
          const cs = getComputedStyle(el);
          return cs.overflowX === "visible" && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0;
        });
        for (const el of spill.slice(-3)) offenders.push(`(spill) ${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)} ${el.clientWidth}->${el.scrollWidth}`);
        // Bisect: descend into whichever child, when hidden, removes the overflow.
        let node = document.body;
        const path = [];
        for (let depth = 0; depth < 25 && node; depth++) {
          let culprit = null;
          for (const child of node.children) {
            const prev = child.style.display;
            child.style.display = "none";
            const fixed = doc.scrollWidth <= window.innerWidth;
            child.style.display = prev;
            if (fixed) { culprit = child; break; }
          }
          if (!culprit) break;
          path.push(`${culprit.tagName.toLowerCase()}.${String(culprit.className).split(" ").slice(0, 3).join(".")}`);
          node = culprit;
        }
        if (path.length) offenders.push(`(bisect) ${path.slice(-4).join(" > ")}`);
        for (const [el, r, text] of raw) {
          if (text) {
            offenders.push(`(text) "${text}" in ${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} @..${Math.round(r.right)}`);
            continue;
          }
          offenders.push(`(raw) ${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)} @${Math.round(r.left)}..${Math.round(r.right)} ${getComputedStyle(el).position}`);
        }
      }
    }
    return { scrollWidth: doc.scrollWidth, innerWidth: window.innerWidth, offenders, title: document.title };
  });
}

async function shoot(page, route, width, prefix, label) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const m = await measure(page);
  const file = join(OUT, `${prefix}${slug(route)}@${width}${label ? "-" + label : ""}.${FORMAT}`);
  await page.screenshot({ path: file, fullPage: FULL, ...(FORMAT === "jpg" ? { type: "jpeg", quality: 60 } : {}) });
  const overflow = m.scrollWidth > m.innerWidth;
  if (overflow) problems.push({ route, width, ...m });
  console.log(`${overflow ? "OVERFLOW" : "ok      "} ${String(width).padStart(4)} ${label ?? ""} ${route}  (${m.title})`);
  return page.url();
}

/* ── Public site ─────────────────────────────────────────────────── */
if (SUITE === "site" || SUITE === "all") {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: width < 768 ? 800 : 900 },
      reducedMotion: "reduce",
      deviceScaleFactor: 1,
    });
    await context.addInitScript((lang) => {
      try {
        localStorage.setItem("2ktunes.lang", lang);
      } catch {}
    }, LANG);
    const page = await context.newPage();
    for (const route of routes) await shoot(page, route, width, "", LANG === "EN" ? "" : LANG);
    await context.close();
  }
}

/* ── Dashboard (mocked API) ──────────────────────────────────────── */
if (SUITE === "dashboard" || SUITE === "all") {
  for (const { width, lang } of DASH_MATRIX) {
    for (const r of DASHBOARD_ROUTES) {
      const context = await browser.newContext({
        viewport: { width, height: width < 768 ? 800 : 900 },
        reducedMotion: "reduce",
        deviceScaleFactor: 1,
      });
      await context.addInitScript(
        ({ lang, signedOut }) => {
          try {
            localStorage.setItem("2ktunes.lang", lang);
            if (signedOut) localStorage.removeItem("2ktunes.token");
            else localStorage.setItem("2ktunes.token", "qa-token");
          } catch {}
        },
        { lang, signedOut: !!r.signedOut },
      );
      const profile = r.as === "new" ? mockNewUser : mockUser;
      await context.route(
        (url) => url.pathname.startsWith("/api/"),
        async (route) => {
          const req = route.request();
          const url = new URL(req.url());
          const path = url.pathname.replace(/^\/api/, "");
          let body = null;
          try {
            body = req.postDataJSON();
          } catch {}
          const res =
            path === "/profile" || path === "/me"
              ? { status: 200, body: { status: true, user: profile } }
              : mockHandle(req.method(), path, url.searchParams, body);
          if (!res) unknownApi.add(`${req.method()} ${path}`);
          await route.fulfill({
            status: res?.status ?? 404,
            contentType: "application/json",
            body: JSON.stringify(res?.body ?? { status: false, code: "not_found", message: "Not found." }),
          });
        },
      );
      const page = await context.newPage();
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(`${width} ${lang} ${r.path}: ${msg.text().slice(0, 200)}`);
      });
      page.on("pageerror", (err) => consoleErrors.push(`${width} ${lang} ${r.path}: ${String(err).slice(0, 200)}`));
      const landed = await shoot(page, r.path, width, "dash-", lang);
      if (!r.signedOut && /\/auth(\?|$)/.test(new URL(landed).pathname + new URL(landed).search)) {
        console.error(
          "\nThe dashboard redirected to /auth: the dev server was started without VITE_API_URL.\n" +
            "Run:  VITE_API_URL=http://qa-api.local npm run dev\n",
        );
        process.exit(2);
      }
      await context.close();
    }
  }
}

await browser.close();
if (unknownApi.size) {
  console.log("\nAPI calls the QA mock does not answer (served 404):");
  for (const k of unknownApi) console.log(`  ${k}`);
}
if (consoleErrors.length) {
  console.log("\nConsole errors:");
  for (const e of consoleErrors) console.log(`  ${e}`);
}
if (problems.length) {
  console.log("\nHorizontal overflow:");
  for (const p of problems) console.log(`  ${p.width} ${p.route}: ${p.scrollWidth} > ${p.innerWidth}`, p.offenders);
  process.exit(1);
}
console.log("\nNo horizontal overflow.");
