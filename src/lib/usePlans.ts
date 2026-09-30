import { useEffect, useState } from "react";
import {
  PLACEHOLDER_PLANS,
  PLACEHOLDER_TZS_PER_USD,
  type Plan,
} from "@/config/pricing";

/**
 * Reads pricing from the backend when it is reachable, otherwise falls back to
 * the placeholder configuration.
 *
 * `GET /api/plans` is already public and unauthenticated
 * (routes/api.php → ApiController@getPlans), so this adds no backend surface —
 * it only consumes what exists. Set `VITE_API_URL` (e.g. http://127.0.0.1:8000)
 * to turn it on; with the variable unset the hook never issues a request and
 * the page renders the placeholders synchronously on first paint.
 *
 * `source` lets the UI be honest about which it is showing.
 */
export type PlansState = {
  plans: Plan[];
  tzsPerUsd: number;
  source: "placeholder" | "backend";
};

type ApiPlan = Partial<Plan> & { exchange_rate?: number | string };

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/+$/,
  "",
);

function toNumber(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

export function usePlans(): PlansState {
  const [state, setState] = useState<PlansState>({
    plans: PLACEHOLDER_PLANS,
    tzsPerUsd: PLACEHOLDER_TZS_PER_USD,
    source: "placeholder",
  });

  useEffect(() => {
    if (!API_BASE) return;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/plans`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;

        const body = (await res.json()) as { plans?: ApiPlan[] };
        const rows = (body.plans ?? [])
          .filter((p) => p.is_active !== false)
          .sort((a, b) => toNumber(a.order, 0) - toNumber(b.order, 0));

        if (!rows.length) return;

        /* The plans table carries its own exchange_rate. A default of 1 means
           "unset", so it is ignored rather than used to render TZS 19. */
        const rate = rows
          .map((p) => toNumber(p.exchange_rate, 1))
          .find((r) => r > 1);

        setState({
          plans: rows.map((p, i) => ({
            id: toNumber(p.id, i + 1),
            name: p.name ?? `Plan ${i + 1}`,
            price: toNumber(p.price, 0),
            duration: toNumber(p.duration, 30),
            max_artists: toNumber(p.max_artists, 1),
            description: p.description ?? "",
            features: Array.isArray(p.features) ? p.features : [],
            order: toNumber(p.order, i + 1),
            is_active: true,
          })),
          tzsPerUsd: rate ?? PLACEHOLDER_TZS_PER_USD,
          source: "backend",
        });
      } catch {
        /* Offline or no backend: the placeholder config already rendered. */
      }
    })();

    return () => controller.abort();
  }, []);

  return state;
}
