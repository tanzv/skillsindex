import { clientFetchJSON } from "@/src/lib/http/clientFetch";

export interface AdminAccessSettingsPayloads {
  accounts: unknown;
  registration: unknown;
  authProviders: unknown;
}

export interface SaveAdminAccessSettingsInput {
  allowRegistration: boolean;
  marketplacePublicAccess: boolean;
  enabledProviders: string[];
}

type ClientFetchJSON = typeof clientFetchJSON;

export async function loadAdminAccessSettingsPayloads(fetchJSON: ClientFetchJSON = clientFetchJSON): Promise<AdminAccessSettingsPayloads> {
  const [accounts, registration, authProviders] = await Promise.all([
    fetchJSON("/api/bff/admin/accounts"),
    fetchJSON("/api/bff/admin/settings/registration"),
    fetchJSON("/api/bff/admin/settings/auth-providers")
  ]);

  return {
    accounts,
    registration,
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
    fetchJSON("/api/bff/admin/settings/auth-providers", {
      method: "POST",
      body: {
        auth_providers: input.enabledProviders
      }
    })
  ]);
}
