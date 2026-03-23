import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public results route split", () => {
  it("keeps the client page free of marketplace view-model and route-state dependencies", () => {
    const pageSource = readSourceFile("src/features/public/PublicSearchPage.tsx");

    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).not.toContain('from "@/src/lib/routing/usePublicRouteState"');
  });
});
