"use client";

import { buildPublicLinkTarget, splitPublicPathPrefix, withPublicPathPrefix } from "./publicCompat";
import { useResolvedPublicPathname } from "./useResolvedPublicPathname";

export function usePublicRouteState() {
  const resolvedPathname = useResolvedPublicPathname();
  const routeState = splitPublicPathPrefix(resolvedPathname);

  return {
    ...routeState,
    toPublicPath(route: string) {
      return withPublicPathPrefix(routeState.prefix, route);
    },
    toPublicLinkTarget(route: string) {
      return buildPublicLinkTarget(routeState.prefix, route);
    }
  };
}
