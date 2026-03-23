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
    const detailPayload = (await detailResponse.json()) as { skill: { id: number }; stats: { favorite_count: number } };
    expect(detailPayload.skill.id).toBe(101);
    expect(detailPayload.stats.favorite_count).toBeGreaterThan(0);
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
