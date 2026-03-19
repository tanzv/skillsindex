import type { AdminOverviewMessages } from "@/src/lib/i18n/protectedPageMessages";

export interface AdminOverviewSnapshot {
  totalSkills: number;
  publicSkills: number;
  privateSkills: number;
  syncableSkills: number;
  organizationCount: number;
  accountCount: number;
  canManageUsers: boolean;
  canViewAllSkills: boolean;
}

export interface AdminOverviewMetric {
  label: string;
  value: string;
  description: string;
}

export interface AdminOverviewQuickLink {
  href: string;
  label: string;
  description: string;
}

function asNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function asBoolean(value: unknown): boolean {
  return Boolean(value);
}

export function normalizeAdminOverviewPayload(payload: unknown): AdminOverviewSnapshot {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const counts = record.counts && typeof record.counts === "object" ? (record.counts as Record<string, unknown>) : {};
  const capabilities = record.capabilities && typeof record.capabilities === "object" ? (record.capabilities as Record<string, unknown>) : {};

  return {
    totalSkills: asNumber(counts.total),
    publicSkills: asNumber(counts.public),
    privateSkills: asNumber(counts.private),
    syncableSkills: asNumber(counts.syncable),
    organizationCount: asNumber(counts.org_count),
    accountCount: asNumber(counts.account_count),
    canManageUsers: asBoolean(capabilities.can_manage_users),
    canViewAllSkills: asBoolean(capabilities.can_view_all)
  };
}

export function buildAdminOverviewMetrics(
  snapshot: AdminOverviewSnapshot,
  messages: Pick<
    AdminOverviewMessages,
    | "metricTotalSkillsLabel"
    | "metricTotalSkillsDescription"
    | "metricOrganizationsLabel"
    | "metricOrganizationsDescription"
    | "metricAccountsLabel"
    | "metricAccountsDescription"
    | "metricManageUsersLabel"
    | "metricManageUsersDescription"
    | "valueEnabled"
    | "valueLimited"
  >
): AdminOverviewMetric[] {
  return [
    {
      label: messages.metricTotalSkillsLabel,
      value: String(snapshot.totalSkills),
      description: messages.metricTotalSkillsDescription
    },
    {
      label: messages.metricOrganizationsLabel,
      value: String(snapshot.organizationCount),
      description: messages.metricOrganizationsDescription
    },
    {
      label: messages.metricAccountsLabel,
      value: String(snapshot.accountCount),
      description: messages.metricAccountsDescription
    },
    {
      label: messages.metricManageUsersLabel,
      value: snapshot.canManageUsers ? messages.valueEnabled : messages.valueLimited,
      description: messages.metricManageUsersDescription
    }
  ];
}

export function buildAdminOverviewCapabilityItems(
  snapshot: AdminOverviewSnapshot,
  messages: Pick<
    AdminOverviewMessages,
    | "capabilityManageUsersLabel"
    | "capabilityViewAllSkillsLabel"
    | "capabilityPrivateCoverageLabel"
    | "capabilitySyncReadyLabel"
    | "valueEnabled"
    | "valueUnavailable"
    | "valueScoped"
  >
) {
  return [
    {
      label: messages.capabilityManageUsersLabel,
      value: snapshot.canManageUsers ? messages.valueEnabled : messages.valueUnavailable
    },
    {
      label: messages.capabilityViewAllSkillsLabel,
      value: snapshot.canViewAllSkills ? messages.valueEnabled : messages.valueScoped
    },
    { label: messages.capabilityPrivateCoverageLabel, value: `${snapshot.privateSkills}` },
    { label: messages.capabilitySyncReadyLabel, value: `${snapshot.syncableSkills}` }
  ];
}

export function buildAdminOverviewDistribution(
  snapshot: AdminOverviewSnapshot,
  messages: Pick<
    AdminOverviewMessages,
    "distributionPublicSkillsLabel" | "distributionPrivateSkillsLabel" | "distributionSyncableSkillsLabel"
  >
) {
  const safeTotal = Math.max(snapshot.totalSkills, 1);
  return [
    {
      label: messages.distributionPublicSkillsLabel,
      value: String(snapshot.publicSkills),
      percent: Math.round((snapshot.publicSkills / safeTotal) * 100)
    },
    {
      label: messages.distributionPrivateSkillsLabel,
      value: String(snapshot.privateSkills),
      percent: Math.round((snapshot.privateSkills / safeTotal) * 100)
    },
    {
      label: messages.distributionSyncableSkillsLabel,
      value: String(snapshot.syncableSkills),
      percent: Math.round((snapshot.syncableSkills / safeTotal) * 100)
    }
  ];
}

export function buildAdminOverviewQuickLinks(
  messages: Pick<
    AdminOverviewMessages,
    | "quickLinkSkillGovernanceLabel"
    | "quickLinkSkillGovernanceDescription"
    | "quickLinkRepositoryIntakeLabel"
    | "quickLinkRepositoryIntakeDescription"
    | "quickLinkAccessControlLabel"
    | "quickLinkAccessControlDescription"
    | "quickLinkOperationsLabel"
    | "quickLinkOperationsDescription"
  >
): AdminOverviewQuickLink[] {
  return [
    {
      href: "/admin/skills",
      label: messages.quickLinkSkillGovernanceLabel,
      description: messages.quickLinkSkillGovernanceDescription
    },
    {
      href: "/admin/ingestion/repository",
      label: messages.quickLinkRepositoryIntakeLabel,
      description: messages.quickLinkRepositoryIntakeDescription
    },
    {
      href: "/admin/access",
      label: messages.quickLinkAccessControlLabel,
      description: messages.quickLinkAccessControlDescription
    },
    {
      href: "/admin/ops/metrics",
      label: messages.quickLinkOperationsLabel,
      description: messages.quickLinkOperationsDescription
    }
  ];
}
