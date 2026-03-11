import { Button, Card, Typography } from "antd";

import { PrototypeSideLinks, PrototypeStack } from "../prototype/prototypeCssInJs";
import type { PrototypePagePalette } from "../prototype/prototypePageTheme";
import type { AccountCenterCopy } from "./AccountCenterPage.copy";
import { formatAccountDate } from "./AccountCenterPage.helpers";
import type { AppLocale } from "../../lib/i18n";
import type { AccountRevokeMode, AccountSessionsPayload } from "./AccountCenterPage.types";

interface AccountCenterSidePanelProps {
  text: AccountCenterCopy;
  locale: AppLocale;
  palette: PrototypePagePalette;
  profileUser: {
    role?: string;
    status?: string;
  } | null | undefined;
  sessionsPayload: AccountSessionsPayload | null;
  revokeMode: AccountRevokeMode;
  onOpenProfileEditor: () => void;
  onNavigate: (path: string) => void;
}

export default function AccountCenterSidePanel({
  text,
  locale,
  palette,
  profileUser,
  sessionsPayload,
  revokeMode,
  onOpenProfileEditor,
  onNavigate
}: AccountCenterSidePanelProps) {
  return (
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
          <Button type="primary" onClick={onOpenProfileEditor}>{text.editProfile}</Button>
          <Button onClick={() => onNavigate("/")}>{text.openMarketplace}</Button>
          <Button onClick={() => onNavigate("/admin/overview")}>{text.openAdmin}</Button>
          <Button onClick={() => onNavigate("/account/sessions")}>{text.sessionsTab}</Button>
          <Button onClick={() => onNavigate("/account/api-credentials")}>{text.credentialsTab}</Button>
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
  );
}
