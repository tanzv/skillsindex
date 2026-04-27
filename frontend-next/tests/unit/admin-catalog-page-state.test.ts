import { describe, expect, it } from "vitest";

import {
  buildAdminCatalogRequestPath,
  createInitialRepositorySyncPolicyDraft,
  patchRepositorySyncPolicyDraft,
  updateAdminCatalogQuery
} from "@/src/features/adminCatalog/pageState";

describe("admin catalog page state", () => {
  it("builds the request path from trimmed non-empty query params", () => {
    expect(
      buildAdminCatalogRequestPath("/api/bff/admin/skills", {
        q: "  release  ",
        source: " repository ",
        empty: "   "
      })
    ).toBe("/api/bff/admin/skills?q=release&source=repository");
  });

  it("keeps page changes isolated while resetting page for other query changes", () => {
    expect(updateAdminCatalogQuery({ q: "release", page: "4" }, "page", "2")).toEqual({
      q: "release",
      page: "2"
    });

    expect(updateAdminCatalogQuery({ q: "release", page: "4" }, "status", "public")).toEqual({
      q: "release",
      page: "1",
      status: "public"
    });
  });

  it("creates and patches repository sync policy drafts deterministically", () => {
    expect(createInitialRepositorySyncPolicyDraft()).toEqual({
      enabled: false,
      interval: "30m",
      timeout: "10m",
      batchSize: 20
    });

    expect(
      patchRepositorySyncPolicyDraft(createInitialRepositorySyncPolicyDraft(), {
        enabled: true,
        batchSize: 50
      })
    ).toEqual({
      enabled: true,
      interval: "30m",
      timeout: "10m",
      batchSize: 50
    });
  });
});
