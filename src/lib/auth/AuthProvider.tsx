import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  apiConfigured,
  getToken,
  setToken,
  setUnauthenticatedHandler,
} from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";
import { clearResumeKeys } from "@/lib/upload/resumeKeys";
import type { AccountType, AuthUser } from "@/lib/api/auth";

/**
 * THE SINGLE SOURCE OF TRUTH FOR AUTHENTICATION
 * =============================================
 *
 * There was no auth state in this app before, so this is the only store — no
 * competing context, no duplicated user object.
 *
 * The backend issues Sanctum personal access tokens that expire after
 * `SANCTUM_TOKEN_DAYS` (default 30, set per token at issue time) or when they
 * are deleted server-side (`POST /api/logout`, password reset). A stored token
 * is what makes a browser refresh keep you signed in: on boot we re-read it and
 * re-fetch the user from `GET /api/profile`, which is the authority. We never
 * trust a cached user object as proof of a session. An expired or revoked
 * token comes back 401 on any call; the client's unauthenticated hook clears
 * the session and the route guard sends the user to /auth?next=<where they were>.
 *
 * Statuses: "loading" while we verify a stored token, then "authenticated" or
 * "unauthenticated". Route guards read this rather than poking at localStorage.
 */

type Status = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: Status;
  user: AuthUser | null;
  /** True when VITE_API_URL is set; false means the API isn't configured. */
  configured: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    accountType: AccountType;
    locale?: "en" | "sw" | "fr";
  }) => Promise<void>;
  /** Exchanges a Google Identity Services credential for a session. */
  loginWithGoogle: (idToken: string) => Promise<void>;
  /**
   * True from a successful registration until the app navigates on. The
   * /auth guard reads it to send new accounts to onboarding instead of the
   * dashboard, without racing the form's own navigation.
   */
  justRegistered: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(() =>
    apiConfigured && getToken() ? "loading" : "unauthenticated",
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    if (!mounted.current) return;
    setUser(null);
    setJustRegistered(false);
    setStatus("unauthenticated");
  }, []);

  /* Any authenticated request that comes back 401 means the token is gone or
     revoked server-side; drop the local session so the UI can't pretend. */
  useEffect(() => {
    setUnauthenticatedHandler(clearSession);
    return () => setUnauthenticatedHandler(null);
  }, [clearSession]);

  const refresh = useCallback(async () => {
    if (!apiConfigured || !getToken()) {
      clearSession();
      return;
    }
    try {
      const fresh = await authApi.fetchProfile();
      if (!mounted.current) return;
      setUser(fresh);
      setStatus("authenticated");
    } catch (err) {
      // A network blip should not silently sign the user out; only a real 401
      // (already handled by the client's handler) should.
      if (err instanceof ApiError && err.isUnauthenticated) return;
      if (mounted.current) setStatus("unauthenticated");
    }
  }, [clearSession]);

  /* Boot: verify a stored token against the server before trusting it. */
  useEffect(() => {
    if (apiConfigured && getToken()) void refresh();
  }, [refresh]);

  /**
   * Adopts a token and then makes GET /api/profile the authority for the user
   * object.
   *
   * This matters: POST /api/register returns the freshly-created model, which
   * omits attributes that were never assigned — `email_verified_at` among them.
   * Trusting that payload made a brand-new account read as "Email verified: Yes".
   * /profile returns the full row, so we normalise through it and fall back to
   * the sign-in payload only if that follow-up call fails.
   */
  const adoptSession = useCallback(
    async (token: string, fallbackUser: AuthUser) => {
      setToken(token);
      let resolved = fallbackUser;
      try {
        resolved = await authApi.fetchProfile();
      } catch {
        /* keep the sign-in payload */
      }
      if (!mounted.current) return;
      setUser(resolved);
      setStatus("authenticated");
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      await adoptSession(res.token, res.user);
    },
    [adoptSession],
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      passwordConfirmation: string;
      accountType: AccountType;
      locale?: "en" | "sw" | "fr";
    }) => {
      // The backend returns a token straight from /register, so a successful
      // registration IS a session. We follow that rather than bouncing the user
      // back to a sign-in screen they don't need.
      const res = await authApi.register({
        name: input.name,
        email: input.email,
        password: input.password,
        password_confirmation: input.passwordConfirmation,
        account_type: input.accountType,
        ...(input.locale ? { locale: input.locale } : {}),
      });
      setJustRegistered(true);
      await adoptSession(res.token, res.user);
    },
    [adoptSession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const res = await authApi.googleLogin(idToken);
      await adoptSession(res.token, res.user);
    },
    [adoptSession],
  );

  const logout = useCallback(async () => {
    try {
      // Delete the token server-side first; a local-only clear would leave a
      // working credential in the database.
      await authApi.logout();
    } catch {
      /* Already invalid, or offline. Either way we still clear locally. */
    } finally {
      // An explicit sign-out also forgets resumable upload sessions, so the
      // next person on a shared device can't see or resume them.
      clearResumeKeys();
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      configured: apiConfigured,
      login,
      register,
      loginWithGoogle,
      justRegistered,
      logout,
      refresh,
    }),
    [status, user, login, register, loginWithGoogle, justRegistered, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
