package web

func openAPIPathsAdminSSO() map[string]any {
	return map[string]any{
		"/api/v1/admin/sso/providers": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List enterprise SSO providers",
				"description": "Session endpoint for super admin to list configured enterprise SSO providers.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("provider", "string", false, "Optional SSO provider key"),
					queryParam("include_disabled", "boolean", false, "Include disabled providers"),
					queryParam("limit", "integer", false, "Max number of providers"),
				},
				"responses": map[string]any{
					"200": jsonResponse("SSO providers", "AdminSSOProvidersResponse"),
					"400": jsonResponse("Invalid query", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Provider query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create enterprise SSO provider",
				"description": "Session endpoint for super admin to create one OIDC SSO provider connector.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminSSOProviderCreateRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("SSO provider created", "AdminSSOProviderItemResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"409": jsonResponse("Provider already exists", "ErrorResponse"),
					"500": jsonResponse("Provider creation failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sso/providers/{providerID}/disable": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Disable enterprise SSO provider",
				"description": "Session endpoint for super admin to disable one configured SSO provider.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("providerID", "SSO provider connector ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("SSO provider", "AdminSSOProviderItemResponse"),
					"400": jsonResponse("Invalid provider id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Provider not found", "ErrorResponse"),
					"500": jsonResponse("Disable failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/sso/users/sync": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Sync disabled identities from enterprise SSO",
				"description": "Session endpoint for super admin to disable mapped local users by external identity list.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminSSOUsersSyncRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Sync result", "AdminSSOUsersSyncResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Provider not found", "ErrorResponse"),
					"500": jsonResponse("User sync failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
