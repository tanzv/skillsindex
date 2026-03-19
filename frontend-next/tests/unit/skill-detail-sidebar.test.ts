import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SkillDetailSidebar } from "@/src/features/public/skill-detail/SkillDetailSidebar";
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

vi.mock("@/src/features/public/PublicViewerSessionProvider", () => ({
  usePublicViewerSession: () => ({
    isAuthenticated: true
  })
}));

vi.mock("@/src/lib/auth/usePublicLoginTarget", () => ({
  usePublicLoginTarget: () => ({
    href: "/login",
    as: undefined
  })
}));

describe("SkillDetailSidebar", () => {
  it("renders the current preview context inside the installation card", () => {
    const fallback = buildPublicSkillDetailFallback(101);
    const model = buildPublicSkillDetailModel({
      detail: fallback.detail,
      resources: fallback.resources,
      versions: fallback.versions,
      resourceContent: fallback.resourceContent,
      locale: "en",
      messages: {
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
      }
    });

    const markup = renderToStaticMarkup(
      createElement(SkillDetailSidebar, {
        activeTab: "resources",
        busy: false,
        commentDraft: "",
        comments: fallback.detail.comments,
        currentContextLabel: "README.md",
        detail: fallback.detail,
        feedback: "",
        locale: "en",
        messages: {
          shellSignIn: "Sign In",
          shellWorkspace: "Workspace",
          skillDetailActionAddFavorite: "Add favorite",
          skillDetailActionCopyCommand: "Copy command",
          skillDetailActionCopyPrompt: "Copy prompt",
          skillDetailActionRatePrefix: "Rate",
          skillDetailActionRemoveFavorite: "Remove favorite",
          skillDetailCommentDelete: "Delete",
          skillDetailCommentPlaceholder: "Comment",
          skillDetailCommentSubmit: "Submit",
          skillDetailFeedbackCopyFailed: "Copy failed",
          skillDetailFeedbackCopied: "Copied",
          skillDetailInstallAgentHint: "Agent hint",
          skillDetailInstallAgentPromptTitle: "Agent Prompt",
          skillDetailInstallAudienceAgent: "Agent",
          skillDetailInstallAudienceHuman: "Human",
          skillDetailInstallDescription: "Install description",
          skillDetailInstallTitle: "Installation",
          skillDetailInteractionDescription: "Interact",
          skillDetailInteractionTitle: "Interaction",
          skillDetailMetricsComments: "Comments",
          skillDetailNoComments: "No comments",
          skillDetailOpenRankings: "Rankings",
          skillDetailOpenSource: "Source"
        },
        model,
        onCommentDelete: vi.fn(),
        onCommentDraftChange: vi.fn(),
        onCommentSubmit: vi.fn(),
        onFavorite: vi.fn(),
        onRate: vi.fn(),
        toPublicPath: (route: string) => route
      })
    );

    expect(markup).toContain("skill-detail-installation-card-context");
    expect(markup).toContain("README.md");
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('data-state="active"');
    expect(markup).toContain('aria-controls="skill-detail-install-agent-panel"');
  });

  it("renders the rating controls as a radio group", () => {
    const fallback = buildPublicSkillDetailFallback(101);
    const model = buildPublicSkillDetailModel({
      detail: fallback.detail,
      resources: fallback.resources,
      versions: fallback.versions,
      resourceContent: fallback.resourceContent,
      locale: "en",
      messages: {
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
      }
    });

    const markup = renderToStaticMarkup(
      createElement(SkillDetailSidebar, {
        activeTab: "skill",
        busy: false,
        commentDraft: "",
        comments: fallback.detail.comments,
        currentContextLabel: "README.md",
        detail: {
          ...fallback.detail,
          viewer_state: {
            ...fallback.detail.viewer_state,
            can_interact: true,
            rating: 4
          }
        },
        feedback: "",
        locale: "en",
        messages: {
          shellSignIn: "Sign In",
          shellWorkspace: "Workspace",
          skillDetailActionAddFavorite: "Add favorite",
          skillDetailActionCopyCommand: "Copy command",
          skillDetailActionCopyPrompt: "Copy prompt",
          skillDetailActionRatePrefix: "Rate",
          skillDetailActionRemoveFavorite: "Remove favorite",
          skillDetailCommentDelete: "Delete",
          skillDetailCommentPlaceholder: "Comment",
          skillDetailCommentSubmit: "Submit",
          skillDetailFeedbackCopyFailed: "Copy failed",
          skillDetailFeedbackCopied: "Copied",
          skillDetailInstallAgentHint: "Agent hint",
          skillDetailInstallAgentPromptTitle: "Agent Prompt",
          skillDetailInstallAudienceAgent: "Agent",
          skillDetailInstallAudienceHuman: "Human",
          skillDetailInstallDescription: "Install description",
          skillDetailInstallTitle: "Installation",
          skillDetailInteractionDescription: "Interact",
          skillDetailInteractionTitle: "Interaction",
          skillDetailMetricsComments: "Comments",
          skillDetailNoComments: "No comments",
          skillDetailOpenRankings: "Rankings",
          skillDetailOpenSource: "Source"
        },
        model,
        onCommentDelete: vi.fn(),
        onCommentDraftChange: vi.fn(),
        onCommentSubmit: vi.fn(),
        onFavorite: vi.fn(),
        onRate: vi.fn(),
        toPublicPath: (route: string) => route
      })
    );

    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('role="radio"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain("Rate 4");
  });
});
