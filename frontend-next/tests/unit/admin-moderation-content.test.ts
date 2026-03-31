import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { AdminModerationContent } from "@/src/features/adminGovernance/AdminModerationContent";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function createMessages() {
  return createProtectedPageTestMessages({
    adminCommon: {
      adminEyebrow: "Admin",
      refresh: "Refresh",
      refreshing: "Refreshing..."
    },
    adminModeration: {
      pageTitle: "Moderation",
      pageDescription: "Moderation workspace",
      resetFilters: "Reset Filters",
      loadError: "Failed to load moderation queue.",
      createReasonRequiredError: "Reason code is required.",
      createSuccess: "Moderation case created.",
      createError: "Failed to create moderation case.",
      selectCaseError: "Select a moderation case first.",
      resolveSuccess: "Case {caseId} resolved.",
      resolveError: "Failed to resolve moderation case.",
      rejectSuccess: "Case {caseId} rejected.",
      rejectError: "Failed to reject moderation case.",
      metricTotalCases: "Total Cases",
      metricOpenCases: "Open Cases",
      metricResolvedCases: "Resolved Cases",
      metricSkillTargets: "Skill Targets",
      queueFiltersTitle: "Queue Filters",
      queueFiltersDescription: "Filter the queue.",
      queueStatusLabel: "Queue status",
      queueStatusPlaceholder: "Status",
      queueTargetTypeLabel: "Queue target type",
      queueTargetTypePlaceholder: "Target type",
      queueReasonCodeLabel: "Queue reason code",
      queueReasonCodePlaceholder: "Reason code",
      queueTitle: "Moderation Queue",
      queueDescription: "Queue description",
      queueCount: "{count} cases",
      queueCasePrefix: "Case #{caseId}",
      queueReasonPrefix: "reason {value}",
      queueReporterPrefix: "reporter #{value}",
      queueSkillPrefix: "skill #{value}",
      queueCommentPrefix: "comment #{value}",
      queueNoAction: "no action",
      queueEmpty: "No moderation cases matched the current filter set.",
      openCaseDetailAction: "Open Details",
      selectedCaseTitle: "Selected Case",
      selectedCaseDescription: "Selected case description",
      noSelection: "No case selected",
      targetLabel: "Target",
      reasonLabel: "Reason",
      resolverLabel: "Resolver",
      updatedLabel: "Updated",
      reportedDetailTitle: "Reported detail",
      createTitle: "Create Case",
      createDescription: "Create a moderation case.",
      reporterUserIdLabel: "Case reporter user ID",
      reporterUserIdPlaceholder: "Reporter user ID",
      targetTypeLabel: "Case target type",
      targetTypeSkill: "skill",
      targetTypeComment: "comment",
      skillIdLabel: "Case skill ID",
      skillIdPlaceholder: "Skill ID",
      commentIdLabel: "Case comment ID",
      commentIdPlaceholder: "Comment ID",
      reasonCodeLabel: "Case reason code",
      reasonCodePlaceholder: "Reason code",
      reasonDetailLabel: "Case reason detail",
      reasonDetailPlaceholder: "Reason detail",
      openCreateCaseAction: "Open Create Case",
      createAction: "Create Case",
      creatingAction: "Creating...",
      dispositionTitle: "Disposition",
      dispositionDescription: "Disposition description",
      resolutionActionLabel: "Resolution action",
      resolutionActionFlagged: "flagged",
      resolutionActionHidden: "hidden",
      resolutionActionDeleted: "deleted",
      resolutionNoteLabel: "Resolution note",
      resolutionNotePlaceholder: "Resolution note",
      rejectionNoteLabel: "Rejection note",
      rejectionNotePlaceholder: "Rejection note",
      resolveAction: "Resolve Case",
      resolvingAction: "Resolving...",
      rejectAction: "Reject Case",
      rejectingAction: "Rejecting...",
      closePanelAction: "Close Panel",
      statusOpen: "open",
      statusResolved: "resolved",
      statusRejected: "rejected",
      statusFallback: "open",
      reasonSummaryRejected: "rejected",
      targetUnknown: "unknown",
      reasonUnspecified: "unspecified",
      actionNone: "none",
      notAvailable: "n/a"
    }
  });
}

function renderModerationContent(options: {
  activePane?: "idle" | "create" | "detail";
} = {}) {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      { locale: "en", messages: createMessages() },
      createElement(AdminModerationContent, {
        loading: false,
        busyAction: "",
        error: "",
        message: "",
        metrics: [
          { label: "Total Cases", value: "2" },
          { label: "Open Cases", value: "1" }
        ],
        payload: {
          total: 1,
          items: [
            {
              id: 61,
              reporterUserId: 7,
              resolverUserId: 0,
              targetType: "skill",
              skillId: 301,
              commentId: 0,
              reasonCode: "policy_violation",
              reasonDetail: "Requires review.",
              status: "open",
              action: "none",
              resolutionNote: "",
              resolvedAt: "",
              createdAt: "2026-03-16T10:00:00Z",
              updatedAt: "2026-03-16T11:00:00Z"
            }
          ]
        },
        selectedCase: {
          id: 61,
          reporterUserId: 7,
          resolverUserId: 0,
          targetType: "skill",
          skillId: 301,
          commentId: 0,
          reasonCode: "policy_violation",
          reasonDetail: "Requires review.",
          status: "open",
          action: "none",
          resolutionNote: "",
          resolvedAt: "",
          createdAt: "2026-03-16T10:00:00Z",
          updatedAt: "2026-03-16T11:00:00Z"
        },
        reasonSummary: [{ reason: "policy_violation", count: 1 }],
        query: { status: "", target_type: "", reason_code: "" },
        createDraft: {
          reporterUserId: "2",
          targetType: "skill",
          skillId: "301",
          commentId: "",
          reasonCode: "policy_violation",
          reasonDetail: "Needs review."
        },
        resolveDraft: {
          action: "flagged",
          resolutionNote: "",
          rejectionNote: ""
        },
        activePane: options.activePane ?? "idle",
        onRefresh: () => undefined,
        onResetFilters: () => undefined,
        onQueryChange: () => undefined,
        onOpenCreatePane: () => undefined,
        onOpenCaseDetail: () => undefined,
        onClosePane: () => undefined,
        onCreateDraftChange: () => undefined,
        onResolveDraftChange: () => undefined,
        onCreateCase: () => undefined,
        onResolveCase: () => undefined,
        onRejectCase: () => undefined
      })
    )
  );
}

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

function countOccurrences(markup: string, text: string) {
  return markup.split(text).length - 1;
}

describe("admin moderation content", () => {
  it("renders top-level moderation actions without a duplicated create trigger card", () => {
    const markup = renderModerationContent();

    expectMarkupToContainAll(markup, ["Open Create Case", "Reset Filters", "Refresh"]);
    expect(countOccurrences(markup, "Create a moderation case.")).toBe(0);
  });

  it("renders the create case drawer with form controls", () => {
    const markup = renderModerationContent({ activePane: "create" });

    expectMarkupToContainAll(markup, [
      "Moderation Queue",
      'data-testid="moderation-case-card-61"',
      'data-testid="admin-moderation-create-pane"',
      "Create Case",
      "Close Panel",
      'aria-label="Case reporter user ID"',
      'aria-label="Case target type"',
      'aria-label="Case skill ID"',
      'aria-label="Case comment ID"',
      'aria-label="Case reason code"',
      'aria-label="Case reason detail"'
    ]);
    expect(markup).toContain('role="dialog"');
  });

  it("renders the detail drawer with disposition controls", () => {
    const markup = renderModerationContent({ activePane: "detail" });

    expectMarkupToContainAll(markup, [
      "Moderation Queue",
      'data-testid="moderation-case-card-61"',
      'data-testid="admin-moderation-detail-pane"',
      "Case #61",
      "Close Panel",
      'aria-label="Resolution action"',
      'aria-label="Resolution note"',
      'aria-label="Rejection note"',
      "Resolve Case",
      "Reject Case"
    ]);
    expect(markup).toContain('role="dialog"');
  });
});
