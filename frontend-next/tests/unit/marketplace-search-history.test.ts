import { describe, expect, it } from "vitest";

import {
  createMarketplaceSearchHref,
  readMarketplaceRecentSearches,
  recordMarketplaceRecentSearch
} from "@/src/features/public/marketplace/searchHistory";

describe("marketplace search history helpers", () => {
  it("creates stable result hrefs for recent search entries", () => {
    expect(createMarketplaceSearchHref("/results", "release readiness")).toBe("/results?q=release+readiness");
    expect(createMarketplaceSearchHref("categories/operations", "drill")).toBe("/categories/operations?q=drill");
    expect(createMarketplaceSearchHref("/results", "release readiness", "ops")).toBe("/results?q=release+readiness&tags=ops");
  });

  it("records entries, deduplicates by route and query, and caps list length", () => {
    let entries = recordMarketplaceRecentSearch([], "/results", "release");
    entries = recordMarketplaceRecentSearch(entries, "/results", "release");
    entries = recordMarketplaceRecentSearch(entries, "/results", "repository");

    expect(entries).toHaveLength(2);
    expect(entries[0]?.query).toBe("repository");
    expect(entries[1]?.query).toBe("release");
  });

  it("ignores malformed storage payloads and keeps valid entries only", () => {
    const entries = readMarketplaceRecentSearches(
      JSON.stringify([
        { route: "/results", query: "release", createdAt: "2026-03-14T12:00:00Z" },
        { route: "/results", query: "", createdAt: "2026-03-14T12:01:00Z" },
        null
      ])
    );

    expect(entries).toEqual([
      {
        route: "/results",
        query: "release",
        createdAt: "2026-03-14T12:00:00Z"
      }
    ]);
  });

  it("migrates legacy marketplace search history entries into the new schema", () => {
    const entries = readMarketplaceRecentSearches(
      JSON.stringify([
        { q: "release", tags: "automation", timestamp: 1710400000000 },
        { q: "", tags: "", timestamp: 1710400000001 }
      ])
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      route: "/results",
      query: "release",
      tags: "automation"
    });
  });

  it("records semantic filters alongside the keyword query and deduplicates them independently", () => {
    let entries = recordMarketplaceRecentSearch([], "/results", "release", "ops", "2026-03-15T00:00:00.000Z");
    entries = recordMarketplaceRecentSearch(entries, "/results", "release", "automation", "2026-03-15T00:01:00.000Z");
    entries = recordMarketplaceRecentSearch(entries, "/results", "release", "ops", "2026-03-15T00:02:00.000Z");

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      route: "/results",
      query: "release",
      tags: "ops"
    });
    expect(entries[1]).toMatchObject({
      route: "/results",
      query: "release",
      tags: "automation"
    });
  });
});
