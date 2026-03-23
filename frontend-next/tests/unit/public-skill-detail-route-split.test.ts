import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public skill detail route split", () => {
  it("keeps the interactive detail shell free of public route state dependencies and local skill fallback imports", () => {
    const source = readSourceFile("src/features/public/PublicSkillInteractiveDetail.tsx");

    expect(source).not.toContain('from "@/src/lib/routing/usePublicRouteState"');
    expect(source).not.toContain('from "../lib/routing/usePublicRouteState"');
    expect(source).not.toContain('import("./publicSkillDetailFallback")');
    expect(source).not.toContain("loadFallbackResourceContent");
    expect(source).toContain('from "./publicSkillInteractivePageModel"');
  });
});
