import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("account route split", () => {
  it("lazy-loads the account center page from the shared account route helper", () => {
    const source = readSourceFile("src/features/accountCenter/renderAccountRoute.tsx");

    expect(source).toContain('await import("./AccountCenterPage")');
    expect(source).not.toContain('from "./AccountCenterPage"');
  });
});
