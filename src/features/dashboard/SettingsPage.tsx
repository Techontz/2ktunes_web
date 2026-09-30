import { useRef, useState } from "react";
import { Camera, Check } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  updateAvatar,
  updateProfile,
  type ProfileUpdatePayload,
} from "@/lib/api/dashboard";
import {
  Badge,
  Button,
  Field,
  Notice,
  PageHeader,
  Panel,
  SectionLabel,
} from "./ui";

/**
 * SETTINGS — GET /api/profile (via AuthProvider), POST /api/profile/update,
 * POST /api/profile/avatar
 *
 * ONLY CHANGED FIELDS ARE SENT, and that is not just tidiness. The controller
 * ends with:
 *
 *     $user->update($request->except([...]));
 *     if ($request->filled('business_name')) { $user->name = $request->business_name; }
 *
 * so a payload that always includes `business_name` would overwrite `name` on
 * every save and quietly discard any edit to it. Diffing against the loaded
 * profile means each field does what the form says it does.
 *
 * `email` is always included because the validator requires it
 * (`'email' => 'required|email'`) even for a partial update.
 *
 * The password branch reads `current_password`, `new_password` and
 * `new_password_confirmation`; it refuses a new password equal to the old one
 * and returns 422 with its own message when the current password is wrong.
 */

type Draft = {
  name: string;
  business_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address_line_1: string;
};

const FIELDS: (keyof Draft)[] = [
  "name",
  "business_name",
  "first_name",
  "last_name",
  "email",
  "phone",
  "country",
  "city",
  "address_line_1",
];

export default function SettingsPage() {
  const { user, refresh } = useAuth();

  const initial: Draft = {
    name: user?.name ?? "",
    business_name: user?.business_name ?? "",
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    country: user?.country ?? "",
    city: user?.city ?? "",
    address_line_1: user?.address_line_1 ?? "",
  };

  const [draft, setDraft] = useState<Draft>(initial);
  const [baseline, setBaseline] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwDone, setPwDone] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    setSaved(false);
  };

  const dirty = FIELDS.some((key) => draft[key] !== baseline[key]);

  const saveProfile = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (saving || !dirty) return;
    setErrors({});
    setFormError(null);
    setSaved(false);

    const payload: ProfileUpdatePayload = { email: draft.email.trim() };
    for (const key of FIELDS) {
      if (key === "email") continue;
      if (draft[key] !== baseline[key]) {
        payload[key] = draft[key].trim();
      }
    }

    setSaving(true);
    try {
      await updateProfile(payload);
      // The provider re-reads GET /api/profile, so the sidebar, overview and
      // this form all move together off one source.
      await refresh();
      setBaseline(draft);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.isValidation) {
        setErrors(err.fieldErrors);
        if (!Object.keys(err.fieldErrors).length) setFormError(err.message);
      } else {
        setFormError(errorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);

    // The endpoint validates `image|max:2048` (kilobytes). Checking here saves a
    // round trip and gives a clearer message than the server's.
    if (file.size > 2048 * 1024) {
      setAvatarError("That image is over 2 MB. Choose a smaller one.");
      e.target.value = "";
      return;
    }

    setAvatarBusy(true);
    try {
      await updateAvatar(file);
      await refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isValidation) {
        setAvatarError(err.fieldErrors.avatar ?? err.message);
      } else {
        setAvatarError(errorMessage(err));
      }
    } finally {
      setAvatarBusy(false);
      e.target.value = "";
    }
  };

  const savePassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (pwBusy) return;
    setPwError(null);
    setPwErrors({});
    setPwDone(false);

    if (!pw.current) {
      setPwErrors({ current: "Enter your current password." });
      return;
    }
    if (pw.next.length < 6) {
      setPwErrors({ next: "Use at least 6 characters." });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwErrors({ confirm: "Both passwords must match." });
      return;
    }

    setPwBusy(true);
    try {
      await updateProfile({
        email: user.email,
        current_password: pw.current,
        new_password: pw.next,
        new_password_confirmation: pw.confirm,
      });
      setPw({ current: "", next: "", confirm: "" });
      setPwDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        // This branch returns a bare message ("Current password incorrect",
        // "New password cannot match old password") as well as field errors.
        if (err.fieldErrors.new_password) {
          setPwErrors({ next: err.fieldErrors.new_password });
        } else {
          setPwError(err.message);
        }
      } else {
        setPwError(errorMessage(err));
      }
    } finally {
      setPwBusy(false);
    }
  };

  const verified = Boolean(user.email_verified_at);

  return (
    <>
      <PageHeader
        eyebrow="2K Tunes / Account"
        title="Settings"
        lede="Your profile as the backend has it. Changes are written straight to your account."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_21rem]">
        <div className="min-w-0 space-y-4">
          {/* ── PROFILE ── */}
          <Panel as="form" onSubmit={saveProfile}>
            <SectionLabel>Profile</SectionLabel>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Display name"
                value={draft.name}
                onChange={set("name")}
                error={errors.name}
                maxLength={255}
                autoComplete="name"
              />
              <Field
                label="Business name"
                value={draft.business_name}
                onChange={set("business_name")}
                error={errors.business_name}
                maxLength={255}
                hint="Saving this also replaces your display name — that’s how the API behaves."
              />
              <Field
                label="First name"
                value={draft.first_name}
                onChange={set("first_name")}
                error={errors.first_name}
                autoComplete="given-name"
              />
              <Field
                label="Last name"
                value={draft.last_name}
                onChange={set("last_name")}
                error={errors.last_name}
                autoComplete="family-name"
              />
              <Field
                label="Email"
                type="email"
                value={draft.email}
                onChange={set("email")}
                error={errors.email}
                autoComplete="email"
                required
              />
              <Field
                label="Phone"
                type="tel"
                value={draft.phone}
                onChange={set("phone")}
                error={errors.phone}
                maxLength={30}
                autoComplete="tel"
              />
              <Field
                label="Country"
                value={draft.country}
                onChange={set("country")}
                error={errors.country}
                autoComplete="country-name"
              />
              <Field
                label="City"
                value={draft.city}
                onChange={set("city")}
                error={errors.city}
                autoComplete="address-level2"
              />
              <Field
                label="Address"
                value={draft.address_line_1}
                onChange={set("address_line_1")}
                error={errors.address_line_1}
                autoComplete="address-line1"
                className="sm:col-span-2"
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="mt-5 rounded-[11px] border border-clay/30 bg-clay/[0.07] px-3.5 py-2.5 text-[0.8125rem] font-medium text-clay"
              >
                {formError}
              </p>
            )}

            <div className="mt-6 flex items-center gap-4">
              <Button type="submit" busy={saving} disabled={!dirty}>
                Save changes
              </Button>
              {saved && (
                <p
                  role="status"
                  className="flex items-center gap-1.5 text-[0.8125rem] font-bold text-lime"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  Saved
                </p>
              )}
            </div>
          </Panel>

          {/* ── PASSWORD ── */}
          <Panel as="form" onSubmit={savePassword}>
            <SectionLabel>Password</SectionLabel>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field
                label="Current password"
                type="password"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                error={pwErrors.current}
                autoComplete="current-password"
              />
              <Field
                label="New password"
                type="password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                error={pwErrors.next}
                autoComplete="new-password"
                hint="At least 6 characters"
              />
              <Field
                label="Confirm new password"
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                error={pwErrors.confirm}
                autoComplete="new-password"
              />
            </div>

            {pwError && (
              <p
                role="alert"
                className="mt-5 rounded-[11px] border border-clay/30 bg-clay/[0.07] px-3.5 py-2.5 text-[0.8125rem] font-medium text-clay"
              >
                {pwError}
              </p>
            )}

            <div className="mt-6 flex items-center gap-4">
              <Button type="submit" variant="ghost" busy={pwBusy}>
                Update password
              </Button>
              {pwDone && (
                <p
                  role="status"
                  className="flex items-center gap-1.5 text-[0.8125rem] font-bold text-lime"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  Password updated
                </p>
              )}
            </div>
          </Panel>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="min-w-0 space-y-4">
          <Panel>
            <SectionLabel>Profile photo</SectionLabel>
            <div className="mt-4 flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-volt/20 text-[1.125rem] font-bold text-volt-lit"
                  aria-hidden
                >
                  {user.name.trim().charAt(0).toUpperCase() || "•"}
                </span>
              )}
              <div className="min-w-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  busy={avatarBusy}
                  onClick={() => avatarInput.current?.click()}
                >
                  <Camera className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
                  {user.avatar ? "Replace" : "Upload"}
                </Button>
                <p className="mt-2 text-[0.6875rem] font-medium text-white/25">
                  JPG or PNG, up to 2 MB
                </p>
              </div>
            </div>

            <input
              ref={avatarInput}
              type="file"
              accept="image/*"
              onChange={onAvatar}
              className="sr-only"
              aria-label="Profile photo"
            />

            {avatarError && (
              <p role="alert" className="mt-3 text-[0.75rem] font-medium text-clay">
                {avatarError}
              </p>
            )}
          </Panel>

          <Panel>
            <SectionLabel>Account</SectionLabel>
            <dl className="mt-3">
              {(
                [
                  ["Account ID", `#${user.id}`],
                  [
                    "Member since",
                    new Date(user.created_at).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                  ],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 border-t border-white/[0.06] py-3"
                >
                  <dt className="text-[0.8125rem] font-medium text-white/40">{label}</dt>
                  <dd className="text-[0.8125rem] font-semibold text-white">{value}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 border-t border-white/[0.06] py-3">
                <dt className="text-[0.8125rem] font-medium text-white/40">Email</dt>
                <dd>
                  <Badge tone={verified ? "positive" : "attention"}>
                    {verified ? "Verified" : "Not verified"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Panel>

          <Notice tone="neutral" title="Deleting your account">
            The API can delete and archive an account, but that action isn’t
            exposed here. Contact 2K Tunes support if you need it.
          </Notice>
        </aside>
      </div>
    </>
  );
}
