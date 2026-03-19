import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SkillDetailPreviewStage } from "@/src/features/public/skill-detail/SkillDetailPreviewStage";

describe("SkillDetailPreviewStage", () => {
  it("renders a stable header and scroll container", () => {
    const markup = renderToStaticMarkup(
      createElement(
        SkillDetailPreviewStage,
        {
          badge: "Updated Mar 18, 2026",
          meta: "Markdown",
          title: "SKILL.md"
        },
        createElement("pre", null, "# Skill content")
      )
    );

    expect(markup).toContain("skill-detail-preview-stage");
    expect(markup).toContain("skill-detail-preview-stage-head");
    expect(markup).toContain("skill-detail-preview-stage-body");
    expect(markup).toContain("Updated Mar 18, 2026");
  });

  it("renders an empty state without collapsing the shell", () => {
    const markup = renderToStaticMarkup(
      createElement(SkillDetailPreviewStage, {
        emptyState: createElement("p", { className: "skill-detail-empty-state" }, "No preview"),
        meta: "Markdown",
        title: "SKILL.md"
      })
    );

    expect(markup).toContain("skill-detail-preview-stage");
    expect(markup).toContain("No preview");
  });
});
