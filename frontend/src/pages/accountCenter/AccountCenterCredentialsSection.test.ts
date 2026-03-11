import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getAccountCenterCopy } from "./AccountCenterPage.copy";
import AccountCenterCredentialsSection from "./AccountCenterCredentialsSection";
import { createPrototypePalette } from "../prototype/prototypePageTheme";

describe("AccountCenterCredentialsSection", () => {
  it("renders personal api credential inventory and plaintext token flash area", () => {
    const html = renderToStaticMarkup(
      React.createElement(AccountCenterCredentialsSection, {
        text: getAccountCenterCopy("en"),
        locale: "en",
        palette: createPrototypePalette(false),
        credentialsPayload: {
          items: [
            {
              id: 9,
              name: "CLI credential",
              purpose: "Local OpenAPI usage",
              prefix: "sk_live_demo",
              scopes: ["skills.search.read"],
              status: "active",
              created_at: "2026-03-10T10:00:00Z",
              updated_at: "2026-03-10T10:00:00Z",
              last_used_at: "2026-03-10T11:00:00Z",
              expires_at: "2026-06-10T10:00:00Z"
            }
          ],
          total: 1,
          supported_scopes: ["skills.search.read", "skills.ai_search.read"],
          default_scopes: ["skills.search.read"]
        },
        credentialDraft: {
          name: "CI token",
          purpose: "Build agent",
          expiresInDays: 90,
          scopes: ["skills.search.read"]
        },
        credentialScopeDrafts: {
          9: ["skills.ai_search.read"]
        },
        latestCredentialSecret: {
          action: "created",
          name: "CLI credential",
          plaintextKey: "sk_live_secret_demo"
        },
        saving: false,
        onCredentialDraftChange: () => undefined,
        onCredentialScopeDraftChange: () => undefined,
        onCreateCredential: () => undefined,
        onRotateCredential: () => undefined,
        onRevokeCredential: () => undefined,
        onApplyCredentialScopes: () => undefined
      })
    );

    expect(html).toContain("Personal API Credentials");
    expect(html).toContain("Latest Plaintext Credential");
    expect(html).toContain("CLI credential");
    expect(html).toContain("skills.search.read");
    expect(html).toContain("Apply Scopes");
  });
});
