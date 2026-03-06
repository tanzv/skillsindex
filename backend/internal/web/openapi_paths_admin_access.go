package web

func openAPIPathsAdminAccess() map[string]any {
	return map[string]any{
		"/api/v1/admin/accounts": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List accounts for administration",
				"description": "Session endpoint. Super admin only.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Account list", "AdminAccountsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
				},
			},
		},
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
				},
			},
		},
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
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
					"409": jsonResponse("State conflict", "ErrorResponse"),
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
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
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
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/organizations": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List organizations",
				"description": "Session endpoint to list organizations visible to current user.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Organization list", "OrganizationsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create organization",
				"description": "Session endpoint to create a new organization and owner membership.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("OrganizationCreateRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Organization created", "OrganizationItem"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/organizations/{orgID}/members": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List organization members",
				"description": "Session endpoint for organization member list query.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("orgID", "Organization ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Organization members", "OrganizationMembersResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Organization or membership not found", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Add organization member",
				"description": "Session endpoint to add one user into organization with a role.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("orgID", "Organization ID"),
				},
				"requestBody": jsonRequestBody("OrganizationMemberUpsertRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Membership updated", "SuccessResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Organization not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/organizations/{orgID}/members/{userID}/role": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update organization member role",
				"description": "Session endpoint to change role for one organization member.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("orgID", "Organization ID"),
					pathParam("userID", "User ID"),
				},
				"requestBody": jsonRequestBody("OrganizationRoleUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Role updated", "SuccessResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Organization or membership not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/organizations/{orgID}/members/{userID}/remove": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Remove organization member",
				"description": "Session endpoint to remove membership from organization.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("orgID", "Organization ID"),
					pathParam("userID", "User ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Membership removed", "SuccessResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Membership not found", "ErrorResponse"),
					"409": jsonResponse("Last owner guard", "ErrorResponse"),
				},
			},
		},
	}
}
