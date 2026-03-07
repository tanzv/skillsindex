export type PrototypeRouteFamily =
  | "public-home"
  | "public-skill"
  | "public-compare"
  | "public-login"
  | "workspace"
  | "governance"
  | "state"
  | "records-sync"
  | "admin-integrations"
  | "admin-access"
  | "admin-incidents"
  | "organization"
  | "admin-overview";

export type PrototypeRouteKey =
  | "public-home"
  | "public-skill"
  | "public-compare"
  | "public-login"
  | "workspace"
  | "governance"
  | "state-loading"
  | "state-empty"
  | "state-error"
  | "state-permission-denied"
  | "records-sync"
  | "admin-integrations"
  | "admin-access"
  | "admin-incidents"
  | "organization"
  | "admin-overview";

export interface PrototypeRouteResolution {
  family: PrototypeRouteFamily;
  key: PrototypeRouteKey;
  stateKind?: "loading" | "empty" | "error" | "permission";
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function stripPrototypePrefix(pathname: string): string {
  if (pathname === "/mobile/light" || pathname.startsWith("/mobile/light/")) {
    const stripped = pathname.slice("/mobile/light".length);
    return stripped || "/";
  }
  if (pathname === "/mobile" || pathname.startsWith("/mobile/")) {
    const stripped = pathname.slice("/mobile".length);
    return stripped || "/";
  }
  if (pathname === "/light" || pathname.startsWith("/light/")) {
    const stripped = pathname.slice("/light".length);
    return stripped || "/";
  }
  return pathname;
}

function matchesPath(pathname: string, routePrefix: string): boolean {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function resolvePrototypeRoute(pathname: string): PrototypeRouteResolution | null {
  const normalizedPath = normalizePath(pathname);
  const normalizedCorePath = normalizePath(stripPrototypePrefix(normalizedPath));

  if (normalizedCorePath === "/") {
    return { family: "public-home", key: "public-home" };
  }

  if (normalizedCorePath === "/compare") {
    return { family: "public-compare", key: "public-compare" };
  }

  if (/^\/skills\/\d+$/.test(normalizedCorePath)) {
    return { family: "public-skill", key: "public-skill" };
  }

  if (normalizedCorePath === "/login") {
    return { family: "public-login", key: "public-login" };
  }

  if (matchesPath(normalizedCorePath, "/rollout")) {
    return { family: "workspace", key: "workspace" };
  }

  if (matchesPath(normalizedCorePath, "/workspace")) {
    return { family: "workspace", key: "workspace" };
  }

  if (matchesPath(normalizedCorePath, "/governance")) {
    return { family: "governance", key: "governance" };
  }

  if (normalizedCorePath === "/states/loading") {
    return { family: "state", key: "state-loading", stateKind: "loading" };
  }
  if (normalizedCorePath === "/states/empty") {
    return { family: "state", key: "state-empty", stateKind: "empty" };
  }
  if (normalizedCorePath === "/states/error") {
    return { family: "state", key: "state-error", stateKind: "error" };
  }
  if (normalizedCorePath === "/states/permission-denied") {
    return { family: "state", key: "state-permission-denied", stateKind: "permission" };
  }

  if (
    matchesPath(normalizedCorePath, "/admin/records/exports") ||
    matchesPath(normalizedCorePath, "/admin/ingestion") ||
    matchesPath(normalizedCorePath, "/admin/records/imports") ||
    matchesPath(normalizedCorePath, "/admin/records/sync-jobs")
  ) {
    return { family: "records-sync", key: "records-sync" };
  }

  if (matchesPath(normalizedCorePath, "/admin/integrations")) {
    return { family: "admin-integrations", key: "admin-integrations" };
  }

  if (matchesPath(normalizedCorePath, "/admin/access")) {
    return { family: "admin-access", key: "admin-access" };
  }

  if (matchesPath(normalizedCorePath, "/admin/incidents")) {
    return { family: "admin-incidents", key: "admin-incidents" };
  }

  if (
    matchesPath(normalizedCorePath, "/admin/accounts") ||
    matchesPath(normalizedCorePath, "/admin/permissions/accounts") ||
    matchesPath(normalizedCorePath, "/admin/roles")
  ) {
    return { family: "organization", key: "organization" };
  }

  if (normalizedCorePath === "/admin" || normalizedCorePath === "/admin/overview") {
    return { family: "admin-overview", key: "admin-overview" };
  }

  return null;
}
