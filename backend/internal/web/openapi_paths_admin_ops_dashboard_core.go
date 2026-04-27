package web

func openAPIPathsAdminOpsDashboardCore() map[string]any {
	return map[string]any{
		"/api/v1/admin/overview": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get admin overview metrics",
				"description": "Session endpoint for admin dashboard metrics and capability flags.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Overview metrics", "AdminOverviewResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/skills": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List admin visible skills",
				"description": "Session endpoint with filters for dashboard skill records.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("q", "string", false, "Keyword filter"),
					queryParam("source", "string", false, "Source type filter"),
					queryParam("visibility", "string", false, "Visibility filter"),
					queryParam("owner", "string", false, "Owner username or id"),
					queryParam("page", "integer", false, "Page number"),
					queryParam("limit", "integer", false, "Page size"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Admin skill list", "AdminSkillsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/skills/{skillID}/sync": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Sync one admin managed skill",
				"description": "Session endpoint for owner/admin/super_admin to sync one repository or SkillMP skill.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Skill sync result", "ObjectResponse"),
					"400": jsonResponse("Invalid request or unsupported source type", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"409": jsonResponse("Matching sync job already running", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/skills/{skillID}/visibility": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update one admin managed skill visibility",
				"description": "Session endpoint for owner/admin/super_admin to change one skill visibility.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Visibility updated", "ObjectResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"500": jsonResponse("Visibility update failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/skills/{skillID}/delete": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Delete one admin managed skill",
				"description": "Session endpoint for owner/admin/super_admin to delete one managed skill.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Skill deleted", "ObjectResponse"),
					"400": jsonResponse("Invalid skill id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"500": jsonResponse("Delete failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/integrations": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List integration connectors and webhook logs",
				"description": "Session endpoint for admin/super_admin to query connector catalog and recent webhook deliveries.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("provider", "string", false, "Provider filter"),
					queryParam("include_disabled", "boolean", false, "Include disabled connectors"),
					queryParam("limit", "integer", false, "Maximum connector and webhook rows"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Integration list response", "AdminIntegrationsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
