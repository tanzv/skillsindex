import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { adminOverviewColors, adminOverviewStyles } from "./AdminOverviewPage.styles";
import { buildModuleActions } from "./AdminOverviewPage.helpers";

function findNodeByID(node, id) {
  if (node?.id === id) {
    return node;
  }
  for (const child of node?.children || []) {
    const matched = findNodeByID(child, id);
    if (matched) {
      return matched;
    }
  }
  return null;
}

function getPenRoot() {
  const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../prototypes/skillsindex_framework/skillsindex_admin_backend.pen");
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  return { id: "document", children: payload.children || [] };
}

describe("Admin overview pen alignment", () => {
  it("keeps key geometry values synchronized with 95uPl", () => {
    const root = getPenRoot();
    const overviewNode = findNodeByID(root, "95uPl");
    const topNode = findNodeByID(root, "jWOfu");
    const mainNode = findNodeByID(root, "rPXUI");
    const leftColNode = findNodeByID(root, "NA3ca");
    const rightColNode = findNodeByID(root, "PW5Cv");

    expect(overviewNode?.width).toBe(1440);
    expect(overviewNode?.height).toBe(900);
    expect(overviewNode?.fill).toBe("#0B1326");
    expect(topNode?.height).toBe(86);
    expect(mainNode?.width).toBe(1360);
    expect(leftColNode?.width).toBe(932);
    expect(rightColNode?.width).toBe(412);

    expect(adminOverviewStyles.stage.width).toBe(1440);
    expect(adminOverviewStyles.stage.height).toBe(900);
    expect(adminOverviewStyles.topBar.height).toBe(86);
    expect(adminOverviewStyles.mainGrid.width).toBe(1360);
    expect(adminOverviewStyles.mainGrid.gridTemplateColumns).toBe("932px 412px");
    expect(adminOverviewColors.stage).toBe("#0B1326");
    expect(adminOverviewColors.topBar).toBe("#12213F");
  });

  it("keeps core module route topology synchronized", () => {
    const root = getPenRoot();
    const actionLabelNode = findNodeByID(root, "bP6fF");
    const actions = buildModuleActions("/admin");

    expect(actionLabelNode?.content?.startsWith("📥")).toBe(true);
    expect(actions.map((item) => item.path)).toEqual([
      "/admin/records/exports",
      "/admin/accounts",
      "/admin/roles",
      "/admin/integrations/list",
      "/admin/incidents/list",
      "/admin/records/exports"
    ]);
  });
});
