import { describe, expect, it } from "vitest";
import {
  buildAccountRoleWorkbenchFallback,
  buildIncidentWorkbenchFallback,
  buildIntegrationWorkbenchFallback
} from "./adminWorkbenchFallback";

describe("adminWorkbenchFallback", () => {
  it("returns integration fallback with providers for configuration mode", () => {
    const fallback = buildIntegrationWorkbenchFallback("integration_configuration_form");
    expect(fallback.integrations.items.length).toBeGreaterThan(0);
    expect(fallback.ssoProviders?.items?.length).toBeGreaterThan(0);
  });

  it("returns integration fallback without providers for non-configuration mode", () => {
    const fallback = buildIntegrationWorkbenchFallback("webhook_delivery_logs");
    expect(fallback.integrations.webhook_logs.length).toBeGreaterThan(0);
    expect(fallback.ssoProviders).toBeNull();
  });

  it("returns incident release timeline only for postmortem mode", () => {
    const postmortem = buildIncidentWorkbenchFallback("incident_postmortem_detail");
    const recovery = buildIncidentWorkbenchFallback("incident_recovery");
    expect(postmortem.releases?.items?.length).toBeGreaterThan(0);
    expect(recovery.releases).toBeNull();
  });

  it("returns auth providers only for account configuration mode", () => {
    const configuration = buildAccountRoleWorkbenchFallback("account_configuration_form");
    const roleList = buildAccountRoleWorkbenchFallback("role_management_list");
    expect(configuration.authProviders?.auth_providers?.length).toBeGreaterThan(0);
    expect(roleList.authProviders).toBeNull();
  });
});
