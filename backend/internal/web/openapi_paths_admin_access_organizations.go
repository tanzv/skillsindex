package web

func openAPIPathsAdminAccessOrganizations() map[string]any {
	return map[string]any{
		"/api/v1/admin/organizations": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List organizations",
				"description": "Session endpoint to list organizations visible to current user.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Organization list", "OrganizationsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
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
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
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
					"400": jsonResponse("Invalid organization id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Organization or membership not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
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
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Organization not found", "ErrorResponse"),
					"409": jsonResponse("Last owner guard", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
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
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Organization or membership not found", "ErrorResponse"),
					"409": jsonResponse("Last owner guard", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
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
					"400": jsonResponse("Invalid organization or user id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Membership not found", "ErrorResponse"),
					"409": jsonResponse("Last owner guard", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
