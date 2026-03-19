import { splitPublicPathPrefix } from "@/src/lib/routing/publicCompat";

const warmedPublicSkillRoutes = new Set<string>();

export interface PublicSkillRouteWarmupFetchInit {
  credentials: RequestCredentials;
  method: "HEAD";
}

export type PublicSkillRouteWarmupFetch = (input: string, init: PublicSkillRouteWarmupFetchInit) => Promise<unknown>;

function isExternalURL(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function resolvePublicSkillWarmupTarget(href: string, as?: string): string | null {
  const candidate = String(as || href || "").trim();
  if (!candidate || isExternalURL(candidate)) {
    return null;
  }

  const pathname = candidate.split("?")[0]?.split("#")[0] || candidate;
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const { corePath } = splitPublicPathPrefix(normalizedPath);

  return corePath.startsWith("/skills/") ? candidate : null;
}

export function shouldObservePublicSkillWarmup(enableViewportWarmup: boolean, route: string | null): boolean {
  return enableViewportWarmup && Boolean(route);
}

export async function warmPublicSkillRoute(
  fetchImpl: PublicSkillRouteWarmupFetch,
  route: string,
  warmedRoutes: Set<string> = warmedPublicSkillRoutes
): Promise<void> {
  const normalizedRoute = String(route || "").trim();
  if (!normalizedRoute || warmedRoutes.has(normalizedRoute)) {
    return;
  }

  warmedRoutes.add(normalizedRoute);

  try {
    await fetchImpl(normalizedRoute, {
      method: "HEAD",
      credentials: "same-origin"
    });
  } catch {
    return;
  }
}
