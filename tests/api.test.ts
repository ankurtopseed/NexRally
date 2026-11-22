import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { apiRequest, authedRequest, hasSession, loginSession, logoutSession, optionallyAuthedRequest, setUnauthorizedHandler } from "../lib/api";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

jest.mock("expo/virtual/env", () => ({ env: {} }));
jest.mock("expo-secure-store", () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn() }));
jest.mock("react-native", () => ({ Platform: { OS: "web" } }));
Object.assign(globalThis, { __DEV__: true });

const json = (body: object, status = 200) => new Response(JSON.stringify(body), { status });
const initial = { access_token: "access-1", refresh_token: "refresh-1" };
const rotated = { access_token: "access-2", refresh_token: "refresh-2" };

afterEach(async () => {
  jest.restoreAllMocks();
  setUnauthorizedHandler();
  if (await hasSession()) {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await logoutSession();
  }
  jest.restoreAllMocks();
});

describe("mobile API client", () => {
  it("allows anonymous public requests and includes the session when signed in", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json([]))
      .mockResolvedValueOnce(json(initial))
      .mockResolvedValueOnce(json([]));
    await optionallyAuthedRequest("/api/events");
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization")).toBeNull();
    await loginSession("player@example.com", "password");
    await optionallyAuthedRequest("/api/events");
    expect(new Headers(fetchMock.mock.calls[2][1]?.headers).get("Authorization")).toBe("Bearer access-1");
  });

  it("uses mobile login, bearer authentication and no cookies", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json(initial))
      .mockResolvedValueOnce(json({ message: "saved" }));
    await loginSession("player@example.com", "password");
    await authedRequest("/api/players/me", { method: "PUT", body: JSON.stringify({ first_name: "A" }) });
    expect(fetchMock.mock.calls[0][0]).toContain("/api/auth/mobile/login");
    const options = fetchMock.mock.calls[1][1]!;
    expect(options.credentials).toBe("omit");
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer access-1");
    expect(new Headers(options.headers).get("Content-Type")).toBe("application/json");
  });

  it("rotates the refresh token once for concurrent expired requests", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch").mockImplementation(async (input, options) => {
      const url = String(input);
      if (url.endsWith("/mobile/login")) return json(initial);
      if (url.endsWith("/mobile/refresh")) {
        expect(JSON.parse(String(options?.body))).toEqual({ refresh_token: "refresh-1" });
        return json(rotated);
      }
      return new Headers(options?.headers).get("Authorization") === "Bearer access-1"
        ? json({ detail: "Expired" }, 401) : json({ ok: true });
    });
    await loginSession("player@example.com", "password");
    await expect(Promise.all([authedRequest("/api/a"), authedRequest("/api/b")]))
      .resolves.toEqual([{ ok: true }, { ok: true }]);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/mobile/refresh"))).toHaveLength(1);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await logoutSession();
    const logoutCall = fetchMock.mock.calls.find(([url]) => String(url).endsWith("/mobile/logout"));
    expect(JSON.parse(String(logoutCall?.[1]?.body))).toEqual({ refresh_token: "refresh-2" });
    expect(await hasSession()).toBe(false);
  });

  it("clears an invalid refresh session but preserves it on network failure", async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    const fetchMock = jest.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json(initial))
      .mockResolvedValueOnce(json({ detail: "Expired" }, 401))
      .mockRejectedValueOnce(new Error("offline"));
    await loginSession("player@example.com", "password");
    await expect(authedRequest("/api/auth/me")).rejects.toThrow("offline");
    expect(await hasSession()).toBe(true);
    fetchMock.mockResolvedValueOnce(json({ detail: "Expired" }, 401))
      .mockResolvedValueOnce(json({ detail: "Refresh expired" }, 401));
    await expect(authedRequest("/api/auth/me")).rejects.toMatchObject({ status: 401 });
    expect(await hasSession()).toBe(false);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("surfaces API validation errors", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(json({ detail: [{ msg: "Invalid profile" }] }, 422));
    await expect(apiRequest("/api/auth/register")).rejects.toMatchObject({ message: "Invalid profile", status: 422 });
  });

  it("persists and removes a native session with SecureStore", async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
    let saved: string | null = null;
    jest.mocked(SecureStore.setItemAsync).mockImplementation(async (_key, value) => { saved = value; });
    jest.mocked(SecureStore.getItemAsync).mockImplementation(async () => saved);
    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async () => { saved = null; });
    jest.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json(initial))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    try {
      await loginSession("player@example.com", "password");
      expect(await hasSession()).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("ttcl.mobile-session", JSON.stringify(initial));
      await logoutSession();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("ttcl.mobile-session");
      expect(await hasSession()).toBe(false);
    } finally {
      Object.defineProperty(Platform, "OS", { value: originalOS, configurable: true });
    }
  });
});
