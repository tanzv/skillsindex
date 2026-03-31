import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("skill detail topbar stylesheet", () => {
  it("keeps narrow desktop and mobile layout overrides scoped to the skill detail route kind", () => {
    const stylesheetPath = path.join(process.cwd(), "app", "public-skill-detail-topbar.css");
    const css = readFileSync(stylesheetPath, "utf8");

    expect(css).toContain('@media (max-width: 1100px)');
    expect(css).toContain('.marketplace-shell[data-marketplace-route-kind="skill-detail"] .marketplace-topbar-right');
    expect(css).toContain('.marketplace-shell[data-marketplace-route-kind="skill-detail"] .skill-detail-topbar-actions');
    expect(css).toContain("justify-content: flex-end;");
    expect(css).toContain('@media (max-width: 760px)');
    expect(css).toContain('.marketplace-shell[data-marketplace-route-kind="skill-detail"] .skill-detail-topbar-nav');
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(css).toContain('.marketplace-shell[data-marketplace-route-kind="skill-detail"] .marketplace-home-topbar-icon-shell');
  });
});
