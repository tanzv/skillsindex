import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("skill detail light theme stylesheet", () => {
  it("keeps preview stage selectors aligned with the shared preview shell", () => {
    const stylesheetPath = path.join(process.cwd(), "app", "public-skill-detail-light.css");
    const css = readFileSync(stylesheetPath, "utf8");

    expect(css).toContain(".skill-detail-overview-card .skill-detail-preview-stage-head");
    expect(css).toContain(".skill-detail-preview-stage:not(.skill-detail-overview-card)");
    expect(css).toContain(".skill-detail-overview-document-stage");
    expect(css).toContain(".skill-detail-overview-document-stage .skill-detail-preview-stage-head");
    expect(css).toContain(".skill-detail-overview-document-stage .skill-detail-preview-content");
  });
});
