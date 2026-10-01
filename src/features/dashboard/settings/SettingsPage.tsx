import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, ChevronRight, LogOut, Trash2 } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Field,
  Input,
  PasswordInput,
  Select,
  Spinner,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  ConfirmDialog,
  FormAlert,
  PageHeader,
  PasswordConfirmDialog,
  useAction,
} from "@/features/dashboard/components";
import { CountrySelect } from "@/features/onboarding/CountrySelect";
import { CURRENCIES, type Currency } from "@/features/onboarding/countries";
import { deleteAccount, logoutAll, updateProfile, uploadProfileAvatar, type ProfilePatch } from "@/lib/api/account";
import type { AuthUser } from "@/lib/api/auth";
import { errorCodeOf } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY } from "./copy";
import { AVATAR_ACCEPT, checkImage } from "./imageFile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsPage() {
  const c = useCopy(COPY);
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title={c.title} description={c.description} />
      {user && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] xl:items-start">
          <div className="min-w-0 space-y-6">
            <ProfileSection key={user.id} user={user} />
            <EmailSection user={user} />
            <PasswordSection />
          </div>
          <div className="min-w-0 space-y-6">
            <AvatarSection user={user} />
            <CommsSection user={user} />
            <SessionsSection />
            <DangerSection />
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsCard({
  id,
  title,
  description,
  children,
  tone,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  tone?: "danger";
}) {
  return (
    <Card as="section" id={id} padding="none" aria-label={title} className={cn(tone === "danger" && "border-danger/30")}>
      <CardHeader title={title} description={description} titleAs="h2" />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

/* ── Profile ─────────────────────────────────────────────────────────── */

type ProfileForm = {
  name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  business_name: string;
  phone: string;
  country: string;
  city: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  preferred_currency: Currency;
};

function fromUser(u: AuthUser): ProfileForm {
  return {
    name: u.name ?? "",
    first_name: u.first_name ?? "",
    middle_name: u.middle_name ?? "",
    last_name: u.last_name ?? "",
    business_name: u.business_name ?? "",
    phone: u.phone ?? "",
    country: u.country ?? "",
    city: u.city ?? "",
    address_line_1: u.address_line_1 ?? "",
    address_line_2: u.address_line_2 ?? "",
    postal_code: u.postal_code ?? "",
    preferred_currency: CURRENCIES.find((x) => x === u.preferred_currency) ?? "USD",
  };
}

function ProfileSection({ user }: { user: AuthUser }) {
  const c = useCopy(COPY);
  const { t, language, setLanguage } = useLanguage();
  const { refresh } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileForm>(() => fromUser(user));
  const [lang, setLang] = useState<"EN" | "SW">(language === "SW" ? "SW" : "EN");
  const save = useAction((patch: ProfilePatch) => updateProfile(patch));

  const set = (k: keyof ProfileForm, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const text = (k: keyof ProfileForm) => {
    const v = String(form[k]).trim();
    return v || null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const patch: ProfilePatch = {
      name: form.name.trim() || user.name,
      first_name: text("first_name"),
      middle_name: text("middle_name"),
      last_name: text("last_name"),
      business_name: text("business_name"),
      phone: text("phone"),
      country: text("country"),
      city: text("city"),
      address_line_1: text("address_line_1"),
      address_line_2: text("address_line_2"),
      postal_code: text("postal_code"),
      preferred_currency: form.preferred_currency,
      locale: lang === "SW" ? "sw" : "en",
    };
    const res = await save.run(patch);
    if (res.ok) {
      setLanguage(lang);
      await refresh();
      toast({ title: c.profileSaved, tone: "success" });
    }
  };

  const err = (k: string) => save.fieldErrors[k] ?? null;
  const optional = { optional: true, optionalLabel: t("common.optional") };

  return (
    <SettingsCard id="profile" title={c.profileTitle} description={c.profileDescription}>
      <form onSubmit={submit} noValidate className="space-y-5">
        {save.error && <FormAlert>{Object.keys(save.fieldErrors).length ? t("err.fix_fields") : save.error}</FormAlert>}
        <Field label={c.displayName} error={err("name")}>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={255} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={c.firstName} error={err("first_name")} {...optional}>
            <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} autoComplete="given-name" maxLength={120} />
          </Field>
          <Field label={c.middleName} error={err("middle_name")} {...optional}>
            <Input value={form.middle_name} onChange={(e) => set("middle_name", e.target.value)} autoComplete="additional-name" maxLength={120} />
          </Field>
          <Field label={c.lastName} error={err("last_name")} {...optional}>
            <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} autoComplete="family-name" maxLength={120} />
          </Field>
        </div>
        <Field label={c.businessName} error={err("business_name")} {...optional}>
          <Input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} autoComplete="organization" maxLength={255} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.phone} hint={c.phoneHint} error={err("phone")} {...optional}>
            <Input type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" maxLength={30} />
          </Field>
          <Field label={c.country} error={err("country")} {...optional}>
            <CountrySelect value={form.country} onChange={(v) => set("country", v)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.address1} error={err("address_line_1")} {...optional}>
            <Input value={form.address_line_1} onChange={(e) => set("address_line_1", e.target.value)} autoComplete="address-line1" maxLength={255} />
          </Field>
          <Field label={c.address2} error={err("address_line_2")} {...optional}>
            <Input value={form.address_line_2} onChange={(e) => set("address_line_2", e.target.value)} autoComplete="address-line2" maxLength={255} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.city} error={err("city")} {...optional}>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" maxLength={120} />
          </Field>
          <Field label={c.postalCode} error={err("postal_code")} {...optional}>
            <Input value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} autoComplete="postal-code" maxLength={20} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.currency} hint={c.currencyHint} error={err("preferred_currency")}>
            <Select value={form.preferred_currency} onChange={(e) => set("preferred_currency", e.target.value)}>
              {CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.language} error={err("locale")}>
            <Select value={lang} onChange={(e) => setLang(e.target.value as "EN" | "SW")}>
              <option value="EN" lang="en">
                {c.langEn}
              </option>
              <option value="SW" lang="sw">
                {c.langSw}
              </option>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={save.pending} className="w-full sm:w-auto">
            {c.saveProfile}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────── */

function AvatarSection({ user }: { user: AuthUser }) {
  const c = useCopy(COPY);
  const { refresh } = useAuth();
  const { toast } = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const upload = useAction((f: File) => uploadProfileAvatar(f));

  const onFile = async (file: File | undefined) => {
    if (ref.current) ref.current.value = "";
    if (!file) return;
    setProblem(null);
    const p = await checkImage(file, { maxBytes: 4 * 1024 * 1024, minPx: 100 });
    if (p) {
      setProblem(p === "type" ? c.avatarType : p === "size" ? c.avatarSize : p === "dimensions" ? c.avatarDims : c.avatarUnreadable);
      return;
    }
    const res = await upload.run(file);
    if (res.ok) {
      await refresh();
      toast({ title: c.avatarSaved, tone: "success" });
    }
  };

  const shown = problem ?? upload.fieldErrors.avatar ?? upload.error;

  return (
    <SettingsCard id="avatar" title={c.avatarTitle} description={c.avatarDescription}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <Avatar name={user.name} src={user.avatar} size="lg" />
          {upload.pending && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Spinner label={c.uploading} />
            </span>
          )}
        </div>
        <input
          ref={ref}
          id="settings-avatar"
          type="file"
          accept={AVATAR_ACCEPT}
          className="sr-only"
          disabled={upload.pending}
          aria-describedby={shown ? "settings-avatar-error" : undefined}
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <Button asChild variant="secondary">
          <label htmlFor="settings-avatar" className="cursor-pointer">
            <Camera className="h-4 w-4" aria-hidden />
            {upload.pending ? c.uploading : user.avatar ? c.changeAvatar : c.uploadAvatar}
          </label>
        </Button>
      </div>
      {shown && (
        <p id="settings-avatar-error" role="alert" className="mt-3 text-body-sm font-medium text-danger">
          {shown}
        </p>
      )}
    </SettingsCard>
  );
}

/* ── Email ───────────────────────────────────────────────────────────── */

function EmailSection({ user }: { user: AuthUser }) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { refresh } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [local, setLocal] = useState<Record<string, string>>({});
  const save = useAction((patch: ProfilePatch) => updateProfile(patch));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const next = email.trim().toLowerCase();
    if (!EMAIL_RE.test(next)) errs.email = c.emailInvalid;
    else if (next === user.email.toLowerCase()) errs.email = c.emailSame;
    if (!password) errs.current_password = c.passwordRequired;
    setLocal(errs);
    if (Object.keys(errs).length) return;
    const res = await save.run({ email: next, current_password: password });
    if (res.ok) {
      setEmail("");
      setPassword("");
      await refresh();
      toast({ title: c.emailChanged, description: c.emailChangedBody, tone: "success", duration: 8000 });
    }
  };

  const err = (k: string) => local[k] ?? save.fieldErrors[k] ?? null;
  const verified = !!user.email_verified_at || user.email_verified === true;

  return (
    <SettingsCard id="email" title={c.emailTitle} description={c.emailDescription}>
      <div className="mb-5 flex flex-wrap items-center gap-2 text-body-sm">
        <span className="text-text-subtle">{c.currentEmail}:</span>
        <span className="min-w-0 break-all font-semibold text-text">{user.email}</span>
        <Badge tone={verified ? "success" : "warning"} size="sm" dot>
          {verified ? c.verified : c.unverified}
        </Badge>
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        {save.error && Object.keys(save.fieldErrors).length === 0 && <FormAlert>{save.error}</FormAlert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.newEmail} error={err("email")} required>
            <Input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={c.currentPassword} error={err("current_password")} required>
            <PasswordInput
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showLabel={t("auth.show_pw")}
              hideLabel={t("auth.hide_pw")}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" loading={save.pending} className="w-full sm:w-auto">
            {c.changeEmail}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

/* ── Password ────────────────────────────────────────────────────────── */

function PasswordSection() {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [local, setLocal] = useState<Record<string, string>>({});
  const save = useAction((patch: ProfilePatch) => updateProfile(patch));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!current) errs.current_password = c.passwordRequired;
    if (next.length < 8) errs.new_password = c.newPasswordShort;
    else if (confirm !== next) errs.new_password_confirmation = c.passwordMismatch;
    setLocal(errs);
    if (Object.keys(errs).length) return;
    const res = await save.run({ current_password: current, new_password: next, new_password_confirmation: confirm });
    if (res.ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
      toast({ title: c.passwordChanged, tone: "success" });
    }
  };

  const code = errorCodeOf(save.errorObj);
  const err = (k: string) => {
    if (local[k]) return local[k];
    if (k === "current_password" && code === "password_incorrect") return save.fieldErrors.current_password ?? t("pw.incorrect");
    if (k === "new_password" && code === "password_reused") return c.passwordReused;
    return save.fieldErrors[k] ?? null;
  };
  const general = save.error && !code && Object.keys(save.fieldErrors).length === 0 ? save.error : null;
  const pw = { showLabel: t("auth.show_pw"), hideLabel: t("auth.hide_pw") };

  return (
    <SettingsCard id="password" title={c.passwordTitle} description={c.passwordDescription}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {general && <FormAlert>{general}</FormAlert>}
        <Field label={c.currentPassword} error={err("current_password")} required>
          <PasswordInput autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} {...pw} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.newPassword} hint={c.newPasswordHint} error={err("new_password")} required>
            <PasswordInput autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} {...pw} />
          </Field>
          <Field label={c.confirmPassword} error={err("new_password_confirmation")} required>
            <PasswordInput autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} {...pw} />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" loading={save.pending} className="w-full sm:w-auto">
            {c.changePassword}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

/* ── Communication ───────────────────────────────────────────────────── */

function CommsSection({ user }: { user: AuthUser }) {
  const c = useCopy(COPY);
  const { refresh } = useAuth();
  const { toast } = useToast();
  const initial = { email: !!Number(user.allow_email ?? 1), mobile: !!Number(user.allow_mobile_alerts ?? 0) };
  const [allowEmail, setAllowEmail] = useState(initial.email);
  const [allowMobile, setAllowMobile] = useState(initial.mobile);
  const save = useAction((patch: ProfilePatch) => updateProfile(patch));

  useEffect(() => {
    setAllowEmail(initial.email);
    setAllowMobile(initial.mobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.allow_email, user.allow_mobile_alerts]);

  const dirty = allowEmail !== initial.email || allowMobile !== initial.mobile;

  return (
    <SettingsCard id="comms" title={c.commsTitle} description={c.commsDescription}>
      <div className="space-y-4">
        <Checkbox label={c.allowEmail} description={c.allowEmailHint} checked={allowEmail} onChange={(e) => setAllowEmail(e.target.checked)} />
        <Checkbox
          label={c.allowMobile}
          description={c.allowMobileHint}
          checked={allowMobile}
          onChange={(e) => setAllowMobile(e.target.checked)}
        />
        {save.error && <FormAlert>{save.error}</FormAlert>}
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/dashboard/notifications"
            className="inline-flex min-h-11 items-center gap-1 rounded-sm text-body-sm font-semibold text-accent-text underline-offset-4 hover:underline"
          >
            {c.perCategory}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
          <Button
            variant="secondary"
            disabled={!dirty}
            loading={save.pending}
            onClick={async () => {
              const res = await save.run({ allow_email: allowEmail, allow_mobile_alerts: allowMobile });
              if (res.ok) {
                await refresh();
                toast({ title: c.commsSaved, tone: "success" });
              }
            }}
          >
            {c.saveComms}
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
}

/* ── Sessions ────────────────────────────────────────────────────────── */

function SessionsSection() {
  const c = useCopy(COPY);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <SettingsCard id="sessions" title={c.sessionsTitle} description={c.sessionsDescription}>
      <Button variant="secondary" leftIcon={<LogOut />} onClick={() => setOpen(true)} className="w-full sm:w-auto">
        {c.signOutAll}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={c.signOutAllTitle}
        description={c.signOutAllBody}
        confirmLabel={c.signOutAll}
        danger
        onConfirm={async () => {
          await logoutAll();
          await logout();
          navigate("/auth", { replace: true });
        }}
      />
    </SettingsCard>
  );
}

/* ── Danger zone ─────────────────────────────────────────────────────── */

function DangerSection() {
  const c = useCopy(COPY);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [blocked, setBlocked] = useState(false);

  return (
    <SettingsCard id="danger" title={c.dangerTitle} description={c.dangerDescription} tone="danger">
      {blocked && (
        <FormAlert tone="warning" className="mb-4">
          <p>{c.balanceRemaining}</p>
          <Link to="/dashboard/wallet" className="mt-2 inline-block font-semibold text-accent-text underline underline-offset-4">
            {c.goToWallet}
          </Link>
        </FormAlert>
      )}
      <Button
        variant="danger"
        leftIcon={<Trash2 />}
        onClick={() => {
          setReason("");
          setOpen(true);
        }}
        className="w-full sm:w-auto"
      >
        {c.deleteAccount}
      </Button>
      <PasswordConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={c.deleteTitle}
        description={c.deleteBody}
        confirmLabel={c.deleteConfirm}
        danger
        onConfirm={async (password) => {
          try {
            await deleteAccount(password, reason.trim() || undefined);
          } catch (err) {
            if (errorCodeOf(err) === "balance_remaining") {
              setBlocked(true);
              return; // closes the dialog; the explanation shows in the section
            }
            throw err;
          }
          toast({ title: c.deleted, tone: "success" });
          navigate("/", { replace: true });
          void logout();
        }}
      >
        <Field label={c.deleteReason} hint={c.deleteReasonHint}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} />
        </Field>
      </PasswordConfirmDialog>
    </SettingsCard>
  );
}
