import { Button, Card, Input, Select, Space, Spin, Typography } from "antd";
import type { Dispatch, SetStateAction } from "react";

import type { PrototypePagePalette } from "./prototypePageTheme";
import type { OrganizationItem, OrganizationMember } from "./OrganizationCenterPage.types";
import {
  PrototypeDeckColumns,
  PrototypeEmptyText,
  PrototypeFieldLabel,
  PrototypeFormLabel,
  PrototypeInlineForm,
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeSideLinks,
  PrototypeStack
} from "./prototypeCssInJs";

interface OrganizationCenterPageContentText {
  organizations: string;
  selectedOrganization: string;
  noData: string;
  organizationName: string;
  create: string;
  memberList: string;
  userRole: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  updateRole: string;
  remove: string;
  noMembers: string;
  addOrUpdate: string;
  targetUserID: string;
  role: string;
  submit: string;
  slug: string;
  quickLinks: string;
  openAccess: string;
}

interface OrganizationCenterPageContentProps {
  text: OrganizationCenterPageContentText;
  locale: "en" | "zh";
  palette: PrototypePagePalette;
  roleValues: readonly string[];
  organizations: OrganizationItem[];
  selectedOrganization: OrganizationItem | null;
  selectedOrgID: number;
  setSelectedOrgID: (nextOrgID: number) => void;
  onOrganizationSelect: (orgID: number) => void;
  newOrganizationName: string;
  onNewOrganizationNameChange: (nextValue: string) => void;
  onCreateOrganization: () => void;
  membersLoading: boolean;
  members: OrganizationMember[];
  rowRoleMap: Record<number, string>;
  setRowRoleMap: Dispatch<SetStateAction<Record<number, string>>>;
  onUpdateMemberRole: (userID: number) => void;
  onRemoveMember: (userID: number) => void;
  saving: boolean;
  targetUserID: string;
  onTargetUserIDChange: (nextValue: string) => void;
  targetRole: string;
  onTargetRoleChange: (nextRole: string) => void;
  onAddOrUpdateMember: () => void;
  onNavigate: (path: string) => void;
  accessPath: string;
  integrationsPath: string;
  incidentsPath: string;
  formatDate: (value: string) => string;
}

export default function OrganizationCenterPageContent({
  text,
  locale,
  palette,
  roleValues,
  organizations,
  selectedOrganization,
  selectedOrgID,
  setSelectedOrgID,
  onOrganizationSelect,
  newOrganizationName,
  onNewOrganizationNameChange,
  onCreateOrganization,
  membersLoading,
  members,
  rowRoleMap,
  setRowRoleMap,
  onUpdateMemberRole,
  onRemoveMember,
  saving,
  targetUserID,
  onTargetUserIDChange,
  targetRole,
  onTargetRoleChange,
  onAddOrUpdateMember,
  onNavigate,
  accessPath,
  integrationsPath,
  incidentsPath,
  formatDate
}: OrganizationCenterPageContentProps) {
  return (
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
                  onOrganizationSelect(item.id);
                }}
              >
                {item.name}
              </Button>
            ))}
          </Space>
          {organizations.length === 0 ? <PrototypeEmptyText>{text.noData}</PrototypeEmptyText> : null}

          <PrototypeInlineForm>
            <Input value={newOrganizationName} onChange={(event) => onNewOrganizationNameChange(event.target.value)} placeholder={text.organizationName} />
            <div />
            <Button type="primary" onClick={onCreateOrganization} loading={saving}>
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
                    {text.createdAt}: {formatDate(member.created_at)}
                  </Typography.Text>
                  <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                    {text.updatedAt}: {formatDate(member.updated_at)}
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
                  <Button size="small" onClick={() => onUpdateMemberRole(member.user_id)} loading={saving}>
                    {text.updateRole}
                  </Button>
                  <Button size="small" danger onClick={() => onRemoveMember(member.user_id)} loading={saving}>
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
            <Input value={targetUserID} onChange={(event) => onTargetUserIDChange(event.target.value)} />
          </PrototypeFormLabel>
          <PrototypeFormLabel>
            <PrototypeFieldLabel>{text.role}</PrototypeFieldLabel>
            <Select value={targetRole} options={roleValues.map((value) => ({ label: value, value }))} onChange={onTargetRoleChange} />
          </PrototypeFormLabel>
          <Space wrap>
            <Button type="primary" onClick={onAddOrUpdateMember} loading={saving}>
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
            {text.createdAt}: {selectedOrganization ? formatDate(selectedOrganization.created_at) : text.noData}
          </Typography.Text>
          <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>
            {text.updatedAt}: {selectedOrganization ? formatDate(selectedOrganization.updated_at) : text.noData}
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
            <Button onClick={() => onNavigate(accessPath)}>{text.openAccess}</Button>
            <Button onClick={() => onNavigate(integrationsPath)}>Integrations</Button>
            <Button onClick={() => onNavigate(incidentsPath)}>{locale === "zh" ? "Incidents" : "Incidents"}</Button>
          </PrototypeSideLinks>
        </Card>
      </PrototypeStack>
    </PrototypeDeckColumns>
  );
}
