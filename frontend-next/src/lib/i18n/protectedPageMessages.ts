export type { AdminCommonMessages } from "./protectedPageMessages.common";
export { adminCommonMessageKeyMap } from "./protectedPageMessages.common";
export type { AccountCenterMessages } from "./protectedPageMessages.accountCenter";
export { accountCenterMessageKeyMap } from "./protectedPageMessages.accountCenter";
export type { AdminApiKeysMessages } from "./protectedPageMessages.apikeys";
export { adminApiKeysMessageKeyMap } from "./protectedPageMessages.apikeys";
export type { AdminOrganizationsMessages } from "./protectedPageMessages.organizations";
export { adminOrganizationsMessageKeyMap } from "./protectedPageMessages.organizations";
export type { AdminModerationMessages } from "./protectedPageMessages.moderation";
export { adminModerationMessageKeyMap } from "./protectedPageMessages.moderation";
export type { AdminOverviewMessages } from "./protectedPageMessages.overview";
export { adminOverviewMessageKeyMap } from "./protectedPageMessages.overview";
export type { AdminOperationsMessages } from "./protectedPageMessages.operations";
export { adminOperationsMessageKeyMap } from "./protectedPageMessages.operations";
export type { AdminAccessMessages } from "./protectedPageMessages.access";
export { adminAccessMessageKeyMap } from "./protectedPageMessages.access";
export type { AdminAccountsMessages } from "./protectedPageMessages.accounts";
export { adminAccountsMessageKeyMap } from "./protectedPageMessages.accounts";
export type { AdminCatalogMessages } from "./protectedPageMessages.catalog";
export { adminCatalogMessageKeyMap } from "./protectedPageMessages.catalog";
export type { AdminIngestionMessages } from "./protectedPageMessages.ingestion";
export { adminIngestionMessageKeyMap } from "./protectedPageMessages.ingestion";
export type { AdminIntegrationsMessages } from "./protectedPageMessages.integrations";
export { adminIntegrationsMessageFallbacks, adminIntegrationsMessageKeyMap } from "./protectedPageMessages.integrations";
export type { WorkspaceMessages } from "./protectedPageMessages.workspace";
export { workspaceMessageKeyMap } from "./protectedPageMessages.workspace";

import { adminApiKeysMessageKeyMap, type AdminApiKeysMessages } from "./protectedPageMessages.apikeys";
import { adminAccessMessageKeyMap, type AdminAccessMessages } from "./protectedPageMessages.access";
import { adminAccountsMessageKeyMap, type AdminAccountsMessages } from "./protectedPageMessages.accounts";
import { accountCenterMessageKeyMap, type AccountCenterMessages } from "./protectedPageMessages.accountCenter";
import { adminCatalogMessageKeyMap, type AdminCatalogMessages } from "./protectedPageMessages.catalog";
import { adminCommonMessageKeyMap, type AdminCommonMessages } from "./protectedPageMessages.common";
import { adminIngestionMessageKeyMap, type AdminIngestionMessages } from "./protectedPageMessages.ingestion";
import { adminIntegrationsMessageKeyMap, type AdminIntegrationsMessages } from "./protectedPageMessages.integrations";
import { adminOperationsMessageKeyMap, type AdminOperationsMessages } from "./protectedPageMessages.operations";
import { adminModerationMessageKeyMap, type AdminModerationMessages } from "./protectedPageMessages.moderation";
import { adminOverviewMessageKeyMap, type AdminOverviewMessages } from "./protectedPageMessages.overview";
import { adminOrganizationsMessageKeyMap, type AdminOrganizationsMessages } from "./protectedPageMessages.organizations";
import { workspaceMessageKeyMap, type WorkspaceMessages } from "./protectedPageMessages.workspace";

export interface ProtectedPageMessages {
  adminCommon: AdminCommonMessages;
  accountCenter: AccountCenterMessages;
  adminApiKeys: AdminApiKeysMessages;
  adminOverview: AdminOverviewMessages;
  adminOperations: AdminOperationsMessages;
  adminOrganizations: AdminOrganizationsMessages;
  adminModeration: AdminModerationMessages;
  adminAccess: AdminAccessMessages;
  adminAccounts: AdminAccountsMessages;
  adminCatalog: AdminCatalogMessages;
  adminIngestion: AdminIngestionMessages;
  adminIntegrations: AdminIntegrationsMessages;
  workspace: WorkspaceMessages;
}

export const protectedPageMessageKeyMap = {
  adminCommon: adminCommonMessageKeyMap,
  accountCenter: accountCenterMessageKeyMap,
  adminApiKeys: adminApiKeysMessageKeyMap,
  adminOverview: adminOverviewMessageKeyMap,
  adminOperations: adminOperationsMessageKeyMap,
  adminOrganizations: adminOrganizationsMessageKeyMap,
  adminModeration: adminModerationMessageKeyMap,
  adminAccess: adminAccessMessageKeyMap,
  adminAccounts: adminAccountsMessageKeyMap,
  adminCatalog: adminCatalogMessageKeyMap,
  adminIngestion: adminIngestionMessageKeyMap,
  adminIntegrations: adminIntegrationsMessageKeyMap,
  workspace: workspaceMessageKeyMap
} as const satisfies {
  [K in keyof ProtectedPageMessages]: {
    [P in keyof ProtectedPageMessages[K]]: string;
  };
};
