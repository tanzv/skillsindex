import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

vi.mock("next/headers", () => ({
  headers: vi.fn()
}));

vi.mock("@/src/lib/api/public", () => ({
  fetchMarketplace: vi.fn()
}));

vi.mock("@/src/lib/api/publicFallbackLogging", () => ({
  reportPublicFallbackError: vi.fn()
}));

import { headers } from "next/headers";

import { fetchMarketplace } from "@/src/lib/api/public";
import { reportPublicFallbackError } from "@/src/lib/api/publicFallbackLogging";
import { loadPublicMarketplaceRoute } from "@/src/features/public/publicMarketplaceRouteLoader";

const marketplacePayload = {
  filters: {},
  stats: {
    total_skills: 1,
    matching_skills: 1
  },
  pagination: {
    page: 1,
    page_size: 1,
    total_items: 1,
    total_pages: 1,
    prev_page: 0,
    next_page: 0
  },
  categories: [],
  top_tags: [],
  items: [],
  summary: {
    landing: {
      total_skills: 1,
      category_count: 1,
      top_tag_count: 0,
      featured_skill_count: 1,
      latest_skill_count: 1
    },
    category_hub: {
      total_categories: 1,
      total_skills: 1,
      top_tag_count: 0,
      spotlight_category_count: 1
    },
    category_detail: null
  },
  session_user: null,
  can_access_dashboard: false
} satisfies PublicMarketplaceResponse;

describe("loadPublicMarketplaceRoute", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(headers).mockResolvedValue(new Headers({ cookie: "session=test" }));
  });

  it("returns marketplace data when the backend request succeeds", async () => {
    vi.mocked(fetchMarketplace).mockResolvedValue(marketplacePayload);

    const result = await loadPublicMarketplaceRoute({
      requestQuery: {
        q: "release"
      },
      fallbackScope: "public-results-marketplace"
    });

    expect(result).toEqual({
      ok: true,
      marketplace: marketplacePayload
    });
  });

  it("returns an explicit error result instead of bundled fallback data when the backend request fails", async () => {
    vi.mocked(fetchMarketplace).mockRejectedValue(new Error("backend down"));

    const result = await loadPublicMarketplaceRoute({
      fallbackScope: "public-landing-marketplace",
      fallbackContext: {
        route: "/"
      }
    });

    expect(reportPublicFallbackError).toHaveBeenCalledWith("public-landing-marketplace", expect.any(Error), {
      route: "/"
    });
    expect(result).toEqual({
      ok: false,
      errorMessage: "backend down"
    });
  });
});
