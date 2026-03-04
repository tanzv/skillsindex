package web

func openAPIPathsAdminAPIKeyScopes() map[string]any {
	return map[string]any{
		"/api/v1/admin/apikeys/{keyID}/scopes": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update admin API key scopes",
				"description": "Session endpoint. member/admin can update own key scopes; super_admin can update any key scopes.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("keyID", "API key ID"),
				},
				"requestBody": jsonRequestBody("AdminAPIKeyScopesUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("API key detail", "AdminAPIKeyItemResponse"),
					"400": jsonResponse("Invalid payload or scope", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API key not found", "ErrorResponse"),
					"500": jsonResponse("Scope update failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
