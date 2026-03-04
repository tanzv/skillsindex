import { Button, Card, Tag, Typography } from "antd";
import { useMemo } from "react";
import { SessionUser, buildServerURL } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import {
  PrototypeSplitRow,
  PrototypeTwoColumnGrid,
  PrototypeUtilityHeaderActions,
  PrototypeUtilityPanel,
  PrototypeUtilityShell
} from "./prototypeCssInJs";
import { createPrototypePalette, isLightPrototypePath } from "./prototypePageTheme";
import { createPublicPageNavigator } from "./publicPageNavigation";

interface PublicDocsPageProps {
  locale: AppLocale;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
}

interface DocsEntry {
  key: string;
  title: string;
  summary: string;
  path: string;
  badge: string;
  appPath?: string;
}

interface DocsCategory {
  key: string;
  title: string;
  summary: string;
  docsKeys: string[];
}

interface QuickAction {
  key: string;
  title: string;
  summary: string;
  path: string;
  inApp?: boolean;
}

interface EndpointMetadata {
  key: string;
  label: string;
  value: string;
  summary: string;
}

const copy = {
  en: {
    title: "Documentation Hub",
    subtitle: "Open backend documentation endpoints and governance references from one dashboard.",
    openMarketplace: "Back to Marketplace",
    openDashboard: "Open Dashboard",
    signIn: "Sign In",
    openLink: "Open",
    openInApp: "Open in App",
    summaryTitle: "Command Center",
    summarySubtitle: "Track documentation health, launch key resources, and inspect endpoint metadata in one panel.",
    metricTotalDocs: "Total Docs",
    metricSpecs: "API Specs",
    metricTools: "Interactive Tools",
    metricInApp: "In-App Routes",
    docsSectionTitle: "Document Categories",
    quickActionsTitle: "Quick Actions",
    endpointMetadataTitle: "Endpoint Metadata",
    categories: [
      {
        key: "core",
        title: "Core References",
        summary: "Primary guides for product behavior and backend usage.",
        docsKeys: ["overview", "api"]
      },
      {
        key: "exploration",
        title: "Exploration Tools",
        summary: "Interactive surfaces for request modeling and validation.",
        docsKeys: ["swagger"]
      },
      {
        key: "contracts",
        title: "Contract Specs",
        summary: "Machine-readable artifacts for integration workflows and governance checks.",
        docsKeys: ["openapi-json", "openapi-yaml"]
      }
    ] as DocsCategory[],
    quickActions: [
      {
        key: "open-swagger",
        title: "Launch Swagger UI",
        summary: "Open the interactive API browser in a new tab.",
        path: "/docs/swagger"
      },
      {
        key: "download-openapi-json",
        title: "Fetch OpenAPI JSON",
        summary: "Access the JSON spec for SDK generation and contract validation.",
        path: "/docs/openapi.json"
      },
      {
        key: "open-overview-in-app",
        title: "Open Developer Docs In App",
        summary: "Jump to the in-app documentation route when available.",
        path: "/docs",
        inApp: true
      }
    ] as QuickAction[],
    docs: [
      {
        key: "overview",
        title: "Developer Docs",
        summary: "Main product documentation page with workflows and references.",
        path: "/docs",
        badge: "General",
        appPath: "/docs"
      },
      {
        key: "api",
        title: "API Docs",
        summary: "Rendered API documentation page for session-based endpoints.",
        path: "/docs/api",
        badge: "API"
      },
      {
        key: "swagger",
        title: "Swagger UI",
        summary: "Interactive API browser generated from OpenAPI definitions.",
        path: "/docs/swagger",
        badge: "Explore"
      },
      {
        key: "openapi-json",
        title: "OpenAPI JSON",
        summary: "Machine-readable JSON specification for integrations and SDK generation.",
        path: "/docs/openapi.json",
        badge: "JSON"
      },
      {
        key: "openapi-yaml",
        title: "OpenAPI YAML",
        summary: "YAML specification variant for CI pipelines and API governance checks.",
        path: "/docs/openapi.yaml",
        badge: "YAML"
      }
    ] as DocsEntry[]
  },
  zh: {
    title: "\u6587\u6863\u4e2d\u5fc3",
    subtitle: "\u5728\u540c\u4e00\u4e2a\u63a7\u5236\u9762\u677f\u6253\u5f00\u540e\u7aef\u6587\u6863\u3001API\u89c4\u7ea6\u4e0e\u8fd0\u7ef4\u53c2\u8003\u9875\u3002",
    openMarketplace: "\u8fd4\u56de\u5e02\u573a",
    openDashboard: "\u6253\u5f00\u63a7\u5236\u53f0",
    signIn: "\u767b\u5f55",
    openLink: "\u65b0\u7a97\u53e3\u6253\u5f00",
    openInApp: "\u5e94\u7528\u5185\u8df3\u8f6c",
    summaryTitle: "Command Center",
    summarySubtitle: "Track documentation health, launch key resources, and inspect endpoint metadata in one panel.",
    metricTotalDocs: "Total Docs",
    metricSpecs: "API Specs",
    metricTools: "Interactive Tools",
    metricInApp: "In-App Routes",
    docsSectionTitle: "Document Categories",
    quickActionsTitle: "Quick Actions",
    endpointMetadataTitle: "Endpoint Metadata",
    categories: [
      {
        key: "core",
        title: "Core References",
        summary: "Primary guides for product behavior and backend usage.",
        docsKeys: ["overview", "api"]
      },
      {
        key: "exploration",
        title: "Exploration Tools",
        summary: "Interactive surfaces for request modeling and validation.",
        docsKeys: ["swagger"]
      },
      {
        key: "contracts",
        title: "Contract Specs",
        summary: "Machine-readable artifacts for integration workflows and governance checks.",
        docsKeys: ["openapi-json", "openapi-yaml"]
      }
    ] as DocsCategory[],
    quickActions: [
      {
        key: "open-swagger",
        title: "Launch Swagger UI",
        summary: "Open the interactive API browser in a new tab.",
        path: "/docs/swagger"
      },
      {
        key: "download-openapi-json",
        title: "Fetch OpenAPI JSON",
        summary: "Access the JSON spec for SDK generation and contract validation.",
        path: "/docs/openapi.json"
      },
      {
        key: "open-overview-in-app",
        title: "Open Developer Docs In App",
        summary: "Jump to the in-app documentation route when available.",
        path: "/docs",
        inApp: true
      }
    ] as QuickAction[],
    docs: [
      {
        key: "overview",
        title: "\u5f00\u53d1\u8005\u6587\u6863",
        summary: "\u4ea7\u54c1\u4e3b\u6587\u6863\u5165\u53e3\uff0c\u5305\u542b\u4e3b\u8981\u6d41\u7a0b\u548c\u53c2\u8003\u8bf4\u660e\u3002",
        path: "/docs",
        badge: "\u901a\u7528",
        appPath: "/docs"
      },
      {
        key: "api",
        title: "API \u6587\u6863",
        summary: "\u9762\u5411\u4f1a\u8bdd\u63a5\u53e3\u7684\u6587\u6863\u89c6\u56fe\u9875\u9762\u3002",
        path: "/docs/api",
        badge: "API"
      },
      {
        key: "swagger",
        title: "Swagger UI",
        summary: "\u57fa\u4e8e OpenAPI \u7684\u4ea4\u4e92\u5f0f\u63a5\u53e3\u6d4f\u89c8\u754c\u9762\u3002",
        path: "/docs/swagger",
        badge: "\u6d4f\u89c8"
      },
      {
        key: "openapi-json",
        title: "OpenAPI JSON",
        summary: "\u7528\u4e8e\u96c6\u6210\u5de5\u5177\u4e0e SDK \u751f\u6210\u7684 JSON \u89c4\u7ea6\u3002",
        path: "/docs/openapi.json",
        badge: "JSON"
      },
      {
        key: "openapi-yaml",
        title: "OpenAPI YAML",
        summary: "\u9002\u7528\u4e8e CI \u6d41\u6c34\u7ebf\u4e0e\u89c4\u7ea6\u5ba1\u67e5\u7684 YAML \u5f62\u5f0f\u3002",
        path: "/docs/openapi.yaml",
        badge: "YAML"
      }
    ] as DocsEntry[]
  }
};

export default function PublicDocsPage({ locale, onNavigate, sessionUser }: PublicDocsPageProps) {
  const text = copy[locale];
  const currentPath = window.location.pathname;
  const lightMode = isLightPrototypePath(currentPath);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);
  const navigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const docsByKey = useMemo(() => new Map(text.docs.map((entry) => [entry.key, entry])), [text.docs]);
  const totalDocs = text.docs.length;
  const specDocs = text.docs.filter((entry) => entry.path.endsWith(".json") || entry.path.endsWith(".yaml")).length;
  const interactiveTools = text.docs.filter((entry) => entry.badge === "Explore" || entry.key === "swagger").length;
  const inAppRoutes = text.docs.filter((entry) => Boolean(entry.appPath)).length;
  const endpointMetadata = useMemo<EndpointMetadata[]>(
    () => [
      {
        key: "base-url",
        label: "Server Base URL",
        value: new URL(buildServerURL("/")).origin,
        summary: "Shared backend origin used by all public documentation endpoints."
      },
      {
        key: "api-doc-path",
        label: "API Docs Endpoint",
        value: buildServerURL("/docs/api"),
        summary: "Session-aware endpoint for rendered API documentation."
      },
      {
        key: "openapi-json-path",
        label: "OpenAPI JSON Endpoint",
        value: buildServerURL("/docs/openapi.json"),
        summary: "Structured schema source for integrations and code generation."
      },
      {
        key: "openapi-yaml-path",
        label: "OpenAPI YAML Endpoint",
        value: buildServerURL("/docs/openapi.yaml"),
        summary: "Human-readable schema variant for governance pipelines."
      }
    ],
    []
  );

  function openExternal(path: string): void {
    window.open(buildServerURL(path), "_blank", "noopener,noreferrer");
  }

  function openInApp(path: string): void {
    onNavigate(navigator.toApp(path));
  }

  return (
    <PrototypeUtilityShell>
      <Card
        variant="borderless"
        style={{ borderRadius: 16, border: `1px solid ${palette.headerBorder}`, background: palette.headerBackground }}
        styles={{ body: { padding: "14px 16px" } }}
      >
        <PrototypeSplitRow>
          <div style={{ display: "grid", gap: 6 }}>
            <Typography.Title
              level={2}
              style={{
                margin: 0,
                color: palette.headerTitle,
                fontFamily: "\"Syne\", sans-serif",
                fontSize: "clamp(1.12rem, 2.5vw, 1.72rem)",
                lineHeight: 1.18
              }}
            >
              {text.title}
            </Typography.Title>
            <Typography.Paragraph style={{ margin: 0, color: palette.headerSubtitle, fontSize: "0.82rem", maxWidth: "72ch" }}>
              {text.subtitle}
            </Typography.Paragraph>
            <Typography.Text style={{ color: palette.headerSubtitle, fontSize: "0.78rem", letterSpacing: "0.02em" }}>
              {text.summaryTitle}: {text.summarySubtitle}
            </Typography.Text>
          </div>
          <PrototypeUtilityHeaderActions>
            <Button onClick={() => onNavigate(navigator.toPublic("/"))}>{text.openMarketplace}</Button>
            <Button
              type="primary"
              onClick={() => onNavigate(sessionUser ? navigator.toAdmin("/admin/overview") : navigator.toPublic("/login"))}
            >
              {sessionUser ? text.openDashboard : text.signIn}
            </Button>
          </PrototypeUtilityHeaderActions>
        </PrototypeSplitRow>
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10
          }}
        >
          {[
            { label: text.metricTotalDocs, value: totalDocs },
            { label: text.metricSpecs, value: specDocs },
            { label: text.metricTools, value: interactiveTools },
            { label: text.metricInApp, value: inAppRoutes }
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                borderRadius: 12,
                border: `1px solid ${palette.cardBorder}`,
                background: palette.cardBackground,
                padding: "10px 12px",
                display: "grid",
                gap: 3
              }}
            >
              <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {metric.label}
              </Typography.Text>
              <Typography.Text style={{ color: palette.metricValue, fontSize: "1.2rem", fontWeight: 700 }}>{metric.value}</Typography.Text>
            </div>
          ))}
        </div>
      </Card>

      <PrototypeUtilityPanel style={{ background: "transparent", border: "none", padding: 0 }}>
        <PrototypeTwoColumnGrid>
          <Card
            variant="borderless"
            style={{ borderRadius: 14, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            title={text.docsSectionTitle}
            styles={{ body: { display: "grid", gap: 12 } }}
          >
            {text.categories.map((category) => (
              <div
                key={category.key}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${palette.headerBorder}`,
                  background: palette.headerBackground,
                  padding: 10,
                  display: "grid",
                  gap: 10
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <Typography.Text style={{ color: palette.headerTitle, fontSize: "0.85rem", fontWeight: 700 }}>{category.title}</Typography.Text>
                  <Typography.Text style={{ color: palette.headerSubtitle, fontSize: "0.76rem", lineHeight: 1.45 }}>{category.summary}</Typography.Text>
                </div>
                {category.docsKeys
                  .map((docsKey) => docsByKey.get(docsKey))
                  .filter((entry): entry is DocsEntry => Boolean(entry))
                  .map((entry) => (
                    <div
                      key={entry.key}
                      style={{
                        borderRadius: 10,
                        border: `1px solid ${palette.cardBorder}`,
                        background: palette.cardBackground,
                        padding: 10,
                        display: "grid",
                        gap: 8
                      }}
                    >
                      <PrototypeSplitRow>
                        <Typography.Text style={{ color: palette.cardTitle, fontWeight: 700 }}>{entry.title}</Typography.Text>
                        <Tag color="blue">{entry.badge}</Tag>
                      </PrototypeSplitRow>
                      <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.8rem", lineHeight: 1.45 }}>
                        {entry.summary}
                      </Typography.Paragraph>
                      <PrototypeUtilityHeaderActions>
                        <Button type="primary" onClick={() => openExternal(entry.path)}>
                          {text.openLink}
                        </Button>
                        <Button onClick={() => (entry.appPath ? openInApp(entry.appPath) : openExternal(entry.path))}>
                          {text.openInApp}
                        </Button>
                      </PrototypeUtilityHeaderActions>
                    </div>
                  ))}
              </div>
            ))}
          </Card>

          <div style={{ display: "grid", gap: 10 }}>
            <Card
              variant="borderless"
              style={{ borderRadius: 14, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              title={text.quickActionsTitle}
              styles={{ body: { display: "grid", gap: 10 } }}
            >
              {text.quickActions.map((action) => (
                <div
                  key={action.key}
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${palette.headerBorder}`,
                    background: palette.headerBackground,
                    padding: 10,
                    display: "grid",
                    gap: 8
                  }}
                >
                  <Typography.Text style={{ color: palette.headerTitle, fontWeight: 700 }}>{action.title}</Typography.Text>
                  <Typography.Text style={{ color: palette.headerSubtitle, fontSize: "0.77rem", lineHeight: 1.45 }}>{action.summary}</Typography.Text>
                  <Button type="primary" onClick={() => (action.inApp ? openInApp(action.path) : openExternal(action.path))}>
                    {action.inApp ? text.openInApp : text.openLink}
                  </Button>
                </div>
              ))}
            </Card>

            <Card
              variant="borderless"
              style={{ borderRadius: 14, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              title={text.endpointMetadataTitle}
              styles={{ body: { display: "grid", gap: 10 } }}
            >
              {endpointMetadata.map((meta) => (
                <div
                  key={meta.key}
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${palette.headerBorder}`,
                    background: palette.headerBackground,
                    padding: 10,
                    display: "grid",
                    gap: 4
                  }}
                >
                  <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {meta.label}
                  </Typography.Text>
                  <Typography.Text style={{ color: palette.metricValue, fontSize: "0.78rem", wordBreak: "break-all" }}>{meta.value}</Typography.Text>
                  <Typography.Text style={{ color: palette.headerSubtitle, fontSize: "0.75rem", lineHeight: 1.4 }}>{meta.summary}</Typography.Text>
                </div>
              ))}
            </Card>
          </div>
        </PrototypeTwoColumnGrid>
      </PrototypeUtilityPanel>
    </PrototypeUtilityShell>
  );
}
