import type { DocsEntry } from "../PublicDocsPage.copy";
import type { EndpointMetadata, PublicDocsStats } from "./PublicDocsPage.types";

export function buildDocsByKey(docs: DocsEntry[]): Map<string, DocsEntry> {
  return new Map(docs.map((entry) => [entry.key, entry]));
}

export function buildPublicDocsStats(docs: DocsEntry[]): PublicDocsStats {
  const totalDocs = docs.length;
  const specDocs = docs.filter((entry) => entry.path.endsWith(".json") || entry.path.endsWith(".yaml")).length;
  const interactiveTools = docs.filter((entry) => entry.badge === "Explore" || entry.key === "swagger").length;
  const inAppRoutes = docs.filter((entry) => Boolean(entry.appPath)).length;

  return {
    totalDocs,
    specDocs,
    interactiveTools,
    inAppRoutes
  };
}

export function buildEndpointMetadata(resolveServerURL: (path: string) => string): EndpointMetadata[] {
  return [
    {
      key: "base-url",
      label: "Server Base URL",
      value: new URL(resolveServerURL("/")).origin,
      summary: "Shared backend origin used by all public documentation endpoints."
    },
    {
      key: "api-doc-path",
      label: "API Docs Endpoint",
      value: resolveServerURL("/docs/api"),
      summary: "Session-aware endpoint for rendered API documentation."
    },
    {
      key: "openapi-json-path",
      label: "OpenAPI JSON Endpoint",
      value: resolveServerURL("/docs/openapi.json"),
      summary: "Structured schema source for integrations and code generation."
    },
    {
      key: "openapi-yaml-path",
      label: "OpenAPI YAML Endpoint",
      value: resolveServerURL("/docs/openapi.yaml"),
      summary: "Human-readable schema variant for governance pipelines."
    }
  ];
}
