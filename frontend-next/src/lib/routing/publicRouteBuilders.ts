import { publicCategoriesRoute, publicSkillsRoutePrefix } from "./publicRouteRegistry";

export function buildPublicSkillDetailRoute(skillId: string | number): string {
  return `${publicSkillsRoutePrefix}/${skillId}`;
}

export function buildPublicCategoryDetailRoute(categorySlug: string): string {
  return `${publicCategoriesRoute}/${categorySlug}`;
}
