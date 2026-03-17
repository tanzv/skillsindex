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

export function buildAdminOverviewMetrics(snapshot: AdminOverviewSnapshot): AdminOverviewMetric[] {
  return [
    {
      label: "Total Skills",
      value: String(snapshot.totalSkills),
      description: "Governed skills visible from the current admin scope."
    },
    {
      label: "Organizations",
      value: String(snapshot.organizationCount),
      description: "Organizations currently participating in the workspace."
    },
    {
      label: "Accounts",
      value: String(snapshot.accountCount),
      description: "Accounts tracked by the current administration posture."
    },
    {
      label: "Manage Users",
      value: snapshot.canManageUsers ? "Enabled" : "Limited",
      description: "Whether the session can update account and role assignments."
    }
  ];
}

export function buildAdminOverviewCapabilityItems(snapshot: AdminOverviewSnapshot) {
  return [
    { label: "Manage Users", value: snapshot.canManageUsers ? "Enabled" : "Unavailable" },
    { label: "View All Skills", value: snapshot.canViewAllSkills ? "Enabled" : "Scoped" },
    { label: "Private Coverage", value: `${snapshot.privateSkills}` },
    { label: "Sync-ready", value: `${snapshot.syncableSkills}` }
  ];
}

export function buildAdminOverviewDistribution(snapshot: AdminOverviewSnapshot) {
  const safeTotal = Math.max(snapshot.totalSkills, 1);
  return [
    {
      label: "Public Skills",
      value: String(snapshot.publicSkills),
      percent: Math.round((snapshot.publicSkills / safeTotal) * 100)
    },
    {
      label: "Private Skills",
      value: String(snapshot.privateSkills),
      percent: Math.round((snapshot.privateSkills / safeTotal) * 100)
    },
    {
      label: "Syncable Skills",
      value: String(snapshot.syncableSkills),
      percent: Math.round((snapshot.syncableSkills / safeTotal) * 100)
    }
  ];
}
