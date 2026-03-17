export function getRequestCookieHeader(headers: Headers): string | null {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const normalized = cookieHeader.trim();
  return normalized ? normalized : null;
}

export function applyForwardedCookie(headers: Headers, cookieHeader: string | null | undefined): void {
  if (!cookieHeader) {
    return;
  }

  headers.set("cookie", cookieHeader);
}

export function getSetCookieHeaders(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const singleHeader = headers.get("set-cookie");
  return singleHeader ? [singleHeader] : [];
}
