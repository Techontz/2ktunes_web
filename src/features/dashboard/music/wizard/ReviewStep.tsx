import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, Info, Send } from "lucide-react";
import { Button, Card, Checkbox, useToast } from "@/components/ui";
import { submitRelease, updateRelease } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { DefinitionList, FormAlert, InlineLoading, Section } from "../../components";
import { COPY } from "../copy";
import { ReleaseCover, useIssueText } from "../shared";
import { useReportSaver, useWizard } from "./context";
import { useAutosave } from "./useAutosave";
import { SERVER_STEP, WIZARD_STEPS, serverIssuesByStep, validateAgreements, type WizardStep } from "./validation";

const OPTIONAL_AGREEMENTS = ["no_ai_misrepresentation"];

export function ReviewStep({ stepLabel }: { stepLabel: (s: WizardStep) => string }) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const toMessage = useErrorMessage();
  const issueText = useIssueText();
  const { release, setRelease, config, validation, refreshValidation, goTo, flushAll, stores } = useWizard();

  const agreementKeys = useMemo(
    () => [...config.required_agreements, ...OPTIONAL_AGREEMENTS.filter((a) => !config.required_agreements.includes(a))],
    [config.required_agreements],
  );
  const [agreements, setAgreements] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(agreementKeys.map((k) => [k, release?.agreements?.[k] === true])),
  );
  const [links, setLinks] = useState(() => ({
    smart_link_enabled: release?.smart_link_enabled ?? true,
    presave_enabled: release?.presave_enabled ?? false,
  }));
  const [problem, setProblem] = useState<null | "plan" | string>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAgreementErrors, setShowAgreementErrors] = useState(false);

  const auto = useAutosave(
    { agreements, ...links },
    async (v) => {
      setRelease(await updateRelease(release!.id, v));
      await refreshValidation();
    },
    { delay: 600 },
  );
  useReportSaver("review", auto);

  useEffect(() => {
    void refreshValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!release) return null;
  const byStep = serverIssuesByStep(validation);
  const missingAgreements = validateAgreements(agreements, config.required_agreements);
  const storeName = (slug: string) => stores.find((s) => s.slug === slug)?.name ?? slug;

  const submit = async () => {
    setProblem(null);
    setShowAgreementErrors(true);
    if (missingAgreements.length) return;
    setSubmitting(true);
    try {
      if (!(await flushAll())) return;
      await refreshValidation();
      await submitRelease(release.id);
      toast({ title: c.submitted, tone: "success" });
      navigate(`/dashboard/music/${release.id}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "subscription_required") setProblem("plan");
      else if (err instanceof ApiError && err.code === "release_incomplete") {
        await refreshValidation();
        setProblem(err.message);
      } else setProblem(toMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const stepsWithErrors = WIZARD_STEPS.filter((s) => byStep[s].length > 0);
  const ready = validation?.ready === true;

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
          <ReleaseCover src={release.cover_image} title={release.release_title} size="md" />
          <div className="min-w-0">
            <h3 className="break-words text-h3 font-bold">
              {release.release_title}
              {release.version && <span className="font-normal text-text-subtle"> ({release.version})</span>}
            </h3>
            <p className="text-body-sm text-text-muted">
              {release.release_type} · {c.by(release.artist_name || "—")}
            </p>
            <DefinitionList
              className="mt-4"
              columns={3}
              items={[
                { label: c.fReleaseDate, value: formatDate(release.release_date, locale) },
                { label: c.stepTracks, value: c.summaryTracks(release.tracks?.length ?? 0) },
                {
                  label: c.stepStores,
                  value: release.platforms.length ? `${c.summaryStores(release.platforms.length)}: ${release.platforms.map(storeName).join(", ")}` : c.none,
                },
                { label: c.fGenre, value: release.primary_genre || c.none },
                { label: c.fLabel, value: release.record_label || c.none },
                { label: c.fUpc, value: release.upc || c.upcPending },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card>
        <Section level={3} title={c.reviewTitle} description={c.reviewBody}>
          <div aria-live="polite">
            {!validation ? (
              <InlineLoading label={c.checking} />
            ) : ready ? (
              <p className="flex items-center gap-2 text-body-sm font-semibold text-success">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
                {c.readyTitle} — <span className="font-normal text-text-muted">{c.readyBody}</span>
              </p>
            ) : (
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-body-sm font-semibold text-warning">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                  {c.notReady}
                </p>
                {stepsWithErrors.map((s) => (
                  <div key={s} className="rounded-control border border-border-subtle p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{stepLabel(s)}</h3>
                      {s !== "review" && (
                        <Button size="sm" variant="secondary" onClick={() => goTo(s)}>
                          {c.goToStep}: {stepLabel(s)}
                        </Button>
                      )}
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-body-sm text-text-muted">
                      {byStep[s].map((e, i) => (
                        <li key={i}>{e.message}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {!!validation?.warnings.length && (
              <div className="mt-5">
                <h3 className="flex items-center gap-2 text-body-sm font-semibold text-text-muted">
                  <Info className="h-4 w-4" aria-hidden />
                  {c.warnings}
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-body-sm text-text-subtle">
                  {validation.warnings.map((w, i) => (
                    <li key={i}>
                      {w.message}{" "}
                      {SERVER_STEP[w.step] && SERVER_STEP[w.step] !== "review" && (
                        <button type="button" className="font-semibold text-accent-text underline-offset-2 hover:underline" onClick={() => goTo(SERVER_STEP[w.step])}>
                          {stepLabel(SERVER_STEP[w.step])}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      </Card>

      <Card>
        <Section level={3} title={c.smartLinkSettings}>
          <div className="space-y-3">
            <Checkbox
              label={c.smartLinkToggle}
              description={c.smartLinkToggleHint}
              checked={links.smart_link_enabled}
              onChange={(e) => setLinks((l) => ({ ...l, smart_link_enabled: e.target.checked, presave_enabled: e.target.checked && l.presave_enabled }))}
            />
            <Checkbox
              label={c.presaveToggle}
              description={c.presaveToggleHint}
              checked={links.presave_enabled}
              disabled={!links.smart_link_enabled}
              onChange={(e) => setLinks((l) => ({ ...l, presave_enabled: e.target.checked }))}
            />
          </div>
        </Section>
      </Card>

      <Card>
        <Section level={3} title={c.agreementsTitle}>
          <div className="space-y-3">
            {agreementKeys.map((k) => {
              const label = (c as unknown as Record<string, string>)[`agree_${k}`] ?? k.replace(/_/g, " ");
              const required = config.required_agreements.includes(k);
              return (
                <Checkbox
                  key={k}
                  label={label}
                  required={required}
                  checked={agreements[k] === true}
                  error={showAgreementErrors && required && agreements[k] !== true ? issueText({ field: k, code: "agreement_missing" }) : null}
                  onChange={(e) => setAgreements((a) => ({ ...a, [k]: e.target.checked }))}
                />
              );
            })}
            <Link to="/legal/distribution-agreement" target="_blank" className="inline-block text-body-sm font-semibold text-accent-text underline-offset-2 hover:underline">
              {c.termsLink}
            </Link>
          </div>
        </Section>
      </Card>

      {problem && (
        <FormAlert tone={problem === "plan" ? "warning" : "danger"}>
          {problem === "plan" ? (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {c.subscriptionRequired}
              <Link to="/dashboard/plan" className="font-semibold text-accent-text underline underline-offset-2">
                {c.choosePlan}
              </Link>
            </span>
          ) : (
            problem
          )}
        </FormAlert>
      )}

      <div className="space-y-4 border-t border-border-subtle pt-5">
        <p className="text-body-sm text-text-muted">{c.submitHint}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => goTo("stores")}>
            {c.back}
          </Button>
          <Button leftIcon={<Send />} loading={submitting} disabled={!ready && !!validation} onClick={submit}>
            {c.submitRelease}
          </Button>
        </div>
      </div>
    </div>
  );
}

