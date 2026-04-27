import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import { loadWorkspaceRouteData, resolveWorkspaceMarketplaceQuery } from "@/src/features/workspace/workspaceRouteDataLoader";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("workspaceRouteDataLoader", () => {
  const requestHeaders = new Headers({ cookie: "skillsindex_session=session-123" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps workspace routes to lightweight marketplace queries", () => {
    expect(resolveWorkspaceMarketplaceQuery("/workspace")).toEqual({
      sort: "recent",
      page: "1",
      page_size: "12"
    });
    expect(resolveWorkspaceMarketplaceQuery("/workspace/policy")).toEqual({
      sort: "quality",
      page: "1",
      page_size: "10"
    });
    expect(resolveWorkspaceMarketplaceQuery("/workspace/actions")).toEqual({
      sort: "recent",
      page: "1",
      page_size: "6"
    });
  });

  it("loads route-scoped marketplace data through the injected fetcher", async () => {
    const fetchMarketplaceData = vi.fn().mockResolvedValue({
      filters: {},
      stats: {
        total_skills: 0,
        matching_skills: 0
      },
      pagination: {
        page: 1,
        page_size: 8,
        total_items: 0,
        total_pages: 1,
        prev_page: 0,
        next_page: 0
      },
      categories: [],
      top_tags: [],
      items: [],
      session_user: null,
      can_access_dashboard: false
    } satisfies PublicMarketplaceResponse);

    await loadWorkspaceRouteData("/workspace/runbook", requestHeaders, fetchMarketplaceData);

    expect(fetchMarketplaceData).toHaveBeenCalledWith(requestHeaders, {
      sort: "quality",
      page: "1",
      page_size: "8"
    });
  });

  it("returns a fresh query object for each resolution", () => {
    const query = resolveWorkspaceMarketplaceQuery("/workspace/activity");
    query.page_size = "99";

    expect(resolveWorkspaceMarketplaceQuery("/workspace/activity")).toEqual({
      sort: "recent",
      page: "1",
      page_size: "8"
    });
  });

  it("keeps route query selection delegated to the shared workspace route contract", () => {
    const source = readRepoFile("src/features/workspace/workspaceRouteDataLoader.ts");

    expect(source).toContain('from "@/src/lib/routing/workspaceRouteMeta"');
    expect(source).not.toContain("const workspaceMarketplaceQueries");
  });
});
