const adminAPIBase = "/api/v1/admin";
const accountAPIBase = "/api/v1/account";

export function buildBFFPath(apiPath: string): string {
  const normalizedPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  if (normalizedPath.startsWith("/api/v1/")) {
    return `/api/bff/${normalizedPath.slice("/api/v1/".length)}`;
  }
  if (normalizedPath === "/api/v1") {
    return "/api/bff";
  }
  return normalizedPath;
}

export const adminOverviewEndpoint = `${adminAPIBase}/overview`;
export const adminManualIntakeEndpoint = `${adminAPIBase}/ingestion/manual`;
export const adminRepositoryIntakeEndpoint = `${adminAPIBase}/ingestion/repository`;
export const adminAccountsEndpoint = `${adminAPIBase}/accounts`;
export const adminRegistrationSettingsEndpoint = `${adminAPIBase}/settings/registration`;
export const adminMarketplaceRankingSettingsEndpoint = `${adminAPIBase}/settings/marketplace-ranking`;
export const adminCategoryCatalogSettingsEndpoint = `${adminAPIBase}/settings/category-catalog`;
export const adminPresentationTaxonomySettingsEndpoint = `${adminAPIBase}/settings/presentation-taxonomy`;
export const adminAuthProvidersSettingsEndpoint = `${adminAPIBase}/settings/auth-providers`;
export const adminSkillsEndpoint = `${adminAPIBase}/skills`;
export const adminSyncPolicyEndpoint = `${adminAPIBase}/sync-policy/repository`;
export const adminIntegrationsEndpoint = `${adminAPIBase}/integrations`;
export const adminJobsEndpoint = `${adminAPIBase}/jobs`;
export const adminSyncJobsEndpoint = `${adminAPIBase}/sync-jobs`;

export const adminReleaseGatesEndpoint = `${adminAPIBase}/ops/release-gates`;
export const adminRunReleaseGatesEndpoint = `${adminReleaseGatesEndpoint}/run`;
export const adminMetricsEndpoint = `${adminAPIBase}/ops/metrics`;
export const adminAlertsEndpoint = `${adminAPIBase}/ops/alerts`;
export const adminAuditExportEndpoint = `${adminAPIBase}/ops/audit-export`;
export const adminRecoveryDrillsEndpoint = `${adminAPIBase}/ops/recovery-drills`;
export const adminRunRecoveryDrillEndpoint = `${adminRecoveryDrillsEndpoint}/run`;
export const adminReleasesEndpoint = `${adminAPIBase}/ops/releases`;
export const adminChangeApprovalsEndpoint = `${adminAPIBase}/ops/change-approvals`;
export const adminBackupPlansEndpoint = `${adminAPIBase}/ops/backup/plans`;
export const adminBackupRunsEndpoint = `${adminAPIBase}/ops/backup/runs`;
export const adminAPIKeysEndpoint = `${adminAPIBase}/apikeys`;
export const adminOrganizationsEndpoint = `${adminAPIBase}/organizations`;
export const adminModerationEndpoint = `${adminAPIBase}/moderation`;

export const adminOverviewBFFEndpoint = buildBFFPath(adminOverviewEndpoint);
export const adminAccountsBFFEndpoint = buildBFFPath(adminAccountsEndpoint);
export const adminRegistrationSettingsBFFEndpoint = buildBFFPath(adminRegistrationSettingsEndpoint);
export const adminMarketplaceRankingSettingsBFFEndpoint = buildBFFPath(adminMarketplaceRankingSettingsEndpoint);
export const adminCategoryCatalogSettingsBFFEndpoint = buildBFFPath(adminCategoryCatalogSettingsEndpoint);
export const adminPresentationTaxonomySettingsBFFEndpoint = buildBFFPath(adminPresentationTaxonomySettingsEndpoint);
export const adminAuthProvidersSettingsBFFEndpoint = buildBFFPath(adminAuthProvidersSettingsEndpoint);

export function buildAdminAccountStatusEndpoint(userID: number): string {
  return `${adminAccountsEndpoint}/${userID}/status`;
}

export function buildAdminAccountForceSignoutEndpoint(userID: number): string {
  return `${adminAccountsEndpoint}/${userID}/force-signout`;
}

export function buildAdminAccountPasswordResetEndpoint(userID: number): string {
  return `${adminAccountsEndpoint}/${userID}/password-reset`;
}

export function buildAdminUserRoleEndpoint(userID: number): string {
  return `${adminAPIBase}/users/${userID}/role`;
}

export function buildAdminJobRetryEndpoint(jobID: number): string {
  return `${adminJobsEndpoint}/${jobID}/retry`;
}

export function buildAdminJobCancelEndpoint(jobID: number): string {
  return `${adminJobsEndpoint}/${jobID}/cancel`;
}

export function buildAdminAPIKeyRevokeEndpoint(keyID: number): string {
  return `${adminAPIKeysEndpoint}/${keyID}/revoke`;
}

export function buildAdminOrganizationMembersEndpoint(orgID: number): string {
  return `${adminOrganizationsEndpoint}/${orgID}/members`;
}

export function buildAdminModerationResolveEndpoint(caseID: number): string {
  return `${adminModerationEndpoint}/${caseID}/resolve`;
}

export function buildAdminModerationRejectEndpoint(caseID: number): string {
  return `${adminModerationEndpoint}/${caseID}/reject`;
}

export function buildAdminAccountStatusBFFEndpoint(userID: number): string {
  return buildBFFPath(buildAdminAccountStatusEndpoint(userID));
}

export function buildAdminAccountForceSignoutBFFEndpoint(userID: number): string {
  return buildBFFPath(buildAdminAccountForceSignoutEndpoint(userID));
}

export function buildAdminAccountPasswordResetBFFEndpoint(userID: number): string {
  return buildBFFPath(buildAdminAccountPasswordResetEndpoint(userID));
}

export function buildAdminUserRoleBFFEndpoint(userID: number): string {
  return buildBFFPath(buildAdminUserRoleEndpoint(userID));
}

export const accountProfileEndpoint = `${accountAPIBase}/profile`;
export const accountSecurityPasswordEndpoint = `${accountAPIBase}/security/password`;
export const accountSessionsEndpoint = `${accountAPIBase}/sessions`;
export const accountSessionsRevokeOthersEndpoint = `${accountSessionsEndpoint}/revoke-others`;
export const accountAPIKeysEndpoint = `${accountAPIBase}/apikeys`;

export const accountProfileBFFEndpoint = buildBFFPath(accountProfileEndpoint);
export const accountSecurityPasswordBFFEndpoint = buildBFFPath(accountSecurityPasswordEndpoint);
export const accountSessionsBFFEndpoint = buildBFFPath(accountSessionsEndpoint);
export const accountSessionsRevokeOthersBFFEndpoint = buildBFFPath(accountSessionsRevokeOthersEndpoint);
export const accountAPIKeysBFFEndpoint = buildBFFPath(accountAPIKeysEndpoint);

export function buildAccountSessionRevokeEndpoint(sessionID: string): string {
  return `${accountSessionsEndpoint}/${encodeURIComponent(sessionID)}/revoke`;
}

export function buildAccountAPIKeyRotateEndpoint(keyID: number): string {
  return `${accountAPIKeysEndpoint}/${keyID}/rotate`;
}

export function buildAccountAPIKeyRevokeEndpoint(keyID: number): string {
  return `${accountAPIKeysEndpoint}/${keyID}/revoke`;
}

export function buildAccountAPIKeyScopesEndpoint(keyID: number): string {
  return `${accountAPIKeysEndpoint}/${keyID}/scopes`;
}

export function buildAccountSessionRevokeBFFEndpoint(sessionID: string): string {
  return buildBFFPath(buildAccountSessionRevokeEndpoint(sessionID));
}

export function buildAccountAPIKeyRotateBFFEndpoint(keyID: number): string {
  return buildBFFPath(buildAccountAPIKeyRotateEndpoint(keyID));
}

export function buildAccountAPIKeyRevokeBFFEndpoint(keyID: number): string {
  return buildBFFPath(buildAccountAPIKeyRevokeEndpoint(keyID));
}

export function buildAccountAPIKeyScopesBFFEndpoint(keyID: number): string {
  return buildBFFPath(buildAccountAPIKeyScopesEndpoint(keyID));
}
