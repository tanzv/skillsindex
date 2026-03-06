import type { AppLocale } from "../lib/i18n";

export interface DocsEntry {
  key: string;
  title: string;
  summary: string;
  path: string;
  badge: string;
  appPath?: string;
}

export interface DocsCategory {
  key: string;
  title: string;
  summary: string;
  docsKeys: string[];
}

export interface QuickAction {
  key: string;
  title: string;
  summary: string;
  path: string;
  inApp?: boolean;
}

interface PublicDocsPageCopyItem {
  title: string;
  subtitle: string;
  openMarketplace: string;
  openDashboard: string;
  signIn: string;
  openLink: string;
  openInApp: string;
  summaryTitle: string;
  summarySubtitle: string;
  metricTotalDocs: string;
  metricSpecs: string;
  metricTools: string;
  metricInApp: string;
  docsSectionTitle: string;
  quickActionsTitle: string;
  endpointMetadataTitle: string;
  categories: DocsCategory[];
  quickActions: QuickAction[];
  docs: DocsEntry[];
}

export const publicDocsPageCopy: Record<AppLocale, PublicDocsPageCopyItem> = {
  en: {
    title: "Documentation Hub",
    subtitle:
      "Open backend documentation endpoints and governance references from one dashboard.",
    openMarketplace: "Back to Marketplace",
    openDashboard: "Open Dashboard",
    signIn: "Sign In",
    openLink: "Open",
    openInApp: "Open in App",
    summaryTitle: "Command Center",
    summarySubtitle:
      "Track documentation health, launch key resources, and inspect endpoint metadata in one panel.",
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
        docsKeys: ["overview", "api"],
      },
      {
        key: "exploration",
        title: "Exploration Tools",
        summary: "Interactive surfaces for request modeling and validation.",
        docsKeys: ["swagger"],
      },
      {
        key: "contracts",
        title: "Contract Specs",
        summary:
          "Machine-readable artifacts for integration workflows and governance checks.",
        docsKeys: ["openapi-json", "openapi-yaml"],
      },
    ],
    quickActions: [
      {
        key: "open-swagger",
        title: "Launch Swagger UI",
        summary: "Open the interactive API browser in a new tab.",
        path: "/docs/swagger",
      },
      {
        key: "download-openapi-json",
        title: "Fetch OpenAPI JSON",
        summary:
          "Access the JSON spec for SDK generation and contract validation.",
        path: "/docs/openapi.json",
      },
      {
        key: "open-overview-in-app",
        title: "Open Developer Docs In App",
        summary: "Jump to the in-app documentation route when available.",
        path: "/docs",
        inApp: true,
      },
    ],
    docs: [
      {
        key: "overview",
        title: "Developer Docs",
        summary:
          "Main product documentation page with workflows and references.",
        path: "/docs",
        badge: "General",
        appPath: "/docs",
      },
      {
        key: "api",
        title: "API Docs",
        summary: "Rendered API documentation page for session-based endpoints.",
        path: "/docs/api",
        badge: "API",
      },
      {
        key: "swagger",
        title: "Swagger UI",
        summary: "Interactive API browser generated from OpenAPI definitions.",
        path: "/docs/swagger",
        badge: "Explore",
      },
      {
        key: "openapi-json",
        title: "OpenAPI JSON",
        summary:
          "Machine-readable JSON specification for integrations and SDK generation.",
        path: "/docs/openapi.json",
        badge: "JSON",
      },
      {
        key: "openapi-yaml",
        title: "OpenAPI YAML",
        summary:
          "YAML specification variant for CI pipelines and API governance checks.",
        path: "/docs/openapi.yaml",
        badge: "YAML",
      },
    ],
  },
  zh: {
    title: "\u6587\u6863\u4e2d\u5fc3",
    subtitle:
      "\u5728\u540c\u4e00\u4e2a\u63a7\u5236\u9762\u677f\u6253\u5f00\u540e\u7aef\u6587\u6863\u3001API\u89c4\u7ea6\u4e0e\u8fd0\u7ef4\u53c2\u8003\u9875\u3002",
    openMarketplace: "\u8fd4\u56de\u5e02\u573a",
    openDashboard: "\u6253\u5f00\u63a7\u5236\u53f0",
    signIn: "\u767b\u5f55",
    openLink: "\u65b0\u7a97\u53e3\u6253\u5f00",
    openInApp: "\u5e94\u7528\u5185\u8df3\u8f6c",
    summaryTitle: "Command Center",
    summarySubtitle:
      "Track documentation health, launch key resources, and inspect endpoint metadata in one panel.",
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
        docsKeys: ["overview", "api"],
      },
      {
        key: "exploration",
        title: "Exploration Tools",
        summary: "Interactive surfaces for request modeling and validation.",
        docsKeys: ["swagger"],
      },
      {
        key: "contracts",
        title: "Contract Specs",
        summary:
          "Machine-readable artifacts for integration workflows and governance checks.",
        docsKeys: ["openapi-json", "openapi-yaml"],
      },
    ],
    quickActions: [
      {
        key: "open-swagger",
        title: "Launch Swagger UI",
        summary: "Open the interactive API browser in a new tab.",
        path: "/docs/swagger",
      },
      {
        key: "download-openapi-json",
        title: "Fetch OpenAPI JSON",
        summary:
          "Access the JSON spec for SDK generation and contract validation.",
        path: "/docs/openapi.json",
      },
      {
        key: "open-overview-in-app",
        title: "Open Developer Docs In App",
        summary: "Jump to the in-app documentation route when available.",
        path: "/docs",
        inApp: true,
      },
    ],
    docs: [
      {
        key: "overview",
        title: "\u5f00\u53d1\u8005\u6587\u6863",
        summary:
          "\u4ea7\u54c1\u4e3b\u6587\u6863\u5165\u53e3\uff0c\u5305\u542b\u4e3b\u8981\u6d41\u7a0b\u548c\u53c2\u8003\u8bf4\u660e\u3002",
        path: "/docs",
        badge: "\u901a\u7528",
        appPath: "/docs",
      },
      {
        key: "api",
        title: "API \u6587\u6863",
        summary:
          "\u9762\u5411\u4f1a\u8bdd\u63a5\u53e3\u7684\u6587\u6863\u89c6\u56fe\u9875\u9762\u3002",
        path: "/docs/api",
        badge: "API",
      },
      {
        key: "swagger",
        title: "Swagger UI",
        summary:
          "\u57fa\u4e8e OpenAPI \u7684\u4ea4\u4e92\u5f0f\u63a5\u53e3\u6d4f\u89c8\u754c\u9762\u3002",
        path: "/docs/swagger",
        badge: "\u6d4f\u89c8",
      },
      {
        key: "openapi-json",
        title: "OpenAPI JSON",
        summary:
          "\u7528\u4e8e\u96c6\u6210\u5de5\u5177\u4e0e SDK \u751f\u6210\u7684 JSON \u89c4\u7ea6\u3002",
        path: "/docs/openapi.json",
        badge: "JSON",
      },
      {
        key: "openapi-yaml",
        title: "OpenAPI YAML",
        summary:
          "\u9002\u7528\u4e8e CI \u6d41\u6c34\u7ebf\u4e0e\u89c4\u7ea6\u5ba1\u67e5\u7684 YAML \u5f62\u5f0f\u3002",
        path: "/docs/openapi.yaml",
        badge: "YAML",
      },
    ],
  },
};
