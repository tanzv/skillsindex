import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const rootDirectory = path.resolve(import.meta.dirname, "../..");
const mockBackendTestTimeoutMs = 30_000;
const mockBackendModuleURL = pathToFileURL(path.join(rootDirectory, "scripts", "mock-backend.mjs")).href;
const mockBackendModulePromise = import(mockBackendModuleURL);

async function importMockBackendModule() {
  return mockBackendModulePromise;
}

async function closeServer(server: { close: (callback: () => void) => void }) {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

describe("mock backend reset endpoint", () => {
  const servers: Array<{ close: (callback: () => void) => void }> = [];

  afterEach(async () => {
    while (servers.length) {
      const server = servers.pop();
      if (server) {
        await closeServer(server);
      }
    }
  });

  it("restores mutable account state after a reset request", async () => {
    const { startMockBackend } = await importMockBackendModule();
    const server = (await startMockBackend({ listenPort: 0 })) as {
      address: () => { port: number } | string | null;
      close: (callback: () => void) => void;
    };
    servers.push(server);

    const address = server.address();
    expect(address && typeof address !== "string").toBeTruthy();
    const port = typeof address === "string" || !address ? 0 : address.port;
    const baseURL = `http://127.0.0.1:${port}`;

    const loginResponse = await fetch(`${baseURL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        username: "admin",
        password: "Admin123456!"
      })
    });
    expect(loginResponse.ok).toBe(true);

    const sessionCookie = loginResponse.headers.get("set-cookie");
    expect(sessionCookie).toContain("skillsindex_session=");

    const sessionHeaders = {
      cookie: String(sessionCookie)
    };

    const revokeOthersResponse = await fetch(`${baseURL}/api/v1/account/sessions/revoke-others`, {
      method: "POST",
      headers: sessionHeaders
    });
    expect(revokeOthersResponse.ok).toBe(true);

    const mutatedSessionsResponse = await fetch(`${baseURL}/api/v1/account/sessions`, {
      headers: sessionHeaders
    });
    const mutatedSessions = (await mutatedSessionsResponse.json()) as { total: number };
    expect(mutatedSessions.total).toBe(1);

    const resetResponse = await fetch(`${baseURL}/__mock/reset`, {
      method: "POST"
    });
    expect(resetResponse.ok).toBe(true);

    const resetSessionsResponse = await fetch(`${baseURL}/api/v1/account/sessions`, {
      headers: sessionHeaders
    });
    const resetSessions = (await resetSessionsResponse.json()) as { total: number };
    expect(resetSessions.total).toBe(2);
  }, mockBackendTestTimeoutMs);
});

describe("mock backend public marketplace endpoints", () => {
  const servers: Array<{ close: (callback: () => void) => void }> = [];

  afterEach(async () => {
    while (servers.length) {
      const server = servers.pop();
      if (server) {
        await closeServer(server);
      }
    }
  });

  it("serves public marketplace and skill detail payloads without authentication", async () => {
    const { startMockBackend } = await importMockBackendModule();
    const server = (await startMockBackend({ listenPort: 0 })) as {
      address: () => { port: number } | string | null;
      close: (callback: () => void) => void;
    };
    servers.push(server);

    const address = server.address();
    expect(address && typeof address !== "string").toBeTruthy();
    const port = typeof address === "string" || !address ? 0 : address.port;
    const baseURL = `http://127.0.0.1:${port}`;

    const marketplaceResponse = await fetch(`${baseURL}/api/v1/public/marketplace?sort=stars`);
    expect(marketplaceResponse.ok).toBe(true);
    const marketplacePayload = (await marketplaceResponse.json()) as {
      items: Array<{ id: number }>;
      categories: Array<{ slug: string }>;
      summary: {
        landing: { total_skills: number; category_count: number };
        category_hub: { total_categories: number };
      };
    };
    expect(marketplacePayload.items.length).toBeGreaterThan(0);
    expect(marketplacePayload.categories.some((category) => category.slug === "operations")).toBe(true);
    expect(marketplacePayload.summary.landing.total_skills).toBeGreaterThan(0);
    expect(marketplacePayload.summary.landing.category_count).toBeGreaterThan(0);
    expect(marketplacePayload.summary.category_hub.total_categories).toBeGreaterThan(0);

    const detailResponse = await fetch(`${baseURL}/api/v1/public/skills/101`);
    expect(detailResponse.ok).toBe(true);
    const detailPayload = (await detailResponse.json()) as {
      skill: { id: number };
      stats: { favorite_count: number };
      related_skills?: Array<{ id: number }>;
    };
    expect(detailPayload.skill.id).toBe(101);
    expect(detailPayload.stats.favorite_count).toBeGreaterThan(0);
    expect((detailPayload.related_skills || []).length).toBeGreaterThan(0);

    const resourcesResponse = await fetch(`${baseURL}/api/v1/public/skills/101/resources`);
    expect(resourcesResponse.ok).toBe(true);
    const resourcesPayload = (await resourcesResponse.json()) as {
      entry_file?: string;
      mechanism?: string;
      metadata_sources?: string[];
      reference_paths?: string[];
      dependencies?: Array<{ kind: string; target: string }>;
    };
    expect(resourcesPayload.entry_file).toBe("README.md");
    expect(resourcesPayload.mechanism).toBe("skill_manifest");
    expect(resourcesPayload.metadata_sources).toEqual(expect.arrayContaining(["README.md", "package.json"]));
    expect(resourcesPayload.reference_paths).toEqual(expect.arrayContaining(["skills/release-readiness"]));
    expect(resourcesPayload.dependencies).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "skill", target: "repository-sync-blueprint" })])
    );
  }, mockBackendTestTimeoutMs);

  it("supports grouped category filters for public marketplace payloads", async () => {
    const { startMockBackend } = await importMockBackendModule();
    const server = (await startMockBackend({ listenPort: 0 })) as {
      address: () => { port: number } | string | null;
      close: (callback: () => void) => void;
    };
    servers.push(server);

    const address = server.address();
    expect(address && typeof address !== "string").toBeTruthy();
    const port = typeof address === "string" || !address ? 0 : address.port;
    const baseURL = `http://127.0.0.1:${port}`;

    const marketplaceResponse = await fetch(
      `${baseURL}/api/v1/public/marketplace?category_group=programming-development&subcategory_group=devops-cloud`
    );
    expect(marketplaceResponse.ok).toBe(true);

    const marketplacePayload = (await marketplaceResponse.json()) as {
      stats: { matching_skills: number };
      summary: { category_detail: { category_slug: string; total_skills: number } | null };
      items: Array<{ name: string }>;
    };

    expect(marketplacePayload.stats.matching_skills).toBeGreaterThan(0);
    expect(marketplacePayload.summary.category_detail?.category_slug).toBe("programming-development");
    expect(marketplacePayload.summary.category_detail?.total_skills).toBeGreaterThan(0);
    expect(
      marketplacePayload.items.every((item) => item.name !== "Design System Color Tokens")
    ).toBe(true);
  }, mockBackendTestTimeoutMs);
});

describe("mock backend auth provider governance endpoints", () => {
  const servers: Array<{ close: (callback: () => void) => void }> = [];

  afterEach(async () => {
    while (servers.length) {
      const server = servers.pop();
      if (server) {
        await closeServer(server);
      }
    }
  });

  it("serves managed auth provider inventory and public auth providers after updates", async () => {
    const { startMockBackend } = await importMockBackendModule();
    const server = (await startMockBackend({ listenPort: 0 })) as {
      address: () => { port: number } | string | null;
      close: (callback: () => void) => void;
    };
    servers.push(server);

    const address = server.address();
    expect(address && typeof address !== "string").toBeTruthy();
    const port = typeof address === "string" || !address ? 0 : address.port;
    const baseURL = `http://127.0.0.1:${port}`;

    const loginResponse = await fetch(`${baseURL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        username: "admin",
        password: "Admin123456!"
      })
    });
    expect(loginResponse.ok).toBe(true);
    const sessionCookie = loginResponse.headers.get("set-cookie");
    expect(sessionCookie).toContain("skillsindex_session=");

    const sessionHeaders = {
      cookie: String(sessionCookie)
    };

    const inventoryResponse = await fetch(`${baseURL}/api/v1/admin/auth-provider-configs`, {
      headers: sessionHeaders
    });
    expect(inventoryResponse.ok).toBe(true);
    const inventoryPayload = (await inventoryResponse.json()) as {
      items: Array<{ key: string }>;
    };
    expect(inventoryPayload.items.some((item) => item.key === "feishu")).toBe(true);

    const updateResponse = await fetch(`${baseURL}/api/v1/admin/auth-provider-configs`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...sessionHeaders
      },
      body: JSON.stringify({
        provider: "dingtalk",
        name: "DingTalk Workspace",
        issuer: "https://open.dingtalk.test",
        authorization_url: "https://open.dingtalk.test/oauth/authorize",
        token_url: "https://open.dingtalk.test/oauth/token",
        userinfo_url: "https://open.dingtalk.test/oauth/userinfo",
        client_id: "client-dingtalk",
        client_secret: "secret-dingtalk"
      })
    });
    expect(updateResponse.ok).toBe(true);

    const publicProvidersResponse = await fetch(`${baseURL}/api/v1/auth/providers`);
    expect(publicProvidersResponse.ok).toBe(true);
    const publicProvidersPayload = (await publicProvidersResponse.json()) as {
      auth_providers: string[];
    };
    expect(publicProvidersPayload.auth_providers).toContain("dingtalk");
    expect(publicProvidersPayload.auth_providers).toContain("feishu");
  }, mockBackendTestTimeoutMs);
});

describe("mock backend admin access settings endpoints", () => {
  const servers: Array<{ close: (callback: () => void) => void }> = [];

  afterEach(async () => {
    while (servers.length) {
      const server = servers.pop();
      if (server) {
        await closeServer(server);
      }
    }
  });

  it("serves presentation taxonomy settings for admin access governance", async () => {
    const { startMockBackend } = await importMockBackendModule();
    const server = (await startMockBackend({ listenPort: 0 })) as {
      address: () => { port: number } | string | null;
      close: (callback: () => void) => void;
    };
    servers.push(server);

    const address = server.address();
    expect(address && typeof address !== "string").toBeTruthy();
    const port = typeof address === "string" || !address ? 0 : address.port;
    const baseURL = `http://127.0.0.1:${port}`;

    const loginResponse = await fetch(`${baseURL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        username: "admin",
        password: "Admin123456!"
      })
    });
    expect(loginResponse.ok).toBe(true);
    const sessionCookie = loginResponse.headers.get("set-cookie");
    expect(sessionCookie).toContain("skillsindex_session=");

    const response = await fetch(`${baseURL}/api/v1/admin/settings/presentation-taxonomy`, {
      headers: {
        cookie: String(sessionCookie)
      }
    });

    expect(response.ok).toBe(true);
    const payload = (await response.json()) as {
      items: Array<{
        slug: string;
        subcategories: Array<{ slug: string; legacy_category_slugs: string[]; keywords: string[] }>;
      }>;
    };
    expect(payload.items.length).toBeGreaterThan(0);
    expect(payload.items[0]?.slug).toBeTruthy();
    expect(payload.items[0]?.subcategories.length).toBeGreaterThan(0);
    expect(payload.items[0]?.subcategories[0]?.legacy_category_slugs).toBeInstanceOf(Array);
    expect(payload.items[0]?.subcategories[0]?.keywords).toBeInstanceOf(Array);
  }, mockBackendTestTimeoutMs);
});
