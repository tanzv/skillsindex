import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { MarketplaceSkill, PublicMarketplaceResponse } from "@/src/lib/schemas/public";
import type { SessionContext } from "@/src/lib/schemas/session";

import { formatWorkspaceMessage, resolveWorkspaceMessages } from "./messages";
import type { WorkspaceMetric, WorkspaceQueueEntry, WorkspaceQueueStatus, WorkspaceSnapshot } from "./types";

const QUALITY_RISK_THRESHOLD = 8.8;

function toNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function truncate(value: string, maxLength: number): string {
  const normalized = value.trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function resolveOwner(skill: MarketplaceSkill): string {
  const source = String(skill.category || "operations").toLowerCase();
  return `${source.replace(/[^a-z0-9]+/g, "-")}-squad`;
}

function resolveQueueStatus(skill: MarketplaceSkill, index: number): WorkspaceQueueStatus {
  if (toNumber(skill.quality_score) < QUALITY_RISK_THRESHOLD) {
    return "risk";
  }
  return index % 2 === 0 ? "running" : "pending";
}

function mapQueueEntry(skill: MarketplaceSkill, index: number, messages: WorkspaceMessages): WorkspaceQueueEntry {
  return {
    id: toNumber(skill.id),
    name: skill.name.trim() || messages.unnamedSkill,
    category: skill.category.trim() || messages.generalCategory,
    subcategory: skill.subcategory.trim() || messages.generalCategory,
    qualityScore: toNumber(skill.quality_score),
    starCount: toNumber(skill.star_count),
    updatedAt: skill.updated_at || "1970-01-01T00:00:00Z",
    tags: skill.tags.filter((tag) => tag.trim().length > 0),
    owner: resolveOwner(skill),
    status: resolveQueueStatus(skill, index),
    summary: truncate(skill.description || messages.noSummaryAvailable, 96)
  };
}

function sortEntries(entries: WorkspaceQueueEntry[]): WorkspaceQueueEntry[] {
  return [...entries].sort((left, right) => {
    const byDate = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    if (Number.isFinite(byDate) && byDate !== 0) {
      return byDate;
    }
    if (right.qualityScore !== left.qualityScore) {
      return right.qualityScore - left.qualityScore;
    }
    return right.id - left.id;
  });
}

function buildQueueCounts(entries: WorkspaceQueueEntry[]) {
  return entries.reduce(
    (counts, entry) => {
      counts.all += 1;
      counts[entry.status] += 1;
      return counts;
    },
    { all: 0, pending: 0, running: 0, risk: 0 }
  );
}

function averageQuality(entries: WorkspaceQueueEntry[]): number {
  if (entries.length === 0) {
    return 0;
  }
  return Number((entries.reduce((total, entry) => total + entry.qualityScore, 0) / entries.length).toFixed(1));
}

function buildOwnerCoverage(entries: WorkspaceQueueEntry[]) {
  const buckets = new Map<string, WorkspaceQueueEntry[]>();

  for (const entry of entries) {
    buckets.set(entry.owner, [...(buckets.get(entry.owner) || []), entry]);
  }

  return [...buckets.entries()]
    .map(([owner, ownerEntries]) => ({
      owner,
      itemCount: ownerEntries.length,
      riskCount: ownerEntries.filter((entry) => entry.status === "risk").length,
      averageQuality: (ownerEntries.reduce((total, entry) => total + entry.qualityScore, 0) / ownerEntries.length).toFixed(1)
    }))
    .sort((left, right) => right.itemCount - left.itemCount || right.riskCount - left.riskCount || left.owner.localeCompare(right.owner))
    .slice(0, 4);
}

function formatDate(value: string, locale: PublicLocale, messages: WorkspaceMessages): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return messages.valueNotAvailable;
  }
  return new Date(timestamp).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric"
  });
}

function buildPolicySignals(
  entries: WorkspaceQueueEntry[],
  counts: ReturnType<typeof buildQueueCounts>,
  locale: PublicLocale,
  messages: WorkspaceMessages
): WorkspaceMetric[] {
  const uniqueCategories = new Set(entries.map((entry) => entry.category)).size;
  const uniqueOwners = new Set(entries.map((entry) => entry.owner)).size;

  return [
    {
      label: messages.policyCoverageScopeLabel,
      value: formatWorkspaceMessage(messages.policyCoverageScopeValueTemplate, {
        categoryCount: uniqueCategories,
        ownerCount: uniqueOwners
      }),
      detail: messages.policyCoverageScopeDetail,
      tone: "accent"
    },
    {
      label: messages.policyRiskSignalsLabel,
      value: formatWorkspaceMessage(messages.policyRiskSignalsValueTemplate, { count: counts.risk }),
      detail: messages.policyRiskSignalsDetail,
      tone: counts.risk > 0 ? "warning" : "success"
    },
    {
      label: messages.policyActiveThroughputLabel,
      value: formatWorkspaceMessage(messages.policyActiveThroughputValueTemplate, {
        running: counts.running,
        pending: counts.pending
      }),
      detail: messages.policyActiveThroughputDetail,
      tone: counts.running > 0 || counts.pending > 0 ? "accent" : "default"
    },
    {
      label: messages.policyLatestRefreshLabel,
      value: entries[0] ? formatDate(entries[0].updatedAt, locale, messages) : messages.valueNotAvailable,
      detail: messages.policyLatestRefreshDetail,
      tone: "default"
    }
  ];
}

export function formatWorkspaceDate(
  value: string,
  messageOverridesOrLocale?: Partial<WorkspaceMessages> | PublicLocale,
  locale: PublicLocale = "en"
): string {
  const resolvedLocale = typeof messageOverridesOrLocale === "string" ? messageOverridesOrLocale : locale;
  const resolvedMessages = typeof messageOverridesOrLocale === "string" ? undefined : messageOverridesOrLocale;

  return formatDate(value, resolvedLocale, resolveWorkspaceMessages(resolvedMessages));
}

export function buildWorkspaceSnapshot(
  payload: PublicMarketplaceResponse,
  session: SessionContext = { user: null, marketplacePublicAccess: false },
  messageOverrides?: Partial<WorkspaceMessages>,
  locale: PublicLocale = "en"
): WorkspaceSnapshot {
  const messages = resolveWorkspaceMessages(messageOverrides);
  const queueEntries = sortEntries(payload.items.map((skill, index) => mapQueueEntry(skill, index, messages)));
  const queueCounts = buildQueueCounts(queueEntries);
  const healthScore = averageQuality(queueEntries);
  const topTags = payload.top_tags.slice(0, 6);

  return {
    queueEntries,
    queueCounts,
    metrics: {
      installedSkills: payload.stats.total_skills,
      automationRuns: queueCounts.pending + queueCounts.running,
      healthScore,
      alerts: queueCounts.risk + (session.marketplacePublicAccess ? 0 : 1)
    },
    recentActivity: queueEntries.slice(0, 5),
    riskWatchlist: queueEntries.filter((entry) => entry.status === "risk").slice(0, 4),
    ownerCoverage: buildOwnerCoverage(queueEntries),
    spotlightEntry: queueEntries.find((entry) => entry.status === "running") || queueEntries[0] || null,
    runbookEntry: queueEntries.find((entry) => entry.status === "risk") || queueEntries[0] || null,
    policySignals: buildPolicySignals(queueEntries, queueCounts, locale, messages),
    topTags
  };
}
