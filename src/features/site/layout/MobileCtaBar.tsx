import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

/** Pages where a persistent sign-up bar would get in the way of reading or a form. */
const HIDDEN_ON = [/^\/legal\//, /^\/contact/];

/**
 * Phone-only sticky call to action for the marketing site (hidden from `sm`).
 *
 * It slides in once the visitor has scrolled past the hero (whose own CTA is
 * then off screen) and slides away again when the closing CTA band or the
 * footer comes into view, so it never doubles up with another CTA or covers
 * the footer links. Safe-area aware for phones with a home indicator.
 */
export default function MobileCtaBar() {
  const { t } = useLanguage();
  const { status } = useAuth();
  const { pathname } = useLocation();
  const [shown, setShown] = useState(false);
  const hiddenHere = HIDDEN_ON.some((r) => r.test(pathname));

  useEffect(() => {
    if (hiddenHere) {
      setShown(false);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const end = document.querySelector("[data-cta-band]") ?? document.querySelector("footer");
      const endVisible = end ? end.getBoundingClientRect().top < vh : false;
      setShown(window.scrollY > vh * 0.6 && !endVisible);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname, hiddenHere]);

  if (hiddenHere) return null;
  const signedIn = status === "authenticated";

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={cn(
        "theme-dark fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-night/90 px-4 pt-3 backdrop-blur-xl sm:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-18px_rgb(8_2_16/0.9)]",
        "transition-transform duration-300 ease-[var(--ease-tunes)]",
        shown ? "translate-y-0" : "translate-y-full",
      )}
    >
      {signedIn ? (
        <Button to="/dashboard" size="md" shape="pill" fullWidth rightIcon={<ArrowRight />}>
          {t("cta.dashboard")}
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button to="/auth" variant="outline" size="md" shape="pill" className="px-4">
            {t("cta.login")}
          </Button>
          <Button to="/auth?mode=register" size="md" shape="pill" className="min-w-0 flex-1" rightIcon={<ArrowRight />}>
            {t("cta.get_started")}
          </Button>
        </div>
      )}
    </div>
  );
}
