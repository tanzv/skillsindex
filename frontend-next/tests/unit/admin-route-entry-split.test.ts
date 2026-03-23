import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("admin route entry split", () => {
  it("keeps the admin route entry focused on forwarding to renderAdminRoute", () => {
    const source = readSourceFile("src/features/admin/adminRouteEntry.tsx");

    expect(source).toContain('from "./renderAdminRoute"');
    expect(source).not.toContain('from "@/src/lib/api/admin"');
    expect(source).not.toContain('from "next/headers"');
  });
});
