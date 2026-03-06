import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { publicSkillDetailCopy } from "./PublicSkillDetailPage.copy";
import { publicSkillDetailThemeStyles } from "./PublicSkillDetailPage.styles.theme";

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
  const filePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../prototypes/skillsindex_framework/skillsindex_framework.pen"
  );
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  return { id: "document", children: payload.children || [] };
}

function getPreviewNodeMap() {
  const filePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../prototypes/skillsindex_framework/preview-node-map.json"
  );
  return JSON.parse(readFileSync(filePath, "utf8"));
}

describe("Public skill detail pen alignment", () => {
  it("keeps key geometry and palette values synchronized with hEu3i", () => {
    const root = getPenRoot();
    const nodeMap = getPreviewNodeMap();
    const skillDetailMapping = nodeMap?.mapping?.find((entry) => entry?.path === "skill_detail");
    const lightMapping = nodeMap?.mapping?.find((entry) => entry?.path === "skill_detail_light");

    const detailNode = findNodeByID(root, "hEu3i");
    const lightNode = findNodeByID(root, "idgqT");
    const topNode = findNodeByID(detailNode, "5cXcz");
    const mainNode = findNodeByID(detailNode, "fUE4q");
    const leftNode = findNodeByID(detailNode, "B0SPl");
    const rightNode = findNodeByID(detailNode, "srvJM");
    const summaryNode = findNodeByID(detailNode, "MuDSG");
    const qualityNode = findNodeByID(detailNode, "5Kjwp");
    const fileNode = findNodeByID(detailNode, "ko4bk");
    const installNode = findNodeByID(detailNode, "DSCja");
    const metadataNode = findNodeByID(detailNode, "NTXOx");
    const actionNode = findNodeByID(detailNode, "vTAzl");
    const dependencyNode = findNodeByID(detailNode, "3Ku7g");

    expect(skillDetailMapping?.node_id).toBe("hEu3i");
    expect(lightMapping?.node_id).toBe("idgqT");
    expect(detailNode?.width).toBe(1440);
    expect(detailNode?.height).toBe(1160);
    expect(String(detailNode?.fill || "").toLowerCase()).toBe("#111111");
    expect(String(lightNode?.fill || "").toLowerCase()).toBe("#f0f0f0");
    expect([86, 120]).toContain(topNode?.height);
    expect(["#1a1a1a", "#0b1220"]).toContain(String(topNode?.fill || "").toLowerCase());
    expect(mainNode?.width).toBe(1360);
    expect([900, 980]).toContain(leftNode?.width);
    expect([444, 364]).toContain(rightNode?.width);

    if (summaryNode) {
      expect(summaryNode?.height).toBe(176);
    }
    if (qualityNode) {
      expect(qualityNode?.height).toBe(116);
    }
    if (fileNode) {
      expect([470, "fill_container"]).toContain(fileNode?.height);
    }
    if (installNode) {
      expect([210, 294]).toContain(installNode?.height);
    }
    if (metadataNode) {
      expect([240, 208]).toContain(metadataNode?.height);
    }
    if (actionNode) {
      expect([190, 208]).toContain(actionNode?.height);
    }
    if (dependencyNode) {
      expect([106, 140]).toContain(dependencyNode?.height);
    }

    expect(publicSkillDetailThemeStyles.styles).toContain("width: 1440px");
    expect(publicSkillDetailThemeStyles.styles).toContain("min-height: 1160px");
    expect(
      publicSkillDetailThemeStyles.styles.includes("height: 86px") ||
        publicSkillDetailThemeStyles.styles.includes("min-height: 120px")
    ).toBe(true);
    expect(
      publicSkillDetailThemeStyles.styles.includes("width: 1360px") ||
        publicSkillDetailThemeStyles.styles.includes("width: min(1360px, calc(100% - 24px))") ||
        publicSkillDetailThemeStyles.styles.includes("--skill-detail-content-width: 100%")
    ).toBe(true);
    expect(
      publicSkillDetailThemeStyles.styles.includes("width: 900px") ||
        publicSkillDetailThemeStyles.styles.includes("width: 980px") ||
        publicSkillDetailThemeStyles.styles.includes(".skill-detail-left-col {\n    width: 100%")
    ).toBe(true);
    expect(
      publicSkillDetailThemeStyles.styles.includes("width: 444px") ||
        publicSkillDetailThemeStyles.styles.includes("width: 364px") ||
        publicSkillDetailThemeStyles.styles.includes("grid-template-columns: minmax(0, 1fr) minmax(320px, 360px)")
    ).toBe(true);
    expect(publicSkillDetailThemeStyles.styles).toContain("height: 176px");
    expect(
      publicSkillDetailThemeStyles.styles.includes("height: 470px") ||
        publicSkillDetailThemeStyles.styles.includes("height: 560px") ||
        publicSkillDetailThemeStyles.styles.includes("height: 720px") ||
        publicSkillDetailThemeStyles.styles.includes("min-height: 760px")
    ).toBe(true);
    expect(publicSkillDetailThemeStyles.styles).toContain("background: #111111");
    expect(
      publicSkillDetailThemeStyles.styles.includes("background: #1a1a1a") ||
        publicSkillDetailThemeStyles.styles.includes("background: #0b1220") ||
        publicSkillDetailThemeStyles.styles.includes("background: #171717") ||
        publicSkillDetailThemeStyles.styles.includes("linear-gradient(180deg, #171717 0%, #12151b 100%)")
    ).toBe(true);
    expect(publicSkillDetailThemeStyles.styles).toContain("background: #242424");
    expect(publicSkillDetailThemeStyles.styles).toContain("border-radius: 16px");
  });

  it("keeps top-level copy synchronized with pen text", () => {
    const root = getPenRoot();
    const detailNode = findNodeByID(root, "hEu3i");
    const titleNode = findNodeByID(detailNode, "jhbiD");
    const breadcrumbNode = findNodeByID(detailNode, "ExlZ8");
    const tabSkillNode = findNodeByID(detailNode, "VceHl");
    const tabReadmeNode = findNodeByID(detailNode, "2XHvf");
    const tabFilesNode = findNodeByID(detailNode, "INqY4");
    const favoriteNode = findNodeByID(detailNode, "qXjUI");
    const installNode = findNodeByID(detailNode, "RxWEx");
    const compareNode = findNodeByID(detailNode, "xviEi");

    expect([publicSkillDetailCopy.zh.title, "browser-automation-pro"]).toContain(String(titleNode?.content || ""));
    if (breadcrumbNode) {
      expect(String(breadcrumbNode?.content || "")).toBe(publicSkillDetailCopy.zh.breadcrumb);
    }
    if (tabSkillNode) {
      expect(String(tabSkillNode?.content || "")).toBe(publicSkillDetailCopy.zh.tabSkill);
    }
    if (tabReadmeNode) {
      expect(String(tabReadmeNode?.content || "")).toBe(publicSkillDetailCopy.zh.tabReadme);
    }
    if (tabFilesNode) {
      expect(String(tabFilesNode?.content || "")).toBe(publicSkillDetailCopy.zh.tabFiles);
    }
    if (favoriteNode) {
      expect(String(favoriteNode?.content || "")).toBe(publicSkillDetailCopy.zh.favoriteSkill);
    }
    if (installNode) {
      expect(String(installNode?.content || "")).toBe(publicSkillDetailCopy.zh.installWorkspace);
    }
    if (compareNode) {
      expect(String(compareNode?.content || "")).toBe(publicSkillDetailCopy.zh.compareSkill);
    }
  });
});
