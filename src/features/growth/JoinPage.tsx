import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Gift, Info } from "lucide-react";
import AuthLayout from "@/features/auth/AuthLayout";
import { RegisterForm } from "@/features/auth/AuthPage";
import { cleanReferralCode, fetchReferralLookup, rememberReferralCode } from "@/lib/api/growth";
import { useResource } from "@/lib/api/useResource";
import { useLanguage } from "@/lib/LanguageContext";
import { useCopy } from "@/lib/useCopy";
import { REFERRAL_COPY } from "./referralCopy";
import { friendGetsText, shortMoney } from "./referralText";

/**
 * /join/:code: an invited artist lands here from a referral link
 * ({FRONTEND_URL}/join/{code}). A valid code shows who invited them and what
 * they get, above the usual one-screen sign-up with the code attached. An
 * invalid code (or the program being off) still lets them join, with a
 * gentle note. Only the referrer's first name is ever shown.
 */
export default function JoinPage() {
  const { code: raw = "" } = useParams();
  const c = useCopy(REFERRAL_COPY);
  const { t, locale } = useLanguage();
  const code = cleanReferralCode(raw);
  const res = useResource(
    (signal) => (code ? fetchReferralLookup(code, { signal }) : Promise.resolve({ valid: false as const, code: null })),
    [code],
  );
  const lookup = res.data;
  const valid = lookup?.valid === true ? lookup : null;

  // Keep a valid code for this session so a switch to /auth or Google sign-up still sends it.
  useEffect(() => {
    if (valid) rememberReferralCode(valid.code);
    else if (lookup) rememberReferralCode(null);
  }, [valid, lookup]);

  useEffect(() => {
    document.title = `${valid ? c.joinTitle(valid.referrer_name) : t("auth.tab_register")} · 2kTunes`;
  }, [valid, c, t]);

  const gets = valid ? friendGetsText(valid.friend_gets, c, locale) : null;
  const cheapest = valid ? [...(valid.friend_gets.plans ?? [])].sort((a, b) => a.price_minor - b.price_minor)[0] : null;

  return (
    <AuthLayout wide>
      {res.loading ? (
        <p role="status" className="flex items-center gap-3 py-10 text-body text-text-muted">
          <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          {c.joinChecking}
        </p>
      ) : (
        <>
          {valid ? (
            <header className="mb-5">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-caption font-bold text-accent-text">
                <Gift aria-hidden className="h-3.5 w-3.5" />
                {c.codeLabel(valid.code)}
              </p>
              <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-text sm:text-[2.125rem]">
                {c.joinTitle(valid.referrer_name)}
              </h1>
              <p className="mt-2 text-body text-text-muted">{c.joinSub}</p>
              <div className="mt-4 rounded-card border border-accent/30 bg-[linear-gradient(135deg,rgb(132_29_198/0.10),rgb(247_147_30/0.08))] p-4">
                <p className="text-caption font-bold uppercase tracking-[0.12em] text-accent-text">{c.youGet}</p>
                <p className="mt-1 text-[1.125rem] font-bold text-text">{gets ?? c.friendGeneric}</p>
                {cheapest && cheapest.list_minor > cheapest.price_minor && (
                  <p className="mt-0.5 text-body-sm text-text-muted">
                    <s>{c.priceWas(shortMoney(cheapest.list_minor, cheapest.currency, locale))}</s>
                  </p>
                )}
              </div>
            </header>
          ) : (
            <header className="mb-5">
              <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-text sm:text-[2.125rem]">
                {t("auth.title_register")}
              </h1>
              <p
                role="status"
                className="mt-3 flex gap-2 rounded-control border border-info/25 bg-info-soft px-3 py-2.5 text-body-sm text-text"
              >
                <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                {c.joinInvalid}
              </p>
            </header>
          )}
          <RegisterForm referralCode={valid?.code ?? null} hideHeading />
          <p className="mt-5 text-center text-body-sm text-text-muted">
            {c.haveAccount}{" "}
            <Link to="/auth" className="font-semibold text-accent-text underline-offset-4 hover:underline">
              {c.logIn}
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
