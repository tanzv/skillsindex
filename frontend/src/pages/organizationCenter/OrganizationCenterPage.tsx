import { Alert, Button } from "antd";
import { useEffect, useMemo, useState } from "react";

import { fetchConsoleJSON, postConsoleJSON } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import AdminSubpageSummaryPanel from "../adminShared/AdminSubpageSummaryPanel";
import OrganizationCenterPageContent from "./OrganizationCenterPageContent";
import type { OrganizationCenterPageProps, OrganizationItem, OrganizationMember } from "./OrganizationCenterPage.types";
import { createPrototypePalette, isLightPrototypePath } from "../prototype/prototypePageTheme";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";

const roleValues = ["owner", "admin", "member", "viewer"] as const;

const baseCopy = {
  title: "Organization Governance",
  subtitle: "Manage organization inventory, member role assignment, and ownership integrity from the shared workspace shell.",
  eyebrow: "Organization Management",
  loading: "Loading organization workspace",
  refresh: "Refresh",
  openAccess: "Open Access",
  openAdmin: "Open Admin",
  organizations: "Organizations",
  members: "Members",
  createOrganization: "Create Organization",
  organizationName: "Organization Name",
  create: "Create",
  selectedOrganization: "Selected Organization",
  slug: "Slug",
  createdAt: "Created",
  updatedAt: "Updated",
  memberList: "Member List",
  noMembers: "No members",
  userRole: "User Role",
  status: "Status",
  updateRole: "Update Role",
  remove: "Remove",
  addOrUpdate: "Add or Update Member",
  targetUserID: "Target User ID",
  role: "Role",
  submit: "Submit",
  quickLinks: "Quick Links",
  organizationsCount: "Organizations",
  membersCount: "Members",
  saveSuccess: "Saved successfully",
  requestFailed: "Request failed",
  noData: "n/a"
};

const copy: Record<AppLocale, typeof baseCopy> = {
  en: baseCopy,
  zh: baseCopy
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown): string {
  return String(value || "");
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string, locale: AppLocale, fallback: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return fallback;
  }
  return date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US");
}

export default function OrganizationCenterPage({
  locale,
  currentPath,
  onNavigate
}: OrganizationCenterPageProps) {
  const text = copy[locale];
  const lightMode = useMemo(() => isLightPrototypePath(currentPath), [currentPath]);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [selectedOrgID, setSelectedOrgID] = useState<number>(0);
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [targetUserID, setTargetUserID] = useState("");
  const [targetRole, setTargetRole] = useState<string>("member");
  const [rowRoleMap, setRowRoleMap] = useState<Record<number, string>>({});

  const selectedOrganization = useMemo(
    () => organizations.find((item) => item.id === selectedOrgID) || null,
    [organizations, selectedOrgID]
  );
  const membersCount = members.length;

  function resetFeedback() {
    setError("");
    setMessage("");
  }

  function normalizeOrganization(raw: Record<string, unknown>): OrganizationItem {
    return {
      id: asNumber(raw.id),
      name: asString(raw.name),
      slug: asString(raw.slug),
      created_at: asString(raw.created_at),
      updated_at: asString(raw.updated_at)
    };
  }

  function normalizeMember(raw: Record<string, unknown>): OrganizationMember {
    return {
      organization_id: asNumber(raw.organization_id),
      user_id: asNumber(raw.user_id),
      username: asString(raw.username),
      user_role: asString(raw.user_role),
      user_status: asString(raw.user_status),
      role: asString(raw.role),
      created_at: asString(raw.created_at),
      updated_at: asString(raw.updated_at)
    };
  }

  async function loadOrganizations(preferredOrgID?: number) {
    const payload = await fetchConsoleJSON<{ items?: Record<string, unknown>[] }>("/api/v1/admin/organizations");
    const list = asArray<Record<string, unknown>>(payload.items).map((item) => normalizeOrganization(item));
    setOrganizations(list);

    let nextOrgID = preferredOrgID || selectedOrgID;
    if (!nextOrgID || !list.some((item) => item.id === nextOrgID)) {
      nextOrgID = list[0]?.id || 0;
    }
    setSelectedOrgID(nextOrgID);
    return nextOrgID;
  }

  async function loadMembers(orgID: number) {
    if (!orgID) {
      setMembers([]);
      return;
    }
    setMembersLoading(true);
    try {
      const payload = await fetchConsoleJSON<{ items?: Record<string, unknown>[] }>(`/api/v1/admin/organizations/${orgID}/members`);
      const list = asArray<Record<string, unknown>>(payload.items).map((item) => normalizeMember(item));
      setMembers(list);
      setRowRoleMap(
        list.reduce<Record<number, string>>((acc, item) => {
          acc[item.user_id] = item.role || "member";
          return acc;
        }, {})
      );
    } finally {
      setMembersLoading(false);
    }
  }

  async function refreshAll(preferredOrgID?: number) {
    resetFeedback();
    setLoading(true);
    try {
      const nextOrgID = await loadOrganizations(preferredOrgID);
      if (nextOrgID) {
        await loadMembers(nextOrgID);
      } else {
        setMembers([]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.requestFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
  }, []);

  async function createOrganization() {
    resetFeedback();
    const name = newOrganizationName.trim();
    if (!name) {
      setError(text.requestFailed);
      return;
    }

    setSaving(true);
    try {
      const payload = await postConsoleJSON<{ item?: Record<string, unknown> }>("/api/v1/admin/organizations", { name });
      const item = payload.item ? normalizeOrganization(payload.item) : null;
      setNewOrganizationName("");
      setMessage(text.saveSuccess);
      await refreshAll(item?.id || undefined);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : text.requestFailed);
    } finally {
      setSaving(false);
    }
  }

  async function addOrUpdateMember() {
    resetFeedback();
    const orgID = selectedOrgID;
    const userID = Number(targetUserID);
    if (!orgID || !Number.isFinite(userID) || userID <= 0 || !targetRole.trim()) {
      setError(text.requestFailed);
      return;
    }

    setSaving(true);
    try {
      await postConsoleJSON(`/api/v1/admin/organizations/${orgID}/members`, {
        user_id: Math.round(userID),
        role: targetRole
      });
      setTargetUserID("");
      setMessage(text.saveSuccess);
      await loadMembers(orgID);
    } catch (memberError) {
      setError(memberError instanceof Error ? memberError.message : text.requestFailed);
    } finally {
      setSaving(false);
    }
  }

  async function updateMemberRole(userID: number) {
    resetFeedback();
    const orgID = selectedOrgID;
    if (!orgID || userID <= 0) {
      setError(text.requestFailed);
      return;
    }

    setSaving(true);
    try {
      await postConsoleJSON(`/api/v1/admin/organizations/${orgID}/members/${userID}/role`, {
        role: rowRoleMap[userID] || "member"
      });
      await loadMembers(orgID);
      setMessage(text.saveSuccess);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : text.requestFailed);
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(userID: number) {
    resetFeedback();
    const orgID = selectedOrgID;
    if (!orgID || userID <= 0) {
      setError(text.requestFailed);
      return;
    }

    setSaving(true);
    try {
      await postConsoleJSON(`/api/v1/admin/organizations/${orgID}/members/${userID}/remove`);
      await loadMembers(orgID);
      setMessage(text.saveSuccess);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : text.requestFailed);
    } finally {
      setSaving(false);
    }
  }

  const summaryMetrics = [
    { id: "summary-organizations", label: text.organizationsCount, value: String(organizations.length) },
    { id: "summary-members", label: text.membersCount, value: String(membersCount) },
    { id: "summary-selected", label: text.selectedOrganization, value: selectedOrganization?.name || text.noData },
    { id: "summary-slug", label: text.slug, value: selectedOrganization?.slug || text.noData }
  ];
  const summaryActions = (
    <>
      <Button onClick={() => onNavigate(pageNavigator.toAdmin("/admin/access"))}>{text.openAccess}</Button>
      <Button onClick={() => onNavigate(pageNavigator.toAdmin("/admin/overview"))}>{text.openAdmin}</Button>
      <Button type="primary" onClick={() => void refreshAll(selectedOrgID || undefined)} loading={saving}>
        {text.refresh}
      </Button>
    </>
  );
  const content = (
    <OrganizationCenterPageContent
      text={text}
      locale={locale}
      palette={palette}
      roleValues={roleValues}
      organizations={organizations}
      selectedOrganization={selectedOrganization}
      selectedOrgID={selectedOrgID}
      setSelectedOrgID={setSelectedOrgID}
      onOrganizationSelect={(orgID) => void loadMembers(orgID)}
      newOrganizationName={newOrganizationName}
      onNewOrganizationNameChange={setNewOrganizationName}
      onCreateOrganization={() => void createOrganization()}
      membersLoading={membersLoading}
      members={members}
      rowRoleMap={rowRoleMap}
      setRowRoleMap={setRowRoleMap}
      onUpdateMemberRole={(userID) => void updateMemberRole(userID)}
      onRemoveMember={(userID) => void removeMember(userID)}
      saving={saving}
      targetUserID={targetUserID}
      onTargetUserIDChange={setTargetUserID}
      targetRole={targetRole}
      onTargetRoleChange={setTargetRole}
      onAddOrUpdateMember={() => void addOrUpdateMember()}
      onNavigate={onNavigate}
      accessPath={pageNavigator.toAdmin("/admin/access")}
      integrationsPath={pageNavigator.toAdmin("/admin/integrations")}
      incidentsPath={pageNavigator.toAdmin("/admin/incidents")}
      formatDate={(value) => formatDate(value, locale, text.noData)}
    />
  );

  return (
    <>
      <AdminSubpageSummaryPanel
        title={text.title}
        notice={error ? <Alert type="error" showIcon message={error} /> : message ? <Alert type="success" showIcon message={message} /> : undefined}
        metrics={summaryMetrics}
        actions={summaryActions}
      />
      {loading ? <section className="panel panel-hero loading">{text.loading}</section> : content}
    </>
  );
}
