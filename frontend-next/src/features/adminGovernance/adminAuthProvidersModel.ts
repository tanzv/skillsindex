import { asArray, asBoolean, asNumber, asObject, asString } from "./shared";

export interface ManagedAuthProviderDefinition {
  key: string;
  defaultDisplayName: string;
  managementKind: "oidc";
}

export interface ManagedAuthProviderInventoryItem {
  key: string;
  displayName: string;
  managementKind: string;
  configurable: boolean;
  enabled: boolean;
  connected: boolean;
  available: boolean;
  startPath: string;
  connectorId: number;
  description: string;
  baseUrl: string;
  updatedAt: string;
}

export interface ManagedAuthProviderDetailRecord extends ManagedAuthProviderInventoryItem {
  name: string;
  provider: string;
  issuer: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  claimExternalId: string;
  claimUsername: string;
  claimEmail: string;
  claimEmailVerified: string;
  claimGroups: string;
  offboardingMode: string;
  mappingMode: string;
  defaultOrgId: number;
  defaultOrgRole: string;
  defaultOrgGroupRules: string;
  defaultOrgEmailDomains: string;
  defaultUserRole: string;
}

export interface ManagedAuthProvidersInventory {
  items: ManagedAuthProviderInventoryItem[];
}

export interface ManagedAuthProviderDraft {
  provider: string;
  name: string;
  description: string;
  issuer: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  claimExternalId: string;
  claimUsername: string;
  claimEmail: string;
  claimEmailVerified: string;
  claimGroups: string;
  offboardingMode: string;
  mappingMode: string;
  defaultOrgId: string;
  defaultOrgRole: string;
  defaultOrgGroupRules: string;
  defaultOrgEmailDomains: string;
  defaultUserRole: string;
}

export const managedAuthProviderDefinitions: ManagedAuthProviderDefinition[] = [
  { key: "dingtalk", defaultDisplayName: "DingTalk", managementKind: "oidc" },
  { key: "feishu", defaultDisplayName: "Feishu", managementKind: "oidc" },
  { key: "github", defaultDisplayName: "GitHub", managementKind: "oidc" },
  { key: "google", defaultDisplayName: "Google", managementKind: "oidc" },
  { key: "wecom", defaultDisplayName: "WeCom", managementKind: "oidc" },
  { key: "microsoft", defaultDisplayName: "Microsoft", managementKind: "oidc" }
];

function buildDefaultInventoryItem(definition: ManagedAuthProviderDefinition): ManagedAuthProviderInventoryItem {
  return {
    key: definition.key,
    displayName: definition.defaultDisplayName,
    managementKind: definition.managementKind,
    configurable: true,
    enabled: false,
    connected: false,
    available: false,
    startPath: "",
    connectorId: 0,
    description: "",
    baseUrl: "",
    updatedAt: ""
  };
}

function normalizeInventoryItem(value: unknown, definition: ManagedAuthProviderDefinition): ManagedAuthProviderInventoryItem {
  const record = asObject(value);
  return {
    key: definition.key,
    displayName: asString(record.display_name) || definition.defaultDisplayName,
    managementKind: asString(record.management_kind) || definition.managementKind,
    configurable: asBoolean(record.configurable) || !Object.prototype.hasOwnProperty.call(record, "configurable"),
    enabled: asBoolean(record.enabled),
    connected: asBoolean(record.connected),
    available: asBoolean(record.available),
    startPath: asString(record.start_path),
    connectorId: asNumber(record.connector_id),
    description: asString(record.description),
    baseUrl: asString(record.base_url),
    updatedAt: asString(record.updated_at)
  };
}

export function normalizeManagedAuthProvidersPayload(payload: unknown): ManagedAuthProvidersInventory {
  const record = asObject(payload);
  const byKey = new Map<string, unknown>();

  for (const item of asArray<unknown>(record.items)) {
    const itemRecord = asObject(item);
    const key = asString(itemRecord.key).toLowerCase();
    if (!key) {
      continue;
    }
    byKey.set(key, itemRecord);
  }

  return {
    items: managedAuthProviderDefinitions.map((definition) => {
      const current = byKey.get(definition.key);
      return current ? normalizeInventoryItem(current, definition) : buildDefaultInventoryItem(definition);
    })
  };
}

export function resolveManagedAuthProviderDefinition(provider: string): ManagedAuthProviderDefinition | null {
  return managedAuthProviderDefinitions.find((item) => item.key === provider) || null;
}

export function normalizeManagedAuthProviderDetailPayload(payload: unknown): ManagedAuthProviderDetailRecord {
  const record = asObject(payload);
  const item = asObject(record.item);
  const provider = asString(item.provider || item.key).toLowerCase();
  const definition = resolveManagedAuthProviderDefinition(provider) || managedAuthProviderDefinitions[0];
  const inventory = normalizeInventoryItem(item, definition);

  return {
    ...inventory,
    name: asString(item.name) || inventory.displayName,
    provider: definition.key,
    issuer: asString(item.issuer),
    authorizationUrl: asString(item.authorization_url),
    tokenUrl: asString(item.token_url),
    userInfoUrl: asString(item.userinfo_url),
    clientId: asString(item.client_id),
    clientSecret: asString(item.client_secret),
    scope: asString(item.scope) || "openid profile email",
    claimExternalId: asString(item.claim_external_id) || "sub",
    claimUsername: asString(item.claim_username) || "preferred_username",
    claimEmail: asString(item.claim_email) || "email",
    claimEmailVerified: asString(item.claim_email_verified) || "email_verified",
    claimGroups: asString(item.claim_groups) || "groups",
    offboardingMode: asString(item.offboarding_mode) || "disable_only",
    mappingMode: asString(item.mapping_mode) || "external_email_username",
    defaultOrgId: asNumber(item.default_org_id),
    defaultOrgRole: asString(item.default_org_role) || "member",
    defaultOrgGroupRules: asString(item.default_org_group_rules) || "[]",
    defaultOrgEmailDomains: asString(item.default_org_email_domains),
    defaultUserRole: asString(item.default_user_role) || "member"
  };
}

export function createManagedAuthProviderDraft(
  definition: ManagedAuthProviderDefinition,
  detail?: ManagedAuthProviderDetailRecord | null
): ManagedAuthProviderDraft {
  return {
    provider: definition.key,
    name: detail?.name || definition.defaultDisplayName,
    description: detail?.description || "",
    issuer: detail?.issuer || "",
    authorizationUrl: detail?.authorizationUrl || "",
    tokenUrl: detail?.tokenUrl || "",
    userInfoUrl: detail?.userInfoUrl || "",
    clientId: detail?.clientId || "",
    clientSecret: detail?.clientSecret || "",
    scope: detail?.scope || "openid profile email",
    claimExternalId: detail?.claimExternalId || "sub",
    claimUsername: detail?.claimUsername || "preferred_username",
    claimEmail: detail?.claimEmail || "email",
    claimEmailVerified: detail?.claimEmailVerified || "email_verified",
    claimGroups: detail?.claimGroups || "groups",
    offboardingMode: detail?.offboardingMode || "disable_only",
    mappingMode: detail?.mappingMode || "external_email_username",
    defaultOrgId: detail ? String(detail.defaultOrgId || 0) : "0",
    defaultOrgRole: detail?.defaultOrgRole || "member",
    defaultOrgGroupRules: detail?.defaultOrgGroupRules || "[]",
    defaultOrgEmailDomains: detail?.defaultOrgEmailDomains || "",
    defaultUserRole: detail?.defaultUserRole || "member"
  };
}
