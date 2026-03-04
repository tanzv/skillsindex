import { Alert, Button, Card, Input, Segmented, Select, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { AppLocale } from "../lib/i18n";
import { SessionUser, fetchConsoleJSON, postConsoleJSON } from "../lib/api";
import type { AccountRoute } from "./AccountWorkbenchPage";
import {
  PrototypeDeckColumns,
  PrototypeEmptyText,
  PrototypeFieldLabel,
  PrototypeFormLabel,
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

interface AccountProfilePayload {
  user: SessionUser;
  profile: {
    display_name: string;
    avatar_url: string;
    bio: string;
  };
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

const copy = {
  en: {
    title: "Account Center",
    subtitle: "Profile, credential security, and active session governance.",
    profileTab: "Profile",
    securityTab: "Security",
    sessionsTab: "Sessions",
    refresh: "Refresh",
    loading: "Loading account workspace",
    profileWorkspace: "Profile Workspace",
    profileHint: "Update identity metadata used across internal skill workflows.",
    displayName: "Display Name",
    avatarURL: "Avatar URL",
    bio: "Bio",
    saveProfile: "Save Profile",
    securityWorkspace: "Credential Security",
    securityHint: "Rotate your password and optionally revoke every other active session.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    revokeOthers: "Revoke other sessions",
    noRevoke: "Keep other sessions",
    applyPassword: "Apply Password",
    sessionsWorkspace: "Active Sessions",
    sessionsHint: "Review session devices and revoke suspicious access immediately.",
    current: "Current",
    revoke: "Revoke",
    revokeOthersNow: "Revoke Others",
    accountSignals: "Account Signals",
    role: "Role",
    status: "Status",
    activeSessions: "Active Sessions",
    sessionTTL: "Session TTL",
    profileCompleteness: "Profile Completeness",
    quickActions: "Quick Actions",
    openMarketplace: "Open Marketplace",
    openAdmin: "Open Admin",
    signOutHint: "Use sidebar sign-out for full logout.",
    saveSuccess: "Saved successfully",
    updateFailed: "Request failed",
    passwordSuccess: "Password updated",
    revokedSuccess: "Session revoked",
    never: "n/a",
    createdAt: "Issued",
    expiresAt: "Expires",
    userAgent: "User Agent",
    issuedIP: "IP"
  },
  zh: {
    title: "\u8d26\u53f7\u4e2d\u5fc3",
    subtitle: "\u4e2a\u4eba\u8d44\u6599\u3001\u5bc6\u7801\u5b89\u5168\u4e0e\u4f1a\u8bdd\u7ba1\u7406\u4e00\u4f53\u5316\u64cd\u4f5c\u3002",
    profileTab: "\u8d44\u6599",
    securityTab: "\u5b89\u5168",
    sessionsTab: "\u4f1a\u8bdd",
    refresh: "\u5237\u65b0",
    loading: "\u6b63\u5728\u52a0\u8f7d\u8d26\u53f7\u5de5\u4f5c\u53f0",
    profileWorkspace: "\u8d44\u6599\u7ef4\u62a4",
    profileHint: "\u66f4\u65b0\u7528\u4e8e\u6280\u80fd\u534f\u4f5c\u7684\u8eab\u4efd\u4fe1\u606f\u3002",
    displayName: "\u663e\u793a\u540d",
    avatarURL: "\u5934\u50cf\u94fe\u63a5",
    bio: "\u4e2a\u4eba\u7b80\u4ecb",
    saveProfile: "\u4fdd\u5b58\u8d44\u6599",
    securityWorkspace: "\u5bc6\u7801\u5b89\u5168",
    securityHint: "\u66f4\u65b0\u5bc6\u7801\u5e76\u53ef\u9009\u540c\u6b65\u6e05\u9000\u5176\u4ed6\u4f1a\u8bdd\u3002",
    currentPassword: "\u5f53\u524d\u5bc6\u7801",
    newPassword: "\u65b0\u5bc6\u7801",
    revokeOthers: "\u6e05\u9000\u5176\u4ed6\u4f1a\u8bdd",
    noRevoke: "\u4fdd\u7559\u5176\u4ed6\u4f1a\u8bdd",
    applyPassword: "\u5e94\u7528\u5bc6\u7801",
    sessionsWorkspace: "\u6d3b\u8dc3\u4f1a\u8bdd",
    sessionsHint: "\u68c0\u67e5\u8bbe\u5907\u767b\u5f55\u60c5\u51b5\uff0c\u5bf9\u53ef\u7591\u4f1a\u8bdd\u7acb\u5373\u64a4\u9500\u3002",
    current: "\u5f53\u524d",
    revoke: "\u64a4\u9500",
    revokeOthersNow: "\u64a4\u9500\u5176\u4ed6\u4f1a\u8bdd",
    accountSignals: "\u8d26\u53f7\u4fe1\u53f7",
    role: "\u89d2\u8272",
    status: "\u72b6\u6001",
    activeSessions: "\u6d3b\u8dc3\u4f1a\u8bdd",
    sessionTTL: "\u4f1a\u8bdd\u8fc7\u671f",
    profileCompleteness: "\u8d44\u6599\u5b8c\u6574\u5ea6",
    quickActions: "\u5feb\u6377\u64cd\u4f5c",
    openMarketplace: "\u6253\u5f00\u5e02\u573a",
    openAdmin: "\u6253\u5f00\u7ba1\u7406\u53f0",
    signOutHint: "\u9700\u8981\u5b8c\u6574\u9000\u51fa\u8bf7\u4f7f\u7528\u5de6\u4fa7\u8fb9\u680f\u7684\u9000\u51fa\u6309\u94ae\u3002",
    saveSuccess: "\u4fdd\u5b58\u6210\u529f",
    updateFailed: "\u8bf7\u6c42\u5931\u8d25",
    passwordSuccess: "\u5bc6\u7801\u5df2\u66f4\u65b0",
    revokedSuccess: "\u4f1a\u8bdd\u5df2\u64a4\u9500",
    never: "\u6682\u65e0",
    createdAt: "\u7b7e\u53d1\u65f6\u95f4",
    expiresAt: "\u8fc7\u671f\u65f6\u95f4",
    userAgent: "\u5ba2\u6237\u7aef",
    issuedIP: "IP"
  }
};

function formatDate(value: string | null | undefined, locale: AppLocale, fallback: string): string {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return fallback;
  }
  return date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US");
}

function profileCompletenessScore(profile: AccountProfilePayload | null): number {
  if (!profile) {
    return 0;
  }
  const checks = [
    profile.user.display_name,
    profile.profile.display_name,
    profile.profile.avatar_url,
    profile.profile.bio
  ];
  const hit = checks.filter((item) => String(item || "").trim().length > 0).length;
  return Math.round((hit / checks.length) * 100);
}

export default function AccountCenterPage({ locale, route, onNavigate }: AccountCenterPageProps) {
  const text = copy[locale];
  const activeSection = sectionByRoute[route];
  const lightMode = isLightPrototypePath(window.location.pathname);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profilePayload, setProfilePayload] = useState<AccountProfilePayload | null>(null);
  const [sessionsPayload, setSessionsPayload] = useState<AccountSessionsPayload | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarURL, setAvatarURL] = useState("");
  const [bio, setBio] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [revokeMode, setRevokeMode] = useState<"keep" | "revoke">("keep");

  const completeness = useMemo(() => profileCompletenessScore(profilePayload), [profilePayload]);

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

      const resolvedDisplayName = profile.profile.display_name || profile.user.display_name || "";
      setDisplayName(resolvedDisplayName);
      setAvatarURL(profile.profile.avatar_url || "");
      setBio(profile.profile.bio || "");
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

  async function saveProfile() {
    clearFeedback();
    setSaving(true);
    try {
      await postConsoleJSON("/api/v1/account/profile", {
        display_name: displayName.trim(),
        avatar_url: avatarURL.trim(),
        bio: bio.trim()
      });
      setMessage(text.saveSuccess);
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

  const profileUser = profilePayload?.user;
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
              style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
            >
              <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                {text.profileWorkspace}
              </Typography.Title>
              <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
                {text.profileHint}
              </Typography.Paragraph>
              <PrototypeFormLabel>
                <PrototypeFieldLabel>{text.displayName}</PrototypeFieldLabel>
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </PrototypeFormLabel>
              <PrototypeFormLabel>
                <PrototypeFieldLabel>{text.avatarURL}</PrototypeFieldLabel>
                <Input value={avatarURL} onChange={(event) => setAvatarURL(event.target.value)} placeholder="https://" />
              </PrototypeFormLabel>
              <PrototypeFormLabel>
                <PrototypeFieldLabel>{text.bio}</PrototypeFieldLabel>
                <Input.TextArea rows={3} value={bio} onChange={(event) => setBio(event.target.value)} />
              </PrototypeFormLabel>
              <Space wrap>
                <Button type="primary" onClick={() => saveProfile()} loading={saving}>
                  {text.saveProfile}
                </Button>
              </Space>
            </Card>
          ) : null}

          {(activeSection === "security" || activeSection === "profile") ? (
            <Card
              variant="borderless"
              style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
            >
              <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                {text.securityWorkspace}
              </Typography.Title>
              <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
                {text.securityHint}
              </Typography.Paragraph>
              <PrototypeFormLabel>
                <PrototypeFieldLabel>{text.currentPassword}</PrototypeFieldLabel>
                <Input.Password value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              </PrototypeFormLabel>
              <PrototypeFormLabel>
                <PrototypeFieldLabel>{text.newPassword}</PrototypeFieldLabel>
                <Input.Password value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              </PrototypeFormLabel>
              <PrototypeFormLabel>
                <PrototypeFieldLabel>{text.revokeOthers}</PrototypeFieldLabel>
                <Select
                  value={revokeMode}
                  options={[
                    { label: text.noRevoke, value: "keep" },
                    { label: text.revokeOthers, value: "revoke" }
                  ]}
                  onChange={(value) => setRevokeMode(value)}
                />
              </PrototypeFormLabel>
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
                      {text.createdAt}: {formatDate(item.last_seen, locale, text.never)}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.expiresAt}: {formatDate(item.expires_at, locale, text.never)}
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
              {text.sessionTTL}: {formatDate(sessionsPayload?.session_expires_at || null, locale, text.never)}
            </Typography.Text>
          </Card>

          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
              {text.quickActions}
            </Typography.Title>
            <PrototypeSideLinks>
              <Button onClick={() => onNavigate("/")}>{text.openMarketplace}</Button>
              <Button onClick={() => onNavigate("/admin/overview")}>{text.openAdmin}</Button>
              <Button onClick={() => onNavigate("/account/sessions")}>{text.sessionsTab}</Button>
            </PrototypeSideLinks>
          </Card>

          <Card
            variant="borderless"
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
    </PrototypePageGrid>
  );
}
