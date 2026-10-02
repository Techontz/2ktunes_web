import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Gift, Mic2, Building2, Clapperboard } from "lucide-react";
import {
  Button,
  Field,
  Input,
  PasswordInput,
  RadioCardGroup,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  useToast,
} from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DASHBOARD_HOME, ONBOARDING_PATH, safeNext } from "@/lib/auth/routes";
import { ApiError } from "@/lib/api/client";
import { ACCOUNT_TYPES, PASSWORD_MIN, type AccountType } from "@/lib/api/auth";
import {
  cleanReferralCode,
  rememberReferralCode,
  rememberedReferralCode,
  type ReferralResult,
} from "@/lib/api/growth";
import { REFERRAL_COPY } from "@/features/growth/referralCopy";
import { useCopy } from "@/lib/useCopy";
import { useLanguage } from "@/lib/LanguageContext";
import { API_LOCALE } from "@/i18n";
import { cn } from "@/lib/utils";
import AuthLayout, { AuthHeading, FormAlert } from "./AuthLayout";
import GoogleButton from "./GoogleButton";
import { EMAIL_RE, authErrorKey, mapFieldErrors } from "./authErrors";

/**
 * /auth — log in and create account, as two tabs.
 *
 *   /auth                         log in
 *   /auth?mode=register           create account
 *   /auth?mode=register&type=creator   … with the account type preselected
 *   /auth?next=/dashboard/wallet  return there after logging in
 *   /auth?mode=register&ref=CODE  … with an invite code (also kept for this
 *                                 session, so Google sign-up sends it too)
 *
 * The server is the authority on validation: its 422 `errors` are rendered
 * next to the matching fields. 401 → invalid credentials, 429 → throttled.
 * New accounts are sent to /onboarding.
 */

type Mode = "login" | "register";

export default function AuthPage() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const mode: Mode = params.get("mode") === "register" ? "register" : "login";

  const setMode = (next: string) => {
    const p = new URLSearchParams(params);
    if (next === "register") p.set("mode", "register");
    else p.delete("mode");
    setParams(p, { replace: true });
  };

  useEffect(() => {
    document.title = `${t(mode === "register" ? "auth.tab_register" : "auth.tab_login")} · 2kTunes`;
  }, [mode, t]);

  // An invite code in the URL wins; otherwise the one /join/:code remembered.
  const urlRef = cleanReferralCode(params.get("ref"));
  useEffect(() => {
    if (urlRef) rememberReferralCode(urlRef);
  }, [urlRef]);
  const referralCode = urlRef ?? cleanReferralCode(rememberedReferralCode());

  return (
    <AuthLayout wide={mode === "register"}>
      <Tabs value={mode} onValueChange={setMode}>
        <TabList aria-label={t("auth.tabs_label")} fullWidth className={mode === "register" ? "mb-6" : "mb-8"}>
          <Tab value="login">{t("auth.tab_login")}</Tab>
          <Tab value="register">{t("auth.tab_register")}</Tab>
        </TabList>
        <TabPanel value="login" className="focus-visible:outline-none">
          <LoginForm />
        </TabPanel>
        <TabPanel value="register" className="focus-visible:outline-none">
          <RegisterForm referralCode={referralCode} />
        </TabPanel>
      </Tabs>
    </AuthLayout>
  );
}

/* ── Log in ─────────────────────────────────────────────────────────── */

/** Tells the new account whether its invite code was applied (POST /register, /google-login `referral`). */
export function useReferralToast() {
  const { toast } = useToast();
  const c = useCopy(REFERRAL_COPY);
  return (result: ReferralResult | null | undefined) => {
    if (!result) return;
    rememberReferralCode(null);
    if (result.applied) toast({ title: c.appliedTitle, description: c.appliedBody, tone: "success", duration: 8000 });
    else
      toast({
        title: c.notAppliedTitle,
        description: c.reasons[result.reason ?? ""] ?? c.reasons.unavailable,
        tone: "info",
        duration: 8000,
      });
  };
}

function useGoogle(setFormError: (s: string | null) => void, referralCode?: string | null) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useLanguage();
  const referralToast = useReferralToast();
  return {
    onCredential: async (idToken: string) => {
      setFormError(null);
      try {
        referralToast(await auth.loginWithGoogle(idToken, referralCode));
        navigate(safeNext(params.get("next")) ?? DASHBOARD_HOME, { replace: true });
      } catch (err) {
        setFormError(err instanceof ApiError && err.status === 401 ? t("auth.err_google") : t(authErrorKey(err)));
      }
    },
    onError: () => setFormError(t("auth.err_google")),
  };
}

function LoginForm() {
  const { t } = useLanguage();
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const google = useGoogle(setFormError);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => (prev[k] ? { ...prev, [k]: "" } : prev));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);
    const next: Record<string, string> = {};
    if (!values.email.trim()) next.email = t("auth.err_email");
    else if (!EMAIL_RE.test(values.email.trim())) next.email = t("auth.err_email_bad");
    if (!values.password) next.password = t("auth.err_pw");
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await auth.login(values.email.trim(), values.password);
      navigate(safeNext(params.get("next")) ?? DASHBOARD_HOME, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.isValidation && Object.keys(err.fieldErrors).length) {
        setErrors(mapFieldErrors(err.fieldErrors));
      } else {
        setFormError(t(authErrorKey(err)));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AuthHeading title={t("auth.title_login")} sub={t("auth.sub_login")} />
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <Field label={t("auth.email")} error={errors.email}>
          <Input
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
          />
        </Field>
        <Field label={t("auth.password")} error={errors.password}>
          <PasswordInput
            name="password"
            autoComplete="current-password"
            value={values.password}
            onChange={set("password")}
            showLabel={t("auth.show_pw")}
            hideLabel={t("auth.hide_pw")}
          />
        </Field>
        <div className="-mt-1 flex justify-end">
          <Link
            to="/forgot-password"
            className="rounded-sm text-body-sm font-semibold text-accent-text underline-offset-4 hover:underline"
          >
            {t("auth.forgot")}
          </Link>
        </div>
        {formError && <FormAlert>{formError}</FormAlert>}
        <Button type="submit" size="lg" fullWidth loading={busy}>
          {busy ? t("auth.signing_in") : t("auth.login_btn")}
        </Button>
      </form>
      <GoogleButton {...google} />
    </>
  );
}

/* ── Register ───────────────────────────────────────────────────────── */

const TYPE_DESC = {
  artist: "auth.type_artist_desc",
  label: "auth.type_label_desc",
  creator: "auth.type_creator_desc",
} as const satisfies Record<AccountType, string>;

/** The one-screen sign-up. `referralCode` (from /join/:code or ?ref=) is sent with it. */
export function RegisterForm({ referralCode, hideHeading }: { referralCode?: string | null; hideHeading?: boolean }) {
  const { t, language } = useLanguage();
  const rc = useCopy(REFERRAL_COPY);
  const referralToast = useReferralToast();
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preset = params.get("type") as AccountType | null;
  const [accountType, setAccountType] = useState<AccountType>(
    preset && ACCOUNT_TYPES.includes(preset) ? preset : "artist",
  );
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const google = useGoogle(setFormError, referralCode);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => (prev[k] ? { ...prev, [k]: "" } : prev));
  };

  const lengthOk = values.password.length >= PASSWORD_MIN;
  const matchOk = values.confirm.length > 0 && values.password === values.confirm;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = t("auth.err_name");
    if (!values.email.trim()) next.email = t("auth.err_email");
    else if (!EMAIL_RE.test(values.email.trim())) next.email = t("auth.err_email_bad");
    if (!values.password) next.password = t("auth.err_pw");
    else if (!lengthOk) next.password = t("auth.err_pw_short");
    if (values.confirm !== values.password) next.confirm = t("auth.err_confirm");
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const result = await auth.register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        passwordConfirmation: values.confirm,
        accountType,
        locale: API_LOCALE[language],
        referralCode: referralCode ?? null,
      });
      referralToast(result);
      const next = safeNext(params.get("next"));
      navigate(next ? `${ONBOARDING_PATH}?next=${encodeURIComponent(next)}` : ONBOARDING_PATH, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.isValidation) {
        const mapped = mapFieldErrors(err.fieldErrors);
        if (mapped.account_type) setFormError(mapped.account_type);
        setErrors(mapped);
        if (!Object.keys(mapped).length) setFormError(err.message);
      } else {
        setFormError(t(authErrorKey(err)));
      }
    } finally {
      setBusy(false);
    }
  };

  const hintClass = (ok: boolean) =>
    cn("flex items-center gap-1.5", ok ? "text-success" : "text-text-subtle");

  return (
    <>
      {!hideHeading && <AuthHeading title={t("auth.title_register")} sub={t("auth.sub_register")} compact />}
      <form noValidate onSubmit={onSubmit} className="space-y-4">
        <div>
          <RadioCardGroup<AccountType>
            legend={t("auth.account_type")}
            name="account_type"
            value={accountType}
            onChange={setAccountType}
            columns={3}
            options={[
              { value: "artist", label: t("auth.type_artist"), icon: <Mic2 /> },
              { value: "label", label: t("auth.type_label"), icon: <Building2 /> },
              { value: "creator", label: t("auth.type_creator"), icon: <Clapperboard /> },
            ]}
          />
          <p className="mt-2 text-caption text-text-subtle">{t(TYPE_DESC[accountType])}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("auth.name")} error={errors.name}>
            <Input name="name" autoComplete="name" value={values.name} onChange={set("name")} />
          </Field>
          <Field label={t("auth.email")} error={errors.email}>
            <Input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={set("email")}
            />
          </Field>
          <Field
            label={t("auth.password")}
            error={errors.password}
            hint={
              <span className={hintClass(lengthOk)}>
                {lengthOk && <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />}
                {t("auth.pw_hint")}
              </span>
            }
          >
            <PasswordInput
              name="password"
              autoComplete="new-password"
              value={values.password}
              onChange={set("password")}
              showLabel={t("auth.show_pw")}
              hideLabel={t("auth.hide_pw")}
            />
          </Field>
          <Field
            label={t("auth.confirm")}
            error={errors.confirm}
            hint={
              matchOk ? (
                <span className={hintClass(true)}>
                  <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                  {t("auth.pw_match")}
                </span>
              ) : undefined
            }
          >
            <PasswordInput
              name="password_confirmation"
              autoComplete="new-password"
              value={values.confirm}
              onChange={set("confirm")}
              showLabel={t("auth.show_pw")}
              hideLabel={t("auth.hide_pw")}
            />
          </Field>
        </div>
        {/* The join page shows the invite in its own header. */}
        {referralCode && !hideHeading && (
          <p className="flex items-center gap-2 rounded-control border border-accent/25 bg-accent-soft px-3 py-2 text-body-sm font-semibold text-accent-text">
            <Gift aria-hidden className="h-4 w-4 shrink-0" />
            {rc.codeLabel(referralCode)}
          </p>
        )}
        {formError && <FormAlert>{formError}</FormAlert>}
        <Button type="submit" size="lg" fullWidth loading={busy}>
          {busy ? t("auth.creating") : t("auth.register_btn")}
        </Button>
        <p className="text-center text-caption text-text-subtle">
          {t("auth.agree_1")}{" "}
          <Link to="/legal/terms" className="font-semibold text-text-muted underline underline-offset-2 hover:text-text">
            {t("footer.terms")}
          </Link>{" "}
          {t("auth.agree_2")}{" "}
          <Link to="/legal/privacy" className="font-semibold text-text-muted underline underline-offset-2 hover:text-text">
            {t("footer.privacy")}
          </Link>
          {t("auth.agree_3")}
        </p>
      </form>
      <GoogleButton {...google} />
    </>
  );
}
