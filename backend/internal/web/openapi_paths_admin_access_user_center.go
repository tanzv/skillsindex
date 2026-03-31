package web

func openAPIPathsAdminAccessUserCenter() map[string]any {
	return map[string]any{
		"/api/v1/admin/user-center/accounts": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List user center accounts",
				"description": "Session endpoint for listing accounts, sync bindings, and user-center permission sets.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("User center account list", "ObjectResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Account query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/user-center/sync": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Sync accounts from Feishu or DingTalk",
				"description": "Session endpoint for incremental/full account synchronization driven by enterprise directory payload.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Sync summary", "ObjectResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Sync failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/user-center/permissions/{userID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get user center permissions",
				"description": "Session endpoint for reading effective/default/override user-center permissions for one account.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("userID", "User ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Permission detail", "ObjectResponse"),
					"400": jsonResponse("Invalid request", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
					"500": jsonResponse("Permission query failed", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update user center permissions",
				"description": "Session endpoint for replacing user-center permissions of one account.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("userID", "User ID"),
				},
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Permissions updated", "ObjectResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
					"500": jsonResponse("Permission update failed", "ErrorResponse"),
				},
			},
		},
	}
}
