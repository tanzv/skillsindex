import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { AdminIntegrationsContent } from "@/src/features/adminGovernance/AdminIntegrationsContent";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function createMessages() {
  return createProtectedPageTestMessages({
    adminCommon: {
      adminEyebrow: "Admin",
      refresh: "Refresh",
      refreshing: "Refreshing..."
    },
    adminIntegrations: {
      pageTitle: "Integrations",
      pageDescription: "Governance workspace",
      clearSelection: "Clear Selection",
      searchLabel: "Search connectors",
      searchPlaceholder: "Search connectors",
      connectorSelectionLabel: "Connector selection",
      connectorSelectionAll: "All connectors",
      reloadAction: "Reload",
      connectorInventoryTitle: "Connector Inventory",
      connectorInventoryDescription: "Inventory description",
      openConnectorDetailAction: "Open Details",
      closePanelAction: "Close Panel",
      connectorDetailDescription: "Inspect connector metadata without leaving the governance workspace.",
      emptyFilteredConnectors: "No connectors match the current filters.",
      enabledLabel: "enabled",
      disabledLabel: "disabled",
      webhookLedgerTitle: "Webhook Delivery Ledger",
      webhookLedgerDescription: "Ledger description",
      ledgerNeedsAttention: "Needs attention",
      ledgerHealthy: "Healthy",
      emptyWebhookLedger: "No webhook deliveries recorded.",
      deliveryStatusTemplate: "Status {value}",
      providerSpreadTitle: "Provider Spread",
      providerSpreadDescription: "Provider summary",
      operationsSnapshotTitle: "Operations Snapshot",
      operationsSnapshotDescription: "Snapshot description",
      latestDeliveryLabel: "Latest delivery",
      connectorSelectionSummaryLabel: "Connector selection",
      unknownConnector: "Unknown connector",
      noConnectorSelected: "No connector selected",
      connectorProviderLabel: "Provider",
      connectorBaseUrlLabel: "Base URL",
      connectorUpdatedLabel: "Updated",
      connectorDescriptionLabel: "Description",
      authProviderInventoryTitle: "Identity Provider Inventory",
      authProviderInventoryDescription: "Identity provider summary",
      authProviderConfigureAction: "Configure",
      authProviderEditAction: "Edit",
      authProviderDisableAction: "Disable",
      authProviderConnectedLabel: "Connected",
      authProviderDisconnectedLabel: "Not Connected",
      authProviderAvailableLabel: "Live",
      authProviderUnavailableLabel: "Unavailable",
      authProviderFormDescription: "Manage provider settings",
      authProviderFormNameLabel: "Display Name",
      authProviderFormDescriptionLabel: "Provider Description",
      authProviderFormIssuerLabel: "Issuer",
      authProviderFormAuthorizationUrlLabel: "Authorization URL",
      authProviderFormTokenUrlLabel: "Token URL",
      authProviderFormUserInfoUrlLabel: "Userinfo URL",
      authProviderFormClientIdLabel: "Client ID",
      authProviderFormClientSecretLabel: "Client Secret",
      authProviderFormScopeLabel: "Scope",
      authProviderFormClaimExternalIdLabel: "External ID Claim",
      authProviderFormClaimUsernameLabel: "Username Claim",
      authProviderFormClaimEmailLabel: "Email Claim",
      authProviderFormClaimEmailVerifiedLabel: "Email Verified Claim",
      authProviderFormClaimGroupsLabel: "Groups Claim",
      authProviderFormOffboardingModeLabel: "Offboarding Mode",
      authProviderFormMappingModeLabel: "Mapping Mode",
      authProviderFormDefaultOrgIdLabel: "Default Organization ID",
      authProviderFormDefaultOrgRoleLabel: "Default Organization Role",
      authProviderFormDefaultOrgGroupRulesLabel: "Default Organization Group Rules",
      authProviderFormDefaultOrgEmailDomainsLabel: "Default Organization Email Domains",
      authProviderFormDefaultUserRoleLabel: "Default User Role",
      authProviderSaveAction: "Save Provider",
      authProviderSavingAction: "Saving Provider...",
      loadError: "Failed to load integrations.",
      metricTotalConnectors: "Total Connectors",
      metricEnabledConnectors: "Enabled Connectors",
      metricWebhookDeliveries: "Webhook Deliveries",
      metricFailedDeliveries: "Failed Deliveries",
      unnamedConnector: "Unnamed connector",
      customProvider: "custom",
      noConnectorDescription: "No connector description",
      unknownEvent: "unknown",
      unknownOutcome: "unknown",
      outcomeSuccess: "Delivered",
      outcomeFailed: "Failed",
      outcomeError: "Error",
      outcomePending: "Pending",
      notAvailable: "n/a"
    }
  });
}

function renderIntegrationsContent() {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      { locale: "en", messages: createMessages() },
      createElement(AdminIntegrationsContent, {
        loading: false,
        error: "",
        search: "",
        connectorFilterId: 21,
        allConnectors: [
          {
            id: 21,
            name: "GitHub App",
            provider: "github",
            description: "Repository sync connector",
            baseUrl: "https://api.github.com",
            enabled: true,
            updatedAt: "2026-03-12T08:00:00Z"
          },
          {
            id: 22,
            name: "Ops Webhook",
            provider: "custom",
            description: "Ops alert relay",
            baseUrl: "https://ops.example.test",
            enabled: false,
            updatedAt: "2026-03-12T09:00:00Z"
          }
        ],
        filteredConnectors: [
          {
            id: 21,
            name: "GitHub App",
            provider: "github",
            description: "Repository sync connector",
            baseUrl: "https://api.github.com",
            enabled: true,
            updatedAt: "2026-03-12T08:00:00Z"
          }
        ],
        filteredLogs: [
          {
            id: 41,
            connectorId: 21,
            eventType: "repository.sync.completed",
            outcome: "success",
            statusCode: 200,
            endpoint: "https://example.test/hooks/github",
            deliveredAt: "2026-03-12T10:00:00Z"
          }
        ],
        detailConnector: {
          id: 21,
          name: "GitHub App",
          provider: "github",
          description: "Repository sync connector",
          baseUrl: "https://api.github.com",
          enabled: true,
          updatedAt: "2026-03-12T08:00:00Z"
        },
        detailPaneOpen: true,
        authProviderItems: [
          {
            key: "feishu",
            displayName: "Feishu Workspace",
            managementKind: "oidc",
            configurable: true,
            enabled: true,
            connected: true,
            available: true,
            startPath: "/auth/sso/start/feishu",
            connectorId: 41,
            description: "Primary workspace provider",
            baseUrl: "https://open.feishu.test",
            updatedAt: "2026-03-12T11:00:00Z"
          }
        ],
        authProviderLoading: false,
        authProviderError: "",
        authProviderDraft: {
          provider: "feishu",
          name: "Feishu Workspace",
          description: "Primary workspace provider",
          issuer: "https://open.feishu.test",
          authorizationUrl: "https://open.feishu.test/oauth/authorize",
          tokenUrl: "https://open.feishu.test/oauth/token",
          userInfoUrl: "https://open.feishu.test/oauth/userinfo",
          clientId: "client-feishu",
          clientSecret: "secret-feishu",
          scope: "openid profile email",
          claimExternalId: "sub",
          claimUsername: "preferred_username",
          claimEmail: "email",
          claimEmailVerified: "email_verified",
          claimGroups: "groups",
          offboardingMode: "disable_only",
          mappingMode: "external_email_username",
          defaultOrgId: "0",
          defaultOrgRole: "member",
          defaultOrgGroupRules: "[]",
          defaultOrgEmailDomains: "example.com",
          defaultUserRole: "member"
        },
        authProviderPaneOpen: true,
        authProviderDisplayName: "Feishu Workspace",
        authProviderBusy: false,
        authProviderBusyKey: null,
        overview: {
          metrics: [
            { label: "Total Connectors", value: "2" },
            { label: "Failed Deliveries", value: "0" }
          ],
          providerSummary: [{ provider: "github", count: 1 }],
          latestDeliveryAt: "Mar 12, 2026, 10:00",
          failedDeliveryCount: 0
        },
        selectedConnectorName: "GitHub App",
        onRefresh: () => undefined,
        onAuthProviderReload: () => undefined,
        onClearSelection: () => undefined,
        onSearchChange: () => undefined,
        onConnectorFilterChange: () => undefined,
        onToggleConnectorFilter: () => undefined,
        onOpenConnectorDetail: () => undefined,
        onCloseDetailPane: () => undefined,
        onOpenAuthProvider: () => undefined,
        onCloseAuthProviderPane: () => undefined,
        onAuthProviderDraftChange: () => undefined,
        onAuthProviderSubmit: () => undefined,
        onAuthProviderDisable: () => undefined
      })
    )
  );
}

describe("admin integrations content", () => {
  it("keeps detail pane copy available in the protected message scaffold", () => {
    const messages = createProtectedPageTestMessages({
      adminIntegrations: {
        openConnectorDetailAction: "Open Details",
        closePanelAction: "Close Panel",
        connectorDetailDescription: "Inspect connector metadata without leaving the governance workspace.",
        connectorProviderLabel: "Provider"
      }
    });

    expect(messages.adminIntegrations.searchLabel).toBe("searchLabel");
    expect(messages.adminIntegrations.openConnectorDetailAction).toBe("Open Details");
    expect(messages.adminIntegrations.closePanelAction).toBe("Close Panel");
    expect(messages.adminIntegrations.connectorDetailDescription).toBe(
      "Inspect connector metadata without leaving the governance workspace."
    );
    expect(messages.adminIntegrations.connectorProviderLabel).toBe("Provider");
  });

  it("renders inline connector detail pane without dropping inventory actions", () => {
    const markup = renderIntegrationsContent();

    expect(markup).toContain("Connector Inventory");
    expect(markup).toContain("Identity Provider Inventory");
    expect(markup).toContain("Open Details");
    expect(markup).toContain('data-testid="admin-integrations-detail-pane"');
    expect(markup).toContain('data-testid="admin-auth-provider-detail-pane"');
    expect(markup).toContain("Close Panel");
    expect(markup).toContain("GitHub App");
    expect(markup).toContain("Feishu Workspace");
    expect(markup).toContain("Provider: github");
    expect(markup).toContain("Base URL: https://api.github.com");
    expect(markup).toContain("Description");
    expect(markup).not.toContain('role="dialog"');
  });
});
