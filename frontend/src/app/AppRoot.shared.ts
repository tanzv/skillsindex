import type { AppRoute } from "../lib/appPathnameResolver";

export interface AppTextDictionary {
  brandName: string;
  brandTitle: string;
  home: string;
  homeSubtitle: string;
  quickJump: string;
  bootstrapping: string;
  loginKicker: string;
  loginTitle: string;
  loginLead: string;
}

const publicExperienceRoutes = new Set<AppRoute>([
  "/",
  "/results",
  "/compare",
  "/docs",
  "/categories",
  "/categories/:slug",
  "/rankings",
  "/skills/:id",
  "/prototype"
]);

export function isPublicExperienceRoute(route: AppRoute): boolean {
  return publicExperienceRoutes.has(route);
}

export function isLightPrototypePathname(pathname: string): boolean {
  return /^\/(light|mobile\/light)(\/|$)/.test(pathname);
}

export function resolveAppBodyClassName(route: AppRoute, pathname: string): string {
  if (route === "/login") {
    return isLightPrototypePathname(pathname) ? "page-login-react-light" : "page-login-react";
  }
  if (isPublicExperienceRoute(route)) {
    return isLightPrototypePathname(pathname) ? "page-home-react-light" : "page-home-react";
  }
  if (route.startsWith("/account")) {
    return "page-account-react";
  }
  return "page-admin-react";
}
