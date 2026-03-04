package web

func openAPIPathsAdminSyncPolicies() map[string]any {
	return map[string]any{
		"/api/v1/admin/sync-policies": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List sync policies",
				"description": "Compatibility endpoint that exposes repository sync policy as a list for future multi-policy expansion.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Sync policies", "SyncPoliciesResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policies/create": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create sync policy (compat alias)",
				"description": "Compatibility endpoint that upserts repository sync policy with create semantics.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("RepositorySyncPolicyUpdateRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Sync policy item", "SyncPolicyItem"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policies/{policyID}/update": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update sync policy (compat alias)",
				"description": "Compatibility endpoint to update a sync policy by policyID.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("policyID", "Sync policy id"),
				},
				"requestBody": jsonRequestBody("RepositorySyncPolicyUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Sync policy item", "SyncPolicyItem"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync policy not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policies/{policyID}/toggle": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Toggle sync policy (compat alias)",
				"description": "Compatibility endpoint to toggle policy enabled state. Optional body field: enabled.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("policyID", "Sync policy id"),
				},
				"requestBody": jsonRequestBody("SyncPolicyToggleRequest", false),
				"responses": map[string]any{
					"200": jsonResponse("Sync policy item", "SyncPolicyItem"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync policy not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policies/{policyID}/delete": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Delete sync policy (compat alias)",
				"description": "Compatibility endpoint that soft-deletes the policy by disabling it.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("policyID", "Sync policy id"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sync policy delete result", "SyncPolicyDeleteResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync policy not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
