import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Mic2, Building2, Clapperboard } from "lucide-react";
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
} from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DASHBOARD_HOME, ONBOARDING_PATH, safeNext } from "@/lib/auth/routes";
import { ApiError } from "@/lib/api/client";
import { ACCOUNT_TYPES, PASSWORD_MIN, type AccountType } from "@/lib/api/auth";
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
          <RegisterForm />
        </TabPanel>
      </Tabs>
    </AuthLayout>
  );
}

/* ── Log in ─────────────────────────────────────────────────────────── */

function useGoogle(setFormError: (s: string | null) => void) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useLanguage();
  return {
    onCredential: async (idToken: string) => {
      setFormError(null);
      try {
        await auth.loginWithGoogle(idToken);
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

function RegisterForm() {
  const { t, language } = useLanguage();
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
  const google = useGoogle(setFormError);

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
      await auth.register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        passwordConfirmation: values.confirm,
        accountType,
        locale: API_LOCALE[language],
      });
      navigate(ONBOARDING_PATH, { replace: true });
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
      <AuthHeading title={t("auth.title_register")} sub={t("auth.sub_register")} compact />
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
