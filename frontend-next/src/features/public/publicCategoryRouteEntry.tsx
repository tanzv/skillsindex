import type { ReactElement } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { publicCategoriesRoute } from "@/src/lib/routing/publicRouteRegistry";

import { buildCategoryHubMarketplaceRequestQuery } from "./marketplace/marketplaceRequestQuery";
import { loadPublicMarketplaceRoute } from "./publicMarketplaceRouteLoader";
import {
  resolvePublicAudience,
  resolvePublicQueryText,
  resolvePublicSemanticQuery
} from "./publicRouteSearchParams";

export interface PublicCategoryRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function renderPublicCategoryRoute(
  searchParams: Promise<Record<string, string | string[] | undefined>>
): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams;
  const query = resolvePublicQueryText(resolvedSearchParams);
  const semanticQuery = resolvePublicSemanticQuery(resolvedSearchParams);
  const audience = resolvePublicAudience(resolvedSearchParams);
  const requestQuery = buildCategoryHubMarketplaceRequestQuery(resolvedSearchParams);
  const result = await loadPublicMarketplaceRoute({
    requestQuery,
    fallbackScope: "public-categories-marketplace",
    fallbackContext: {
      audience,
      query,
      route: publicCategoriesRoute,
      semanticQuery
    }
  });

  if (!result.ok) {
    return <ErrorState description={result.errorMessage} />;
  }

  const { PublicCategoryPage } = await import("./PublicCategoryPage");

  return (
    <PublicCategoryPage
      marketplace={result.marketplace}
      query={query}
      semanticQuery={semanticQuery}
      audience={audience}
    />
  );
}
