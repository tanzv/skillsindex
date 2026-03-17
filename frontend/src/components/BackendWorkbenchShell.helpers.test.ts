import { describe, expect, it } from "vitest";

import { protectedWorkbenchSections } from "../app/protectedWorkbenchConfig";

import {
  buildSecondaryNavGlyph,
  resolvePrimaryNavVisibleCount,
  splitPrimaryNavSections
} from "./BackendWorkbenchShell.helpers";

describe("BackendWorkbenchShell helpers", () => {
  it("keeps all primary sections visible on wide viewports", () => {
    expect(resolvePrimaryNavVisibleCount(1440, protectedWorkbenchSections.length)).toBe(protectedWorkbenchSections.length);
  });

  it("collapses primary sections into overflow on narrower viewports while keeping the active section visible", () => {
    const result = splitPrimaryNavSections(protectedWorkbenchSections, "users", 1180);

    expect(result.visibleSections.map((section) => section.id)).toEqual(["workspace", "overview", "catalog", "users"]);
    expect(result.hiddenSections.map((section) => section.id)).toEqual(["operations", "security", "account"]);
  });

  it("builds compact glyphs for collapsed secondary navigation", () => {
    expect(buildSecondaryNavGlyph("Activity Feed")).toBe("AF");
    expect(buildSecondaryNavGlyph("Overview")).toBe("OV");
    expect(buildSecondaryNavGlyph("")).toBe("?");
  });
});
