import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { LanguageProvider, type Language } from "@/lib/LanguageContext";

/**
 * Renders a page with every provider the dashboard expects: language, router
 * (at `route`, matched against `path` so `useParams` works), auth (a stored
 * token → GET /profile from the mocked API) and toasts.
 *
 *   mockApi({ "GET /wallet": {...} });
 *   renderPage(<WalletPage />, { route: "/dashboard/wallet" });
 */
export function renderPage(
  ui: ReactElement,
  {
    route = "/",
    path = "*",
    language = "EN",
    signedIn = true,
  }: { route?: string; path?: string; language?: Language; signedIn?: boolean } = {},
) {
  try {
    if (signedIn) localStorage.setItem("2ktunes.token", "test-token");
    else localStorage.removeItem("2ktunes.token");
  } catch {
    /* jsdom always has storage */
  }
  return render(
    <LanguageProvider initial={language}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path={path} element={ui} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    </LanguageProvider>,
  );
}
