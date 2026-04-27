const adminAPIBase = "/api/v1/admin";
const accountAPIBase = "/api/v1/account";
const skillAPIBase = "/api/v1/skills";

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

function buildQueryPath(
  basePath: string,
  query: Record<string, string | number | null | undefined>,
): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return;
    }
    params.set(key, String(value));
  });
  const suffix = params.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
}

export const adminOverviewEndpoint = `${adminAPIBase}/overview`;
export const adminManualIntakeEndpoint = `${adminAPIBase}/ingestion/manual`;
export const adminRepositoryIntakeEndpoint = `${adminAPIBase}/ingestion/repository`;
export const adminUploadIntakeEndpoint = `${adminAPIBase}/ingestion/upload`;
export const adminSkillMPIntakeEndpoint = `${adminAPIBase}/ingestion/skillmp`;
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
export const adminAuthProviderConfigsEndpoint = `${adminAPIBase}/auth-provider-configs`;
export const adminOrganizationsEndpoint = `${adminAPIBase}/organizations`;
export const adminModerationEndpoint = `${adminAPIBase}/moderation`;

export const adminOverviewBFFEndpoint = buildBFFPath(adminOverviewEndpoint);
export const adminManualIntakeBFFEndpoint = buildBFFPath(adminManualIntakeEndpoint);
export const adminRepositoryIntakeBFFEndpoint = buildBFFPath(adminRepositoryIntakeEndpoint);
export const adminUploadIntakeBFFEndpoint = buildBFFPath(adminUploadIntakeEndpoint);
export const adminSkillMPIntakeBFFEndpoint = buildBFFPath(adminSkillMPIntakeEndpoint);
export const adminAccountsBFFEndpoint = buildBFFPath(adminAccountsEndpoint);
export const adminRegistrationSettingsBFFEndpoint = buildBFFPath(
  adminRegistrationSettingsEndpoint,
);
export const adminMarketplaceRankingSettingsBFFEndpoint = buildBFFPath(
  adminMarketplaceRankingSettingsEndpoint,
);
export const adminCategoryCatalogSettingsBFFEndpoint = buildBFFPath(
  adminCategoryCatalogSettingsEndpoint,
);
export const adminPresentationTaxonomySettingsBFFEndpoint = buildBFFPath(
  adminPresentationTaxonomySettingsEndpoint,
);
export const adminAuthProvidersSettingsBFFEndpoint = buildBFFPath(
  adminAuthProvidersSettingsEndpoint,
);
export const adminIntegrationsBFFEndpoint = buildBFFPath(
  adminIntegrationsEndpoint,
);
export const adminAPIKeysBFFEndpoint = buildBFFPath(adminAPIKeysEndpoint);
export const adminAuthProviderConfigsBFFEndpoint = buildBFFPath(
  adminAuthProviderConfigsEndpoint,
);
export const adminOrganizationsBFFEndpoint = buildBFFPath(
  adminOrganizationsEndpoint,
);
export const adminModerationBFFEndpoint = buildBFFPath(adminModerationEndpoint);
export const adminSkillsBFFEndpoint = buildBFFPath(adminSkillsEndpoint);
export const adminJobsBFFEndpoint = buildBFFPath(adminJobsEndpoint);
export const adminSyncPolicyBFFEndpoint = buildBFFPath(adminSyncPolicyEndpoint);
export const adminSyncJobsBFFEndpoint = buildBFFPath(adminSyncJobsEndpoint);
export const adminAuditExportBFFEndpoint = buildBFFPath(adminAuditExportEndpoint);

export function buildAdminAccountStatusEndpoint(userID: number): string {
  return `${adminAccountsEndpoint}/${userID}/status`;
}

export function buildAdminSkillsCollectionEndpoint(source: string): string {
  return buildQueryPath(adminSkillsEndpoint, { source });
}

export function buildAdminJobsCollectionEndpoint(limit: number): string {
  return buildQueryPath(adminJobsEndpoint, { limit });
}

export function buildAdminSyncJobsCollectionEndpoint(limit: number): string {
  return buildQueryPath(adminSyncJobsEndpoint, { limit });
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

export function buildAdminSkillSyncEndpoint(skillID: number): string {
  return `${adminSkillsEndpoint}/${skillID}/sync`;
}

export function buildAdminSkillVisibilityEndpoint(skillID: number): string {
  return `${adminSkillsEndpoint}/${skillID}/visibility`;
}

export function buildAdminSkillDeleteEndpoint(skillID: number): string {
  return `${adminSkillsEndpoint}/${skillID}/delete`;
}

export function buildSkillVersionsEndpoint(
  skillID: number,
  query: {
    limit?: number;
    includeArchived?: boolean;
    trigger?: string;
  } = {},
): string {
  return buildQueryPath(`${skillAPIBase}/${skillID}/versions`, {
    limit: query.limit,
    include_archived: query.includeArchived ? "true" : undefined,
    trigger: query.trigger,
  });
}

export function buildSkillVersionRollbackEndpoint(
  skillID: number,
  versionID: number,
): string {
  return `${skillAPIBase}/${skillID}/versions/${versionID}/rollback`;
}

export function buildSkillVersionRestoreEndpoint(
  skillID: number,
  versionID: number,
): string {
  return `${skillAPIBase}/${skillID}/versions/${versionID}/restore`;
}

export function buildAdminAPIKeyRevokeEndpoint(keyID: number): string {
  return `${adminAPIKeysEndpoint}/${keyID}/revoke`;
}

export function buildAdminAPIKeyRotateEndpoint(keyID: number): string {
  return `${adminAPIKeysEndpoint}/${keyID}/rotate`;
}

export function buildAdminAPIKeyScopesEndpoint(keyID: number): string {
  return `${adminAPIKeysEndpoint}/${keyID}/scopes`;
}

export function buildAdminAuthProviderConfigEndpoint(provider: string): string {
  return `${adminAuthProviderConfigsEndpoint}/${encodeURIComponent(provider)}`;
}

export function buildAdminAuthProviderConfigDisableEndpoint(
  provider: string,
): string {
  return `${buildAdminAuthProviderConfigEndpoint(provider)}/disable`;
}

export function buildAdminOrganizationMembersEndpoint(orgID: number): string {
  return `${adminOrganizationsEndpoint}/${orgID}/members`;
}

export function buildAdminOrganizationMemberRoleEndpoint(
  orgID: number,
  userID: number,
): string {
  return `${buildAdminOrganizationMembersEndpoint(orgID)}/${userID}/role`;
}

export function buildAdminOrganizationMemberRemoveEndpoint(
  orgID: number,
  userID: number,
): string {
  return `${buildAdminOrganizationMembersEndpoint(orgID)}/${userID}/remove`;
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

export function buildAdminSkillsCollectionBFFEndpoint(source: string): string {
  return buildBFFPath(buildAdminSkillsCollectionEndpoint(source));
}

export function buildAdminJobsCollectionBFFEndpoint(limit: number): string {
  return buildBFFPath(buildAdminJobsCollectionEndpoint(limit));
}

export function buildAdminSyncJobsCollectionBFFEndpoint(limit: number): string {
  return buildBFFPath(buildAdminSyncJobsCollectionEndpoint(limit));
}

export function buildAdminAuditExportBFFEndpoint(format: string): string {
  return buildQueryPath(adminAuditExportBFFEndpoint, { format });
}

export function buildAdminAccountForceSignoutBFFEndpoint(
  userID: number,
): string {
  return buildBFFPath(buildAdminAccountForceSignoutEndpoint(userID));
}

export function buildAdminAccountPasswordResetBFFEndpoint(
  userID: number,
): string {
  return buildBFFPath(buildAdminAccountPasswordResetEndpoint(userID));
}

export function buildAdminUserRoleBFFEndpoint(userID: number): string {
  return buildBFFPath(buildAdminUserRoleEndpoint(userID));
}

export function buildAdminJobRetryBFFEndpoint(jobID: number): string {
  return buildBFFPath(buildAdminJobRetryEndpoint(jobID));
}

export function buildAdminJobCancelBFFEndpoint(jobID: number): string {
  return buildBFFPath(buildAdminJobCancelEndpoint(jobID));
}

export function buildAdminSkillSyncBFFEndpoint(skillID: number): string {
  return buildBFFPath(buildAdminSkillSyncEndpoint(skillID));
}

export function buildAdminSkillVisibilityBFFEndpoint(skillID: number): string {
  return buildBFFPath(buildAdminSkillVisibilityEndpoint(skillID));
}

export function buildAdminSkillDeleteBFFEndpoint(skillID: number): string {
  return buildBFFPath(buildAdminSkillDeleteEndpoint(skillID));
}

export function buildSkillVersionsBFFEndpoint(
  skillID: number,
  query: {
    limit?: number;
    includeArchived?: boolean;
    trigger?: string;
  } = {},
): string {
  return buildBFFPath(buildSkillVersionsEndpoint(skillID, query));
}

export function buildSkillVersionRollbackBFFEndpoint(
  skillID: number,
  versionID: number,
): string {
  return buildBFFPath(buildSkillVersionRollbackEndpoint(skillID, versionID));
}

export function buildSkillVersionRestoreBFFEndpoint(
  skillID: number,
  versionID: number,
): string {
  return buildBFFPath(buildSkillVersionRestoreEndpoint(skillID, versionID));
}

export function buildAdminAPIKeyRevokeBFFEndpoint(keyID: number): string {
  return buildBFFPath(buildAdminAPIKeyRevokeEndpoint(keyID));
}

export function buildAdminAPIKeyRotateBFFEndpoint(keyID: number): string {
  return buildBFFPath(buildAdminAPIKeyRotateEndpoint(keyID));
}

export function buildAdminAPIKeyScopesBFFEndpoint(keyID: number): string {
  return buildBFFPath(buildAdminAPIKeyScopesEndpoint(keyID));
}

export function buildAdminAuthProviderConfigBFFEndpoint(
  provider: string,
): string {
  return buildBFFPath(buildAdminAuthProviderConfigEndpoint(provider));
}

export function buildAdminAuthProviderConfigDisableBFFEndpoint(
  provider: string,
): string {
  return buildBFFPath(buildAdminAuthProviderConfigDisableEndpoint(provider));
}

export function buildAdminOrganizationMembersBFFEndpoint(
  orgID: number,
): string {
  return buildBFFPath(buildAdminOrganizationMembersEndpoint(orgID));
}

export function buildAdminOrganizationMemberRoleBFFEndpoint(
  orgID: number,
  userID: number,
): string {
  return buildBFFPath(buildAdminOrganizationMemberRoleEndpoint(orgID, userID));
}

export function buildAdminOrganizationMemberRemoveBFFEndpoint(
  orgID: number,
  userID: number,
): string {
  return buildBFFPath(
    buildAdminOrganizationMemberRemoveEndpoint(orgID, userID),
  );
}

export function buildAdminModerationResolveBFFEndpoint(caseID: number): string {
  return buildBFFPath(buildAdminModerationResolveEndpoint(caseID));
}

export function buildAdminModerationRejectBFFEndpoint(caseID: number): string {
  return buildBFFPath(buildAdminModerationRejectEndpoint(caseID));
}

export const accountProfileEndpoint = `${accountAPIBase}/profile`;
export const accountSecurityPasswordEndpoint = `${accountAPIBase}/security/password`;
export const accountSessionsEndpoint = `${accountAPIBase}/sessions`;
export const accountSessionsRevokeOthersEndpoint = `${accountSessionsEndpoint}/revoke-others`;
export const accountAPIKeysEndpoint = `${accountAPIBase}/apikeys`;

export const accountProfileBFFEndpoint = buildBFFPath(accountProfileEndpoint);
export const accountSecurityPasswordBFFEndpoint = buildBFFPath(
  accountSecurityPasswordEndpoint,
);
export const accountSessionsBFFEndpoint = buildBFFPath(accountSessionsEndpoint);
export const accountSessionsRevokeOthersBFFEndpoint = buildBFFPath(
  accountSessionsRevokeOthersEndpoint,
);
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

export function buildAccountSessionRevokeBFFEndpoint(
  sessionID: string,
): string {
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
