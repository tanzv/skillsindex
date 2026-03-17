import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { MarketplaceCategory } from "@/src/lib/schemas/public";

export interface CategoryDetailControlOption {
  value: string;
  label: string;
  isActive: boolean;
}

export interface CategoryDetailSubcategoryOption extends CategoryDetailControlOption {
  count: number;
}

export interface CategoryDetailControlState {
  subcategoryOptions: CategoryDetailSubcategoryOption[];
  sortOptions: CategoryDetailControlOption[];
  modeOptions: CategoryDetailControlOption[];
}

interface CategoryDetailControlStateInput {
  activeSubcategory?: string;
  sort?: string;
  mode?: string;
}

function normalizeValue(rawValue: string | undefined, fallback = ""): string {
  const normalizedValue = String(rawValue || "")
    .trim()
    .toLowerCase();

  return normalizedValue || fallback;
}

export function resolveCategoryDetailControlState(
  category: MarketplaceCategory,
  messages: PublicMarketplaceMessages,
  input: CategoryDetailControlStateInput
): CategoryDetailControlState {
  const activeSubcategory = normalizeValue(input.activeSubcategory);
  const activeSort = normalizeValue(input.sort, "relevance");
  const activeMode = normalizeValue(input.mode, "hybrid");

  return {
    subcategoryOptions: [
      {
        value: "",
        label: messages.categoryAllSubcategories,
        count: category.count,
        isActive: !activeSubcategory
      },
      ...category.subcategories.map((subcategory) => ({
        value: subcategory.slug,
        label: subcategory.name,
        count: subcategory.count,
        isActive: subcategory.slug === activeSubcategory
      }))
    ],
    sortOptions: [
      { value: "relevance", label: messages.categorySortRelevance, isActive: activeSort === "relevance" },
      { value: "recent", label: messages.categorySortRecent, isActive: activeSort === "recent" },
      { value: "stars", label: messages.categorySortStars, isActive: activeSort === "stars" },
      { value: "quality", label: messages.categorySortQuality, isActive: activeSort === "quality" }
    ],
    modeOptions: [
      { value: "hybrid", label: messages.categoryModeHybrid, isActive: activeMode === "hybrid" },
      { value: "keyword", label: messages.categoryModeKeyword, isActive: activeMode === "keyword" },
      { value: "ai", label: messages.categoryModeAI, isActive: activeMode === "ai" }
    ]
  };
}
