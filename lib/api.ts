import * as SecureStore from "expo-secure-store";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
const ACCESS_TOKEN_KEY = "ttcl.access-token";
const REFRESH_TOKEN_KEY = "ttcl.refresh-token";

export function getApiBaseUrl(): string {
  if (!apiBaseUrl) {
    throw new ApiError("API is not configured. Set EXPO_PUBLIC_API_URL and restart the app.");
  }
  if (__DEV__ === false && !apiBaseUrl.startsWith("https://")) {
    throw new ApiError("The production API must use HTTPS.");
  }
  return apiBaseUrl;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(typeof options.body === "string" ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message = `Request failed (${response.status}).`;
      try {
        const body = (await response.json()) as {
          detail?: string | Array<{ msg?: string }>;
          message?: string;
        };
        if (typeof body.detail === "string") message = body.detail;
        else if (Array.isArray(body.detail)) {
          message = body.detail.map((item) => item.msg).filter(Boolean).join(" ");
        } else if (body.message) message = body.message;
      } catch {
        // Keep the status-based message when the server does not return JSON.
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
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  try {
    return await apiRequest<T>(path, options, accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw error;
    try {
      const refreshed = await apiRequest<{ access_token: string; refresh_token?: string }>(
        "/api/v1/auth/refresh",
        { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) },
      );
      if (!refreshed.access_token) throw new ApiError("The server did not return a refreshed access token.");
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, refreshed.access_token);
      if (refreshed.refresh_token) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshed.refresh_token);
      }
      return await apiRequest<T>(path, options, refreshed.access_token);
    } catch (refreshError) {
      if (refreshError instanceof ApiError && refreshError.status === 401) {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
      throw refreshError;
    }
  }
}
