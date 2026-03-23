import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("eslint config", () => {
  it("ignores generated Next.js output and backup directories", () => {
    const source = readSourceFile("eslint.config.mjs");

    expect(source).toContain(".next/**");
    expect(source).toContain(".next.bak-*/**");
    expect(source).toContain("test-results/**");
  });
});
