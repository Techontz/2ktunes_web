import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Upload } from "lucide-react";
import { Avatar, Button, Checkbox, Field, Input, Textarea, useToast } from "@/components/ui";
import { CountrySelect } from "@/components/forms/CountrySelect";
import { ToggleChips } from "@/components/forms/ToggleChips";
import { FormAlert, useAction } from "@/features/dashboard/components";
import { languageOptions } from "@/lib/languages";
import { useLabels } from "@/features/dashboard/marketplace/labels";
import { saveMyCreatorProfile, uploadCreatorAvatar, type CreatorProfileInput } from "@/lib/api/marketplace";
import type { CreatorProfile, SocialAccount } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

const MAX_CATEGORIES = 8;
const MAX_LANGUAGES = 10;
const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** The profile fields of the PUT body, from a saved profile. */
export function profileFields(p: CreatorProfile): CreatorProfileInput {
  return {
    display_name: p.display_name,
    bio: p.bio,
    country: p.country,
    city: p.city,
    languages: p.languages ?? [],
    categories: p.categories ?? [],
    turnaround_days: p.turnaround_days,
    is_available: p.is_available,
  };
}

/** A saved social account in the PUT body shape (unchanged numbers keep their verification). */
export function socialFields(a: SocialAccount): NonNullable<CreatorProfileInput["social_accounts"]>[number] {
  return {
    platform: a.platform,
    handle: a.handle,
    url: a.url,
    followers: a.followers,
    avg_views: a.avg_views,
    engagement_rate_bp: a.engagement_rate_bp,
    audience_countries: a.audience_countries ?? [],
  };
}

/**
 * Create (profile === null) or edit the creator profile's own fields. Social
 * accounts are not sent here, so the API leaves them (and their verification)
 * untouched.
 */
export function ProfileForm({
  profile,
  categories,
  onSaved,
}: {
  profile: CreatorProfile | null;
  categories: string[];
  onSaved: (p: CreatorProfile) => void | Promise<void>;
}) {
  const c = useCopy(COPY);
  const { t, locale } = useLanguage();
  const labels = useLabels();
  const { toast } = useToast();
  const savedLanguages = profile?.languages;
  const langOptions = useMemo(() => languageOptions(locale, savedLanguages ?? []), [locale, savedLanguages]);
  const [f, setF] = useState(() => ({
    display_name: profile?.display_name ?? "",
    bio: profile?.bio ?? "",
    country: profile?.country ?? "",
    city: profile?.city ?? "",
    languages: (profile?.languages ?? []).map((l) => l.toLowerCase()),
    categories: profile?.categories ?? [],
    turnaround_days: profile?.turnaround_days != null ? String(profile.turnaround_days) : "",
    is_available: profile?.is_available ?? true,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useAction((input: CreatorProfileInput) => saveMyCreatorProfile(input));
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.display_name.trim()) errs.display_name = c.displayNameRequired;
    const country = f.country.trim().toUpperCase();
    if (country && !/^[A-Z]{2}$/.test(country)) errs.country = c.countryInvalid;
    const languages = f.languages;
    if (languages.length > MAX_LANGUAGES) errs.languages = c.languagesInvalid;
    if (f.categories.length > MAX_CATEGORIES) errs.categories = c.categoriesMax(MAX_CATEGORIES);
    let turnaround: number | null = null;
    if (f.turnaround_days.trim()) {
      const n = Number(f.turnaround_days.trim());
      if (!Number.isInteger(n) || n < 1 || n > 60) errs.turnaround_days = c.turnaroundInvalid;
      else turnaround = n;
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const res = await save.run({
      display_name: f.display_name.trim(),
      bio: f.bio.trim() || null,
      country: country || null,
      city: f.city.trim() || null,
      languages: Array.from(new Set(languages)),
      categories: f.categories,
      turnaround_days: turnaround,
      is_available: f.is_available,
    });
    if (res.ok) {
      toast(profile ? { title: c.saved, tone: "success" } : { title: c.started, description: c.startedBody, tone: "success" });
      await onSaved(res.value);
    }
  };

  const err = (k: string) => errors[k] ?? save.fieldErrors[k];
  const opt = { optional: true, optionalLabel: t("common.optional") };
  const toggleCategory = (cat: string, on: boolean) =>
    set({ categories: on ? [...f.categories, cat] : f.categories.filter((x) => x !== cat) });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.displayName} error={err("display_name")} required className="sm:col-span-2">
          <Input value={f.display_name} onChange={(e) => set({ display_name: e.target.value })} maxLength={80} autoComplete="nickname" />
        </Field>
        <Field label={c.bio} hint={c.bioHint} error={err("bio")} className="sm:col-span-2" {...opt}>
          <Textarea value={f.bio} onChange={(e) => set({ bio: e.target.value })} maxLength={2000} rows={5} />
        </Field>
        <Field label={c.country} hint={c.countryHint} error={err("country")} {...opt}>
          <CountrySelect value={f.country} onChange={(code) => set({ country: code })} />
        </Field>
        <Field label={c.city} error={err("city")} {...opt}>
          <Input value={f.city} onChange={(e) => set({ city: e.target.value })} maxLength={80} />
        </Field>
        <Field label={c.turnaround} error={err("turnaround_days")} {...opt}>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            value={f.turnaround_days}
            onChange={(e) => set({ turnaround_days: e.target.value })}
          />
        </Field>
      </div>

      <ToggleChips
        legend={c.languages}
        hint={c.languagesHint}
        options={langOptions}
        value={f.languages}
        onChange={(next) => set({ languages: next })}
        max={MAX_LANGUAGES}
        error={err("languages")}
      />

      <fieldset className="min-w-0">
        <legend className="text-body-sm font-semibold text-text">{c.categories}</legend>
        <p className="mt-1 text-caption text-text-subtle">{c.categoriesHint(MAX_CATEGORIES)}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Checkbox
              key={cat}
              label={labels.category(cat)}
              checked={f.categories.includes(cat)}
              onChange={(e) => toggleCategory(cat, e.target.checked)}
            />
          ))}
        </div>
        {err("categories") && (
          <p role="alert" className="mt-2 text-body-sm font-medium text-danger">
            {err("categories")}
          </p>
        )}
      </fieldset>

      <Checkbox
        label={c.available}
        description={c.availableHint}
        checked={f.is_available}
        onChange={(e) => set({ is_available: e.target.checked })}
      />

      {profile?.status === "approved" && <FormAlert tone="info">{c.reviewWarning}</FormAlert>}
      {save.error && <FormAlert>{save.error}</FormAlert>}
      <div className="flex justify-end">
        <Button type="submit" loading={save.pending}>
          {profile ? t("act.save_changes") : c.startCta}
        </Button>
      </div>
    </form>
  );
}

export function AvatarUpload({ profile, onSaved }: { profile: CreatorProfile; onSaved: (p: CreatorProfile) => void }) {
  const c = useCopy(COPY);
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useAction((file: File) => uploadCreatorAvatar(file));

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) return setError(c.avatarType);
    if (file.size > MAX_AVATAR_BYTES) return setError(c.avatarSize);
    setError(null);
    const res = await upload.run(file);
    if (res.ok) {
      toast({ title: c.avatarSaved, tone: "success" });
      onSaved(res.value);
    }
  };

  const message = error ?? upload.fieldErrors.avatar ?? upload.error;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar name={profile.display_name} src={profile.avatar_url} size="lg" />
      <div className="min-w-0">
        <p className="text-body-sm font-semibold text-text">{c.avatar}</p>
        <p className="text-caption text-text-subtle" id="creator-avatar-hint">
          {c.avatarHint}
        </p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={pick}
        />
        <Button
          variant="secondary"
          size="sm"
          className="mt-2"
          leftIcon={<Upload />}
          loading={upload.pending}
          aria-describedby="creator-avatar-hint"
          onClick={() => input.current?.click()}
        >
          {c.avatarChoose}
        </Button>
        {message && (
          <p role="alert" className="mt-2 text-body-sm font-medium text-danger">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
