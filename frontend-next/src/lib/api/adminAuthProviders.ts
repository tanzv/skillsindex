import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import {
  adminAuthProviderConfigsBFFEndpoint,
  buildAdminAuthProviderConfigBFFEndpoint,
  buildAdminAuthProviderConfigDisableBFFEndpoint
} from "@/src/lib/routing/protectedSurfaceEndpoints";

type ClientFetchJSON = typeof clientFetchJSON;

export interface SaveManagedAuthProviderInput {
  provider: string;
  name: string;
  description: string;
  issuer: string;
  authorization_url: string;
  token_url: string;
  userinfo_url: string;
  client_id: string;
  client_secret: string;
  scope: string;
  claim_external_id: string;
  claim_username: string;
  claim_email: string;
  claim_email_verified: string;
  claim_groups: string;
  offboarding_mode: string;
  mapping_mode: string;
  default_org_id: number;
  default_org_role: string;
  default_org_group_rules: string;
  default_org_email_domains: string;
  default_user_role: string;
}

export async function loadManagedAuthProviderConfigs(fetchJSON: ClientFetchJSON = clientFetchJSON): Promise<unknown> {
  return fetchJSON(adminAuthProviderConfigsBFFEndpoint);
}

export async function loadManagedAuthProviderDetail(provider: string, fetchJSON: ClientFetchJSON = clientFetchJSON): Promise<unknown> {
  return fetchJSON(buildAdminAuthProviderConfigBFFEndpoint(provider));
}

export async function saveManagedAuthProvider(
  input: SaveManagedAuthProviderInput,
  fetchJSON: ClientFetchJSON = clientFetchJSON
): Promise<unknown> {
  const payload: Record<string, unknown> = { ...input };

  return fetchJSON(adminAuthProviderConfigsBFFEndpoint, {
    method: "POST",
    body: payload
  });
}

export async function disableManagedAuthProvider(provider: string, fetchJSON: ClientFetchJSON = clientFetchJSON): Promise<unknown> {
  return fetchJSON(buildAdminAuthProviderConfigDisableBFFEndpoint(provider), {
    method: "POST"
  });
}
