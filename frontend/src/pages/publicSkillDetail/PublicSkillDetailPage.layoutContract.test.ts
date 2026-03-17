import { describe, expect, it } from "vitest";

import publicSkillDetailResponsiveSource from "./PublicSkillDetailPage.styles.responsive.ts?raw";

describe("PublicSkillDetailPage layout contract", () => {
  it("keeps compact breakpoints on the page-local content width contract", () => {
    expect(publicSkillDetailResponsiveSource).not.toContain(
      ".skill-detail-page:not(.is-visual-baseline) .skill-detail-main {\n      width: 100%;"
    );
    expect(publicSkillDetailResponsiveSource).not.toContain(
      ".skill-detail-page:not(.is-visual-baseline) .skill-detail-top {\n      height: auto;\n      width: 100%;"
    );
    expect(publicSkillDetailResponsiveSource).not.toContain("--skill-detail-content-width: 100%;");
  });
});
