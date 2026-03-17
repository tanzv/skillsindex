import { describe, expect, it } from "vitest";

import { buildIntegrationsOverview, normalizeAdminIntegrationsPayload } from "@/src/features/adminGovernance/integrationsModel";
import {
  buildOrganizationsOverview,
  normalizeOrganizationMembersPayload,
  normalizeOrganizationsPayload
} from "@/src/features/adminGovernance/organizationsModel";
import { buildModerationOverview, normalizeModerationCasesPayload } from "@/src/features/adminGovernance/moderationModel";

describe("admin governance models", () => {
  it("builds integration metrics and provider spread", () => {
    const payload = normalizeAdminIntegrationsPayload({
      total: 2,
      items: [
        {
          id: 1,
          name: "GitHub sync",
          provider: "github",
          description: "Repository webhooks",
          base_url: "https://api.github.com",
          enabled: true,
          updated_at: "2026-03-12T08:00:00Z"
        },
        {
          id: 2,
          name: "Slack notices",
          provider: "slack",
          description: "Alert delivery",
          base_url: "https://hooks.slack.com",
          enabled: false,
          updated_at: "2026-03-12T09:00:00Z"
        }
      ],
      webhook_logs: [
        {
          id: 31,
          connector_id: 1,
          event_type: "skill.synced",
          outcome: "ok",
          status_code: 200,
          endpoint: "https://example.test/hooks/github",
          delivered_at: "2026-03-12T10:00:00Z"
        },
        {
          id: 32,
          connector_id: 2,
          event_type: "alert.failed",
          outcome: "failed",
          status_code: 500,
          endpoint: "https://example.test/hooks/slack",
          delivered_at: "2026-03-12T11:00:00Z"
        }
      ],
      webhook_total: 2
    });

    const overview = buildIntegrationsOverview(payload);

    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Enabled Connectors", value: "1" }),
        expect.objectContaining({ label: "Failed Deliveries", value: "1" })
      ])
    );
    expect(overview.providerSummary[0]).toEqual(expect.objectContaining({ provider: "github", count: 1 }));
  });

  it("builds organization metrics and role distribution", () => {
    const organizations = normalizeOrganizationsPayload({
      total: 1,
      items: [{ id: 7, name: "Platform Engineering", slug: "platform", created_at: "2026-03-01T08:00:00Z", updated_at: "2026-03-12T08:00:00Z" }]
    });
    const members = normalizeOrganizationMembersPayload({
      total: 2,
      items: [
        {
          organization_id: 7,
          user_id: 11,
          username: "owner",
          user_role: "admin",
          user_status: "active",
          role: "owner",
          created_at: "2026-03-01T08:00:00Z",
          updated_at: "2026-03-12T08:00:00Z"
        },
        {
          organization_id: 7,
          user_id: 12,
          username: "viewer",
          user_role: "member",
          user_status: "disabled",
          role: "viewer",
          created_at: "2026-03-01T08:00:00Z",
          updated_at: "2026-03-12T08:00:00Z"
        }
      ]
    });

    const overview = buildOrganizationsOverview(organizations, members, 7);

    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Organizations", value: "1" }),
        expect.objectContaining({ label: "Active Members", value: "1" })
      ])
    );
    expect(overview.selectedOrganization?.name).toBe("Platform Engineering");
    expect(overview.roleDistribution).toEqual(
      expect.arrayContaining([expect.objectContaining({ role: "owner", count: 1 })])
    );
  });

  it("builds moderation metrics and reason summary", () => {
    const payload = normalizeModerationCasesPayload({
      total: 3,
      items: [
        {
          id: 101,
          reporter_user_id: 7,
          resolver_user_id: 0,
          target_type: "skill",
          skill_id: 88,
          comment_id: 0,
          reason_code: "abuse",
          reason_detail: "Abusive content",
          status: "open",
          action: "none",
          resolution_note: "",
          resolved_at: "",
          created_at: "2026-03-12T08:00:00Z",
          updated_at: "2026-03-12T08:10:00Z"
        },
        {
          id: 102,
          reporter_user_id: 8,
          resolver_user_id: 3,
          target_type: "comment",
          skill_id: 0,
          comment_id: 55,
          reason_code: "spam",
          reason_detail: "Repeated spam",
          status: "resolved",
          action: "hidden",
          resolution_note: "Hidden comment",
          resolved_at: "2026-03-12T09:00:00Z",
          created_at: "2026-03-12T08:20:00Z",
          updated_at: "2026-03-12T09:00:00Z"
        },
        {
          id: 103,
          reporter_user_id: 9,
          resolver_user_id: 4,
          target_type: "skill",
          skill_id: 89,
          comment_id: 0,
          reason_code: "abuse",
          reason_detail: "Unsafe instruction",
          status: "rejected",
          action: "none",
          resolution_note: "",
          resolved_at: "2026-03-12T10:00:00Z",
          created_at: "2026-03-12T08:50:00Z",
          updated_at: "2026-03-12T10:00:00Z"
        }
      ]
    });

    const overview = buildModerationOverview(payload, 102);

    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Open Cases", value: "1" }),
        expect.objectContaining({ label: "Resolved Cases", value: "1" }),
        expect.objectContaining({ label: "Skill Targets", value: "2" })
      ])
    );
    expect(overview.selectedCase?.id).toBe(102);
    expect(overview.reasonSummary).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason: "abuse", count: 2 })])
    );
  });
});
