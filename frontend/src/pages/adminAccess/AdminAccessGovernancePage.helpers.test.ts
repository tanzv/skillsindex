import { describe, expect, it } from "vitest";

import {
  buildAdminAccessGovernanceMetrics,
  fetchAdminAccessGovernanceData,
  isAdminAccessGovernanceEmpty
} from "./AdminAccessGovernancePage.helpers";

describe("AdminAccessGovernancePage helpers", () => {
  it("builds metrics from merged access governance payloads", () => {
    const metrics = buildAdminAccessGovernanceMetrics({
      accounts: [
        {
          id: 1,
          username: "admin.user",
          role: "admin",
          status: "active",
          createdAt: "2026-03-01T00:00:00Z",
          updatedAt: "2026-03-02T00:00:00Z",
          forceLogoutAt: ""
        },
        {
          id: 2,
          username: "viewer.user",
          role: "viewer",
          status: "disabled",
          createdAt: "2026-03-01T00:00:00Z",
          updatedAt: "2026-03-02T00:00:00Z",
          forceLogoutAt: ""
        }
      ],
      accountsTotal: 2,
      allowRegistration: true,
      enabledProviders: ["password", "sso"],
      availableProviders: ["password", "sso", "oidc"]
    });

    expect(metrics).toEqual([
      { label: "Accounts", value: 2 },
      { label: "Disabled", value: 1 },
      { label: "Enabled Auth Providers", value: 2 }
    ]);
  });

  it("treats empty or missing account lists as empty state", () => {
    expect(isAdminAccessGovernanceEmpty(null)).toBe(true);
    expect(
      isAdminAccessGovernanceEmpty({
        accounts: [],
        accountsTotal: 0,
        allowRegistration: false,
        enabledProviders: [],
        availableProviders: []
      })
    ).toBe(true);
  });

  it("merges account, registration, and provider payloads from backend endpoints", async () => {
    const fetcher = async (path: string) => {
      if (path === "/api/v1/admin/accounts") {
        return {
          total: 1,
          items: [
            {
              id: 101,
              username: "admin.user",
              role: "admin",
              status: "active",
              created_at: "2026-03-01T00:00:00Z",
              updated_at: "2026-03-02T00:00:00Z"
            }
          ]
        };
      }

      if (path === "/api/v1/admin/settings/registration") {
        return {
          allow_registration: true
        };
      }

      return {
        auth_providers: ["password", "sso"],
        available_auth_providers: ["password", "sso", "oidc"]
      };
    };

    await expect(fetchAdminAccessGovernanceData(fetcher)).resolves.toEqual({
      accounts: [
        {
          id: 101,
          username: "admin.user",
          role: "admin",
          status: "active",
          createdAt: "2026-03-01T00:00:00Z",
          updatedAt: "2026-03-02T00:00:00Z",
          forceLogoutAt: ""
        }
      ],
      accountsTotal: 1,
      allowRegistration: true,
      enabledProviders: ["password", "sso"],
      availableProviders: ["password", "sso", "oidc"]
    });
  });
});
