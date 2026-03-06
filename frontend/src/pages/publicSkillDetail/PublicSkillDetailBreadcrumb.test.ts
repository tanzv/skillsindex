import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import PublicSkillDetailBreadcrumb from "./PublicSkillDetailBreadcrumb";

describe("PublicSkillDetailBreadcrumb", () => {
  it("renders clickable ancestor nodes and marks current file as page", () => {
    const html = renderToStaticMarkup(
      React.createElement(PublicSkillDetailBreadcrumb, {
        rootLabel: "Marketplace",
        skillLabel: "browser-automation-pro",
        currentLabel: "README.md",
        onNavigateRoot: vi.fn(),
        onNavigateSkill: vi.fn()
      })
    );

    expect(html).toContain("Skill detail breadcrumb");
    expect(html).toContain('data-testid="skill-detail-breadcrumb-marketplace"');
    expect(html).toContain('data-testid="skill-detail-breadcrumb-skill"');
    expect(html).toContain('data-testid="skill-detail-breadcrumb-file"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("README.md");
  });
});
