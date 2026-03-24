export interface AdminIntegrationsMessages {
  pageTitle: string;
  pageDescription: string;
  clearSelection: string;
  searchLabel: string;
  searchPlaceholder: string;
  connectorSelectionLabel: string;
  connectorSelectionAll: string;
  reloadAction: string;
  connectorInventoryTitle: string;
  connectorInventoryDescription: string;
  openConnectorDetailAction: string;
  closePanelAction: string;
  connectorDetailDescription: string;
  emptyFilteredConnectors: string;
  enabledLabel: string;
  disabledLabel: string;
  webhookLedgerTitle: string;
  webhookLedgerDescription: string;
  ledgerNeedsAttention: string;
  ledgerHealthy: string;
  emptyWebhookLedger: string;
  deliveryStatusTemplate: string;
  providerSpreadTitle: string;
  providerSpreadDescription: string;
  operationsSnapshotTitle: string;
  operationsSnapshotDescription: string;
  latestDeliveryLabel: string;
  connectorSelectionSummaryLabel: string;
  unknownConnector: string;
  noConnectorSelected: string;
  connectorProviderLabel: string;
  connectorBaseUrlLabel: string;
  connectorUpdatedLabel: string;
  connectorDescriptionLabel: string;
  authProviderInventoryTitle: string;
  authProviderInventoryDescription: string;
  authProviderConfigureAction: string;
  authProviderEditAction: string;
  authProviderDisableAction: string;
  authProviderConnectedLabel: string;
  authProviderDisconnectedLabel: string;
  authProviderAvailableLabel: string;
  authProviderUnavailableLabel: string;
  authProviderFormDescription: string;
  authProviderFormNameLabel: string;
  authProviderFormDescriptionLabel: string;
  authProviderFormIssuerLabel: string;
  authProviderFormAuthorizationUrlLabel: string;
  authProviderFormTokenUrlLabel: string;
  authProviderFormUserInfoUrlLabel: string;
  authProviderFormClientIdLabel: string;
  authProviderFormClientSecretLabel: string;
  authProviderFormScopeLabel: string;
  authProviderFormClaimExternalIdLabel: string;
  authProviderFormClaimUsernameLabel: string;
  authProviderFormClaimEmailLabel: string;
  authProviderFormClaimEmailVerifiedLabel: string;
  authProviderFormClaimGroupsLabel: string;
  authProviderFormOffboardingModeLabel: string;
  authProviderFormMappingModeLabel: string;
  authProviderFormDefaultOrgIdLabel: string;
  authProviderFormDefaultOrgRoleLabel: string;
  authProviderFormDefaultOrgGroupRulesLabel: string;
  authProviderFormDefaultOrgEmailDomainsLabel: string;
  authProviderFormDefaultUserRoleLabel: string;
  authProviderSaveAction: string;
  authProviderSavingAction: string;
  loadError: string;
  metricTotalConnectors: string;
  metricEnabledConnectors: string;
  metricWebhookDeliveries: string;
  metricFailedDeliveries: string;
  unnamedConnector: string;
  customProvider: string;
  noConnectorDescription: string;
  unknownEvent: string;
  unknownOutcome: string;
  outcomeSuccess: string;
  outcomeFailed: string;
  outcomeError: string;
  outcomePending: string;
  notAvailable: string;
}

export const adminIntegrationsMessageKeyMap = {
  pageTitle: "admin_integrations_page_title",
  pageDescription: "admin_integrations_page_description",
  clearSelection: "admin_integrations_clear_selection",
  searchLabel: "admin_integrations_search_label",
  searchPlaceholder: "admin_integrations_search_placeholder",
  connectorSelectionLabel: "admin_integrations_connector_selection_label",
  connectorSelectionAll: "admin_integrations_connector_selection_all",
  reloadAction: "admin_integrations_reload_action",
  connectorInventoryTitle: "admin_integrations_connector_inventory_title",
  connectorInventoryDescription: "admin_integrations_connector_inventory_description",
  openConnectorDetailAction: "admin_integrations_open_connector_detail_action",
  closePanelAction: "admin_integrations_close_panel_action",
  connectorDetailDescription: "admin_integrations_connector_detail_description",
  emptyFilteredConnectors: "admin_integrations_empty_filtered_connectors",
  enabledLabel: "admin_integrations_enabled_label",
  disabledLabel: "admin_integrations_disabled_label",
  webhookLedgerTitle: "admin_integrations_webhook_ledger_title",
  webhookLedgerDescription: "admin_integrations_webhook_ledger_description",
  ledgerNeedsAttention: "admin_integrations_ledger_needs_attention",
  ledgerHealthy: "admin_integrations_ledger_healthy",
  emptyWebhookLedger: "admin_integrations_empty_webhook_ledger",
  deliveryStatusTemplate: "admin_integrations_delivery_status_template",
  providerSpreadTitle: "admin_integrations_provider_spread_title",
  providerSpreadDescription: "admin_integrations_provider_spread_description",
  operationsSnapshotTitle: "admin_integrations_operations_snapshot_title",
  operationsSnapshotDescription: "admin_integrations_operations_snapshot_description",
  latestDeliveryLabel: "admin_integrations_latest_delivery_label",
  connectorSelectionSummaryLabel: "admin_integrations_connector_selection_summary_label",
  unknownConnector: "admin_integrations_unknown_connector",
  noConnectorSelected: "admin_integrations_no_connector_selected",
  connectorProviderLabel: "admin_integrations_connector_provider_label",
  connectorBaseUrlLabel: "admin_integrations_connector_base_url_label",
  connectorUpdatedLabel: "admin_integrations_connector_updated_label",
  connectorDescriptionLabel: "admin_integrations_connector_description_label",
  authProviderInventoryTitle: "admin_integrations_auth_provider_inventory_title",
  authProviderInventoryDescription: "admin_integrations_auth_provider_inventory_description",
  authProviderConfigureAction: "admin_integrations_auth_provider_configure_action",
  authProviderEditAction: "admin_integrations_auth_provider_edit_action",
  authProviderDisableAction: "admin_integrations_auth_provider_disable_action",
  authProviderConnectedLabel: "admin_integrations_auth_provider_connected_label",
  authProviderDisconnectedLabel: "admin_integrations_auth_provider_disconnected_label",
  authProviderAvailableLabel: "admin_integrations_auth_provider_available_label",
  authProviderUnavailableLabel: "admin_integrations_auth_provider_unavailable_label",
  authProviderFormDescription: "admin_integrations_auth_provider_form_description",
  authProviderFormNameLabel: "admin_integrations_auth_provider_form_name_label",
  authProviderFormDescriptionLabel: "admin_integrations_auth_provider_form_description_label",
  authProviderFormIssuerLabel: "admin_integrations_auth_provider_form_issuer_label",
  authProviderFormAuthorizationUrlLabel: "admin_integrations_auth_provider_form_authorization_url_label",
  authProviderFormTokenUrlLabel: "admin_integrations_auth_provider_form_token_url_label",
  authProviderFormUserInfoUrlLabel: "admin_integrations_auth_provider_form_userinfo_url_label",
  authProviderFormClientIdLabel: "admin_integrations_auth_provider_form_client_id_label",
  authProviderFormClientSecretLabel: "admin_integrations_auth_provider_form_client_secret_label",
  authProviderFormScopeLabel: "admin_integrations_auth_provider_form_scope_label",
  authProviderFormClaimExternalIdLabel: "admin_integrations_auth_provider_form_claim_external_id_label",
  authProviderFormClaimUsernameLabel: "admin_integrations_auth_provider_form_claim_username_label",
  authProviderFormClaimEmailLabel: "admin_integrations_auth_provider_form_claim_email_label",
  authProviderFormClaimEmailVerifiedLabel: "admin_integrations_auth_provider_form_claim_email_verified_label",
  authProviderFormClaimGroupsLabel: "admin_integrations_auth_provider_form_claim_groups_label",
  authProviderFormOffboardingModeLabel: "admin_integrations_auth_provider_form_offboarding_mode_label",
  authProviderFormMappingModeLabel: "admin_integrations_auth_provider_form_mapping_mode_label",
  authProviderFormDefaultOrgIdLabel: "admin_integrations_auth_provider_form_default_org_id_label",
  authProviderFormDefaultOrgRoleLabel: "admin_integrations_auth_provider_form_default_org_role_label",
  authProviderFormDefaultOrgGroupRulesLabel: "admin_integrations_auth_provider_form_default_org_group_rules_label",
  authProviderFormDefaultOrgEmailDomainsLabel: "admin_integrations_auth_provider_form_default_org_email_domains_label",
  authProviderFormDefaultUserRoleLabel: "admin_integrations_auth_provider_form_default_user_role_label",
  authProviderSaveAction: "admin_integrations_auth_provider_save_action",
  authProviderSavingAction: "admin_integrations_auth_provider_saving_action",
  loadError: "admin_integrations_load_error",
  metricTotalConnectors: "admin_integrations_metric_total_connectors",
  metricEnabledConnectors: "admin_integrations_metric_enabled_connectors",
  metricWebhookDeliveries: "admin_integrations_metric_webhook_deliveries",
  metricFailedDeliveries: "admin_integrations_metric_failed_deliveries",
  unnamedConnector: "admin_integrations_unnamed_connector",
  customProvider: "admin_integrations_custom_provider",
  noConnectorDescription: "admin_integrations_no_connector_description",
  unknownEvent: "admin_integrations_unknown_event",
  unknownOutcome: "admin_integrations_unknown_outcome",
  outcomeSuccess: "admin_integrations_outcome_success",
  outcomeFailed: "admin_integrations_outcome_failed",
  outcomeError: "admin_integrations_outcome_error",
  outcomePending: "admin_integrations_outcome_pending",
  notAvailable: "admin_integrations_not_available"
} as const satisfies { [K in keyof AdminIntegrationsMessages]: string };

export const adminIntegrationsMessageFallbacks = {
  pageTitle: "Integrations",
  pageDescription: "Review connector coverage, webhook delivery health, and provider spread from a dedicated governance surface.",
  clearSelection: "Clear Selection",
  searchLabel: "Search connectors",
  searchPlaceholder: "Search connectors",
  connectorSelectionLabel: "Connector selection",
  connectorSelectionAll: "All connectors",
  reloadAction: "Reload",
  connectorInventoryTitle: "Connector Inventory",
  connectorInventoryDescription: "Filter by provider or connector name, then inspect telemetry for the active connector.",
  openConnectorDetailAction: "Open Details",
  closePanelAction: "Close Panel",
  connectorDetailDescription: "Inspect connector metadata without leaving the governance workspace.",
  emptyFilteredConnectors: "No connectors match the current filters.",
  enabledLabel: "enabled",
  disabledLabel: "disabled",
  webhookLedgerTitle: "Webhook Delivery Ledger",
  webhookLedgerDescription: "Recent delivery attempts scoped to the active connector selection.",
  ledgerNeedsAttention: "Needs attention",
  ledgerHealthy: "Healthy",
  emptyWebhookLedger: "No webhook deliveries recorded.",
  deliveryStatusTemplate: "Status {value}",
  providerSpreadTitle: "Provider Spread",
  providerSpreadDescription: "Current provider concentration across connector inventory.",
  operationsSnapshotTitle: "Operations Snapshot",
  operationsSnapshotDescription: "Quick audit indicators for connector governance.",
  latestDeliveryLabel: "Latest delivery",
  connectorSelectionSummaryLabel: "Connector selection",
  unknownConnector: "Unknown connector",
  noConnectorSelected: "No connector selected",
  connectorProviderLabel: "Provider",
  connectorBaseUrlLabel: "Base URL",
  connectorUpdatedLabel: "Updated",
  connectorDescriptionLabel: "Description",
  authProviderInventoryTitle: "Identity Provider Inventory",
  authProviderInventoryDescription: "Configure third-party sign-in providers from one shared control surface.",
  authProviderConfigureAction: "Configure",
  authProviderEditAction: "Edit",
  authProviderDisableAction: "Disable",
  authProviderConnectedLabel: "Connected",
  authProviderDisconnectedLabel: "Not Connected",
  authProviderAvailableLabel: "Live",
  authProviderUnavailableLabel: "Unavailable",
  authProviderFormDescription: "Manage issuer endpoints, client credentials, and user mapping defaults for the selected provider.",
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
} as const satisfies AdminIntegrationsMessages;
