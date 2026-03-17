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

export function normalizeOrganizationsPayload(payload: unknown): OrganizationsPayload {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      id: asNumber(item.id),
      name: asString(item.name) || "Untitled organization",
      slug: asString(item.slug) || "n/a",
      createdAt: asString(item.created_at),
      updatedAt: asString(item.updated_at)
    }))
  };
}

export function normalizeOrganizationMembersPayload(payload: unknown): OrganizationMembersPayload {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      organizationId: asNumber(item.organization_id),
      userId: asNumber(item.user_id),
      username: asString(item.username) || "Unknown user",
      userRole: asString(item.user_role) || "member",
      userStatus: asString(item.user_status) || "unknown",
      role: asString(item.role) || "member",
      createdAt: asString(item.created_at),
      updatedAt: asString(item.updated_at)
    }))
  };
}

export function buildOrganizationsOverview(
  organizations: OrganizationsPayload,
  members: OrganizationMembersPayload,
  selectedOrganizationId: number
): OrganizationsOverview {
  const selectedOrganization = organizations.items.find((item) => item.id === selectedOrganizationId) || organizations.items[0] || null;
  const activeMembers = members.items.filter((item) => item.userStatus.toLowerCase() === "active").length;
  const roleMap = members.items.reduce<Map<string, number>>((accumulator, item) => {
    const role = item.role || "member";
    accumulator.set(role, (accumulator.get(role) || 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return {
    metrics: [
      { label: "Organizations", value: String(organizations.total) },
      { label: "Selected Members", value: String(members.total) },
      { label: "Active Members", value: String(activeMembers) },
      { label: "Distinct Roles", value: String(roleMap.size) }
    ],
    selectedOrganization,
    roleDistribution: Array.from(roleMap.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((left, right) => right.count - left.count || left.role.localeCompare(right.role))
  };
}
