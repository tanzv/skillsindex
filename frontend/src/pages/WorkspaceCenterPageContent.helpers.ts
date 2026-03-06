import type { WorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import type { WorkspaceQueueEntry, WorkspaceSnapshot } from "./WorkspaceCenterPage.types";

export interface WorkspaceQueueInsightRow {
  id: string;
  label: string;
  value: string;
}

export interface WorkspaceOwnerCoverageRow {
  owner: string;
  itemCount: number;
  riskCount: number;
  averageQuality: string;
}

function formatRate(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function buildWorkspaceQueueInsightRows(snapshot: WorkspaceSnapshot, text: WorkspaceCenterCopy): WorkspaceQueueInsightRow[] {
  const queueEntries = snapshot.queueEntries;
  const riskCount = queueEntries.filter((entry) => entry.status === "risk").length;
  const activeCount = queueEntries.filter((entry) => entry.status === "running" || entry.status === "pending").length;
  const riskRatio = queueEntries.length > 0 ? formatRate(riskCount / queueEntries.length) : "0%";
  const executionCoverage = queueEntries.length > 0 ? formatRate(activeCount / queueEntries.length) : "0%";

  return [
    {
      id: "queue-insight-risk-ratio",
      label: text.riskRatio,
      value: riskRatio
    },
    {
      id: "queue-insight-execution-coverage",
      label: text.executionCoverage,
      value: executionCoverage
    },
    {
      id: "queue-insight-health-score",
      label: text.healthScore,
      value: snapshot.metrics.healthScore.toFixed(1)
    },
    {
      id: "queue-insight-alerts",
      label: text.alerts,
      value: String(snapshot.metrics.alerts)
    }
  ];
}

export function buildWorkspaceRiskWatchlist(queueEntries: WorkspaceQueueEntry[]): WorkspaceQueueEntry[] {
  return queueEntries.filter((entry) => entry.status === "risk").slice(0, 5);
}

export function buildWorkspaceRecentActivity(queueEntries: WorkspaceQueueEntry[]): WorkspaceQueueEntry[] {
  return queueEntries.slice(0, 6);
}

export function buildWorkspaceOwnerCoverageRows(queueEntries: WorkspaceQueueEntry[]): WorkspaceOwnerCoverageRow[] {
  const ownerBuckets = new Map<string, WorkspaceQueueEntry[]>();

  for (const entry of queueEntries) {
    const ownerEntries = ownerBuckets.get(entry.owner) || [];
    ownerEntries.push(entry);
    ownerBuckets.set(entry.owner, ownerEntries);
  }

  return [...ownerBuckets.entries()]
    .map(([owner, ownerEntries]) => {
      const averageQuality = ownerEntries.reduce((total, entry) => total + entry.qualityScore, 0) / ownerEntries.length;
      const riskCount = ownerEntries.filter((entry) => entry.status === "risk").length;
      return {
        owner,
        itemCount: ownerEntries.length,
        riskCount,
        averageQuality: averageQuality.toFixed(1)
      };
    })
    .sort((left, right) => {
      if (right.itemCount !== left.itemCount) {
        return right.itemCount - left.itemCount;
      }
      if (right.riskCount !== left.riskCount) {
        return right.riskCount - left.riskCount;
      }
      return left.owner.localeCompare(right.owner);
    })
    .slice(0, 4);
}

export function resolveWorkspaceExecutionSpotlight(queueEntries: WorkspaceQueueEntry[]): WorkspaceQueueEntry | null {
  return queueEntries.find((entry) => entry.status === "running") || queueEntries.find((entry) => entry.status === "pending") || queueEntries[0] || null;
}

export function resolveWorkspaceRunbookEntry(queueEntries: WorkspaceQueueEntry[]): WorkspaceQueueEntry | null {
  return queueEntries.find((entry) => entry.status === "risk") || resolveWorkspaceExecutionSpotlight(queueEntries);
}
