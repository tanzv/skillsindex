"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { AdminDetailDrawer } from "@/src/components/admin/AdminOverlaySurface";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import type { ManagedAuthProviderDraft, ManagedAuthProviderInventoryItem } from "./adminAuthProvidersModel";
import { AuthProviderInventoryPanel, ManagedAuthProviderForm } from "./AdminIntegrationsAuthPanels";
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
  detailPaneOpen: boolean;
  authProviderItems: ManagedAuthProviderInventoryItem[];
  authProviderLoading: boolean;
  authProviderError: string;
  authProviderDraft: ManagedAuthProviderDraft | null;
  authProviderPaneOpen: boolean;
  authProviderDisplayName: string;
  authProviderBusy: boolean;
  authProviderBusyKey: string | null;
  overview: IntegrationsOverview;
  selectedConnectorName: string;
  onRefresh: () => void;
  onAuthProviderReload: () => void;
  onClearSelection: () => void;
  onSearchChange: (value: string) => void;
  onConnectorFilterChange: (connectorId: number) => void;
  onToggleConnectorFilter: (connectorId: number) => void;
  onOpenConnectorDetail: (connectorId: number) => void;
  onCloseDetailPane: () => void;
  onOpenAuthProvider: (provider: string) => void;
  onCloseAuthProviderPane: () => void;
  onAuthProviderDraftChange: (name: keyof ManagedAuthProviderDraft, value: string) => void;
  onAuthProviderSubmit: () => void;
  onAuthProviderDisable: (provider: string) => void;
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
  detailPaneOpen,
  authProviderItems,
  authProviderLoading,
  authProviderError,
  authProviderDraft,
  authProviderPaneOpen,
  authProviderDisplayName,
  authProviderBusy,
  authProviderBusyKey,
  overview,
  selectedConnectorName,
  onRefresh,
  onAuthProviderReload,
  onClearSelection,
  onSearchChange,
  onConnectorFilterChange,
  onToggleConnectorFilter,
  onOpenConnectorDetail,
  onCloseDetailPane,
  onOpenAuthProvider,
  onCloseAuthProviderPane,
  onAuthProviderDraftChange,
  onAuthProviderSubmit,
  onAuthProviderDisable
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
          <AuthProviderInventoryPanel
            items={authProviderItems}
            loading={authProviderLoading}
            error={authProviderError}
            busyProviderKey={authProviderBusyKey}
            onReload={onAuthProviderReload}
            onOpen={onOpenAuthProvider}
            onDisable={onAuthProviderDisable}
          />
          {detailPaneOpen && detailConnector ? (
            <AdminDetailDrawer
              open
              title={detailConnector.name}
              description={detailConnector.description || integrationMessages.connectorDetailDescription}
              closeLabel={integrationMessages.closePanelAction}
              onClose={onCloseDetailPane}
              dataTestId="admin-integrations-detail-pane"
            >
              <SelectedConnectorSummary connector={detailConnector} />
            </AdminDetailDrawer>
          ) : null}
          {authProviderPaneOpen && authProviderDraft ? (
            <AdminDetailDrawer
              open
              title={authProviderDisplayName}
              description={integrationMessages.authProviderFormDescription}
              closeLabel={integrationMessages.closePanelAction}
              onClose={onCloseAuthProviderPane}
              dataTestId="admin-auth-provider-detail-pane"
            >
              <ManagedAuthProviderForm
                providerDisplayName={authProviderDisplayName}
                draft={authProviderDraft}
                busy={authProviderBusy}
                onChange={onAuthProviderDraftChange}
                onSubmit={onAuthProviderSubmit}
              />
            </AdminDetailDrawer>
          ) : null}
          <ProviderSpreadPanel overview={overview} />
          <OperationsSnapshotPanel selectedConnectorName={selectedConnectorName} overview={overview} />
        </div>
      </div>
    </AdminPageScaffold>
  );
}
