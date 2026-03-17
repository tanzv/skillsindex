import { describe, expect, it } from "vitest";

import type { MarketplaceSkill, PublicSkillResourcesResponse, PublicSkillVersionItem } from "../../lib/api";
import type { SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";
import {
  resolveDetailFileEntries,
  resolveSkillResourceSnapshot,
  resolveSkillVersionHistoryEntries
} from "./PublicSkillDetailPage.liveData";

function createDetailViewModel(): SkillDetailViewModel {
  return {
    repositoryHostPath: "github.com/example/skill-catalog",
    fileEntries: [{ name: "SKILL.md", displayName: "SKILL.md", size: "0.1KB" }]
  } as SkillDetailViewModel;
}

function createActiveSkill(): MarketplaceSkill {
  return {
    id: 11,
    name: "Skill Catalog",
    description: "Catalog skill",
    content: "Skill content",
    category: "development",
    subcategory: "automation",
    tags: ["catalog"],
    source_type: "repository",
    source_url: "https://skills.example.com/skill-catalog",
    star_count: 12,
    quality_score: 8.8,
    install_command: "codex skill install github:example/skill-catalog",
    updated_at: "2026-03-01T10:00:00.000Z"
  };
}

describe("PublicSkillDetailPage.liveData", () => {
  it("prefers resource files when live resources are available", () => {
    const resources: PublicSkillResourcesResponse = {
      skill_id: 11,
      source_type: "repository",
      source_url: "https://github.com/example/skill",
      repo_url: "https://github.com/example/skill",
      source_branch: "main",
      source_path: "skills/skill/SKILL.md",
      install_command: "codex skill install github:example/skill",
      updated_at: "2026-03-01T10:00:00.000Z",
      file_count: 1,
      files: [
        {
          name: "skills/skill/SKILL.md",
          display_name: "skills/skill/SKILL.md",
          size_bytes: 128,
          size_label: "0.1KB",
          language: "Markdown"
        }
      ]
    };

    const resolved = resolveDetailFileEntries(
      [
        { name: "SKILL.md", displayName: "SKILL.md", size: "0.1KB" },
        { name: "README.md", displayName: "README.md", size: "0.2KB" }
      ],
      resources
    );

    expect(resolved).toEqual([
      { name: "skills/skill/SKILL.md", displayName: "skills/skill/SKILL.md", size: "0.1KB" }
    ]);
  });

  it("keeps fallback file entries when no resource files exist", () => {
    const resolved = resolveDetailFileEntries(
      [{ name: "SKILL.md", displayName: "SKILL.md", size: "0.1KB" }],
      null
    );

    expect(resolved).toEqual([{ name: "SKILL.md", displayName: "SKILL.md", size: "0.1KB" }]);
  });

  it("prefers live resource metadata for the resources panel snapshot", () => {
    const snapshot = resolveSkillResourceSnapshot({
      activeSkill: createActiveSkill(),
      detailModel: createDetailViewModel(),
      selectedFileName: "README.md",
      resources: {
        skill_id: 11,
        source_type: "repository",
        source_url: "https://github.com/example/skill-catalog/tree/main",
        repo_url: "https://github.com/example/skill-catalog",
        source_branch: "main",
        source_path: "skills/skill-catalog/SKILL.md",
        install_command: "codex skill install github:example/skill-catalog",
        updated_at: "2026-03-02T10:00:00.000Z",
        file_count: 7,
        files: []
      }
    });

    expect(snapshot).toEqual({
      sourceUrl: "https://github.com/example/skill-catalog/tree/main",
      repository: "https://github.com/example/skill-catalog",
      sourceBranch: "main",
      sourcePath: "skills/skill-catalog/SKILL.md",
      selectedFile: "README.md",
      sourceType: "repository",
      updatedAt: "2026-03-02T10:00:00.000Z",
      fileCount: "7"
    });
  });

  it("maps live version payloads into history entries with stable fallbacks", () => {
    const versionItems: PublicSkillVersionItem[] = [
      {
        id: 7,
        skill_id: 11,
        version_number: 4,
        trigger: "sync",
        change_summary: "",
        risk_level: "medium",
        captured_at: "2026-03-02T10:00:00.000Z",
        actor_username: "sync-bot",
        actor_display_name: "",
        tags: ["sync"],
        changed_fields: ["content", "tags"]
      }
    ];

    expect(resolveSkillVersionHistoryEntries(versionItems)).toEqual([
      {
        id: 7,
        versionLabel: "v4",
        trigger: "sync",
        riskLevel: "medium",
        capturedAt: "2026-03-02T10:00:00.000Z",
        summary: "content, tags",
        actor: "sync-bot",
        changedFields: "content, tags",
        tags: "sync"
      }
    ]);
  });
});
