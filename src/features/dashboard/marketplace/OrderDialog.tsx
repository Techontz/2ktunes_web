import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, Field, Input, RadioCardGroup, Select, Textarea, useToast } from "@/components/ui";
import { FormAlert, InlineLoading, LoadError, Money, useAction } from "@/features/dashboard/components";
import { fetchReleaseConfig, fetchReleases } from "@/lib/api/catalog";
import { createCampaign, createOrder, fetchCampaigns } from "@/lib/api/marketplace";
import type { CampaignType } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { useLabels } from "./labels";

export type OrderTarget =
  | { kind: "package"; id: number; title: string; priceMinor: number; currency: string; disclaimer?: null }
  | { kind: "service"; id: number; title: string; priceMinor: number; currency: string; disclaimer?: string | null };

const CLOSED = ["cancelled", "completed"];

/**
 * Place an order for a creator package or a promotion service: pick one of
 * the user's open campaigns (or quick-create one), add a brief, create the
 * order, then go to the order page where payment happens.
 */
export function OrderDialog({
  open,
  onClose,
  target,
  defaultCampaignId,
}: {
  open: boolean;
  onClose: () => void;
  target: OrderTarget | null;
  defaultCampaignId?: string | null;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  return (
    <Dialog
      open={open && !!target}
      onClose={onClose}
      title={target ? c.orderDialogTitle(target.title) : ""}
      description={c.orderDialogIntro}
      closeLabel={t("common.close")}
      size="lg"
    >
      {open && target && <OrderForm target={target} defaultCampaignId={defaultCampaignId} onClose={onClose} />}
    </Dialog>
  );
}

function OrderForm({
  target,
  defaultCampaignId,
  onClose,
}: {
  target: OrderTarget;
  defaultCampaignId?: string | null;
  onClose: () => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const navigate = useNavigate();
  const { toast } = useToast();

  const data = useResource(
    async (signal) => {
      const [campaigns, releases, config] = await Promise.all([
        fetchCampaigns(1, { signal }),
        fetchReleases({ per_page: 100 }, { signal }),
        fetchReleaseConfig(),
      ]);
      return {
        campaigns: campaigns.campaigns.filter((x) => !CLOSED.includes(x.status)),
        releases: releases.releases,
        types: config.marketplace.campaign_types,
      };
    },
    [],
  );

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [campaignId, setCampaignId] = useState<string>(defaultCampaignId ?? "");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>(target.kind === "package" ? "creator_campaign" : "marketing_package");
  const [releaseId, setReleaseId] = useState("");
  const [brief, setBrief] = useState("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const created = useRef<number | null>(null);
  const [createdNote, setCreatedNote] = useState(false);

  // Once campaigns load: preselect the requested one, or fall back to "new".
  useEffect(() => {
    if (!data.data) return;
    const list = data.data.campaigns;
    if (list.length === 0) setMode("new");
    else if (defaultCampaignId && list.some((x) => String(x.id) === defaultCampaignId)) setCampaignId(defaultCampaignId);
    else if (!campaignId) setCampaignId(String(list[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.data]);

  const place = useAction(async () => {
    let id: number;
    if (mode === "existing") {
      id = Number(campaignId);
    } else if (created.current) {
      id = created.current;
    } else {
      const campaign = await createCampaign({
        title: title.trim(),
        type: type as CampaignType,
        release_id: releaseId ? Number(releaseId) : null,
        brief: brief.trim() || null,
      });
      created.current = campaign.id;
      id = campaign.id;
    }
    const body = brief.trim() || null;
    return target.kind === "package"
      ? createOrder(id, { creator_package_id: target.id, brief: body })
      : createOrder(id, { promotion_service_id: target.id, brief: body });
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === "existing" && !campaignId) errs.campaign = c.campaignRequired;
    if (mode === "new" && !created.current && !title.trim()) errs.title = c.campaignTitleRequired;
    setLocalErrors(errs);
    if (Object.keys(errs).length) return;
    const res = await place.run();
    if (res.ok) {
      toast({ title: c.orderCreated, description: c.orderCreatedBody, tone: "success" });
      onClose();
      navigate(`/dashboard/orders/${res.value.id}`);
    } else if (created.current) {
      setCreatedNote(true);
    }
  };

  if (data.loading) return <InlineLoading />;
  if (data.error) return <LoadError error={data.error} onRetry={data.reload} compact />;
  const d = data.data!;

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-control border border-border-subtle bg-surface-sunken px-4 py-3">
        <span className="min-w-0 break-words text-body-sm font-semibold text-text">{target.title}</span>
        <Money minor={target.priceMinor} currency={target.currency} className="text-body-sm font-bold text-text" />
      </div>
      {target.disclaimer && <FormAlert tone="info">{target.disclaimer}</FormAlert>}

      {!created.current && (
        <RadioCardGroup
          legend={c.campaignChoice}
          name="order-campaign-mode"
          value={mode}
          onChange={(v) => setMode(v)}
          columns={2}
          options={[
            { value: "existing", label: c.useExisting, description: d.campaigns.length === 0 ? c.noOpenCampaigns : undefined },
            { value: "new", label: c.createNew },
          ]}
        />
      )}

      {mode === "existing" && !created.current ? (
        d.campaigns.length === 0 ? (
          <p className="text-body-sm text-text-subtle">{c.noOpenCampaigns}</p>
        ) : (
          <Field label={c.chooseCampaign} error={localErrors.campaign} required>
            <Select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} placeholder={c.chooseCampaign}>
              {d.campaigns.map((x) => (
                <option key={x.id} value={String(x.id)}>
                  {x.title} · {labels.campaignType(x.type)}
                </option>
              ))}
            </Select>
          </Field>
        )
      ) : (
        !created.current && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={c.campaignTitle} error={localErrors.title ?? place.fieldErrors.title} required className="sm:col-span-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            </Field>
            <Field label={c.campaignType} error={place.fieldErrors.type} required>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {d.types.map((x) => (
                  <option key={x} value={x}>
                    {labels.campaignType(x)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={c.release} optional optionalLabel={t("common.optional")} error={place.fieldErrors.release_id}>
              <Select value={releaseId} onChange={(e) => setReleaseId(e.target.value)}>
                <option value="">{c.noRelease}</option>
                {d.releases.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.release_title} · {r.artist_name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )
      )}

      <Field label={c.brief} hint={c.briefHint} optional optionalLabel={t("common.optional")} error={place.fieldErrors.brief}>
        <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={5000} rows={5} />
      </Field>

      {createdNote && <FormAlert tone="info">{c.campaignKept}</FormAlert>}
      {place.error && <FormAlert>{place.error}</FormAlert>}
      <p className="text-caption text-text-subtle">{c.payNext}</p>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={place.pending}>
          {t("act.cancel")}
        </Button>
        <Button type="submit" loading={place.pending}>
          {c.placeOrder}
        </Button>
      </div>
    </form>
  );
}
