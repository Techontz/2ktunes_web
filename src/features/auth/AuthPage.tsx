import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Wordmark } from "@/features/landing/ui";
import { COVERS } from "@/features/landing/data";
import CoverArt from "@/features/landing/art/CoverArt";
import ReleaseCover from "@/features/landing/product/ReleaseCover";
import { FEATURED_RELEASE } from "@/features/landing/product/release";
import AuthField from "./AuthField";
import LanguagePicker from "./LanguagePicker";
import SignalColumn from "./SignalColumn";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DASHBOARD_HOME, safeNext } from "@/lib/auth/routes";
import { ApiError, ApiNotConfiguredError } from "@/lib/api/client";
import { googleLoginAvailable } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

/**
 * 2K TUNES — AUTHENTICATION
 * =========================
 *
 * The landing page is expressive; this is the same brand turned quiet. Two zones
 * rather than a floating card on a wallpaper: brand and one piece of artwork on
 * the left, the form on the right, both sitting on a near-black field with a
 * single controlled violet light. No blobs, no glass, no mesh gradients — the
 * page is meant to look expensive through spacing and type, not effects.
 *
 * WHAT IS REAL HERE, AND WHAT IS NOT
 * ----------------------------------
 * The fields, the rules and the providers all come from the actual backend
 * contract (see authApi.ts), not from a template:
 *
 *   • Register asks for name / email / password / confirm because
 *     ApiController@register validates exactly those, with `confirmed`.
 *   • The password helper says SIX characters because the rule is `min:6`.
 *     It does not invent an 8-character or special-character requirement.
 *   • Google is offered because POST /api/google-login exists.
 *   • Apple is NOT offered — there is no Apple integration in the backend, so
 *     the old Apple button would have been advertising something that does not
 *     exist.
 *   • There is no "Forgot password?" link, because no password-reset endpoint
 *     exists anywhere in the API. A link to nothing is worse than its absence.
 *
 * Submitting talks to the real Laravel API. Client-side validation runs first as
 * a courtesy, then the server is the authority: its 422 `errors` map is rendered
 * against the matching fields (including `password_confirmation`, which maps
 * onto the confirm input), a 401 becomes an invalid-credentials message, and a
 * 5xx never surfaces Laravel's own text. On success the session comes from
 * /register or /login and the user is sent on to ?next= or /account.
 */

type Mode = "login" | "register";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** From ApiController@register: `password` => 'required|confirmed|min:6'. */
const MIN_PASSWORD = 6;

/** Deterministic mini-waveform for the mobile strip. */
const MINI_BARS = Array.from({ length: 22 }, (_, i) => {
  const a = Math.sin(i * 0.7) * 0.5 + 0.5;
  return 0.24 + a * 0.62;
});

/* ── Brand panel ────────────────────────────────────────────────────── */

function BrandPanel() {
  const { t } = useLanguage();

  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-14 xl:w-[44%] 2xl:p-16">
      {/* A single violet light, static — the only atmosphere on the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 h-[40rem] w-[40rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(109,43,255,0.20) 0%, transparent 68%)",
        }}
      />
      {/* Feather the seam against the form column. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-40"
        style={{
          background: "linear-gradient(to right, transparent, #050505)",
        }}
      />

      <Link
        to="/"
        className="relative z-10 inline-flex min-h-[44px] w-fit items-center text-[1.375rem] leading-none"
        aria-label="2K Tunes — home"
      >
        <Wordmark />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-[22ch]"
      >
        {/* Brand copy, deliberately not the document heading: the panel is
            hidden below lg, and an h1 that is display:none would leave the
            visible hierarchy starting at h2. */}
        <p className="text-[2.5rem] font-extrabold leading-[1.03] tracking-[-0.04em] text-white xl:text-[2.875rem]">
          {t("a2.tagline")}
        </p>
        <p className="mt-5 max-w-[34ch] text-[0.9375rem] font-medium leading-relaxed text-white/45">
          {t("a2.tagline_sub")}
        </p>
        <p className="mt-8 text-[0.8125rem] font-medium text-white/30">
          {t("a2.trust")}
        </p>
      </motion.div>

      {/* A leaning stack of sleeves, cropped by the left edge.
          Sized so the square frames and captions still read as RECORDS —
          a single generative cover blown up to 32rem loses its geometry and
          turns into exactly the floating blob this design rules out. In flow
          rather than absolutely positioned, so it can never overlap the copy. */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 min-h-0"
      >
        <div aria-hidden className="-ml-24 flex items-end">
          {[4, 0, 15].map((idx, n) => (
            <span
              key={idx}
              className="shrink-0 overflow-hidden rounded-2xl"
              style={{
                width: n === 1 ? "11.5rem" : "9.75rem",
                height: n === 1 ? "11.5rem" : "9.75rem",
                marginLeft: n === 0 ? 0 : "-2.75rem",
                transform: `rotate(${[-7, -2, 5][n]}deg) translateY(${[10, 0, -6][n]}px)`,
                opacity: [0.5, 0.92, 0.66][n],
                boxShadow: "0 40px 80px -30px rgba(0,0,0,1)",
              }}
            >
              <CoverArt cover={COVERS[idx]} />
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Google mark ────────────────────────────────────────────────────── */

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default function AuthPage() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();

  /* Mode lives in the query string so /auth?mode=register is linkable, without
     adding routes that existing links would not know about. */
  const mode: Mode = params.get("mode") === "register" ? "register" : "login";
  const isRegister = mode === "register";

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* Switching mode clears state so a stale error never carries across. */
  useEffect(() => {
    setErrors({});
    setFormError(null);
  }, [mode]);

  const setMode = (next: Mode) => {
    const p = new URLSearchParams(params);
    if (next === "register") p.set("mode", "register");
    else p.delete("mode");
    setParams(p, { replace: true });
  };

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => (prev[k] ? { ...prev, [k]: "" } : prev));
  };

  /* Live, non-nagging password feedback: only the two rules that really exist. */
  const pwChecks = useMemo(
    () => ({
      length: values.password.length >= MIN_PASSWORD,
      match:
        values.confirm.length > 0 && values.password === values.confirm,
    }),
    [values.password, values.confirm],
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (isRegister && !values.name.trim()) e.name = t("a2.err_name");
    if (!values.email.trim()) e.email = t("a2.err_email");
    else if (!EMAIL_RE.test(values.email)) e.email = t("a2.err_email_bad");
    if (!values.password) e.password = t("a2.err_pw");
    else if (isRegister && values.password.length < MIN_PASSWORD)
      e.password = t("a2.err_pw_short");
    if (isRegister && values.confirm !== values.password)
      e.confirm = t("a2.err_confirm");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    if (busy) return; // guard against a double submit

    setBusy(true);
    try {
      if (isRegister) {
        await auth.register({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          passwordConfirmation: values.confirm,
        });
      } else {
        await auth.login(values.email.trim(), values.password);
      }

      // Land where the guard sent them from, or in the dashboard.
      navigate(safeNext(params.get("next")) ?? DASHBOARD_HOME, { replace: true });
    } catch (err) {
      if (err instanceof ApiNotConfiguredError) {
        setFormError(t("a2.err_unconfigured"));
      } else if (err instanceof ApiError) {
        if (err.isValidation) {
          /* Server-side validation wins. Laravel's field names map onto the
             form's, except password_confirmation → confirm. */
          const mapped: Record<string, string> = {};
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            mapped[field === "password_confirmation" ? "confirm" : field] =
              message;
          }
          setErrors(mapped);
          if (!Object.keys(mapped).length) setFormError(err.message);
        } else if (err.isUnauthenticated) {
          setFormError(t("a2.err_credentials"));
        } else if (err.isNetwork) {
          setFormError(t("a2.err_network"));
        } else {
          setFormError(t("a2.err_server"));
        }
      } else {
        setFormError(t("a2.err_server"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tunes flex min-h-screen flex-col bg-[#050505] lg:flex-row">
      <BrandPanel />

      {/* ── AUTHENTICATION ENVIRONMENT ──
          Not a form floating in black: the zone itself is the surface. It owns
          56% of the canvas from xl up, carries a fractionally lighter tone, a
          near-invisible leading edge, and the music signal that crosses into it.

          The form is centred inside the zone, which is what puts it at ~72% of
          the viewport — the position asked for — without pinning it to the right
          edge. */}
      <div className="relative flex flex-1 flex-col xl:w-[56%]">
        {/* Tonal step: #050505 → #090909, feathered across 14rem.
            A flat fill gave a hard vertical seam at the zone's edge — visible as
            a join rather than felt as a change of surface. Feathering leaves the
            threshold line as the only crisp marker, which is its job. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden xl:block"
          style={{
            background:
              "linear-gradient(to right, rgba(9,9,9,0) 0rem, #090909 14rem)",
          }}
        />
        {/* The leading edge of the product. The music signal crosses in front of
            it, so the line reads as a threshold rather than a divider. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-px xl:block"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.07) 18%, rgba(255,255,255,0.07) 82%, transparent)",
          }}
        />
        {/* One faint violet illumination inside the zone. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 hidden h-[42rem] w-[42rem] -translate-x-1/3 -translate-y-1/2 rounded-full xl:block"
          style={{
            background:
              "radial-gradient(circle, rgba(109,43,255,0.10) 0%, transparent 64%)",
          }}
        />

        {/* The signal, anchored to the zone's leading edge and reaching back
            across it toward the artist. Extends only 6rem inside the zone, which
            keeps it clear of the form at 1280 where the margin is tightest. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 hidden h-[30rem] w-[21rem] -translate-y-1/2 xl:block"
          style={{ marginLeft: "-15rem" }}
        >
          <SignalColumn />
        </div>
        {/* Mobile/tablet chrome: wordmark left, language right. */}
        <div className="flex items-center justify-between px-6 pt-6 sm:px-8 lg:justify-end lg:px-14 lg:pt-8 xl:px-16">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center text-[1.25rem] leading-none lg:hidden"
            aria-label="2K Tunes — home"
          >
            <Wordmark />
          </Link>
          <LanguagePicker />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8 lg:px-14 xl:px-10 2xl:px-16"
        >
          <div className="relative w-full max-w-[27rem]">
            {/* MOBILE / TABLET: one compact strip — artwork, title, and a
                mini signal — instead of the desktop centre composition. It says
                "music entering 2K Tunes" in a single row and costs the form
                almost no vertical space, which stays the priority. */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="mb-8 flex items-center gap-3 xl:hidden"
            >
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <ReleaseCover size="thumb" eager={false} />
              </span>
              <span className="min-w-0 shrink">
                <span className="block truncate text-[0.8125rem] font-bold tracking-[-0.01em] text-white/80">
                  {FEATURED_RELEASE.title}
                </span>
                <span className="block truncate text-[0.6875rem] font-medium text-white/35">
                  {FEATURED_RELEASE.artist}
                </span>
              </span>
              <span className="relative ml-auto flex h-7 w-24 items-center gap-[2px] overflow-hidden sm:w-32">
                {MINI_BARS.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${h * 100}%`,
                      background:
                        i % 9 === 4
                          ? "rgba(203,242,76,0.7)"
                          : "rgba(138,92,255,0.6)",
                    }}
                  />
                ))}
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 w-8"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(203,242,76,0.22), transparent)",
                    animation: "wave-scan 9s linear infinite",
                  }}
                />
              </span>
            </motion.div>

            {/* Product locator. Not a restatement of the heading — it marks the
                surface you are entering, the way an application would. */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.46 }}
              className="mb-6 text-[0.5625rem] font-bold uppercase tracking-[0.22em] text-white/25"
            >
              2K Tunes <span className="text-white/15">/</span> Account
            </motion.p>

            {/* The heading block swaps with a short cross-fade; the form below
                keeps its position so nothing jumps. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* No eyebrow: "WELCOME BACK" above "Welcome back." is the kind
                    of duplicated label that makes a page read as generated. */}
                <h1 className="text-[2.125rem] font-extrabold leading-[1.04] tracking-[-0.04em] text-white">
                  {t(isRegister ? "a2.title_register" : "a2.title_login")}
                </h1>
                <p className="mt-3.5 text-[1rem] font-medium text-white/45">
                  {t(isRegister ? "a2.sub_register" : "a2.sub_login")}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={onSubmit} className="mt-9 space-y-5" noValidate>
              {isRegister && (
                <AuthField
                  label={t("a2.name")}
                  name="name"
                  autoComplete="name"
                  placeholder="Conrad Bubex"
                  value={values.name}
                  onChange={set("name")}
                  error={errors.name}
                />
              )}

              <AuthField
                label={t("a2.email")}
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                placeholder="artist@example.com"
                value={values.email}
                onChange={set("email")}
                error={errors.email}
              />

              <AuthField
                label={t("a2.password")}
                name="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="••••••••"
                reveal
                revealLabels={{ show: t("a2.show_pw"), hide: t("a2.hide_pw") }}
                value={values.password}
                onChange={set("password")}
                error={errors.password}
                hint={
                  isRegister ? (
                    <p
                      className={cn(
                        "flex items-center gap-1.5 text-[0.75rem] font-medium transition-colors",
                        pwChecks.length ? "text-lime" : "text-white/35",
                      )}
                    >
                      {pwChecks.length && (
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                      )}
                      {t("a2.min_chars")}
                    </p>
                  ) : undefined
                }
              />

              {isRegister && (
                <AuthField
                  label={t("a2.confirm")}
                  name="password_confirmation"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  reveal
                  revealLabels={{ show: t("a2.show_pw"), hide: t("a2.hide_pw") }}
                  value={values.confirm}
                  onChange={set("confirm")}
                  error={errors.confirm}
                  hint={
                    pwChecks.match ? (
                      <p className="flex items-center gap-1.5 text-[0.75rem] font-medium text-lime">
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                        {t("a2.pw_match")}
                      </p>
                    ) : undefined
                  }
                />
              )}

              {/* Form-level error: a quiet line, not an alert box. */}
              {formError && (
                <p
                  role="alert"
                  className="rounded-[12px] border border-clay/30 bg-clay/[0.07] px-4 py-3 text-[0.8125rem] font-medium text-clay"
                >
                  {formError}
                </p>
              )}

              {/* Fixed height so the loading state never shifts the layout. */}
              <button
                type="submit"
                disabled={busy}
                className={cn(
                  "flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-[14px] text-[1rem] font-bold text-white",
                  "bg-volt transition-colors duration-200 hover:bg-volt-lit active:bg-volt-deep",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {busy && (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} aria-hidden />
                )}
                {busy
                  ? t(isRegister ? "a2.creating" : "a2.signing_in")
                  : t(isRegister ? "a2.register_btn" : "a2.login_btn")}
              </button>
            </form>

            {/* Google exists in the backend; Apple does not, so it is not here. */}
            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/[0.09]" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/30">
                {t("a2.or")}
              </span>
              <span className="h-px flex-1 bg-white/[0.09]" />
            </div>

            {/* POST /api/google-login exists, but it expects a Google profile
                the client must already hold and there is no Google client
                configured — so the control is disabled rather than pretending.
                See googleLoginAvailable in lib/api/auth.ts. */}
            <button
              type="button"
              disabled={!googleLoginAvailable}
              title={googleLoginAvailable ? undefined : t("a2.google_unavailable")}
              className="flex h-[3.25rem] w-full items-center justify-center gap-3 rounded-[14px] border border-white/[0.11] bg-white/[0.03] text-[1rem] font-semibold text-white transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-white/[0.11] disabled:hover:bg-white/[0.03]"
            >
              <GoogleMark />
              {t("a2.google")}
            </button>
            {!googleLoginAvailable && (
              <p className="mt-2.5 text-center text-[0.75rem] font-medium text-white/30">
                {t("a2.google_unavailable")}
              </p>
            )}

            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 text-center text-[0.875rem] font-medium text-white/40">
              {t(isRegister ? "a2.have_account" : "a2.no_account")}
              {/* min-h keeps this a comfortable tap target on a phone without
                  turning an inline link into a button-looking block. */}
              <button
                type="button"
                onClick={() => setMode(isRegister ? "login" : "register")}
                className="inline-flex min-h-[44px] items-center rounded px-1 font-bold text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white"
              >
                {t(isRegister ? "a2.login_link" : "a2.signup_link")}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Minimal footer. No Terms/Privacy links: those pages do not exist. */}
        <div className="flex items-center justify-between gap-4 px-6 pb-7 sm:px-8 lg:px-14 xl:px-16">
          <Link
            to="/"
            className="-ml-1 inline-flex min-h-[44px] items-center gap-2 rounded px-1 text-[0.8125rem] font-medium text-white/35 transition-colors hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {t("a2.back")}
          </Link>
          <p className="text-[0.8125rem] font-medium text-white/25">
            © {new Date().getFullYear()} 2K Tunes
          </p>
        </div>
      </div>
    </div>
  );
}
