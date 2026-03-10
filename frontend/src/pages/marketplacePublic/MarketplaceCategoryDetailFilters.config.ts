import type { MarketplaceFilterOption, PublicMarketplaceResponse } from "../../lib/api";
import type { MarketplaceText } from "./marketplaceText";

export interface MarketplaceCategoryDetailFilterOption {
  value: string;
  label: string;
}

export interface MarketplaceCategoryDetailFilterOptions {
  sortOptions: MarketplaceCategoryDetailFilterOption[];
  modeOptions: MarketplaceCategoryDetailFilterOption[];
}

const fallbackSortValues = ["relevance", "recent", "stars", "quality"];
const fallbackModeValues = ["hybrid", "keyword", "ai"];

function normalizeOptionValue(rawValue: unknown): string {
  return String(rawValue || "").trim().toLowerCase();
}

function normalizeCategorySlug(rawValue: unknown): string {
  return String(rawValue || "").trim().toLowerCase();
}

function normalizeOptionLabel(rawLabel: unknown): string {
  return String(rawLabel || "").trim();
}

function resolveSortLabel(value: string, text: MarketplaceText, configuredLabel: string): string {
  switch (value) {
    case "relevance":
      return text.sortLabel;
    case "latest":
    case "recent":
      return text.sortRecent;
    case "stars":
      return text.sortStars;
    case "quality":
      return text.sortQuality;
    default:
      return configuredLabel || value;
  }
}

function resolveModeLabel(value: string, text: MarketplaceText, configuredLabel: string): string {
  switch (value) {
    case "hybrid":
      return text.modeLabel;
    case "keyword":
      return text.modeKeyword;
    case "ai":
      return text.modeAI;
    default:
      return configuredLabel || value;
  }
}

function normalizeOptions(
  rawOptions: MarketplaceFilterOption[] | undefined,
  fallbackValues: string[],
  resolveLabel: (value: string, text: MarketplaceText, configuredLabel: string) => string,
  text: MarketplaceText
): MarketplaceCategoryDetailFilterOption[] {
  const resolved = new Map<string, MarketplaceCategoryDetailFilterOption>();
  const list: MarketplaceFilterOption[] =
    Array.isArray(rawOptions) && rawOptions.length > 0
      ? rawOptions
      : fallbackValues.map((value) => ({ value, label: "" }));
  for (const option of list) {
    const value = normalizeOptionValue(option?.value);
    if (!value || resolved.has(value)) {
      continue;
    }
    const label = resolveLabel(value, text, normalizeOptionLabel(option?.label));
    resolved.set(value, {
      value,
      label: label || value
    });
  }

  if (resolved.size === 0) {
    for (const fallbackValue of fallbackValues) {
      const value = normalizeOptionValue(fallbackValue);
      if (!value || resolved.has(value)) {
        continue;
      }
      resolved.set(value, {
        value,
        label: resolveLabel(value, text, "")
      });
    }
  }

  return Array.from(resolved.values());
}

export function resolveMarketplaceCategoryDetailFilterOptions(
  payload: PublicMarketplaceResponse | null,
  text: MarketplaceText,
  activeCategorySlug = ""
): MarketplaceCategoryDetailFilterOptions {
  const filterOptions = payload?.filter_options;
  const normalizedActiveCategorySlug = normalizeCategorySlug(activeCategorySlug);
  const matchedCategoryOverride =
    normalizedActiveCategorySlug && Array.isArray(filterOptions?.category_overrides)
      ? filterOptions?.category_overrides.find(
          (override) => normalizeCategorySlug(override?.category_slug) === normalizedActiveCategorySlug
        )
      : undefined;

  return {
    sortOptions: normalizeOptions(
      matchedCategoryOverride?.sort || filterOptions?.sort,
      fallbackSortValues,
      resolveSortLabel,
      text
    ),
    modeOptions: normalizeOptions(
      matchedCategoryOverride?.mode || filterOptions?.mode,
      fallbackModeValues,
      resolveModeLabel,
      text
    )
  };
}
