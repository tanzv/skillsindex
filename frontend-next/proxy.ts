import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildLoginRedirectPath } from "@/src/lib/auth/guards";
import {
  hasSessionCookie,
  shouldAllowAnonymousAccess
} from "@/src/lib/auth/middleware";
import {
  buildPublicRouteCompatibilityRedirect,
  buildPublicRouteCompatibilityRewrite,
  splitPublicPathPrefix
} from "@/src/lib/routing/publicCompat";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const originalPublicPathname = request.headers.get("x-public-original-pathname") || pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-public-original-pathname", originalPublicPathname);
  const routeRedirect = buildPublicRouteCompatibilityRedirect(pathname, search);

  if (routeRedirect) {
    return NextResponse.redirect(new URL(routeRedirect, request.url));
  }

  const routeRewrite = buildPublicRouteCompatibilityRewrite(pathname, search);
  const effectivePathname = routeRewrite ? splitPublicPathPrefix(pathname).corePath : pathname;

  if (shouldAllowAnonymousAccess(effectivePathname)) {
    if (routeRewrite) {
      return NextResponse.rewrite(new URL(routeRewrite, request.url), {
        request: { headers: requestHeaders }
      });
    }

    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  if (hasSessionCookie(request.headers)) {
    if (routeRewrite) {
      return NextResponse.rewrite(new URL(routeRewrite, request.url), {
        request: { headers: requestHeaders }
      });
    }

    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  const targetPath = `${pathname}${search}`;
  return NextResponse.redirect(new URL(buildLoginRedirectPath(targetPath), request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
