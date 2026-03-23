import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import {
  accountApiCredentialsRoute,
  accountProfileRoute,
  adminImportsRoute,
  adminRepositoryIntakeRoute,
  adminSkillsRoute,
  adminSyncJobsRoute,
  workspaceActivityRoute,
  workspacePolicyRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import type { SessionContext } from "@/src/lib/schemas/session";

import { buildCommonQuickActions, buildOverviewQuickActions } from "./pageMetrics";
import {
  buildActivityItems,
  buildCurrentSessionSection,
  buildExecutionSpotlightSection,
  buildOwnerCoverageItems,
  buildPolicyCoverageItems,
  buildQueueInsightsSection,
  buildQueueSpotlightSection,
  buildReviewPressureSection,
  buildRiskWatchlistItems,
  buildRunbookResponseScriptSection,
  buildTopTagItems,
  buildWorkspaceSignalsSection
} from "./pageSectionShared";
import type { WorkspacePageModel, WorkspaceSnapshot } from "./types";

export type WorkspaceRouteSections = Pick<WorkspacePageModel, "primarySections" | "railSections" | "quickActions">;

export function buildOverviewRouteSections(
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): WorkspaceRouteSections {
  return {
    quickActions: buildOverviewQuickActions(snapshot, messages),
    primarySections: [
      buildWorkspaceSignalsSection(snapshot, session, messages),
      buildExecutionSpotlightSection(snapshot, messages),
      {
        id: "recent-activity",
        title: messages.sectionRecentActivityTitle,
        description: messages.sectionRecentActivityDescription,
        variant: "activity-list",
        items: buildActivityItems(snapshot.recentActivity, messages),
        actions: [{ label: messages.actionOpenActivityFeed, href: workspaceActivityRoute, variant: "outline" }]
      }
    ],
    railSections: [
      {
        id: "owner-coverage",
        title: messages.sectionOwnerCoverageTitle,
        description: messages.sectionOwnerCoverageDescription,
        variant: "compact-list",
        items: buildOwnerCoverageItems(snapshot, messages)
      },
      {
        id: "risk-watchlist",
        title: messages.sectionRiskWatchlistTitle,
        description: messages.sectionRiskWatchlistDescription,
        variant: "activity-list",
        items: buildRiskWatchlistItems(snapshot, messages),
        actions: [{ label: messages.actionReviewPolicy, href: workspacePolicyRoute, variant: "soft" }]
      },
      {
        id: "policy-coverage",
        title: messages.sectionPolicyCoverageTitle,
        description: messages.sectionPolicyCoverageDescription,
        variant: "compact-list",
        items: buildPolicyCoverageItems(snapshot)
      },
      buildCurrentSessionSection(session, messages)
    ]
  };
}

export function buildActivityRouteSections(
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): WorkspaceRouteSections {
  return {
    quickActions: buildCommonQuickActions(messages),
    primarySections: [
      {
        id: "activity-feed",
        title: messages.sectionActivityFeedTitle,
        description: messages.sectionActivityFeedDescription,
        variant: "activity-list",
        items: buildActivityItems(snapshot.recentActivity, messages)
      },
      {
        id: "owner-coverage",
        title: messages.sectionOwnerCoverageTitle,
        description: messages.sectionOwnerCoverageDescription,
        variant: "compact-list",
        items: buildOwnerCoverageItems(snapshot, messages)
      }
    ],
    railSections: [
      {
        id: "top-tags",
        title: messages.sectionTopTagsTitle,
        description: messages.sectionTopTagsDescription,
        variant: "compact-list",
        items: buildTopTagItems(snapshot, messages)
      },
      buildCurrentSessionSection(session, messages)
    ]
  };
}

export function buildQueueRouteSections(
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): WorkspaceRouteSections {
  return {
    quickActions: buildCommonQuickActions(messages),
    primarySections: [buildQueueSpotlightSection(snapshot, messages), buildQueueInsightsSection(snapshot, messages)],
    railSections: [
      {
        id: "escalation-paths",
        title: messages.sectionEscalationPathsTitle,
        description: messages.sectionEscalationPathsDescription,
        variant: "compact-list",
        items: [
          {
            label: messages.escalationImportRecoveryLabel,
            value: adminImportsRoute,
            description: messages.escalationImportRecoveryDescription
          },
          {
            label: messages.escalationGovernanceFollowupLabel,
            value: workspacePolicyRoute,
            description: messages.escalationGovernanceFollowupDescription
          },
          {
            label: messages.escalationCatalogReviewLabel,
            value: adminSkillsRoute,
            description: messages.escalationCatalogReviewDescription
          }
        ],
        actions: [{ label: messages.actionOpenImports, href: adminImportsRoute, variant: "soft" }]
      },
      buildCurrentSessionSection(session, messages)
    ]
  };
}

export function buildPolicyRouteSections(
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): WorkspaceRouteSections {
  return {
    quickActions: buildCommonQuickActions(messages),
    primarySections: [
      {
        id: "governance-priorities",
        title: messages.sectionGovernancePrioritiesTitle,
        description: messages.sectionGovernancePrioritiesDescription,
        variant: "compact-list",
        items: buildPolicyCoverageItems(snapshot)
      },
      buildReviewPressureSection(snapshot, messages)
    ],
    railSections: [
      {
        id: "top-tags",
        title: messages.sectionTopTagsTitle,
        description: messages.sectionTopTagsDescription,
        variant: "compact-list",
        items: buildTopTagItems(snapshot, messages)
      },
      buildCurrentSessionSection(session, messages)
    ]
  };
}

export function buildRunbookRouteSections(
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): WorkspaceRouteSections {
  return {
    quickActions: buildCommonQuickActions(messages),
    primarySections: [buildRunbookResponseScriptSection(snapshot.runbookEntry, messages)],
    railSections: [
      {
        id: "escalation-checklist",
        title: messages.sectionEscalationChecklistTitle,
        description: messages.sectionEscalationChecklistDescription,
        variant: "compact-list",
        items: [
          {
            label: messages.escalationChecklistOwnerConfirmedLabel,
            value: messages.escalationChecklistOwnerConfirmedValue
          },
          {
            label: messages.escalationChecklistPolicyReviewedLabel,
            value: messages.escalationChecklistPolicyReviewedValue
          },
          {
            label: messages.escalationChecklistExecutionEvidenceLabel,
            value: messages.escalationChecklistExecutionEvidenceValue
          }
        ]
      },
      buildCurrentSessionSection(session, messages)
    ]
  };
}

export function buildActionsRouteSections(
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): WorkspaceRouteSections {
  return {
    quickActions: [
      ...buildCommonQuickActions(messages),
      { label: messages.quickActionOpenAccountCenter, href: accountProfileRoute, variant: "outline" }
    ],
    primarySections: [
      {
        id: "quick-actions",
        title: messages.sectionQuickActionsTitle,
        description: messages.sectionQuickActionsDescription,
        variant: "compact-list",
        items: [
          {
            label: messages.quickActionsCatalogIntakeLabel,
            value: adminRepositoryIntakeRoute,
            description: messages.quickActionsCatalogIntakeDescription
          },
          {
            label: messages.quickActionsManualImportLabel,
            value: adminImportsRoute,
            description: messages.quickActionsManualImportDescription
          },
          {
            label: messages.quickActionsPolicyReviewLabel,
            value: workspacePolicyRoute,
            description: messages.quickActionsPolicyReviewDescription
          }
        ],
        actions: [
          { label: messages.actionOpenRepositoryIntake, href: adminRepositoryIntakeRoute, variant: "default" },
          { label: messages.actionOpenPolicyView, href: workspacePolicyRoute, variant: "outline" }
        ]
      },
      {
        id: "linked-surfaces",
        title: messages.sectionLinkedSurfacesTitle,
        description: messages.sectionLinkedSurfacesDescription,
        variant: "compact-list",
        items: [
          {
            label: messages.linkedSurfacesAdminSkillsLabel,
            value: adminSkillsRoute,
            description: messages.linkedSurfacesAdminSkillsDescription
          },
          {
            label: messages.linkedSurfacesSyncJobsLabel,
            value: adminSyncJobsRoute,
            description: messages.linkedSurfacesSyncJobsDescription
          },
          {
            label: messages.linkedSurfacesApiCredentialsLabel,
            value: accountApiCredentialsRoute,
            description: messages.linkedSurfacesApiCredentialsDescription
          }
        ]
      }
    ],
    railSections: [
      {
        id: "suggested-next-steps",
        title: messages.sectionSuggestedNextStepsTitle,
        description: messages.sectionSuggestedNextStepsDescription,
        variant: "compact-list",
        items: [
          {
            label: messages.suggestedHighestPriorityLabel,
            value: snapshot.riskWatchlist[0]?.name || messages.suggestedNoRiskItem
          },
          {
            label: messages.suggestedMostActiveOwnerLabel,
            value: snapshot.ownerCoverage[0]?.owner || messages.valueNotAvailable
          },
          {
            label: messages.suggestedTopTagLabel,
            value: snapshot.topTags[0]?.name || messages.valueNotAvailable
          }
        ]
      },
      buildCurrentSessionSection(session, messages)
    ]
  };
}
