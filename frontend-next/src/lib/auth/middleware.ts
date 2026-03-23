import { workspaceOverviewRoute } from "../routing/protectedSurfaceLinks";
import { isProtectedRoute } from "../routing/routes";
import { publicAnonymousRoutePrefixes, publicLoginRoute } from "../routing/publicRouteRegistry";

export const sessionCookieName = "skillsindex_session";
export const defaultAuthenticatedRedirect = workspaceOverviewRoute;

const anonymousRoutePrefixes = publicAnonymousRoutePrefixes;
const internalBypassPrefixes = ["/_next", "/api/bff", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

function parseCookieHeader(headers: Headers): Map<string, string> {
  const cookieHeader = headers.get("cookie");
  const cookieMap = new Map<string, string>();

  if (!cookieHeader) {
    return cookieMap;
  }

  for (const rawSegment of cookieHeader.split(";")) {
    const segment = rawSegment.trim();
    if (!segment) {
      continue;
    }

    const separatorIndex = segment.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = segment.slice(0, separatorIndex).trim();
    const value = segment.slice(separatorIndex + 1).trim();
    if (key) {
      cookieMap.set(key, value);
    }
  }

  return cookieMap;
}

export function hasSessionCookie(headers: Headers): boolean {
  const cookieMap = parseCookieHeader(headers);
  return cookieMap.has(sessionCookieName);
}

export function shouldAllowAnonymousAccess(pathname: string): boolean {
  if (internalBypassPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }

  if (pathname === "/") {
    return true;
  }

  if (
    anonymousRoutePrefixes.some((prefix) => prefix !== "/" && (pathname === prefix || pathname.startsWith(`${prefix}/`)))
  ) {
    return true;
  }

  return !isProtectedRoute(pathname);
}

export function shouldRedirectAuthenticatedUser(pathname: string): boolean {
  return pathname === publicLoginRoute;
}
