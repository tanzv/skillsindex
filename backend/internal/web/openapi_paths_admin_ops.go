package web

func openAPIPathsAdminOps() map[string]any {
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
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
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
				"parameters": []map[string]any{
					queryParam("owner_id", "integer", false, "Owner user id filter"),
					queryParam("limit", "integer", false, "Maximum run records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sync run records", "SyncJobsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
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
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync run not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-runs": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List sync run records (alias)",
				"description": "Compatibility alias of /api/v1/admin/sync-jobs for querying synchronization run history.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("owner_id", "integer", false, "Owner user id filter"),
					queryParam("limit", "integer", false, "Maximum run records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sync run records", "SyncJobsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
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
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync run not found", "ErrorResponse"),
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
		"/api/v1/admin/ops/metrics": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get operations metrics snapshot",
				"description": "Session endpoint for admin/super_admin to read current operational baseline metrics.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Operations metrics snapshot", "AdminOpsMetricsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Metrics computation failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/alerts": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get operations alerts snapshot",
				"description": "Session endpoint for admin/super_admin to read derived operational alerts.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Operations alerts snapshot", "AdminOpsAlertsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Alerts computation failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/audit-export": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Export audit logs for compliance",
				"description": "Session endpoint for admin/super_admin to export audit logs as JSON or CSV. Export records include request_id, result, reason, and source_ip, and actor_user_id may be empty for anonymous or system-generated events.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("from", "string", false, "Start time (RFC3339 or YYYY-MM-DD)"),
					queryParam("to", "string", false, "End time (RFC3339 or YYYY-MM-DD)"),
					queryParam("format", "string", false, "Export format: json|csv"),
				},
				"responses": map[string]any{
					"200": simpleResponse("Audit export file stream"),
					"400": jsonResponse("Invalid export input", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/release-gates": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get release gate snapshot",
				"description": "Session endpoint for admin/super_admin to evaluate current release readiness checks.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Release gate snapshot", "AdminOpsReleaseGatesResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Release gate evaluation failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/release-gates/run": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Run release gate checks",
				"description": "Session endpoint for admin/super_admin to execute release gate checks and record audit evidence.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Release gate snapshot", "AdminOpsReleaseGatesResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Release gate execution failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/recovery-drills": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List recovery drill records",
				"description": "Session endpoint for admin/super_admin to query backup and recovery drill records.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("limit", "integer", false, "Maximum records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Recovery drill records", "AdminOpsRecoveryDrillsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Recovery drill query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/recovery-drills/run": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Record one recovery drill run",
				"description": "Session endpoint for admin/super_admin to submit one recovery drill result for RPO/RTO validation.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("OpsRecoveryDrillRunRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Recovery drill record", "AdminOpsRecoveryDrillRunResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/releases": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List release records",
				"description": "Session endpoint for admin/super_admin to query release timeline records.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("limit", "integer", false, "Maximum records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Release records", "AdminOpsReleasesResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Release query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create release record",
				"description": "Session endpoint for admin/super_admin to record a release event and its change ticket linkage.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("OpsReleaseCreateRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Release record", "AdminOpsReleaseCreateResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/change-approvals": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List change approval records",
				"description": "Session endpoint for admin/super_admin to query change approval records.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("limit", "integer", false, "Maximum records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Change approval records", "AdminOpsChangeApprovalsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Change approval query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create change approval record",
				"description": "Session endpoint for admin/super_admin to record one change approval decision.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("OpsChangeApprovalCreateRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Change approval record", "AdminOpsChangeApprovalCreateResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/backup/plans": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List backup plan records",
				"description": "Session endpoint for admin/super_admin to query backup plan records.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("limit", "integer", false, "Maximum records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Backup plan records", "AdminOpsBackupPlansResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Backup plan query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create or update backup plan record",
				"description": "Session endpoint for admin/super_admin to record backup plan policy updates.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("OpsBackupPlanUpsertRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Backup plan record", "AdminOpsBackupPlanUpsertResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ops/backup/runs": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List backup run records",
				"description": "Session endpoint for admin/super_admin to query backup execution run records.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("limit", "integer", false, "Maximum records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Backup run records", "AdminOpsBackupRunsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Backup run query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create backup run record",
				"description": "Session endpoint for admin/super_admin to record one backup run result.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("OpsBackupRunCreateRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Backup run record", "AdminOpsBackupRunCreateResponse"),
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
	}
}
