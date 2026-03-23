import { clientFetchJSON, type ClientFetchJSONOptions } from "@/src/lib/http/clientFetch";
import { resolveAccountRouteDataRequirements } from "@/src/lib/routing/accountRouteMeta";

import type {
  AccountAPIKeysPayload,
  AccountProfilePayload,
  AccountRoute,
  AccountSessionsPayload
} from "./model";

export interface AccountRouteDataSnapshot {
  profilePayload: AccountProfilePayload | null;
  sessionsPayload: AccountSessionsPayload | null;
  credentialsPayload: AccountAPIKeysPayload | null;
}

export type AccountRouteDataFetch = <T>(input: string, options?: ClientFetchJSONOptions) => Promise<T>;

export { resolveAccountRouteDataRequirements };

export function hasRequiredAccountRouteData(
  route: AccountRoute,
  snapshot: AccountRouteDataSnapshot
): boolean {
  const requirements = resolveAccountRouteDataRequirements(route);

  if (!snapshot.profilePayload) {
    return false;
  }

  if (requirements.sessions && !snapshot.sessionsPayload) {
    return false;
  }

  if (requirements.credentials && !snapshot.credentialsPayload) {
    return false;
  }

  return true;
}

export async function loadAccountRouteData(
  route: AccountRoute,
  fetchJSON: AccountRouteDataFetch = clientFetchJSON
): Promise<AccountRouteDataSnapshot> {
  const requirements = resolveAccountRouteDataRequirements(route);
  const [profilePayload, sessionsPayload, credentialsPayload] = await Promise.all([
    fetchJSON<AccountProfilePayload>("/api/bff/account/profile"),
    requirements.sessions ? fetchJSON<AccountSessionsPayload>("/api/bff/account/sessions") : Promise.resolve(null),
    requirements.credentials ? fetchJSON<AccountAPIKeysPayload>("/api/bff/account/apikeys") : Promise.resolve(null)
  ]);

  return {
    profilePayload,
    sessionsPayload,
    credentialsPayload
  };
}
