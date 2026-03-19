import { describe, expect, it } from "vitest";

import { buildAdminAPIKeyOverview, buildKeyMeta, normalizeAdminAPIKeysPayload } from "@/src/features/adminApiKeys/model";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const apiKeyMessages = createProtectedPageTestMessages({
  adminApiKeys: {
    metricTotalKeys: "Total Keys",
    metricActiveKeys: "Active Keys",
    metricRevokedKeys: "Revoked Keys",
    metricExpiredKeys: "Expired Keys",
    ownerUnknown: "Unknown Owner",
    valueNotAvailable: "n/a",
    metaPrefixTemplate: "prefix {value}",
    metaCreatedTemplate: "created {value}",
    metaUpdatedTemplate: "updated {value}",
    metaLastUsedTemplate: "last used {value}"
  }
}).adminApiKeys;

describe("admin api keys model", () => {
  it("normalizes keys and builds owner and status overview", () => {
    const payload = normalizeAdminAPIKeysPayload({
      total: 3,
      items: [
        {
          id: 1,
          user_id: 7,
          created_by: 1,
          owner_username: "ops.lead",
          name: "Ops CLI",
          purpose: "Operations usage",
          prefix: "sk_live_ops",
          scopes: ["skills.search.read"],
          status: "active",
          created_at: "2026-03-10T10:00:00Z",
          updated_at: "2026-03-11T10:00:00Z"
        },
        {
          id: 2,
          user_id: 7,
          created_by: 1,
          owner_username: "ops.lead",
          name: "Ops Bot",
          purpose: "Automation",
          prefix: "sk_live_bot",
          scopes: ["skills.search.read", "skills.ai_search.read"],
          status: "revoked",
          created_at: "2026-03-10T10:00:00Z",
          updated_at: "2026-03-11T10:00:00Z"
        },
        {
          id: 3,
          user_id: 9,
          created_by: 1,
          owner_username: "security.audit",
          name: "Audit Read",
          purpose: "Review",
          prefix: "sk_live_audit",
          scopes: ["skills.search.read"],
          status: "expired",
          created_at: "2026-03-10T10:00:00Z",
          updated_at: "2026-03-11T10:00:00Z"
        }
      ]
    });

    const overview = buildAdminAPIKeyOverview(payload, apiKeyMessages);

    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Active Keys", value: "1" }),
        expect.objectContaining({ label: "Revoked Keys", value: "1" }),
        expect.objectContaining({ label: "Expired Keys", value: "1" })
      ])
    );
    expect(overview.ownerSummary[0]).toEqual(expect.objectContaining({ owner: "ops.lead", count: 2 }));
  });

  it("builds key metadata with localized templates and fallbacks", () => {
    const key = normalizeAdminAPIKeysPayload({
      total: 1,
      items: [
        {
          id: 11,
          user_id: 7,
          created_by: 1,
          owner_username: "",
          name: "CLI Key",
          purpose: "",
          prefix: "",
          scopes: [],
          status: "active",
          created_at: "",
          updated_at: "",
          last_used_at: ""
        }
      ]
    }).items[0];

    expect(buildKeyMeta(key, "en", apiKeyMessages)).toEqual([
      "prefix n/a",
      "created n/a",
      "updated n/a",
      "last used n/a"
    ]);
  });
});
