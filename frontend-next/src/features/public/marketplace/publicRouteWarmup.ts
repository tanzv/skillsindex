import {
  publicCategoriesRoute,
  publicRankingsRoute,
  publicResultsRoute
} from "@/src/lib/routing/publicRouteRegistry";

export const publicMarketplaceWarmupRoutes = [publicCategoriesRoute, publicRankingsRoute, publicResultsRoute] as const;

export interface PublicRouteWarmupFetchInit {
  credentials: RequestCredentials;
  method: "HEAD";
}

export type PublicRouteWarmupFetch = (input: string, init: PublicRouteWarmupFetchInit) => Promise<unknown>;
export type PublicRoutePrefetch = (route: string) => void;

export function shouldWarmPublicMarketplaceRoutesInDev(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_MARKETPLACE_WARMUP === "true";
}

export function buildPublicMarketplaceWarmupTargets(
  toPublicPath: (route: string) => string,
  authenticationRoute?: string
): string[] {
  const routeTargets = publicMarketplaceWarmupRoutes.map((route) => toPublicPath(route));

  if (!authenticationRoute) {
    return [...new Set(routeTargets)];
  }

  return [...new Set([...routeTargets, authenticationRoute])];
}

export async function warmPublicMarketplaceRoutes(
  fetchImpl: PublicRouteWarmupFetch,
  routes: string[]
): Promise<void> {
  await Promise.allSettled(
    routes.map((route) =>
      fetchImpl(route, {
        method: "HEAD",
        credentials: "same-origin"
      })
    )
  );
}

export function prefetchPublicMarketplaceRoutes(prefetchImpl: PublicRoutePrefetch, routes: string[]): void {
  for (const route of routes) {
    prefetchImpl(route);
  }
}
