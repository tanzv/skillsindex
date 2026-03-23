"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import type { IntegrationConnector, IntegrationsOverview, WebhookLog } from "./integrationsModel";
import {
  ConnectorInventoryPanel,
  OperationsSnapshotPanel,
  ProviderSpreadPanel,
  SelectedConnectorSummary,
  WebhookLedgerPanel
} from "./AdminIntegrationsPanels";

interface AdminIntegrationsContentProps {
  loading: boolean;
  error: string;
  search: string;
  connectorFilterId: number;
  allConnectors: IntegrationConnector[];
  filteredConnectors: IntegrationConnector[];
  filteredLogs: WebhookLog[];
  detailConnector: IntegrationConnector | null;
  detailDrawerOpen: boolean;
  overview: IntegrationsOverview;
  selectedConnectorName: string;
  onRefresh: () => void;
  onClearSelection: () => void;
  onSearchChange: (value: string) => void;
  onConnectorFilterChange: (connectorId: number) => void;
  onToggleConnectorFilter: (connectorId: number) => void;
  onOpenConnectorDetail: (connectorId: number) => void;
  onCloseDetailDrawer: () => void;
}

export function AdminIntegrationsContent({
  loading,
  error,
  search,
  connectorFilterId,
  allConnectors,
  filteredConnectors,
  filteredLogs,
  detailConnector,
  detailDrawerOpen,
  overview,
  selectedConnectorName,
  onRefresh,
  onClearSelection,
  onSearchChange,
  onConnectorFilterChange,
  onToggleConnectorFilter,
  onOpenConnectorDetail,
  onCloseDetailDrawer
}: AdminIntegrationsContentProps) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const integrationMessages = messages.adminIntegrations;

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={integrationMessages.pageTitle}
      description={integrationMessages.pageDescription}
      actions={
        <>
          <Button variant="outline" onClick={onClearSelection}>
            {integrationMessages.clearSelection}
          </Button>
          <Button onClick={onRefresh} disabled={loading}>
            {loading ? commonMessages.refreshing : commonMessages.refresh}
          </Button>
        </>
      }
      metrics={overview.metrics}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <ConnectorInventoryPanel
            loading={loading}
            error={error}
            search={search}
            connectorFilterId={connectorFilterId}
            allConnectors={allConnectors}
            filteredConnectors={filteredConnectors}
            onSearchChange={onSearchChange}
            onConnectorFilterChange={onConnectorFilterChange}
            onReload={onRefresh}
            onToggleConnectorFilter={onToggleConnectorFilter}
            onOpenConnectorDetail={onOpenConnectorDetail}
          />
          <WebhookLedgerPanel loading={loading} failedDeliveryCount={overview.failedDeliveryCount} logs={filteredLogs} />
        </div>

        <div className="space-y-6">
          <ProviderSpreadPanel overview={overview} />
          <OperationsSnapshotPanel selectedConnectorName={selectedConnectorName} overview={overview} />
        </div>
      </div>

      <DetailFormSurface
        open={detailDrawerOpen && Boolean(detailConnector)}
        variant="drawer"
        size="default"
        title={detailConnector?.name || integrationMessages.connectorInventoryTitle}
        description={detailConnector?.description || integrationMessages.connectorDetailDescription}
        closeLabel={integrationMessages.closePanelAction}
        onClose={onCloseDetailDrawer}
      >
        <SelectedConnectorSummary connector={detailConnector} />
      </DetailFormSurface>
    </AdminPageScaffold>
  );
}
