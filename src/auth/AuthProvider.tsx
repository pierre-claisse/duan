// Holds the unlocked PAT in memory once the professor signs in. Nothing is
// persisted: a page reload returns to the "locked" (public) state. The app is
// public by default — being locked only hides edit affordances.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { unlock } from "./secretsLoader";

type AuthState = { status: "locked" } | { status: "unlocked"; pat: string };

interface AuthContextValue {
  state: AuthState;
  /** Returns true on success, false on wrong password (throws if the secrets
   *  bundle can't be loaded). */
  signIn: (password: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "locked" });

  const signIn = useCallback(async (password: string) => {
    const secrets = await unlock(password);
    if (!secrets) return false;
    setState({ status: "unlocked", pat: secrets.pat });
    return true;
  }, []);

  const signOut = useCallback(() => setState({ status: "locked" }), []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, signIn, signOut }),
    [state, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
