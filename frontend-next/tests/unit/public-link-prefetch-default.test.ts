import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public link prefetch default", () => {
  it("disables next link prefetch by default while allowing explicit overrides", () => {
    const source = readSourceFile("src/components/shared/PublicLink.tsx");

    expect(source).toContain("prefetch={prefetch ?? false}");
  });
});
