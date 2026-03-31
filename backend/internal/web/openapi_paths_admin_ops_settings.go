package web

func openAPIPathsAdminOpsDashboardSettings() map[string]any {
	return map[string]any{
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
