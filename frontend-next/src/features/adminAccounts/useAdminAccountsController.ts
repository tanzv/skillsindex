"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  normalizeAdminCategoryCatalogPayload,
  normalizeAdminMarketplaceRankingPayload,
  normalizeAdminPresentationTaxonomyPayload
} from "@/src/lib/admin/adminAccountSettingsModel";
import { createAdminOverlayState, useAdminOverlayState } from "@/src/lib/admin/useAdminOverlayState";
import { loadAdminAccessSettingsPayloads, type SaveAdminAccessSettingsInput } from "@/src/lib/api/adminAccessSettings";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";

import {
  type AdminAccountsCreateOverlayEntity,
  type AdminAccountsRoute,
  buildAccountsOverview,
  filterAccounts,
  normalizeAccountsPayload,
  normalizeAuthProvidersPayload,
  normalizeRegistrationPayload,
  resolveAdminAccountsCreateOverlayEntity,
  resolveSelectedAdminAccount,
  sortAccountsByUpdatedAt
} from "./model";
import {
  buildAdminAccountsSettingsDraft,
  createInitialAdminAccountsSettingsDraft,
  syncAccountEditorFromSelectedAccount,
  syncRoleEditorFromSelectedAccount,
  type AccountEditorState,
  type RoleEditorState
} from "./pageState";
import { useAdminAccountsActions } from "./useAdminAccountsActions";

interface AdminAccountsControllerMessages {
  loadError: string;
  invalidUserIdError: string;
  invalidPasswordError: string;
  applyStatusSuccess: string;
  applyStatusError: string;
  forceSignOutSuccess: string;
  forceSignOutError: string;
  resetPasswordSuccess: string;
  resetPasswordError: string;
  applyRoleSuccess: string;
  applyRoleError: string;
  saveSettingsSuccess: string;
  saveSettingsError: string;
  metricTotalAccounts: string;
  metricLoadedAccounts: string;
  metricActiveAccounts: string;
  metricDisabledAccounts: string;
}

export function useAdminAccountsController({
  route,
  accountMessages
}: {
  route: AdminAccountsRoute;
  accountMessages: AdminAccountsControllerMessages;
}) {
  const createOverlayEntity = useMemo(() => resolveAdminAccountsCreateOverlayEntity(route), [route]);
  const latestLoadRequestRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [rawAccounts, setRawAccounts] = useState<unknown>(null);
  const [rawRegistration, setRawRegistration] = useState<unknown>(null);
  const [rawMarketplaceRanking, setRawMarketplaceRanking] = useState<unknown>(null);
  const [rawCategoryCatalog, setRawCategoryCatalog] = useState<unknown>(null);
  const [rawPresentationTaxonomy, setRawPresentationTaxonomy] = useState<unknown>(null);
  const [rawAuthProviders, setRawAuthProviders] = useState<unknown>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const { overlay, openOverlay, closeOverlay } =
    useAdminOverlayState<"accountDetail" | AdminAccountsCreateOverlayEntity>(
      createOverlayEntity
        ? createAdminOverlayState({
            kind: "create",
            entity: createOverlayEntity
          })
        : null
    );
  const [accountEditor, setAccountEditor] = useState<AccountEditorState>({
    userId: "",
    status: "active",
    newPassword: ""
  });
  const [roleEditor, setRoleEditor] = useState<RoleEditorState>({
    userId: "",
    role: "member"
  });
  const accountEditorRef = useRef(accountEditor);
  const roleEditorRef = useRef(roleEditor);
  const [settingsDraft, setSettingsDraft] = useState<SaveAdminAccessSettingsInput>(createInitialAdminAccountsSettingsDraft);

  const accounts = useMemo(() => normalizeAccountsPayload(rawAccounts), [rawAccounts]);
  const registration = useMemo(() => normalizeRegistrationPayload(rawRegistration), [rawRegistration]);
  const marketplaceRanking = useMemo(
    () => normalizeAdminMarketplaceRankingPayload(rawMarketplaceRanking),
    [rawMarketplaceRanking]
  );
  const authProviders = useMemo(() => normalizeAuthProvidersPayload(rawAuthProviders), [rawAuthProviders]);
  const categoryCatalog = useMemo(
    () => normalizeAdminCategoryCatalogPayload(rawCategoryCatalog),
    [rawCategoryCatalog]
  );
  const presentationTaxonomy = useMemo(
    () => normalizeAdminPresentationTaxonomyPayload(rawPresentationTaxonomy),
    [rawPresentationTaxonomy]
  );
  const overview = useMemo(
    () =>
      buildAccountsOverview(accounts, {
        totalAccounts: accountMessages.metricTotalAccounts,
        loadedAccounts: accountMessages.metricLoadedAccounts,
        activeAccounts: accountMessages.metricActiveAccounts,
        disabledAccounts: accountMessages.metricDisabledAccounts
      }),
    [
      accountMessages.metricActiveAccounts,
      accountMessages.metricDisabledAccounts,
      accountMessages.metricLoadedAccounts,
      accountMessages.metricTotalAccounts,
      accounts
    ]
  );
  const filteredAccounts = useMemo(
    () => filterAccounts(sortAccountsByUpdatedAt(accounts.items), searchQuery, statusFilter),
    [accounts.items, searchQuery, statusFilter]
  );
  const selectedAccount = useMemo(
    () => resolveSelectedAdminAccount(accounts.items, filteredAccounts, selectedAccountId),
    [accounts.items, filteredAccounts, selectedAccountId]
  );

  const updateAccountEditor = useCallback((patch: Partial<AccountEditorState>) => {
    const nextAccountEditor = { ...accountEditorRef.current, ...patch };
    accountEditorRef.current = nextAccountEditor;
    setAccountEditor(nextAccountEditor);
  }, []);

  const updateRoleEditor = useCallback((patch: Partial<RoleEditorState>) => {
    const nextRoleEditor = { ...roleEditorRef.current, ...patch };
    roleEditorRef.current = nextRoleEditor;
    setRoleEditor(nextRoleEditor);
  }, []);

  const loadData = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    setError("");
    try {
      const payloads = await loadAdminAccessSettingsPayloads();
      if (requestId !== latestLoadRequestRef.current) {
        return;
      }

      setRawAccounts(payloads.accounts);
      setRawRegistration(payloads.registration);
      setRawMarketplaceRanking(payloads.marketplaceRanking);
      setRawCategoryCatalog(payloads.categoryCatalog);
      setRawPresentationTaxonomy(payloads.presentationTaxonomy);
      setRawAuthProviders(payloads.authProviders);
    } catch (loadError) {
      if (requestId !== latestLoadRequestRef.current) {
        return;
      }

      setError(resolveRequestErrorDisplayMessage(loadError, accountMessages.loadError));
      setRawAccounts(null);
      setRawRegistration(null);
      setRawMarketplaceRanking(null);
      setRawCategoryCatalog(null);
      setRawPresentationTaxonomy(null);
      setRawAuthProviders(null);
    } finally {
      if (requestId === latestLoadRequestRef.current) {
        setLoading(false);
      }
    }
  }, [accountMessages.loadError]);

  const actions = useAdminAccountsActions({
    accountMessages,
    accountEditorRef,
    roleEditorRef,
    selectedAccountId: selectedAccount?.id ?? null,
    settingsDraft,
    loadData,
    setError,
    updateAccountEditor
  });

  const hasData =
    rawAccounts !== null &&
    rawRegistration !== null &&
    rawMarketplaceRanking !== null &&
    rawCategoryCatalog !== null &&
    rawPresentationTaxonomy !== null &&
    rawAuthProviders !== null;

  useEffect(() => {
    void loadData();
  }, [loadData, route]);

  useEffect(() => {
    if (createOverlayEntity) {
      if (overlay?.kind !== "create" || overlay.entity !== createOverlayEntity) {
        openOverlay({
          kind: "create",
          entity: createOverlayEntity
        });
      }
      return;
    }

    if (overlay?.kind === "create") {
      closeOverlay();
    }
  }, [closeOverlay, createOverlayEntity, openOverlay, overlay]);

  useEffect(() => {
    setSettingsDraft(
      buildAdminAccountsSettingsDraft({
        registration,
        marketplaceRanking,
        categoryCatalog,
        presentationTaxonomy,
        authProviders
      })
    );
  }, [authProviders, categoryCatalog, marketplaceRanking, presentationTaxonomy, registration]);

  useEffect(() => {
    if (!selectedAccount) {
      if (overlay?.entity === "accountDetail") {
        closeOverlay();
      }
      return;
    }

    setSelectedAccountId((current) => (current === selectedAccount.id ? current : selectedAccount.id));
  }, [closeOverlay, overlay?.entity, selectedAccount]);

  useEffect(() => {
    const nextAccountEditor = syncAccountEditorFromSelectedAccount(accountEditorRef.current, selectedAccount);
    if (nextAccountEditor !== accountEditorRef.current) {
      accountEditorRef.current = nextAccountEditor;
      setAccountEditor(nextAccountEditor);
    }

    const nextRoleEditor = syncRoleEditorFromSelectedAccount(roleEditorRef.current, selectedAccount);
    if (nextRoleEditor !== roleEditorRef.current) {
      roleEditorRef.current = nextRoleEditor;
      setRoleEditor(nextRoleEditor);
    }
  }, [selectedAccount]);

  return {
    loading,
    busyAction: actions.busyAction,
    error,
    message: actions.message,
    searchQuery,
    statusFilter,
    overview,
    filteredAccounts,
    selectedAccount,
    registration,
    authProviders,
    roleSummary: overview.roleSummary,
    accountEditor,
    roleEditor,
    settingsDraft,
    hasData,
    detailPaneOpen: overlay?.entity === "accountDetail",
    createDrawer:
      overlay?.entity === "provisioningPolicy" || overlay?.entity === "rolePlaybook"
        ? overlay.entity
        : null,
    refresh: () => void loadData(),
    setSearchQuery,
    setStatusFilter,
    updateAccountEditor,
    updateRoleEditor,
    openAccountDetail: (accountId: number) => {
      setSelectedAccountId(accountId);
      openOverlay({
        kind: "detail",
        entity: "accountDetail",
        entityId: accountId
      });
    },
    openProvisioningDrawer: () =>
      openOverlay({
        kind: "create",
        entity: "provisioningPolicy"
      }),
    openRolePlaybookDrawer: () =>
      openOverlay({
        kind: "create",
        entity: "rolePlaybook"
      }),
    closeOverlay,
    patchSettingsDraft: (patch: Partial<SaveAdminAccessSettingsInput>) =>
      setSettingsDraft((current) => ({ ...current, ...patch })),
    toggleProvider: (provider: string) =>
      setSettingsDraft((current) => ({
        ...current,
        enabledProviders: current.enabledProviders.includes(provider)
          ? current.enabledProviders.filter((item) => item !== provider)
          : [...current.enabledProviders, provider]
      })),
    applyAccountStatus: actions.applyAccountStatus,
    forceSignout: actions.forceSignout,
    resetPassword: actions.resetPassword,
    applyRole: actions.applyRole,
    saveSettings: actions.saveSettings
  };
}
