import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAuthProviders, login, resolveRequestAcceptLanguage, shouldFetchAuthProviders } from "./api";

const originalWindow = globalThis.window;

function setMockWindow(storedLocale: string | null, browserLanguage: string, throwsOnRead: boolean = false): void {
  const localStorage = {
    getItem: vi.fn(() => {
      if (throwsOnRead) {
        throw new Error("localStorage unavailable");
      }
      return storedLocale;
    })
  };
  const mockWindow = {
    localStorage,
    navigator: {
      language: browserLanguage
    }
  } as unknown as Window;

  Object.defineProperty(globalThis, "window", {
    value: mockWindow,
    configurable: true,
    writable: true
  });
}

afterEach(() => {
  if (typeof originalWindow === "undefined") {
    Reflect.deleteProperty(globalThis, "window");
  } else {
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      configurable: true,
      writable: true
    });
  }
  vi.unstubAllGlobals();
});

describe("resolveRequestAcceptLanguage", () => {
  it("returns english in non-browser runtime", () => {
    Reflect.deleteProperty(globalThis, "window");
    expect(resolveRequestAcceptLanguage()).toBe("en");
  });

  it("prioritizes stored locale", () => {
    setMockWindow("zh", "en-US");
    expect(resolveRequestAcceptLanguage()).toBe("zh");
  });

  it("falls back to browser language when stored locale is invalid", () => {
    setMockWindow("fr", "zh-CN");
    expect(resolveRequestAcceptLanguage()).toBe("zh");
  });

  it("falls back to browser language when localStorage is inaccessible", () => {
    setMockWindow(null, "zh-Hans", true);
    expect(resolveRequestAcceptLanguage()).toBe("zh");
  });

  it("applies Accept-Language header to csrf and login requests", async () => {
    setMockWindow("zh", "en-US");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ csrf_token: "csrf-token-for-test" })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          user: {
            id: 1,
            username: "account-user",
            display_name: "Account User",
            role: "viewer",
            status: "active"
          }
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    await login("account-user", "Account123!");

    const csrfRequestInit = (fetchMock.mock.calls[0]?.[1] ?? {}) as RequestInit;
    const loginRequestInit = (fetchMock.mock.calls[1]?.[1] ?? {}) as RequestInit;

    expect(new Headers(csrfRequestInit.headers).get("Accept-Language")).toBe("zh");
    expect(new Headers(loginRequestInit.headers).get("Accept-Language")).toBe("zh");
  });
});

describe("fetchAuthProviders", () => {
  it("returns an empty provider list when the optional endpoint is unavailable", async () => {
    setMockWindow("en", "en-US");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "not_found", message: "Not Found" }),
      text: async () => "Not Found"
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchAuthProviders()).resolves.toEqual({
      ok: true,
      auth_providers: [],
      items: []
    });
  });

  it("preserves non-404 errors for provider loading", async () => {
    setMockWindow("en", "en-US");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "server_error", message: "Server exploded" }),
      text: async () => "Server exploded"
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchAuthProviders()).rejects.toThrow("Server exploded");
  });
});

describe("shouldFetchAuthProviders", () => {
  it("skips optional provider loading for cross-origin development by default", () => {
    expect(shouldFetchAuthProviders("http://localhost:5173")).toBe(false);
  });

  it("allows provider loading when the app shares the backend origin", () => {
    expect(shouldFetchAuthProviders("http://localhost:8080")).toBe(true);
  });

  it("supports forcing provider loading through an explicit mode override", () => {
    vi.stubEnv("VITE_LOGIN_AUTH_PROVIDERS_MODE", "always");
    expect(shouldFetchAuthProviders("http://localhost:5173")).toBe(true);
  });
});
