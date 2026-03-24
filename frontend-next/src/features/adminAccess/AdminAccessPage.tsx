"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import {
  loadAdminAccessSettingsPayloads,
  saveAdminAccessSettings,
  type SaveAdminAccessSettingsInput,
} from "@/src/lib/api/adminAccessSettings";

import {
  addCategoryCatalogCategory,
  addCategoryCatalogSubcategory,
  moveCategoryCatalogCategory,
  moveCategoryCatalogSubcategory,
  removeCategoryCatalogCategory,
  removeCategoryCatalogSubcategory,
  updateCategoryCatalogCategory,
  updateCategoryCatalogSubcategory,
} from "./categoryCatalogDraft";
import { AdminAccessContent } from "./AdminAccessContent";
import { buildAccessOverview, buildAdminAccessGovernanceData, resolveSelectedAccessAccount } from "./model";

export function AdminAccessPage() {
  const { messages } = useProtectedI18n();
  const accessMessages = messages.adminAccess;
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [activePane, setActivePane] = useState<"idle" | "policy" | "account">("idle");
  const [rawAccounts, setRawAccounts] = useState<unknown>(null);
  const [rawRegistration, setRawRegistration] = useState<unknown>(null);
  const [rawMarketplaceRanking, setRawMarketplaceRanking] = useState<unknown>(null);
  const [rawCategoryCatalog, setRawCategoryCatalog] = useState<unknown>(null);
  const [rawAuthProviders, setRawAuthProviders] = useState<unknown>(null);
  const [settingsDraft, setSettingsDraft] = useState<SaveAdminAccessSettingsInput>({
    allowRegistration: false,
    marketplacePublicAccess: false,
    rankingDefaultSort: "stars",
    rankingLimit: 12,
    highlightLimit: 3,
    categoryLeaderLimit: 5,
    categoryCatalog: [],
    enabledProviders: [],
  });

  const data = useMemo(
    () =>
      buildAdminAccessGovernanceData({
        accounts: rawAccounts,
        registration: rawRegistration,
        marketplaceRanking: rawMarketplaceRanking,
        categoryCatalog: rawCategoryCatalog,
        authProviders: rawAuthProviders
      }),
    [rawAccounts, rawAuthProviders, rawCategoryCatalog, rawMarketplaceRanking, rawRegistration]
  );
  const overview = useMemo(
    () =>
      buildAccessOverview(data, {
        accounts: accessMessages.metricAccounts,
        disabled: accessMessages.metricDisabled,
        enabledProviders: accessMessages.metricEnabledProviders,
        pendingSignOut: accessMessages.metricPendingSignOut
      }),
    [
      accessMessages.metricAccounts,
      accessMessages.metricDisabled,
      accessMessages.metricEnabledProviders,
      accessMessages.metricPendingSignOut,
      data
    ]
  );

  const filteredAccounts = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    if (!search) {
      return data.accounts;
    }
    return data.accounts.filter((item) => [item.username, item.role, item.status, String(item.id)].some((value) => value.toLowerCase().includes(search)));
  }, [data.accounts, keyword]);
  const selectedAccount = useMemo(
    () => resolveSelectedAccessAccount(data.accounts, selectedAccountId),
    [data.accounts, selectedAccountId]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { accounts, registration, marketplaceRanking, categoryCatalog, authProviders } = await loadAdminAccessSettingsPayloads();
      setRawAccounts(accounts);
      setRawRegistration(registration);
      setRawMarketplaceRanking(marketplaceRanking);
      setRawCategoryCatalog(categoryCatalog);
      setRawAuthProviders(authProviders);
    } catch (loadError) {
      setError(resolveRequestErrorDisplayMessage(loadError, accessMessages.loadError));
      setRawAccounts(null);
      setRawRegistration(null);
      setRawMarketplaceRanking(null);
      setRawCategoryCatalog(null);
      setRawAuthProviders(null);
    } finally {
      setLoading(false);
    }
  }, [accessMessages.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({
    loading,
    error,
    hasData:
      rawAccounts !== null &&
      rawRegistration !== null &&
      rawMarketplaceRanking !== null &&
      rawCategoryCatalog !== null &&
      rawAuthProviders !== null
  });

  useEffect(() => {
    setSettingsDraft({
      allowRegistration: data.allowRegistration,
      marketplacePublicAccess: data.marketplacePublicAccess,
      rankingDefaultSort: data.rankingDefaultSort,
      rankingLimit: data.rankingLimit,
      highlightLimit: data.highlightLimit,
      categoryLeaderLimit: data.categoryLeaderLimit,
      categoryCatalog: data.categoryCatalog.map((category) => ({
        ...category,
        subcategories: category.subcategories.map((subcategory) => ({ ...subcategory }))
      })),
      enabledProviders: [...data.enabledProviders]
    });
  }, [
    data.allowRegistration,
    data.categoryCatalog,
    data.categoryLeaderLimit,
    data.enabledProviders,
    data.highlightLimit,
    data.marketplacePublicAccess,
    data.rankingDefaultSort,
    data.rankingLimit
  ]);

  useEffect(() => {
    if (selectedAccountId !== null && !selectedAccount) {
      setSelectedAccountId(null);
      setActivePane("idle");
    }
  }, [selectedAccount, selectedAccountId]);

  async function saveAccessSettings() {
    setBusyAction("save-settings");
    setError("");
    setMessage("");
    try {
      await saveAdminAccessSettings(settingsDraft);
      setMessage(accessMessages.saveSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accessMessages.saveError));
    } finally {
      setBusyAction("");
    }
  }

  function toggleProvider(provider: string) {
    setSettingsDraft((current) => ({
      ...current,
      enabledProviders: current.enabledProviders.includes(provider)
        ? current.enabledProviders.filter((item) => item !== provider)
        : [...current.enabledProviders, provider]
    }));
  }

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={messages.adminCommon.adminEyebrow}
        title={accessMessages.pageTitle}
        description={accessMessages.pageDescription}
        error={loadState === "error" ? error : undefined}
        actions={<Button onClick={() => void loadData()}>{loading ? messages.adminCommon.refreshing : messages.adminCommon.refresh}</Button>}
      />
    );
  }

  return (
    <AdminAccessContent
      loading={loading}
      busyAction={busyAction}
      error={error}
      message={message}
      keyword={keyword}
      data={data}
      overview={overview}
      filteredAccounts={filteredAccounts}
      selectedAccount={selectedAccount}
      activePane={activePane}
      settingsDraft={settingsDraft}
      onRefresh={() => void loadData()}
      onKeywordChange={setKeyword}
      onClearKeyword={() => setKeyword("")}
      onOpenPolicyPane={() => setActivePane("policy")}
      onOpenAccountPane={(accountId) => {
        setSelectedAccountId(accountId);
        setActivePane("account");
      }}
      onClosePane={() => setActivePane("idle")}
      onToggleProvider={toggleProvider}
      onSettingsDraftChange={(patch) => setSettingsDraft((current) => ({ ...current, ...patch }))}
      onAddCategory={() =>
        setSettingsDraft((current) => ({
          ...current,
          categoryCatalog: addCategoryCatalogCategory(current.categoryCatalog)
        }))
      }
      onUpdateCategory={(categoryIndex, patch) =>
        setSettingsDraft((current) => ({
          ...current,
          categoryCatalog: updateCategoryCatalogCategory(current.categoryCatalog, categoryIndex, patch)
        }))
      }
      onRemoveCategory={(categoryIndex) =>
        setSettingsDraft((current) => ({
          ...current,
          categoryCatalog: removeCategoryCatalogCategory(current.categoryCatalog, categoryIndex)
        }))
      }
      onMoveCategory={(categoryIndex, direction) =>
        setSettingsDraft((current) => ({
          ...current,
          categoryCatalog: moveCategoryCatalogCategory(current.categoryCatalog, categoryIndex, direction)
        }))
      }
      onAddSubcategory={(categoryIndex) =>
        setSettingsDraft((current) => ({
          ...current,
          categoryCatalog: addCategoryCatalogSubcategory(current.categoryCatalog, categoryIndex)
        }))
      }
      onUpdateSubcategory={(categoryIndex, subcategoryIndex, patch) =>
        setSettingsDraft((current) => ({
          ...current,
          categoryCatalog: updateCategoryCatalogSubcategory(current.categoryCatalog, categoryIndex, subcategoryIndex, patch)
        }))
      }
      onRemoveSubcategory={(categoryIndex, subcategoryIndex) =>
        setSettingsDraft((current) => ({
          ...current,
          categoryCatalog: removeCategoryCatalogSubcategory(current.categoryCatalog, categoryIndex, subcategoryIndex)
        }))
      }
      onMoveSubcategory={(categoryIndex, subcategoryIndex, direction) =>
        setSettingsDraft((current) => ({
          ...current,
          categoryCatalog: moveCategoryCatalogSubcategory(current.categoryCatalog, categoryIndex, subcategoryIndex, direction)
        }))
      }
      onSavePolicy={() => void saveAccessSettings()}
    />
  );
}
