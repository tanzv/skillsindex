import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("skill detail taxonomy split", () => {
  it("keeps skill detail model and header decoupled from marketplace taxonomy runtime helpers", () => {
    const modelSource = readSourceFile("src/features/public/publicSkillDetailModel.ts");
    const headerSource = readSourceFile("src/features/public/skill-detail/SkillDetailHeader.tsx");

    expect(modelSource).not.toContain('from "./marketplace/marketplaceTaxonomy"');
    expect(headerSource).not.toContain('from "../marketplace/marketplaceTaxonomy"');
  });
});
