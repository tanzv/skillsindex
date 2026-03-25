"use client";

import { AdminEmptyBlock, AdminInsetBlock, AdminMetaChipList, AdminPageScaffold, AdminSectionCard } from "@/src/components/admin/AdminPrimitives";
import { AdminDetailDrawer } from "@/src/components/admin/AdminOverlaySurface";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveApiKeyStatusLabel, resolveApiKeyStatusTone } from "@/src/lib/apiKeyDisplay";

import { buildKeyMeta, type AdminAPIKeyItem, type AdminAPIKeyOverview, type AdminAPIKeysPayload } from "./model";

interface AdminAPIKeysContentProps {
  loading: boolean;
  busyAction: string;
  error: string;
  message: string;
  plaintextSecret: string;
  payload: AdminAPIKeysPayload;
  overview: AdminAPIKeyOverview;
  filters: {
    owner: string;
    status: string;
  };
  createDraft: {
    name: string;
    purpose: string;
    expiresInDays: string;
    ownerUserId: string;
    scopes: string;
  };
  scopeDrafts: Record<number, string>;
  activePane: "idle" | "create" | "detail";
  selectedItem: AdminAPIKeyItem | null;
  onRefresh: () => void;
  onFiltersChange: (patch: Partial<AdminAPIKeysContentProps["filters"]>) => void;
  onResetFilters: () => void;
  onCreateDraftChange: (patch: Partial<AdminAPIKeysContentProps["createDraft"]>) => void;
  onScopeDraftChange: (keyId: number, value: string) => void;
  onOpenCreatePane: () => void;
  onClosePane: () => void;
  onOpenDetail: (keyId: number) => void;
  onCreateKey: () => void;
  onRotateKey: (keyId: number) => void;
  onRevokeKey: (keyId: number) => void;
  onUpdateScopes: (keyId: number) => void;
}

export function AdminAPIKeysContent({
  loading,
  busyAction,
  error,
  message,
  plaintextSecret,
  payload,
  overview,
  filters,
  createDraft,
  scopeDrafts,
  activePane,
  selectedItem,
  onRefresh,
  onFiltersChange,
  onResetFilters,
  onCreateDraftChange,
  onScopeDraftChange,
  onOpenCreatePane,
  onClosePane,
  onOpenDetail,
  onCreateKey,
  onRotateKey,
  onRevokeKey,
  onUpdateScopes
}: AdminAPIKeysContentProps) {
  const { locale, messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const apiKeyMessages = messages.adminApiKeys;

  return (
    <>
      <AdminPageScaffold
        eyebrow={commonMessages.adminEyebrow}
        title={apiKeyMessages.pageTitle}
        description={apiKeyMessages.pageDescription}
        actions={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={onRefresh}>
              {loading ? commonMessages.refreshing : commonMessages.refresh}
            </Button>
            <Button onClick={onOpenCreatePane}>{apiKeyMessages.createAction}</Button>
          </div>
        }
        metrics={overview.metrics}
        error={error}
        message={message}
      >
        {plaintextSecret ? (
          <div className="rounded-2xl border border-[color:var(--ui-success-border)] bg-[color:var(--ui-success-bg)] px-4 py-3 text-sm text-[color:var(--ui-success-text)]">
            {apiKeyMessages.plaintextSecretTemplate.replace("{plaintextSecret}", plaintextSecret)}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <AdminSectionCard title={apiKeyMessages.inventoryTitle} description={apiKeyMessages.inventoryDescription} contentClassName="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <Input
                  aria-label={apiKeyMessages.filterOwnerAriaLabel}
                  value={filters.owner}
                  placeholder={apiKeyMessages.filterOwnerPlaceholder}
                  onChange={(event) => onFiltersChange({ owner: event.target.value })}
                />
                <Select
                  aria-label={apiKeyMessages.filterStatusAriaLabel}
                  value={filters.status}
                  onChange={(event) => onFiltersChange({ status: event.target.value })}
                >
                  <option value="all">{apiKeyMessages.filterStatusOptionAll}</option>
                  <option value="active">{apiKeyMessages.filterStatusOptionActive}</option>
                  <option value="revoked">{apiKeyMessages.filterStatusOptionRevoked}</option>
                  <option value="expired">{apiKeyMessages.filterStatusOptionExpired}</option>
                </Select>
                <Button variant="outline" onClick={onResetFilters}>
                  {commonMessages.clear}
                </Button>
              </div>

              <div className="space-y-3">
                {payload.items.map((item) => (
                  <div
                    key={item.id}
                    data-testid={`admin-apikey-card-${item.id}`}
                    className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                            {item.name || apiKeyMessages.unnamedKey}
                          </span>
                          <Badge variant={resolveApiKeyStatusTone(item.status)}>
                            {resolveApiKeyStatusLabel(item.status, apiKeyMessages)}
                          </Badge>
                          <Badge variant="outline">{item.ownerUsername || apiKeyMessages.ownerUnknown}</Badge>
                        </div>
                        <p className="text-sm text-[color:var(--ui-text-secondary)]">{item.purpose || apiKeyMessages.noPurpose}</p>
                        <AdminMetaChipList
                          items={buildKeyMeta(item, locale, {
                            valueNotAvailable: apiKeyMessages.valueNotAvailable,
                            metaPrefixTemplate: apiKeyMessages.metaPrefixTemplate,
                            metaCreatedTemplate: apiKeyMessages.metaCreatedTemplate,
                            metaUpdatedTemplate: apiKeyMessages.metaUpdatedTemplate,
                            metaLastUsedTemplate: apiKeyMessages.metaLastUsedTemplate
                          })}
                        />
                        {item.scopes.length ? <AdminMetaChipList items={item.scopes} tone="control" /> : null}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => onOpenDetail(item.id)}>
                        {apiKeyMessages.openDetailAction}
                      </Button>
                    </div>
                  </div>
                ))}

                {!payload.items.length && !loading ? <AdminEmptyBlock>{apiKeyMessages.inventoryEmpty}</AdminEmptyBlock> : null}
              </div>
            </AdminSectionCard>
          </div>

          <div className="space-y-6">
            <AdminSectionCard title={apiKeyMessages.createTitle} description={apiKeyMessages.createDescription}>
              <Button onClick={onOpenCreatePane}>{apiKeyMessages.createAction}</Button>
            </AdminSectionCard>

            <AdminSectionCard title={apiKeyMessages.ownerSummaryTitle} description={apiKeyMessages.ownerSummaryDescription} contentClassName="space-y-3">
              {overview.ownerSummary.map((item) => (
                <div key={item.owner} className="flex items-center justify-between rounded-2xl bg-[color:var(--ui-card-muted-bg)] px-4 py-3">
                  <span className="text-sm text-[color:var(--ui-text-secondary)]">{item.owner}</span>
                  <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.count}</span>
                </div>
              ))}
            </AdminSectionCard>
          </div>
        </div>
      </AdminPageScaffold>

      {activePane === "create" ? (
        <AdminDetailDrawer
          open
          title={apiKeyMessages.createTitle}
          description={apiKeyMessages.createDescription}
          closeLabel={apiKeyMessages.closePanelAction}
          onClose={onClosePane}
          dataTestId="admin-apikeys-create-pane"
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onCreateKey();
            }}
          >
            <Input
              aria-label={apiKeyMessages.createNameAriaLabel}
              value={createDraft.name}
              placeholder={apiKeyMessages.createNamePlaceholder}
              onChange={(event) => onCreateDraftChange({ name: event.target.value })}
            />
            <Input
              aria-label={apiKeyMessages.createPurposeAriaLabel}
              value={createDraft.purpose}
              placeholder={apiKeyMessages.createPurposePlaceholder}
              onChange={(event) => onCreateDraftChange({ purpose: event.target.value })}
            />
            <Input
              aria-label={apiKeyMessages.createOwnerUserIdAriaLabel}
              value={createDraft.ownerUserId}
              placeholder={apiKeyMessages.createOwnerUserIdPlaceholder}
              onChange={(event) => onCreateDraftChange({ ownerUserId: event.target.value })}
            />
            <Input
              aria-label={apiKeyMessages.createExpiresInDaysAriaLabel}
              value={createDraft.expiresInDays}
              placeholder={apiKeyMessages.createExpiresInDaysPlaceholder}
              onChange={(event) => onCreateDraftChange({ expiresInDays: event.target.value })}
            />
            <Input
              aria-label={apiKeyMessages.createScopesAriaLabel}
              value={createDraft.scopes}
              placeholder={apiKeyMessages.createScopesPlaceholder}
              onChange={(event) => onCreateDraftChange({ scopes: event.target.value })}
            />
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="submit" disabled={Boolean(busyAction)}>
                {busyAction === "create-key" ? apiKeyMessages.creatingAction : apiKeyMessages.createAction}
              </Button>
            </div>
          </form>
        </AdminDetailDrawer>
      ) : null}

      {activePane === "detail" && selectedItem ? (
        <AdminDetailDrawer
          open
          title={selectedItem.name || apiKeyMessages.unnamedKey}
          description={`${resolveApiKeyStatusLabel(selectedItem.status, apiKeyMessages)} · ${selectedItem.ownerUsername || apiKeyMessages.ownerUnknown}`}
          closeLabel={apiKeyMessages.closePanelAction}
          onClose={onClosePane}
          dataTestId="admin-apikeys-detail-pane"
          actions={
            <Badge variant={resolveApiKeyStatusTone(selectedItem.status)}>
              {resolveApiKeyStatusLabel(selectedItem.status, apiKeyMessages)}
            </Badge>
          }
        >
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2">
              <AdminInsetBlock>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
                  {apiKeyMessages.detailOwnerLabel}
                </div>
                <div className="mt-2 text-sm font-semibold text-[color:var(--ui-text-primary)]">
                  {selectedItem.ownerUsername || apiKeyMessages.ownerUnknown}
                </div>
              </AdminInsetBlock>
              <AdminInsetBlock>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
                  {apiKeyMessages.detailScopeCountLabel}
                </div>
                <div className="mt-2 text-sm font-semibold text-[color:var(--ui-text-primary)]">{selectedItem.scopes.length}</div>
              </AdminInsetBlock>
            </div>

            <div className="space-y-3 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] p-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{apiKeyMessages.scopeInputAriaLabel}</div>
                {selectedItem.scopes.length ? (
                  <AdminMetaChipList items={selectedItem.scopes} tone="control" />
                ) : (
                  <AdminEmptyBlock className="p-4">{apiKeyMessages.valueNotAvailable}</AdminEmptyBlock>
                )}
              </div>

              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  onUpdateScopes(selectedItem.id);
                }}
              >
                <Input
                  aria-label={apiKeyMessages.scopeInputAriaLabel}
                  value={scopeDrafts[selectedItem.id] || ""}
                  placeholder={apiKeyMessages.scopeInputPlaceholder}
                  onChange={(event) => onScopeDraftChange(selectedItem.id, event.target.value)}
                />
                <div className="flex flex-wrap justify-end gap-3">
                  <Button type="submit" disabled={Boolean(busyAction)}>
                    {busyAction === `scopes-${selectedItem.id}` ? apiKeyMessages.savingScopesAction : apiKeyMessages.applyScopesAction}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-3 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] p-4">
              <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{apiKeyMessages.inventoryTitle}</div>
              <AdminMetaChipList
                items={buildKeyMeta(selectedItem, locale, {
                  valueNotAvailable: apiKeyMessages.valueNotAvailable,
                  metaPrefixTemplate: apiKeyMessages.metaPrefixTemplate,
                  metaCreatedTemplate: apiKeyMessages.metaCreatedTemplate,
                  metaUpdatedTemplate: apiKeyMessages.metaUpdatedTemplate,
                  metaLastUsedTemplate: apiKeyMessages.metaLastUsedTemplate
                })}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <AdminInsetBlock>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
                    {apiKeyMessages.detailUserIdLabel}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[color:var(--ui-text-primary)]">{selectedItem.userId}</div>
                </AdminInsetBlock>
                <AdminInsetBlock>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
                    {apiKeyMessages.detailCreatedByLabel}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[color:var(--ui-text-primary)]">{selectedItem.createdBy}</div>
                </AdminInsetBlock>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => onRotateKey(selectedItem.id)} disabled={Boolean(busyAction)}>
                {busyAction === `rotate-${selectedItem.id}` ? apiKeyMessages.rotatingAction : apiKeyMessages.rotateAction}
              </Button>
              <Button variant="outline" onClick={() => onRevokeKey(selectedItem.id)} disabled={Boolean(busyAction)}>
                {busyAction === `revoke-${selectedItem.id}` ? apiKeyMessages.revokingAction : apiKeyMessages.revokeAction}
              </Button>
            </div>
          </div>
        </AdminDetailDrawer>
      ) : null}
    </>
  );
}
