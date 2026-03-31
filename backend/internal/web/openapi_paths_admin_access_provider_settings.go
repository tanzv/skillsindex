package web

func openAPIPathsAdminAccessProviderSettings() map[string]any {
	return map[string]any{
		"/api/v1/admin/settings/auth-providers": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get auth provider visibility settings",
				"description": "Session endpoint for privileged admins to read enabled auth providers.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Auth provider setting", "AdminAuthProvidersSettingResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update auth provider visibility settings",
				"description": "Session endpoint for privileged admins to update enabled auth providers.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminAuthProvidersSettingUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Auth provider setting updated", "AdminAuthProvidersUpdateResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Update failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/settings/category-catalog": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get marketplace category catalog settings",
				"description": "Session endpoint for privileged admins to read the mutable marketplace category and subcategory catalog.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Marketplace category catalog", "AdminCategoryCatalogSettingResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Query failed", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update marketplace category catalog settings",
				"description": "Session endpoint for privileged admins to replace the mutable marketplace category and subcategory catalog.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminCategoryCatalogSettingUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Marketplace category catalog updated", "AdminCategoryCatalogSettingResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Update failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/settings/presentation-taxonomy": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get marketplace presentation taxonomy settings",
				"description": "Session endpoint for privileged admins to read marketplace presentation taxonomy settings.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Marketplace presentation taxonomy settings", "ObjectResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Query failed", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update marketplace presentation taxonomy settings",
				"description": "Session endpoint for privileged admins to replace marketplace presentation taxonomy settings.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Marketplace presentation taxonomy settings updated", "ObjectResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Update failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/auth-provider-configs": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List managed auth provider configurations",
				"description": "Session endpoint for privileged admins to inspect third-party sign-in provider status and configuration availability.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Managed auth provider inventory", "AdminAuthProviderConfigsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create or update one managed auth provider",
				"description": "Session endpoint for privileged admins to upsert third-party sign-in provider configuration.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminAuthProviderConfigUpsertRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Provider updated", "AdminAuthProviderConfigDetailResponse"),
					"201": jsonResponse("Provider created", "AdminAuthProviderConfigDetailResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Update failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/auth-provider-configs/{provider}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get one managed auth provider configuration",
				"description": "Session endpoint for privileged admins to inspect one third-party sign-in provider in detail.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("provider", "Provider key"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Managed auth provider detail", "AdminAuthProviderConfigDetailResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Provider not found", "ErrorResponse"),
					"500": jsonResponse("Query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/auth-provider-configs/{provider}/disable": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Disable one managed auth provider",
				"description": "Session endpoint for privileged admins to disable one third-party sign-in provider and remove it from login visibility.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("provider", "Provider key"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Provider disabled", "AdminAuthProviderConfigDetailResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Provider not found", "ErrorResponse"),
					"500": jsonResponse("Disable failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
