import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public ranking model runtime boundary", () => {
  it("keeps runtime ranking model free of marketplace fallback data helpers", () => {
    const source = readSourceFile("src/features/public/publicRankingModel.ts");

    expect(source).not.toContain('from "@/src/lib/marketplace/fallback"');
    expect(source).not.toContain("buildPublicRankingFallbackResponse");
  });
});
