package web

import "github.com/go-chi/chi/v5"

func (a *App) registerDashboardRoutes(r chi.Router) {
	r.Group(func(private chi.Router) {
		private.Use(a.requireAuth)
		private.Use(a.requireDashboardAccess)
		a.registerAdminPageRoutes(private)
		a.registerAdminOverviewRoutes(private)
		a.registerAdminIngestionRoutes(private)
		a.registerAdminSyncGovernanceRoutes(private)
		a.registerAdminAccessRoutes(private)
		a.registerAdminAPIManagementRoutes(private)
		a.registerAdminOrganizationRoutes(private)
		a.registerAdminSecurityRoutes(private)
		a.registerAdminOperationsRoutes(private)
		a.registerLegacyAdminFormRoutes(private)
		a.registerSkillOwnerManagementRoutes(private)
	})
}

func (a *App) registerAdminPageRoutes(r chi.Router) {
	r.Get("/admin", a.handleAdmin)
	r.Get("/admin/{section}", a.handleAdmin)
	r.Get("/admin/{section}/{subsection}", a.handleAdmin)
	r.Get("/admin/{section}/{subsection}/{detail}", a.handleAdmin)
	r.Get("/admin/{section}/{subsection}/{detail}/{extra}", a.handleAdmin)
	r.Get("/dashboard", a.handleAdmin)
	r.Get("/dashboard/{section}", a.handleAdmin)
}

func (a *App) registerAdminOverviewRoutes(r chi.Router) {
	r.Get("/api/v1/admin/overview", a.handleAPIAdminOverview)
	r.Get("/api/v1/admin/skills", a.handleAPIAdminSkills)
	r.Get("/api/v1/admin/integrations", a.handleAPIAdminIntegrations)
}

func (a *App) registerAdminAPIManagementRoutes(r chi.Router) {
	r.Get("/api/v1/admin/api-management/specs/current", a.handleAPIAdminCurrentSpec)
	r.Post("/api/v1/admin/api-management/specs/import", a.handleAPIAdminImportSpec)
	r.Post("/api/v1/admin/api-management/specs/{specID}/validate", a.handleAPIAdminValidateSpec)
	r.Post("/api/v1/admin/api-management/specs/{specID}/publish", a.handleAPIAdminPublishSpec)
	r.Get("/api/v1/admin/api-management/specs/current/export.json", a.handleAPIAdminExportSpecJSON)
	r.Get("/api/v1/admin/api-management/specs/current/export.yaml", a.handleAPIAdminExportSpecYAML)
}

func (a *App) registerAdminIngestionRoutes(r chi.Router) {
	r.Post("/api/v1/admin/ingestion/manual", a.handleAPIAdminIngestionManual)
	r.Post("/api/v1/admin/ingestion/upload", a.handleAPIAdminIngestionUpload)
	r.Post("/api/v1/admin/ingestion/repository", a.handleAPIAdminIngestionRepository)
	r.Post("/api/v1/admin/ingestion/skillmp", a.handleAPIAdminIngestionSkillMP)
}

func (a *App) registerAdminSyncGovernanceRoutes(r chi.Router) {
	r.Get("/api/v1/admin/jobs", a.handleAPIAdminJobs)
	r.Get("/api/v1/admin/jobs/{jobID}", a.handleAPIAdminJobDetail)
	r.Post("/api/v1/admin/jobs/{jobID}/retry", a.handleAPIAdminJobRetry)
	r.Post("/api/v1/admin/jobs/{jobID}/cancel", a.handleAPIAdminJobCancel)
	r.Get("/api/v1/admin/sync-jobs", a.handleAPIAdminSyncJobs)
	r.Get("/api/v1/admin/sync-jobs/{runID}", a.handleAPIAdminSyncJobDetail)
	r.Get("/api/v1/admin/sync-runs", a.handleAPIAdminSyncRuns)
	r.Get("/api/v1/admin/sync-runs/{runID}", a.handleAPIAdminSyncRunDetail)
	r.Get("/api/v1/admin/sync-policy/repository", a.handleAPIAdminRepositorySyncPolicy)
	r.Post("/api/v1/admin/sync-policy/repository", a.handleAPIAdminRepositorySyncPolicyUpdate)
	r.Get("/api/v1/admin/sync-policies", a.handleAPIAdminSyncPolicies)
	r.Get("/api/v1/admin/sync-policies/{policyID}", a.handleAPIAdminSyncPolicyDetail)
	r.Post("/api/v1/admin/sync-policies/create", a.handleAPIAdminSyncPoliciesCreate)
	r.Post("/api/v1/admin/sync-policies/{policyID}/update", a.handleAPIAdminSyncPoliciesUpdate)
	r.Post("/api/v1/admin/sync-policies/{policyID}/toggle", a.handleAPIAdminSyncPoliciesToggle)
	r.Post("/api/v1/admin/sync-policies/{policyID}/delete", a.handleAPIAdminSyncPoliciesDelete)
	r.Get("/admin/jobs", a.handleAdminJobs)
	r.Get("/admin/jobs/{jobID}", a.handleAdminJob)
	r.Post("/admin/jobs/{jobID}/retry", a.handleAdminJobRetry)
	r.Post("/admin/jobs/{jobID}/cancel", a.handleAdminJobCancel)
}

func (a *App) registerAdminAccessRoutes(r chi.Router) {
	r.Get("/api/v1/admin/settings/registration", a.handleAPIAdminRegistrationSetting)
	r.Post("/api/v1/admin/settings/registration", a.handleAPIAdminRegistrationSettingUpdate)
	r.Get("/api/v1/admin/settings/marketplace-ranking", a.handleAPIAdminMarketplaceRankingSetting)
	r.Post("/api/v1/admin/settings/marketplace-ranking", a.handleAPIAdminMarketplaceRankingSettingUpdate)
	r.Get("/api/v1/admin/settings/auth-providers", a.handleAPIAdminAuthProvidersSetting)
	r.Post("/api/v1/admin/settings/auth-providers", a.handleAPIAdminAuthProvidersSettingUpdate)
	r.Get("/api/v1/admin/accounts", a.handleAPIAdminAccounts)
	r.Get("/api/v1/admin/user-center/accounts", a.handleAPIUserCenterAccounts)
	r.Post("/api/v1/admin/user-center/sync", a.handleAPIUserCenterSync)
	r.Get("/api/v1/admin/user-center/permissions/{userID}", a.handleAPIUserCenterPermissionsGet)
	r.Post("/api/v1/admin/user-center/permissions/{userID}", a.handleAPIUserCenterPermissionsUpdate)
	r.Post("/api/v1/admin/users/{userID}/role", a.handleAPIAdminUserRoleUpdate)
	r.Post("/api/v1/admin/accounts/{userID}/status", a.handleAPIAdminAccountStatus)
	r.Post("/api/v1/admin/accounts/{userID}/force-signout", a.handleAPIAdminAccountForceSignout)
	r.Post("/api/v1/admin/accounts/{userID}/password-reset", a.handleAPIAdminAccountPasswordReset)
}

func (a *App) registerAdminOrganizationRoutes(r chi.Router) {
	r.Get("/api/v1/admin/organizations", a.handleAPIAdminOrganizations)
	r.Post("/api/v1/admin/organizations", a.handleAPIAdminOrganizationCreate)
	r.Get("/api/v1/admin/organizations/{orgID}/members", a.handleAPIAdminOrganizationMembers)
	r.Post("/api/v1/admin/organizations/{orgID}/members", a.handleAPIAdminOrganizationMemberUpsert)
	r.Post("/api/v1/admin/organizations/{orgID}/members/{userID}/role", a.handleAPIAdminOrganizationMemberRoleUpdate)
	r.Post("/api/v1/admin/organizations/{orgID}/members/{userID}/remove", a.handleAPIAdminOrganizationMemberRemove)
}

func (a *App) registerAdminSecurityRoutes(r chi.Router) {
	r.Get("/api/v1/admin/apikeys", a.handleAPIAdminAPIKeys)
	r.Post("/api/v1/admin/apikeys", a.handleAPIAdminAPIKeysCreate)
	r.Get("/api/v1/admin/apikeys/{keyID}", a.handleAPIAdminAPIKeyDetail)
	r.Post("/api/v1/admin/apikeys/{keyID}/revoke", a.handleAPIAdminAPIKeyRevoke)
	r.Post("/api/v1/admin/apikeys/{keyID}/rotate", a.handleAPIAdminAPIKeyRotate)
	r.Post("/api/v1/admin/apikeys/{keyID}/scopes", a.handleAPIAdminAPIKeyScopesUpdate)
	r.Get("/api/v1/admin/sso/providers", a.handleAPIAdminSSOProviders)
	r.Post("/api/v1/admin/sso/providers", a.handleAPIAdminSSOProviderCreate)
	r.Post("/api/v1/admin/sso/providers/{providerID}/disable", a.handleAPIAdminSSOProviderDisable)
	r.Post("/api/v1/admin/sso/users/sync", a.handleAPIAdminSSOUsersSync)
	r.Get("/api/v1/admin/moderation", a.handleAPIAdminModerationList)
	r.Post("/api/v1/admin/moderation", a.handleAPIAdminModerationCreate)
	r.Post("/api/v1/admin/moderation/{caseID}/resolve", a.handleAPIAdminModerationResolve)
	r.Post("/api/v1/admin/moderation/{caseID}/reject", a.handleAPIAdminModerationReject)
}

func (a *App) registerAdminOperationsRoutes(r chi.Router) {
	r.Get("/api/v1/admin/ops/metrics", a.handleAPIAdminOpsMetrics)
	r.Get("/api/v1/admin/ops/alerts", a.handleAPIAdminOpsAlerts)
	r.Get("/api/v1/admin/ops/audit-export", a.handleAPIAdminOpsAuditExport)
	r.Get("/api/v1/admin/ops/release-gates", a.handleAPIAdminOpsReleaseGates)
	r.Post("/api/v1/admin/ops/release-gates/run", a.handleAPIAdminOpsReleaseGatesRun)
	r.Get("/api/v1/admin/ops/recovery-drills", a.handleAPIAdminOpsRecoveryDrills)
	r.Post("/api/v1/admin/ops/recovery-drills/run", a.handleAPIAdminOpsRecoveryDrillRun)
	r.Get("/api/v1/admin/ops/releases", a.handleAPIAdminOpsReleases)
	r.Post("/api/v1/admin/ops/releases", a.handleAPIAdminOpsReleasesCreate)
	r.Get("/api/v1/admin/ops/change-approvals", a.handleAPIAdminOpsChangeApprovals)
	r.Post("/api/v1/admin/ops/change-approvals", a.handleAPIAdminOpsChangeApprovalsCreate)
	r.Get("/api/v1/admin/ops/backup/plans", a.handleAPIAdminOpsBackupPlans)
	r.Post("/api/v1/admin/ops/backup/plans", a.handleAPIAdminOpsBackupPlansUpsert)
	r.Get("/api/v1/admin/ops/backup/runs", a.handleAPIAdminOpsBackupRuns)
	r.Post("/api/v1/admin/ops/backup/runs", a.handleAPIAdminOpsBackupRunsCreate)
}

func (a *App) registerLegacyAdminFormRoutes(r chi.Router) {
	r.Post("/admin/sync/repositories", a.handleRepositorySyncBatch)
	r.Post("/admin/sync-policy/repository", a.handleAdminRepositorySyncPolicyUpdate)
	r.Post("/admin/accounts/create", a.handleAdminAccountCreate)
	r.Post("/admin/access/registration", a.handleAdminAccessRegistrationUpdate)
	r.Post("/admin/access/auth-providers", a.handleAdminAccessAuthProvidersUpdate)
	r.Post("/admin/accounts/{userID}/status", a.handleAdminAccountStatusUpdate)
	r.Post("/admin/accounts/{userID}/force-signout", a.handleAdminAccountForceSignout)
	r.Post("/admin/accounts/{userID}/password-reset", a.handleAdminAccountPasswordReset)
	r.Post("/admin/roles/assign", a.handleAdminRoleAssign)
	r.Post("/admin/integrations/create", a.handleAdminIntegrationCreate)
	r.Post("/admin/incidents/create", a.handleAdminIncidentCreate)
	r.Post("/admin/incidents/{incidentID}/response", a.handleAdminIncidentResponse)
	r.Post("/admin/incidents/{incidentID}/postmortem", a.handleAdminIncidentPostmortem)
	r.Post("/admin/moderation/create", a.handleAdminModerationCreate)
	r.Post("/admin/moderation/{caseID}/resolve", a.handleAdminModerationResolve)
	r.Post("/admin/moderation/{caseID}/reject", a.handleAdminModerationReject)
	r.Post("/admin/sso/providers/create", a.handleAdminSSOProviderCreate)
	r.Post("/admin/sso/providers/{providerID}/disable", a.handleAdminSSOProviderDisable)
	r.Post("/admin/sso/users/sync", a.handleAdminSSOUsersSync)
	r.Post("/admin/apikeys/create", a.handleAPIKeyCreate)
	r.Post("/admin/apikeys/{keyID}/revoke", a.handleAPIKeyRevoke)
	r.Post("/admin/apikeys/{keyID}/rotate", a.handleAPIKeyRotate)
	r.Post("/admin/users/{userID}/role", a.handleAdminUserRoleUpdate)
}

func (a *App) registerSkillOwnerManagementRoutes(r chi.Router) {
	r.Post("/skills/manual", a.handleCreateManual)
	r.Post("/skills/upload", a.handleUpload)
	r.Post("/skills/repo", a.handleRepositoryCreate)
	r.Post("/skills/skillmp", a.handleSkillMPCreate)
	r.Post("/skills/{skillID}/visibility", a.handleUpdateVisibility)
	r.Post("/skills/{skillID}/sync", a.handleRemoteSync)
	r.Get("/skills/{skillID}/versions", a.handleSkillVersions)
	r.Get("/skills/{skillID}/versions/compare", a.handleSkillVersionCompare)
	r.Get("/skills/{skillID}/versions/{versionID}", a.handleSkillVersionDetail)
	r.Post("/api/v1/skills/{skillID}/versions/{versionID}/rollback", a.handleAPISkillVersionRollback)
	r.Post("/api/v1/skills/{skillID}/versions/{versionID}/restore", a.handleAPISkillVersionRestore)
	r.Post("/skills/{skillID}/versions/{versionID}/rollback", a.handleRollbackSkillVersion)
	r.Post("/skills/{skillID}/versions/{versionID}/restore", a.handleRestoreSkillVersion)
	r.Post("/skills/{skillID}/delete", a.handleDeleteSkill)
}
