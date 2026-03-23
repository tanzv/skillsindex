import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public route entry lazy imports", () => {
  it("lazy-loads the landing page from the shared route helper", () => {
    const source = readSourceFile("src/features/public/publicLandingRouteEntry.tsx");

    expect(source).toContain('await import("./PublicLanding")');
    expect(source).not.toContain('import { PublicLanding } from "./PublicLanding";');
  });

  it("lazy-loads the category hub page from the shared route helper", () => {
    const source = readSourceFile("src/features/public/publicCategoryRouteEntry.tsx");

    expect(source).toContain('await import("./PublicCategoryPage")');
    expect(source).not.toContain('import { PublicCategoryPage } from "./PublicCategoryPage";');
  });

  it("lazy-loads the category detail page from the shared route helper", () => {
    const source = readSourceFile("src/features/public/publicCategoryDetailRouteEntry.tsx");

    expect(source).toContain('await import("./PublicCategoryDetailPage")');
    expect(source).not.toContain('import { PublicCategoryDetailPage } from "./PublicCategoryDetailPage";');
  });

  it("lazy-loads the results page from the shared route helper", () => {
    const source = readSourceFile("src/features/public/publicResultsRouteEntry.tsx");

    expect(source).toContain('await import("./PublicSearchPage")');
    expect(source).not.toContain('import { PublicSearchPage } from "./PublicSearchPage";');
  });

  it("lazy-loads narrative snapshot pages from the shared route helper", () => {
    const source = readSourceFile("src/features/public/publicNarrativeSnapshotRouteEntry.tsx");

    expect(source).toContain('await import("./PublicDocsPage")');
    expect(source).toContain('await import("./PublicProgramPage")');
    expect(source).not.toContain('import { PublicDocsPage } from "./PublicDocsPage";');
    expect(source).not.toContain('import { PublicProgramPage } from "./PublicProgramPage";');
  });

  it("lazy-loads the state page from the shared route helper", () => {
    const source = readSourceFile("src/features/public/publicStateRouteEntry.tsx");

    expect(source).toContain('await import("./PublicStatePage")');
    expect(source).not.toContain('import { PublicStatePage } from "./PublicStatePage";');
  });
});
