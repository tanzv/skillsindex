import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SkillDetailContextBar } from "@/src/features/public/skill-detail/SkillDetailContextBar";
import { buildSkillDetailWorkspaceCopy } from "@/src/features/public/skill-detail/skillDetailWorkspaceConfig";

vi.mock("next/link", () => ({
  default: ({
    href,
    as,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    as?: string;
    children: ReactNode;
  }) => createElement("a", { href, "data-as": as, ...props }, children)
}));

vi.mock("@/src/lib/routing/usePublicRouteState", () => ({
  usePublicRouteState: () => ({
    prefix: "/light"
  })
}));

describe("SkillDetailContextBar", () => {
  it("renders the breadcrumb, active tab, and preview status", () => {
    const messages = {
      skillDetailContentTitle: "Skill",
      skillDetailOverviewDescription: "Overview description",
      skillDetailOverviewTitle: "Overview",
      skillDetailInstallDescription: "Install description",
      skillDetailInstallTitle: "Installation",
      skillDetailRelatedDescription: "Related description",
      skillDetailRelatedTitle: "Related",
      skillDetailResourcesDescription: "Resources description",
      skillDetailResourcesTitle: "Resources",
      skillDetailVersionsDescription: "Versions description",
      skillDetailVersionsTitle: "History"
    } as const;

    const workspaceCopy = buildSkillDetailWorkspaceCopy(messages);
    const markup = renderToStaticMarkup(
      createElement(SkillDetailContextBar, {
        activeTab: "resources",
        breadcrumbAriaLabel: "Skill detail",
        breadcrumbItems: [
          { href: "/", label: "Home" },
          { href: "/skills/101", label: "Next.js UX Audit Agent" },
          { label: "Resources", isCurrent: true }
        ],
        previewStatus: "README.md",
        onTabChange: vi.fn(),
        workspaceCopy
      })
    );

    expect(markup).toContain("skill-detail-context-bar");
    expect(markup).toContain("README.md");
    expect(markup).toContain('data-testid="skill-detail-context-bar"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('data-as="/light/skills/101"');
  });
});
