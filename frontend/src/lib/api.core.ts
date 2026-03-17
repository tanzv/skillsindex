interface ErrorPayload {
  error?: string;
  message?: string;
}

export interface APIRequestError extends Error {
  status?: number;
}

const localeStorageKey = "skillsindex.locale";
const apiBaseURL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const serverOriginURL = (() => {
  try {
    return new URL(apiBaseURL).origin;
  } catch {
    return "http://localhost:8080";
  }
})();

let csrfTokenCache = "";

export const serverBaseURL = serverOriginURL;

export function buildServerURL(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${serverOriginURL}${normalized}`;
}

export function clearCSRFTokenCache(): void {
  csrfTokenCache = "";
}

export function createAPIRequestError(status: number, message: string): APIRequestError {
  const error = new Error(message) as APIRequestError;
  error.status = status;
  return error;
}

export async function readResponseBody(response: Response): Promise<{ text: string; json: unknown | null }> {
  const text = await response.text();
  if (!text.trim()) {
    return { text, json: null };
  }

  try {
    return {
      text,
      json: JSON.parse(text)
    };
  } catch {
    return { text, json: null };
  }
}

export function resolveRequestAcceptLanguage(): string {
  if (typeof window === "undefined") {
    return "en";
  }

  try {
    const storedLocale = window.localStorage.getItem(localeStorageKey);
    if (storedLocale === "en" || storedLocale === "zh") {
      return storedLocale;
    }
  } catch {
    // Ignore localStorage access failures and fallback to navigator language.
  }

  const browserLanguage = String(window.navigator.language || "").trim().toLowerCase();
  if (browserLanguage.startsWith("zh")) {
    return "zh";
  }
  return "en";
}

export async function ensureCSRFToken(): Promise<string> {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  const response = await fetch(`${apiBaseURL}/api/v1/auth/csrf`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Accept-Language": resolveRequestAcceptLanguage()
    },
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to initialize CSRF token");
  }

  const payload = (await response.json()) as { csrf_token?: string };
  const token = String(payload.csrf_token || "").trim();
  if (!token) {
    throw new Error("Invalid CSRF token response");
  }

  csrfTokenCache = token;
  return token;
}

export async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || "GET").toUpperCase();
  const headers = new Headers(init?.headers || {});
  const isFormDataPayload = typeof FormData !== "undefined" && init?.body instanceof FormData;

  if (!headers.has("Content-Type") && init?.body && !isFormDataPayload) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", resolveRequestAcceptLanguage());
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = await ensureCSRFToken();
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${apiBaseURL}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    const { text, json } = await readResponseBody(response);
    let details = `HTTP ${response.status}`;
    if (json && typeof json === "object") {
      const payload = json as ErrorPayload;
      details = payload.message || payload.error || details;
    } else if (text.trim()) {
      details = text;
    }
    throw createAPIRequestError(response.status, details);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const { json } = await readResponseBody(response);
  if (json === null) {
    throw new Error("Invalid JSON response");
  }

  return json as T;
}
