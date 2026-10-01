import { useState, type FormEvent } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Field, Input, Select, useToast } from "@/components/ui";
import { ConfirmDialog, FormAlert, useAction } from "@/features/dashboard/components";
import { useLabels } from "@/features/dashboard/marketplace/labels";
import { addPortfolioItem, deletePortfolioItem } from "@/lib/api/marketplace";
import type { CreatorProfile, PortfolioItem } from "@/lib/api/types";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

const MAX_ITEMS = 12;

export function PortfolioPanel({
  profile,
  platforms,
  onChanged,
}: {
  profile: CreatorProfile;
  platforms: string[];
  onChanged: () => void;
}) {
  const c = useCopy(COPY);
  const { t, locale } = useLanguage();
  const labels = useLabels();
  const { toast } = useToast();
  const [removing, setRemoving] = useState<PortfolioItem | null>(null);
  const items = profile.portfolio;
  const title = (i: PortfolioItem) => i.title || `${c.example} · ${labels.platform(i.platform)}`;

  return (
    <div className="space-y-5">
      <p className="text-body-sm text-text-muted">{c.portfolioIntro(MAX_ITEMS)}</p>
      {items.length === 0 ? (
        <EmptyState compact title={c.portfolioEmpty} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((i) => (
            <li key={i.id} className="min-w-0">
              <Card padding="sm" className="flex items-start justify-between gap-3">
                <a
                  href={i.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={c.openExample(title(i))}
                  className="min-w-0 rounded-[4px] hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                >
                  <span className="flex items-center gap-1.5 break-words font-semibold text-text">
                    {title(i)}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-subtle" aria-hidden />
                  </span>
                  <span className="mt-1 block break-all text-caption text-text-subtle">{i.url}</span>
                  {i.views != null && (
                    <span className="mt-1 block text-caption text-text-subtle">
                      {c.exViews}: {formatCount(i.views, locale)}
                    </span>
                  )}
                </a>
                <Button variant="ghost" size="sm" aria-label={c.removeExample(title(i))} onClick={() => setRemoving(i)}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {items.length >= MAX_ITEMS ? (
        <FormAlert tone="info">{c.portfolioFull(MAX_ITEMS)}</FormAlert>
      ) : (
        <AddExample platforms={platforms} onAdded={onChanged} />
      )}

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={removing ? c.removeExample(title(removing)) : ""}
        confirmLabel={t("act.remove")}
        danger
        onConfirm={async () => {
          if (!removing) return;
          await deletePortfolioItem(removing.id);
          toast({ title: c.exRemoved, tone: "success" });
          onChanged();
        }}
      />
    </div>
  );
}

function AddExample({ platforms, onAdded }: { platforms: string[]; onAdded: () => void }) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const { toast } = useToast();
  const [f, setF] = useState({ platform: platforms[0] ?? "", url: "", title: "", views: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const add = useAction((input: Parameters<typeof addPortfolioItem>[0]) => addPortfolioItem(input));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const url = f.url.trim();
    if (!/^https:\/\/\S+\.\S+/i.test(url)) errs.url = c.exUrlInvalid;
    const views = f.views.trim().replace(/[\s,]/g, "");
    if (views && !/^\d{1,12}$/.test(views)) errs.views = c.wholeNumber;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const res = await add.run({ platform: f.platform, url, title: f.title.trim() || null, views: views ? Number(views) : null });
    if (res.ok) {
      toast({ title: c.exAdded, tone: "success" });
      setF({ platform: f.platform, url: "", title: "", views: "" });
      onAdded();
    }
  };

  const err = (k: string) => errors[k] ?? add.fieldErrors[k];
  const opt = { optional: true, optionalLabel: t("common.optional") };

  return (
    <Card as="section" padding="sm">
      <h3 className="mb-3 font-bold text-text">{c.addExample}</h3>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={c.platform} error={err("platform")} required>
          <Select value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {labels.platform(p)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.exUrl} error={err("url")} required className="lg:col-span-3">
          <Input type="url" inputMode="url" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} maxLength={1024} placeholder="https://" />
        </Field>
        <Field label={c.exTitle} error={err("title")} className="sm:col-span-1 lg:col-span-2" {...opt}>
          <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={120} />
        </Field>
        <Field label={c.exViews} error={err("views")} {...opt}>
          <Input inputMode="numeric" value={f.views} onChange={(e) => setF({ ...f, views: e.target.value })} />
        </Field>
        <div className="flex items-end">
          <Button type="submit" leftIcon={<Plus />} loading={add.pending} fullWidth>
            {t("act.add")}
          </Button>
        </div>
        {add.error && !Object.keys(add.fieldErrors).length && (
          <FormAlert className="sm:col-span-2 lg:col-span-4">{add.error}</FormAlert>
        )}
      </form>
    </Card>
  );
}
