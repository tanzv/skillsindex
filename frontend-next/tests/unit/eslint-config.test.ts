import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("eslint config", () => {
  it("ignores generated output, nested snapshots, and temporary directories", () => {
    const source = readSourceFile("eslint.config.mjs");

    expect(source).toContain(".next/**");
    expect(source).toContain(".next.bak-*/**");
    expect(source).toContain("frontend-next/**");
    expect(source).toContain("test-results/**");
    expect(source).toContain("tmp/**");
    expect(source).toContain("tmp-screens/**");
  });
});
