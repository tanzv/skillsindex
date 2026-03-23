import { describe, expect, it } from "vitest";

import {
  buildIntegrationsOverview,
  isSuccessfulIntegrationOutcome,
  normalizeAdminIntegrationsPayload,
  resolveSelectedIntegrationConnector
} from "@/src/features/adminGovernance/integrationsModel";

describe("admin integrations model", () => {
  it("treats success and delivered outcomes as healthy deliveries", () => {
    const payload = normalizeAdminIntegrationsPayload({
      total: 1,
      items: [
        {
          id: 21,
          name: "GitHub App",
          provider: "github",
          description: "Repository sync",
          base_url: "https://api.github.com",
          enabled: true,
          updated_at: "2026-03-12T08:00:00Z"
        }
      ],
      webhook_logs: [
        {
          id: 41,
          connector_id: 21,
          event_type: "repository.sync.completed",
          outcome: "success",
          status_code: 200,
          endpoint: "https://example.test/hooks/github",
          delivered_at: "2026-03-12T10:00:00Z"
        },
        {
          id: 42,
          connector_id: 21,
          event_type: "repository.sync.delivered",
          outcome: "delivered",
          status_code: 200,
          endpoint: "https://example.test/hooks/github",
          delivered_at: "2026-03-12T11:00:00Z"
        }
      ],
      webhook_total: 2
    });

    const overview = buildIntegrationsOverview(payload);

    expect(isSuccessfulIntegrationOutcome("success")).toBe(true);
    expect(isSuccessfulIntegrationOutcome("delivered")).toBe(true);
    expect(overview.failedDeliveryCount).toBe(0);
    expect(overview.metrics).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: "Failed Deliveries", value: "0" })])
    );
  });

  it("resolves connector details independently from missing ids", () => {
    const selectedConnector = resolveSelectedIntegrationConnector(
      [
        {
          id: 21,
          name: "GitHub App",
          provider: "github",
          description: "Repository sync",
          baseUrl: "https://api.github.com",
          enabled: true,
          updatedAt: "2026-03-12T08:00:00Z"
        }
      ],
      21
    );

    expect(selectedConnector?.name).toBe("GitHub App");
    expect(resolveSelectedIntegrationConnector(selectedConnector ? [selectedConnector] : [], 0)).toBeNull();
    expect(resolveSelectedIntegrationConnector(selectedConnector ? [selectedConnector] : [], 999)).toBeNull();
  });
});
