import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("AccountCenterMenu contracts", () => {
  it("uses shared dropdown-menu primitives instead of manual document listeners", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "src/components/shared/AccountCenterMenu.tsx"),
      "utf8"
    );

    expect(source).toContain("DropdownMenu");
    expect(source).toContain("DropdownMenuContent");
    expect(source).toContain("DropdownMenuPortal");
    expect(source).toContain("DropdownMenuTrigger");
    expect(source).not.toContain("document.addEventListener(\"pointerdown\"");
    expect(source).not.toContain("document.addEventListener(\"keydown\"");
  });

  it("keeps the dropdown card scrollable inside the shared viewport cap", () => {
    const styles = readFileSync(
      path.resolve(process.cwd(), "src/components/shared/AccountCenterMenu.module.scss"),
      "utf8"
    );

    expect(styles).toContain("max-height: inherit;");
    expect(styles).toContain("overflow-y: auto;");
  });
});
