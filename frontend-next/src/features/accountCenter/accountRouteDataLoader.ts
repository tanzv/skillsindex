import { clientFetchJSON, type ClientFetchJSONOptions } from "@/src/lib/http/clientFetch";
import { resolveAccountRouteDataRequirements } from "@/src/lib/routing/accountRouteMeta";
import {
  accountAPIKeysBFFEndpoint,
  accountProfileBFFEndpoint,
  accountSessionsBFFEndpoint
} from "@/src/lib/routing/protectedSurfaceEndpoints";

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
    fetchJSON<AccountProfilePayload>(accountProfileBFFEndpoint),
    requirements.sessions ? fetchJSON<AccountSessionsPayload>(accountSessionsBFFEndpoint) : Promise.resolve(null),
    requirements.credentials ? fetchJSON<AccountAPIKeysPayload>(accountAPIKeysBFFEndpoint) : Promise.resolve(null)
  ]);

  return {
    profilePayload,
    sessionsPayload,
    credentialsPayload
  };
}
