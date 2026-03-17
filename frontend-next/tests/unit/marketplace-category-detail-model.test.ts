import { describe, expect, it } from "vitest";

import { resolveCategoryDetailControlState } from "@/src/features/public/marketplace/categoryDetailModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { MarketplaceCategory } from "@/src/lib/schemas/public";

const messages = {
  categoryAllSubcategories: "All Subcategories",
  categorySortRelevance: "Relevance",
  categorySortRecent: "Recent",
  categorySortStars: "Stars",
  categorySortQuality: "Quality",
  categoryModeHybrid: "Hybrid",
  categoryModeKeyword: "Keyword",
  categoryModeAI: "AI"
} as PublicMarketplaceMessages;

const category: MarketplaceCategory = {
  slug: "operations",
  name: "Operations",
  description: "Release, recovery, and execution workflows.",
  count: 2,
  subcategories: [
    { slug: "release", name: "Release", count: 1 },
    { slug: "recovery", name: "Recovery", count: 1 }
  ]
};

describe("category detail model", () => {
  it("builds active subcategory, sort, and mode control states", () => {
    const state = resolveCategoryDetailControlState(category, messages, {
      activeSubcategory: "recovery",
      sort: "stars",
      mode: "ai"
    });

    expect(state.subcategoryOptions).toEqual([
      { value: "", label: "All Subcategories", count: 2, isActive: false },
      { value: "release", label: "Release", count: 1, isActive: false },
      { value: "recovery", label: "Recovery", count: 1, isActive: true }
    ]);
    expect(state.sortOptions).toEqual([
      { value: "relevance", label: "Relevance", isActive: false },
      { value: "recent", label: "Recent", isActive: false },
      { value: "stars", label: "Stars", isActive: true },
      { value: "quality", label: "Quality", isActive: false }
    ]);
    expect(state.modeOptions).toEqual([
      { value: "hybrid", label: "Hybrid", isActive: false },
      { value: "keyword", label: "Keyword", isActive: false },
      { value: "ai", label: "AI", isActive: true }
    ]);
  });

  it("defaults to the all-subcategories and hybrid relevance state", () => {
    const state = resolveCategoryDetailControlState(category, messages, {});

    expect(state.subcategoryOptions[0]).toEqual({
      value: "",
      label: "All Subcategories",
      count: 2,
      isActive: true
    });
    expect(state.sortOptions[0]).toEqual({
      value: "relevance",
      label: "Relevance",
      isActive: true
    });
    expect(state.modeOptions[0]).toEqual({
      value: "hybrid",
      label: "Hybrid",
      isActive: true
    });
  });
});
