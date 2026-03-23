import { warmPublicSkillRoute, type PublicSkillRouteWarmupFetch } from "@/src/components/shared/publicSkillRouteWarmup";
import type { MarketplaceSkill } from "@/src/lib/schemas/public";

const defaultSkillWarmupLimit = 6;

export type PublicSkillWarmupRouteResolver = (route: string) => string;

export function buildPublicSkillBatchWarmupTargets(
  items: MarketplaceSkill[],
  resolveRoute: PublicSkillWarmupRouteResolver = (route) => route,
  limit = defaultSkillWarmupLimit
): string[] {
  const normalizedLimit = Math.max(0, limit);
  const routes = new Set<string>();

  for (const item of items) {
    if (routes.size >= normalizedLimit) {
      break;
    }

    routes.add(resolveRoute(`/skills/${item.id}`));
  }

  return [...routes];
}

export async function warmPublicSkillBatchRoutes(fetchImpl: PublicSkillRouteWarmupFetch, routes: string[]): Promise<void> {
  const warmedRoutes = new Set<string>();
  await Promise.allSettled(routes.map((route) => warmPublicSkillRoute(fetchImpl, route, warmedRoutes)));
}
