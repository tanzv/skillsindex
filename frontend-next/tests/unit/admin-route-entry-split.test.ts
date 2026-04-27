import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("admin route entry split", () => {
  it("keeps the admin route entry focused on forwarding to renderAdminRoute", () => {
    const source = readRepoFile("src/features/admin/adminRouteEntry.tsx");

    expect(source).toContain('from "./renderAdminRoute"');
    expect(source).not.toContain('from "@/src/lib/api/admin"');
    expect(source).not.toContain('from "next/headers"');
  });
});
