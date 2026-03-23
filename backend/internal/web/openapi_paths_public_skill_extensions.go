package web

func openAPIPathsPublicSkillExtensions() map[string]any {
	return map[string]any{
		"/api/v1/public/skills/compare": map[string]any{
			"get": map[string]any{
				"tags":        []string{"skills"},
				"summary":     "Compare two public skills",
				"description": "Public endpoint that returns two marketplace-visible skills for the compare route.",
				"parameters": []map[string]any{
					queryParam("left", "integer", true, "Left skill identifier"),
					queryParam("right", "integer", true, "Right skill identifier"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Public skill compare payload", "PublicSkillCompareResponse"),
					"400": jsonResponse("Invalid compare query", "ErrorResponse"),
					"401": jsonResponse("Authentication required when marketplace is private", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/public/skills/{skillID}/resources": map[string]any{
			"get": map[string]any{
				"tags":        []string{"skills"},
				"summary":     "List previewable public skill resources",
				"description": "Public endpoint that returns resource metadata for a marketplace-visible skill.",
				"parameters": []map[string]any{
					pathParam("skillID", "Skill identifier"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Public skill resources payload", "PublicSkillResourcesResponse"),
					"401": jsonResponse("Authentication required when marketplace is private", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/public/skills/{skillID}/resource-file": map[string]any{
			"get": map[string]any{
				"tags":        []string{"skills"},
				"summary":     "Read one previewable public skill resource file",
				"description": "Public endpoint that returns text preview content for one marketplace-visible skill resource.",
				"parameters": []map[string]any{
					pathParam("skillID", "Skill identifier"),
					queryParam("path", "string", false, "Relative resource file path"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Public skill resource content payload", "PublicSkillResourceContentResponse"),
					"400": jsonResponse("Invalid resource path", "ErrorResponse"),
					"401": jsonResponse("Authentication required when marketplace is private", "ErrorResponse"),
					"404": jsonResponse("Skill or resource file not found", "ErrorResponse"),
					"413": jsonResponse("Resource file too large", "ErrorResponse"),
					"415": jsonResponse("Resource file unsupported", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/public/skills/{skillID}/versions": map[string]any{
			"get": map[string]any{
				"tags":        []string{"skills"},
				"summary":     "List public skill versions",
				"description": "Public endpoint that returns visible version history for one marketplace-visible skill.",
				"parameters": []map[string]any{
					pathParam("skillID", "Skill identifier"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Public skill versions payload", "PublicSkillVersionsResponse"),
					"401": jsonResponse("Authentication required when marketplace is private", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
