import { describe, expect, it } from "vitest";

import {
  applyAccountEdit,
  buildAccountEditMutationRequests,
  buildRoleSummary,
  filterAccounts,
  normalizeAccountStatus,
  resolveStatusPillClassName,
  sortAccountsByUpdatedAt
} from "./AdminAccountRoleWorkbenchPage.helpers";

const sampleAccounts = [
  {
    username: "ops.lead",
    role: "Admin",
    status: "Active",
    updated_at: "2026-03-02T10:00:00Z"
  },
  {
    username: "readonly.demo",
    role: "Viewer",
    status: "disabled",
    updated_at: "2026-03-01T08:00:00Z"
  },
  {
    username: "security.audit",
    role: "Auditor",
    status: "ACTIVE",
    updated_at: "2026-03-03T02:00:00Z"
  },
  {
    username: "broken.time",
    role: "Member",
    status: "",
    updated_at: "not-a-date"
  }
];

describe("AdminAccountRoleWorkbenchPage helpers", () => {
  it("filters accounts by query across username and role", () => {
    const filtered = filterAccounts(sampleAccounts, "audit", "all");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.username).toBe("security.audit");
  });

  it("filters accounts by normalized status", () => {
    const activeOnly = filterAccounts(sampleAccounts, "", "active");
    const disabledOnly = filterAccounts(sampleAccounts, "", "disabled");

    expect(activeOnly.map((account) => account.username)).toEqual(["ops.lead", "security.audit"]);
    expect(disabledOnly.map((account) => account.username)).toEqual(["readonly.demo"]);
  });

  it("sorts accounts by updated timestamp descending with invalid dates last", () => {
    const sorted = sortAccountsByUpdatedAt(sampleAccounts);

    expect(sorted.map((account) => account.username)).toEqual([
      "security.audit",
      "ops.lead",
      "readonly.demo",
      "broken.time"
    ]);
  });

  it("builds role summary sorted by count and role name", () => {
    const summary = buildRoleSummary([
      { username: "one", role: "Admin", status: "active", updated_at: "2026-03-01T00:00:00Z" },
      { username: "two", role: "admin", status: "active", updated_at: "2026-03-01T00:00:00Z" },
      { username: "three", role: "viewer", status: "active", updated_at: "2026-03-01T00:00:00Z" },
      { username: "four", role: "auditor", status: "active", updated_at: "2026-03-01T00:00:00Z" }
    ]);

    expect(summary).toEqual([
      { role: "admin", count: 2 },
      { role: "auditor", count: 1 },
      { role: "viewer", count: 1 }
    ]);
  });

  it("resolves normalized status and pill classes", () => {
    expect(normalizeAccountStatus(" ACTIVE ")).toBe("active");
    expect(normalizeAccountStatus("")).toBe("unknown");
    expect(resolveStatusPillClassName("active")).toBe("pill active");
    expect(resolveStatusPillClassName("disabled")).toBe("pill muted");
  });

  it("applies account edits by account id while keeping other rows unchanged", () => {
    const original = [
      {
        id: 101,
        username: "ops.lead",
        role: "admin",
        status: "active",
        updated_at: "2026-03-02T10:00:00Z"
      },
      {
        id: 102,
        username: "readonly.demo",
        role: "viewer",
        status: "disabled",
        updated_at: "2026-03-01T08:00:00Z"
      }
    ];

    const edited = applyAccountEdit(original, 102, {
      username: "readonly.updated",
      role: "auditor",
      status: "active",
      updatedAtISO: "2026-03-06T09:00:00Z"
    });

    expect(edited).toEqual([
      {
        id: 101,
        username: "ops.lead",
        role: "admin",
        status: "active",
        updated_at: "2026-03-02T10:00:00Z"
      },
      {
        id: 102,
        username: "readonly.updated",
        role: "auditor",
        status: "active",
        updated_at: "2026-03-06T09:00:00Z"
      }
    ]);
  });

  it("builds only changed mutation requests for role and status updates", () => {
    const unchanged = buildAccountEditMutationRequests({
      accountID: 101,
      currentRole: "admin",
      currentStatus: "active",
      nextRole: "admin",
      nextStatus: "active"
    });
    expect(unchanged).toEqual([]);

    const roleOnly = buildAccountEditMutationRequests({
      accountID: 101,
      currentRole: "admin",
      currentStatus: "active",
      nextRole: "viewer",
      nextStatus: "active"
    });
    expect(roleOnly).toEqual([
      {
        path: "/api/v1/admin/users/101/role",
        payload: { role: "viewer" }
      }
    ]);

    const bothChanged = buildAccountEditMutationRequests({
      accountID: 101,
      currentRole: "admin",
      currentStatus: "active",
      nextRole: "member",
      nextStatus: "disabled"
    });
    expect(bothChanged).toEqual([
      {
        path: "/api/v1/admin/users/101/role",
        payload: { role: "member" }
      },
      {
        path: "/api/v1/admin/accounts/101/status",
        payload: { status: "disabled" }
      }
    ]);
  });
});
