"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AdminPageLoadStateFrame,
  resolveAdminPageLoadState,
} from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import {
  normalizeAdminCategoryCatalogPayload,
  normalizeAdminMarketplaceRankingPayload,
  normalizeAdminPresentationTaxonomyPayload,
} from "@/src/lib/admin/adminAccountSettingsModel";
import {
  createAdminOverlayState,
  useAdminOverlayState,
} from "@/src/lib/admin/useAdminOverlayState";
import {
  loadAdminAccessSettingsPayloads,
  saveAdminAccessSettings,
  type SaveAdminAccessSettingsInput,
} from "@/src/lib/api/adminAccessSettings";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import { resolveAdminAccountsPageRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";

import { AdminAccountsContent } from "./AdminAccountsContent";
import {
  type AdminAccountsRoute,
  buildAccountsOverview,
  filterAccounts,
  normalizeAccountsPayload,
  normalizeAuthProvidersPayload,
  normalizeAccountStatus,
  normalizeAssignableRoleName,
  resolveSelectedAdminAccount,
  resolveRoleTargetUserId,
  normalizeRegistrationPayload,
  sortAccountsByUpdatedAt,
} from "./model";

export function AdminAccountsPage({ route }: { route: AdminAccountsRoute }) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;
  const meta = useMemo(
    () => resolveAdminAccountsPageRouteMeta(route, accountMessages),
    [accountMessages, route],
  );
  const latestLoadRequestRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "disabled"
  >("all");
  const [rawAccounts, setRawAccounts] = useState<unknown>(null);
  const [rawRegistration, setRawRegistration] = useState<unknown>(null);
  const [rawMarketplaceRanking, setRawMarketplaceRanking] =
    useState<unknown>(null);
  const [rawCategoryCatalog, setRawCategoryCatalog] = useState<unknown>(null);
  const [rawPresentationTaxonomy, setRawPresentationTaxonomy] =
    useState<unknown>(null);
  const [rawAuthProviders, setRawAuthProviders] = useState<unknown>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const { overlay, openOverlay, closeOverlay } =
    useAdminOverlayState<"accountDetail">(
      route === "/admin/accounts" ||
        route === "/admin/roles" ||
        route === "/admin/roles/new"
        ? createAdminOverlayState({ kind: "detail", entity: "accountDetail" })
        : null,
    );
  const [accountEditor, setAccountEditor] = useState({
    userId: "",
    status: "active",
    newPassword: "",
  });
  const [roleEditor, setRoleEditor] = useState({ userId: "", role: "member" });
  const accountEditorRef = useRef(accountEditor);
  const roleEditorRef = useRef(roleEditor);
  const [settingsDraft, setSettingsDraft] =
    useState<SaveAdminAccessSettingsInput>({
      allowRegistration: false,
      marketplacePublicAccess: true,
      rankingDefaultSort: "stars",
      rankingLimit: 12,
      highlightLimit: 3,
      categoryLeaderLimit: 5,
      categoryCatalog: [],
      presentationTaxonomy: [],
      enabledProviders: [],
    });

  const accounts = useMemo(
    () => normalizeAccountsPayload(rawAccounts),
    [rawAccounts],
  );
  const registration = useMemo(
    () => normalizeRegistrationPayload(rawRegistration),
    [rawRegistration],
  );
  const marketplaceRanking = useMemo(
    () => normalizeAdminMarketplaceRankingPayload(rawMarketplaceRanking),
    [rawMarketplaceRanking],
  );
  const authProviders = useMemo(
    () => normalizeAuthProvidersPayload(rawAuthProviders),
    [rawAuthProviders],
  );
  const categoryCatalog = useMemo(
    () => normalizeAdminCategoryCatalogPayload(rawCategoryCatalog),
    [rawCategoryCatalog],
  );
  const presentationTaxonomy = useMemo(
    () => normalizeAdminPresentationTaxonomyPayload(rawPresentationTaxonomy),
    [rawPresentationTaxonomy],
  );
  const overview = useMemo(
    () =>
      buildAccountsOverview(accounts, {
        totalAccounts: accountMessages.metricTotalAccounts,
        loadedAccounts: accountMessages.metricLoadedAccounts,
        activeAccounts: accountMessages.metricActiveAccounts,
        disabledAccounts: accountMessages.metricDisabledAccounts,
      }),
    [
      accountMessages.metricActiveAccounts,
      accountMessages.metricDisabledAccounts,
      accountMessages.metricLoadedAccounts,
      accountMessages.metricTotalAccounts,
      accounts,
    ],
  );
  const filteredAccounts = useMemo(
    () =>
      filterAccounts(
        sortAccountsByUpdatedAt(accounts.items),
        searchQuery,
        statusFilter,
      ),
    [accounts.items, searchQuery, statusFilter],
  );
  const selectedAccount = useMemo(
    () =>
      resolveSelectedAdminAccount(
        accounts.items,
        filteredAccounts,
        selectedAccountId,
      ),
    [accounts.items, filteredAccounts, selectedAccountId],
  );

  const loadData = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    setError("");
    try {
      const {
        accounts: accountsPayload,
        registration: registrationPayload,
        marketplaceRanking: marketplaceRankingPayload,
        categoryCatalog: categoryCatalogPayload,
        presentationTaxonomy: presentationTaxonomyPayload,
        authProviders: authProvidersPayload,
      } = await loadAdminAccessSettingsPayloads();
      if (requestId !== latestLoadRequestRef.current) {
        return;
      }
      setRawAccounts(accountsPayload);
      setRawRegistration(registrationPayload);
      setRawMarketplaceRanking(marketplaceRankingPayload);
      setRawCategoryCatalog(categoryCatalogPayload);
      setRawPresentationTaxonomy(presentationTaxonomyPayload);
      setRawAuthProviders(authProvidersPayload);
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

  useEffect(() => {
    void loadData();
  }, [loadData, route]);

  const loadState = resolveAdminPageLoadState({
    loading,
    error,
    hasData:
      rawAccounts !== null &&
      rawRegistration !== null &&
      rawMarketplaceRanking !== null &&
      rawCategoryCatalog !== null &&
      rawPresentationTaxonomy !== null &&
      rawAuthProviders !== null,
  });

  useEffect(() => {
    if (
      route === "/admin/accounts" ||
      route === "/admin/roles" ||
      route === "/admin/roles/new"
    ) {
      openOverlay({
        kind: "detail",
        entity: "accountDetail",
        entityId: selectedAccountId,
      });
      return;
    }

    closeOverlay();
  }, [closeOverlay, openOverlay, route, selectedAccountId]);

  useEffect(() => {
    const nextSettingsDraft: SaveAdminAccessSettingsInput = {
      allowRegistration: registration.allowRegistration,
      marketplacePublicAccess: registration.marketplacePublicAccess,
      rankingDefaultSort: marketplaceRanking.defaultSort,
      rankingLimit: marketplaceRanking.rankingLimit,
      highlightLimit: marketplaceRanking.highlightLimit,
      categoryLeaderLimit: marketplaceRanking.categoryLeaderLimit,
      categoryCatalog: categoryCatalog.items.map((category) => ({
        ...category,
        subcategories: category.subcategories.map((subcategory) => ({ ...subcategory })),
      })),
      presentationTaxonomy: presentationTaxonomy.items.map((category) => ({
        ...category,
        subcategories: category.subcategories.map((subcategory) => ({
          ...subcategory,
          legacyCategorySlugs: [...subcategory.legacyCategorySlugs],
          legacySubcategorySlugs: [...subcategory.legacySubcategorySlugs],
          keywords: [...subcategory.keywords],
        })),
      })),
      enabledProviders: [...authProviders.authProviders],
    };
    setSettingsDraft(nextSettingsDraft);
  }, [
    authProviders.authProviders,
    categoryCatalog.items,
    marketplaceRanking.categoryLeaderLimit,
    marketplaceRanking.defaultSort,
    marketplaceRanking.highlightLimit,
    marketplaceRanking.rankingLimit,
    presentationTaxonomy.items,
    registration.allowRegistration,
    registration.marketplacePublicAccess,
  ]);

  useEffect(() => {
    if (!selectedAccount) {
      setSelectedAccountId(null);
      return;
    }

    setSelectedAccountId((current) =>
      current === selectedAccount.id ? current : selectedAccount.id,
    );
  }, [selectedAccount]);

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    const nextUserId = String(selectedAccount.id);
    const nextStatus =
      normalizeAccountStatus(selectedAccount.status) === "disabled"
        ? "disabled"
        : "active";
    const nextRole = normalizeAssignableRoleName(selectedAccount.role);

    if (accountEditorRef.current.userId !== nextUserId) {
      const nextAccountEditor = {
        ...accountEditorRef.current,
        userId: nextUserId,
        status: nextStatus,
      };
      accountEditorRef.current = nextAccountEditor;
      setAccountEditor(nextAccountEditor);
    }

    if (roleEditorRef.current.userId !== nextUserId) {
      const nextRoleEditor = {
        ...roleEditorRef.current,
        userId: nextUserId,
        role: nextRole,
      };
      roleEditorRef.current = nextRoleEditor;
      setRoleEditor(nextRoleEditor);
    }
  }, [selectedAccount]);

  function updateAccountEditor(patch: Partial<typeof accountEditor>) {
    const nextAccountEditor = { ...accountEditorRef.current, ...patch };
    accountEditorRef.current = nextAccountEditor;
    setAccountEditor(nextAccountEditor);
  }

  function updateRoleEditor(patch: Partial<typeof roleEditor>) {
    const nextRoleEditor = { ...roleEditorRef.current, ...patch };
    roleEditorRef.current = nextRoleEditor;
    setRoleEditor(nextRoleEditor);
  }

  async function applyAccountStatus() {
    const { userId: draftUserId, status } = accountEditorRef.current;
    const userId = Number(draftUserId);
    if (!Number.isFinite(userId) || userId <= 0) {
      setError(accountMessages.invalidUserIdError);
      return;
    }
    setBusyAction("apply-status");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/accounts/${userId}/status`, {
        method: "POST",
        body: { status },
      });
      setMessage(
        formatProtectedMessage(accountMessages.applyStatusSuccess, { userId }),
      );
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.applyStatusError));
    } finally {
      setBusyAction("");
    }
  }

  async function forceSignout(userId: number) {
    setBusyAction(`force-signout-${userId}`);
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/accounts/${userId}/force-signout`, {
        method: "POST",
      });
      setMessage(
        formatProtectedMessage(accountMessages.forceSignOutSuccess, { userId }),
      );
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.forceSignOutError));
    } finally {
      setBusyAction("");
    }
  }

  async function resetPassword() {
    const { userId: draftUserId, newPassword } = accountEditorRef.current;
    const userId = Number(draftUserId);
    if (!Number.isFinite(userId) || userId <= 0 || !newPassword.trim()) {
      setError(accountMessages.invalidPasswordError);
      return;
    }
    setBusyAction("reset-password");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(
        `/api/bff/admin/accounts/${userId}/password-reset`,
        {
          method: "POST",
          body: { new_password: newPassword },
        },
      );
      setMessage(
        formatProtectedMessage(accountMessages.resetPasswordSuccess, {
          userId,
        }),
      );
      updateAccountEditor({ newPassword: "" });
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.resetPasswordError));
    } finally {
      setBusyAction("");
    }
  }

  async function applyRole() {
    const { userId: draftUserId, role } = roleEditor;
    const userId = resolveRoleTargetUserId(
      draftUserId,
      selectedAccount?.id ?? null,
    );
    if (userId === null) {
      setError(accountMessages.invalidUserIdError);
      return;
    }
    setBusyAction("apply-role");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/users/${userId}/role`, {
        method: "POST",
        body: { role },
      });
      setMessage(
        formatProtectedMessage(accountMessages.applyRoleSuccess, { userId }),
      );
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.applyRoleError));
    } finally {
      setBusyAction("");
    }
  }

  async function saveSettings() {
    setBusyAction("save-settings");
    setError("");
    setMessage("");
    try {
      await saveAdminAccessSettings(settingsDraft);
      setMessage(accountMessages.saveSettingsSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.saveSettingsError));
    } finally {
      setBusyAction("");
    }
  }

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={messages.adminCommon.adminEyebrow}
        title={meta.title}
        description={meta.description}
        error={loadState === "error" ? error : undefined}
        actions={
          <Button onClick={() => void loadData()}>
            {loading
              ? messages.adminCommon.refreshing
              : messages.adminCommon.refresh}
          </Button>
        }
      />
    );
  }

  return (
    <AdminAccountsContent
      route={route}
      loading={loading}
      busyAction={busyAction}
      error={error}
      message={message}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      metrics={overview.metrics}
      accounts={filteredAccounts}
      selectedAccount={selectedAccount}
      registration={registration}
      authProviders={authProviders}
      roleSummary={overview.roleSummary}
      accountEditor={accountEditor}
      roleEditor={roleEditor}
      detailPaneOpen={overlay?.entity === "accountDetail"}
      settingsDraft={settingsDraft}
      onRefresh={() => void loadData()}
      onSelectAccount={(accountId) => {
        setSelectedAccountId(accountId);
        openOverlay({
          kind: "detail",
          entity: "accountDetail",
          entityId: accountId,
        });
      }}
      onSearchQueryChange={setSearchQuery}
      onStatusFilterChange={(value) =>
        setStatusFilter(value as "all" | "active" | "disabled")
      }
      onAccountEditorChange={updateAccountEditor}
      onRoleEditorChange={updateRoleEditor}
      onCloseDetailPane={closeOverlay}
      onSettingsDraftChange={(patch) =>
        setSettingsDraft((current) => ({ ...current, ...patch }))
      }
      onToggleProvider={(provider) =>
        setSettingsDraft((current) => ({
          ...current,
          enabledProviders: current.enabledProviders.includes(provider)
            ? current.enabledProviders.filter((item) => item !== provider)
            : [...current.enabledProviders, provider],
        }))
      }
      onApplyAccountStatus={() => void applyAccountStatus()}
      onForceSignout={(userId) => void forceSignout(userId)}
      onResetPassword={() => void resetPassword()}
      onApplyRole={() => void applyRole()}
      onSaveSettings={() => void saveSettings()}
    />
  );
}
