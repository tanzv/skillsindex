import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public skill detail api split", () => {
  it("keeps initial skill detail loading decoupled from the marketplace aggregate api module", () => {
    const source = readSourceFile("src/features/public/loadInitialSkillDetailPageData.ts");

    expect(source).not.toContain('from "@/src/lib/api/public"');
    expect(source).not.toContain('from "../lib/api/public"');
  });
});
