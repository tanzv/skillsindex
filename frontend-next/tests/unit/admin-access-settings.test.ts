import { describe, expect, it, vi } from "vitest";

import { loadAdminAccessSettingsPayloads, saveAdminAccessSettings } from "@/src/lib/api/adminAccessSettings";

describe("admin access settings api", () => {
  it("loads accounts, registration, and auth providers through one shared boundary", async () => {
    const fetchJSON = vi.fn<
      <T>(path: string, options?: unknown) => Promise<T>
    >(async <T>(path: string) => {
      const payloadByPath: Record<string, unknown> = {
        "/api/bff/admin/accounts": { total: 3 },
        "/api/bff/admin/settings/registration": { allow_registration: true },
        "/api/bff/admin/settings/auth-providers": { auth_providers: ["password"] }
      };

      return payloadByPath[path] as T;
    });

    await expect(loadAdminAccessSettingsPayloads(fetchJSON)).resolves.toEqual({
      accounts: { total: 3 },
      registration: { allow_registration: true },
      authProviders: { auth_providers: ["password"] }
    });

    expect(fetchJSON).toHaveBeenCalledTimes(3);
    expect(fetchJSON).toHaveBeenNthCalledWith(1, "/api/bff/admin/accounts");
    expect(fetchJSON).toHaveBeenNthCalledWith(2, "/api/bff/admin/settings/registration");
    expect(fetchJSON).toHaveBeenNthCalledWith(3, "/api/bff/admin/settings/auth-providers");
  });

  it("saves registration and provider settings through one shared boundary", async () => {
    const fetchJSON = vi.fn<
      <T>(path: string, options?: unknown) => Promise<T>
    >(async <T>() => ({}) as T);

    await saveAdminAccessSettings(
      {
        allowRegistration: true,
        marketplacePublicAccess: false,
        enabledProviders: ["password", "oidc"]
      },
      fetchJSON
    );

    expect(fetchJSON).toHaveBeenCalledTimes(2);
    expect(fetchJSON).toHaveBeenNthCalledWith(1, "/api/bff/admin/settings/registration", {
      method: "POST",
      body: {
        allow_registration: true,
        marketplace_public_access: false
      }
    });
    expect(fetchJSON).toHaveBeenNthCalledWith(2, "/api/bff/admin/settings/auth-providers", {
      method: "POST",
      body: {
        auth_providers: ["password", "oidc"]
      }
    });
  });
});
