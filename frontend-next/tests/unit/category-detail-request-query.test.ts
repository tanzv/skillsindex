import { describe, expect, it } from "vitest";

import {
  buildCategoryHubMarketplaceRequestQuery,
  buildCategoryDetailMarketplaceRequestQuery,
  buildMarketplaceSemanticListingRequestQuery,
  buildPublicSnapshotMarketplaceRequestQuery,
  buildRankingMarketplaceRequestQuery
} from "@/src/features/public/marketplace/marketplaceRequestQuery";

describe("category detail marketplace request query", () => {
  it("drops hub-only filters from the categories directory backend request", () => {
    expect(
      buildCategoryHubMarketplaceRequestQuery({
        q: "release gate",
        tags: "ops",
        audience: "human"
      })
    ).toEqual({});
  });

  it("strips semantic tags from generic marketplace backend requests", () => {
    expect(
      buildMarketplaceSemanticListingRequestQuery({
        q: "release gate",
        tags: "ops",
        page: "2"
      })
    ).toEqual({
      q: "release gate",
      page: "2"
    });
  });

  it("keeps only ranking-specific backend parameters", () => {
    expect(
      buildRankingMarketplaceRequestQuery(
        {
          q: "release",
          tags: "ops",
          left: "101",
          right: "102",
          sort: "quality"
        },
        "quality"
      )
    ).toEqual({
      sort: "quality",
      page: "1"
    });
  });

  it("drops narrative snapshot query params from backend requests", () => {
    expect(
      buildPublicSnapshotMarketplaceRequestQuery({
        q: "release",
        tags: "ops",
        sort: "quality"
      })
    ).toEqual({});
  });

  it("keeps category route filters but omits semantic tags from backend requests", () => {
    expect(
      buildCategoryDetailMarketplaceRequestQuery("operations", {
        q: "release gate",
        tags: "ops",
        subcategory: "release",
        sort: "stars",
        mode: "ai"
      })
    ).toEqual({
      category: "operations",
      q: "release gate",
      subcategory: "release",
      sort: "stars",
      mode: "ai"
    });
  });

  it("always pins the active category slug into the backend request", () => {
    expect(buildCategoryDetailMarketplaceRequestQuery("programming-development", {})).toEqual({
      category: "programming-development"
    });
  });
});
