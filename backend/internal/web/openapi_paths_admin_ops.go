package web

func openAPIPathsAdminOps() map[string]any {
	paths := map[string]any{}
	mergeOpenAPIPathMap(paths, openAPIPathsAdminOpsDashboard())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminOpsRuntime())
	return paths
}

func openAPIPathsAdminOpsDashboard() map[string]any {
	return map[string]any{
		"/api/v1/admin/overview": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get admin overview metrics",
				"description": "Session endpoint for admin dashboard metrics and capability flags.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Overview metrics", "AdminOverviewResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/skills": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List admin visible skills",
				"description": "Session endpoint with filters for dashboard skill records.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("q", "string", false, "Keyword filter"),
					queryParam("source", "string", false, "Source type filter"),
					queryParam("visibility", "string", false, "Visibility filter"),
					queryParam("owner", "string", false, "Owner username or id"),
					queryParam("page", "integer", false, "Page number"),
					queryParam("limit", "integer", false, "Page size"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Admin skill list", "AdminSkillsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/integrations": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List integration connectors and webhook logs",
				"description": "Session endpoint for admin/super_admin to query connector catalog and recent webhook deliveries.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("provider", "string", false, "Provider filter"),
					queryParam("include_disabled", "boolean", false, "Include disabled connectors"),
					queryParam("limit", "integer", false, "Maximum connector and webhook rows"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Integration list response", "AdminIntegrationsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/jobs": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List async orchestration jobs",
				"description": "Session endpoint to query asynchronous ingestion and sync jobs.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("owner_id", "integer", false, "Owner user id filter"),
					queryParam("status", "string", false, "Status filter"),
					queryParam("job_type", "string", false, "Job type filter"),
					queryParam("limit", "integer", false, "Maximum job records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Async job records", "AsyncJobsResponse"),
					"400": jsonResponse("Invalid owner filter", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"500": jsonResponse("Job query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/jobs/{jobID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get async orchestration job detail",
				"description": "Session endpoint to query one asynchronous job detail by id.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("jobID", "Async job ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Async job detail", "AsyncJobDetailResponse"),
					"400": jsonResponse("Invalid job id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Job not found", "ErrorResponse"),
					"500": jsonResponse("Job query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/jobs/{jobID}/retry": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Retry async orchestration job",
				"description": "Session endpoint to retry one failed or canceled async job.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("jobID", "Async job ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Async job detail", "AsyncJobDetailResponse"),
					"400": jsonResponse("Invalid transition or id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Job not found", "ErrorResponse"),
					"500": jsonResponse("Retry failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/jobs/{jobID}/cancel": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Cancel async orchestration job",
				"description": "Session endpoint to cancel one pending or running async job.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("jobID", "Async job ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Async job detail", "AsyncJobDetailResponse"),
					"400": jsonResponse("Invalid transition or id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Job not found", "ErrorResponse"),
					"500": jsonResponse("Cancel failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-jobs": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List sync run records",
				"description": "Session endpoint to query repository synchronization run history.",
				"security":    sessionSecurity(),
				"parameters":  openAPISyncRunListQueryParams(),
				"responses": map[string]any{
					"200": jsonResponse("Sync run records", "SyncJobsResponse"),
					"400": jsonResponse("Invalid query filter", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"500": jsonResponse("Sync run query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-jobs/{runID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get sync run detail",
				"description": "Session endpoint to query one synchronization run detail by id.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("runID", "Sync run ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sync run detail", "SyncJobDetailResponse"),
					"400": jsonResponse("Invalid run id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync run not found", "ErrorResponse"),
					"500": jsonResponse("Sync run query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-runs": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List sync run records (alias)",
				"description": "Compatibility alias of /api/v1/admin/sync-jobs for querying synchronization run history.",
				"security":    sessionSecurity(),
				"parameters":  openAPISyncRunListQueryParams(),
				"responses": map[string]any{
					"200": jsonResponse("Sync run records", "SyncJobsResponse"),
					"400": jsonResponse("Invalid query filter", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"500": jsonResponse("Sync run query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-runs/{runID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get sync run detail (alias)",
				"description": "Compatibility alias of /api/v1/admin/sync-jobs/{runID} for querying one run detail.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("runID", "Sync run ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sync run detail", "SyncJobDetailResponse"),
					"400": jsonResponse("Invalid run id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync run not found", "ErrorResponse"),
					"500": jsonResponse("Sync run query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policy/repository": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get repository sync policy",
				"description": "Session endpoint for admin and super admin to read repository sync scheduler policy.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Repository sync policy", "RepositorySyncPolicyResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update repository sync policy",
				"description": "Session endpoint for admin and super admin to update repository sync scheduler policy.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("RepositorySyncPolicyUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Repository sync policy", "RepositorySyncPolicyResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/apikeys": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List admin API keys",
				"description": "Session endpoint. member/admin can list own keys, super_admin can list and filter all accounts.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("owner", "string", false, "Owner username or id filter, super_admin only"),
					queryParam("status", "string", false, "Status filter: all|active|revoked|expired"),
					queryParam("limit", "integer", false, "Maximum records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("API key list", "AdminAPIKeysResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("List failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create admin API key",
				"description": "Session endpoint. member/admin can create own key; super_admin can create for any owner.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminAPIKeyCreateRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("API key created", "AdminAPIKeyCredentialResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Owner not found", "ErrorResponse"),
					"500": jsonResponse("Owner query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/apikeys/{keyID}/revoke": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Revoke admin API key",
				"description": "Session endpoint. member/admin can revoke own keys; super_admin can revoke any key.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("keyID", "API key ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Revoke completed", "SuccessResponse"),
					"400": jsonResponse("Invalid key id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API key not found", "ErrorResponse"),
					"500": jsonResponse("Revoke failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/apikeys/{keyID}/rotate": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Rotate admin API key",
				"description": "Session endpoint. member/admin can rotate own keys; super_admin can rotate any key.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("keyID", "API key ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Rotate completed with one-time token", "AdminAPIKeyCredentialResponse"),
					"400": jsonResponse("Invalid key id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API key not found", "ErrorResponse"),
					"500": jsonResponse("Rotate failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/settings/registration": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get registration policy",
				"description": "Session endpoint for super_admin to read current registration enablement.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Registration policy", "AdminRegistrationSettingResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update registration policy",
				"description": "Session endpoint for super_admin to enable or disable self-registration.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminRegistrationSettingUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Registration policy updated", "AdminRegistrationSettingResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/settings/marketplace-ranking": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get marketplace ranking policy",
				"description": "Session endpoint for privileged admins to inspect marketplace rankings defaults and section sizes.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Marketplace ranking policy", "AdminMarketplaceRankingSettingResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update marketplace ranking policy",
				"description": "Session endpoint for privileged admins to update marketplace rankings defaults and section sizes.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminMarketplaceRankingSettingUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Marketplace ranking policy updated", "AdminMarketplaceRankingSettingResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}

func openAPISyncRunListQueryParams() []map[string]any {
	params := []map[string]any{
		queryParam("owner_id", "integer", false, "Owner user id filter"),
		queryParam("target_skill_id", "integer", false, "Target skill id filter"),
	}
	return append(params, openAPISharedSyncRunListQueryParams()...)
}

func openAPISkillSyncRunListQueryParams() []map[string]any {
	params := []map[string]any{
		pathParam("skillID", "Skill ID"),
	}
	return append(params, openAPISharedSyncRunListQueryParams()...)
}

func openAPISharedSyncRunListQueryParams() []map[string]any {
	return []map[string]any{
		queryParam("policy_id", "integer", false, "Sync policy id filter"),
		queryParam("job_id", "integer", false, "Async job id filter"),
		queryParam("status", "string", false, "Run status filter"),
		queryParam("trigger_type", "string", false, "Run trigger type filter"),
		queryParam("include_errored", "boolean", false, "Include runs with error code or summary"),
		queryParam("limit", "integer", false, "Maximum run records"),
	}
}
