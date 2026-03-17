import type { ConsoleFormSubmissionResult } from "./api.types";
import {
  createAPIRequestError,
  ensureCSRFToken,
  requestJSON,
  resolveRequestAcceptLanguage,
  serverBaseURL
} from "./api.core";

function normalizeServerPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function extractRedirectFeedback(responseURL: string): ConsoleFormSubmissionResult {
  const resolvedURL = new URL(responseURL || serverBaseURL, serverBaseURL);
  const message = String(resolvedURL.searchParams.get("msg") || "").trim();
  const error = String(resolvedURL.searchParams.get("err") || "").trim();
  const redirectedTo = `${resolvedURL.pathname}${resolvedURL.search}` || "/";

  return {
    ok: error.length === 0,
    message,
    error,
    redirectedTo
  };
}

export async function fetchConsoleJSON<T = Record<string, unknown>>(path: string): Promise<T> {
  return requestJSON<T>(path, { method: "GET" });
}

export async function postConsoleJSON<T = Record<string, unknown>>(
  path: string,
  payload?: Record<string, unknown>
): Promise<T> {
  if (payload && Object.keys(payload).length > 0) {
    return requestJSON<T>(path, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
  return requestJSON<T>(path, {
    method: "POST"
  });
}

export async function postConsoleMultipartJSON<T = Record<string, unknown>>(path: string, payload: FormData): Promise<T> {
  return requestJSON<T>(path, {
    method: "POST",
    body: payload
  });
}

export async function postConsoleForm(
  path: string,
  payload: URLSearchParams | FormData
): Promise<ConsoleFormSubmissionResult> {
  const headers = new Headers({
    "Accept-Language": resolveRequestAcceptLanguage()
  });
  const csrfToken = await ensureCSRFToken();
  headers.set("X-CSRF-Token", csrfToken);

  if (payload instanceof URLSearchParams) {
    headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
  }

  const response = await fetch(`${serverBaseURL}${normalizeServerPath(path)}`, {
    method: "POST",
    headers,
    body: payload,
    credentials: "include",
    redirect: "follow"
  });

  const redirectFeedback = extractRedirectFeedback(response.url);
  if (!response.ok && !redirectFeedback.error) {
    let details = `HTTP ${response.status}`;
    try {
      const text = await response.text();
      if (text.trim()) {
        details = text;
      }
    } catch {
      // Ignore body parsing errors and keep the default status message.
    }
    throw createAPIRequestError(response.status, details);
  }

  return redirectFeedback;
}
