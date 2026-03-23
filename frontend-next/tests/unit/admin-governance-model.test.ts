import { describe, expect, it } from "vitest";

import {
  buildIntegrationsOverview,
  normalizeAdminIntegrationsPayload,
  resolveIntegrationOutcomeLabel
} from "@/src/features/adminGovernance/integrationsModel";
import {
  buildOrganizationsOverview,
  normalizeOrganizationMembersPayload,
  normalizeOrganizationsPayload,
  resolveSelectedOrganizationMember
} from "@/src/features/adminGovernance/organizationsModel";

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

  it("applies injected integration fallback and metric messages", () => {
    const payload = normalizeAdminIntegrationsPayload(
      {
        total: 1,
        items: [{ id: 4, name: "", provider: "", description: "", base_url: "", enabled: false, updated_at: "" }],
        webhook_logs: [{ id: 5, connector_id: 4, event_type: "", outcome: "", status_code: 0, endpoint: "", delivered_at: "" }],
        webhook_total: 1
      },
      {
        fallbackUnnamedConnector: "connector_name_custom",
        fallbackCustomProvider: "connector_provider_custom",
        fallbackConnectorDescription: "connector_description_custom",
        valueUnknown: "connector_unknown_custom",
        valueNotAvailable: "connector_not_available_custom"
      }
    );

    const overview = buildIntegrationsOverview(payload, {
      metricTotalConnectors: "metric_total_custom",
      metricEnabledConnectors: "metric_enabled_custom",
      metricWebhookDeliveries: "metric_webhook_custom",
      metricFailedDeliveries: "metric_failed_custom",
      valueNotAvailable: "connector_not_available_custom"
    });

    expect(payload.items[0]?.name).toBe("connector_name_custom");
    expect(payload.items[0]?.provider).toBe("connector_provider_custom");
    expect(payload.webhookLogs[0]?.outcome).toBe("connector_unknown_custom");
    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "metric_total_custom", value: "1" }),
        expect.objectContaining({ label: "metric_failed_custom", value: "0" })
      ])
    );
    expect(overview.latestDeliveryAt).toBe("connector_not_available_custom");
  });

  it("keeps integration overview stable when no connectors are loaded", () => {
    const payload = normalizeAdminIntegrationsPayload({
      total: 0,
      items: [],
      webhook_logs: [],
      webhook_total: 0
    });

    const overview = buildIntegrationsOverview(payload, {
      metricTotalConnectors: "metric_total_custom",
      metricEnabledConnectors: "metric_enabled_custom",
      metricWebhookDeliveries: "metric_webhook_custom",
      metricFailedDeliveries: "metric_failed_custom",
      valueNotAvailable: "connector_not_available_custom"
    });

    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "metric_total_custom", value: "0" }),
        expect.objectContaining({ label: "metric_webhook_custom", value: "0" })
      ])
    );
    expect(overview.providerSummary).toEqual([]);
    expect(overview.latestDeliveryAt).toBe("connector_not_available_custom");
    expect(overview.failedDeliveryCount).toBe(0);
  });

  it("maps webhook outcomes to localized display labels", () => {
    expect(
      resolveIntegrationOutcomeLabel("ok", {
        outcomeSuccess: "outcome_success_custom"
      })
    ).toBe("outcome_success_custom");
    expect(
      resolveIntegrationOutcomeLabel("failed", {
        outcomeFailed: "outcome_failed_custom"
      })
    ).toBe("outcome_failed_custom");
    expect(
      resolveIntegrationOutcomeLabel("error", {
        outcomeError: "outcome_error_custom"
      })
    ).toBe("outcome_error_custom");
    expect(
      resolveIntegrationOutcomeLabel("pending", {
        outcomePending: "outcome_pending_custom"
      })
    ).toBe("outcome_pending_custom");
    expect(
      resolveIntegrationOutcomeLabel("", {
        unknownOutcome: "outcome_unknown_custom"
      })
    ).toBe("outcome_unknown_custom");
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

  it("applies injected organization normalization fallbacks", () => {
    const organizations = normalizeOrganizationsPayload(
      {
        total: 1,
        items: [{ id: 41, name: "", slug: "", created_at: "", updated_at: "" }]
      },
      {
        valueUntitledOrganization: "org_title_custom",
        valueNotAvailable: "value_not_available_custom",
        valueUnknownUser: "user_unknown_custom",
        valueUnknownStatus: "status_unknown_custom",
        defaultMemberRole: "role_member_custom"
      }
    );
    const members = normalizeOrganizationMembersPayload(
      {
        total: 1,
        items: [{ organization_id: 41, user_id: 0, username: "", user_role: "", user_status: "", role: "", created_at: "", updated_at: "" }]
      },
      {
        valueUntitledOrganization: "org_title_custom",
        valueNotAvailable: "value_not_available_custom",
        valueUnknownUser: "user_unknown_custom",
        valueUnknownStatus: "status_unknown_custom",
        defaultMemberRole: "role_member_custom"
      }
    );

    expect(organizations.items[0]).toEqual(
      expect.objectContaining({
        name: "org_title_custom",
        slug: "value_not_available_custom"
      })
    );
    expect(members.items[0]).toEqual(
      expect.objectContaining({
        username: "user_unknown_custom",
        userRole: "role_member_custom",
        userStatus: "status_unknown_custom",
        role: "role_member_custom"
      })
    );
  });

  it("resolves the selected organization member by user id", () => {
    const selectedMember = resolveSelectedOrganizationMember(
      [
        {
          organizationId: 7,
          userId: 11,
          username: "owner",
          userRole: "admin",
          userStatus: "active",
          role: "owner",
          createdAt: "2026-03-01T08:00:00Z",
          updatedAt: "2026-03-12T08:00:00Z"
        }
      ],
      11
    );

    expect(selectedMember).toEqual(
      expect.objectContaining({
        userId: 11,
        username: "owner"
      })
    );
    expect(resolveSelectedOrganizationMember([], 11)).toBeNull();
    expect(resolveSelectedOrganizationMember([], null)).toBeNull();
  });
});
