import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("skill detail taxonomy split", () => {
  it("keeps skill detail model and header decoupled from marketplace taxonomy runtime helpers", () => {
    const modelSource = readRepoFile("src/features/public/publicSkillDetailModel.ts");
    const headerSource = readRepoFile("src/features/public/skill-detail/SkillDetailHeader.tsx");

    expect(modelSource).not.toContain('from "./marketplace/marketplaceTaxonomy"');
    expect(headerSource).not.toContain('from "../marketplace/marketplaceTaxonomy"');
  });
});
