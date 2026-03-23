import type { ReactElement } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { loadPublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";
import { publicResultsRoute } from "@/src/lib/routing/publicRouteRegistry";

import { buildMarketplaceSemanticListingRequestQuery } from "./marketplace/marketplaceRequestQuery";
import { loadPublicMarketplaceRoute } from "./publicMarketplaceRouteLoader";
import {
  resolvePublicMode,
  resolvePublicQueryText,
  resolvePublicSemanticQuery,
  resolvePublicSort
} from "./publicRouteSearchParams";
import { buildPublicSearchPageModel } from "./publicSearchPageModel";

export interface PublicResultsRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function renderPublicResultsRoute(
  searchParams: Promise<Record<string, string | string[] | undefined>>
): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams;
  const query = resolvePublicQueryText(resolvedSearchParams);
  const semanticQuery = resolvePublicSemanticQuery(resolvedSearchParams);
  const sort = resolvePublicSort(resolvedSearchParams);
  const mode = resolvePublicMode(resolvedSearchParams);
  const requestQuery = buildMarketplaceSemanticListingRequestQuery(resolvedSearchParams);
  const result = await loadPublicMarketplaceRoute({
    requestQuery,
    fallbackScope: "public-results-marketplace",
    fallbackContext: {
      mode,
      query,
      route: publicResultsRoute,
      semanticQuery,
      sort
    }
  });

  if (!result.ok) {
    return <ErrorState description={result.errorMessage} />;
  }

  const marketplace = result.marketplace;
  const locale = await resolveServerLocale();
  const messages = await loadPublicMarketplaceMessages(locale);
  const model = buildPublicSearchPageModel({
    marketplace,
    messages,
    query,
    semanticQuery,
    formAction: publicResultsRoute
  });
  const { PublicSearchPage } = await import("./PublicSearchPage");

  return (
    <PublicSearchPage
      marketplace={marketplace}
      model={model}
      query={query}
      semanticQuery={semanticQuery}
      sort={sort}
      mode={mode}
      formAction={publicResultsRoute}
    />
  );
}
