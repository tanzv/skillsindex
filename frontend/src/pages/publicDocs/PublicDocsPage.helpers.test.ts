import { describe, expect, it } from "vitest";

import type { DocsEntry } from "../PublicDocsPage.copy";
import { buildDocsByKey, buildEndpointMetadata, buildPublicDocsStats } from "./PublicDocsPage.helpers";

const docsFixture: DocsEntry[] = [
  {
    key: "overview",
    title: "Developer Docs",
    summary: "Main documentation",
    path: "/docs",
    badge: "General",
    appPath: "/docs"
  },
  {
    key: "swagger",
    title: "Swagger UI",
    summary: "Interactive browser",
    path: "/docs/swagger",
    badge: "Explore"
  },
  {
    key: "openapi-json",
    title: "OpenAPI JSON",
    summary: "JSON contract",
    path: "/docs/openapi.json",
    badge: "JSON"
  },
  {
    key: "openapi-yaml",
    title: "OpenAPI YAML",
    summary: "YAML contract",
    path: "/docs/openapi.yaml",
    badge: "YAML"
  }
];

describe("PublicDocsPage.helpers", () => {
  it("builds docs map by key", () => {
    const docsByKey = buildDocsByKey(docsFixture);

    expect(docsByKey.get("overview")?.title).toBe("Developer Docs");
    expect(docsByKey.get("swagger")?.path).toBe("/docs/swagger");
    expect(docsByKey.size).toBe(4);
  });

  it("computes docs stats for dashboard summary", () => {
    const stats = buildPublicDocsStats(docsFixture);

    expect(stats).toEqual({
      totalDocs: 4,
      specDocs: 2,
      interactiveTools: 1,
      inAppRoutes: 1
    });
  });

  it("builds endpoint metadata with resolved server urls", () => {
    const metadata = buildEndpointMetadata((path) => `https://example.com${path}`);

    expect(metadata).toHaveLength(4);
    expect(metadata[0]).toMatchObject({
      key: "base-url",
      value: "https://example.com"
    });
    expect(metadata[2]).toMatchObject({
      key: "openapi-json-path",
      value: "https://example.com/docs/openapi.json"
    });
  });
});
