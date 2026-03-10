import type { MarketplaceQueryParams } from "../../lib/api";
import type { MarketplaceFilterForm } from "../marketplaceHome/MarketplaceHomePage.helpers";

export function normalizeRouteCategorySlug(rawValue: string | null | undefined): string {
  return String(rawValue || "").trim().replace(/\s+/g, " ");
}

export function normalizeQueryText(rawValue: string): string {
  return String(rawValue || "").trim().replace(/\s+/g, " ");
}

export function normalizeFilterFormQuery(nextForm: MarketplaceFilterForm): MarketplaceQueryParams {
  return {
    ...nextForm,
    q: normalizeQueryText(nextForm.q),
    tags: normalizeQueryText(nextForm.tags),
    category: normalizeQueryText(nextForm.category),
    subcategory: normalizeQueryText(nextForm.subcategory)
  };
}
