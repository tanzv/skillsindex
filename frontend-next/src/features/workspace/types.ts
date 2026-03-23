import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { WorkspaceRoute } from "@/src/lib/routing/routes";

export type WorkspaceRoutePath = WorkspaceRoute;
export type WorkspaceQueueStatus = "pending" | "running" | "risk";

export interface WorkspaceMetric {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "accent" | "success" | "warning";
}

export interface WorkspaceAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "soft" | "ghost";
}

export interface WorkspaceSectionItem {
  label: string;
  value: string;
  description?: string;
}

export interface WorkspaceSection {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "signal-grid" | "activity-list" | "compact-list" | "code-emphasis" | "session";
  items: WorkspaceSectionItem[];
  actions?: WorkspaceAction[];
  code?: string;
  badges?: string[];
}

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

export interface WorkspaceSnapshot {
  queueEntries: WorkspaceQueueEntry[];
  queueCounts: {
    all: number;
    pending: number;
    running: number;
    risk: number;
  };
  metrics: {
    installedSkills: number;
    automationRuns: number;
    healthScore: number;
    alerts: number;
  };
  recentActivity: WorkspaceQueueEntry[];
  riskWatchlist: WorkspaceQueueEntry[];
  ownerCoverage: Array<{
    owner: string;
    itemCount: number;
    riskCount: number;
    averageQuality: string;
  }>;
  spotlightEntry: WorkspaceQueueEntry | null;
  runbookEntry: WorkspaceQueueEntry | null;
  policySignals: WorkspaceMetric[];
  topTags: Array<{
    name: string;
    count: number;
  }>;
}

export interface WorkspacePageModel {
  locale: PublicLocale;
  route: WorkspaceRoutePath;
  eyebrow: string;
  title: string;
  description: string;
  messages: WorkspaceMessages;
  snapshot: WorkspaceSnapshot;
  summaryMetrics: WorkspaceMetric[];
  quickActions: WorkspaceAction[];
  primarySections: WorkspaceSection[];
  railSections: WorkspaceSection[];
}
