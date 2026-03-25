import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockServerFetchJSON, mockBuildMarketplacePresentationPayload } = vi.hoisted(() => ({
  mockServerFetchJSON: vi.fn(),
  mockBuildMarketplacePresentationPayload: vi.fn((payload) => payload)
}));

vi.mock("@/src/lib/http/serverFetch", () => ({
  serverFetchJSON: mockServerFetchJSON
}));

vi.mock("@/src/lib/marketplace/taxonomy", () => ({
  buildMarketplacePresentationPayload: mockBuildMarketplacePresentationPayload
}));

import {
  anonymousMarketplaceRevalidateSeconds,
  fetchSkillCompare,
  fetchSkillDetail,
  fetchSkillResourceContent,
  fetchSkillResources,
  fetchSkillVersions,
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
      includeViewerContext: true,
      cache: "no-store"
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
      cache: "no-store",
      requestHeaders,
      next: undefined
    });
  });

  it("applies the anonymous cache strategy to public detail and resource fetches", async () => {
    await fetchSkillDetail(new Headers(), 14);
    await fetchSkillCompare(new Headers(), 13, 14);
    await fetchSkillResources(new Headers(), 14);
    await fetchSkillResourceContent(new Headers(), 14, "SKILL.md");
    await fetchSkillVersions(new Headers(), 14);

    expect(mockServerFetchJSON).toHaveBeenNthCalledWith(1, "/api/v1/public/skills/14", {
      requestHeaders: new Headers(),
      next: {
        revalidate: anonymousMarketplaceRevalidateSeconds
      }
    });
    expect(mockServerFetchJSON).toHaveBeenNthCalledWith(2, "/api/v1/public/skills/compare?left=13&right=14", {
      requestHeaders: new Headers(),
      next: {
        revalidate: anonymousMarketplaceRevalidateSeconds
      }
    });
    expect(mockServerFetchJSON).toHaveBeenNthCalledWith(3, "/api/v1/public/skills/14/resources", {
      requestHeaders: new Headers(),
      next: {
        revalidate: anonymousMarketplaceRevalidateSeconds
      }
    });
    expect(mockServerFetchJSON).toHaveBeenNthCalledWith(4, "/api/v1/public/skills/14/resource-file?path=SKILL.md", {
      requestHeaders: new Headers(),
      next: {
        revalidate: anonymousMarketplaceRevalidateSeconds
      }
    });
    expect(mockServerFetchJSON).toHaveBeenNthCalledWith(5, "/api/v1/public/skills/14/versions", {
      requestHeaders: new Headers(),
      next: {
        revalidate: anonymousMarketplaceRevalidateSeconds
      }
    });
  });

  it("preserves viewer context for authenticated detail and resource fetches", async () => {
    const requestHeaders = new Headers({
      cookie: "skillsindex_session=session-123"
    });

    await fetchSkillDetail(requestHeaders, 14);
    await fetchSkillResources(requestHeaders, 14);
    await fetchSkillResourceContent(requestHeaders, 14, "SKILL.md");
    await fetchSkillVersions(requestHeaders, 14);

    expect(mockServerFetchJSON).toHaveBeenNthCalledWith(1, "/api/v1/public/skills/14", {
      cache: "no-store",
      requestHeaders,
      next: undefined
    });
    expect(mockServerFetchJSON).toHaveBeenNthCalledWith(2, "/api/v1/public/skills/14/resources", {
      cache: "no-store",
      requestHeaders,
      next: undefined
    });
    expect(mockServerFetchJSON).toHaveBeenNthCalledWith(3, "/api/v1/public/skills/14/resource-file?path=SKILL.md", {
      cache: "no-store",
      requestHeaders,
      next: undefined
    });
    expect(mockServerFetchJSON).toHaveBeenNthCalledWith(4, "/api/v1/public/skills/14/versions", {
      cache: "no-store",
      requestHeaders,
      next: undefined
    });
  });
});
