import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Button, Card, Checkbox, Field, Input, RadioCardGroup, Select } from "@/components/ui";
import { createRelease, updateRelease, type ReleasePatch } from "@/lib/api/catalog";
import { fieldErrorsOf } from "@/lib/api/errors";
import type { Release, ReleaseType } from "@/lib/api/types";
import { todayIso } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { FormAlert, Section, useAction } from "../../components";
import { COPY } from "../copy";
import { useIssueText } from "../shared";
import { useReportSaver, useWizard } from "./context";
import { StepFooter } from "./StepFooter";
import { useAutosave } from "./useAutosave";
import { addDays, firstByField, validateInfo, type InfoValues } from "./validation";

type Extra = { name: string; role: "primary_artist" | "featured_artist" | "remixer" };
type Form = InfoValues & { additional_artists: Extra[] };

const YEAR = String(new Date().getFullYear());

function fromRelease(r: Release | null, fallbackArtist: { id: number; name: string } | null): Form {
  return {
    release_type: r?.release_type ?? "",
    release_title: r?.release_title ?? "",
    artist_id: r ? r.artist_id : (fallbackArtist?.id ?? null),
    artist_name: r?.artist_name ?? fallbackArtist?.name ?? "",
    version: r?.version ?? "",
    primary_genre: r?.primary_genre ?? "",
    secondary_genre: r?.secondary_genre ?? "",
    language: r?.language ?? "",
    release_date: r?.release_date ?? "",
    previously_released: r?.previously_released ?? false,
    original_release_date: r?.original_release_date ?? "",
    record_label: r?.record_label ?? "",
    c_line_year: r?.c_line_year != null ? String(r.c_line_year) : YEAR,
    c_line_owner: r?.c_line_owner ?? fallbackArtist?.name ?? "",
    p_line_year: r?.p_line_year != null ? String(r.p_line_year) : YEAR,
    p_line_owner: r?.p_line_owner ?? fallbackArtist?.name ?? "",
    upc: r?.upc && !r.upc_generated ? r.upc : "",
    additional_artists: (r?.additional_artists ?? []).map((a) => ({
      name: a.name,
      role: (["primary_artist", "featured_artist", "remixer"].includes(a.role) ? a.role : "featured_artist") as Extra["role"],
    })),
  };
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const nul = (s: string) => (s.trim() === "" ? null : s.trim());

/**
 * The PATCH body for autosave. Values the server would reject as malformed
 * while still being typed (a 2-digit year, a half date) are left out rather
 * than failing the whole save; the step's own validation reports them.
 */
export function infoPatch(f: Form): ReleasePatch {
  const patch: ReleasePatch = {
    release_title: f.release_title.trim(),
    version: nul(f.version),
    primary_genre: nul(f.primary_genre),
    secondary_genre: nul(f.secondary_genre),
    language: nul(f.language),
    previously_released: f.previously_released,
    record_label: nul(f.record_label),
    c_line_owner: nul(f.c_line_owner),
    p_line_owner: nul(f.p_line_owner),
    upc: nul(f.upc),
    additional_artists: f.additional_artists.filter((a) => a.name.trim()).map((a) => ({ name: a.name.trim(), role: a.role })),
  };
  if (f.release_type) patch.release_type = f.release_type;
  if (f.artist_id) patch.artist_id = f.artist_id;
  else patch.artist_name = nul(f.artist_name);
  if (f.release_date === "" || DATE.test(f.release_date)) patch.release_date = nul(f.release_date);
  if (f.original_release_date === "" || DATE.test(f.original_release_date)) patch.original_release_date = nul(f.original_release_date);
  if (f.c_line_year === "" || /^\d{4}$/.test(f.c_line_year)) patch.c_line_year = nul(f.c_line_year);
  if (f.p_line_year === "" || /^\d{4}$/.test(f.p_line_year)) patch.p_line_year = nul(f.p_line_year);
  if (!patch.release_title) delete patch.release_title;
  return patch;
}

function languageName(code: string, fallback: string, locale: string): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "language" });
    const name = dn.of(code);
    return name && name !== code ? name.charAt(0).toUpperCase() + name.slice(1) : fallback;
  } catch {
    return fallback;
  }
}

export function InfoStep() {
  const c = useCopy(COPY);
  const { locale, t } = useLanguage();
  const navigate = useNavigate();
  const issueText = useIssueText();
  const { release, setRelease, config, artists, goTo } = useWizard();
  const [form, setForm] = useState<Form>(() => fromRelease(release, artists[0] ?? null));
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const auto = useAutosave(
    form,
    async (f) => {
      try {
        const updated = await updateRelease(release!.id, infoPatch(f));
        setServerErrors({});
        setRelease(updated);
      } catch (err) {
        setServerErrors(fieldErrorsOf(err));
        throw err;
      }
    },
    { enabled: !!release?.is_editable, delay: 1200 },
  );
  useReportSaver("info", auto);

  const today = todayIso();
  const issues = useMemo(() => validateInfo(form, { today, minLeadDays: config.min_lead_days }), [form, today, config.min_lead_days]);
  const byField = firstByField(issues);
  const err = (field: string) => serverErrors[field] ?? (showErrors ? issueText(byField[field]) : undefined);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Fill empty © / ℗ owners from the chosen artist.
  const chooseArtist = (id: number | null) => {
    const a = artists.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      artist_id: id,
      artist_name: a?.name ?? f.artist_name,
      c_line_owner: f.c_line_owner || a?.name || "",
      p_line_owner: f.p_line_owner || a?.name || "",
    }));
  };

  const create = useAction(async () => {
    const patch = infoPatch(form);
    const r = await createRelease({
      ...patch,
      release_type: form.release_type as ReleaseType,
      release_title: form.release_title.trim(),
      draft_step: "artwork",
    });
    return r;
  });

  useEffect(() => {
    if (create.fieldErrors && Object.keys(create.fieldErrors).length) setServerErrors(create.fieldErrors);
  }, [create.fieldErrors]);

  const next = async () => {
    setShowErrors(true);
    if (issues.length) {
      document.getElementById(`wiz-${issues[0].field}`)?.focus();
      return;
    }
    if (!release) {
      const res = await create.run();
      if (res.ok) {
        setRelease(res.value);
        navigate(`/dashboard/music/${res.value.id}/edit?step=artwork`, { replace: true });
      }
      return;
    }
    if (await auto.flush()) goTo("artwork");
  };

  const earliest = addDays(today, config.min_lead_days);
  const bounds = config.tracks;

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <RadioCardGroup<ReleaseType>
            legend={c.releaseType}
            name="release_type"
            value={(form.release_type || null) as ReleaseType | null}
            onChange={(v) => set("release_type", v)}
            columns={3}
            error={err("release_type")}
            options={(["Single", "EP", "Album"] as ReleaseType[]).map((t) => ({
              value: t,
              label: t === "Single" ? c.typeSingle : t === "EP" ? c.typeEP : c.typeAlbum,
              description: bounds?.[t] ? c.typeRange(bounds[t].min, bounds[t].max) : undefined,
            }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={c.releaseTitle} hint={c.releaseTitleHint} error={err("release_title")} id="wiz-release_title" required>
              <Input value={form.release_title} maxLength={255} onChange={(e) => set("release_title", e.target.value)} />
            </Field>
            <Field label={c.version_} hint={c.versionHint} optional optionalLabel={t("common.optional")} error={err("version")}>
              <Input value={form.version} maxLength={120} onChange={(e) => set("version", e.target.value)} />
            </Field>
          </div>
          {artists.length > 0 ? (
            <Field label={c.primaryArtist} error={err("artist") ?? err("artist_id") ?? err("artist_name")} id="wiz-artist" required>
              <Select
                value={form.artist_id ? String(form.artist_id) : ""}
                onChange={(e) => chooseArtist(e.target.value ? Number(e.target.value) : null)}
                placeholder={c.chooseArtist}
              >
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <div className="space-y-2">
              <Field label={c.typedArtist} error={err("artist") ?? err("artist_name")} id="wiz-artist" required>
                <Input value={form.artist_name} maxLength={255} onChange={(e) => set("artist_name", e.target.value)} />
              </Field>
              <p className="text-caption text-text-subtle">
                {c.noArtistProfiles}{" "}
                <Button variant="ghost" size="sm" to="/dashboard/artists" className="h-auto px-1 text-accent-text">
                  {c.createArtistProfile}
                </Button>
              </p>
            </div>
          )}
          <AdditionalArtists value={form.additional_artists} onChange={(v) => set("additional_artists", v)} />
        </div>
      </Card>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.primaryGenre} error={err("primary_genre")} id="wiz-primary_genre" required>
            <Select value={form.primary_genre} onChange={(e) => set("primary_genre", e.target.value)} placeholder={c.chooseGenre}>
              {config.genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.secondaryGenre} optional optionalLabel={t("common.optional")} error={err("secondary_genre")}>
            <Select value={form.secondary_genre} onChange={(e) => set("secondary_genre", e.target.value)}>
              <option value="">—</option>
              {config.genres
                .filter((g) => g !== form.primary_genre)
                .map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label={c.language} error={err("language")} id="wiz-language" required>
            <Select value={form.language} onChange={(e) => set("language", e.target.value)} placeholder={c.chooseLanguage}>
              {Object.entries(config.languages).map(([code, name]) => (
                <option key={code} value={code}>
                  {languageName(code, name, locale)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={c.recordLabel} hint={c.recordLabelHint} optional optionalLabel={t("common.optional")} error={err("record_label")}>
            <Input value={form.record_label} maxLength={255} onChange={(e) => set("record_label", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={c.releaseDate}
            hint={c.releaseDateHint(config.min_lead_days, config.recommended_lead_days)}
            error={err("release_date")}
            id="wiz-release_date"
            required
          >
            <Input
              type="date"
              value={form.release_date}
              min={form.previously_released ? undefined : earliest}
              onChange={(e) => set("release_date", e.target.value)}
            />
          </Field>
          <div className="space-y-4 sm:pt-7">
            <Checkbox
              label={c.previouslyReleased}
              description={c.previouslyReleasedHint}
              checked={form.previously_released}
              onChange={(e) => set("previously_released", e.target.checked)}
            />
          </div>
          {form.previously_released && (
            <Field label={c.originalReleaseDate} error={err("original_release_date")} id="wiz-original_release_date" required>
              <Input
                type="date"
                value={form.original_release_date}
                max={today}
                onChange={(e) => set("original_release_date", e.target.value)}
              />
            </Field>
          )}
        </div>
      </Card>

      <Card>
        <Section level={3} title={c.rightsTitle} description={c.rightsBody}>
          <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <Field label={c.cLineYear} error={err("c_line_year")} id="wiz-c_line_year" required>
              <Input inputMode="numeric" maxLength={4} value={form.c_line_year} onChange={(e) => set("c_line_year", e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label={c.cLineOwner} error={err("c_line_owner")} id="wiz-c_line_owner" required>
              <Input value={form.c_line_owner} maxLength={255} onChange={(e) => set("c_line_owner", e.target.value)} />
            </Field>
            <Field label={c.pLineYear} error={err("p_line_year")} id="wiz-p_line_year" required>
              <Input inputMode="numeric" maxLength={4} value={form.p_line_year} onChange={(e) => set("p_line_year", e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label={c.pLineOwner} error={err("p_line_owner")} id="wiz-p_line_owner" required>
              <Input value={form.p_line_owner} maxLength={255} onChange={(e) => set("p_line_owner", e.target.value)} />
            </Field>
          </div>
          <Field
            label={c.upc}
            hint={config.upc_generation ? c.upcHintGenerate : c.upcHintManual}
            optional
            optionalLabel={t("common.optional")}
            error={err("upc")}
            id="wiz-upc"
            className="mt-4 sm:max-w-sm"
          >
            <Input inputMode="numeric" maxLength={14} value={form.upc} onChange={(e) => set("upc", e.target.value.replace(/[^\d]/g, ""))} />
          </Field>
        </Section>
      </Card>

      {create.error && <FormAlert>{create.error}</FormAlert>}
      <StepFooter onNext={next} nextLabel={release ? c.saveAndContinue : c.createDraft} pending={create.pending} />
    </div>
  );
}

function AdditionalArtists({ value, onChange }: { value: Extra[]; onChange: (v: Extra[]) => void }) {
  const c = useCopy(COPY);
  const roles: Extra["role"][] = ["featured_artist", "primary_artist", "remixer"];
  const label = (r: Extra["role"]) =>
    r === "primary_artist" ? c.role_primary_artist : r === "featured_artist" ? c.role_featured_artist : c.role_remixer;
  return (
    <fieldset className="min-w-0">
      <legend className="text-[0.875rem] font-semibold text-text-muted">{c.additionalArtists}</legend>
      <p className="mt-1 text-caption text-text-subtle">{c.additionalArtistsHint}</p>
      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((a, i) => (
            <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
              <Field label={c.artistName} labelHidden className="col-span-2 sm:col-span-1">
                <Input
                  value={a.name}
                  placeholder={c.artistName}
                  onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                />
              </Field>
              <Field label={c.artistRole} labelHidden>
                <Select
                  value={a.role}
                  aria-label={c.artistRole}
                  onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, role: e.target.value as Extra["role"] } : x)))}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {label(r)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button
                variant="ghost"
                aria-label={c.removeArtist(a.name)}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="w-11 px-0"
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        variant="secondary"
        size="sm"
        className="mt-3"
        leftIcon={<Plus />}
        onClick={() => onChange([...value, { name: "", role: "featured_artist" }])}
      >
        {c.addArtist}
      </Button>
    </fieldset>
  );
}
