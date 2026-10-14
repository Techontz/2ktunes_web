import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { MailCheck, RefreshCw } from "lucide-react";
import { Button, Field, Input, PasswordInput, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { resendVerificationEmail } from "@/lib/api/auth";
import { updateProfile } from "@/lib/api/account";
import { useErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/AuthProvider";
import { VERIFY_EMAIL_PATH, homeAfterVerification, isEmailVerified } from "@/lib/auth/routes";
import { useLanguage } from "@/lib/LanguageContext";
import AuthLayout, { AuthHeading, FormAlert } from "./AuthLayout";
import { EMAIL_RE, mapFieldErrors } from "./authErrors";

/**
 * /verify-email: "Check your email".
 *
 * Every account must confirm its email before using 2kTunes; the API answers
 * 403 `email_unverified` to almost everything until then, and the route
 * guards send unconfirmed accounts here. From this screen the user can resend
 * the link, say they've confirmed it, fix a mistyped address or sign out.
 *
 * The page also re-reads the profile every ~10 seconds while the tab is
 * visible and whenever the window regains focus, so confirming in another tab
 * (or on the phone) moves this one on by itself.
 */

/** Seconds before "Resend email" is offered again (the API allows 6 a minute). */
export const RESEND_COOLDOWN_SECONDS = 60;
/** How often the page re-checks the profile while visible. */
export const POLL_INTERVAL_MS = 10_000;

function Booting() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-svh items-center justify-center bg-surface" role="status" aria-label={t("common.loading")}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
    </div>
  );
}

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const { status, user, reloadUser, logout } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next");
  const navigate = useNavigate();
  const { toast } = useToast();
  const toMessage = useErrorMessage();

  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notYet, setNotYet] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    document.title = `${t("verify.page_title")} · 2kTunes`;
  }, [t]);

  /* Cooldown ticker. */
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  /* Auto check: every POLL_INTERVAL_MS while visible, and on focus. */
  const signedIn = status === "authenticated";
  const verified = isEmailVerified(user);
  const inFlight = useRef(false);
  const silentCheck = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await reloadUser();
    } finally {
      inFlight.current = false;
    }
  }, [reloadUser]);

  useEffect(() => {
    if (!signedIn || verified) return;
    const visible = () => typeof document === "undefined" || document.visibilityState !== "hidden";
    const id = window.setInterval(() => {
      if (visible()) void silentCheck();
    }, POLL_INTERVAL_MS);
    const onFocus = () => void silentCheck();
    const onVisibility = () => {
      if (visible()) void silentCheck();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [signedIn, verified, silentCheck]);

  if (status === "loading") return <Booting />;
  if (status === "unauthenticated" || !user) {
    return <Navigate to={`/auth?next=${encodeURIComponent(VERIFY_EMAIL_PATH)}`} replace />;
  }
  if (verified) return <Navigate to={homeAfterVerification(user, next)} replace />;

  const resend = async () => {
    if (sending || cooldown > 0) return;
    setSending(true);
    setResendError(null);
    try {
      await resendVerificationEmail();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast({
        title: t("verify.resent_toast"),
        description: t("verify.resent_toast_body", { email: user.email }),
        tone: "success",
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setResendError(t("verify.throttled"));
      } else {
        setResendError(toMessage(err));
      }
    } finally {
      setSending(false);
    }
  };

  const confirmed = async () => {
    if (checking) return;
    setChecking(true);
    setNotYet(false);
    const fresh = await reloadUser();
    setChecking(false);
    // Verified: the render above redirects. Otherwise say so.
    if (!isEmailVerified(fresh)) setNotYet(true);
  };

  const signOut = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <AuthLayout>
      <span
        aria-hidden
        className="mb-6 flex h-12 w-12 items-center justify-center rounded-control bg-accent-soft text-accent-text [&>svg]:h-6 [&>svg]:w-6"
      >
        <MailCheck />
      </span>
      <AuthHeading
        title={t("verify.page_title")}
        sub={
          <>
            {t("verify.page_body", { email: "\u0000" })
              .split("\u0000")
              .flatMap((part, i) =>
                i === 0
                  ? [part]
                  : [
                      <strong key="email" className="break-all font-semibold text-text">
                        {user.email}
                      </strong>,
                      part,
                    ],
              )}
          </>
        }
      />

      {changing ? (
        <ChangeEmailForm
          currentEmail={user.email}
          onCancel={() => setChanging(false)}
          onChanged={async (email) => {
            setChanging(false);
            setNotYet(false);
            setCooldown(RESEND_COOLDOWN_SECONDS);
            await reloadUser();
            toast({
              title: t("verify.changed_toast"),
              description: t("verify.changed_toast_body", { email }),
              tone: "success",
              duration: 8000,
            });
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <Button size="lg" fullWidth loading={checking} onClick={confirmed} leftIcon={<RefreshCw aria-hidden />}>
            {checking ? t("verify.checking") : t("verify.confirmed_btn")}
          </Button>
          {notYet && <FormAlert tone="info">{t("verify.not_yet")}</FormAlert>}
          <Button
            size="lg"
            variant="secondary"
            fullWidth
            loading={sending}
            disabled={cooldown > 0}
            onClick={resend}
          >
            {cooldown > 0 ? t("verify.resend_wait", { seconds: cooldown }) : t("verify.resend_btn")}
          </Button>
          {resendError && <FormAlert>{resendError}</FormAlert>}
          <p className="text-body-sm text-text-muted">{t("verify.page_hint")}</p>
          <p className="text-caption text-text-subtle" aria-live="polite">
            {t("verify.auto_check")}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => setChanging(true)}
              className="inline-flex min-h-11 items-center rounded-sm text-body-sm font-semibold text-accent-text underline-offset-4 hover:underline"
            >
              {t("verify.change_email")}
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex min-h-11 items-center rounded-sm text-body-sm font-semibold text-text-muted underline-offset-4 hover:text-text hover:underline"
            >
              {t("verify.sign_out")}
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

/**
 * Fixes a mistyped address. PATCH /profile accepts `email` (with the current
 * password) before verification; the backend resets verification and sends a
 * new link to the new address.
 */
function ChangeEmailForm({
  currentEmail,
  onCancel,
  onChanged,
}: {
  currentEmail: string;
  onCancel: () => void;
  onChanged: (email: string) => void | Promise<void>;
}) {
  const { t } = useLanguage();
  const toMessage = useErrorMessage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);
    const value = email.trim().toLowerCase();
    const errs: Record<string, string> = {};
    if (!value) errs.email = t("auth.err_email");
    else if (!EMAIL_RE.test(value)) errs.email = t("auth.err_email_bad");
    else if (value === currentEmail.toLowerCase()) errs.email = t("verify.same_email");
    if (!password) errs.current_password = t("auth.err_pw");
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const updated = await updateProfile({ email: value, current_password: password });
      await onChanged(updated.email ?? value);
    } catch (err) {
      if (err instanceof ApiError && err.isValidation && Object.keys(err.fieldErrors).length) {
        setErrors(mapFieldErrors(err.fieldErrors));
      } else if (err instanceof ApiError && err.code === "password_incorrect") {
        setErrors({ current_password: toMessage(err) });
      } else {
        setFormError(toMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-5" aria-label={t("verify.change_title")}>
      <h2 className="text-body font-bold text-text">{t("verify.change_title")}</h2>
      <Field label={t("verify.new_email")} error={errors.email}>
        <Input
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((x) => ({ ...x, email: "" }));
          }}
        />
      </Field>
      <Field label={t("verify.current_password")} error={errors.current_password}>
        <PasswordInput
          name="current_password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((x) => ({ ...x, current_password: "" }));
          }}
          showLabel={t("auth.show_pw")}
          hideLabel={t("auth.hide_pw")}
        />
      </Field>
      {formError && <FormAlert>{formError}</FormAlert>}
      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" fullWidth loading={busy}>
          {t("verify.change_btn")}
        </Button>
        <Button type="button" variant="ghost" size="lg" fullWidth onClick={onCancel}>
          {t("verify.change_cancel")}
        </Button>
      </div>
    </form>
  );
}
