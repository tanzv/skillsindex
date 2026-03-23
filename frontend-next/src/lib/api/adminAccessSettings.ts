import { clientFetchJSON } from "@/src/lib/http/clientFetch";

export interface AdminAccessSettingsPayloads {
  accounts: unknown;
  registration: unknown;
  marketplaceRanking: unknown;
  authProviders: unknown;
}

export interface SaveAdminAccessSettingsInput {
  allowRegistration: boolean;
  marketplacePublicAccess: boolean;
  rankingDefaultSort: "stars" | "quality";
  rankingLimit: number;
  highlightLimit: number;
  categoryLeaderLimit: number;
  enabledProviders: string[];
}

type ClientFetchJSON = typeof clientFetchJSON;

export async function loadAdminAccessSettingsPayloads(fetchJSON: ClientFetchJSON = clientFetchJSON): Promise<AdminAccessSettingsPayloads> {
  const [accounts, registration, marketplaceRanking, authProviders] = await Promise.all([
    fetchJSON("/api/bff/admin/accounts"),
    fetchJSON("/api/bff/admin/settings/registration"),
    fetchJSON("/api/bff/admin/settings/marketplace-ranking"),
    fetchJSON("/api/bff/admin/settings/auth-providers")
  ]);

  return {
    accounts,
    registration,
    marketplaceRanking,
    authProviders
  };
}

export async function saveAdminAccessSettings(
  input: SaveAdminAccessSettingsInput,
  fetchJSON: ClientFetchJSON = clientFetchJSON
): Promise<void> {
  await Promise.all([
    fetchJSON("/api/bff/admin/settings/registration", {
      method: "POST",
      body: {
        allow_registration: input.allowRegistration,
        marketplace_public_access: input.marketplacePublicAccess
      }
    }),
    fetchJSON("/api/bff/admin/settings/marketplace-ranking", {
      method: "POST",
      body: {
        default_sort: input.rankingDefaultSort,
        ranking_limit: input.rankingLimit,
        highlight_limit: input.highlightLimit,
        category_leader_limit: input.categoryLeaderLimit
      }
    }),
    fetchJSON("/api/bff/admin/settings/auth-providers", {
      method: "POST",
      body: {
        auth_providers: input.enabledProviders
      }
    })
  ]);
}
