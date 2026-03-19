package web

func openAPIPathsAdminOpsRuntime() map[string]any {
	return map[string]any{
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
	}
}
