import { describe, expect, it } from "vitest";

import { resolvePrototypeRoute } from "./prototypeRouteResolver";

describe("resolvePrototypeRoute", () => {
  it("resolves public families including light/mobile aliases", () => {
    expect(resolvePrototypeRoute("/")?.key).toBe("public-home");
    expect(resolvePrototypeRoute("/light")?.key).toBe("public-home");
    expect(resolvePrototypeRoute("/compare")?.key).toBe("public-compare");
    expect(resolvePrototypeRoute("/mobile/light/compare")?.key).toBe("public-compare");
    expect(resolvePrototypeRoute("/skills/9")?.key).toBe("public-skill");
    expect(resolvePrototypeRoute("/light/skills/12")?.key).toBe("public-skill");
    expect(resolvePrototypeRoute("/login")?.key).toBe("public-login");
    expect(resolvePrototypeRoute("/mobile/login")?.key).toBe("public-login");
  });

  it("resolves rollout/workspace/governance families", () => {
    expect(resolvePrototypeRoute("/rollout")?.key).toBe("rollout");
    expect(resolvePrototypeRoute("/workspace")?.key).toBe("workspace");
    expect(resolvePrototypeRoute("/governance")?.key).toBe("governance");
  });

  it("resolves state pages including light/mobile prefixes", () => {
    expect(resolvePrototypeRoute("/states/loading")).toEqual({ family: "state", key: "state-loading", stateKind: "loading" });
    expect(resolvePrototypeRoute("/light/states/empty")).toEqual({ family: "state", key: "state-empty", stateKind: "empty" });
    expect(resolvePrototypeRoute("/mobile/states/error")).toEqual({ family: "state", key: "state-error", stateKind: "error" });
    expect(resolvePrototypeRoute("/mobile/light/states/permission-denied")).toEqual({ family: "state", key: "state-permission-denied", stateKind: "permission" });
  });

  it("resolves records sync family", () => {
    expect(resolvePrototypeRoute("/admin/records/exports")?.key).toBe("records-sync");
    expect(resolvePrototypeRoute("/admin/records/imports")?.key).toBe("records-sync");
    expect(resolvePrototypeRoute("/admin/records/sync-jobs")?.key).toBe("records-sync");
    expect(resolvePrototypeRoute("/admin/ingestion/repository")?.key).toBe("records-sync");
    expect(resolvePrototypeRoute("/light/admin/ingestion/manual")?.key).toBe("records-sync");
  });

  it("resolves admin families for integrations/access/incidents/organization/overview", () => {
    expect(resolvePrototypeRoute("/admin/integrations")?.key).toBe("admin-integrations");
    expect(resolvePrototypeRoute("/admin/integrations/webhooks/logs")?.key).toBe("admin-integrations");
    expect(resolvePrototypeRoute("/admin/access")?.key).toBe("admin-access");
    expect(resolvePrototypeRoute("/admin/incidents/12/response")?.key).toBe("admin-incidents");
    expect(resolvePrototypeRoute("/admin/accounts/new")?.key).toBe("organization");
    expect(resolvePrototypeRoute("/admin/permissions/accounts")?.key).toBe("organization");
    expect(resolvePrototypeRoute("/light/admin/permissions/accounts/new")?.key).toBe("organization");
    expect(resolvePrototypeRoute("/admin/roles/new")?.key).toBe("organization");
    expect(resolvePrototypeRoute("/light/admin")?.key).toBe("admin-overview");
    expect(resolvePrototypeRoute("/light/admin/overview")?.key).toBe("admin-overview");
  });

  it("returns null for unknown paths", () => {
    expect(resolvePrototypeRoute("/prototype")).toBeNull();
    expect(resolvePrototypeRoute("/light/unknown/path")).toBeNull();
  });
});
