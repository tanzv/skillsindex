import { protectedPageMessageKeyMap, type ProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages";

type ProtectedPageMessageOverrides = {
  [K in keyof ProtectedPageMessages]?: Partial<ProtectedPageMessages[K]>;
};

function buildMessageGroup<T extends Record<string, string>>(group: T) {
  return Object.fromEntries(Object.keys(group).map((key) => [key, key])) as { [K in keyof T]: string };
}

export function createProtectedPageTestMessages(overrides: ProtectedPageMessageOverrides = {}): ProtectedPageMessages {
  const base: ProtectedPageMessages = {
    adminCommon: buildMessageGroup(protectedPageMessageKeyMap.adminCommon),
    accountCenter: buildMessageGroup(protectedPageMessageKeyMap.accountCenter),
    adminApiKeys: buildMessageGroup(protectedPageMessageKeyMap.adminApiKeys),
    adminOverview: buildMessageGroup(protectedPageMessageKeyMap.adminOverview),
    adminOperations: buildMessageGroup(protectedPageMessageKeyMap.adminOperations),
    adminOrganizations: buildMessageGroup(protectedPageMessageKeyMap.adminOrganizations),
    adminModeration: buildMessageGroup(protectedPageMessageKeyMap.adminModeration),
    adminAccess: buildMessageGroup(protectedPageMessageKeyMap.adminAccess),
    adminAccounts: buildMessageGroup(protectedPageMessageKeyMap.adminAccounts),
    adminCatalog: buildMessageGroup(protectedPageMessageKeyMap.adminCatalog),
    adminIngestion: buildMessageGroup(protectedPageMessageKeyMap.adminIngestion),
    adminIntegrations: buildMessageGroup(protectedPageMessageKeyMap.adminIntegrations),
    workspace: buildMessageGroup(protectedPageMessageKeyMap.workspace)
  };

  return {
    adminCommon: { ...base.adminCommon, ...overrides.adminCommon },
    accountCenter: { ...base.accountCenter, ...overrides.accountCenter },
    adminApiKeys: { ...base.adminApiKeys, ...overrides.adminApiKeys },
    adminOverview: { ...base.adminOverview, ...overrides.adminOverview },
    adminOperations: { ...base.adminOperations, ...overrides.adminOperations },
    adminOrganizations: { ...base.adminOrganizations, ...overrides.adminOrganizations },
    adminModeration: { ...base.adminModeration, ...overrides.adminModeration },
    adminAccess: { ...base.adminAccess, ...overrides.adminAccess },
    adminAccounts: { ...base.adminAccounts, ...overrides.adminAccounts },
    adminCatalog: { ...base.adminCatalog, ...overrides.adminCatalog },
    adminIngestion: { ...base.adminIngestion, ...overrides.adminIngestion },
    adminIntegrations: { ...base.adminIntegrations, ...overrides.adminIntegrations },
    workspace: { ...base.workspace, ...overrides.workspace }
  };
}
