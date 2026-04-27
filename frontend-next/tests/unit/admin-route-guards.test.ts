import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("admin route guards", () => {
  it("keeps the shared admin layout free of hardcoded admin redirect targets", () => {
    const layoutSource = readRepoFile("app/(admin)/admin/layout.tsx");

    expect(layoutSource).toContain("requireSession: false");
    expect(layoutSource).not.toContain("scope: \"admin\"");
  });

  it("centralizes admin page guards in the shared route entry", () => {
    const routeEntrySource = readRepoFile("src/features/admin/adminRouteEntry.tsx");

    expect(routeEntrySource).toContain('import { guardAdminPageRoute } from "./guardAdminPageRoute";');
    expect(routeEntrySource).toContain("await guardAdminPageRoute(pathname);");
  });
});
