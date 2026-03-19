import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SkillDetailResourceTree } from "@/src/features/public/skill-detail/SkillDetailResourceTree";

describe("SkillDetailResourceTree", () => {
  it("renders a resource table with name and size columns", () => {
    const markup = renderToStaticMarkup(
      createElement(SkillDetailResourceTree, {
        title: "Name",
        selectedFileName: "docs/README.md",
        onOpenFile: vi.fn(),
        resources: {
          skill_id: 14,
          repo_url: "https://github.com/skillsindex/repository-sync-auditor",
          source_branch: "main",
          source_path: "SKILL.md",
          files: [
            {
              name: "SKILL.md",
              display_name: "SKILL.md",
              size_label: "1.2 KB",
              language: "Markdown"
            },
            {
              name: "docs/README.md",
              display_name: "README.md",
              size_label: "0.8 KB",
              language: "Markdown"
            },
            {
              name: "docs/setup/guide.md",
              display_name: "guide.md",
              size_label: "2.0 KB",
              language: "Markdown"
            }
          ]
        }
      })
    );

    expect(markup).toContain('data-testid="skill-detail-resource-tree"');
    expect(markup).toContain(">Name<");
    expect(markup).toContain(">Size<");
    expect(markup).toContain(">README.md<");
    expect(markup).toContain(">guide.md<");
    expect(markup).toContain(">docs/README.md<");
    expect(markup).toContain(">docs/setup/guide.md<");
    expect(markup).toContain(">0.8 KB<");
    expect(markup).toContain(">2.0 KB<");
    expect(markup).toContain('aria-selected="true"');
  });
});
