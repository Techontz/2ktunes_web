import { lazy, Suspense, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

// Loaded only when someone without a plan opens an upload page.
const PlanGate = lazy(() => import("./PlanPicker").then((m) => ({ default: m.PlanGate })));

/**
 * Uploading needs an active plan (the API answers 403 subscription_required
 * on new releases, cover art and audio). Without one, the plan picker stands
 * in for the page; once the plan activates, the auth refresh unlocks it.
 */
export function RequirePlan({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.has_active_subscription) return <>{children}</>;
  return (
    <Suspense fallback={null}>
      <PlanGate />
    </Suspense>
  );
}
