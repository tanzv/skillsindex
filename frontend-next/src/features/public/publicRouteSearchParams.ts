import type { MarketplaceRouteSearchParams } from "./marketplace/marketplaceRequestQuery";
import type { RankingSortKey } from "./publicRankingModel";

export type PublicRouteSearchParams = MarketplaceRouteSearchParams;

export function resolveScalarPublicSearchParam(
  searchParams: PublicRouteSearchParams,
  key: string,
  fallback = ""
): string {
  return typeof searchParams[key] === "string" ? searchParams[key] || fallback : fallback;
}

export function resolvePublicQueryText(searchParams: PublicRouteSearchParams): string {
  return resolveScalarPublicSearchParam(searchParams, "q");
}

export function resolvePublicSemanticQuery(searchParams: PublicRouteSearchParams): string {
  return resolveScalarPublicSearchParam(searchParams, "tags");
}

export function resolvePublicAudience(searchParams: PublicRouteSearchParams): string {
  return resolveScalarPublicSearchParam(searchParams, "audience", "agent");
}

export function resolvePublicSubcategory(searchParams: PublicRouteSearchParams): string {
  return resolveScalarPublicSearchParam(searchParams, "subcategory");
}

export function resolvePublicSort(searchParams: PublicRouteSearchParams): string {
  return resolveScalarPublicSearchParam(searchParams, "sort", "relevance");
}

export function resolvePublicMode(searchParams: PublicRouteSearchParams): string {
  return resolveScalarPublicSearchParam(searchParams, "mode", "hybrid");
}

export function resolvePublicRankingSortKey(
  searchParams: PublicRouteSearchParams
): RankingSortKey {
  return resolveScalarPublicSearchParam(searchParams, "sort") === "quality" ? "quality" : "stars";
}

export function resolvePublicIntegerSearchParam(
  searchParams: PublicRouteSearchParams,
  key: string
): number {
  const rawValue = searchParams[key];
  const normalizedValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  const numericValue = Number(normalizedValue || 0);

  return Number.isInteger(numericValue) ? numericValue : 0;
}
