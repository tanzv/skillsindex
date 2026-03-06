import { describe, expect, it, vi } from "vitest";
import type { MarketplaceSkill } from "../../lib/api";
import {
  buildSkillFilePath,
  copyInstallCommand,
  copySkillFilePath,
  openSkillSource
} from "./PublicSkillDetailInstallActions";

function buildSkill(overrides: Partial<MarketplaceSkill> = {}): MarketplaceSkill {
  return {
    id: 1,
    name: "browser-automation-pro",
    description: "Skill description",
    content: "Skill content",
    category: "development",
    subcategory: "automation",
    tags: [],
    source_type: "official",
    source_url: "https://github.com/skillsindex/browser-automation-pro",
    star_count: 10,
    quality_score: 99,
    install_command: "npx skillsindex install browser-automation-pro",
    updated_at: "2026-03-01T00:00:00Z",
    ...overrides
  };
}

describe("PublicSkillDetailInstallActions", () => {
  it("builds normalized file path with fallback file name", () => {
    expect(buildSkillFilePath("/repo-slug/", "")).toBe("/repo-slug/SKILL.md");
    expect(buildSkillFilePath("repo-slug", "README.md")).toBe("/repo-slug/README.md");
  });

  it("copies install command when command and clipboard are available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const status = await copyInstallCommand({
      skill: buildSkill({ install_command: "  npx skillsindex install x  " }),
      clipboard: { writeText }
    });

    expect(status).toBe("success");
    expect(writeText).toHaveBeenCalledWith("npx skillsindex install x");
  });

  it("returns missing command status when command is empty", async () => {
    const status = await copyInstallCommand({
      skill: buildSkill({ install_command: " " }),
      clipboard: { writeText: vi.fn() }
    });

    expect(status).toBe("missing_command");
  });

  it("returns clipboard unavailable status when clipboard is missing", async () => {
    const status = await copyInstallCommand({
      skill: buildSkill(),
      clipboard: null
    });

    expect(status).toBe("clipboard_unavailable");
  });

  it("returns failed status when clipboard write throws", async () => {
    const status = await copyInstallCommand({
      skill: buildSkill(),
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error("copy failed"))
      }
    });

    expect(status).toBe("failed");
  });

  it("copies selected file path with normalized repository slug", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const status = await copySkillFilePath({
      repositorySlug: "/skillsindex/browser-automation-pro/",
      selectedFileName: "README.md",
      clipboard: { writeText }
    });

    expect(status).toBe("success");
    expect(writeText).toHaveBeenCalledWith("/skillsindex/browser-automation-pro/README.md");
  });

  it("opens skill source in new window only when source url exists", () => {
    const openWindow = vi.fn();
    const success = openSkillSource({
      sourceURL: "https://github.com/skillsindex/browser-automation-pro",
      openWindow
    });
    const missing = openSkillSource({
      sourceURL: " ",
      openWindow
    });

    expect(success).toBe(true);
    expect(missing).toBe(false);
    expect(openWindow).toHaveBeenCalledTimes(1);
    expect(openWindow).toHaveBeenCalledWith(
      "https://github.com/skillsindex/browser-automation-pro",
      "_blank",
      "noopener,noreferrer"
    );
  });
});
