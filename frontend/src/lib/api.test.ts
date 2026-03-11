import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchAuthProviders,
  fetchConsoleJSON,
  getSessionContext,
  login,
  postConsoleForm,
  postConsoleMultipartJSON,
  resolveRequestAcceptLanguage,
  shouldFetchAuthProviders
} from "./api";

const originalWindow = globalThis.window;

function createJSONResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

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
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createJSONResponse({ csrf_token: "csrf-token-for-test" }))
      .mockResolvedValueOnce(
        createJSONResponse({
          user: {
            id: 1,
            username: "account-user",
            display_name: "Account User",
            role: "viewer",
            status: "active"
          }
        })
      );
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

describe("getSessionContext", () => {
  it("returns the auth session and marketplace access flag", async () => {
    setMockWindow("en", "en-US");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      createJSONResponse({
        user: {
          id: 7,
          username: "account-user",
          display_name: "Account User",
          role: "viewer",
          status: "active"
        },
        marketplace_public_access: false
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSessionContext()).resolves.toEqual({
      user: {
        id: 7,
        username: "account-user",
        display_name: "Account User",
        role: "viewer",
        status: "active"
      },
      marketplace_public_access: false
    });

    const requestInit = (fetchMock.mock.calls[0]?.[1] ?? {}) as RequestInit;
    expect(new Headers(requestInit.headers).get("Accept-Language")).toBe("en");
  });

  it("falls back to anonymous public access when the session probe fails", async () => {
    setMockWindow("en", "en-US");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response("session probe failed", {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSessionContext()).resolves.toEqual({
      user: null,
      marketplace_public_access: true
    });
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

describe("postConsoleMultipartJSON", () => {
  it("submits multipart payload without forcing json content type", async () => {
    const fetchMock = vi.fn<typeof fetch>((input) => {
      const requestURL = String(input);
      if (requestURL.includes("/api/v1/auth/csrf")) {
        return Promise.resolve(createJSONResponse({ csrf_token: "csrf-token" }));
      }
      return Promise.resolve(createJSONResponse({ message: "Archive skill imported" }, 201));
    });

    vi.stubGlobal("fetch", fetchMock);

    const payload = new FormData();
    payload.set("archive", new Blob(["archive-content"], { type: "application/zip" }), "skill.zip");
    payload.set("visibility", "private");

    const response = await postConsoleMultipartJSON<{ message?: string }>("/api/v1/admin/ingestion/upload", payload);

    expect(response.message).toBe("Archive skill imported");
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(1);

    const uploadRequestIndex = fetchMock.mock.calls.findIndex(([input]) =>
      !String(input).includes("/api/v1/auth/csrf")
    );
    expect(uploadRequestIndex).toBeGreaterThanOrEqual(0);

    const requestInit = fetchMock.mock.calls[uploadRequestIndex]?.[1];
    const headers = new Headers(requestInit?.headers);
    expect(headers.has("Content-Type")).toBe(false);
    expect(requestInit?.body).toBe(payload);
  });
});

describe("fetchConsoleJSON", () => {
  it("surfaces plain-text error bodies without re-reading the response stream", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response("missing repository inventory route", {
        status: 404,
        headers: { "Content-Type": "text/plain" }
      })
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchConsoleJSON("/api/v1/admin/skills")).rejects.toMatchObject({
      status: 404,
      message: "missing repository inventory route"
    });
  });
});

describe("postConsoleForm", () => {
  it("submits form payloads and extracts redirect feedback", async () => {
    const csrfResponse = createJSONResponse({ csrf_token: "csrf-token" });
    Object.defineProperty(csrfResponse, "url", {
      value: "http://localhost:8080/dashboard?msg=Repository+sync+finished",
      configurable: true
    });

    const redirectResponse = {
      ok: true,
      status: 200,
      url: "http://localhost:8080/dashboard?msg=Repository+sync+finished",
      text: vi.fn().mockResolvedValue("")
    } as unknown as Response;

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(csrfResponse)
      .mockResolvedValueOnce(redirectResponse);

    vi.stubGlobal("fetch", fetchMock);

    const payload = new URLSearchParams({ limit: "50" });
    const response = await postConsoleForm("/admin/sync/repositories", payload);

    expect(response.ok).toBe(true);
    expect(response.message).toBe("Repository sync finished");
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(1);

    const requestInit = fetchMock.mock.calls.at(-1)?.[1];
    const headers = new Headers(requestInit?.headers);
    expect(headers.get("Content-Type")).toBe("application/x-www-form-urlencoded;charset=UTF-8");
    expect(requestInit?.body).toBe(payload);
  });
});
