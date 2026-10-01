import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, MailCheck } from "lucide-react";
import { Button, Field, Input, PasswordInput } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { PASSWORD_MIN, forgotPassword, resendVerificationEmail, resetPassword } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DASHBOARD_HOME } from "@/lib/auth/routes";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import AuthLayout, { AuthHeading, FormAlert } from "./AuthLayout";
import { EMAIL_RE, authErrorKey, mapFieldErrors } from "./authErrors";

/**
 * Password recovery and email verification screens.
 *
 *   /forgot-password                         request a reset link (always generic)
 *   /reset-password?token=…&email=…          choose a new password
 *   /email-verified?status=success|already|invalid|expired
 */

function useTitle(key: Parameters<ReturnType<typeof useLanguage>["t"]>[0]) {
  const { t } = useLanguage();
  useEffect(() => {
    document.title = `${t(key)} · 2kTunes`;
  }, [key, t]);
}

function ResultPanel({
  icon,
  tone,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  tone: "success" | "warning" | "danger" | "info";
  title: ReactNode;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div>
      <span
        aria-hidden
        className={cn(
          "mb-6 flex h-12 w-12 items-center justify-center rounded-control [&>svg]:h-6 [&>svg]:w-6",
          tone === "success" && "bg-success-soft text-success",
          tone === "warning" && "bg-warning-soft text-warning",
          tone === "danger" && "bg-danger-soft text-danger",
          tone === "info" && "bg-accent-soft text-accent-text",
        )}
      >
        {icon}
      </span>
      <AuthHeading title={title} sub={body} />
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  );
}

/* ── Forgot password ───────────────────────────────────────────────── */

export function ForgotPasswordPage() {
  const { t } = useLanguage();
  useTitle("auth.forgot_title");
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);
    const value = email.trim();
    if (!value) return setError(t("auth.err_email"));
    if (!EMAIL_RE.test(value)) return setError(t("auth.err_email_bad"));
    setBusy(true);
    try {
      await forgotPassword(value);
      setSentTo(value);
    } catch (err) {
      if (err instanceof ApiError && err.isValidation && err.fieldErrors.email) {
        setError(err.fieldErrors.email);
      } else {
        setFormError(t(authErrorKey(err)));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      {sentTo ? (
        <ResultPanel
          icon={<MailCheck />}
          tone="info"
          title={t("auth.forgot_done_title")}
          body={t("auth.forgot_done_body", { email: sentTo })}
        >
          <Button to="/auth" variant="secondary" size="lg" fullWidth>
            {t("auth.back_login")}
          </Button>
        </ResultPanel>
      ) : (
        <>
          <AuthHeading title={t("auth.forgot_title")} sub={t("auth.forgot_sub")} />
          <form noValidate onSubmit={onSubmit} className="space-y-5">
            <Field label={t("auth.email")} error={error}>
              <Input
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
              />
            </Field>
            {formError && <FormAlert>{formError}</FormAlert>}
            <Button type="submit" size="lg" fullWidth loading={busy}>
              {busy ? t("auth.sending") : t("auth.forgot_btn")}
            </Button>
          </form>
          <p className="mt-6 text-center text-body-sm text-text-muted">
            {t("auth.remembered")}{" "}
            <Link to="/auth" className="font-semibold text-text underline underline-offset-4">
              {t("auth.back_login")}
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}

/* ── Reset password ────────────────────────────────────────────────── */

export function ResetPasswordPage() {
  const { t } = useLanguage();
  useTitle("auth.reset_title");
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [invalid, setInvalid] = useState(!token || !email);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);
    const next: Record<string, string> = {};
    if (!values.password) next.password = t("auth.err_pw");
    else if (values.password.length < PASSWORD_MIN) next.password = t("auth.err_pw_short");
    if (values.confirm !== values.password) next.confirm = t("auth.err_confirm");
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await resetPassword({
        token,
        email,
        password: values.password,
        password_confirmation: values.confirm,
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.isValidation) {
        const mapped = mapFieldErrors(err.fieldErrors);
        // A bad or expired token comes back against `email` or `token`: the
        // link itself is the problem, not anything the user typed.
        if (mapped.token || mapped.email) {
          setInvalid(true);
          return;
        }
        setErrors(mapped);
        if (!Object.keys(mapped).length) setFormError(err.message);
      } else {
        setFormError(t(authErrorKey(err)));
      }
    } finally {
      setBusy(false);
    }
  };

  let content: ReactNode;
  if (done) {
    content = (
      <ResultPanel icon={<CheckCircle2 />} tone="success" title={t("auth.reset_done_title")} body={t("auth.reset_done_body")}>
        <Button to="/auth" size="lg" fullWidth>
          {t("auth.login_btn")}
        </Button>
      </ResultPanel>
    );
  } else if (invalid) {
    content = (
      <ResultPanel
        icon={<AlertTriangle />}
        tone="warning"
        title={t("auth.reset_invalid_title")}
        body={t("auth.reset_invalid_body")}
      >
        <Button
          to={email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password"}
          size="lg"
          fullWidth
        >
          {t("auth.request_new")}
        </Button>
        <Button to="/auth" variant="ghost" size="lg" fullWidth>
          {t("auth.back_login")}
        </Button>
      </ResultPanel>
    );
  } else {
    content = (
      <>
        <AuthHeading title={t("auth.reset_title")} sub={t("auth.reset_sub", { email })} />
        <form noValidate onSubmit={onSubmit} className="space-y-5">
          {/* Lets password managers associate the new password with the account. */}
          <input type="email" name="email" autoComplete="username" value={email} readOnly hidden />
          <Field label={t("auth.new_password")} error={errors.password} hint={t("auth.pw_hint")}>
            <PasswordInput
              name="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => {
                setValues((v) => ({ ...v, password: e.target.value }));
                setErrors((x) => ({ ...x, password: "" }));
              }}
              showLabel={t("auth.show_pw")}
              hideLabel={t("auth.hide_pw")}
            />
          </Field>
          <Field label={t("auth.confirm")} error={errors.confirm}>
            <PasswordInput
              name="password_confirmation"
              autoComplete="new-password"
              value={values.confirm}
              onChange={(e) => {
                setValues((v) => ({ ...v, confirm: e.target.value }));
                setErrors((x) => ({ ...x, confirm: "" }));
              }}
              showLabel={t("auth.show_pw")}
              hideLabel={t("auth.hide_pw")}
            />
          </Field>
          {formError && <FormAlert>{formError}</FormAlert>}
          <Button type="submit" size="lg" fullWidth loading={busy}>
            {busy ? t("auth.updating") : t("auth.reset_btn")}
          </Button>
        </form>
      </>
    );
  }

  return <AuthLayout>{content}</AuthLayout>;
}

/* ── Email verified ────────────────────────────────────────────────── */

type VerifyStatus = "success" | "already" | "invalid" | "expired";

export function EmailVerifiedPage() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const raw = params.get("status");
  const status: VerifyStatus =
    raw === "success" || raw === "already" || raw === "expired" ? raw : "invalid";
  useTitle(`verify.${status}_title` as const);
  const { status: authStatus, refresh } = useAuth();
  const signedIn = authStatus === "authenticated";
  const [resend, setResend] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  // A verified account should see the fresh flag in the dashboard.
  useEffect(() => {
    if (signedIn && (status === "success" || status === "already")) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, signedIn]);

  const doResend = async () => {
    setResend("busy");
    setResendError(null);
    try {
      await resendVerificationEmail();
      setResend("sent");
    } catch (err) {
      setResend("error");
      setResendError(t(authErrorKey(err)));
    }
  };

  const ok = status === "success" || status === "already";
  const icon = ok ? <CheckCircle2 /> : status === "expired" ? <Clock /> : <AlertTriangle />;

  return (
    <AuthLayout>
      <ResultPanel
        icon={icon}
        tone={ok ? "success" : "warning"}
        title={t(`verify.${status}_title`)}
        body={t(`verify.${status}_body`)}
      >
        {ok ? (
          <Button to={signedIn ? DASHBOARD_HOME : "/auth"} size="lg" fullWidth>
            {signedIn ? t("verify.continue") : t("auth.login_btn")}
          </Button>
        ) : signedIn ? (
          <>
            {resend === "sent" ? (
              <FormAlert tone="success">{t("verify.resent")}</FormAlert>
            ) : (
              <Button size="lg" fullWidth loading={resend === "busy"} onClick={doResend}>
                {t("verify.resend")}
              </Button>
            )}
            {resendError && <FormAlert>{resendError}</FormAlert>}
            <Button to={DASHBOARD_HOME} variant="ghost" size="lg" fullWidth>
              {t("verify.continue")}
            </Button>
          </>
        ) : (
          <Button to={`/auth?next=${encodeURIComponent("/email-verified?status=" + status)}`} size="lg" fullWidth>
            {t("verify.login_to_resend")}
          </Button>
        )}
      </ResultPanel>
    </AuthLayout>
  );
}
