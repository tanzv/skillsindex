const defaultCSRFCookieNames = ["skillsindex_csrf", "csrf_token"] as const;

export function isMutationMethod(method: string): boolean {
  const normalized = method.toUpperCase();
  return !["GET", "HEAD", "OPTIONS"].includes(normalized);
}

export function readCSRFCookie(
  cookieHeader: string,
  cookieNames: readonly string[] = defaultCSRFCookieNames
): string | null {
  const normalized = cookieHeader.trim();
  if (!normalized) {
    return null;
  }

  const segments = normalized.split(";");
  for (const segment of segments) {
    const [rawName, ...rawValueParts] = segment.trim().split("=");
    if (!cookieNames.includes(rawName)) {
      continue;
    }

    const rawValue = rawValueParts.join("=").trim();
    return rawValue || null;
  }

  return null;
}

export function applyCSRFToken(headers: Headers, method: string, cookieHeader: string | null | undefined): void {
  if (!isMutationMethod(method) || headers.has("x-csrf-token")) {
    return;
  }

  const csrfToken = readCSRFCookie(cookieHeader || "");
  if (csrfToken) {
    headers.set("x-csrf-token", csrfToken);
  }
}
