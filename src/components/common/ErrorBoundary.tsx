import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";

/**
 * Top-level error boundary.
 *
 * Catches render errors anywhere below it — including a lazy route chunk that
 * fails to load after a new deploy replaced the old hashed files — and shows a
 * friendly "500" page with a reload button instead of a blank screen.
 *
 * It sits OUTSIDE the router (see main.tsx), so the fallback uses plain links
 * (full page loads), which also clears whatever state caused the crash.
 */
type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: unknown };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error ?? new Error("Unknown render error") };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // The one place console output is intended: there is no error reporting
    // service wired up, and a crash must leave a trace for whoever debugs it.
    console.error("Unhandled UI error", error, info.componentStack);
  }

  render() {
    if (this.state.error) return this.props.fallback ?? <CrashPage />;
    return this.props.children;
  }
}

export function CrashPage() {
  const { t } = useLanguage();
  return (
    <main
      role="alert"
      className="flex min-h-svh items-center bg-surface px-4 py-16 text-text sm:px-8"
    >
      <div className="mx-auto w-full max-w-[34rem]">
        <p className="t-eyebrow text-accent-text">{t("crash.eyebrow")}</p>
        <h1 className="t-display mt-4">{t("crash.title")}</h1>
        <p className="t-lead mt-4 text-text-muted">{t("crash.body")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => window.location.reload()}>
            {t("crash.reload")}
          </Button>
          <Button size="lg" variant="secondary" href="/">
            {t("common.back_home")}
          </Button>
        </div>
      </div>
    </main>
  );
}

export default ErrorBoundary;
