import {
  renderPublicCategoryDetailRoute,
  type PublicCategoryDetailRouteProps
} from "@/src/features/public/publicCategoryDetailRouteEntry";

export default async function CategoryDetailPage({ params, searchParams }: PublicCategoryDetailRouteProps) {
  return renderPublicCategoryDetailRoute(params, searchParams);
}
