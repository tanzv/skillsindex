import type { AuthProvidersResponse, SessionContextResponse, SessionUser } from "./api.types";
import { APIRequestError, clearCSRFTokenCache, requestJSON, serverBaseURL } from "./api.core";

type AuthProvidersFetchMode = "auto" | "always" | "never";

function resolveAuthProvidersFetchMode(rawMode: string | undefined): AuthProvidersFetchMode {
  switch (String(rawMode || "").trim().toLowerCase()) {
    case "always":
      return "always";
    case "never":
      return "never";
    default:
      return "auto";
  }
}

function readRuntimeAuthProvidersFetchMode(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return String(
    (
      window as Window & {
        __SKILLSINDEX_LOGIN_AUTH_PROVIDERS_MODE__?: unknown;
      }
    ).__SKILLSINDEX_LOGIN_AUTH_PROVIDERS_MODE__ || ""
  ).trim();
}

export function shouldFetchAuthProviders(currentOrigin?: string): boolean {
  const runtimeMode = readRuntimeAuthProvidersFetchMode();
  const mode = resolveAuthProvidersFetchMode(runtimeMode || import.meta.env.VITE_LOGIN_AUTH_PROVIDERS_MODE);
  if (mode === "always") {
    return true;
  }
  if (mode === "never") {
    return false;
  }
  return String(currentOrigin || "").trim() === serverBaseURL;
}

export async function login(username: string, password: string): Promise<SessionUser> {
  const payload = await requestJSON<{ user: SessionUser }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  return payload.user;
}

export async function getSessionContext(): Promise<SessionContextResponse> {
  try {
    const payload = await requestJSON<Partial<SessionContextResponse>>("/api/v1/auth/me", {
      method: "GET"
    });
    return {
      user: payload.user || null,
      marketplace_public_access: payload.marketplace_public_access !== false
    };
  } catch {
    return {
      user: null,
      marketplace_public_access: true
    };
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const payload = await getSessionContext();
  return payload.user;
}

export async function logout(): Promise<void> {
  await requestJSON<{ ok: boolean }>("/api/v1/auth/logout", {
    method: "POST"
  });
  clearCSRFTokenCache();
}

export async function fetchAuthProviders(): Promise<AuthProvidersResponse> {
  try {
    return await requestJSON<AuthProvidersResponse>("/api/v1/auth/providers", {
      method: "GET"
    });
  } catch (error) {
    if ((error as APIRequestError).status === 404) {
      return {
        ok: true,
        auth_providers: [],
        items: []
      };
    }
    throw error;
  }
}
