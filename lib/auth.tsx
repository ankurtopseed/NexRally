import * as SecureStore from "expo-secure-store";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, ApiError, authedRequest } from "@/lib/api";
import { Player } from "@/lib/types";

type AuthContextValue = {
  status: "loading" | "signedIn" | "signedOut";
  player: Player | null;
  accessToken: string | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: Record<string, string>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const ACCESS_TOKEN_KEY = "ttcl.access-token";
const REFRESH_TOKEN_KEY = "ttcl.refresh-token";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  player?: Player;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [player, setPlayer] = useState<Player | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]).then(([access, refresh]) => {
      if (!active) return;
      if (access) {
        setAccessToken(access);
        setStatus("signedIn");
      } else if (refresh) {
        setStatus("signedIn");
      } else {
        setStatus("signedOut");
      }
    }).catch((reason: unknown) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : "Unable to restore your session.");
      setStatus("signedOut");
    });
    return () => {
      active = false;
    };
  }, []);

  const saveSession = useCallback(async (tokens: TokenResponse) => {
    if (!tokens.access_token) throw new ApiError("The server did not return an access token.");
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access_token);
    if (tokens.refresh_token) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh_token);
    else await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setAccessToken(tokens.access_token);
    setPlayer(tokens.player ?? null);
    setError(null);
    setStatus("signedIn");
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const tokens = await apiRequest<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await saveSession(tokens);
  }, [saveSession]);

  const signUp = useCallback(async (data: Record<string, string>) => {
    setError(null);
    const tokens = await apiRequest<TokenResponse | undefined>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (tokens?.access_token) await saveSession(tokens);
  }, [saveSession]);

  const refreshPlayer = useCallback(async () => {
    try {
      setPlayer(await authedRequest<Player>("/api/v1/players/me"));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load your profile.");
      throw reason;
    }
  }, []);

  const signOut = useCallback(async () => {
    const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    let logoutError: unknown;
    try {
      if (refresh) {
        await authedRequest<void>("/api/v1/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refresh }),
        });
      }
    } catch (reason) {
      logoutError = reason;
    } finally {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setAccessToken(null);
      setPlayer(null);
      setError(null);
      setStatus("signedOut");
    }
    if (logoutError) throw logoutError;
  }, []);

  const value = useMemo(
    () => ({ status, player, accessToken, error, signIn, signUp, signOut, refreshPlayer }),
    [status, player, accessToken, error, signIn, signUp, signOut, refreshPlayer],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
