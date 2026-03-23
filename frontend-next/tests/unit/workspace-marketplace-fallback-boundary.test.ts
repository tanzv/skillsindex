import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("workspace marketplace fallback boundary", () => {
  it("does not wire marketplace fallback defaults into workspace runtime modules", () => {
    const sourceFiles = [
      "src/features/workspace/pageModel.ts",
      "src/features/workspace/snapshot.ts",
      "src/features/workspace/WorkspaceRouteScene.tsx"
    ];

    for (const sourceFile of sourceFiles) {
      const source = readSourceFile(sourceFile);

      expect(source).not.toContain('from "@/src/lib/marketplace/fallback"');
      expect(source).not.toContain('from "@/src/features/public/publicMarketplaceFallback"');
    }
  });
});
