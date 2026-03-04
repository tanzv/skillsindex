import { protectedRoutes, type ProtectedRoute } from "../appNavigationConfig";
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

function normalizeTrailingSlash(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
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
