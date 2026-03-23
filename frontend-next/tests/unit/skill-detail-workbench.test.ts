import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SkillDetailWorkbench } from "@/src/features/public/skill-detail/SkillDetailWorkbench";
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
  skillDetailOverviewDescription: "Overview description",
  skillDetailOverviewFactsTitle: "Facts",
  skillDetailOverviewMetricsTitle: "Metrics",
  skillDetailOverviewTitle: "Overview",
  skillDetailInstallDescription: "Install description",
  skillDetailInstallTitle: "Installation",
  skillDetailMetricsComments: "Comments",
  skillDetailMetricsRatings: "Ratings",
  skillDetailNoComments: "No comments",
  skillDetailNoInstall: "No install",
  skillDetailNotAvailable: "Not available",
  skillDetailNoResources: "No resources",
  skillDetailNoVersions: "No versions",
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

describe("SkillDetailWorkbench", () => {
  it("renders overview skill preview first and keeps ratings and comments near the bottom", () => {
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
      createElement(SkillDetailWorkbench, {
        activeTab: "overview",
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

    const documentIndex = markup.indexOf("skill-detail-overview-document-card");
    const relatedIndex = markup.indexOf("skill-detail-overview-related-card");
    const scoreIndex = markup.indexOf("skill-detail-overview-score-card");
    const commentsIndex = markup.indexOf("skill-detail-overview-comments-card");

    expect(markup).toContain("skill-detail-overview-score-card");
    expect(markup).toContain("skill-detail-overview-comments-card");
    expect(markup).toContain("skill-detail-overview-document-card");
    expect(markup).toContain("skill-detail-preview-stage");
    expect(markup).toContain("skill-detail-preview-stage-head");
    expect(markup).toContain("skill-detail-preview-stage-body");
    expect(markup).toContain(`href="/skills/${relatedSkillId}"`);
    expect(markup).toContain(`data-as="/light/skills/${relatedSkillId}"`);
    expect(documentIndex).toBeGreaterThan(-1);
    expect(relatedIndex).toBeGreaterThan(documentIndex);
    expect(scoreIndex).toBeGreaterThan(relatedIndex);
    expect(commentsIndex).toBeGreaterThan(scoreIndex);
  });
});
