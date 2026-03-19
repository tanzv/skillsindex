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
