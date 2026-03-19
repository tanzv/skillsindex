const serverBackendBaseURLEnvName = "SKILLSINDEX_SERVER_API_BASE_URL";
const htmlContentTypePattern = /\btext\/html\b/i;

export const defaultBackendBaseURL = "http://localhost:8080";

interface FetchBackendOptions {
  backendBaseURL?: string;
  fetchImpl?: typeof fetch;
}

interface BackendConnectionError extends Error {
  cause?: {
    code?: string;
  };
}

function normalizeBaseURL(baseURL: string | null | undefined): string | null {
  const normalizedValue = String(baseURL || "").trim().replace(/\/$/, "");
  return normalizedValue || null;
}

function isLoopbackBaseURL(baseURL: string): boolean {
  try {
    const { hostname } = new URL(baseURL);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function shouldRetryAgainstDefaultBackend(primaryBaseURL: string): boolean {
  return isLoopbackBaseURL(primaryBaseURL) && primaryBaseURL !== defaultBackendBaseURL;
}

function isRetryableConnectionError(error: unknown): boolean {
  const code = (error as BackendConnectionError | undefined)?.cause?.code;
  return code === "ECONNREFUSED";
}

function shouldRetryAgainstDefaultBackendResponse(primaryBaseURL: string, response: Response): boolean {
  if (!shouldRetryAgainstDefaultBackend(primaryBaseURL)) {
    return false;
  }

  const contentType = response.headers.get("content-type") || "";
  return htmlContentTypePattern.test(contentType);
}

export function buildBackendURL(path: string, baseURL: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseURL}${normalizedPath}`;
}

export function resolveBackendBaseURL(preferredBaseURL?: string | null): string {
  return (
    normalizeBaseURL(preferredBaseURL) ||
    normalizeBaseURL(process.env[serverBackendBaseURLEnvName]) ||
    normalizeBaseURL(process.env.NEXT_PUBLIC_API_BASE_URL) ||
    defaultBackendBaseURL
  );
}

export function resolveBackendRequestTargets(preferredBaseURL?: string | null): string[] {
  const primaryBaseURL = resolveBackendBaseURL(preferredBaseURL);
  if (!shouldRetryAgainstDefaultBackend(primaryBaseURL)) {
    return [primaryBaseURL];
  }

  return [primaryBaseURL, defaultBackendBaseURL];
}

export async function fetchBackend(path: string, init: RequestInit, options: FetchBackendOptions = {}): Promise<Response> {
  const fetchImpl = options.fetchImpl || fetch;
  const targets = resolveBackendRequestTargets(options.backendBaseURL);
  let lastError: unknown;

  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];

    try {
      const response = await fetchImpl(buildBackendURL(path, target), init);
      const hasFallbackTarget = index < targets.length - 1;

      if (hasFallbackTarget && shouldRetryAgainstDefaultBackendResponse(target, response)) {
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      const hasFallbackTarget = index < targets.length - 1;
      if (!hasFallbackTarget || !isRetryableConnectionError(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Backend request failed");
}
