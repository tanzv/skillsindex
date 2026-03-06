import { PublicMarketplaceResponse } from "../lib/api";
import type { AppLocale } from "../lib/i18n";

export type WorkspaceQueueStatus = "pending" | "running" | "risk";
export type WorkspaceQueueFilter = "all" | WorkspaceQueueStatus;

export interface WorkspaceQueueEntry {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  qualityScore: number;
  starCount: number;
  updatedAt: string;
  tags: string[];
  owner: string;
  status: WorkspaceQueueStatus;
  summary: string;
}

export interface WorkspaceQueueCounts {
  all: number;
  pending: number;
  running: number;
  risk: number;
}

export interface WorkspaceMetricSet {
  installedSkills: number;
  automationRuns: number;
  healthScore: number;
  alerts: number;
}

export interface WorkspacePolicySignal {
  key: string;
  label: string;
  value: string;
}

export interface WorkspaceSnapshot {
  queueEntries: WorkspaceQueueEntry[];
  queueCounts: WorkspaceQueueCounts;
  metrics: WorkspaceMetricSet;
  policySignals: WorkspacePolicySignal[];
  topTags: { name: string; count: number }[];
}

export interface BuildWorkspaceSnapshotOptions {
  payload: PublicMarketplaceResponse | null;
  qualityRiskThreshold?: number;
  locale?: AppLocale;
}
