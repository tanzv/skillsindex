package web

func openAPIPathsAdminOpsDashboardSync() map[string]any {
	return map[string]any{
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
	}
}
