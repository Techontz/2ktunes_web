import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, Plus, Search, XCircle } from "lucide-react";
import { Button, Card, Dialog, EmptyState, Field, Select, Textarea, useToast } from "@/components/ui";
import {
  ConfirmDialog,
  DefinitionList,
  FormAlert,
  InlineLoading,
  LoadError,
  Money,
  PageHeader,
  PageLoading,
  Section,
  StatusPill,
  useAction,
} from "@/features/dashboard/components";
import { countryName, useLabels } from "@/features/dashboard/marketplace/labels";
import { cancelCampaign, createOrder, fetchCampaign, fetchPromotionServices } from "@/lib/api/marketplace";
import type { Campaign } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { CampaignFormDialog } from "./CampaignFormDialog";
import { COPY } from "./copy";

const CLOSED = ["completed", "cancelled"];

export default function CampaignDetailPage() {
  const { id = "" } = useParams();
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const labels = useLabels();
  const { toast } = useToast();
  const res = useResource((signal) => fetchCampaign(id, { signal }), [id]);
  const [dlg, setDlg] = useState<"edit" | "cancel" | "service" | null>(null);
  const back = { to: "/dashboard/promotion?tab=campaigns", label: c.backToCampaigns };

  if (res.loading) return <PageLoading />;
  if (res.error || !res.data)
    return (
      <div>
        <PageHeader title={c.tabCampaigns} back={back} />
        <LoadError error={res.error} onRetry={res.reload} />
      </div>
    );

  const x = res.data;
  const open = !CLOSED.includes(x.status);
  const pitch = x.pitch ? Object.entries(x.pitch).filter(([, v]) => v) : [];
  const pitchLabel: Record<string, string> = {
    platform: c.fPitchPlatform,
    genre: c.fPitchGenre,
    mood: c.fPitchMood,
    description: c.fPitchDescription,
    similar_artists: c.fPitchSimilar,
  };
  const orders = x.orders ?? [];

  return (
    <div>
      <PageHeader
        back={back}
        title={x.title}
        meta={<StatusPill status={x.status} size="md" />}
        description={labels.campaignType(x.type)}
        actions={
          open ? (
            <>
              <Button variant="secondary" leftIcon={<Pencil />} onClick={() => setDlg("edit")}>
                {c.edit}
              </Button>
              <Button variant="ghost" leftIcon={<XCircle />} onClick={() => setDlg("cancel")}>
                {c.cancelCampaign}
              </Button>
            </>
          ) : undefined
        }
      />

      {!open && (
        <FormAlert tone="info" className="mb-6">
          {c.closedNote}
        </FormAlert>
      )}

      <div className="space-y-8">
        <Section title={c.details} id="details">
          <Card>
            <DefinitionList
              columns={3}
              items={[
                { label: c.type, value: labels.campaignType(x.type) },
                { label: c.objective, value: x.objective ? labels.objective(x.objective) : "-" },
                {
                  label: c.release,
                  value: x.release ? `${x.release.release_title} · ${x.release.artist_name}` : "-",
                },
                { label: c.track, value: x.track?.title ?? "-", hidden: !x.track },
                {
                  label: c.budget,
                  value: x.budget_minor != null && x.currency ? <Money minor={x.budget_minor} currency={x.currency} /> : "-",
                },
                {
                  label: c.countries,
                  value: x.target_countries?.length ? x.target_countries.map((cc) => countryName(cc, locale)).join(", ") : "-",
                },
                { label: c.audience, value: x.target_audience || "-" },
                {
                  label: c.dates,
                  value:
                    x.starts_on && x.ends_on
                      ? c.datesValue(formatDate(x.starts_on, locale), formatDate(x.ends_on, locale))
                      : x.starts_on || x.ends_on
                        ? formatDate(x.starts_on || x.ends_on, locale)
                        : "-",
                },
                { label: c.createdAt, value: formatDate(x.created_at, locale) },
              ]}
            />
          </Card>
        </Section>

        <Section title={c.brief} id="brief">
          <Card>
            <p className="whitespace-pre-line break-words text-body-sm text-text-muted">{x.brief || c.noBrief}</p>
          </Card>
        </Section>

        {pitch.length > 0 && (
          <Section title={c.pitch} id="pitch">
            <Card>
              <DefinitionList items={pitch.map(([k, v]) => ({ label: pitchLabel[k] ?? k, value: v }))} />
            </Card>
          </Section>
        )}

        <Section
          title={c.ordersTitle}
          id="orders"
          action={
            open ? (
              <>
                <Button to={`/dashboard/creators?campaign=${x.id}`} variant="secondary" size="sm" leftIcon={<Search />}>
                  {c.findCreators}
                </Button>
                <Button size="sm" leftIcon={<Plus />} onClick={() => setDlg("service")}>
                  {c.addService}
                </Button>
              </>
            ) : undefined
          }
        >
          {orders.length === 0 ? (
            <EmptyState compact title={c.noOrders} />
          ) : (
            <ul className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border-subtle bg-surface-raised">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/dashboard/orders/${o.id}`}
                      className="break-words font-semibold text-text hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                    >
                      {o.title}
                    </Link>
                    <p className="text-caption text-text-subtle">
                      {o.reference} · {o.creator?.display_name ?? (o.service ? c.serviceBy2k : "-")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill status={o.status} />
                    <Money minor={o.price_minor} currency={o.currency} className="text-body-sm font-semibold text-text" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <CampaignFormDialog
        open={dlg === "edit"}
        onClose={() => setDlg(null)}
        campaign={x}
        onSaved={() => res.reload()}
      />
      <ConfirmDialog
        open={dlg === "cancel"}
        onClose={() => setDlg(null)}
        title={c.cancelTitle}
        description={c.cancelBody}
        confirmLabel={c.cancelCampaign}
        danger
        onConfirm={async () => {
          await cancelCampaign(x.id);
          toast({ title: c.cancelled, tone: "success" });
          res.reload();
        }}
      />
      <AddServiceDialog open={dlg === "service"} campaign={x} onClose={() => setDlg(null)} />
    </div>
  );
}

function AddServiceDialog({ open, campaign, onClose }: { open: boolean; campaign: Campaign; onClose: () => void }) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  return (
    <Dialog open={open} onClose={onClose} title={c.addServiceTitle} closeLabel={t("common.close")} size="lg">
      {open && <AddServiceForm campaign={campaign} onClose={onClose} />}
    </Dialog>
  );
}

function AddServiceForm({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const services = useResource((signal) => fetchPromotionServices({ signal }), []);
  const [serviceId, setServiceId] = useState("");
  const [brief, setBrief] = useState("");
  const [error, setError] = useState<string | null>(null);
  const place = useAction((sid: number, b: string | null) => createOrder(campaign.id, { promotion_service_id: sid, brief: b }));

  if (services.loading) return <InlineLoading />;
  if (services.error) return <LoadError error={services.error} onRetry={services.reload} compact />;
  const list = services.data ?? [];
  const selected = list.find((s) => String(s.id) === serviceId) ?? null;

  if (list.length === 0) return <EmptyState compact title={c.noServicesTitle} description={c.noServicesBody} />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setError(c.serviceRequired);
      return;
    }
    setError(null);
    const res = await place.run(selected.id, brief.trim() || null);
    if (res.ok) {
      toast({ title: c.orderCreated, tone: "success" });
      onClose();
      navigate(`/dashboard/orders/${res.value.id}`);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label={c.chooseService} error={error ?? place.fieldErrors.promotion_service_id} required>
        <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)} placeholder={c.chooseServicePlaceholder}>
          {list.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>
      {selected && (
        <div className="space-y-2 rounded-control border border-border-subtle bg-surface-sunken px-4 py-3">
          <Money minor={selected.price_minor} currency={selected.currency} className="font-bold text-text" />
          {selected.description && <p className="break-words text-body-sm text-text-muted">{selected.description}</p>}
          {selected.disclaimer && (
            <p className="break-words text-caption text-text">
              <span className="font-semibold">{c.disclaimer}: </span>
              {selected.disclaimer}
            </p>
          )}
        </div>
      )}
      <Field label={c.orderBrief} hint={c.orderBriefHint} optional optionalLabel={t("common.optional")} error={place.fieldErrors.brief}>
        <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={5000} rows={4} />
      </Field>
      {place.error && <FormAlert>{place.error}</FormAlert>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={place.pending}>
          {t("act.cancel")}
        </Button>
        <Button type="submit" loading={place.pending}>
          {c.createOrder}
        </Button>
      </div>
    </form>
  );
}
