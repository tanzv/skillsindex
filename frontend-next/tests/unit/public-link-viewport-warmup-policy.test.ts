import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public link viewport warmup policy", () => {
  it("consults the shared viewport warmup policy before observing skill links without importing feature-owned policy files", () => {
    const source = readSourceFile("src/components/shared/PublicLink.tsx");

    expect(source).toContain("shouldEnablePublicSkillViewportWarmupForEnvironment");
    expect(source).not.toContain('from "@/src/features/public/marketplace/publicSkillWarmupPolicy"');
    expect(source).toContain("!enableViewportWarmup");
  });
});
