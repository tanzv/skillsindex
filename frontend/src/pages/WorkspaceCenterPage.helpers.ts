import { MarketplaceSkill } from "../lib/api";
import {
  BuildWorkspaceSnapshotOptions,
  WorkspacePolicySignal,
  WorkspaceQueueCounts,
  WorkspaceQueueEntry,
  WorkspaceQueueFilter,
  WorkspaceQueueStatus,
  WorkspaceSnapshot
} from "./WorkspaceCenterPage.types";

const DEFAULT_QUALITY_RISK_THRESHOLD = 7.5;

function toFiniteNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return numeric;
}

function normalizeLabel(value: string, fallback: string): string {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

export function resolveWorkspaceQueueStatus(skill: MarketplaceSkill, index: number, qualityRiskThreshold: number): WorkspaceQueueStatus {
  const qualityScore = toFiniteNumber(skill.quality_score);
  if (qualityScore < qualityRiskThreshold) {
    return "risk";
  }
  return index % 2 === 0 ? "running" : "pending";
}

function resolveWorkspaceOwner(skill: MarketplaceSkill): string {
  const category = normalizeLabel(skill.category, "core");
  return `${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-squad`;
}

function resolveWorkspaceSummary(skill: MarketplaceSkill): string {
  const description = normalizeLabel(skill.description, "No summary available.");
  if (description.length <= 84) {
    return description;
  }
  return `${description.slice(0, 81).trimEnd()}...`;
}

export function mapWorkspaceQueueEntry(
  skill: MarketplaceSkill,
  index: number,
  qualityRiskThreshold: number = DEFAULT_QUALITY_RISK_THRESHOLD
): WorkspaceQueueEntry {
  return {
    id: toFiniteNumber(skill.id),
    name: normalizeLabel(skill.name, "Unnamed skill"),
    category: normalizeLabel(skill.category, "Uncategorized"),
    subcategory: normalizeLabel(skill.subcategory, "General"),
    qualityScore: toFiniteNumber(skill.quality_score),
    starCount: toFiniteNumber(skill.star_count),
    updatedAt: normalizeLabel(skill.updated_at, "1970-01-01T00:00:00Z"),
    tags: Array.isArray(skill.tags) ? skill.tags.filter((tag) => !!String(tag || "").trim()) : [],
    owner: resolveWorkspaceOwner(skill),
    status: resolveWorkspaceQueueStatus(skill, index, qualityRiskThreshold),
    summary: resolveWorkspaceSummary(skill)
  };
}

function sortByRecent(entries: WorkspaceQueueEntry[]): WorkspaceQueueEntry[] {
  const cloned = [...entries];
  cloned.sort((left, right) => {
    const leftTimestamp = Date.parse(left.updatedAt);
    const rightTimestamp = Date.parse(right.updatedAt);
    if (Number.isFinite(leftTimestamp) && Number.isFinite(rightTimestamp) && leftTimestamp !== rightTimestamp) {
      return rightTimestamp - leftTimestamp;
    }
    if (left.qualityScore !== right.qualityScore) {
      return right.qualityScore - left.qualityScore;
    }
    return right.id - left.id;
  });
  return cloned;
}

export function buildWorkspaceQueueCounts(entries: WorkspaceQueueEntry[]): WorkspaceQueueCounts {
  const counts: WorkspaceQueueCounts = {
    all: entries.length,
    pending: 0,
    running: 0,
    risk: 0
  };

  for (const entry of entries) {
    counts[entry.status] += 1;
  }
  return counts;
}

function averageQuality(entries: WorkspaceQueueEntry[]): number {
  if (entries.length === 0) {
    return 0;
  }
  const total = entries.reduce((sum, entry) => sum + entry.qualityScore, 0);
  return Number((total / entries.length).toFixed(1));
}

function buildPolicySignals(entries: WorkspaceQueueEntry[], queueCounts: WorkspaceQueueCounts): WorkspacePolicySignal[] {
  const uniqueCategories = new Set(entries.map((entry) => entry.category)).size;
  const uniqueOwners = new Set(entries.map((entry) => entry.owner)).size;
  const topQuality = entries.length > 0 ? Math.max(...entries.map((entry) => entry.qualityScore)) : 0;

  return [
    {
      key: "coverage",
      label: "Coverage Scope",
      value: `${uniqueCategories} categories / ${uniqueOwners} squads`
    },
    {
      key: "risk",
      label: "Risk Signals",
      value: `${queueCounts.risk} entries require review`
    },
    {
      key: "running",
      label: "Active Throughput",
      value: `${queueCounts.running} running / ${queueCounts.pending} pending`
    },
    {
      key: "quality",
      label: "Top Quality",
      value: topQuality.toFixed(1)
    }
  ];
}

export function buildWorkspaceSnapshot(options: BuildWorkspaceSnapshotOptions): WorkspaceSnapshot {
  const qualityRiskThreshold = toFiniteNumber(options.qualityRiskThreshold, DEFAULT_QUALITY_RISK_THRESHOLD);
  const skills = options.payload?.items || [];
  const queueEntries = sortByRecent(skills.map((skill, index) => mapWorkspaceQueueEntry(skill, index, qualityRiskThreshold)));
  const queueCounts = buildWorkspaceQueueCounts(queueEntries);
  const installedSkills = toFiniteNumber(options.payload?.stats.total_skills);
  const topTags = (options.payload?.top_tags || []).slice(0, 6);

  return {
    queueEntries,
    queueCounts,
    metrics: {
      installedSkills,
      automationRuns: queueCounts.running + queueCounts.pending,
      healthScore: averageQuality(queueEntries),
      alerts: queueCounts.risk + topTags.length
    },
    policySignals: buildPolicySignals(queueEntries, queueCounts),
    topTags
  };
}

export function filterWorkspaceQueue(entries: WorkspaceQueueEntry[], filter: WorkspaceQueueFilter): WorkspaceQueueEntry[] {
  if (filter === "all") {
    return entries;
  }
  return entries.filter((entry) => entry.status === filter);
}

export function workspaceStatusColor(status: WorkspaceQueueStatus): string {
  if (status === "risk") {
    return "red";
  }
  if (status === "running") {
    return "cyan";
  }
  return "gold";
}

export function formatWorkspaceDate(value: string, locale: "en" | "zh"): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return "n/a";
  }
  const language = locale === "zh" ? "zh-CN" : "en-US";
  return new Date(timestamp).toLocaleDateString(language);
}

export function buildWorkspaceCommandPreview(entry: WorkspaceQueueEntry | null): string {
  if (!entry) {
    return "workspace queue --select none";
  }

  return [
    `workspace queue --skill ${entry.id} --status ${entry.status}`,
    `workspace verify --skill ${entry.id} --quality ${entry.qualityScore.toFixed(1)}`,
    `workspace rollout --skill ${entry.id} --owner ${entry.owner}`,
    `workspace observe --skill ${entry.id} --channel ${entry.category.toLowerCase().replace(/\s+/g, "-")}`
  ].join("\n");
}
