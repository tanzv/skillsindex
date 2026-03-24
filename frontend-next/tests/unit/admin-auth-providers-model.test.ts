import { describe, expect, it } from "vitest";

import {
  createManagedAuthProviderDraft,
  managedAuthProviderDefinitions,
  normalizeManagedAuthProviderDetailPayload,
  normalizeManagedAuthProvidersPayload
} from "@/src/features/adminGovernance/adminAuthProvidersModel";

describe("admin auth providers model", () => {
  it("normalizes provider inventory with stable provider ordering", () => {
    const payload = normalizeManagedAuthProvidersPayload({
      items: [
        {
          key: "feishu",
          display_name: "Feishu",
          enabled: true,
          connected: true,
          available: true,
          management_kind: "oidc",
          configurable: true,
          start_path: "/auth/sso/start/feishu"
        }
      ]
    });

    expect(payload.items[0]).toEqual(
      expect.objectContaining({
        key: "dingtalk"
      })
    );
    expect(payload.items.find((item) => item.key === "feishu")).toEqual(
      expect.objectContaining({
        enabled: true,
        connected: true,
        startPath: "/auth/sso/start/feishu"
      })
    );
  });

  it("builds editable drafts with provider defaults and normalized detail payloads", () => {
    const detail = normalizeManagedAuthProviderDetailPayload({
      item: {
        key: "feishu",
        display_name: "Feishu Workspace",
        management_kind: "oidc",
        enabled: true,
        connected: true,
        issuer: "https://open.feishu.test",
        authorization_url: "https://open.feishu.test/oauth/authorize",
        token_url: "https://open.feishu.test/oauth/token",
        userinfo_url: "https://open.feishu.test/oauth/userinfo",
        client_id: "client-feishu",
        client_secret: "secret-feishu"
      }
    });
    const definition = managedAuthProviderDefinitions.find((item) => item.key === "feishu");

    expect(definition).toBeTruthy();
    expect(createManagedAuthProviderDraft(definition!, detail)).toEqual(
      expect.objectContaining({
        provider: "feishu",
        name: "Feishu Workspace",
        clientId: "client-feishu",
        clientSecret: "secret-feishu"
      })
    );
  });
});
