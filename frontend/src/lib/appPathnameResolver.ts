import { protectedRoutes, workspaceRoutes, type ProtectedRoute } from "../appNavigationConfig";
import { matchPrototypeCatalog } from "./prototypeCatalog";

export type PublicRoute =
  | "/"
  | "/results"
  | "/login"
  | "/compare"
  | "/docs"
  | "/categories"
  | "/categories/:slug"
  | "/rankings"
  | "/skills/:id"
  | "/prototype";
export type AppRoute = PublicRoute | ProtectedRoute;

export interface AppPathnameResolverDependencies {
  protectedRoutes: readonly ProtectedRoute[];
  matchPrototypeCatalog: (pathname: string) => unknown;
}

const defaultDependencies: AppPathnameResolverDependencies = {
  protectedRoutes,
  matchPrototypeCatalog
};

const promotedWorkspaceRoutes = [...workspaceRoutes].sort((left, right) => right.length - left.length);

function normalizeTrailingSlash(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function stripPublicPrefix(pathname: string): string {
  if (pathname === "/mobile/light" || pathname.startsWith("/mobile/light/")) {
    return pathname.slice("/mobile/light".length) || "/";
  }
  if (pathname === "/mobile" || pathname.startsWith("/mobile/")) {
    return pathname.slice("/mobile".length) || "/";
  }
  if (pathname === "/light" || pathname.startsWith("/light/")) {
    return pathname.slice("/light".length) || "/";
  }
  return pathname;
}

function resolvePromotedProtectedRoute(pathname: string): ProtectedRoute | null {
  const normalizedCorePath = normalizeTrailingSlash(stripPublicPrefix(pathname));

  if (normalizedCorePath === "/admin/accounts/new" || normalizedCorePath.startsWith("/admin/accounts/new/")) {
    return "/admin/accounts/new";
  }
  if (normalizedCorePath === "/admin/accounts" || normalizedCorePath.startsWith("/admin/accounts/")) {
    return "/admin/accounts";
  }
  if (normalizedCorePath === "/admin/permissions/accounts/new" || normalizedCorePath.startsWith("/admin/permissions/accounts/new/")) {
    return "/admin/accounts/new";
  }
  if (
    normalizedCorePath === "/admin/permissions/accounts" ||
    normalizedCorePath.startsWith("/admin/permissions/accounts/")
  ) {
    return "/admin/accounts";
  }
  if (normalizedCorePath === "/admin/roles/new" || normalizedCorePath.startsWith("/admin/roles/new/")) {
    return "/admin/roles/new";
  }
  if (normalizedCorePath === "/admin/roles" || normalizedCorePath.startsWith("/admin/roles/")) {
    return "/admin/roles";
  }

  if (normalizedCorePath === "/admin/ingestion/manual" || normalizedCorePath.startsWith("/admin/ingestion/manual/")) {
    return "/admin/ingestion/manual";
  }
  if (normalizedCorePath === "/admin/ingestion/repository" || normalizedCorePath.startsWith("/admin/ingestion/repository/")) {
    return "/admin/ingestion/repository";
  }
  if (normalizedCorePath === "/admin/records/imports" || normalizedCorePath.startsWith("/admin/records/imports/")) {
    return "/admin/records/imports";
  }
  if (normalizedCorePath === "/admin/records/sync-jobs" || normalizedCorePath.startsWith("/admin/records/sync-jobs/")) {
    return "/admin/sync-jobs";
  }
  if (normalizedCorePath === "/admin/integrations" || normalizedCorePath === "/admin/integrations/") {
    return "/admin/integrations";
  }
  if (normalizedCorePath === "/admin/access" || normalizedCorePath === "/admin/access/") {
    return "/admin/access";
  }

  for (const route of promotedWorkspaceRoutes) {
    if (normalizedCorePath === route || normalizedCorePath.startsWith(`${route}/`)) {
      return route;
    }
  }

  return null;
}

export function extractSkillID(pathname: string): number | null {
  const matched = pathname.match(/^\/(?:mobile\/(?:light\/)?|light\/)?skills\/(\d+)(?:\/)?$/);
  if (!matched) {
    return null;
  }
  const parsed = Number(matched[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed);
}

export function extractCategorySlug(pathname: string): string | null {
  const matched = pathname.match(/^\/(?:mobile\/(?:light\/)?|light\/)?categories\/([^/?#]+)(?:\/)?$/);
  if (!matched || !matched[1]) {
    return null;
  }
  try {
    const decodedSlug = decodeURIComponent(matched[1]).trim();
    return decodedSlug || null;
  } catch {
    return String(matched[1]).trim() || null;
  }
}

export function normalizeAppRoute(
  pathname: string,
  dependencies: AppPathnameResolverDependencies = defaultDependencies
): AppRoute {
  const trimmed = normalizeTrailingSlash(pathname);
  const promotedProtectedRoute = resolvePromotedProtectedRoute(trimmed);
  if (promotedProtectedRoute) {
    return promotedProtectedRoute;
  }
  if (trimmed === "/light" || trimmed === "/mobile" || trimmed === "/mobile/light") {
    return "/";
  }
  if (trimmed === "/light/login" || trimmed === "/mobile/login" || trimmed === "/mobile/light/login") {
    return "/login";
  }
  if (trimmed === "/light/compare" || trimmed === "/mobile/compare" || trimmed === "/mobile/light/compare") {
    return "/compare";
  }
  if (trimmed === "/light/results" || trimmed === "/mobile/results" || trimmed === "/mobile/light/results") {
    return "/results";
  }
  if (trimmed === "/light/docs" || trimmed === "/mobile/docs" || trimmed === "/mobile/light/docs") {
    return "/docs";
  }
  if (trimmed === "/light/categories" || trimmed === "/mobile/categories" || trimmed === "/mobile/light/categories") {
    return "/categories";
  }
  if (extractCategorySlug(trimmed)) {
    return "/categories/:slug";
  }
  if (trimmed === "/light/rankings" || trimmed === "/mobile/rankings" || trimmed === "/mobile/light/rankings") {
    return "/rankings";
  }
  if (trimmed === "/") {
    return "/";
  }
  if (trimmed === "/login") {
    return "/login";
  }
  if (trimmed === "/compare") {
    return "/compare";
  }
  if (trimmed === "/results") {
    return "/results";
  }
  if (trimmed === "/docs") {
    return "/docs";
  }
  if (trimmed === "/categories") {
    return "/categories";
  }
  if (trimmed === "/rankings") {
    return "/rankings";
  }
  if (extractSkillID(trimmed)) {
    return "/skills/:id";
  }
  if (trimmed === "/admin" || trimmed === "/dashboard") {
    return "/admin/overview";
  }
  if (trimmed === "/account") {
    return "/account/profile";
  }

  if (dependencies.matchPrototypeCatalog(trimmed)) {
    return "/prototype";
  }

  const sorted = [...dependencies.protectedRoutes].sort((left, right) => right.length - left.length);
  for (const route of sorted) {
    if (trimmed === route || trimmed.startsWith(`${route}/`)) {
      return route;
    }
  }

  if (trimmed.startsWith("/dashboard/")) {
    const remapped = trimmed.replace(/^\/dashboard/, "/admin");
    for (const route of sorted) {
      if (remapped === route || remapped.startsWith(`${route}/`)) {
        return route;
      }
    }
  }

  return "/";
}
