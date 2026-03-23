import {
  AdminEmptyBlock,
  AdminInsetBlock,
  AdminRecordCard,
  AdminSectionCard,
  AdminSelectableRecordCard
} from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import type { IntegrationConnector, IntegrationsOverview, WebhookLog } from "./integrationsModel";
import { isFailedIntegrationOutcome, isSuccessfulIntegrationOutcome, resolveIntegrationOutcomeLabel } from "./integrationsModel";
import { formatDateTime } from "./shared";

function renderOutcomeBadge(outcome: string, label: string, statusCode: number) {
  if (statusCode >= 400 || isFailedIntegrationOutcome(outcome)) {
    return (
      <Badge
        variant="outline"
        className="border-[color:var(--ui-danger-border)] bg-[color:var(--ui-danger-bg)] text-[color:var(--ui-danger-text)]"
      >
        {label}
      </Badge>
    );
  }
  if (isSuccessfulIntegrationOutcome(outcome)) {
    return <Badge variant="soft">{label}</Badge>;
  }
  return <Badge variant="outline">{label}</Badge>;
}

export function ConnectorInventoryPanel({
  loading,
  error,
  search,
  connectorFilterId,
  allConnectors,
  filteredConnectors,
  onSearchChange,
  onConnectorFilterChange,
  onReload,
  onToggleConnectorFilter,
  onOpenConnectorDetail
}: {
  loading: boolean;
  error: string;
  search: string;
  connectorFilterId: number;
  allConnectors: IntegrationConnector[];
  filteredConnectors: IntegrationConnector[];
  onSearchChange: (value: string) => void;
  onConnectorFilterChange: (connectorId: number) => void;
  onReload: () => void;
  onToggleConnectorFilter: (connectorId: number) => void;
  onOpenConnectorDetail: (connectorId: number) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const integrationMessages = messages.adminIntegrations;

  return (
    <AdminSectionCard
      title={integrationMessages.connectorInventoryTitle}
      description={integrationMessages.connectorInventoryDescription}
      contentClassName="space-y-4"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <Input
          aria-label={integrationMessages.searchLabel}
          value={search}
          placeholder={integrationMessages.searchPlaceholder}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <Select
          aria-label={integrationMessages.connectorSelectionLabel}
          value={connectorFilterId || ""}
          onChange={(event) => onConnectorFilterChange(event.target.value ? Number(event.target.value) : 0)}
        >
          <option value="">{integrationMessages.connectorSelectionAll}</option>
          {allConnectors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Button variant="outline" onClick={onReload} disabled={loading}>
          {integrationMessages.reloadAction}
        </Button>
      </div>

      {error ? <div className="text-sm text-[color:var(--ui-danger-text)]">{error}</div> : null}

      {filteredConnectors.length === 0 && !loading ? (
        <AdminEmptyBlock>{integrationMessages.emptyFilteredConnectors}</AdminEmptyBlock>
      ) : null}

      <div className="space-y-3">
        {filteredConnectors.map((item) => (
          <AdminSelectableRecordCard
            key={item.id}
            selected={connectorFilterId === item.id}
            data-testid={`integration-connector-${item.id}`}
            role="button"
            tabIndex={0}
            onClick={() => onToggleConnectorFilter(item.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onToggleConnectorFilter(item.id);
              }
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.name}</span>
                  <Badge variant={item.enabled ? "soft" : "outline"}>
                    {item.enabled ? integrationMessages.enabledLabel : integrationMessages.disabledLabel}
                  </Badge>
                </div>
                <p className="text-sm text-[color:var(--ui-text-secondary)]">{item.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ui-text-muted)]">
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">{item.provider}</span>
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">{item.baseUrl}</span>
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                    {formatDateTime(item.updatedAt, locale, integrationMessages.notAvailable)}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenConnectorDetail(item.id);
                }}
              >
                {integrationMessages.openConnectorDetailAction}
              </Button>
            </div>
          </AdminSelectableRecordCard>
        ))}
      </div>
    </AdminSectionCard>
  );
}

export function WebhookLedgerPanel({
  loading,
  failedDeliveryCount,
  logs
}: {
  loading: boolean;
  failedDeliveryCount: number;
  logs: WebhookLog[];
}) {
  const { locale, messages } = useProtectedI18n();
  const integrationMessages = messages.adminIntegrations;

  return (
    <AdminSectionCard
      title={integrationMessages.webhookLedgerTitle}
      description={integrationMessages.webhookLedgerDescription}
      actions={
        <Badge variant={failedDeliveryCount > 0 ? "outline" : "soft"}>
          {failedDeliveryCount > 0 ? integrationMessages.ledgerNeedsAttention : integrationMessages.ledgerHealthy}
        </Badge>
      }
      contentClassName="space-y-3"
    >
      <div data-testid="integration-webhook-ledger" className="space-y-3">
        {logs.length === 0 && !loading ? <AdminEmptyBlock>{integrationMessages.emptyWebhookLedger}</AdminEmptyBlock> : null}

        {logs.map((item) => (
          <AdminRecordCard key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.eventType}</span>
                  {renderOutcomeBadge(
                    item.outcome,
                    resolveIntegrationOutcomeLabel(item.outcome, integrationMessages),
                    item.statusCode
                  )}
                </div>
                <p className="text-sm text-[color:var(--ui-text-secondary)]">{item.endpoint}</p>
              </div>
              <div className="space-y-1 text-right text-xs text-[color:var(--ui-text-muted)]">
                <div>
                  {formatProtectedMessage(integrationMessages.deliveryStatusTemplate, {
                    value: item.statusCode || integrationMessages.notAvailable
                  })}
                </div>
                <div>{formatDateTime(item.deliveredAt, locale, integrationMessages.notAvailable)}</div>
              </div>
            </div>
          </AdminRecordCard>
        ))}
      </div>
    </AdminSectionCard>
  );
}

export function ProviderSpreadPanel({
  overview
}: {
  overview: IntegrationsOverview;
}) {
  const { messages } = useProtectedI18n();
  const integrationMessages = messages.adminIntegrations;

  return (
    <AdminSectionCard
      title={integrationMessages.providerSpreadTitle}
      description={integrationMessages.providerSpreadDescription}
      contentClassName="space-y-3"
    >
      {overview.providerSummary.map((item) => (
        <AdminInsetBlock key={item.provider} className="flex items-center justify-between">
          <span className="text-sm font-medium text-[color:var(--ui-text-secondary)]">{item.provider}</span>
          <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.count}</span>
        </AdminInsetBlock>
      ))}
    </AdminSectionCard>
  );
}

export function OperationsSnapshotPanel({
  selectedConnectorName,
  overview
}: {
  selectedConnectorName: string;
  overview: IntegrationsOverview;
}) {
  const { messages } = useProtectedI18n();
  const integrationMessages = messages.adminIntegrations;

  return (
    <AdminSectionCard
      title={integrationMessages.operationsSnapshotTitle}
      description={integrationMessages.operationsSnapshotDescription}
      contentClassName="space-y-3 text-sm text-[color:var(--ui-text-secondary)]"
    >
      <AdminInsetBlock>
        {integrationMessages.latestDeliveryLabel}
        <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">{overview.latestDeliveryAt}</div>
      </AdminInsetBlock>
      <AdminInsetBlock>
        {integrationMessages.connectorSelectionSummaryLabel}
        <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">{selectedConnectorName}</div>
      </AdminInsetBlock>
    </AdminSectionCard>
  );
}

export function SelectedConnectorSummary({
  connector
}: {
  connector: IntegrationConnector | null;
}) {
  const { locale, messages } = useProtectedI18n();
  const integrationMessages = messages.adminIntegrations;

  return (
    <div className="space-y-3 text-sm text-[color:var(--ui-text-secondary)]">
      <AdminInsetBlock>
        <div className="font-semibold text-[color:var(--ui-text-primary)]">
          {connector?.name || integrationMessages.noConnectorSelected}
        </div>
        <div className="mt-1">
          {integrationMessages.connectorProviderLabel}: {connector?.provider || integrationMessages.notAvailable}
        </div>
        <div className="mt-1">
          {integrationMessages.connectorBaseUrlLabel}: {connector?.baseUrl || integrationMessages.notAvailable}
        </div>
        <div className="mt-1">
          {integrationMessages.connectorUpdatedLabel}:{" "}
          {connector ? formatDateTime(connector.updatedAt, locale, integrationMessages.notAvailable) : integrationMessages.notAvailable}
        </div>
      </AdminInsetBlock>
      {connector ? (
        <AdminInsetBlock>
          <div className="font-semibold text-[color:var(--ui-text-primary)]">{integrationMessages.connectorDescriptionLabel}</div>
          <div className="mt-1">{connector.description}</div>
        </AdminInsetBlock>
      ) : null}
    </div>
  );
}
