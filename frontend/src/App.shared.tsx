import styled from "@emotion/styled";
import type { ProtectedRoute } from "./appNavigationConfig";
import type { AppRoute } from "./lib/appPathnameResolver";
import type { AccountRoute } from "./pages/accountWorkbench/AccountWorkbenchPage";
import type { AdminRoute } from "./pages/adminWorkbench/AdminWorkbenchPage";

export type PublicLocaleSwitchMode = "hidden" | "overlay";

export function resolvePublicLocaleSwitchMode(rawMode: string | undefined): PublicLocaleSwitchMode {
  const normalized = String(rawMode || "").trim().toLowerCase();
  if (normalized === "overlay") {
    return "overlay";
  }
  return "hidden";
}

export function isProtectedRoute(route: AppRoute): route is ProtectedRoute {
  return (
    route !== "/" &&
    route !== "/results" &&
    route !== "/login" &&
    route !== "/compare" &&
    route !== "/docs" &&
    route !== "/categories" &&
    route !== "/categories/:slug" &&
    route !== "/rankings" &&
    route !== "/skills/:id" &&
    route !== "/prototype"
  );
}

export function isMarketplaceRoute(route: AppRoute): boolean {
  return (
    route === "/" ||
    route === "/results" ||
    route === "/compare" ||
    route === "/docs" ||
    route === "/categories" ||
    route === "/categories/:slug" ||
    route === "/rankings" ||
    route === "/skills/:id"
  );
}

export function shouldRequireSession(route: AppRoute, marketplacePublicAccess: boolean): boolean {
  if (isProtectedRoute(route)) {
    return true;
  }
  return !marketplacePublicAccess && isMarketplaceRoute(route);
}

export function isAdminRoute(route: ProtectedRoute): route is AdminRoute {
  return route.startsWith("/admin");
}

export function isAccountRoute(route: ProtectedRoute): route is AccountRoute {
  return route.startsWith("/account");
}

function normalizePath(pathname: string): string {
  const trimmed = String(pathname || "").trim();
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.replace(/\/+$/, "") || "/";
}

function normalizeSearch(search: string): string {
  const trimmed = String(search || "").trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.startsWith("?") ? trimmed : `?${trimmed}`;
}

function normalizeHash(hash: string): string {
  const trimmed = String(hash || "").trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function splitPublicPrefix(pathname: string): { prefix: string; corePath: string } {
  const normalizedPath = normalizePath(pathname);
  if (normalizedPath === "/mobile/light" || normalizedPath.startsWith("/mobile/light/")) {
    const suffix = normalizedPath.slice("/mobile/light".length) || "/";
    return { prefix: "/mobile/light", corePath: normalizePath(suffix) };
  }
  if (normalizedPath === "/mobile" || normalizedPath.startsWith("/mobile/")) {
    const suffix = normalizedPath.slice("/mobile".length) || "/";
    return { prefix: "/mobile", corePath: normalizePath(suffix) };
  }
  if (normalizedPath === "/light" || normalizedPath.startsWith("/light/")) {
    const suffix = normalizedPath.slice("/light".length) || "/";
    return { prefix: "/light", corePath: normalizePath(suffix) };
  }
  return { prefix: "", corePath: normalizedPath };
}

function withPublicPrefix(prefix: string, route: string): string {
  return prefix ? `${prefix}${route}` : route;
}

export function buildLoginRedirectPath(pathname: string, search = "", hash = ""): string {
  const normalizedPath = normalizePath(pathname);
  const normalizedSearch = normalizeSearch(search);
  const normalizedHash = normalizeHash(hash);
  const redirectTarget = `${normalizedPath}${normalizedSearch}${normalizedHash}`;
  const params = new URLSearchParams();
  params.set("redirect", redirectTarget);
  const { prefix } = splitPublicPrefix(pathname);
  return `${withPublicPrefix(prefix, "/login")}?${params.toString()}`;
}

export function resolvePostLoginRedirect(search: string, fallbackPath = "/"): string {
  const params = new URLSearchParams(normalizeSearch(search));
  const redirect = String(params.get("redirect") || "").trim();
  const redirectPath = redirect.split(/[?#]/, 1)[0] || redirect;
  const pointsToLogin = /^\/(?:mobile(?:\/light)?\/|light\/)?login(?:\/)?$/i.test(redirectPath);
  if (redirect.startsWith("/") && !redirect.startsWith("//") && !pointsToLogin) {
    return redirect;
  }
  return normalizePath(fallbackPath);
}

export function resolveLegacyPublicRouteRedirect(pathname: string, search = "", hash = ""): string | null {
  const normalizedSearch = normalizeSearch(search);
  const normalizedHash = normalizeHash(hash);

  const { prefix, corePath } = splitPublicPrefix(pathname);
  if (corePath === "/compare") {
    return `${withPublicPrefix(prefix, "/rankings")}${normalizedSearch}${normalizedHash}`;
  }
  return null;
}

export function shouldShowPublicGlobalControls(route: AppRoute, pathname: string): boolean {
  void route;
  void pathname;
  return false;
}

export const SideLocaleSwitch = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
`;

export const LocaleSwitchButton = styled.button<{ $active?: boolean }>`
  border: 0;
  cursor: pointer;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active }) => ($active ? "#0e8aa0" : "#153a72")};
  color: ${({ $active }) => ($active ? "#e9fffd" : "#bfd8ff")};
  font-size: 0.78rem;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.12s ease;

  &:hover:not(:disabled) {
    background: #1f4a87;
    color: #e8f4ff;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    cursor: default;
  }
`;

export const QuickJumpSection = styled.section`
  margin-top: 0;
  border-radius: 12px;
  border: 1px solid rgba(17, 25, 31, 0.13);
  background: rgba(255, 250, 242, 0.84);
  box-shadow: 0 8px 20px rgba(17, 25, 31, 0.05);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 960px) {
    align-items: flex-start;
  }
`;

export const QuickJumpLabel = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: #375264;
`;

export const QuickJumpActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;
