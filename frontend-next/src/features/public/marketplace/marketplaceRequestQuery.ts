export interface MarketplaceRouteSearchParams {
  [key: string]: string | string[] | undefined;
}

function copyScalarSearchParams(searchParams: MarketplaceRouteSearchParams): Record<string, string> {
  const query: Record<string, string> = {};

  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (Array.isArray(rawValue)) {
      const firstValue = rawValue.find((value) => String(value || "").trim());

      if (firstValue) {
        query[key] = firstValue;
      }
      continue;
    }

    const normalizedValue = String(rawValue || "").trim();
    if (normalizedValue) {
      query[key] = normalizedValue;
    }
  }

  return query;
}

export function buildMarketplaceSemanticListingRequestQuery(
  searchParams: MarketplaceRouteSearchParams
): Record<string, string> {
  const requestQuery = copyScalarSearchParams(searchParams);

  delete requestQuery.tags;

  return requestQuery;
}

export function buildCategoryHubMarketplaceRequestQuery(
  searchParams: MarketplaceRouteSearchParams
): Record<string, string> {
  void searchParams;
  return {};
}

export function buildRankingMarketplaceRequestQuery(
  searchParams: MarketplaceRouteSearchParams,
  sortKey: "stars" | "quality"
): Record<string, string> {
  void searchParams;

  return {
    sort: sortKey,
    page: "1"
  };
}

export function buildPublicSnapshotMarketplaceRequestQuery(
  searchParams: MarketplaceRouteSearchParams
): Record<string, string> {
  void searchParams;
  return {};
}

export function buildCategoryDetailMarketplaceRequestQuery(
  slug: string,
  searchParams: MarketplaceRouteSearchParams
): Record<string, string> {
  return {
    ...buildMarketplaceSemanticListingRequestQuery(searchParams),
    category: String(slug || "").trim()
  };
}
