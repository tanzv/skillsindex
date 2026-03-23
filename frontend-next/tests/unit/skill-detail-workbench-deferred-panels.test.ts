import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SkillDetailWorkbenchDeferredPanels } from "@/src/features/public/skill-detail/SkillDetailWorkbenchDeferredPanels";
import { buildPublicSkillDetailFallback } from "@/src/features/public/publicSkillDetailFallback";
import { buildPublicSkillDetailModel } from "@/src/features/public/publicSkillDetailModel";

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

const modelMessages = {
  skillDetailNotAvailable: "Not available",
  skillDetailMetricsQuality: "Quality",
  skillDetailMetricsFavorites: "Favorites",
  skillDetailMetricsRatings: "Ratings",
  skillDetailMetricsComments: "Comments",
  skillDetailFactCategory: "Category",
  skillDetailFactSourceType: "Source",
  skillDetailFactUpdated: "Updated",
  skillDetailFactStars: "Stars",
  skillDetailInstallLabel: "Install",
  skillDetailInstallHelp: "Install help",
  skillDetailRepositoryPathLabel: "Path",
  skillDetailRepositoryPathHelp: "Path help",
  skillDetailExecutionContextLabel: "Execution",
  skillDetailExecutionContextInteractive: "Interactive",
  skillDetailExecutionContextReadonly: "Read only",
  skillDetailExecutionContextHelp: "Execution help",
  skillDetailResourceRepositoryLabel: "Repository",
  skillDetailResourceBranchLabel: "Branch",
  skillDetailResourceFilesLabel: "Files",
  skillDetailResourcePreviewLabel: "Preview",
  skillDetailResourcePreviewLanguage: "Language",
  skillDetailVersionCapturedPrefix: "Captured",
  skillDetailNoInstall: "No install"
} as const;

const workbenchMessages = {
  rankingOpenSkillLabel: "Open skill",
  skillDetailContentTitle: "Skill",
  skillDetailInstallDescription: "Install description",
  skillDetailInstallTitle: "Installation",
  skillDetailNoResources: "No resources",
  skillDetailNoVersions: "No versions",
  skillDetailOverviewDescription: "Overview description",
  skillDetailOverviewTitle: "Overview",
  skillDetailRelatedDescription: "Related description",
  skillDetailRelatedTitle: "Related",
  skillDetailResourcesDescription: "Resources description",
  skillDetailResourcesTitle: "Resources",
  skillDetailSelectFile: "Select file",
  skillDetailUnknownLanguage: "Unknown language",
  skillDetailUpdatedBadgePrefix: "Updated",
  skillDetailVersionsDescription: "Versions description",
  skillDetailVersionsTitle: "History"
} as const;

describe("SkillDetailWorkbenchDeferredPanels", () => {
  it("renders canonical related skill links for prefixed public skill routes", () => {
    const fallback = buildPublicSkillDetailFallback(101);
    const model = buildPublicSkillDetailModel({
      detail: fallback.detail,
      resources: fallback.resources,
      versions: fallback.versions,
      resourceContent: fallback.resourceContent,
      locale: "en",
      messages: modelMessages
    });
    const relatedSkillId = model.relatedSkills[0]?.id;

    const markup = renderToStaticMarkup(
      createElement(SkillDetailWorkbenchDeferredPanels, {
        activeTab: "related",
        detail: fallback.detail,
        locale: "en",
        messages: workbenchMessages,
        model,
        onOpenFile: vi.fn(),
        resourceContent: fallback.resourceContent,
        resources: fallback.resources,
        selectedFileName: fallback.resources.files[0]?.name || ""
      })
    );

    expect(relatedSkillId).toBeTruthy();
    expect(markup).toContain('class="skill-detail-related-card"');
    expect(markup).toContain(`href="/skills/${relatedSkillId}"`);
    expect(markup).toContain(`data-as="/light/skills/${relatedSkillId}"`);
  });

  it("shows the selected resource name inside the skill preview header", () => {
    const fallback = buildPublicSkillDetailFallback(101);
    const model = buildPublicSkillDetailModel({
      detail: fallback.detail,
      resources: fallback.resources,
      versions: fallback.versions,
      resourceContent: fallback.resourceContent,
      locale: "en",
      messages: modelMessages
    });

    const markup = renderToStaticMarkup(
      createElement(SkillDetailWorkbenchDeferredPanels, {
        activeTab: "skill",
        detail: fallback.detail,
        locale: "en",
        messages: workbenchMessages,
        model,
        onOpenFile: vi.fn(),
        resourceContent: fallback.resourceContent,
        resources: fallback.resources,
        selectedFileName: "docs/README.md"
      })
    );

    expect(markup).toContain("skill-detail-preview-stage");
    expect(markup).toContain("README.md");
  });

  it("renders resource skeletons while deferred resources are still loading", () => {
    const fallback = buildPublicSkillDetailFallback(101);
    const model = buildPublicSkillDetailModel({
      detail: fallback.detail,
      resources: null,
      versions: fallback.versions,
      resourceContent: null,
      locale: "en",
      messages: modelMessages
    });

    const markup = renderToStaticMarkup(
      createElement(SkillDetailWorkbenchDeferredPanels, {
        activeTab: "resources",
        detail: fallback.detail,
        locale: "en",
        messages: workbenchMessages,
        model,
        onOpenFile: vi.fn(),
        resourceContent: null,
        resources: null,
        resourcesPending: true,
        selectedFileName: ""
      })
    );

    expect(markup).toContain("skill-detail-loading-shell");
    expect(markup).toContain("skill-detail-loading-tree");
    expect(markup).toContain("skill-detail-loading-preview");
  });

  it("renders version skeletons while deferred history is still loading", () => {
    const fallback = buildPublicSkillDetailFallback(101);
    const model = buildPublicSkillDetailModel({
      detail: fallback.detail,
      resources: fallback.resources,
      versions: null,
      resourceContent: fallback.resourceContent,
      locale: "en",
      messages: modelMessages
    });

    const markup = renderToStaticMarkup(
      createElement(SkillDetailWorkbenchDeferredPanels, {
        activeTab: "history",
        detail: fallback.detail,
        locale: "en",
        messages: workbenchMessages,
        model,
        onOpenFile: vi.fn(),
        resourceContent: fallback.resourceContent,
        resources: fallback.resources,
        selectedFileName: fallback.resources.files[0]?.name || "",
        versionsPending: true
      })
    );

    expect(markup).toContain("skill-detail-loading-shell");
    expect(markup).toContain("skill-detail-loading-timeline");
    expect(markup).toContain("skill-detail-loading-line");
  });

  it("keeps the resources preview empty when a file payload is unavailable", () => {
    const fallback = buildPublicSkillDetailFallback(101);
    const model = buildPublicSkillDetailModel({
      detail: fallback.detail,
      resources: fallback.resources,
      versions: fallback.versions,
      resourceContent: null,
      locale: "en",
      messages: modelMessages
    });

    const markup = renderToStaticMarkup(
      createElement(SkillDetailWorkbenchDeferredPanels, {
        activeTab: "resources",
        detail: fallback.detail,
        locale: "en",
        messages: workbenchMessages,
        model,
        onOpenFile: vi.fn(),
        resourceContent: null,
        resources: fallback.resources,
        selectedFileName: fallback.resources.files[0]?.name || ""
      })
    );

    expect(markup).toContain("Select file");
    expect(markup).not.toContain(fallback.detail.skill.content);
  });
});
