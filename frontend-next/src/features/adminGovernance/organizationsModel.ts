import { asArray, asNumber, asObject, asString } from "./shared";

export interface OrganizationItem {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMemberItem {
  organizationId: number;
  userId: number;
  username: string;
  userRole: string;
  userStatus: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationsPayload {
  total: number;
  items: OrganizationItem[];
}

export interface OrganizationMembersPayload {
  total: number;
  items: OrganizationMemberItem[];
}

export interface OrganizationsOverview {
  metrics: Array<{ label: string; value: string }>;
  selectedOrganization: OrganizationItem | null;
  roleDistribution: Array<{ role: string; count: number }>;
}

export interface OrganizationsOverviewMetricLabels {
  organizations: string;
  selectedMembers: string;
  activeMembers: string;
  distinctRoles: string;
}

export interface OrganizationNormalizationMessages {
  valueUntitledOrganization: string;
  valueNotAvailable: string;
  valueUnknownUser: string;
  valueUnknownStatus: string;
  defaultMemberRole: string;
}

const defaultOrganizationsOverviewMetricLabels: OrganizationsOverviewMetricLabels = {
  organizations: "Organizations",
  selectedMembers: "Selected Members",
  activeMembers: "Active Members",
  distinctRoles: "Distinct Roles"
};

const defaultOrganizationNormalizationMessages: OrganizationNormalizationMessages = {
  valueUntitledOrganization: "Untitled organization",
  valueNotAvailable: "n/a",
  valueUnknownUser: "Unknown user",
  valueUnknownStatus: "unknown",
  defaultMemberRole: "member"
};

export function normalizeOrganizationsPayload(
  payload: unknown,
  messages: OrganizationNormalizationMessages = defaultOrganizationNormalizationMessages
): OrganizationsPayload {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      id: asNumber(item.id),
      name: asString(item.name) || messages.valueUntitledOrganization,
      slug: asString(item.slug) || messages.valueNotAvailable,
      createdAt: asString(item.created_at),
      updatedAt: asString(item.updated_at)
    }))
  };
}

export function normalizeOrganizationMembersPayload(
  payload: unknown,
  messages: OrganizationNormalizationMessages = defaultOrganizationNormalizationMessages
): OrganizationMembersPayload {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      organizationId: asNumber(item.organization_id),
      userId: asNumber(item.user_id),
      username: asString(item.username) || messages.valueUnknownUser,
      userRole: asString(item.user_role) || messages.defaultMemberRole,
      userStatus: asString(item.user_status) || messages.valueUnknownStatus,
      role: asString(item.role) || messages.defaultMemberRole,
      createdAt: asString(item.created_at),
      updatedAt: asString(item.updated_at)
    }))
  };
}

export function buildOrganizationsOverview(
  organizations: OrganizationsPayload,
  members: OrganizationMembersPayload,
  selectedOrganizationId: number,
  labels: OrganizationsOverviewMetricLabels = defaultOrganizationsOverviewMetricLabels
): OrganizationsOverview {
  const selectedOrganization = organizations.items.find((item) => item.id === selectedOrganizationId) || organizations.items[0] || null;
  const activeMembers = members.items.filter((item) => item.userStatus.toLowerCase() === "active").length;
  const roleMap = members.items.reduce<Map<string, number>>((accumulator, item) => {
    const role = item.role || defaultOrganizationNormalizationMessages.defaultMemberRole;
    accumulator.set(role, (accumulator.get(role) || 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return {
    metrics: [
      { label: labels.organizations, value: String(organizations.total) },
      { label: labels.selectedMembers, value: String(members.total) },
      { label: labels.activeMembers, value: String(activeMembers) },
      { label: labels.distinctRoles, value: String(roleMap.size) }
    ],
    selectedOrganization,
    roleDistribution: Array.from(roleMap.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((left, right) => right.count - left.count || left.role.localeCompare(right.role))
  };
}
