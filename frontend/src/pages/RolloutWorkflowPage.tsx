import { Button, Card, Col, Row, Space, Typography } from "antd";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { PublicMarketplaceResponse, SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import {
  createPrototypePalette,
  isLightPrototypePath,
  resolveAdminBase,
  resolvePublicBase,
  toPublicRoute
} from "./prototypePageTheme";
import PrototypeFeatureScaffold from "./PrototypeFeatureScaffold";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";

interface RolloutWorkflowPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
}

const stepBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 999,
  border: "1px solid #2f9cb6",
  background: "#0f456c",
  color: "#d9f8ff",
  fontSize: "0.82rem",
  fontWeight: 800
};

const copy = {
  en: {
    title: "Install and Rollout Workflow",
    subtitle: "From intake to release observation, every rollout step is tracked and reversible.",
    loading: "Loading rollout workflow",
    openMarketplace: "Open Marketplace",
    openWorkspace: "Open Workspace",
    signIn: "Sign In",
    openDashboard: "Open Dashboard",
    actions: "Action Dock",
    stepSourceTitle: "Source Intake",
    stepSourceBody: "Collect manual, archive, repository, and external source submissions into one queue.",
    stepValidationTitle: "Validation",
    stepValidationBody: "Run quality checks, metadata verification, and policy gating before release.",
    stepPublishTitle: "Publish",
    stepPublishBody: "Promote approved assets into visible channels with controlled blast radius.",
    stepObserveTitle: "Observe",
    stepObserveBody: "Monitor adoption, failure signals, and rollback guardrails after release.",
    statusApprovalTitle: "Approval Window",
    statusApprovalBody: "Reviewer quorum and role-based checks are enforced before execution.",
    statusRollbackTitle: "Rollback Safety",
    statusRollbackBody: "Each rollout stores immutable checkpoints to support fast rollback.",
    statusReleaseTitle: "Release Forecast",
    statusReleaseBody: "Current readiness is derived from queue quality and recent sync success.",
    releaseGreen: "Green",
    releaseWatch: "Watch",
    queueLabel: "Queue",
    qualityLabel: "Quality",
    riskLabel: "Risk",
    actionIngestion: "Open Ingestion",
    actionRecords: "Open Records",
    actionSync: "Open Sync Jobs",
    requestFailed: "Request failed"
  },
  zh: {
    title: "\u5b89\u88c5\u4e0e\u53d1\u5e03\u5de5\u4f5c\u6d41",
    subtitle: "\u4ece\u5f15\u5165\u5230\u53d1\u5e03\u89c2\u6d4b\uff0c\u5168\u6d41\u7a0b\u53ef\u8ddf\u8e2a\u4e14\u53ef\u56de\u6eda\u3002",
    loading: "\u6b63\u5728\u52a0\u8f7d\u53d1\u5e03\u6d41\u7a0b",
    openMarketplace: "\u6253\u5f00\u5e02\u573a",
    openWorkspace: "\u6253\u5f00\u5de5\u4f5c\u53f0",
    signIn: "\u767b\u5f55",
    openDashboard: "\u6253\u5f00\u7ba1\u7406\u53f0",
    actions: "\u64cd\u4f5c\u575e",
    stepSourceTitle: "\u6765\u6e90\u5f15\u5165",
    stepSourceBody: "\u5c06\u624b\u52a8\u3001\u538b\u7f29\u5305\u3001\u4ed3\u5e93\u548c\u5916\u90e8\u6e20\u9053\u7edf\u4e00\u8fdb\u5165\u961f\u5217\u3002",
    stepValidationTitle: "\u6821\u9a8c",
    stepValidationBody: "\u5728\u53d1\u5e03\u524d\u6267\u884c\u8d28\u91cf\u3001\u5143\u6570\u636e\u4e0e\u7b56\u7565\u95e8\u7981\u68c0\u67e5\u3002",
    stepPublishTitle: "\u53d1\u5e03",
    stepPublishBody: "\u5c06\u5ba1\u6838\u901a\u8fc7\u7684\u8d44\u4ea7\u6309\u53ef\u63a7\u8303\u56f4\u63a8\u9001\u5230\u53ef\u89c1\u6e20\u9053\u3002",
    stepObserveTitle: "\u89c2\u6d4b",
    stepObserveBody: "\u53d1\u5e03\u540e\u6301\u7eed\u76d1\u63a7\u91c7\u7eb3\u60c5\u51b5\u3001\u5f02\u5e38\u4fe1\u53f7\u548c\u56de\u6eda\u62a4\u680f\u3002",
    statusApprovalTitle: "\u5ba1\u6279\u7a97\u53e3",
    statusApprovalBody: "\u6267\u884c\u524d\u5fc5\u987b\u901a\u8fc7\u89d2\u8272\u6743\u9650\u4e0e\u5ba1\u6838\u4eba\u6570\u6821\u9a8c\u3002",
    statusRollbackTitle: "\u56de\u6eda\u4fdd\u969c",
    statusRollbackBody: "\u6bcf\u6b21\u53d1\u5e03\u90fd\u4fdd\u7559\u4e0d\u53ef\u53d8\u66f4\u5feb\u7167\uff0c\u652f\u6301\u5feb\u901f\u56de\u9000\u3002",
    statusReleaseTitle: "\u53d1\u5e03\u9884\u6d4b",
    statusReleaseBody: "\u57fa\u4e8e\u961f\u5217\u8d28\u91cf\u4e0e\u6700\u8fd1\u540c\u6b65\u6210\u529f\u7387\u7ed9\u51fa\u53ef\u53d1\u5e03\u7ed3\u8bba\u3002",
    releaseGreen: "\u901a\u8fc7",
    releaseWatch: "\u89c2\u5bdf",
    queueLabel: "\u961f\u5217",
    qualityLabel: "\u8d28\u91cf",
    riskLabel: "\u98ce\u9669",
    actionIngestion: "\u6253\u5f00\u5f15\u5165",
    actionRecords: "\u6253\u5f00\u8bb0\u5f55",
    actionSync: "\u6253\u5f00\u540c\u6b65\u4efb\u52a1",
    requestFailed: "\u8bf7\u6c42\u5931\u8d25"
  }
};

export default function RolloutWorkflowPage({ locale, currentPath, onNavigate, sessionUser }: RolloutWorkflowPageProps) {
  const text = copy[locale];
  const lightMode = useMemo(() => isLightPrototypePath(currentPath), [currentPath]);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);
  const adminBase = useMemo(() => resolveAdminBase(currentPath), [currentPath]);
  const publicBase = useMemo(() => resolvePublicBase(currentPath), [currentPath]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<PublicMarketplaceResponse | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    loadMarketplaceWithFallback({
      query: { sort: "quality", page: 1 },
      locale,
      sessionUser,
      mode: dataMode
    })
      .then((result) => {
        if (!active) {
          return;
        }
        setPayload(result.payload);
        setError("");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, locale, sessionUser]);

  const totalQueue = payload?.stats.matching_skills || 0;
  const topQuality = payload?.items[0]?.quality_score || 0;
  const topTags = payload?.top_tags.length || 0;

  const metricItems = [
    { key: "queue", label: text.queueLabel, value: String(totalQueue) },
    { key: "quality", label: text.qualityLabel, value: topQuality.toFixed(1) },
    { key: "risk", label: text.riskLabel, value: String(topTags) },
    { key: "forecast", label: text.statusReleaseTitle, value: topQuality >= 8 ? text.releaseGreen : text.releaseWatch }
  ];

  const stepItems = [
    { index: "01", title: text.stepSourceTitle, body: text.stepSourceBody },
    { index: "02", title: text.stepValidationTitle, body: text.stepValidationBody },
    { index: "03", title: text.stepPublishTitle, body: text.stepPublishBody },
    { index: "04", title: text.stepObserveTitle, body: text.stepObserveBody }
  ];

  return (
    <PrototypeFeatureScaffold
      palette={palette}
      title={text.title}
      subtitle={text.subtitle}
      loading={loading}
      loadingText={text.loading}
      error={error}
      actions={
        <Space wrap>
          <Button onClick={() => onNavigate(toPublicRoute(publicBase, "/"))}>{text.openMarketplace}</Button>
          <Button onClick={() => onNavigate(toPublicRoute(publicBase, "/workspace"))}>{text.openWorkspace}</Button>
          <Button type="primary" onClick={() => onNavigate(sessionUser ? `${adminBase}/overview` : "/login")}>
            {sessionUser ? text.openDashboard : text.signIn}
          </Button>
        </Space>
      }
    >
          <Row gutter={[10, 10]}>
            {metricItems.map((item) => (
              <Col key={item.key} xs={12} lg={6}>
                <Card
                  variant="borderless"
                  style={{ borderRadius: 12, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                  styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
                >
                  <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {item.label}
                  </Typography.Text>
                  <Typography.Text strong style={{ color: palette.metricValue, fontSize: "1.06rem" }}>
                    {item.value}
                  </Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[10, 10]}>
            <Col xs={24} xl={16}>
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                {stepItems.map((item) => (
                  <Card
                    key={item.index}
                    variant="borderless"
                    style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                    styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
                  >
                    <span style={stepBadgeStyle}>{item.index}</span>
                    <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                      {item.title}
                    </Typography.Title>
                    <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
                      {item.body}
                    </Typography.Paragraph>
                  </Card>
                ))}
              </Space>
            </Col>

            <Col xs={24} xl={8}>
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <Card
                  variant="borderless"
                  style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                  styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
                >
                  <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                    {text.statusApprovalTitle}
                  </Typography.Title>
                  <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
                    {text.statusApprovalBody}
                  </Typography.Paragraph>
                </Card>

                <Card
                  variant="borderless"
                  style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                  styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
                >
                  <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                    {text.statusRollbackTitle}
                  </Typography.Title>
                  <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
                    {text.statusRollbackBody}
                  </Typography.Paragraph>
                </Card>

                <Card
                  variant="borderless"
                  style={{ borderRadius: 13, border: `1px solid ${palette.sideHighlightBorder}`, background: palette.sideHighlightBackground }}
                  styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
                >
                  <Typography.Title level={4} style={{ margin: 0, color: "#f3fbff", fontSize: "0.95rem" }}>
                    {text.statusReleaseTitle}
                  </Typography.Title>
                  <Typography.Paragraph style={{ margin: 0, color: "#d8f5ff", fontSize: "0.78rem", lineHeight: 1.46 }}>
                    {text.statusReleaseBody}
                  </Typography.Paragraph>
                </Card>

                <Card
                  variant="borderless"
                  style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                  styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
                >
                  <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                    {text.actions}
                  </Typography.Title>
                  <Button block onClick={() => onNavigate(`${adminBase}/ingestion/manual`)}>{text.actionIngestion}</Button>
                  <Button block onClick={() => onNavigate(`${adminBase}/records/imports`)}>{text.actionRecords}</Button>
                  <Button block onClick={() => onNavigate(`${adminBase}/records/sync-jobs`)}>{text.actionSync}</Button>
                </Card>
              </Space>
            </Col>
          </Row>
    </PrototypeFeatureScaffold>
  );
}
