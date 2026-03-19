import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { SessionContext } from "@/src/lib/schemas/session";

import { formatWorkspaceMessage } from "./messages";
import { formatWorkspaceDate } from "./snapshot";
import type { WorkspaceQueueEntry, WorkspaceSection, WorkspaceSectionItem, WorkspaceSnapshot } from "./types";

export function resolveStatusLabel(status: WorkspaceQueueEntry["status"], messages: WorkspaceMessages) {
  switch (status) {
    case "running":
      return messages.statusRunning;
    case "risk":
      return messages.statusRisk;
    case "pending":
    default:
      return messages.statusPending;
  }
}

function formatStatusOwnerValue(entry: WorkspaceQueueEntry, messages: WorkspaceMessages) {
  return formatWorkspaceMessage(messages.itemStatusOwnerTemplate, {
    status: resolveStatusLabel(entry.status, messages),
    owner: entry.owner
  });
}

function formatCategoryPath(category: string, subcategory: string, messages: WorkspaceMessages) {
  return formatWorkspaceMessage(messages.itemCategoryPathTemplate, { category, subcategory });
}

export function buildActivityItems(entries: WorkspaceSnapshot["recentActivity"], messages: WorkspaceMessages): WorkspaceSectionItem[] {
  return entries.map((entry) => ({
    label: entry.name,
    value: formatStatusOwnerValue(entry, messages),
    description: `${entry.summary} ${formatWorkspaceMessage(messages.itemUpdatedTemplate, {
      value: formatWorkspaceDate(entry.updatedAt, messages)
    })} · ${formatCategoryPath(entry.category, entry.subcategory, messages)}.`
  }));
}

export function buildOwnerCoverageItems(snapshot: WorkspaceSnapshot, messages: WorkspaceMessages): WorkspaceSectionItem[] {
  return snapshot.ownerCoverage.map((item) => ({
    label: item.owner,
    value: formatWorkspaceMessage(messages.ownerCoverageValueTemplate, {
      items: item.itemCount,
      risk: item.riskCount
    }),
    description: formatWorkspaceMessage(messages.itemAverageQualityTemplate, { value: item.averageQuality })
  }));
}

export function buildRiskWatchlistItems(snapshot: WorkspaceSnapshot, messages: WorkspaceMessages): WorkspaceSectionItem[] {
  if (snapshot.riskWatchlist.length === 0) {
    return [
      {
        label: messages.riskNoActiveLabel,
        value: messages.riskNoActiveValue,
        description: messages.riskNoActiveDescription
      }
    ];
  }

  return snapshot.riskWatchlist.map((entry) => ({
    label: entry.name,
    value: formatStatusOwnerValue(entry, messages),
    description: `${entry.summary} ${formatWorkspaceMessage(messages.itemUpdatedTemplate, {
      value: formatWorkspaceDate(entry.updatedAt, messages)
    })} · ${messages.itemQualitySuffix} ${entry.qualityScore.toFixed(1)}.`
  }));
}

export function buildPolicyCoverageItems(snapshot: WorkspaceSnapshot): WorkspaceSectionItem[] {
  return snapshot.policySignals.map((signal) => ({
    label: signal.label,
    value: signal.value,
    description: signal.detail
  }));
}

export function buildTopTagItems(snapshot: WorkspaceSnapshot, messages: WorkspaceMessages): WorkspaceSectionItem[] {
  return snapshot.topTags.map((tag) => ({
    label: tag.name,
    value: formatWorkspaceMessage(messages.itemMatchesTemplate, { count: tag.count }),
    description: messages.topTagDescription
  }));
}

export function buildCurrentSessionSection(session: SessionContext, messages: WorkspaceMessages): WorkspaceSection {
  const userName = session.user?.displayName || session.user?.username || messages.valueNotAvailable;
  const role = session.user?.role || messages.valueNotAvailable;
  const status = session.user?.status || messages.valueNotAvailable;

  return {
    id: "current-session",
    title: messages.sectionCurrentSessionTitle,
    description: messages.sectionCurrentSessionDescription,
    variant: "session",
    items: [
      {
        label: messages.currentSessionSignedInUserLabel,
        value: userName,
        description: messages.currentSessionSignedInUserDescription
      },
      {
        label: messages.currentSessionRoleLabel,
        value: role,
        description: messages.currentSessionRoleDescription
      },
      {
        label: messages.currentSessionStatusLabel,
        value: status,
        description: messages.currentSessionStatusDescription
      },
      {
        label: messages.currentSessionMarketplaceAccessLabel,
        value: session.marketplacePublicAccess ? messages.valuePublic : messages.valueRestricted,
        description: session.marketplacePublicAccess
          ? messages.currentSessionMarketplaceAccessDescriptionPublic
          : messages.currentSessionMarketplaceAccessDescriptionRestricted
      }
    ]
  };
}

export function buildWorkspaceSignalsSection(
  snapshot: WorkspaceSnapshot,
  session: SessionContext,
  messages: WorkspaceMessages
): WorkspaceSection {
  const activeRuns = snapshot.queueCounts.pending + snapshot.queueCounts.running;

  return {
    id: "workspace-signals",
    title: messages.sectionWorkspaceSignalsTitle,
    description: messages.sectionWorkspaceSignalsDescription,
    variant: "signal-grid",
    items: [
      {
        label: messages.workspaceSignalsCatalogFootprintLabel,
        value: String(snapshot.metrics.installedSkills),
        description: formatWorkspaceMessage(messages.workspaceSignalsCatalogFootprintDescriptionTemplate, {
          count: snapshot.queueCounts.all
        })
      },
      {
        label: messages.workspaceSignalsExecutionThroughputLabel,
        value: String(activeRuns),
        description: formatWorkspaceMessage(messages.workspaceSignalsExecutionThroughputDescriptionTemplate, {
          running: snapshot.queueCounts.running,
          pending: snapshot.queueCounts.pending
        })
      },
      {
        label: messages.workspaceSignalsRiskQueueLabel,
        value: String(snapshot.queueCounts.risk),
        description: messages.workspaceSignalsRiskQueueDescription
      },
      {
        label: messages.workspaceSignalsDiscoveryAccessLabel,
        value: session.marketplacePublicAccess ? messages.valuePublic : messages.valueRestricted,
        description: messages.workspaceSignalsDiscoveryAccessDescription
      }
    ]
  };
}

export function buildExecutionSpotlightSection(snapshot: WorkspaceSnapshot, messages: WorkspaceMessages): WorkspaceSection {
  const spotlight = snapshot.spotlightEntry;

  if (!spotlight) {
    return {
      id: "execution-spotlight",
      title: messages.sectionExecutionSpotlightTitle,
      description: messages.sectionExecutionSpotlightEmptyDescription,
      variant: "compact-list",
      items: [
        {
          label: messages.sectionExecutionSpotlightEmptyLabel,
          value: messages.sectionExecutionSpotlightEmptyValue,
          description: messages.sectionExecutionSpotlightEmptyDetail
        }
      ],
      actions: [{ label: messages.actionOpenQueue, href: "/workspace/queue", variant: "default" }]
    };
  }

  return {
    id: "execution-spotlight",
    title: messages.sectionExecutionSpotlightTitle,
    description: spotlight.summary,
    variant: "compact-list",
    items: [
      {
        label: messages.sectionExecutionSpotlightFocusSkillLabel,
        value: spotlight.name,
        description: formatCategoryPath(spotlight.category, spotlight.subcategory, messages)
      },
      {
        label: messages.sectionExecutionSpotlightExecutionStateLabel,
        value: resolveStatusLabel(spotlight.status, messages),
        description: formatWorkspaceMessage(messages.sectionExecutionSpotlightExecutionStateDescriptionTemplate, {
          value: formatWorkspaceDate(spotlight.updatedAt, messages),
          owner: spotlight.owner
        })
      },
      {
        label: messages.sectionExecutionSpotlightQualityScoreLabel,
        value: spotlight.qualityScore.toFixed(1),
        description: formatWorkspaceMessage(messages.sectionExecutionSpotlightQualityScoreDescriptionTemplate, {
          count: spotlight.starCount
        })
      },
      {
        label: messages.sectionExecutionSpotlightNextRouteLabel,
        value: messages.sectionExecutionSpotlightNextRouteValue,
        description: messages.sectionExecutionSpotlightNextRouteDescription
      }
    ],
    badges: spotlight.tags,
    actions: [
      { label: messages.actionOpenQueue, href: "/workspace/queue", variant: "default" },
      { label: messages.actionOpenRunbook, href: "/workspace/runbook", variant: "outline" }
    ]
  };
}

export function buildQueueSpotlightSection(snapshot: WorkspaceSnapshot, messages: WorkspaceMessages): WorkspaceSection {
  const spotlight = snapshot.spotlightEntry;

  return {
    id: "execution-spotlight",
    title: messages.sectionExecutionSpotlightTitle,
    description: spotlight ? spotlight.summary : messages.queueDetailEmptyDescription,
    variant: "compact-list",
    items: spotlight
      ? [
          {
            label: messages.sectionExecutionSpotlightFocusSkillLabel,
            value: spotlight.name,
            description: formatCategoryPath(spotlight.category, spotlight.subcategory, messages)
          },
          {
            label: messages.queueDetailOwnerLabel,
            value: spotlight.owner,
            description: `${formatWorkspaceMessage(messages.itemUpdatedTemplate, {
              value: formatWorkspaceDate(spotlight.updatedAt, messages)
            })}.`
          },
          {
            label: messages.sectionExecutionSpotlightExecutionStateLabel,
            value: resolveStatusLabel(spotlight.status, messages),
            description: messages.sectionResponseScriptStatusDescription
          },
          {
            label: messages.queueDetailQualityLabel,
            value: spotlight.qualityScore.toFixed(1),
            description: formatWorkspaceMessage(messages.sectionExecutionSpotlightQualityScoreDescriptionTemplate, {
              count: spotlight.starCount
            })
          }
        ]
      : [
          {
            label: messages.actionOpenQueue,
            value: messages.sectionExecutionSpotlightEmptyValue,
            description: messages.queueDetailEmptyPlaceholder
          }
        ],
    badges: spotlight ? spotlight.tags : undefined,
    actions: [
      { label: messages.actionOpenSkillDetail, href: spotlight ? `/skills/${spotlight.id}` : "/", variant: "default" },
      { label: messages.quickActionOpenSyncJobs, href: "/admin/sync-jobs", variant: "outline" }
    ]
  };
}

export function buildQueueInsightsSection(snapshot: WorkspaceSnapshot, messages: WorkspaceMessages): WorkspaceSection {
  return {
    id: "queue-insights",
    title: messages.sectionQueueInsightsTitle,
    description: messages.sectionQueueInsightsDescription,
    variant: "signal-grid",
    items: [
      {
        label: messages.queueInsightsRiskRatioLabel,
        value: snapshot.queueCounts.all > 0 ? `${Math.round((snapshot.queueCounts.risk / snapshot.queueCounts.all) * 100)}%` : "0%",
        description: messages.queueInsightsRiskRatioDescription
      },
      {
        label: messages.queueInsightsExecutionCoverageLabel,
        value:
          snapshot.queueCounts.all > 0
            ? `${Math.round(((snapshot.queueCounts.pending + snapshot.queueCounts.running) / snapshot.queueCounts.all) * 100)}%`
            : "0%",
        description: messages.queueInsightsExecutionCoverageDescription
      },
      {
        label: messages.queueInsightsHealthScoreLabel,
        value: snapshot.metrics.healthScore.toFixed(1),
        description: messages.queueInsightsHealthScoreDescription
      },
      {
        label: messages.queueInsightsAlertsLabel,
        value: String(snapshot.metrics.alerts),
        description: messages.queueInsightsAlertsDescription
      }
    ]
  };
}

export function buildReviewPressureSection(snapshot: WorkspaceSnapshot, messages: WorkspaceMessages): WorkspaceSection {
  return {
    id: "review-pressure",
    title: messages.sectionReviewPressureTitle,
    description: messages.sectionReviewPressureDescription,
    variant: "signal-grid",
    items: [
      {
        label: messages.reviewPressureAlertsLabel,
        value: String(snapshot.metrics.alerts),
        description: messages.reviewPressureAlertsDescription
      },
      {
        label: messages.reviewPressureRiskItemsLabel,
        value: String(snapshot.queueCounts.risk),
        description: messages.reviewPressureRiskItemsDescription
      },
      {
        label: messages.reviewPressureRunningItemsLabel,
        value: String(snapshot.queueCounts.running),
        description: messages.reviewPressureRunningItemsDescription
      },
      {
        label: messages.reviewPressurePendingItemsLabel,
        value: String(snapshot.queueCounts.pending),
        description: messages.reviewPressurePendingItemsDescription
      }
    ]
  };
}

export function buildRunbookResponseScriptSection(
  runbookEntry: WorkspaceQueueEntry | null | undefined,
  messages: WorkspaceMessages
): WorkspaceSection {

  return {
    id: "response-script",
    title: messages.sectionResponseScriptTitle,
    description: messages.sectionResponseScriptDescription,
    variant: "code-emphasis",
    items: runbookEntry
      ? [
          {
            label: messages.sectionExecutionSpotlightFocusSkillLabel,
            value: runbookEntry.name,
            description: formatCategoryPath(runbookEntry.category, runbookEntry.subcategory, messages)
          },
          {
            label: messages.sectionResponseScriptStatusLabel,
            value: resolveStatusLabel(runbookEntry.status, messages),
            description: messages.sectionResponseScriptStatusDescription
          },
          {
            label: messages.sectionResponseScriptOwnerLabel,
            value: runbookEntry.owner,
            description: messages.sectionResponseScriptOwnerDescription
          }
        ]
      : [
          {
            label: messages.sectionResponseScriptEmptyLabel,
            value: messages.sectionResponseScriptEmptyValue,
            description: messages.sectionResponseScriptEmptyDescription
          }
        ],
    code: runbookEntry
      ? [
          `workspace queue --skill ${runbookEntry.id} --status ${runbookEntry.status}`,
          `workspace verify --skill ${runbookEntry.id} --quality ${runbookEntry.qualityScore.toFixed(1)}`,
          `workspace rollout --skill ${runbookEntry.id} --owner ${runbookEntry.owner}`,
          `workspace observe --skill ${runbookEntry.id} --channel ${runbookEntry.category.toLowerCase()}`
        ].join("\n")
      : messages.sectionResponseScriptNoQueueCode,
    actions: [{ label: messages.actionOpenQueue, href: "/workspace/queue", variant: "outline" }]
  };
}
