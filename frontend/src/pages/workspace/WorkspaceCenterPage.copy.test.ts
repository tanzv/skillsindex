import { describe, expect, it } from "vitest";

import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";

describe("WorkspaceCenterPage.copy", () => {
  it("returns English copy for en locale", () => {
    const text = getWorkspaceCenterCopy("en");

    expect(text.title).toBe("Team Workspace");
    expect(text.riskRatio).toBe("Risk ratio");
    expect(text.executionCoverage).toBe("Execution coverage");
  });

  it("returns localized Chinese copy for zh locale", () => {
    const text = getWorkspaceCenterCopy("zh");

    expect(text.title).toBe("\u56e2\u961f\u5de5\u4f5c\u53f0");
    expect(text.sidebarOrganizationTitle).toBe("\u7ec4\u7ec7\u7ba1\u7406");
    expect(text.riskRatio).toBe("\u98ce\u9669\u5360\u6bd4");
    expect(text.executionCoverage).toBe("\u6267\u884c\u8986\u76d6\u7387");
  });
});
