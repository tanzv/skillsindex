import type { MarketplaceFilterForm } from "./MarketplaceHomePage.helpers";
import type { MarketplaceSearchHistoryEntry } from "../lib/marketplaceSearchHistory";

function normalizeQueryFieldValue(rawValue: string): string {
  return String(rawValue || "").trim();
}

export function resolveSearchContextValue(rawValue: string, fallbackValue: string): string {
  const normalizedValue = normalizeQueryFieldValue(rawValue);
  if (normalizedValue) {
    return normalizedValue;
  }
  return String(fallbackValue || "").trim();
}

export function buildResultsRoutePreview(form: MarketplaceFilterForm): string {
  const params = new URLSearchParams();
  const query = normalizeQueryFieldValue(form.q);
  const semantic = normalizeQueryFieldValue(form.tags);
  const category = normalizeQueryFieldValue(form.category);
  const subcategory = normalizeQueryFieldValue(form.subcategory);

  if (query) {
    params.set("q", query);
  }
  if (semantic) {
    params.set("tags", semantic);
  }
  if (category) {
    params.set("category", category);
  }
  if (subcategory) {
    params.set("subcategory", subcategory);
  }

  const suffix = params.toString();
  if (!suffix) {
    return "/results";
  }
  return `/results?${suffix}`;
}

export function buildRecentSearchEntryLabel(entry: MarketplaceSearchHistoryEntry): string {
  const query = normalizeQueryFieldValue(entry.q);
  const semantic = normalizeQueryFieldValue(entry.tags);

  if (query && semantic) {
    return `${query} · ${semantic}`;
  }
  if (query) {
    return query;
  }
  if (semantic) {
    return semantic;
  }
  return "";
}
