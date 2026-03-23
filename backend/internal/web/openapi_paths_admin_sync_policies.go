package web

func openAPIPathsAdminSyncPolicies() map[string]any {
	return map[string]any{
		"/api/v1/admin/sync-policies": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List sync policies",
				"description": "List first-class sync policy records with optional source and lifecycle filters.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("source_type", "string", false, "Source type filter"),
					queryParam("enabled_only", "boolean", false, "Only include enabled policies"),
					queryParam("include_deleted", "boolean", false, "Include soft-deleted policies"),
					queryParam("limit", "integer", false, "Maximum policy records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sync policies", "SyncPoliciesResponse"),
					"400": jsonResponse("Invalid query filter", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Policy query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policies/{policyID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get sync policy detail",
				"description": "Get one first-class sync policy record by policy id or supported compatibility alias.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("policyID", "Sync policy id"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sync policy detail", "SyncPolicyDetailResponse"),
					"400": jsonResponse("Invalid policy id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync policy not found", "ErrorResponse"),
					"500": jsonResponse("Policy query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policies/create": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create sync policy",
				"description": "Create one first-class sync policy record.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("SyncPolicyCreateRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Sync policy item", "SyncPolicyItem"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Policy create failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policies/{policyID}/update": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update sync policy",
				"description": "Update one first-class sync policy record by policy id or supported compatibility alias.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("policyID", "Sync policy id"),
				},
				"requestBody": jsonRequestBody("SyncPolicyUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Sync policy item", "SyncPolicyItem"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync policy not found", "ErrorResponse"),
					"500": jsonResponse("Policy update failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policies/{policyID}/toggle": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Toggle sync policy",
				"description": "Toggle one first-class sync policy enabled state. Optional body field: enabled.",
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
					"500": jsonResponse("Policy toggle failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sync-policies/{policyID}/delete": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Delete sync policy",
				"description": "Soft-delete one first-class sync policy by policy id or supported compatibility alias.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("policyID", "Sync policy id"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sync policy delete result", "SyncPolicyDeleteResponse"),
					"400": jsonResponse("Invalid policy id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Sync policy not found", "ErrorResponse"),
					"500": jsonResponse("Policy delete failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
