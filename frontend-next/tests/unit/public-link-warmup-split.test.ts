import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public link warmup split", () => {
  it("lazy-loads skill warmup helpers so ordinary public links do not statically pull the warmup module", () => {
    const source = readSourceFile("src/components/shared/PublicLink.tsx");

    expect(source).toContain('import("./publicSkillRouteWarmup")');
    expect(source).not.toContain('from "./publicSkillRouteWarmup"');
  });
});
