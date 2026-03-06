import { describe, expect, it } from "vitest";
import { publicSkillDetailCopy } from "./PublicSkillDetailPage.copy";
import {
  buildPrototypeSkillDetailSkill,
  buildSkillDetailViewModel,
  resolveFileIndexForPreset,
  resolvePresetForFileName,
  resolveSkillDetailDataMode
} from "./PublicSkillDetailPage.helpers";

describe("PublicSkillDetailPage.helpers", () => {
  it("defaults to live mode when env value is missing or invalid", () => {
    expect(resolveSkillDetailDataMode(undefined)).toBe("live");
    expect(resolveSkillDetailDataMode("")).toBe("live");
    expect(resolveSkillDetailDataMode("unknown")).toBe("live");
  });

  it("keeps prototype mode when explicitly configured", () => {
    expect(resolveSkillDetailDataMode("prototype")).toBe("prototype");
    expect(resolveSkillDetailDataMode(" PROTOTYPE ")).toBe("prototype");
  });

  it("allows query override mode for targeted tests and debugging", () => {
    expect(resolveSkillDetailDataMode("prototype", "live")).toBe("live");
    expect(resolveSkillDetailDataMode("live", "prototype")).toBe("prototype");
  });

  it("provides sql preset content for the sql detail route id", () => {
    const skill = buildPrototypeSkillDetailSkill(974);
    expect(skill.id).toBe(974);
    expect(skill.name).toBe("sql-performance-lab");
    expect(skill.install_command).toContain("sql-performance-lab");
    expect(skill.content).toContain("SELECT customer_id");
  });

  it("marks sql-like detail payloads with sql preview tone", () => {
    const sqlSkill = buildPrototypeSkillDetailSkill(974);
    const viewModel = buildSkillDetailViewModel(sqlSkill, "en", publicSkillDetailCopy.en);

    expect(viewModel.previewLanguage).toBe("SQL");
    expect(viewModel.codePanelTone).toBe("sql");
    expect(viewModel.runtimeValue).toBe("Not specified by source");
    expect(viewModel.presetPreviewContent.skill).toContain("SELECT customer_id");
    expect(viewModel.presetPreviewContent.readme).toContain("## Overview");
    expect(viewModel.presetPreviewContent.changelog).toContain("# CHANGELOG");
  });

  it("builds repository-aware preview file roots for non-sql skills", () => {
    const skill = buildPrototypeSkillDetailSkill(902);
    skill.name = "Skill Sync Auditor";
    skill.content = "";
    const viewModel = buildSkillDetailViewModel(skill, "en", publicSkillDetailCopy.en);

    expect(viewModel.repositorySlug).toBe("skill-sync-auditor");
    expect(viewModel.fileEntries[0]?.name).toBe("SKILL.md");
    expect(viewModel.fileEntries[1]?.name).toBe("README.md");
    expect(viewModel.fileEntries[2]?.name).toBe("CHANGELOG.md");
    expect(viewModel.fileEntries.some((entry) => entry.name === "examples/skill-sync-auditor_flow.yaml")).toBe(true);
    expect(viewModel.presetPreviewContent.skill).toContain("name: skill-sync-auditor");
  });

  it("uses interaction stats for summary rating and keeps unavailable metrics explicit", () => {
    const skill = buildPrototypeSkillDetailSkill(902);
    skill.quality_score = 9;

    const viewModel = buildSkillDetailViewModel(skill, "en", publicSkillDetailCopy.en, {
      favorite_count: 12,
      rating_count: 3,
      rating_average: 4.2,
      comment_count: 1
    });

    expect(viewModel.summaryMetrics[0]?.value).toBe("Available");
    expect(viewModel.summaryMetrics[1]?.value).toBe("12  ·  4.2 / 5.0 (3)");
    expect(viewModel.qualityMetrics[0]?.value).toBe("9.0");
    expect(viewModel.qualityMetrics[1]?.value).toBe("N/A");
    expect(viewModel.qualityMetrics[2]?.value).toBe("N/A");
  });

  it("normalizes 100-scale quality scores to the 10-scale output", () => {
    const skill = buildPrototypeSkillDetailSkill(902);
    skill.quality_score = 97.8;
    skill.content = "";

    const viewModel = buildSkillDetailViewModel(skill, "en", publicSkillDetailCopy.en);

    expect(viewModel.qualityMetrics[0]?.value).toBe("9.8");
    expect(viewModel.presetPreviewContent.skill).toContain("quality_score: 9.8");
  });

  it("resolves preferred file index by preset with sql fallback", () => {
    const fileEntries = [
      { name: "scripts/migration_2026.sql", size: "1.2KB" },
      { name: "README.md", size: "2.4KB" },
      { name: "CHANGELOG.md", size: "0.9KB" }
    ];

    expect(resolveFileIndexForPreset("skill", fileEntries)).toBe(0);
    expect(resolveFileIndexForPreset("readme", fileEntries)).toBe(1);
    expect(resolveFileIndexForPreset("changelog", fileEntries)).toBe(2);
  });

  it("keeps fallback index when fallback file already belongs to the selected preset", () => {
    const fileEntries = [
      { name: "SKILL.md", size: "1.2KB" },
      { name: "README.md", size: "2.4KB" },
      { name: "CHANGELOG.md", size: "0.9KB" },
      { name: "examples/custom_flow.yaml", size: "1.1KB" }
    ];

    expect(resolveFileIndexForPreset("skill", fileEntries, 3)).toBe(3);
    expect(resolveFileIndexForPreset("readme", fileEntries, 1)).toBe(1);
    expect(resolveFileIndexForPreset("changelog", fileEntries, 2)).toBe(2);
  });

  it("resolves preset key from file name patterns", () => {
    expect(resolvePresetForFileName("README.md")).toBe("readme");
    expect(resolvePresetForFileName("docs/CHANGELOG.md")).toBe("changelog");
    expect(resolvePresetForFileName("release-notes-2026.md")).toBe("changelog");
    expect(resolvePresetForFileName("SKILL.md")).toBe("skill");
    expect(resolvePresetForFileName("examples/order_flow.yaml")).toBe("skill");
  });
});
