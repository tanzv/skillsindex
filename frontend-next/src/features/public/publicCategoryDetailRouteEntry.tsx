import type { ReactElement } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";

import { buildCategoryDetailMarketplaceRequestQuery } from "./marketplace/marketplaceRequestQuery";
import { loadPublicMarketplaceRoute } from "./publicMarketplaceRouteLoader";
import {
  resolvePublicMode,
  resolvePublicQueryText,
  resolvePublicSemanticQuery,
  resolvePublicSort,
  resolvePublicSubcategory
} from "./publicRouteSearchParams";

export interface PublicCategoryDetailRouteParams {
  slug: string;
}

export interface PublicCategoryDetailRouteProps {
  params: Promise<PublicCategoryDetailRouteParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function renderPublicCategoryDetailRoute(
  params: Promise<PublicCategoryDetailRouteParams>,
  searchParams: Promise<Record<string, string | string[] | undefined>>
): Promise<ReactElement> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const query = resolvePublicQueryText(resolvedSearchParams);
  const semanticQuery = resolvePublicSemanticQuery(resolvedSearchParams);
  const activeSubcategory = resolvePublicSubcategory(resolvedSearchParams);
  const sort = resolvePublicSort(resolvedSearchParams);
  const mode = resolvePublicMode(resolvedSearchParams);
  const requestQuery = buildCategoryDetailMarketplaceRequestQuery(slug, resolvedSearchParams);
  const result = await loadPublicMarketplaceRoute({
    requestQuery,
    fallbackScope: "public-category-detail-marketplace",
    fallbackContext: {
      activeSubcategory,
      mode,
      query,
      route: `/categories/${slug}`,
      semanticQuery,
      slug,
      sort
    }
  });

  if (!result.ok) {
    return <ErrorState description={result.errorMessage} />;
  }

  const { PublicCategoryDetailPage } = await import("./PublicCategoryDetailPage");

  return (
    <PublicCategoryDetailPage
      marketplace={result.marketplace}
      activeCategory={slug}
      activeSubcategory={activeSubcategory}
      query={query}
      semanticQuery={semanticQuery}
      sort={sort}
      mode={mode}
    />
  );
}
