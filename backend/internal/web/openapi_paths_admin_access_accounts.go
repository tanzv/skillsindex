package web

func openAPIPathsAdminAccessAccounts() map[string]any {
	return map[string]any{
		"/api/v1/admin/accounts": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List accounts for administration",
				"description": "Session endpoint. Super admin only.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("q", "string", false, "Optional username keyword filter"),
					queryParam("role", "string", false, "Optional role filter"),
					queryParam("status", "string", false, "Optional status filter"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Account list", "AdminAccountsResponse"),
					"400": jsonResponse("Invalid query parameters", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Account query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/users/{userID}/role": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update one account role",
				"description": "Session endpoint for privileged admins to update user role with last-super-admin guard.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("userID", "User ID"),
				},
				"requestBody": jsonRequestBody("AdminUserRoleUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Role updated", "AdminUserRoleUpdateResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
					"409": jsonResponse("Last super admin guard", "ErrorResponse"),
					"500": jsonResponse("Update failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/accounts/{userID}/status": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update account status",
				"description": "Session endpoint for super admin account status management.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("userID", "User ID"),
				},
				"requestBody": jsonRequestBody("AdminAccountStatusRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Status updated", "SuccessResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
					"409": jsonResponse("State conflict", "ErrorResponse"),
					"500": jsonResponse("Update failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/accounts/{userID}/force-signout": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Force account sign-out",
				"description": "Session endpoint for super admin to revoke all active sessions of one account.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("userID", "User ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sessions revoked", "SuccessResponse"),
					"400": jsonResponse("Invalid user id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
					"500": jsonResponse("Force signout failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/accounts/{userID}/password-reset": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Reset account password",
				"description": "Session endpoint for super admin password reset workflow.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("userID", "User ID"),
				},
				"requestBody": jsonRequestBody("AdminAccountPasswordResetRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Password reset completed", "SuccessResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
					"500": jsonResponse("Reset failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
