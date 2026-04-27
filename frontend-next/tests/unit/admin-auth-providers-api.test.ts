import { describe, expect, it, vi } from "vitest";

import {
  disableManagedAuthProvider,
  loadManagedAuthProviderConfigs,
  loadManagedAuthProviderDetail,
  saveManagedAuthProvider
} from "@/src/lib/api/adminAuthProviders";
import {
  adminAuthProviderConfigsBFFEndpoint,
  buildAdminAuthProviderConfigBFFEndpoint,
  buildAdminAuthProviderConfigDisableBFFEndpoint
} from "@/src/lib/routing/protectedSurfaceEndpoints";

describe("admin auth providers api", () => {
  it("loads provider inventory and detail through the shared bff boundary", async () => {
    const fetchJSON = vi.fn<
      <T>(path: string, options?: unknown) => Promise<T>
    >(async <T>(path: string) => {
      const payloadByPath: Record<string, unknown> = {
        [adminAuthProviderConfigsBFFEndpoint]: { items: [{ key: "feishu" }] },
        [buildAdminAuthProviderConfigBFFEndpoint("feishu")]: { item: { key: "feishu", provider: "feishu" } }
      };

      return payloadByPath[path] as T;
    });

    await expect(loadManagedAuthProviderConfigs(fetchJSON)).resolves.toEqual({ items: [{ key: "feishu" }] });
    await expect(loadManagedAuthProviderDetail("feishu", fetchJSON)).resolves.toEqual({ item: { key: "feishu", provider: "feishu" } });
  });

  it("saves and disables providers through the unified provider endpoints", async () => {
    const fetchJSON = vi.fn<
      <T>(path: string, options?: unknown) => Promise<T>
    >(async <T>() => ({}) as T);

    await saveManagedAuthProvider(
      {
        provider: "feishu",
        name: "Feishu Workspace",
        description: "Primary workspace login",
        issuer: "https://open.feishu.test",
        authorization_url: "https://open.feishu.test/oauth/authorize",
        token_url: "https://open.feishu.test/oauth/token",
        userinfo_url: "https://open.feishu.test/oauth/userinfo",
        client_id: "client-feishu",
        client_secret: "secret-feishu",
        scope: "openid profile email",
        claim_external_id: "sub",
        claim_username: "preferred_username",
        claim_email: "email",
        claim_email_verified: "email_verified",
        claim_groups: "groups",
        offboarding_mode: "disable_only",
        mapping_mode: "external_email_username",
        default_org_id: 0,
        default_org_role: "member",
        default_org_group_rules: "[]",
        default_org_email_domains: "",
        default_user_role: "member"
      },
      fetchJSON
    );
    await disableManagedAuthProvider("feishu", fetchJSON);

    expect(fetchJSON).toHaveBeenNthCalledWith(1, adminAuthProviderConfigsBFFEndpoint, {
      method: "POST",
      body: expect.objectContaining({
        provider: "feishu",
        name: "Feishu Workspace"
      })
    });
    expect(fetchJSON).toHaveBeenNthCalledWith(2, buildAdminAuthProviderConfigDisableBFFEndpoint("feishu"), {
      method: "POST"
    });
  });
});
