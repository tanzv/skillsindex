import { Alert, Button, Card, Input, Select, Space, Tag, Typography } from "antd";

import { PrototypeEmptyText, PrototypeList, PrototypeListActions, PrototypeListMain, PrototypeListRow } from "../prototype/prototypeCssInJs";
import type { PrototypePagePalette } from "../prototype/prototypePageTheme";
import type { AccountCenterCopy } from "./AccountCenterPage.copy";
import { formatAccountDate } from "./AccountCenterPage.helpers";
import type {
  AccountAPIKeyCreateDraft,
  AccountAPIKeyItem,
  AccountAPIKeySecretState,
  AccountAPIKeysPayload
} from "./AccountCenterPage.types";
import type { AppLocale } from "../../lib/i18n";

interface AccountCenterCredentialsSectionProps {
  text: AccountCenterCopy;
  locale: AppLocale;
  palette: PrototypePagePalette;
  credentialsPayload: AccountAPIKeysPayload | null;
  credentialDraft: AccountAPIKeyCreateDraft;
  credentialScopeDrafts: Record<number, string[]>;
  latestCredentialSecret: AccountAPIKeySecretState | null;
  saving: boolean;
  onCredentialDraftChange: (patch: Partial<AccountAPIKeyCreateDraft>) => void;
  onCredentialScopeDraftChange: (keyID: number, scopes: string[]) => void;
  onCreateCredential: () => void;
  onRotateCredential: (keyID: number) => void;
  onRevokeCredential: (keyID: number) => void;
  onApplyCredentialScopes: (keyID: number) => void;
}

const secondaryLabelStyle = {
  fontSize: "0.68rem",
  letterSpacing: "0.03em",
  textTransform: "uppercase" as const,
  fontWeight: 700,
  color: "#9fc2ec"
};

function resolveCredentialStatusColor(status: AccountAPIKeyItem["status"]): string {
  if (status === "active") {
    return "green";
  }
  if (status === "expired") {
    return "gold";
  }
  return "red";
}

export default function AccountCenterCredentialsSection({
  text,
  locale,
  palette,
  credentialsPayload,
  credentialDraft,
  credentialScopeDrafts,
  latestCredentialSecret,
  saving,
  onCredentialDraftChange,
  onCredentialScopeDraftChange,
  onCreateCredential,
  onRotateCredential,
  onRevokeCredential,
  onApplyCredentialScopes
}: AccountCenterCredentialsSectionProps) {
  const scopeOptions = (credentialsPayload?.supported_scopes || []).map((scope) => ({
    label: scope,
    value: scope
  }));
  const expiryOptions = [
    { label: text.credentialExpiresNever, value: 0 },
    { label: text.credentialExpires30Days, value: 30 },
    { label: text.credentialExpires90Days, value: 90 },
    { label: text.credentialExpires180Days, value: 180 },
    { label: text.credentialExpires365Days, value: 365 }
  ];
  const credentialItems = credentialsPayload?.items || [];

  return (
    <Card
      variant="borderless"
      hoverable
      style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
      styles={{ body: { padding: 12, display: "grid", gap: 12 } }}
    >
      <Space align="start" style={{ justifyContent: "space-between", width: "100%" }} wrap>
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
            {text.credentialsWorkspace}
          </Typography.Title>
          <Typography.Paragraph style={{ margin: "4px 0 0", color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
            {text.credentialsHint}
          </Typography.Paragraph>
        </div>
      </Space>

      {latestCredentialSecret ? (
        <Alert
          type="success"
          showIcon
          title={text.credentialLatestSecretTitle}
          description={
            <div style={{ display: "grid", gap: 8 }}>
              <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>
                {latestCredentialSecret.name || text.credentialLatestSecretHint}
              </Typography.Text>
              <Typography.Paragraph
                copyable={{ text: latestCredentialSecret.plaintextKey }}
                style={{
                  margin: 0,
                  color: palette.cardTitle,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.76rem",
                  wordBreak: "break-all"
                }}
              >
                {latestCredentialSecret.plaintextKey}
              </Typography.Paragraph>
              <Typography.Text style={{ color: palette.cardText, fontSize: "0.74rem" }}>
                {text.credentialLatestSecretHint}
              </Typography.Text>
            </div>
          }
        />
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
          alignItems: "end"
        }}
      >
        <label style={{ display: "grid", gap: 5 }}>
          <span style={secondaryLabelStyle}>{text.credentialName}</span>
          <Input
            value={credentialDraft.name}
            onChange={(event) => onCredentialDraftChange({ name: event.target.value })}
            placeholder={text.credentialName}
          />
        </label>
        <label style={{ display: "grid", gap: 5 }}>
          <span style={secondaryLabelStyle}>{text.credentialPurpose}</span>
          <Input
            value={credentialDraft.purpose}
            onChange={(event) => onCredentialDraftChange({ purpose: event.target.value })}
            placeholder={text.credentialPurpose}
          />
        </label>
        <label style={{ display: "grid", gap: 5 }}>
          <span style={secondaryLabelStyle}>{text.credentialExpiresIn}</span>
          <Select
            value={credentialDraft.expiresInDays}
            options={expiryOptions}
            onChange={(value) => onCredentialDraftChange({ expiresInDays: Number(value) })}
          />
        </label>
        <label style={{ display: "grid", gap: 5 }}>
          <span style={secondaryLabelStyle}>{text.credentialScopes}</span>
          <Select
            mode="multiple"
            value={credentialDraft.scopes}
            options={scopeOptions}
            onChange={(values) => onCredentialDraftChange({ scopes: values })}
            placeholder={text.credentialScopes}
          />
        </label>
      </div>

      <Space wrap>
        <Button type="primary" onClick={onCreateCredential} loading={saving}>
          {text.credentialCreate}
        </Button>
      </Space>

      <PrototypeList>
        {credentialItems.map((item) => {
          const scopeDraft = credentialScopeDrafts[item.id] || item.scopes;
          const isActive = item.status === "active";

          return (
            <PrototypeListRow key={item.id}>
              <PrototypeListMain>
                <Space wrap size={8}>
                  <Typography.Text strong style={{ color: palette.cardTitle, fontSize: "0.82rem" }}>
                    {item.name || item.prefix}
                  </Typography.Text>
                  <Tag color={resolveCredentialStatusColor(item.status)}>{item.status}</Tag>
                  <Typography.Text style={{ color: palette.cardText, fontSize: "0.74rem" }}>
                    {text.credentialPrefix}: {item.prefix}
                  </Typography.Text>
                </Space>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.76rem", lineHeight: 1.46 }}>
                  {item.purpose || text.never}
                </Typography.Text>
                <Space wrap size={[6, 6]}>
                  {(item.scopes || []).map((scope) => (
                    <Tag key={`${item.id}-${scope}`}>{scope}</Tag>
                  ))}
                </Space>
                <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                  {text.createdAt}: {formatAccountDate(item.created_at, locale, text.never)}
                </Typography.Text>
                <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                  {text.expiresAt}: {formatAccountDate(item.expires_at || null, locale, text.credentialExpiresNever)}
                </Typography.Text>
                <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                  {text.credentialLastUsed}: {formatAccountDate(item.last_used_at || null, locale, text.never)}
                </Typography.Text>
              </PrototypeListMain>
              <PrototypeListActions>
                <div style={{ display: "grid", gap: 8, minWidth: 220 }}>
                  <Select
                    mode="multiple"
                    size="small"
                    value={scopeDraft}
                    options={scopeOptions}
                    onChange={(values) => onCredentialScopeDraftChange(item.id, values)}
                    placeholder={text.credentialScopes}
                    disabled={!isActive}
                  />
                  <Space wrap size={8}>
                    <Button size="small" onClick={() => onApplyCredentialScopes(item.id)} loading={saving} disabled={!isActive}>
                      {text.credentialApplyScopes}
                    </Button>
                    <Button size="small" onClick={() => onRotateCredential(item.id)} loading={saving} disabled={!isActive}>
                      {text.credentialRotate}
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => onRevokeCredential(item.id)}
                      loading={saving}
                      disabled={!isActive}
                    >
                      {text.credentialRevoke}
                    </Button>
                  </Space>
                </div>
              </PrototypeListActions>
            </PrototypeListRow>
          );
        })}
        {credentialItems.length === 0 ? <PrototypeEmptyText>{text.credentialEmpty}</PrototypeEmptyText> : null}
      </PrototypeList>
    </Card>
  );
}
