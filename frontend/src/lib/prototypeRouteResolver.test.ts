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

  it("resolves rollout alias to workspace family and keeps workspace/governance families", () => {
    expect(resolvePrototypeRoute("/rollout")?.key).toBe("workspace");
    expect(resolvePrototypeRoute("/workspace")?.key).toBe("workspace");
    expect(resolvePrototypeRoute("/governance")?.key).toBe("governance");
  });

  it("resolves state pages including light/mobile prefixes", () => {
    expect(resolvePrototypeRoute("/states/loading")).toEqual({ family: "state", key: "state-loading", stateKind: "loading" });
    expect(resolvePrototypeRoute("/light/states/empty")).toEqual({ family: "state", key: "state-empty", stateKind: "empty" });
    expect(resolvePrototypeRoute("/mobile/states/error")).toEqual({ family: "state", key: "state-error", stateKind: "error" });
    expect(resolvePrototypeRoute("/mobile/light/states/permission-denied")).toEqual({ family: "state", key: "state-permission-denied", stateKind: "permission" });
  });

  it("keeps preview-only records sync routes in the prototype resolver", () => {
    expect(resolvePrototypeRoute("/admin/records/exports")?.key).toBe("records-sync");
    expect(resolvePrototypeRoute("/admin/ingestion/upload")?.key).toBe("records-sync");
    expect(resolvePrototypeRoute("/light/admin/ingestion/skillmp")?.key).toBe("records-sync");
  });

  it("stops owning promoted skill operation routes", () => {
    expect(resolvePrototypeRoute("/admin/records/imports")).toBeNull();
    expect(resolvePrototypeRoute("/admin/records/sync-jobs")).toBeNull();
    expect(resolvePrototypeRoute("/admin/ingestion/repository")).toBeNull();
    expect(resolvePrototypeRoute("/light/admin/ingestion/manual")).toBeNull();
  });

  it("resolves admin families for integrations/incidents/overview", () => {
    expect(resolvePrototypeRoute("/admin/integrations")?.key).toBe("admin-integrations");
    expect(resolvePrototypeRoute("/admin/integrations/webhooks/logs")?.key).toBe("admin-integrations");
    expect(resolvePrototypeRoute("/admin/incidents/12/response")?.key).toBe("admin-incidents");
    expect(resolvePrototypeRoute("/light/admin")?.key).toBe("admin-overview");
    expect(resolvePrototypeRoute("/light/admin/overview")?.key).toBe("admin-overview");
  });

  it("stops owning organization management routes", () => {
    expect(resolvePrototypeRoute("/admin/accounts")).toBeNull();
    expect(resolvePrototypeRoute("/admin/accounts/new")).toBeNull();
    expect(resolvePrototypeRoute("/admin/access")).toBeNull();
    expect(resolvePrototypeRoute("/light/admin/access")).toBeNull();
    expect(resolvePrototypeRoute("/admin/permissions/accounts")).toBeNull();
    expect(resolvePrototypeRoute("/light/admin/permissions/accounts/new")).toBeNull();
    expect(resolvePrototypeRoute("/admin/roles")).toBeNull();
    expect(resolvePrototypeRoute("/admin/roles/new")).toBeNull();
  });

  it("returns null for unknown paths", () => {
    expect(resolvePrototypeRoute("/prototype")).toBeNull();
    expect(resolvePrototypeRoute("/light/unknown/path")).toBeNull();
  });
});
