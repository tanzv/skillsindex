import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import {
  adminOverviewRoute,
  adminSyncJobsRoute,
  marketplaceHomeRoute,
  workspacePolicyRoute,
  workspaceQueueRoute,
  workspaceRunbookRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import { buildPublicSkillDetailRoute } from "@/src/lib/routing/publicRouteBuilders";

import type { SessionContext } from "@/src/lib/schemas/session";

import { formatWorkspaceMessage } from "./messages";
import type { WorkspaceAction, WorkspaceMetric, WorkspaceSnapshot } from "./types";

function resolveHealthTone(score: number): WorkspaceMetric["tone"] {
  if (score >= 9) {
    return "success";
  }

  if (score >= 8.5) {
    return "accent";
  }

  return "warning";
}

export function buildSummaryMetrics(
  snapshot: WorkspaceSnapshot,
  session: SessionContext,
  messages: WorkspaceMessages
): WorkspaceMetric[] {
  const activeRuns = snapshot.queueCounts.pending + snapshot.queueCounts.running;

  return [
    {
      label: messages.metricInstalledSkillsLabel,
      value: String(snapshot.metrics.installedSkills),
      detail: formatWorkspaceMessage(messages.metricInstalledSkillsDetailTemplate, { count: snapshot.queueCounts.all }),
      tone: "accent"
    },
    {
      label: messages.metricActiveRunsLabel,
      value: String(activeRuns),
      detail: formatWorkspaceMessage(messages.metricActiveRunsDetailTemplate, {
        running: snapshot.queueCounts.running,
        pending: snapshot.queueCounts.pending
      }),
      tone: activeRuns > 0 ? "accent" : "default"
    },
    {
      label: messages.metricHealthScoreLabel,
      value: snapshot.metrics.healthScore.toFixed(1),
      detail: messages.metricHealthScoreDetail,
      tone: resolveHealthTone(snapshot.metrics.healthScore)
    },
    {
      label: messages.metricAlertsLabel,
      value: String(snapshot.metrics.alerts),
      detail:
        snapshot.queueCounts.risk > 0
          ? formatWorkspaceMessage(messages.metricAlertsDetailTemplate, { count: snapshot.queueCounts.risk })
          : messages.metricAlertsDetailEmpty,
      tone: snapshot.metrics.alerts > 0 ? "warning" : "success"
    },
    {
      label: messages.metricMarketplaceAccessLabel,
      value: session.marketplacePublicAccess ? messages.valuePublic : messages.valueRestricted,
      detail: session.marketplacePublicAccess
        ? messages.metricMarketplaceAccessDetailPublic
        : messages.metricMarketplaceAccessDetailRestricted,
      tone: session.marketplacePublicAccess ? "success" : "warning"
    }
  ];
}

export function buildActionsRouteQuickActions(messages: WorkspaceMessages): WorkspaceAction[] {
  return [
    { label: messages.quickActionReviewQueue, href: workspaceQueueRoute, variant: "default" },
    { label: messages.quickActionOpenPolicy, href: workspacePolicyRoute, variant: "outline" },
    { label: messages.quickActionOpenSyncJobs, href: adminSyncJobsRoute, variant: "soft" },
    { label: messages.quickActionOpenMarketplace, href: marketplaceHomeRoute, variant: "ghost" }
  ];
}

export function buildWorkspaceOverviewQuickActions(
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): WorkspaceAction[] {
  const spotlight = snapshot.spotlightEntry;

  return [
    { label: messages.quickActionReviewQueue, href: workspaceQueueRoute, variant: "default" },
    { label: messages.quickActionOpenRunbook, href: workspaceRunbookRoute, variant: "outline" },
    {
      label: messages.quickActionInspectFocusSkill,
      href: spotlight ? buildPublicSkillDetailRoute(spotlight.id) : marketplaceHomeRoute,
      variant: "soft"
    },
    { label: messages.quickActionAdminOverview, href: adminOverviewRoute, variant: "ghost" }
  ];
}
