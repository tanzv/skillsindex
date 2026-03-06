import { describe, expect, it } from "vitest";
import {
  buildSkillFileDirectoryTree,
  flattenSkillFileDirectoryTree,
  resolveDefaultExpandedDirectoryPaths
} from "./fileDirectoryTree";

describe("fileDirectoryTree", () => {
  it("builds hierarchical nodes for nested file paths", () => {
    const tree = buildSkillFileDirectoryTree([
      { name: "SKILL.md", size: "1KB" },
      { name: "docs/README.md", size: "1KB" },
      { name: "docs/guides/setup.md", size: "1KB" },
      { name: "scripts/install.sh", size: "1KB" }
    ]);

    expect(tree.map((node) => `${node.type}:${node.path}`)).toEqual([
      "directory:docs",
      "directory:scripts",
      "file:SKILL.md"
    ]);
    expect(tree[0]?.children.map((node) => `${node.type}:${node.path}`)).toEqual([
      "directory:docs/guides",
      "file:docs/README.md"
    ]);
    expect(tree[0]?.children[0]?.children.map((node) => `${node.type}:${node.path}`)).toEqual(["file:docs/guides/setup.md"]);
  });

  it("flattens tree rows with directory expansion state", () => {
    const tree = buildSkillFileDirectoryTree([
      { name: "docs/README.md", size: "1KB" },
      { name: "docs/guides/setup.md", size: "1KB" }
    ]);

    const collapsedRows = flattenSkillFileDirectoryTree(tree, new Set());
    expect(collapsedRows.map((row) => `${row.type}:${row.path}`)).toEqual(["directory:docs"]);

    const expandedRows = flattenSkillFileDirectoryTree(tree, new Set(["docs", "docs/guides"]));
    expect(expandedRows.map((row) => `${row.type}:${row.path}`)).toEqual([
      "directory:docs",
      "directory:docs/guides",
      "file:docs/guides/setup.md",
      "file:docs/README.md"
    ]);
  });

  it("resolves default expanded directories from selected file path", () => {
    const tree = buildSkillFileDirectoryTree([
      { name: "docs/README.md", size: "1KB" },
      { name: "examples/flows/login.yaml", size: "1KB" }
    ]);

    const expandedDirectories = resolveDefaultExpandedDirectoryPaths(tree, "examples/flows/login.yaml");
    expect(Array.from(expandedDirectories).sort()).toEqual(["docs", "examples", "examples/flows"]);
  });
});
