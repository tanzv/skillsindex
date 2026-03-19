import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockServerFetchJSON, mockBuildMarketplacePresentationPayload } = vi.hoisted(() => ({
  mockServerFetchJSON: vi.fn(),
  mockBuildMarketplacePresentationPayload: vi.fn((payload) => payload)
}));

vi.mock("@/src/lib/http/serverFetch", () => ({
  serverFetchJSON: mockServerFetchJSON
}));

vi.mock("@/src/features/public/marketplace/marketplaceTaxonomy", () => ({
  buildMarketplacePresentationPayload: mockBuildMarketplacePresentationPayload
}));

import {
  anonymousMarketplaceRevalidateSeconds,
  fetchMarketplace,
  resolveMarketplaceRequestStrategy
} from "@/src/lib/api/public";

describe("public marketplace request strategy", () => {
  beforeEach(() => {
    mockServerFetchJSON.mockReset();
    mockBuildMarketplacePresentationPayload.mockClear();
    mockServerFetchJSON.mockResolvedValue({
      items: [],
      categories: [],
      top_tags: [],
      filter_options: {
        sort: [],
        mode: [],
        categories: []
      },
      filters: {
        q: "",
        tags: "",
        category: "",
        subcategory: "",
        sort: "relevance",
        mode: "hybrid"
      },
      pagination: {
        page: 1,
        page_size: 20,
        total_items: 0,
        total_pages: 1,
        prev_page: 0,
        next_page: 0
      },
      stats: {
        total_skills: 0,
        matching_skills: 0
      },
      session_user: null,
      can_access_dashboard: false
    });
  });

  it("treats anonymous marketplace requests as cacheable", () => {
    expect(resolveMarketplaceRequestStrategy(new Headers())).toEqual({
      includeViewerContext: false,
      revalidateSeconds: anonymousMarketplaceRevalidateSeconds
    });
  });

  it("keeps viewer context for authenticated marketplace requests", () => {
    expect(
      resolveMarketplaceRequestStrategy(
        new Headers({
          cookie: "skillsindex_session=session-123; skillsindex_csrf=csrf-456"
        })
      )
    ).toEqual({
      includeViewerContext: true
    });
  });

  it("omits forwarded cookies and applies revalidation for anonymous fetches", async () => {
    await fetchMarketplace(new Headers(), {
      q: "nextjs"
    });

    expect(mockServerFetchJSON).toHaveBeenCalledTimes(1);
    expect(mockServerFetchJSON).toHaveBeenCalledWith("/api/v1/public/marketplace?q=nextjs", {
      requestHeaders: new Headers(),
      next: {
        revalidate: anonymousMarketplaceRevalidateSeconds
      }
    });
  });

  it("forwards request headers without revalidation for authenticated fetches", async () => {
    const requestHeaders = new Headers({
      cookie: "skillsindex_session=session-123"
    });

    await fetchMarketplace(requestHeaders, {
      q: "nextjs"
    });

    expect(mockServerFetchJSON).toHaveBeenCalledTimes(1);
    expect(mockServerFetchJSON).toHaveBeenCalledWith("/api/v1/public/marketplace?q=nextjs", {
      requestHeaders,
      next: undefined
    });
  });
});
