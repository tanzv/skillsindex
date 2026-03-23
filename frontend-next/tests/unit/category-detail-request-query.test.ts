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

  it("keeps semantic tags in generic marketplace backend requests", () => {
    expect(
      buildMarketplaceSemanticListingRequestQuery({
        q: "release gate",
        tags: "ops",
        page: "2"
      })
    ).toEqual({
      q: "release gate",
      tags: "ops",
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

  it("keeps category route filters and semantic tags in backend requests", () => {
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
      tags: "ops",
      subcategory: "release",
      sort: "stars",
      mode: "ai"
    });
  });

  it("maps presentation taxonomy slugs to grouped backend filters", () => {
    expect(
      buildCategoryDetailMarketplaceRequestQuery("programming-development", {
        subcategory: "devops-cloud",
        q: "release",
        tags: "ops",
        sort: "stars"
      })
    ).toEqual({
      category_group: "programming-development",
      subcategory_group: "devops-cloud",
      q: "release",
      tags: "ops",
      sort: "stars"
    });
  });
});
