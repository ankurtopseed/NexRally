import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || "https://api.ttcl.co.in").replace(/\/+$/, "");
const SESSION_KEY = "ttcl.mobile-session";
type Session = { access_token: string; refresh_token: string };
let webSession: string | null = null;
let refreshInFlight: Promise<Session> | undefined;
let sessionGeneration = 0;
let unauthorizedHandler: (() => void) | undefined;

async function readSession(): Promise<Session | null> {
  const raw = Platform.OS === "web" ? webSession : await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  if (!isSession(value)) throw new ApiError("The saved session is invalid. Sign in again.");
  return value;
}

function isSession(value: unknown): value is Session {
  return typeof value === "object" && value !== null &&
    "access_token" in value && typeof value.access_token === "string" && value.access_token.length > 0 &&
    "refresh_token" in value && typeof value.refresh_token === "string" && value.refresh_token.length > 0;
}

async function writeSession(session: Session | null) {
  if (Platform.OS === "web") {
    webSession = session ? JSON.stringify(session) : null;
  } else if (session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export async function hasSession(): Promise<boolean> {
  return (await readSession()) !== null;
}

export async function loginSession(email: string, password: string): Promise<void> {
  const tokens = await apiRequest<unknown>("/api/auth/mobile/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!isSession(tokens)) throw new ApiError("The server did not return valid mobile session tokens.");
  sessionGeneration++;
  await writeSession(tokens);
}

export async function logoutSession(): Promise<void> {
  if (refreshInFlight) await refreshInFlight;
  const session = await readSession();
  if (session) {
    try {
      await apiRequest<void>("/api/auth/mobile/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) throw error;
    }
  }
  sessionGeneration++;
  await writeSession(null);
}

async function refreshSession(): Promise<Session> {
  if (!refreshInFlight) {
    const generation = sessionGeneration;
    refreshInFlight = (async () => {
      const session = await readSession();
      if (!session) throw new ApiError("Your session has expired. Sign in again.", 401);
      try {
        const tokens = await apiRequest<unknown>("/api/auth/mobile/refresh", {
          method: "POST",
          body: JSON.stringify({ refresh_token: session.refresh_token }),
        });
        if (!isSession(tokens)) throw new ApiError("The server did not return valid refreshed tokens.");
        if (generation !== sessionGeneration) throw new ApiError("Your session has changed. Sign in again.", 401);
        await writeSession(tokens);
        return tokens;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401 && generation === sessionGeneration) {
          sessionGeneration++;
          await writeSession(null);
          unauthorizedHandler?.();
        }
        throw error;
      }
    })().finally(() => { refreshInFlight = undefined; });
  }
  return refreshInFlight;
}

export function setUnauthorizedHandler(handler?: () => void) {
  unauthorizedHandler = handler;
}

export function getApiBaseUrl(): string {
  if (__DEV__ === false && !apiBaseUrl.startsWith("https://")) {
    throw new ApiError("The production API must use HTTPS.");
  }
  return apiBaseUrl;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const headers = new Headers(options.headers);
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    if (typeof options.body === "string" && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      credentials: "omit",
      signal: controller.signal,
      headers,
    });
    if (!response.ok) {
      let message = `Request failed (${response.status}).`;
      try {
        const body = (await response.json()) as {
          detail?: string | Array<{ msg?: string }>;
          message?: string;
        };
        if (typeof body.detail === "string") message = body.detail;
        else if (Array.isArray(body.detail)) message = body.detail.map((item) => item.msg).filter(Boolean).join(" ") || message;
        else if (body.message) message = body.message;
      } catch {
        // Some server errors do not contain JSON.
      }
      throw new ApiError(message, response.status);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("The request timed out. Check your connection and try again.");
    }
    throw new ApiError(error instanceof Error ? error.message : "Unable to reach the TTCL service.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function authedRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await readSession();
  if (!session) throw new ApiError("Sign in to continue.", 401);
  const request = (token: string) => {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return apiRequest<T>(path, { ...options, headers });
  };
  try {
    return await request(session.access_token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const current = await readSession();
    if (!current) throw error;
    const refreshed = current.access_token !== session.access_token ? current : await refreshSession();
    try {
      return await request(refreshed.access_token);
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) {
        const latest = await readSession();
        if (latest?.refresh_token === refreshed.refresh_token) {
          sessionGeneration++;
          await writeSession(null);
          unauthorizedHandler?.();
        }
      }
      throw retryError;
    }
  }
}
