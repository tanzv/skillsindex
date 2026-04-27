import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("admin operations records module split", () => {
  it("keeps the records page and display helpers on the stable kebab-case config module", () => {
    const pageSource = readRepoFile("src/features/adminOperations/AdminOperationsRecordsPage.tsx");
    const displaySource = readRepoFile("src/features/adminOperations/display.ts");

    expect(pageSource).toContain('from "./records-config"');
    expect(displaySource).toContain('from "./records-config"');
    expect(existsSync(path.join(process.cwd(), "src/features/adminOperations/records-config.ts"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "src/features/adminOperations/recordsConfig.ts"))).toBe(false);
  });
});
