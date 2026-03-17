export interface PublicRoutePrefixState {
  prefix: string;
  corePath: string;
  isLightTheme: boolean;
  isMobileLayout: boolean;
}

export interface PublicLinkTarget {
  href: string;
  as?: string;
}

const canonicalPublicRoutePrefixes = [
  "/",
  "/results",
  "/categories",
  "/rankings",
  "/rollout",
  "/timeline",
  "/governance",
  "/docs",
  "/about",
  "/login",
  "/skills",
  "/states"
] as const;

const compatibilityPublicRoutePrefixes = ["/search", "/compare"] as const;

function normalizePath(pathname: string): string {
  const trimmed = String(pathname || "").trim();
  if (!trimmed) {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

function normalizeSearch(search: string): string {
  const trimmed = String(search || "").trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("?") ? trimmed : `?${trimmed}`;
}

function splitRouteSuffix(route: string): { pathname: string; suffix: string } {
  const hashIndex = route.indexOf("#");
  const searchIndex = route.indexOf("?");
  const separatorIndex =
    hashIndex === -1 ? searchIndex : searchIndex === -1 ? hashIndex : Math.min(hashIndex, searchIndex);

  if (separatorIndex === -1) {
    return {
      pathname: route,
      suffix: ""
    };
  }

  return {
    pathname: route.slice(0, separatorIndex),
    suffix: route.slice(separatorIndex)
  };
}

function isExternalRoute(route: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(route) || route.startsWith("//") || route.startsWith("#");
}

export function splitPublicPathPrefix(pathname: string): PublicRoutePrefixState {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === "/mobile/light" || normalizedPath.startsWith("/mobile/light/")) {
    const suffix = normalizedPath.slice("/mobile/light".length) || "/";
    return {
      prefix: "/mobile/light",
      corePath: normalizePath(suffix),
      isLightTheme: true,
      isMobileLayout: true
    };
  }

  if (normalizedPath === "/mobile" || normalizedPath.startsWith("/mobile/")) {
    const suffix = normalizedPath.slice("/mobile".length) || "/";
    return {
      prefix: "/mobile",
      corePath: normalizePath(suffix),
      isLightTheme: false,
      isMobileLayout: true
    };
  }

  if (normalizedPath === "/light" || normalizedPath.startsWith("/light/")) {
    const suffix = normalizedPath.slice("/light".length) || "/";
    return {
      prefix: "/light",
      corePath: normalizePath(suffix),
      isLightTheme: true,
      isMobileLayout: false
    };
  }

  return {
    prefix: "",
    corePath: normalizedPath,
    isLightTheme: false,
    isMobileLayout: false
  };
}

export function withPublicPathPrefix(prefix: string, route: string): string {
  const normalizedRoute = normalizePath(route);
  return prefix ? `${prefix}${normalizedRoute}` : normalizedRoute;
}

export function buildPublicPrefix(isLightTheme: boolean, isMobileLayout: boolean): string {
  if (isMobileLayout && isLightTheme) {
    return "/mobile/light";
  }

  if (isMobileLayout) {
    return "/mobile";
  }

  if (isLightTheme) {
    return "/light";
  }

  return "";
}

export function isCanonicalPublicCorePath(pathname: string): boolean {
  const normalizedPath = normalizePath(pathname);

  return canonicalPublicRoutePrefixes.some((prefix) =>
    prefix === "/" ? normalizedPath === "/" : normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  );
}

function isDisplayablePublicCorePath(pathname: string): boolean {
  const normalizedPath = normalizePath(pathname);

  return (
    isCanonicalPublicCorePath(normalizedPath) ||
    compatibilityPublicRoutePrefixes.some((prefix) =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
    )
  );
}

export function buildPublicLinkTarget(prefix: string, route: string): PublicLinkTarget {
  const trimmedRoute = String(route || "").trim();

  if (!trimmedRoute || isExternalRoute(trimmedRoute)) {
    return { href: trimmedRoute || "/" };
  }

  const { pathname, suffix } = splitRouteSuffix(trimmedRoute);
  const normalizedPath = normalizePath(pathname);
  const href = `${normalizedPath}${suffix}`;

  if (!prefix || !isDisplayablePublicCorePath(normalizedPath)) {
    return { href };
  }

  return {
    href,
    as: `${withPublicPathPrefix(prefix, normalizedPath)}${suffix}`
  };
}

export function buildPublicRouteCompatibilityRewrite(pathname: string, search = ""): string | null {
  const { prefix, corePath } = splitPublicPathPrefix(pathname);
  const normalizedSearch = normalizeSearch(search);

  if (!prefix || !isCanonicalPublicCorePath(corePath)) {
    return null;
  }

  return `${corePath}${normalizedSearch}`;
}

export function buildPublicRouteCompatibilityRedirect(pathname: string, search = ""): string | null {
  const { prefix, corePath } = splitPublicPathPrefix(pathname);
  const normalizedSearch = normalizeSearch(search);

  if (corePath === "/search") {
    return `${withPublicPathPrefix(prefix, "/results")}${normalizedSearch}`;
  }

  if (corePath === "/compare") {
    return `${withPublicPathPrefix(prefix, "/rankings")}${normalizedSearch}`;
  }

  return null;
}
