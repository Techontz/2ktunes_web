import { useMemo, useState } from "react";
import { Badge, Button, Card, Checkbox, Field, RadioCardGroup } from "@/components/ui";
import { CountrySelect } from "@/components/forms/CountrySelect";
import { updateRelease } from "@/lib/api/catalog";
import { fieldErrorsOf } from "@/lib/api/errors";
import type { Territories } from "@/lib/api/types";
import { useCopy } from "@/lib/useCopy";
import { FormAlert, Section } from "../../components";
import { COPY } from "../copy";
import { useIssueText } from "../shared";
import { useReportSaver, useWizard } from "./context";
import { StepFooter } from "./StepFooter";
import { useAutosave } from "./useAutosave";
import { firstByField, validateStores } from "./validation";

export function StoresStep() {
  const c = useCopy(COPY);
  const issueText = useIssueText();
  const { release, setRelease, stores, goTo } = useWizard();
  const available = useMemo(() => stores.filter((s) => s.status === "available").map((s) => s.slug), [stores]);
  const [platforms, setPlatforms] = useState<string[]>(() => release?.platforms ?? []);
  const [mode, setMode] = useState<Territories["mode"]>(() => release?.territories?.mode ?? "worldwide");
  const [countries, setCountries] = useState<string[]>(() =>
    (release?.territories?.countries ?? []).map((x) => x.toUpperCase()),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const territories: Territories = { mode, countries: mode === "worldwide" ? [] : countries };
  const issues = validateStores({ platforms, territories }, available);
  const by = firstByField(issues);

  // The picker only yields ISO-2 codes; the filter guards legacy saved values.
  const payload = {
    platforms: platforms.filter((p) => available.includes(p)),
    territories: { mode, countries: territories.countries.filter((x) => /^[A-Z]{2}$/.test(x)) },
  };
  const auto = useAutosave(
    payload,
    async (p) => {
      try {
        setRelease(await updateRelease(release!.id, p));
        setServerErrors({});
      } catch (err) {
        setServerErrors(fieldErrorsOf(err));
        throw err;
      }
    },
    { delay: 900 },
  );
  useReportSaver("stores", auto);

  if (!release) return null;
  const groups = stores.reduce<Record<string, typeof stores>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const toggle = (slug: string, on: boolean) =>
    setPlatforms((p) => (on ? [...new Set([...p, slug])] : p.filter((x) => x !== slug)));

  return (
    <div className="space-y-6">
      <Card>
        <Section level={3}
          title={c.storesTitle}
          description={c.storesBody}
          action={
            <>
              <Button size="sm" variant="secondary" onClick={() => setPlatforms(available)}>
                {c.selectAll}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPlatforms([])}>
                {c.clearAll}
              </Button>
            </>
          }
        >
          {(showErrors ? issueText(by.platforms) : null) || serverErrors.platforms ? (
            <FormAlert className="mb-4">{serverErrors.platforms ?? issueText(by.platforms)}</FormAlert>
          ) : null}
          <div className="space-y-6">
            {Object.entries(groups).map(([cat, list]) => (
              <fieldset key={cat} className="min-w-0">
                <legend className="mb-3 text-caption font-bold uppercase tracking-[0.1em] text-text-subtle">
                  {c.storeCategories[cat] ?? cat}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((s) =>
                    s.status === "available" ? (
                      <div key={s.slug} className="rounded-control border border-border-subtle px-3 py-2.5">
                        <Checkbox label={s.name} checked={platforms.includes(s.slug)} onChange={(e) => toggle(s.slug, e.target.checked)} />
                      </div>
                    ) : (
                      <div
                        key={s.slug}
                        className="flex items-center justify-between gap-2 rounded-control border border-dashed border-border-subtle px-3 py-2.5 text-text-subtle"
                      >
                        <span className="min-w-0 truncate text-[0.9375rem]">{s.name}</span>
                        <Badge size="sm">{c.comingSoon}</Badge>
                      </div>
                    ),
                  )}
                </div>
              </fieldset>
            ))}
          </div>
        </Section>
      </Card>

      <Card>
        <Section level={3} title={c.territoriesTitle}>
          <RadioCardGroup<Territories["mode"]>
            legend={c.territoriesTitle}
            name="territories"
            value={mode}
            onChange={setMode}
            columns={3}
            options={[
              { value: "worldwide", label: c.terrWorldwide, description: c.terrWorldwideDesc },
              { value: "include", label: c.terrInclude, description: c.terrIncludeDesc },
              { value: "exclude", label: c.terrExclude, description: c.terrExcludeDesc },
            ]}
          />
          {mode !== "worldwide" && (
            <Field
              label={c.countries}
              hint={c.countriesHint}
              className="mt-4 sm:max-w-lg"
              error={serverErrors["territories.countries"] ?? (showErrors ? issueText(by.territories) : undefined)}
            >
              <CountrySelect multiple value={countries} onChange={setCountries} />
            </Field>
          )}
        </Section>
      </Card>

      <StepFooter
        onBack={() => goTo("credits")}
        onNext={async () => {
          setShowErrors(true);
          if (issues.length === 0 && (await auto.flush())) goTo("review");
        }}
      />
    </div>
  );
}
