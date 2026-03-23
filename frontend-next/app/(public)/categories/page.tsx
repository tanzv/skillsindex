import {
  renderPublicCategoryRoute,
  type PublicCategoryRouteProps
} from "@/src/features/public/publicCategoryRouteEntry";

export default async function CategoriesPage({ searchParams }: PublicCategoryRouteProps) {
  return renderPublicCategoryRoute(searchParams);
}
