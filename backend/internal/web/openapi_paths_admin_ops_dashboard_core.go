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
