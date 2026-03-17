import { buildBackendURL, resolveBackendBaseURL } from "../http/backend";

const backendAPIPrefix = "/api/v1";

export function buildBackendProxyPath(pathSegments: string[], search = ""): string {
  const normalizedSegments = pathSegments
    .map((segment) => String(segment || "").trim())
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));
  const pathname = normalizedSegments.length > 0 ? `${backendAPIPrefix}/${normalizedSegments.join("/")}` : backendAPIPrefix;
  return search ? `${pathname}?${search}` : pathname;
}

export function resolveBackendURL(path: string): string {
  return buildBackendURL(path, resolveBackendBaseURL());
}

export function appendSetCookieHeaders(target: Headers, source: Headers): void {
  const values = new Set<string>();
  const getSetCookie = (source as Headers & { getSetCookie?: () => string[] }).getSetCookie;

  if (typeof getSetCookie === "function") {
    for (const value of getSetCookie.call(source)) {
      if (value) {
        values.add(value);
      }
    }
  } else {
    const setCookie = source.get("set-cookie");
    if (setCookie) {
      values.add(setCookie);
    }
  }

  for (const value of values) {
    target.append("set-cookie", value);
  }
}

export function buildProxyResponseHeaders(source: Headers): Headers {
  const target = new Headers({
    "cache-control": "no-store, max-age=0, must-revalidate"
  });
  const responseContentType = source.get("content-type");
  if (responseContentType) {
    target.set("content-type", responseContentType);
  }
  const location = source.get("location");
  if (location) {
    target.set("location", location);
  }
  appendSetCookieHeaders(target, source);
  return target;
}

export function mergeCookieHeaders(currentCookieHeader: string | null, setCookieHeaders: string[]): string | null {
  const cookieMap = new Map<string, string>();

  if (currentCookieHeader) {
    for (const rawCookie of currentCookieHeader.split(";")) {
      const [rawName, ...rawValueParts] = rawCookie.trim().split("=");
      const name = rawName?.trim();
      if (!name) {
        continue;
      }
      cookieMap.set(name, rawValueParts.join("=").trim());
    }
  }

  for (const setCookieHeader of setCookieHeaders) {
    const [cookiePair] = setCookieHeader.split(";", 1);
    const [rawName, ...rawValueParts] = cookiePair.trim().split("=");
    const name = rawName?.trim();
    if (!name) {
      continue;
    }
    cookieMap.set(name, rawValueParts.join("=").trim());
  }

  if (cookieMap.size === 0) {
    return null;
  }

  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}
