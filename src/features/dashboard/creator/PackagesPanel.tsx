import { useState, type FormEvent } from "react";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, Checkbox, Dialog, EmptyState, Field, Input, Select, Textarea, useToast } from "@/components/ui";
import { ConfirmDialog, FormAlert, Money, useAction } from "@/features/dashboard/components";
import { useLabels } from "@/features/dashboard/marketplace/labels";
import { createPackage, deletePackage, updatePackage, type PackageInput } from "@/lib/api/marketplace";
import type { CreatorPackage, CreatorProfile, ReleaseConfig } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/LanguageContext";
import { minorToDecimal, parseAmount } from "@/lib/money";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

type Market = ReleaseConfig["marketplace"];

export function PackagesPanel({
  profile,
  market,
  onChanged,
}: {
  profile: CreatorProfile;
  market: Market;
  onChanged: () => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const { toast } = useToast();
  const [editing, setEditing] = useState<CreatorPackage | "new" | null>(null);
  const [deleting, setDeleting] = useState<CreatorPackage | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-[65ch] text-body-sm text-text-muted">{c.packagesIntro}</p>
        <Button leftIcon={<Plus />} onClick={() => setEditing("new")}>
          {c.addPackage}
        </Button>
      </div>

      {profile.packages.length === 0 ? (
        <EmptyState compact icon={<Package />} title={c.noPackages} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {profile.packages.map((p) => (
            <li key={p.id} className="min-w-0">
              <Card padding="sm" className="flex h-full flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="min-w-0 break-words font-bold text-text">{p.title}</h3>
                  <Money minor={p.price_minor} currency={p.currency} className="font-bold text-text" />
                </div>
                <p className="flex flex-wrap items-center gap-2 text-caption text-text-subtle">
                  {labels.platform(p.platform)} · {c.days(p.turnaround_days)}
                  {!p.is_active && (
                    <Badge tone="neutral" size="sm">
                      {c.inactive}
                    </Badge>
                  )}
                </p>
                {p.deliverable && <p className="break-words text-body-sm text-text">{p.deliverable}</p>}
                {p.description && <p className="whitespace-pre-line break-words text-body-sm text-text-muted">{p.description}</p>}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button variant="secondary" size="sm" leftIcon={<Pencil />} aria-label={c.edit(p.title)} onClick={() => setEditing(p)}>
                    {t("act.edit")}
                  </Button>
                  <Button variant="ghost" size="sm" leftIcon={<Trash2 />} aria-label={c.remove(p.title)} onClick={() => setDeleting(p)}>
                    {t("act.delete")}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? c.addPackage : c.editPackage}
        closeLabel={t("common.close")}
        size="lg"
      >
        {editing !== null && (
          <PackageForm
            pkg={editing === "new" ? null : editing}
            market={market}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              onChanged();
            }}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={c.deleteTitle}
        description={c.deleteBody}
        confirmLabel={c.deletePackage}
        danger
        onConfirm={async () => {
          if (!deleting) return;
          await deletePackage(deleting.id);
          toast({ title: c.deleted, tone: "success" });
          onChanged();
        }}
      />
    </div>
  );
}

function PackageForm({
  pkg,
  market,
  onClose,
  onSaved,
}: {
  pkg: CreatorPackage | null;
  market: Market;
  onClose: () => void;
  onSaved: () => void;
}) {
  const c = useCopy(COPY);
  const { t } = useLanguage();
  const labels = useLabels();
  const { user } = useAuth();
  const { toast } = useToast();
  const defaultCurrency =
    user?.preferred_currency && market.currencies.includes(user.preferred_currency)
      ? user.preferred_currency
      : (market.currencies[0] ?? "TZS");
  const [f, setF] = useState(() => ({
    title: pkg?.title ?? "",
    platform: pkg?.platform ?? market.platforms[0] ?? "",
    price: pkg ? minorToDecimal(pkg.price_minor, pkg.currency) : "",
    currency: pkg?.currency ?? defaultCurrency,
    turnaround_days: pkg ? String(pkg.turnaround_days) : "3",
    deliverable: pkg?.deliverable ?? "",
    description: pkg?.description ?? "",
    is_active: pkg?.is_active ?? true,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useAction((input: PackageInput) => (pkg ? updatePackage(pkg.id, input) : createPackage(input)));
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.title.trim()) errs.title = c.pkgTitleRequired;
    const price = parseAmount(f.price, f.currency);
    if (!price || price.minor <= 0n) errs.price = c.pkgPriceInvalid;
    const days = Number(f.turnaround_days);
    if (!Number.isInteger(days) || days < 1 || days > 60) errs.turnaround_days = c.turnaroundInvalid;
    setErrors(errs);
    if (Object.keys(errs).length || !price) return;
    const res = await save.run({
      title: f.title.trim(),
      platform: f.platform,
      price: price.decimal,
      currency: f.currency,
      turnaround_days: days,
      deliverable: f.deliverable.trim() || null,
      description: f.description.trim() || null,
      is_active: f.is_active,
    });
    if (res.ok) {
      toast({ title: c.pkgSaved, tone: "success" });
      onSaved();
    }
  };

  const err = (k: string) => errors[k] ?? save.fieldErrors[k];
  const opt = { optional: true, optionalLabel: t("common.optional") };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.pkgTitle} error={err("title")} required className="sm:col-span-2">
          <Input value={f.title} onChange={(e) => set({ title: e.target.value })} maxLength={100} />
        </Field>
        <Field label={c.pkgPlatform} error={err("platform")} required>
          <Select value={f.platform} onChange={(e) => set({ platform: e.target.value })}>
            {market.platforms.map((p) => (
              <option key={p} value={p}>
                {labels.platform(p)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.pkgTurnaround} error={err("turnaround_days")} required>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            value={f.turnaround_days}
            onChange={(e) => set({ turnaround_days: e.target.value })}
          />
        </Field>
        <Field label={c.pkgPrice} error={err("price")} required>
          <Input inputMode="decimal" value={f.price} onChange={(e) => set({ price: e.target.value })} maxLength={20} />
        </Field>
        <Field label={c.pkgCurrency} error={err("currency")} required>
          <Select value={f.currency} onChange={(e) => set({ currency: e.target.value })}>
            {market.currencies.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={c.pkgDeliverable} hint={c.pkgDeliverableHint} error={err("deliverable")} className="sm:col-span-2" {...opt}>
          <Input value={f.deliverable} onChange={(e) => set({ deliverable: e.target.value })} maxLength={255} />
        </Field>
        <Field label={c.pkgDescription} error={err("description")} className="sm:col-span-2" {...opt}>
          <Textarea value={f.description} onChange={(e) => set({ description: e.target.value })} maxLength={1000} rows={4} />
        </Field>
      </div>
      <Checkbox label={c.pkgActive} checked={f.is_active} onChange={(e) => set({ is_active: e.target.checked })} />
      {save.error && <FormAlert>{save.error}</FormAlert>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={save.pending}>
          {t("act.cancel")}
        </Button>
        <Button type="submit" loading={save.pending}>
          {t("act.save")}
        </Button>
      </div>
    </form>
  );
}
