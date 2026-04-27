import type {
  AdminNormalizedCategoryCatalogPayload,
  AdminNormalizedMarketplaceRankingPayload,
  AdminNormalizedPresentationTaxonomyPayload
} from "@/src/lib/admin/adminAccountSettingsModel";
import { normalizeAdminAccountStatus, normalizeAdminRoleName } from "@/src/lib/admin/adminAccountSettingsModel";
import type { SaveAdminAccessSettingsInput } from "@/src/lib/api/adminAccessSettings";

import type { AdminAccountItem, AuthProvidersPayload, RegistrationPayload } from "./model";

export interface AccountEditorState {
  userId: string;
  status: string;
  newPassword: string;
}

export interface RoleEditorState {
  userId: string;
  role: string;
}

export function createInitialAdminAccountsSettingsDraft(): SaveAdminAccessSettingsInput {
  return {
    allowRegistration: false,
    marketplacePublicAccess: true,
    rankingDefaultSort: "stars",
    rankingLimit: 12,
    highlightLimit: 3,
    categoryLeaderLimit: 5,
    categoryCatalog: [],
    presentationTaxonomy: [],
    enabledProviders: []
  };
}

export function buildAdminAccountsSettingsDraft({
  registration,
  marketplaceRanking,
  categoryCatalog,
  presentationTaxonomy,
  authProviders
}: {
  registration: RegistrationPayload;
  marketplaceRanking: AdminNormalizedMarketplaceRankingPayload;
  categoryCatalog: AdminNormalizedCategoryCatalogPayload;
  presentationTaxonomy: AdminNormalizedPresentationTaxonomyPayload;
  authProviders: AuthProvidersPayload;
}): SaveAdminAccessSettingsInput {
  return {
    allowRegistration: registration.allowRegistration,
    marketplacePublicAccess: registration.marketplacePublicAccess,
    rankingDefaultSort: marketplaceRanking.defaultSort,
    rankingLimit: marketplaceRanking.rankingLimit,
    highlightLimit: marketplaceRanking.highlightLimit,
    categoryLeaderLimit: marketplaceRanking.categoryLeaderLimit,
    categoryCatalog: categoryCatalog.items.map((category) => ({
      ...category,
      subcategories: category.subcategories.map((subcategory) => ({ ...subcategory }))
    })),
    presentationTaxonomy: presentationTaxonomy.items.map((category) => ({
      ...category,
      subcategories: category.subcategories.map((subcategory) => ({
        ...subcategory,
        legacyCategorySlugs: [...subcategory.legacyCategorySlugs],
        legacySubcategorySlugs: [...subcategory.legacySubcategorySlugs],
        keywords: [...subcategory.keywords]
      }))
    })),
    enabledProviders: [...authProviders.authProviders]
  };
}

function normalizeAssignableRoleName(value: string): string {
  const role = normalizeAdminRoleName(value);
  if (role === "super_admin" || role === "admin" || role === "member" || role === "viewer") {
    return role;
  }

  return "member";
}

export function syncAccountEditorFromSelectedAccount(
  currentEditor: AccountEditorState,
  selectedAccount: AdminAccountItem | null
): AccountEditorState {
  if (!selectedAccount) {
    return currentEditor;
  }

  const nextUserId = String(selectedAccount.id);
  if (currentEditor.userId === nextUserId) {
    return currentEditor;
  }

  return {
    ...currentEditor,
    userId: nextUserId,
    status: normalizeAdminAccountStatus(selectedAccount.status) === "disabled" ? "disabled" : "active"
  };
}

export function syncRoleEditorFromSelectedAccount(
  currentEditor: RoleEditorState,
  selectedAccount: AdminAccountItem | null
): RoleEditorState {
  if (!selectedAccount) {
    return currentEditor;
  }

  const nextUserId = String(selectedAccount.id);
  if (currentEditor.userId === nextUserId) {
    return currentEditor;
  }

  return {
    ...currentEditor,
    userId: nextUserId,
    role: normalizeAssignableRoleName(selectedAccount.role)
  };
}
