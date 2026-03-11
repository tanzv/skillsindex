package web

func openAPIPathsAccountAPIKey() map[string]any {
	return map[string]any{
		"/api/v1/account/apikeys": map[string]any{
			"get": map[string]any{
				"tags":        []string{"account"},
				"summary":     "List personal API credentials",
				"description": "Session endpoint to list current account API credentials and available OpenAPI scopes.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Personal api credentials", "AccountAPIKeysResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Create personal API credential",
				"description": "Session endpoint to issue one personal API credential for OpenAPI access.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AccountAPIKeyCreateRequest", false),
				"responses": map[string]any{
					"201": jsonResponse("Created api credential", "AccountAPIKeyCredentialResponse"),
					"400": jsonResponse("Invalid payload or scope", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/apikeys/{keyID}/revoke": map[string]any{
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Revoke personal API credential",
				"description": "Session endpoint to revoke one personal API credential owned by the current account.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("keyID", "API credential identifier"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Credential revoked", "SuccessResponse"),
					"400": jsonResponse("Invalid key id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"404": jsonResponse("Credential not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/apikeys/{keyID}/rotate": map[string]any{
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Rotate personal API credential",
				"description": "Session endpoint to rotate one personal API credential and return the replacement plaintext token once.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("keyID", "API credential identifier"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Rotated api credential", "AccountAPIKeyCredentialResponse"),
					"400": jsonResponse("Invalid key id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"404": jsonResponse("Credential not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/apikeys/{keyID}/scopes": map[string]any{
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Update personal API credential scopes",
				"description": "Session endpoint to replace one personal API credential scope set.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("keyID", "API credential identifier"),
				},
				"requestBody": jsonRequestBody("AccountAPIKeyScopesUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Updated api credential", "AccountAPIKeyItemResponse"),
					"400": jsonResponse("Invalid payload or scope", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"404": jsonResponse("Credential not found", "ErrorResponse"),
				},
			},
		},
	}
}
