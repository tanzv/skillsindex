import { asArray, asBoolean, asNumber, asObject, asString, formatDateTime } from "./shared";

export interface IntegrationConnector {
  id: number;
  name: string;
  provider: string;
  description: string;
  baseUrl: string;
  enabled: boolean;
  updatedAt: string;
}

export interface WebhookLog {
  id: number;
  connectorId: number;
  eventType: string;
  outcome: string;
  statusCode: number;
  endpoint: string;
  deliveredAt: string;
}

export interface AdminIntegrationsPayload {
  total: number;
  items: IntegrationConnector[];
  webhookLogs: WebhookLog[];
  webhookTotal: number;
}

export interface IntegrationsOverview {
  metrics: Array<{ label: string; value: string }>;
  providerSummary: Array<{ provider: string; count: number }>;
  latestDeliveryAt: string;
  failedDeliveryCount: number;
}

export function normalizeAdminIntegrationsPayload(payload: unknown): AdminIntegrationsPayload {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);
  const webhookLogs = asArray<Record<string, unknown>>(record.webhook_logs);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      id: asNumber(item.id),
      name: asString(item.name) || "Unnamed connector",
      provider: asString(item.provider) || "custom",
      description: asString(item.description) || "No connector description",
      baseUrl: asString(item.base_url) || "n/a",
      enabled: asBoolean(item.enabled),
      updatedAt: asString(item.updated_at)
    })),
    webhookLogs: webhookLogs.map((item) => ({
      id: asNumber(item.id),
      connectorId: asNumber(item.connector_id),
      eventType: asString(item.event_type) || "unknown",
      outcome: asString(item.outcome) || "unknown",
      statusCode: asNumber(item.status_code),
      endpoint: asString(item.endpoint) || "n/a",
      deliveredAt: asString(item.delivered_at)
    })),
    webhookTotal: asNumber(record.webhook_total) || webhookLogs.length
  };
}

export function buildIntegrationsOverview(payload: AdminIntegrationsPayload): IntegrationsOverview {
  const enabledCount = payload.items.filter((item) => item.enabled).length;
  const failedDeliveryCount = payload.webhookLogs.filter(
    (item) => item.statusCode >= 400 || item.outcome.toLowerCase() !== "ok"
  ).length;
  const providerMap = payload.items.reduce<Map<string, number>>((accumulator, item) => {
    const provider = item.provider || "custom";
    accumulator.set(provider, (accumulator.get(provider) || 0) + 1);
    return accumulator;
  }, new Map<string, number>());
  const latestTimestamp = payload.webhookLogs.reduce((current, item) => {
    const candidate = Date.parse(item.deliveredAt);
    if (!Number.isFinite(candidate)) {
      return current;
    }
    return Math.max(current, candidate);
  }, 0);

  return {
    metrics: [
      { label: "Total Connectors", value: String(payload.total) },
      { label: "Enabled Connectors", value: String(enabledCount) },
      { label: "Webhook Deliveries", value: String(payload.webhookTotal) },
      { label: "Failed Deliveries", value: String(failedDeliveryCount) }
    ],
    providerSummary: Array.from(providerMap.entries())
      .map(([provider, count]) => ({ provider, count }))
      .sort((left, right) => right.count - left.count || left.provider.localeCompare(right.provider)),
    latestDeliveryAt: latestTimestamp ? formatDateTime(new Date(latestTimestamp).toISOString()) : "n/a",
    failedDeliveryCount
  };
}
