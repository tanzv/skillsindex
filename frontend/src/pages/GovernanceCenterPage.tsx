import { Alert, Button, Card, Col, Row, Space, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { fetchPublicMarketplace, fetchConsoleJSON, PublicMarketplaceResponse, SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import {
  createPrototypePalette,
  isLightPrototypePath,
  resolveAdminBase,
  resolvePublicBase,
  toPublicRoute
} from "./prototypePageTheme";
import { PrototypeHeaderLayout, PrototypeLoadingCenter, PrototypePageGrid } from "./prototypeCssInJs";

interface GovernanceCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
}

interface OpsMetricsPayload {
  item?: {
    open_incidents: number;
    pending_moderation_cases: number;
    unresolved_jobs: number;
    failed_sync_runs_24h: number;
    disabled_accounts: number;
    stale_integrations: number;
  };
}

const copy = {
  en: {
    title: "Governance Center",
    subtitle: "Policy controls, audit posture, and operational guardrails for skill assets.",
    loading: "Loading governance center",
    requestFailed: "Request failed",
    openMarketplace: "Open Marketplace",
    openWorkspace: "Open Workspace",
    signIn: "Sign In",
    openDashboard: "Open Dashboard",
    policyEngine: "Policy Engine",
    auditLedger: "Audit Ledger",
    complianceStatus: "Compliance Status",
    controlVisibility: "Visibility control across public and private channels",
    controlSync: "Sync policy and timeout constraints for remote sources",
    controlAccess: "Role-based access and account lifecycle restrictions",
    ledgerWindow: "Ledger window",
    ledgerScope: "Ledger scope",
    statusPolicy: "Policy pass baseline",
    statusAccess: "Access findings",
    statusSync: "Sync findings",
    keyLifecycle: "Key Lifecycle",
    incidentResponse: "Incident Response",
    operationalControls: "Operational Controls",
    access: "Access",
    integrations: "Integrations",
    incidents: "Incidents",
    audit: "Audit",
    lifecycleActive: "Active keys",
    lifecycleExpiring: "Expiring keys",
    lifecycleRotation: "Rotation window",
    responseCapture: "Capture incident timeline and evidence",
    responseReview: "Run review and postmortem workflow",
    responseDrill: "Schedule drill and replay scenarios"
  },
  zh: {
    title: "\u6cbb\u7406\u4e2d\u5fc3",
    subtitle: "\u9488\u5bf9\u6280\u80fd\u8d44\u4ea7\u7684\u7b56\u7565\u63a7\u5236\u3001\u5ba1\u8ba1\u6001\u52bf\u4e0e\u8fd0\u8425\u62a4\u680f\u3002",
    loading: "\u6b63\u5728\u52a0\u8f7d\u6cbb\u7406\u4e2d\u5fc3",
    requestFailed: "\u8bf7\u6c42\u5931\u8d25",
    openMarketplace: "\u6253\u5f00\u5e02\u573a",
    openWorkspace: "\u6253\u5f00\u5de5\u4f5c\u53f0",
    signIn: "\u767b\u5f55",
    openDashboard: "\u6253\u5f00\u7ba1\u7406\u53f0",
    policyEngine: "\u7b56\u7565\u5f15\u64ce",
    auditLedger: "\u5ba1\u8ba1\u53f0\u8d26",
    complianceStatus: "\u5408\u89c4\u72b6\u6001",
    controlVisibility: "\u516c\u5f00\u4e0e\u79c1\u6709\u53ef\u89c1\u6027\u63a7\u5236",
    controlSync: "\u8fdc\u7a0b\u6765\u6e90\u540c\u6b65\u7b56\u7565\u4e0e\u8d85\u65f6\u7ea6\u675f",
    controlAccess: "\u57fa\u4e8e\u89d2\u8272\u7684\u8bbf\u95ee\u6743\u9650\u4e0e\u8d26\u53f7\u751f\u547d\u5468\u671f\u7ea6\u675f",
    ledgerWindow: "\u53f0\u8d26\u7a97\u53e3",
    ledgerScope: "\u53f0\u8d26\u8303\u56f4",
    statusPolicy: "\u7b56\u7565\u901a\u8fc7\u7387",
    statusAccess: "\u8bbf\u95ee\u5f02\u5e38",
    statusSync: "\u540c\u6b65\u5f02\u5e38",
    keyLifecycle: "\u5bc6\u94a5\u751f\u547d\u5468\u671f",
    incidentResponse: "\u4e8b\u4ef6\u54cd\u5e94",
    operationalControls: "\u8fd0\u7ef4\u63a7\u5236",
    access: "\u8bbf\u95ee\u7ba1\u7406",
    integrations: "\u96c6\u6210\u7ba1\u7406",
    incidents: "\u4e8b\u4ef6\u7ba1\u7406",
    audit: "\u5ba1\u8ba1",
    lifecycleActive: "\u6d3b\u8dc3\u5bc6\u94a5",
    lifecycleExpiring: "\u5373\u5c06\u5230\u671f\u5bc6\u94a5",
    lifecycleRotation: "\u8f6e\u6362\u7a97\u53e3",
    responseCapture: "\u6355\u83b7\u4e8b\u4ef6\u65f6\u95f4\u7ebf\u4e0e\u8bc1\u636e",
    responseReview: "\u6267\u884c\u590d\u76d8\u4e0e\u4e8b\u540e\u6d41\u7a0b",
    responseDrill: "\u5b89\u6392\u6f14\u7ec3\u5e76\u56de\u653e\u573a\u666f"
  }
};

export default function GovernanceCenterPage({ locale, currentPath, onNavigate, sessionUser }: GovernanceCenterPageProps) {
  const text = copy[locale];
  const lightMode = useMemo(() => isLightPrototypePath(currentPath), [currentPath]);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);
  const adminBase = useMemo(() => resolveAdminBase(currentPath), [currentPath]);
  const publicBase = useMemo(() => resolvePublicBase(currentPath), [currentPath]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<PublicMarketplaceResponse | null>(null);
  const [opsMetrics, setOpsMetrics] = useState<OpsMetricsPayload | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const tasks: Promise<unknown>[] = [fetchPublicMarketplace({ sort: "stars", page: 1 })];
    if (sessionUser) {
      tasks.push(fetchConsoleJSON<OpsMetricsPayload>("/api/v1/admin/ops/metrics"));
    }

    Promise.all(tasks)
      .then((results) => {
        if (!active) {
          return;
        }
        setPayload(results[0] as PublicMarketplaceResponse);
        if (sessionUser && results[1]) {
          setOpsMetrics(results[1] as OpsMetricsPayload);
        }
      })
      .catch((fetchError) => {
        if (!active) {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : text.requestFailed);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [sessionUser, text.requestFailed]);

  const totalSkills = payload?.stats.total_skills || 0;
  const categoryCount = payload?.categories.length || 0;
  const passBaseline = payload?.items.length
    ? payload.items.reduce((sum, item) => sum + item.quality_score, 0) / payload.items.length
    : 0;

  const activeKeys = totalSkills;
  const expiringKeys = payload?.top_tags.length || 0;
  const openIncidents = opsMetrics?.item?.open_incidents || 0;

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
              style={{ margin: 0, color: palette.headerTitle, fontFamily: "\"Syne\", sans-serif", fontSize: "clamp(1.1rem, 2.3vw, 1.5rem)", lineHeight: 1.2 }}
            >
              {text.title}
            </Typography.Title>
            <Typography.Paragraph style={{ margin: "6px 0 0", color: palette.headerSubtitle, fontSize: "0.8rem" }}>
              {text.subtitle}
            </Typography.Paragraph>
          </div>
          <Space wrap>
            <Button onClick={() => onNavigate(toPublicRoute(publicBase, "/"))}>{text.openMarketplace}</Button>
            <Button onClick={() => onNavigate(toPublicRoute(publicBase, "/workspace"))}>{text.openWorkspace}</Button>
            <Button type="primary" onClick={() => onNavigate(sessionUser ? `${adminBase}/overview` : "/login")}>
              {sessionUser ? text.openDashboard : text.signIn}
            </Button>
          </Space>
        </PrototypeHeaderLayout>
      </Card>

      {loading ? (
        <PrototypeLoadingCenter>
          <Spin description={text.loading} />
        </PrototypeLoadingCenter>
      ) : null}
      {!loading && error ? <Alert type="error" showIcon message={error} /> : null}

      {!loading ? (
        <Row gutter={[10, 10]}>
          <Col xs={24} xl={16}>
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                  {text.policyEngine}
                </Typography.Title>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>- {text.controlVisibility}</Typography.Text>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>- {text.controlSync}</Typography.Text>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>- {text.controlAccess}</Typography.Text>
              </Card>

              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                  {text.auditLedger}
                </Typography.Title>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{text.ledgerWindow}: {payload?.top_tags.length || 0}</Typography.Text>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{text.ledgerScope}: {categoryCount}</Typography.Text>
              </Card>

              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                  {text.complianceStatus}
                </Typography.Title>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{text.statusPolicy}: {passBaseline.toFixed(1)}</Typography.Text>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{text.statusAccess}: {openIncidents}</Typography.Text>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{text.statusSync}: {totalSkills}</Typography.Text>
              </Card>
            </Space>
          </Col>

          <Col xs={24} xl={8}>
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.sideHighlightBorder}`, background: palette.sideHighlightBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: "#f3fbff", fontSize: "0.95rem" }}>
                  {text.keyLifecycle}
                </Typography.Title>
                <Typography.Text style={{ color: "#d8f5ff", fontSize: "0.78rem" }}>{text.lifecycleActive}: {activeKeys}</Typography.Text>
                <Typography.Text style={{ color: "#d8f5ff", fontSize: "0.78rem" }}>{text.lifecycleExpiring}: {expiringKeys}</Typography.Text>
                <Typography.Text style={{ color: "#d8f5ff", fontSize: "0.78rem" }}>{text.lifecycleRotation}: 72h</Typography.Text>
              </Card>

              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                  {text.incidentResponse}
                </Typography.Title>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{text.responseCapture}</Typography.Text>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{text.responseReview}</Typography.Text>
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{text.responseDrill}</Typography.Text>
              </Card>

              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                  {text.operationalControls}
                </Typography.Title>
                <Button block onClick={() => onNavigate(`${adminBase}/access`)}>{text.access}</Button>
                <Button block onClick={() => onNavigate(`${adminBase}/integrations`)}>{text.integrations}</Button>
                <Button block onClick={() => onNavigate(`${adminBase}/moderation`)}>{text.incidents}</Button>
                <Button block onClick={() => onNavigate(`${adminBase}/ops/audit-export`)}>{text.audit}</Button>
              </Card>
            </Space>
          </Col>
        </Row>
      ) : null}
    </PrototypePageGrid>
  );
}
