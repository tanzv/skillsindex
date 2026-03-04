import { describe, expect, it } from "vitest";
import type { MarketplaceText } from "./marketplaceText";
import { resolveMarketplaceCategoryDetailFilterOptions } from "./MarketplaceCategoryDetailFilters.config";

function createText(): MarketplaceText {
  return {
    brandTitle: "",
    brandSubtitle: "",
    signedOut: "",
    statsMain: "",
    statsSub: "",
    statsPromo: "",
    statsTrendLabel: "",
    statsDeltaLeft: "",
    statsDeltaRight: "",
    signedIn: "",
    signOut: "",
    signIn: "",
    openWorkspace: "",
    categoryNav: "",
    downloadRankingNav: "",
    curatedTitle: "",
    installableLabel: "",
    verifiedLabel: "",
    updatedLabel: "",
    pressHintLabel: "",
    latestTitle: "",
    resultsTitle: "",
    categoryResultsTitle: "",
    latestSortLabel: "",
    batchInstallLabel: "",
    compareLabel: "",
    paginationMeta: "",
    keywordPrefix: "",
    semanticPrefix: "",
    queryKeyword: "",
    querySemantic: "",
    queryPlaceholder: "",
    semanticPlaceholder: "",
    search: "",
    advanced: "",
    hotkeyLabel: "",
    allCategories: "",
    allSubcategories: "",
    sortRecent: "Sort: Recent",
    sortStars: "Sort: Stars",
    sortQuality: "Sort: Quality",
    modeKeyword: "Mode: Keyword",
    modeAI: "Mode: AI",
    resetFilters: "",
    hotAutomation: "",
    hotRepository: "",
    hotRelease: "",
    recommendedLabel: "",
    modeLabel: "",
    sortLabel: "",
    viewLabel: "",
    queueLabel: "",
    openQueue: "",
    resultsModalTitle: "",
    resultsClose: "",
    resultsModalKeywordPlaceholder: "",
    resultsModalSemanticPlaceholder: "",
    resultsFilter: "",
    resultsShortcutHint: "",
    resultsFooterLeftTemplate: "",
    resultsFooterRight: "",
    resultsStatMatchedTemplate: "",
    resultsStatLatency: "",
    resultsCardMetaTagsLabel: "",
    resultsCardMetaScoreLabel: "",
    resultsCardMetaUpdatedLabel: "",
    resultsCardAction: "",
    loadMore: "",
    loadMoreHint: "",
    loadMoreLoadingHint: "",
    loadMoreSuccessHint: "",
    loadMoreFinishedTitle: "",
    loadMoreFinishedHint: "",
    noResultsTitle: "",
    noResultsHint: "",
    previous: "",
    next: ""
  };
}

describe("MarketplaceCategoryDetailFilters config", () => {
  it("returns default sort and mode options when payload has no filter options", () => {
    const options = resolveMarketplaceCategoryDetailFilterOptions(null, createText(), "tools");
    expect(options.sortOptions.map((item) => item.value)).toEqual(["recent", "stars", "quality"]);
    expect(options.modeOptions.map((item) => item.value)).toEqual(["keyword", "ai"]);
  });

  it("normalizes, deduplicates and localizes known configured options", () => {
    const options = resolveMarketplaceCategoryDetailFilterOptions(
      {
        filters: {
          q: "",
          tags: "",
          category: "",
          subcategory: "",
          sort: "recent",
          mode: "keyword"
        },
        stats: {
          total_skills: 0,
          matching_skills: 0
        },
        pagination: {
          page: 1,
          page_size: 24,
          total_items: 0,
          total_pages: 1,
          prev_page: 0,
          next_page: 0
        },
        categories: [],
        top_tags: [],
        filter_options: {
          sort: [
            { value: " STARS " },
            { value: "stars" },
            { value: "QUALITY", label: "Custom quality label should be ignored for known values" }
          ],
          mode: [{ value: "AI" }, { value: "keyword" }]
        },
        items: [],
        session_user: null,
        can_access_dashboard: false
      },
      createText(),
      "tools"
    );

    expect(options.sortOptions).toEqual([
      { value: "stars", label: "Sort: Stars" },
      { value: "quality", label: "Sort: Quality" }
    ]);
    expect(options.modeOptions).toEqual([
      { value: "ai", label: "Mode: AI" },
      { value: "keyword", label: "Mode: Keyword" }
    ]);
  });

  it("keeps backend label for unknown option values", () => {
    const options = resolveMarketplaceCategoryDetailFilterOptions(
      {
        filters: {
          q: "",
          tags: "",
          category: "",
          subcategory: "",
          sort: "recent",
          mode: "keyword"
        },
        stats: {
          total_skills: 0,
          matching_skills: 0
        },
        pagination: {
          page: 1,
          page_size: 24,
          total_items: 0,
          total_pages: 1,
          prev_page: 0,
          next_page: 0
        },
        categories: [],
        top_tags: [],
        filter_options: {
          sort: [{ value: "trend", label: "Sort: Trend" }],
          mode: [{ value: "semantic_plus", label: "Mode: Semantic+" }]
        },
        items: [],
        session_user: null,
        can_access_dashboard: false
      },
      createText(),
      "tools"
    );

    expect(options.sortOptions).toEqual([{ value: "trend", label: "Sort: Trend" }]);
    expect(options.modeOptions).toEqual([{ value: "semantic_plus", label: "Mode: Semantic+" }]);
  });

  it("uses category-specific overrides when matched category slug exists", () => {
    const options = resolveMarketplaceCategoryDetailFilterOptions(
      {
        filters: {
          q: "",
          tags: "",
          category: "",
          subcategory: "",
          sort: "recent",
          mode: "keyword"
        },
        stats: {
          total_skills: 0,
          matching_skills: 0
        },
        pagination: {
          page: 1,
          page_size: 24,
          total_items: 0,
          total_pages: 1,
          prev_page: 0,
          next_page: 0
        },
        categories: [],
        top_tags: [],
        filter_options: {
          sort: [{ value: "recent" }, { value: "stars" }, { value: "quality" }],
          mode: [{ value: "keyword" }, { value: "ai" }],
          category_overrides: [
            {
              category_slug: "security",
              sort: [{ value: "recent" }, { value: "stars" }],
              mode: [{ value: "keyword" }]
            }
          ]
        },
        items: [],
        session_user: null,
        can_access_dashboard: false
      },
      createText(),
      "security"
    );

    expect(options.sortOptions.map((item) => item.value)).toEqual(["recent", "stars"]);
    expect(options.modeOptions.map((item) => item.value)).toEqual(["keyword"]);
  });
});
