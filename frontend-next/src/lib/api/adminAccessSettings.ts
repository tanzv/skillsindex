import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import type {
  AdminNormalizedCategoryCatalogItem,
  AdminNormalizedPresentationTaxonomyCategory
} from "@/src/lib/admin/adminAccountSettingsModel";
import {
  adminAccountsBFFEndpoint,
  adminAuthProvidersSettingsBFFEndpoint,
  adminCategoryCatalogSettingsBFFEndpoint,
  adminMarketplaceRankingSettingsBFFEndpoint,
  adminPresentationTaxonomySettingsBFFEndpoint,
  adminRegistrationSettingsBFFEndpoint
} from "@/src/lib/routing/protectedSurfaceEndpoints";

export interface AdminAccessSettingsPayloads {
  accounts: unknown;
  registration: unknown;
  marketplaceRanking: unknown;
  categoryCatalog: unknown;
  presentationTaxonomy: unknown;
  authProviders: unknown;
}

export interface SaveAdminAccessSettingsInput {
  allowRegistration: boolean;
  marketplacePublicAccess: boolean;
  rankingDefaultSort: "stars" | "quality";
  rankingLimit: number;
  highlightLimit: number;
  categoryLeaderLimit: number;
  categoryCatalog: AdminNormalizedCategoryCatalogItem[];
  presentationTaxonomy: AdminNormalizedPresentationTaxonomyCategory[];
  enabledProviders: string[];
}

type ClientFetchJSON = typeof clientFetchJSON;

export async function loadAdminAccessSettingsPayloads(fetchJSON: ClientFetchJSON = clientFetchJSON): Promise<AdminAccessSettingsPayloads> {
  const [accounts, registration, marketplaceRanking, categoryCatalog, presentationTaxonomy, authProviders] = await Promise.all([
    fetchJSON(adminAccountsBFFEndpoint),
    fetchJSON(adminRegistrationSettingsBFFEndpoint),
    fetchJSON(adminMarketplaceRankingSettingsBFFEndpoint),
    fetchJSON(adminCategoryCatalogSettingsBFFEndpoint),
    fetchJSON(adminPresentationTaxonomySettingsBFFEndpoint),
    fetchJSON(adminAuthProvidersSettingsBFFEndpoint)
  ]);

  return {
    accounts,
    registration,
    marketplaceRanking,
    categoryCatalog,
    presentationTaxonomy,
    authProviders
  };
}

export async function saveAdminAccessSettings(
  input: SaveAdminAccessSettingsInput,
  fetchJSON: ClientFetchJSON = clientFetchJSON
): Promise<void> {
  await Promise.all([
    fetchJSON(adminRegistrationSettingsBFFEndpoint, {
      method: "POST",
      body: {
        allow_registration: input.allowRegistration,
        marketplace_public_access: input.marketplacePublicAccess
      }
    }),
    fetchJSON(adminMarketplaceRankingSettingsBFFEndpoint, {
      method: "POST",
      body: {
        default_sort: input.rankingDefaultSort,
        ranking_limit: input.rankingLimit,
        highlight_limit: input.highlightLimit,
        category_leader_limit: input.categoryLeaderLimit
      }
    }),
    fetchJSON(adminCategoryCatalogSettingsBFFEndpoint, {
      method: "POST",
      body: {
        items: input.categoryCatalog.map((category) => ({
          slug: category.slug,
          name: category.name,
          description: category.description,
          enabled: category.enabled,
          sort_order: category.sortOrder,
          subcategories: category.subcategories.map((subcategory) => ({
            slug: subcategory.slug,
            name: subcategory.name,
            enabled: subcategory.enabled,
            sort_order: subcategory.sortOrder
          }))
        }))
      }
    }),
    fetchJSON(adminPresentationTaxonomySettingsBFFEndpoint, {
      method: "POST",
      body: {
        items: input.presentationTaxonomy.map((category) => ({
          slug: category.slug,
          name: category.name,
          description: category.description,
          enabled: category.enabled,
          sort_order: category.sortOrder,
          subcategories: category.subcategories.map((subcategory) => ({
            slug: subcategory.slug,
            name: subcategory.name,
            enabled: subcategory.enabled,
            sort_order: subcategory.sortOrder,
            legacy_category_slugs: subcategory.legacyCategorySlugs,
            legacy_subcategory_slugs: subcategory.legacySubcategorySlugs,
            keywords: subcategory.keywords
          }))
        }))
      }
    }),
    fetchJSON(adminAuthProvidersSettingsBFFEndpoint, {
      method: "POST",
      body: {
        auth_providers: input.enabledProviders
      }
    })
  ]);
}
