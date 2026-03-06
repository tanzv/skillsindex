import { describe, expect, it } from "vitest";

import { matchPrototypeCatalog } from "./prototypeCatalog";

describe("matchPrototypeCatalog", () => {
  it("maps workspace section subpages back to the workspace catalog entry", () => {
    expect(matchPrototypeCatalog("/workspace/activity")?.primaryRoute).toBe("/workspace");
    expect(matchPrototypeCatalog("/workspace/queue")?.primaryRoute).toBe("/workspace");
    expect(matchPrototypeCatalog("/light/workspace/policy")?.primaryRoute).toBe("/light/workspace");
    expect(matchPrototypeCatalog("/mobile/light/workspace/actions")?.primaryRoute).toBe("/light/workspace");
  });

  it("maps admin permissions accounts aliases to account management catalog entries", () => {
    expect(matchPrototypeCatalog("/admin/permissions/accounts")?.primaryRoute).toBe("/admin/accounts");
    expect(matchPrototypeCatalog("/light/admin/permissions/accounts")?.primaryRoute).toBe("/light/admin/accounts");
    expect(matchPrototypeCatalog("/mobile/light/admin/permissions/accounts")?.primaryRoute).toBe("/light/admin/accounts");
  });
});
