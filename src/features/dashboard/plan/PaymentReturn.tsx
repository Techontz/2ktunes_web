import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { FormAlert } from "@/features/dashboard/components";
import { cancelPlanPayment, capturePayPalPayment, fetchPlanPayment, type PaymentStatusResponse } from "@/lib/api/payments";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatDate } from "@/lib/dates";
import { useLanguage } from "@/lib/LanguageContext";
import type { PlanCopy } from "./copy";

const POLL_MS = 3000;
const GIVE_UP_MS = 60_000;

type State =
  | { kind: "confirming" }
  | { kind: "confirmed"; plan: string | null; until: string | null }
  | { kind: "slow" }
  | { kind: "failed" }
  | { kind: "cancelled" };

/**
 * Back from Stripe Checkout or PayPal on
 * /dashboard/plan?payment={id}&result=success|cancel (PayPal adds &token=).
 *
 * success: PayPal is captured first, then the payment is polled every 3 s
 * for up to a minute (the webhook can lag); once confirmed the signed-in
 * user is refreshed so upload pages unlock at once. cancel: nothing was
 * charged; the open payment is closed and the artist can choose again.
 */
export function PaymentReturn({ c, onConfirmed }: { c: PlanCopy; onConfirmed: () => void }) {
  const [params, setParams] = useSearchParams();
  const { locale } = useLanguage();
  const auth = useAuth();
  const id = params.get("payment");
  const result = params.get("result");
  const token = params.get("token");
  const [state, setState] = useState<State | null>(null);
  const onConfirmedRef = useRef(onConfirmed);
  onConfirmedRef.current = onConfirmed;
  const refreshRef = useRef(auth.refresh);
  refreshRef.current = auth.refresh;

  useEffect(() => {
    if (!id || !/^\d+$/.test(id) || (result !== "success" && result !== "cancel")) return;
    if (result === "cancel") {
      setState({ kind: "cancelled" });
      cancelPlanPayment(id).catch(() => {
        /* already closed or settled: nothing to undo */
      });
      return;
    }

    let live = true;
    let timer: number | undefined;
    const started = Date.now();
    setState({ kind: "confirming" });

    const settle = (res: PaymentStatusResponse) => {
      const s = res.payment.status;
      if (s === "confirmed") {
        setState({ kind: "confirmed", plan: res.payment.plan?.name ?? null, until: res.subscription?.expires_at ?? null });
        void refreshRef.current();
        onConfirmedRef.current();
        return true;
      }
      if (s === "failed" || s === "expired" || s === "cancelled") {
        setState({ kind: "failed" });
        return true;
      }
      return false;
    };

    const check = async (first: boolean) => {
      try {
        // PayPal returns with ?token=: capture the approved order before polling.
        const res = first && token ? await capturePayPalPayment(id) : await fetchPlanPayment(id);
        if (!live) return;
        if (settle(res)) return;
      } catch {
        if (!live) return;
      }
      if (Date.now() - started >= GIVE_UP_MS) {
        setState({ kind: "slow" });
        return;
      }
      timer = window.setTimeout(() => void check(false), POLL_MS);
    };
    void check(true);

    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [id, result, token]);

  if (!state) return null;

  const dismiss = () => {
    setState(null);
    setParams({}, { replace: true });
  };
  const dismissButton = (
    <Button variant="ghost" size="sm" onClick={dismiss} className="shrink-0">
      {c.dismiss}
    </Button>
  );

  const body = (() => {
    switch (state.kind) {
      case "confirming":
        return {
          tone: "info" as const,
          icon: <Loader2 className="mt-0.5 h-4 w-4 shrink-0 motion-safe:animate-spin" aria-hidden />,
          title: c.returnConfirming,
          text: c.returnConfirmingBody,
        };
      case "confirmed":
        return {
          tone: "success" as const,
          icon: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />,
          title: c.successTitle,
          text: state.plan
            ? state.until
              ? c.successBody(state.plan, formatDate(state.until, locale))
              : c.successBodyNoDate(state.plan)
            : c.activatedBody,
        };
      case "slow":
        return { tone: "warning" as const, icon: <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />, title: c.returnSlow, text: c.returnSlowBody };
      case "failed":
        return { tone: "danger" as const, icon: <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />, title: c.returnFailed, text: c.returnFailedBody };
      case "cancelled":
        return { tone: "warning" as const, icon: <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />, title: c.returnCancelled, text: c.returnCancelledBody };
    }
  })();

  return (
    <FormAlert tone={body.tone} className="mx-auto mt-6 max-w-[70rem]">
      <div className="flex items-start gap-3">
        {body.icon}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{body.title}</p>
          <p className="mt-0.5 text-text-muted">{body.text}</p>
        </div>
        {state.kind !== "confirming" && dismissButton}
      </div>
    </FormAlert>
  );
}
