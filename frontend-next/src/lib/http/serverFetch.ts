import { createRequestError, extractErrorPayload } from "./requestErrors";
import { applyForwardedCookie, getRequestCookieHeader } from "../bff/cookies";
import { applyCSRFToken } from "../bff/csrf";
import { fetchBackend } from "./backend";

export interface ServerFetchJSONOptions extends Omit<RequestInit, "body"> {
  backendBaseURL?: string;
  body?: BodyInit | Record<string, unknown>;
  fetchImpl?: typeof fetch;
  requestHeaders: Headers;
}

async function parseJSONResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return {};
  }

  const responseText = await response.text();
  if (!responseText.trim()) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("Invalid JSON response");
  }
}

function resolveServerRequestBody(body: ServerFetchJSONOptions["body"], headers: Headers): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (typeof body === "string" || body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
    return body;
  }

  headers.set("content-type", "application/json");
  return JSON.stringify(body);
}

export async function serverFetchJSON<T>(path: string, options: ServerFetchJSONOptions): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  const cookieHeader = getRequestCookieHeader(options.requestHeaders);

  headers.set("accept", "application/json");
  applyForwardedCookie(headers, cookieHeader);
  applyCSRFToken(headers, method, cookieHeader);

  const body = resolveServerRequestBody(options.body, headers);
  const response = await fetchBackend(
    path,
    {
      ...options,
      method,
      headers,
      body
    },
    {
      backendBaseURL: options.backendBaseURL,
      fetchImpl: options.fetchImpl
    }
  );

  if (!response.ok) {
    throw createRequestError(response.status, await extractErrorPayload(response));
  }

  return (await parseJSONResponse(response)) as T;
}
