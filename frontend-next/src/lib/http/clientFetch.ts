import { createRequestError, extractErrorPayload } from "./requestErrors";

export interface ClientFetchJSONOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | Record<string, unknown>;
  fetchImpl?: typeof fetch;
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

function resolveRequestBody(body: ClientFetchJSONOptions["body"], headers: Headers): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (typeof body === "string" || body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
    return body;
  }

  headers.set("content-type", "application/json");
  return JSON.stringify(body);
}

export async function clientFetchJSON<T>(path: string, options: ClientFetchJSONOptions = {}): Promise<T> {
  const fetchImpl = options.fetchImpl || fetch;
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});

  headers.set("accept", "application/json");
  const body = resolveRequestBody(options.body, headers);
  const response = await fetchImpl(path, {
    ...options,
    method,
    headers,
    body,
    credentials: "include"
  });

  if (!response.ok) {
    throw createRequestError(response.status, await extractErrorPayload(response));
  }

  return (await parseJSONResponse(response)) as T;
}
