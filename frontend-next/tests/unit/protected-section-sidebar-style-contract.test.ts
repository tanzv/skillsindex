import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readStyleFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("ProtectedSectionSidebar style contract", () => {
  it("keeps explicit left padding on group titles", () => {
    const styles = readStyleFile("src/components/shared/ProtectedSectionSidebar.module.scss");

    expect(styles).toContain(".groupTitle");
    expect(styles).toContain("padding-left: 16px;");
  });

  it("keeps the sidebar panel height-constrained with an internal scroll region", () => {
    const sidebarStyles = readStyleFile("src/components/shared/ProtectedSectionSidebar.module.scss");
    const shellStyles = readStyleFile("app/protected-shell-layout.scss");

    expect(sidebarStyles).toContain("grid-template-rows: auto minmax(0, 1fr);");
    expect(sidebarStyles).toContain("height: 100%;");
    expect(sidebarStyles).toContain("overflow: hidden;");
    expect(sidebarStyles).toContain("overflow-y: auto;");
    expect(shellStyles).toContain(".protected-console-sidebar-desktop");
    expect(shellStyles).toContain("max-height: calc(100vh - var(--protected-sidebar-sticky-offset) - var(--protected-sidebar-viewport-padding));");
  });
});
