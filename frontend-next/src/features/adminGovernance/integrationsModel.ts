import {
  adminIntegrationsMessageFallbacks,
  type AdminIntegrationsMessages
} from "@/src/lib/i18n/protectedPageMessages.integrations";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";

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

type AdminIntegrationsModelMessages = Pick<
  AdminIntegrationsMessages,
  | "unnamedConnector"
  | "customProvider"
  | "noConnectorDescription"
  | "unknownEvent"
  | "unknownOutcome"
  | "outcomeSuccess"
  | "outcomeFailed"
  | "outcomeError"
  | "outcomePending"
  | "notAvailable"
  | "metricTotalConnectors"
  | "metricEnabledConnectors"
  | "metricWebhookDeliveries"
  | "metricFailedDeliveries"
>;

type LegacyAdminIntegrationsModelMessages = {
  fallbackUnnamedConnector?: string;
  fallbackCustomProvider?: string;
  fallbackConnectorDescription?: string;
  valueUnknown?: string;
  valueNotAvailable?: string;
};

type AdminIntegrationsModelMessageOverrides = Partial<AdminIntegrationsModelMessages> & LegacyAdminIntegrationsModelMessages;

function resolveMessages(messages?: AdminIntegrationsModelMessageOverrides): AdminIntegrationsModelMessages {
  return {
    unnamedConnector: messages?.unnamedConnector || messages?.fallbackUnnamedConnector || adminIntegrationsMessageFallbacks.unnamedConnector,
    customProvider: messages?.customProvider || messages?.fallbackCustomProvider || adminIntegrationsMessageFallbacks.customProvider,
    noConnectorDescription:
      messages?.noConnectorDescription || messages?.fallbackConnectorDescription || adminIntegrationsMessageFallbacks.noConnectorDescription,
    unknownEvent: messages?.unknownEvent || messages?.valueUnknown || adminIntegrationsMessageFallbacks.unknownEvent,
    unknownOutcome: messages?.unknownOutcome || messages?.valueUnknown || adminIntegrationsMessageFallbacks.unknownOutcome,
    outcomeSuccess: messages?.outcomeSuccess || adminIntegrationsMessageFallbacks.outcomeSuccess,
    outcomeFailed: messages?.outcomeFailed || adminIntegrationsMessageFallbacks.outcomeFailed,
    outcomeError: messages?.outcomeError || adminIntegrationsMessageFallbacks.outcomeError,
    outcomePending: messages?.outcomePending || adminIntegrationsMessageFallbacks.outcomePending,
    notAvailable: messages?.notAvailable || messages?.valueNotAvailable || adminIntegrationsMessageFallbacks.notAvailable,
    metricTotalConnectors: messages?.metricTotalConnectors || adminIntegrationsMessageFallbacks.metricTotalConnectors,
    metricEnabledConnectors: messages?.metricEnabledConnectors || adminIntegrationsMessageFallbacks.metricEnabledConnectors,
    metricWebhookDeliveries: messages?.metricWebhookDeliveries || adminIntegrationsMessageFallbacks.metricWebhookDeliveries,
    metricFailedDeliveries: messages?.metricFailedDeliveries || adminIntegrationsMessageFallbacks.metricFailedDeliveries
  };
}

export function resolveIntegrationOutcomeLabel(
  outcome: string,
  messages?: AdminIntegrationsModelMessageOverrides
): string {
  const resolvedMessages = resolveMessages(messages);
  const normalizedOutcome = asString(outcome).toLowerCase();

  if (!normalizedOutcome || normalizedOutcome === "unknown") {
    return resolvedMessages.unknownOutcome;
  }
  if (normalizedOutcome === "ok" || normalizedOutcome === "success" || normalizedOutcome === "delivered") {
    return resolvedMessages.outcomeSuccess;
  }
  if (normalizedOutcome === "failed" || normalizedOutcome === "failure") {
    return resolvedMessages.outcomeFailed;
  }
  if (normalizedOutcome === "error") {
    return resolvedMessages.outcomeError;
  }
  if (normalizedOutcome === "pending" || normalizedOutcome === "queued") {
    return resolvedMessages.outcomePending;
  }

  return outcome;
}

export function normalizeAdminIntegrationsPayload(
  payload: unknown,
  messages?: AdminIntegrationsModelMessageOverrides
): AdminIntegrationsPayload {
  const resolvedMessages = resolveMessages(messages);
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);
  const webhookLogs = asArray<Record<string, unknown>>(record.webhook_logs);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      id: asNumber(item.id),
      name: asString(item.name) || resolvedMessages.unnamedConnector,
      provider: asString(item.provider) || resolvedMessages.customProvider,
      description: asString(item.description) || resolvedMessages.noConnectorDescription,
      baseUrl: asString(item.base_url) || resolvedMessages.notAvailable,
      enabled: asBoolean(item.enabled),
      updatedAt: asString(item.updated_at)
    })),
    webhookLogs: webhookLogs.map((item) => ({
      id: asNumber(item.id),
      connectorId: asNumber(item.connector_id),
      eventType: asString(item.event_type) || resolvedMessages.unknownEvent,
      outcome: asString(item.outcome) || resolvedMessages.unknownOutcome,
      statusCode: asNumber(item.status_code),
      endpoint: asString(item.endpoint) || resolvedMessages.notAvailable,
      deliveredAt: asString(item.delivered_at)
    })),
    webhookTotal: asNumber(record.webhook_total) || webhookLogs.length
  };
}

export function buildIntegrationsOverview(
  payload: AdminIntegrationsPayload,
  messages?: AdminIntegrationsModelMessageOverrides,
  locale: PublicLocale = "en"
): IntegrationsOverview {
  const resolvedMessages = resolveMessages(messages);
  const enabledCount = payload.items.filter((item) => item.enabled).length;
  const failedDeliveryCount = payload.webhookLogs.filter(
    (item) => item.statusCode >= 400 || (item.outcome || resolvedMessages.unknownOutcome).toLowerCase() !== "ok"
  ).length;
  const providerMap = payload.items.reduce<Map<string, number>>((accumulator, item) => {
    const provider = item.provider || resolvedMessages.customProvider;
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
      { label: resolvedMessages.metricTotalConnectors, value: String(payload.total) },
      { label: resolvedMessages.metricEnabledConnectors, value: String(enabledCount) },
      { label: resolvedMessages.metricWebhookDeliveries, value: String(payload.webhookTotal) },
      { label: resolvedMessages.metricFailedDeliveries, value: String(failedDeliveryCount) }
    ],
    providerSummary: Array.from(providerMap.entries())
      .map(([provider, count]) => ({ provider, count }))
      .sort((left, right) => right.count - left.count || left.provider.localeCompare(right.provider)),
    latestDeliveryAt: latestTimestamp
      ? formatDateTime(new Date(latestTimestamp).toISOString(), locale, resolvedMessages.notAvailable)
      : resolvedMessages.notAvailable,
    failedDeliveryCount
  };
}
