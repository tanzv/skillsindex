import { resolveAdminBase, resolvePublicBase, toPublicRoute } from "./prototypePageTheme";

export interface PublicPageNavigator {
  publicBase: string;
  adminBase: string;
  toPublic: (route: string) => string;
  toAdmin: (route: string) => string;
  toApp: (route: string) => string;
}

interface NormalizedRoute {
  path: string;
  suffix: string;
}

function normalizeRoute(route: string): NormalizedRoute {
  const raw = String(route || "").trim();
  const resolved = raw || "/";
  const queryIndex = resolved.indexOf("?");
  const hashIndex = resolved.indexOf("#");
  const splitIndex =
    queryIndex === -1 ? hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
  const pathPart = splitIndex === -1 ? resolved : resolved.slice(0, splitIndex);
  const suffix = splitIndex === -1 ? "" : resolved.slice(splitIndex);
  const normalizedPath = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;

  return {
    path: normalizedPath || "/",
    suffix
  };
}

function isAdminRoute(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/");
}

export function createPublicPageNavigator(pathname: string): PublicPageNavigator {
  const publicBase = resolvePublicBase(pathname);
  const adminBase = resolveAdminBase(pathname);

  function toPublic(route: string): string {
    const normalized = normalizeRoute(route);
    return `${toPublicRoute(publicBase, normalized.path)}${normalized.suffix}`;
  }

  function toAdmin(route: string): string {
    const normalized = normalizeRoute(route);
    if (!isAdminRoute(normalized.path)) {
      return toPublic(route);
    }
    const adminSuffix = normalized.path.slice("/admin".length);
    return `${adminBase}${adminSuffix}${normalized.suffix}`;
  }

  function toApp(route: string): string {
    const normalized = normalizeRoute(route);
    if (isAdminRoute(normalized.path)) {
      return toAdmin(route);
    }
    return toPublic(route);
  }

  return {
    publicBase,
    adminBase,
    toPublic,
    toAdmin,
    toApp
  };
}
