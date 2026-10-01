import { useState } from "react";
import { Landmark, Plus, Smartphone, Trash2 } from "lucide-react";
import { Badge, Button, Card, EmptyState, useToast } from "@/components/ui";
import { PasswordConfirmDialog } from "@/features/dashboard/components";
import { ApiError } from "@/lib/api/client";
import type { PayoutMethod } from "@/lib/api/types";
import { deletePayoutMethod, verifyPassword } from "@/lib/api/wallet";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

export function PayoutMethodsPanel({
  methods,
  onAdd,
  onChanged,
}: {
  methods: PayoutMethod[];
  onAdd: () => void;
  onChanged: () => void;
}) {
  const c = useCopy(COPY);
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const [removing, setRemoving] = useState<PayoutMethod | null>(null);

  const nameOf = (m: PayoutMethod) => [m.label, `${m.provider.name} ${m.masked}`].filter(Boolean).join(" · ");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-body-sm text-text-subtle">{c.methodsDesc}</p>
        {methods.length > 0 && (
          <Button size="sm" leftIcon={<Plus />} onClick={onAdd}>
            {c.addMethod}
          </Button>
        )}
      </div>

      {methods.length === 0 ? (
        <EmptyState
          icon={<Smartphone />}
          title={c.methodsEmptyTitle}
          description={c.methodsEmptyBody}
          action={
            <Button leftIcon={<Plus />} onClick={onAdd}>
              {c.addMethod}
            </Button>
          }
          compact
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {methods.map((m) => (
            <Card as="li" key={m.id} padding="sm" className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-white/[0.06] text-text-muted"
              >
                {m.provider.type === "bank" ? <Landmark className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="min-w-0 break-words font-semibold text-text">{m.label || m.provider.name}</h3>
                  {m.is_default && (
                    <Badge tone="accent" size="sm">
                      {c.defaultBadge}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 break-words font-mono text-body-sm text-text">{m.masked}</p>
                <p className="mt-0.5 break-words text-caption text-text-subtle">
                  {[m.label ? m.provider.name : null, m.account_name, m.bank_name, m.provider.currency]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-0.5 text-caption text-text-subtle">{c.addedAt(formatDate(m.created_at, locale))}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 />}
                aria-label={c.removeMethod(nameOf(m))}
                onClick={() => setRemoving(m)}
              >
                <span className="hidden sm:inline">{t("act.remove")}</span>
              </Button>
            </Card>
          ))}
        </ul>
      )}

      <PasswordConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={c.removeTitle}
        description={removing ? c.removeBody(nameOf(removing)) : undefined}
        confirmLabel={c.removeConfirm}
        danger
        onConfirm={async (password) => {
          if (!removing) return;
          // DELETE takes no password, so check it first; `false` = wrong password.
          if (!(await verifyPassword(password))) {
            throw new ApiError(t("pw.incorrect"), 422, {}, false, { code: "password_incorrect" });
          }
          await deletePayoutMethod(removing.id);
          toast({ title: c.removed, tone: "success" });
          onChanged();
        }}
      />
    </div>
  );
}
