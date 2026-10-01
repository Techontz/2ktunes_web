import { useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { LoadError, Money, PageLoading } from "@/features/dashboard/components";
import { humanize } from "@/features/dashboard/marketplace/labels";
import { OrderDialog, type OrderTarget } from "@/features/dashboard/marketplace/OrderDialog";
import { fetchPromotionServices } from "@/lib/api/marketplace";
import { useResource } from "@/lib/api/useResource";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";

export function ServicesTab() {
  const c = useCopy(COPY);
  const res = useResource((signal) => fetchPromotionServices({ signal }), []);
  const [target, setTarget] = useState<OrderTarget | null>(null);

  if (res.loading) return <PageLoading rows={3} />;
  if (res.error) return <LoadError error={res.error} onRetry={res.reload} />;
  const services = res.data ?? [];

  return (
    <div>
      <p className="mb-5 max-w-[65ch] text-body-sm text-text-muted">{c.servicesIntro}</p>
      {services.length === 0 ? (
        <EmptyState icon={<Sparkles />} title={c.noServicesTitle} description={c.noServicesBody} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <li key={s.id} className="min-w-0">
              <Card className="flex h-full flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="min-w-0 break-words text-h4 font-bold text-text">{s.name}</h3>
                  <Badge tone="accent" size="sm">
                    <span className="sr-only">{c.category}: </span>
                    {humanize(s.category)}
                  </Badge>
                </div>
                {s.description && (
                  <p className="whitespace-pre-line break-words text-body-sm text-text-muted">{s.description}</p>
                )}
                {s.disclaimer && (
                  <div className="flex gap-2 rounded-control border border-warning/30 bg-warning-soft px-3 py-2.5 text-caption text-text">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden />
                    <p className="min-w-0 break-words">
                      <span className="font-semibold">{c.disclaimer}: </span>
                      {s.disclaimer}
                    </p>
                  </div>
                )}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-3">
                  <Money minor={s.price_minor} currency={s.currency} className="text-h4 font-bold text-text" />
                  <Button
                    size="sm"
                    aria-label={c.orderLabel(s.name)}
                    onClick={() =>
                      setTarget({
                        kind: "service",
                        id: s.id,
                        title: s.name,
                        priceMinor: s.price_minor,
                        currency: s.currency,
                        disclaimer: s.disclaimer,
                      })
                    }
                  >
                    {c.order}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <OrderDialog open={!!target} onClose={() => setTarget(null)} target={target} />
    </div>
  );
}
