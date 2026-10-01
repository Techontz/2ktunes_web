import { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID, googleLoginAvailable } from "@/lib/api/auth";
import { useLanguage } from "@/lib/LanguageContext";

/**
 * "Continue with Google" via Google Identity Services.
 *
 * Renders nothing unless VITE_GOOGLE_CLIENT_ID is set. When it is, the GSI
 * script is loaded on demand, Google renders its own button (their branding
 * rules require it), and the returned credential — a signed ID token — is
 * handed to `onCredential`, which posts it to POST /api/google-login as
 * { id_token } for server-side verification.
 */

type GsiCredentialResponse = { credential?: string };
type Gsi = {
  accounts: {
    id: {
      initialize: (o: {
        client_id: string;
        callback: (r: GsiCredentialResponse) => void;
        ux_mode?: "popup" | "redirect";
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }) => void;
      renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
    };
  };
};
declare global {
  interface Window {
    google?: Gsi;
  }
}

const SRC = "https://accounts.google.com/gsi/client";
let loader: Promise<Gsi> | null = null;

function loadGsi(): Promise<Gsi> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (loader) return loader;
  loader = new Promise<Gsi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => (window.google ? resolve(window.google) : reject(new Error("GSI missing")));
    script.onerror = () => {
      loader = null;
      reject(new Error("GSI failed to load"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

export default function GoogleButton({
  onCredential,
  onError,
}: {
  onCredential: (idToken: string) => void;
  onError: () => void;
}) {
  const { t, language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const errCb = useRef(onError);
  errCb.current = onError;

  useEffect(() => {
    if (!googleLoginAvailable) return;
    let cancelled = false;
    loadGsi()
      .then((google) => {
        if (cancelled || !ref.current) return;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: "popup",
          cancel_on_tap_outside: true,
          callback: (r) => {
            if (r.credential) cb.current(r.credential);
            else errCb.current();
          },
        });
        google.accounts.id.renderButton(ref.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          logo_alignment: "center",
          width: Math.min(ref.current.offsetWidth || 400, 400),
          locale: language === "SW" ? "sw" : "en",
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [language]);

  if (!googleLoginAvailable || failed) return null;

  return (
    <div>
      <div className="my-6 flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption font-semibold uppercase tracking-[0.12em] text-text-subtle">{t("auth.or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div ref={ref} className="flex min-h-11 w-full justify-center"/>
    </div>
  );
}
