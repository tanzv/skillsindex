import { Alert, Button, Card, Input, Select, Space, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { AppLocale } from "../lib/i18n";
import { fetchConsoleJSON, postConsoleJSON } from "../lib/api";
import {
  PrototypeDeckColumns,
  PrototypeEmptyText,
  PrototypeFieldLabel,
  PrototypeFormLabel,
  PrototypeHeaderLayout,
  PrototypeInlineForm,
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeLoadingCenter,
  PrototypeMetricGrid,
  PrototypePageGrid,
  PrototypeSideLinks,
  PrototypeStack
} from "./prototypeCssInJs";
import { createPrototypePalette, isLightPrototypePath } from "./prototypePageTheme";

interface OrganizationCenterPageProps {
  locale: AppLocale;
  onNavigate: (path: string) => void;
}

interface OrganizationItem {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationMember {
  organization_id: number;
  user_id: number;
  username: string;
  user_role: string;
  user_status: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const roleValues = ["owner", "admin", "member", "viewer"] as const;

const copy = {
  en: {
    title: "Organization Governance",
    subtitle: "Manage organization inventory, member role assignment, and ownership integrity.",
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
    userID: "User ID",
    username: "Username",
    userRole: "User Role",
    status: "Status",
    orgRole: "Org Role",
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
  },
  zh: {
    title: "\u7ec4\u7ec7\u6cbb\u7406",
    subtitle: "\u7ba1\u7406\u7ec4\u7ec7\u5217\u8868\u3001\u6210\u5458\u89d2\u8272\u4e0e\u6743\u9650\u7ea6\u675f\u3002",
    loading: "\u6b63\u5728\u52a0\u8f7d\u7ec4\u7ec7\u5de5\u4f5c\u53f0",
    refresh: "\u5237\u65b0",
    openAccess: "\u6253\u5f00\u8bbf\u95ee\u7ba1\u7406",
    openAdmin: "\u6253\u5f00\u7ba1\u7406\u53f0",
    organizations: "\u7ec4\u7ec7\u5217\u8868",
    members: "\u6210\u5458",
    createOrganization: "\u65b0\u5efa\u7ec4\u7ec7",
    organizationName: "\u7ec4\u7ec7\u540d\u79f0",
    create: "\u521b\u5efa",
    selectedOrganization: "\u5f53\u524d\u7ec4\u7ec7",
    slug: "\u6807\u8bc6",
    createdAt: "\u521b\u5efa\u65f6\u95f4",
    updatedAt: "\u66f4\u65b0\u65f6\u95f4",
    memberList: "\u6210\u5458\u5217\u8868",
    noMembers: "\u6682\u65e0\u6210\u5458",
    userID: "\u7528\u6237 ID",
    username: "\u7528\u6237\u540d",
    userRole: "\u7528\u6237\u89d2\u8272",
    status: "\u72b6\u6001",
    orgRole: "\u7ec4\u7ec7\u89d2\u8272",
    updateRole: "\u66f4\u65b0\u89d2\u8272",
    remove: "\u79fb\u9664",
    addOrUpdate: "\u65b0\u589e\u6216\u66f4\u65b0\u6210\u5458",
    targetUserID: "\u76ee\u6807\u7528\u6237 ID",
    role: "\u89d2\u8272",
    submit: "\u63d0\u4ea4",
    quickLinks: "\u5feb\u6377\u94fe\u63a5",
    organizationsCount: "\u7ec4\u7ec7\u6570",
    membersCount: "\u6210\u5458\u6570",
    saveSuccess: "\u4fdd\u5b58\u6210\u529f",
    requestFailed: "\u8bf7\u6c42\u5931\u8d25",
    noData: "\u6682\u65e0"
  }
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

export default function OrganizationCenterPage({ locale, onNavigate }: OrganizationCenterPageProps) {
  const text = copy[locale];
  const lightMode = isLightPrototypePath(window.location.pathname);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);

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
      const payload = await fetchConsoleJSON<{ items?: Record<string, unknown>[] }>(
        `/api/v1/admin/organizations/${orgID}/members`
      );
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
      const payload = await postConsoleJSON<{ id?: number }>("/api/v1/admin/organizations", { name });
      const newID = asNumber(payload.id);
      setNewOrganizationName("");
      await refreshAll(newID || undefined);
      setMessage(text.saveSuccess);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : text.requestFailed);
    } finally {
      setSaving(false);
    }
  }

  async function addOrUpdateMember() {
    resetFeedback();
    const orgID = selectedOrgID;
    const userID = asNumber(targetUserID);
    if (!orgID || userID <= 0) {
      setError(text.requestFailed);
      return;
    }

    setSaving(true);
    try {
      await postConsoleJSON(`/api/v1/admin/organizations/${orgID}/members`, {
        user_id: userID,
        role: targetRole
      });
      setTargetUserID("");
      await loadMembers(orgID);
      setMessage(text.saveSuccess);
    } catch (upsertError) {
      setError(upsertError instanceof Error ? upsertError.message : text.requestFailed);
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

  if (loading) {
    return (
      <PrototypeLoadingCenter>
        <Spin description={text.loading} />
      </PrototypeLoadingCenter>
    );
  }

  const metricItems = [
    { key: "organizations", label: text.organizationsCount, value: String(organizations.length) },
    { key: "members", label: text.membersCount, value: String(membersCount) },
    { key: "selected", label: text.selectedOrganization, value: selectedOrganization?.name || text.noData },
    { key: "slug", label: text.slug, value: selectedOrganization?.slug || text.noData }
  ];

  return (
    <PrototypePageGrid>
      <Card
        variant="borderless"
        style={{ borderRadius: 16, border: `1px solid ${palette.headerBorder}`, background: palette.headerBackground }}
        styles={{ body: { padding: "14px 16px" } }}
      >
        <PrototypeHeaderLayout>
          <div>
            <Typography.Title
              level={2}
              style={{
                margin: 0,
                color: palette.headerTitle,
                fontFamily: "\"Syne\", sans-serif",
                fontSize: "clamp(1.1rem, 2.3vw, 1.5rem)",
                lineHeight: 1.2
              }}
            >
              {text.title}
            </Typography.Title>
            <Typography.Paragraph style={{ margin: "6px 0 0", color: palette.headerSubtitle, fontSize: "0.8rem" }}>
              {text.subtitle}
            </Typography.Paragraph>
          </div>
          <Space wrap>
            <Button onClick={() => onNavigate("/admin/access")}>{text.openAccess}</Button>
            <Button onClick={() => onNavigate("/admin/overview")}>{text.openAdmin}</Button>
            <Button onClick={() => refreshAll(selectedOrgID || undefined)} loading={saving}>
              {text.refresh}
            </Button>
          </Space>
        </PrototypeHeaderLayout>
      </Card>

      {error ? <Alert type="error" showIcon message={error} /> : null}
      {message ? <Alert type="success" showIcon message={message} /> : null}

      <PrototypeMetricGrid>
        {metricItems.map((item) => (
          <Card
            key={item.key}
            variant="borderless"
            style={{ borderRadius: 12, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
          >
            <Typography.Text
              style={{ color: palette.metricLabel, fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}
            >
              {item.label}
            </Typography.Text>
            <Typography.Text strong style={{ color: palette.metricValue, fontSize: "1.06rem" }}>
              {item.value}
            </Typography.Text>
          </Card>
        ))}
      </PrototypeMetricGrid>

      <PrototypeDeckColumns>
        <PrototypeStack>
          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
              {text.organizations}
            </Typography.Title>
            <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
              {text.selectedOrganization}
            </Typography.Paragraph>
            <Space wrap>
              {organizations.map((item) => (
                <Button
                  key={item.id}
                  size="small"
                  type={item.id === selectedOrgID ? "primary" : "default"}
                  onClick={() => {
                    setSelectedOrgID(item.id);
                    void loadMembers(item.id);
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Space>
            {organizations.length === 0 ? <PrototypeEmptyText>{text.noData}</PrototypeEmptyText> : null}

            <PrototypeInlineForm>
              <Input
                value={newOrganizationName}
                onChange={(event) => setNewOrganizationName(event.target.value)}
                placeholder={text.organizationName}
              />
              <div />
              <Button type="primary" onClick={() => createOrganization()} loading={saving}>
                {text.create}
              </Button>
            </PrototypeInlineForm>
          </Card>

          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
              {text.memberList}
            </Typography.Title>
            {membersLoading ? <Spin /> : null}
            <PrototypeList>
              {members.map((member) => (
                <PrototypeListRow key={`${member.organization_id}-${member.user_id}`}>
                  <PrototypeListMain>
                    <Typography.Text strong style={{ color: "#f0f8ff", fontSize: "0.8rem" }}>
                      {member.username} #{member.user_id}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.userRole}: {member.user_role || text.noData}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.status}: {member.user_status || text.noData}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.createdAt}: {formatDate(member.created_at, locale, text.noData)}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.updatedAt}: {formatDate(member.updated_at, locale, text.noData)}
                    </Typography.Text>
                  </PrototypeListMain>
                  <PrototypeListActions>
                    <Select
                      value={rowRoleMap[member.user_id] || member.role || "member"}
                      options={roleValues.map((value) => ({ label: value, value }))}
                      onChange={(value) =>
                        setRowRoleMap((previous) => ({
                          ...previous,
                          [member.user_id]: value
                        }))
                      }
                      style={{ width: 120 }}
                    />
                    <Button size="small" onClick={() => updateMemberRole(member.user_id)} loading={saving}>
                      {text.updateRole}
                    </Button>
                    <Button size="small" danger onClick={() => removeMember(member.user_id)} loading={saving}>
                      {text.remove}
                    </Button>
                  </PrototypeListActions>
                </PrototypeListRow>
              ))}
              {members.length === 0 ? <PrototypeEmptyText>{text.noMembers}</PrototypeEmptyText> : null}
            </PrototypeList>
          </Card>
        </PrototypeStack>

        <PrototypeStack>
          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
              {text.addOrUpdate}
            </Typography.Title>
            <PrototypeFormLabel>
              <PrototypeFieldLabel>{text.targetUserID}</PrototypeFieldLabel>
              <Input value={targetUserID} onChange={(event) => setTargetUserID(event.target.value)} />
            </PrototypeFormLabel>
            <PrototypeFormLabel>
              <PrototypeFieldLabel>{text.role}</PrototypeFieldLabel>
              <Select
                value={targetRole}
                options={roleValues.map((value) => ({ label: value, value }))}
                onChange={(value) => setTargetRole(value)}
              />
            </PrototypeFormLabel>
            <Space wrap>
              <Button type="primary" onClick={() => addOrUpdateMember()} loading={saving}>
                {text.submit}
              </Button>
            </Space>
          </Card>

          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
              {text.selectedOrganization}
            </Typography.Title>
            <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>
              {text.organizationName}: {selectedOrganization?.name || text.noData}
            </Typography.Text>
            <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>
              {text.slug}: {selectedOrganization?.slug || text.noData}
            </Typography.Text>
            <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>
              {text.createdAt}: {selectedOrganization ? formatDate(selectedOrganization.created_at, locale, text.noData) : text.noData}
            </Typography.Text>
            <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>
              {text.updatedAt}: {selectedOrganization ? formatDate(selectedOrganization.updated_at, locale, text.noData) : text.noData}
            </Typography.Text>
          </Card>

          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.sideHighlightBorder}`, background: palette.sideHighlightBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: "#f3fbff", fontSize: "0.95rem" }}>
              {text.quickLinks}
            </Typography.Title>
            <PrototypeSideLinks>
              <Button onClick={() => onNavigate("/admin/access")}>{text.openAccess}</Button>
              <Button onClick={() => onNavigate("/admin/integrations")}>Integrations</Button>
              <Button onClick={() => onNavigate("/admin/moderation")}>Moderation</Button>
            </PrototypeSideLinks>
          </Card>
        </PrototypeStack>
      </PrototypeDeckColumns>
    </PrototypePageGrid>
  );
}
