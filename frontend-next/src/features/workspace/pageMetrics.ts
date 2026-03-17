import type { SessionContext } from "@/src/lib/schemas/session";

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

export function buildSummaryMetrics(snapshot: WorkspaceSnapshot, session: SessionContext): WorkspaceMetric[] {
  const activeRuns = snapshot.queueCounts.pending + snapshot.queueCounts.running;

  return [
    {
      label: "Installed Skills",
      value: String(snapshot.metrics.installedSkills),
      detail: `${snapshot.queueCounts.all} tracked skills are currently mounted in the workspace catalog.`,
      tone: "accent"
    },
    {
      label: "Active Runs",
      value: String(activeRuns),
      detail: `${snapshot.queueCounts.running} running and ${snapshot.queueCounts.pending} pending execution lanes.`,
      tone: activeRuns > 0 ? "accent" : "default"
    },
    {
      label: "Health Score",
      value: snapshot.metrics.healthScore.toFixed(1),
      detail: "Average quality score across the current workspace portfolio.",
      tone: resolveHealthTone(snapshot.metrics.healthScore)
    },
    {
      label: "Alerts",
      value: String(snapshot.metrics.alerts),
      detail:
        snapshot.queueCounts.risk > 0
          ? `${snapshot.queueCounts.risk} queue items require explicit operator follow-up.`
          : "No at-risk queue items were detected in this snapshot.",
      tone: snapshot.metrics.alerts > 0 ? "warning" : "success"
    },
    {
      label: "Marketplace Access",
      value: session.marketplacePublicAccess ? "Public" : "Restricted",
      detail: session.marketplacePublicAccess
        ? "Public discovery remains enabled for this authenticated session."
        : "Public discovery is restricted for this authenticated session.",
      tone: session.marketplacePublicAccess ? "success" : "warning"
    }
  ];
}

export function buildCommonQuickActions(): WorkspaceAction[] {
  return [
    { label: "Review Queue", href: "/workspace/queue", variant: "default" },
    { label: "Open Policy", href: "/workspace/policy", variant: "outline" },
    { label: "Open Sync Jobs", href: "/admin/sync-jobs", variant: "soft" },
    { label: "Open Marketplace", href: "/", variant: "ghost" }
  ];
}

export function buildOverviewQuickActions(snapshot: WorkspaceSnapshot): WorkspaceAction[] {
  const spotlight = snapshot.spotlightEntry;

  return [
    { label: "Review Queue", href: "/workspace/queue", variant: "default" },
    { label: "Open Runbook", href: "/workspace/runbook", variant: "outline" },
    {
      label: "Inspect Focus Skill",
      href: spotlight ? `/skills/${spotlight.id}` : "/",
      variant: "soft"
    },
    { label: "Admin Overview", href: "/admin/overview", variant: "ghost" }
  ];
}
