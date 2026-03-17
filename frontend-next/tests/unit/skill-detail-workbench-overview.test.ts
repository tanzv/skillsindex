import { describe, expect, it } from "vitest";

import { buildSkillDetailOverviewModel } from "@/src/features/public/skill-detail/skillDetailWorkbenchOverview";

describe("skill detail workbench overview", () => {
  it("builds summary and inline document preview content for overview", () => {
    const overview = buildSkillDetailOverviewModel({
      detail: {
        skill: {
          id: 14,
          name: "Repository Sync Auditor",
          description: "Review repository sync drift and ownership mappings.",
          content: "Repository sync auditor content.",
          category: "engineering",
          subcategory: "repository",
          tags: ["sync"],
          source_type: "repository",
          source_url: "https://github.com/skillsindex/repository-sync-auditor",
          star_count: 163,
          quality_score: 9.1,
          install_command: "uvx skillsindex sync-auditor",
          updated_at: "2026-03-16T12:50:47.641682+08:00"
        }
      },
      resourceContent: {
        skill_id: 14,
        path: "README.md",
        display_name: "README.md",
        language: "Markdown",
        size_bytes: 128,
        size_label: "0.1KB",
        content: "# README",
        updated_at: "2026-03-16T12:50:47.641682+08:00"
      },
      resources: {
        skill_id: 14,
        repo_url: "https://github.com/skillsindex/repository-sync-auditor",
        source_branch: "main",
        source_path: "SKILL.md",
        files: [
          {
            name: "SKILL.md",
            display_name: "SKILL.md",
            size_label: "0.1KB",
            language: "Markdown"
          },
          {
            name: "README.md",
            display_name: "README.md",
            size_label: "0.1KB",
            language: "Markdown"
          }
        ]
      },
      messages: {
        skillDetailContentTitle: "SKILL.md",
        skillDetailSelectFile: "Select a file",
        skillDetailUnknownLanguage: "Unknown"
      }
    });

    expect(overview).toEqual({
      summary: "Review repository sync drift and ownership mappings.",
      previewTitle: "README.md",
      previewLanguage: "Markdown",
      previewContent: "# README",
      previewUpdatedAt: "2026-03-16T12:50:47.641682+08:00"
    });
  });
});
