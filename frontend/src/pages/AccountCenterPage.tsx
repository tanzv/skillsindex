import { Alert, Avatar, Button, Card, Input, Segmented, Select, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";

import { AppLocale } from "../lib/i18n";
import { fetchConsoleJSON, postConsoleJSON } from "../lib/api";
import type { AccountRoute } from "./AccountWorkbenchPage";
import { getAccountCenterCopy } from "./AccountCenterPage.copy";
import {
  type AccountProfileDraft,
  type AccountProfilePayload,
  buildAccountProfileDraft,
  buildAccountProfilePreviewItems,
  formatAccountDate,
  profileCompletenessScore,
  sanitizeAccountProfileDraft
} from "./AccountCenterPage.helpers";
import AccountProfileEditorModal from "./AccountProfileEditorModal";
import {
  PrototypeDeckColumns,
  PrototypeEmptyText,
  PrototypeHeaderLayout,
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

interface AccountCenterPageProps {
  locale: AppLocale;
  route: AccountRoute;
  onNavigate: (path: string) => void;
}

interface AccountSessionItem {
  session_id: string;
  user_agent: string;
  issued_ip: string;
  last_seen: string;
  expires_at: string;
  is_current: boolean;
}

interface AccountSessionsPayload {
  current_session_id: string;
  session_issued_at: string | null;
  session_expires_at: string | null;
  total: number;
  items: AccountSessionItem[];
}

const sectionByRoute: Record<AccountRoute, "profile" | "security" | "sessions"> = {
  "/account/profile": "profile",
  "/account/security": "security",
  "/account/sessions": "sessions"
};

function resolveAvatarInitials(displayName: string, fallback: string): string {
  const normalized = String(displayName || "").trim();
  if (!normalized) {
    return String(fallback || "U").trim().slice(0, 2).toUpperCase() || "U";
  }

  const segments = normalized
    .split(/\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return "U";
  }

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return `${segments[0][0] || ""}${segments[segments.length - 1][0] || ""}`.toUpperCase();
}

export default function AccountCenterPage({ locale, route, onNavigate }: AccountCenterPageProps) {
  const text = getAccountCenterCopy(locale);
  const activeSection = sectionByRoute[route];
  const lightMode = isLightPrototypePath(window.location.pathname);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profilePayload, setProfilePayload] = useState<AccountProfilePayload | null>(null);
  const [sessionsPayload, setSessionsPayload] = useState<AccountSessionsPayload | null>(null);

  const [profileEditorOpen, setProfileEditorOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [revokeMode, setRevokeMode] = useState<"keep" | "revoke">("keep");

  const completeness = useMemo(() => profileCompletenessScore(profilePayload), [profilePayload]);
  const profileDraft = useMemo(() => buildAccountProfileDraft(profilePayload), [profilePayload]);

  const profilePreviewItems = useMemo(
    () =>
      buildAccountProfilePreviewItems(
        profilePayload,
        {
          displayName: text.displayName,
          avatarURL: text.avatarURL,
          bio: text.bio
        },
        text.never
      ),
    [profilePayload, text.avatarURL, text.bio, text.displayName, text.never]
  );

  const profileUser = profilePayload?.user;
  const primaryProfileName = profileDraft.displayName || profileUser?.username || text.never;
  const avatarInitials = resolveAvatarInitials(primaryProfileName, profileUser?.username || "U");

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [profile, sessions] = await Promise.all([
        fetchConsoleJSON<AccountProfilePayload>("/api/v1/account/profile"),
        fetchConsoleJSON<AccountSessionsPayload>("/api/v1/account/sessions")
      ]);
      setProfilePayload(profile);
      setSessionsPayload(sessions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.updateFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  function openProfileEditor() {
    clearFeedback();
    setProfileEditorOpen(true);
  }

  function closeProfileEditor() {
    if (saving) {
      return;
    }
    setProfileEditorOpen(false);
  }

  async function saveProfile(values: AccountProfileDraft) {
    clearFeedback();
    setSaving(true);
    try {
      await postConsoleJSON("/api/v1/account/profile", sanitizeAccountProfileDraft(values));
      setMessage(text.saveSuccess);
      setProfileEditorOpen(false);
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text.updateFailed);
    } finally {
      setSaving(false);
    }
  }

  async function applyPassword() {
    clearFeedback();
    if (!currentPassword.trim() || !newPassword.trim()) {
      setError(text.updateFailed);
      return;
    }

    setSaving(true);
    try {
      await postConsoleJSON("/api/v1/account/security/password", {
        current_password: currentPassword,
        new_password: newPassword,
        revoke_other_sessions: revokeMode === "revoke"
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage(text.passwordSuccess);
      await loadAll();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : text.updateFailed);
    } finally {
      setSaving(false);
    }
  }

  async function revokeSession(sessionID: string) {
    clearFeedback();
    if (!sessionID.trim()) {
      return;
    }
    setSaving(true);
    try {
      await postConsoleJSON(`/api/v1/account/sessions/${encodeURIComponent(sessionID)}/revoke`);
      setMessage(text.revokedSuccess);
      await loadAll();
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : text.updateFailed);
    } finally {
      setSaving(false);
    }
  }

  async function revokeOtherSessions() {
    clearFeedback();
    setSaving(true);
    try {
      await postConsoleJSON("/api/v1/account/sessions/revoke-others");
      setMessage(text.revokedSuccess);
      await loadAll();
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : text.updateFailed);
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

  const sessionItems = sessionsPayload?.items || [];
  const currentSessionID = sessionsPayload?.current_session_id || "";

  const metricItems = [
    { key: "role", label: text.role, value: profileUser?.role || text.never },
    { key: "status", label: text.status, value: profileUser?.status || text.never },
    { key: "sessions", label: text.activeSessions, value: String(sessionsPayload?.total || 0) },
    { key: "completeness", label: text.profileCompleteness, value: `${completeness}%` }
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
            <Button type="primary" onClick={openProfileEditor}>
              {text.editProfile}
            </Button>
            <Button onClick={() => onNavigate("/")}>{text.openMarketplace}</Button>
            <Button onClick={() => onNavigate("/admin/overview")}>{text.openAdmin}</Button>
            <Button onClick={() => loadAll()} loading={saving}>
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
          { label: text.sessionsTab, value: "sessions" }
        ]}
        value={activeSection}
        onChange={(value) => {
          if (value === "profile") {
            onNavigate("/account/profile");
            return;
          }
          if (value === "security") {
            onNavigate("/account/security");
            return;
          }
          onNavigate("/account/sessions");
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
                <Button type="primary" onClick={openProfileEditor}>
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
                <span style={{ fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 700, color: "#9fc2ec" }}>
                  {text.currentPassword}
                </span>
                <Input.Password value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              </label>
              <label style={{ display: "grid", gap: 5 }}>
                <span style={{ fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 700, color: "#9fc2ec" }}>
                  {text.newPassword}
                </span>
                <Input.Password value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              </label>
              <label style={{ display: "grid", gap: 5 }}>
                <span style={{ fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 700, color: "#9fc2ec" }}>
                  {text.revokeOthers}
                </span>
                <Select
                  value={revokeMode}
                  options={[
                    { label: text.noRevoke, value: "keep" },
                    { label: text.revokeOthers, value: "revoke" }
                  ]}
                  onChange={(value) => setRevokeMode(value)}
                />
              </label>
              <Space wrap>
                <Button type="primary" onClick={() => applyPassword()} loading={saving}>
                  {text.applyPassword}
                </Button>
                <Button onClick={() => revokeOtherSessions()} loading={saving}>
                  {text.revokeOthersNow}
                </Button>
              </Space>
            </Card>
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
                      <Button size="small" onClick={() => revokeSession(item.session_id)} loading={saving}>
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

        <PrototypeStack>
          <Card
            variant="borderless"
            hoverable
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
              {text.accountSignals}
            </Typography.Title>
            <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>
              {text.role}: {profileUser?.role || text.never}
            </Typography.Text>
            <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>
              {text.status}: {profileUser?.status || text.never}
            </Typography.Text>
            <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>
              {text.sessionTTL}: {formatAccountDate(sessionsPayload?.session_expires_at || null, locale, text.never)}
            </Typography.Text>
          </Card>

          <Card
            variant="borderless"
            hoverable
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
              {text.quickActions}
            </Typography.Title>
            <PrototypeSideLinks>
              <Button type="primary" onClick={openProfileEditor}>{text.editProfile}</Button>
              <Button onClick={() => onNavigate("/")}>{text.openMarketplace}</Button>
              <Button onClick={() => onNavigate("/admin/overview")}>{text.openAdmin}</Button>
              <Button onClick={() => onNavigate("/account/sessions")}>{text.sessionsTab}</Button>
            </PrototypeSideLinks>
          </Card>

          <Card
            variant="borderless"
            hoverable
            style={{ borderRadius: 13, border: `1px solid ${palette.sideHighlightBorder}`, background: palette.sideHighlightBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: "#f3fbff", fontSize: "0.95rem" }}>
              {text.securityTab}
            </Typography.Title>
            <Typography.Text style={{ color: "#d8f5ff", fontSize: "0.78rem", lineHeight: 1.46 }}>
              {text.signOutHint}
            </Typography.Text>
            <Typography.Text style={{ color: "#d8f5ff", fontSize: "0.78rem", lineHeight: 1.46 }}>
              {text.revokeOthers}: {revokeMode === "revoke" ? text.revokeOthers : text.noRevoke}
            </Typography.Text>
          </Card>
        </PrototypeStack>
      </PrototypeDeckColumns>

      <AccountProfileEditorModal
        open={profileEditorOpen}
        submitting={saving}
        initialValues={profileDraft}
        labels={{
          title: text.editProfileModalTitle,
          displayName: text.displayName,
          avatarURL: text.avatarURL,
          bio: text.bio,
          save: text.saveProfile,
          cancel: text.cancel,
          invalidAvatarURL: text.invalidAvatarURL,
          displayNameTooLong: text.displayNameTooLong,
          bioTooLong: text.bioTooLong
        }}
        onCancel={closeProfileEditor}
        onSubmit={saveProfile}
      />
    </PrototypePageGrid>
  );
}
