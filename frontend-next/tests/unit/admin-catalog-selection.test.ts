import { describe, expect, it } from "vitest";

import { resolveSelectedCatalogRow } from "@/src/features/adminCatalog/AdminCatalogShared";

const rows = [
  {
    id: 11,
    name: "Release Readiness Checklist",
    summary: "operations · repository · ops.lead",
    meta: ["184 stars", "9.3 quality"],
    status: "public"
  },
  {
    id: 12,
    name: "Repository Sync Blueprint",
    summary: "operations · repository · platform",
    meta: ["92 stars", "8.9 quality"],
    status: "private"
  }
];

describe("admin catalog selection", () => {
  it("defaults to the first row when no explicit selection exists", () => {
    expect(resolveSelectedCatalogRow(rows, null)?.id).toBe(11);
  });

  it("keeps the explicitly selected row when it remains visible", () => {
    expect(resolveSelectedCatalogRow(rows, 12)?.id).toBe(12);
  });

  it("clears the selection instead of silently remapping to the first row", () => {
    expect(resolveSelectedCatalogRow([rows[1]], 11)).toBeNull();
  });
});
