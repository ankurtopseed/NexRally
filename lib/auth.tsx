import { useQueryClient } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, ApiError, hasSession, loginSession, logoutSession, setUnauthorizedHandler } from "@/lib/api";
import { fetchPlayer } from "@/lib/queries";
import { Player } from "@/lib/types";

type AuthContextValue = {
  status: "loading" | "signedIn" | "signedOut" | "error";
  player: Player | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: Record<string, string>) => Promise<string>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    queryClient.clear();
    setPlayer(null);
    setStatus("signedOut");
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler();
  }, [clearSession]);

  const restoreSession = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      if (!(await hasSession())) {
        clearSession();
        return;
      }
      const current = await fetchPlayer();
      queryClient.setQueryData(["player", "me"], current);
      setPlayer(current);
      setStatus("signedIn");
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        clearSession();
      } else {
        setError(reason instanceof Error ? reason.message : "Unable to restore your session.");
        setStatus("error");
      }
    }
  }, [clearSession, queryClient]);

  useEffect(() => { void restoreSession(); }, [restoreSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    await loginSession(email, password);
    const current = await fetchPlayer();
    queryClient.clear();
    queryClient.setQueryData(["player", "me"], current);
    setPlayer(current);
    setError(null);
    setStatus("signedIn");
  }, [queryClient]);

  const signUp = useCallback(async (data: Record<string, string>) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(data)) form.append(key, value);
    const result = await apiRequest<{ message: string }>("/api/auth/register", { method: "POST", body: form });
    return result.message;
  }, []);

  const signOut = useCallback(async () => {
    await logoutSession();
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ status, player, error, signIn, signUp, signOut, restoreSession }),
    [status, player, error, signIn, signUp, signOut, restoreSession],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
