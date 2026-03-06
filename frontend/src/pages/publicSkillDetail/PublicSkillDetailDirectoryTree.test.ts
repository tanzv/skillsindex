import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import PublicSkillDetailDirectoryTree from "./PublicSkillDetailDirectoryTree";

describe("PublicSkillDetailDirectoryTree", () => {
  it("renders nested file rows for selected branch and exposes tree semantics", () => {
    const html = renderToStaticMarkup(
      React.createElement(PublicSkillDetailDirectoryTree, {
        fileEntries: [
          { name: "SKILL.md", size: "1KB" },
          { name: "docs/README.md", size: "1KB" },
          { name: "docs/guides/setup.md", size: "1KB" }
        ],
        rootLabel: "browser-automation-pro/",
        selectedFilePath: "docs/guides/setup.md",
        title: "File Browser",
        onSelectFile: vi.fn()
      })
    );

    expect(html).toContain('role="tree"');
    expect(html).toContain('role="treeitem"');
    expect(html).toContain("docs");
    expect(html).toContain("guides");
    expect(html).toContain("setup.md");
    expect(html).toContain('aria-selected="true"');
  });
});
