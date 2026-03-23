import { readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function collectFiles(directory: string, extension: string, results: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const resolvedPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(resolvedPath, extension, results);
      continue;
    }

    if (entry.isFile() && resolvedPath.endsWith(extension)) {
      results.push(path.relative(process.cwd(), resolvedPath));
    }
  }

  return results;
}

describe("local style module format", () => {
  it("uses scss modules for local styles under src", () => {
    const sourceRoot = path.join(process.cwd(), "src");
    const cssModuleFiles = collectFiles(sourceRoot, ".module.css");

    expect(cssModuleFiles).toEqual([]);
  });
});
