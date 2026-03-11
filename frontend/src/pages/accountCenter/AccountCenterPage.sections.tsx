import { Alert, Avatar, Button, Card, Input, Segmented, Select, Space, Tag, Typography } from "antd";

import type { AppLocale } from "../../lib/i18n";
import type { AccountCenterCopy } from "./AccountCenterPage.copy";
import AccountCenterCredentialsSection from "./AccountCenterCredentialsSection";
import AccountCenterSidePanel from "./AccountCenterSidePanel";
import {
  formatAccountDate,
  type AccountProfileDraft,
  type AccountProfilePayload,
  type AccountProfilePreviewItem
} from "./AccountCenterPage.helpers";
import {
  PrototypeDeckColumns,
  PrototypeEmptyText,
  PrototypeHeaderLayout,
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeMetricGrid,
  PrototypePageGrid,
  PrototypeStack
} from "../prototype/prototypeCssInJs";
import type { PrototypePagePalette } from "../prototype/prototypePageTheme";
import {
  type AccountAPIKeyCreateDraft,
  type AccountAPIKeySecretState,
  type AccountAPIKeysPayload,
  type AccountMetricItem,
  type AccountRevokeMode,
  type AccountSection,
  type AccountSessionItem,
  type AccountSessionsPayload
} from "./AccountCenterPage.types";

const secondaryLabelStyle = {
  fontSize: "0.68rem",
  letterSpacing: "0.03em",
  textTransform: "uppercase" as const,
  fontWeight: 700,
  color: "#9fc2ec"
};

interface AccountCenterSectionsProps {
  text: AccountCenterCopy;
  locale: AppLocale;
  palette: PrototypePagePalette;
  activeSection: AccountSection;
  metricItems: AccountMetricItem[];
  profilePayload: AccountProfilePayload | null;
  profileDraft: AccountProfileDraft;
  profilePreviewItems: AccountProfilePreviewItem[];
  primaryProfileName: string;
  avatarInitials: string;
  sessionsPayload: AccountSessionsPayload | null;
  sessionItems: AccountSessionItem[];
  currentSessionID: string;
  credentialsPayload: AccountAPIKeysPayload | null;
  credentialDraft: AccountAPIKeyCreateDraft;
  credentialScopeDrafts: Record<number, string[]>;
  latestCredentialSecret: AccountAPIKeySecretState | null;
  currentPassword: string;
  newPassword: string;
  revokeMode: AccountRevokeMode;
  saving: boolean;
  error: string;
  message: string;
  onOpenProfileEditor: () => void;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
  onSectionChange: (section: AccountSection) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onRevokeModeChange: (value: AccountRevokeMode) => void;
  onApplyPassword: () => void;
  onRevokeOtherSessions: () => void;
  onRevokeSession: (sessionID: string) => void;
  onCredentialDraftChange: (patch: Partial<AccountAPIKeyCreateDraft>) => void;
  onCredentialScopeDraftChange: (keyID: number, scopes: string[]) => void;
  onCreateCredential: () => void;
  onRotateCredential: (keyID: number) => void;
  onRevokeCredential: (keyID: number) => void;
  onApplyCredentialScopes: (keyID: number) => void;
}

export function AccountCenterSections({
  text,
  locale,
  palette,
  activeSection,
  metricItems,
  profilePayload,
  profileDraft,
  profilePreviewItems,
  primaryProfileName,
  avatarInitials,
  sessionsPayload,
  sessionItems,
  currentSessionID,
  credentialsPayload,
  credentialDraft,
  credentialScopeDrafts,
  latestCredentialSecret,
  currentPassword,
  newPassword,
  revokeMode,
  saving,
  error,
  message,
  onOpenProfileEditor,
  onRefresh,
  onNavigate,
  onSectionChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onRevokeModeChange,
  onApplyPassword,
  onRevokeOtherSessions,
  onRevokeSession,
  onCredentialDraftChange,
  onCredentialScopeDraftChange,
  onCreateCredential,
  onRotateCredential,
  onRevokeCredential,
  onApplyCredentialScopes
}: AccountCenterSectionsProps) {
  const profileUser = profilePayload?.user;

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
                fontFamily: '"Syne", sans-serif',
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
            <Button type="primary" onClick={onOpenProfileEditor}>
              {text.editProfile}
            </Button>
            <Button onClick={() => onNavigate("/")}>{text.openMarketplace}</Button>
            <Button onClick={() => onNavigate("/admin/overview")}>{text.openAdmin}</Button>
            <Button onClick={onRefresh} loading={saving}>
              {text.refresh}
            </Button>
          </Space>
        </PrototypeHeaderLayout>
      </Card>

      <Segmented
        aria-label="account section tabs"
        options={[
          { label: text.profileTab, value: "profile" },
          { label: text.securityTab, value: "security" },
          { label: text.sessionsTab, value: "sessions" },
          { label: text.credentialsTab, value: "credentials" }
        ]}
        value={activeSection}
        onChange={(value) => {
          const nextSection = String(value);
          if (
            nextSection === "profile" ||
            nextSection === "security" ||
            nextSection === "sessions" ||
            nextSection === "credentials"
          ) {
            onSectionChange(nextSection);
          }
        }}
        block
      />

      {error ? <Alert type="error" showIcon message={error} /> : null}
      {message ? <Alert type="success" showIcon message={message} /> : null}

      <PrototypeMetricGrid>
        {metricItems.map((item) => (
          <Card
            key={item.key}
            variant="borderless"
            hoverable
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
          {(activeSection === "profile" || activeSection === "security") ? (
            <Card
              variant="borderless"
              hoverable
              style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
            >
              <Space align="start" style={{ justifyContent: "space-between", width: "100%" }} wrap>
                <div>
                  <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                    {text.profileWorkspace}
                  </Typography.Title>
                  <Typography.Paragraph style={{ margin: "4px 0 0", color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
                    {text.profileHint}
                  </Typography.Paragraph>
                </div>
                <Button type="primary" onClick={onOpenProfileEditor}>
                  {text.editProfile}
                </Button>
              </Space>

              <Space align="start" size={12}>
                <Avatar size={56} src={profileDraft.avatarURL || undefined}>
                  {avatarInitials}
                </Avatar>
                <div style={{ display: "grid", gap: 2 }}>
                  <Typography.Text strong style={{ color: palette.cardTitle, fontSize: "0.86rem" }}>
                    {primaryProfileName}
                  </Typography.Text>
                  <Typography.Text style={{ color: palette.cardText, fontSize: "0.76rem" }}>
                    @{profileUser?.username || text.never}
                  </Typography.Text>
                  <Typography.Text style={{ color: palette.cardText, fontSize: "0.74rem" }}>
                    {text.profilePreview}
                  </Typography.Text>
                </div>
              </Space>

              <PrototypeList>
                {profilePreviewItems.map((item) => (
                  <PrototypeListRow key={item.key}>
                    <PrototypeListMain>
                      <Typography.Text style={{ color: "#9fc2ec", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        {item.label}
                      </Typography.Text>
                      <Typography.Text style={{ color: "#f0f8ff", fontSize: "0.78rem", lineHeight: 1.42 }}>
                        {item.value}
                      </Typography.Text>
                    </PrototypeListMain>
                  </PrototypeListRow>
                ))}
              </PrototypeList>
            </Card>
          ) : null}

          {(activeSection === "security" || activeSection === "profile") ? (
            <Card
              variant="borderless"
              hoverable
              style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
            >
              <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                {text.securityWorkspace}
              </Typography.Title>
              <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
                {text.securityHint}
              </Typography.Paragraph>
              <label style={{ display: "grid", gap: 5 }}>
                <span style={secondaryLabelStyle}>{text.currentPassword}</span>
                <Input.Password value={currentPassword} onChange={(event) => onCurrentPasswordChange(event.target.value)} />
              </label>
              <label style={{ display: "grid", gap: 5 }}>
                <span style={secondaryLabelStyle}>{text.newPassword}</span>
                <Input.Password value={newPassword} onChange={(event) => onNewPasswordChange(event.target.value)} />
              </label>
              <label style={{ display: "grid", gap: 5 }}>
                <span style={secondaryLabelStyle}>{text.revokeOthers}</span>
                <Select
                  value={revokeMode}
                  options={[
                    { label: text.noRevoke, value: "keep" },
                    { label: text.revokeOthers, value: "revoke" }
                  ]}
                  onChange={(value) => {
                    if (value === "keep" || value === "revoke") {
                      onRevokeModeChange(value);
                    }
                  }}
                />
              </label>
              <Space wrap>
                <Button type="primary" onClick={onApplyPassword} loading={saving}>
                  {text.applyPassword}
                </Button>
                <Button onClick={onRevokeOtherSessions} loading={saving}>
                  {text.revokeOthersNow}
                </Button>
              </Space>
            </Card>
          ) : null}

          {activeSection === "credentials" ? (
            <AccountCenterCredentialsSection
              text={text}
              locale={locale}
              palette={palette}
              credentialsPayload={credentialsPayload}
              credentialDraft={credentialDraft}
              credentialScopeDrafts={credentialScopeDrafts}
              latestCredentialSecret={latestCredentialSecret}
              saving={saving}
              onCredentialDraftChange={onCredentialDraftChange}
              onCredentialScopeDraftChange={onCredentialScopeDraftChange}
              onCreateCredential={onCreateCredential}
              onRotateCredential={onRotateCredential}
              onRevokeCredential={onRevokeCredential}
              onApplyCredentialScopes={onApplyCredentialScopes}
            />
          ) : null}

          <Card
            variant="borderless"
            hoverable
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
              {text.sessionsWorkspace}
            </Typography.Title>
            <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
              {text.sessionsHint}
            </Typography.Paragraph>
            <PrototypeList>
              {sessionItems.map((item) => (
                <PrototypeListRow key={item.session_id}>
                  <PrototypeListMain>
                    <Typography.Text strong style={{ color: "#f0f8ff", fontSize: "0.8rem" }}>
                      {item.session_id}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.userAgent}: {item.user_agent || text.never}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.issuedIP}: {item.issued_ip || text.never}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.createdAt}: {formatAccountDate(item.last_seen, locale, text.never)}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.expiresAt}: {formatAccountDate(item.expires_at, locale, text.never)}
                    </Typography.Text>
                  </PrototypeListMain>
                  <PrototypeListActions>
                    {item.is_current || item.session_id === currentSessionID ? <Tag color="green">{text.current}</Tag> : null}
                    {!item.is_current && item.session_id !== currentSessionID ? (
                      <Button size="small" onClick={() => onRevokeSession(item.session_id)} loading={saving}>
                        {text.revoke}
                      </Button>
                    ) : null}
                  </PrototypeListActions>
                </PrototypeListRow>
              ))}
              {sessionItems.length === 0 ? <PrototypeEmptyText>{text.never}</PrototypeEmptyText> : null}
            </PrototypeList>
          </Card>
        </PrototypeStack>

        <AccountCenterSidePanel
          text={text}
          locale={locale}
          palette={palette}
          profileUser={profileUser}
          sessionsPayload={sessionsPayload}
          revokeMode={revokeMode}
          onOpenProfileEditor={onOpenProfileEditor}
          onNavigate={onNavigate}
        />
      </PrototypeDeckColumns>
    </PrototypePageGrid>
  );
}
