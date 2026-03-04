package web

func openAPISecuritySchemes() map[string]any {
	return map[string]any{
		"securitySchemes": map[string]any{
			"ApiKeyQuery": map[string]any{
				"type": "apiKey",
				"in":   "query",
				"name": "api_key",
			},
			"BearerAuth": map[string]any{
				"type":         "http",
				"scheme":       "bearer",
				"bearerFormat": "API Key",
			},
			"SessionCookie": map[string]any{
				"type": "apiKey",
				"in":   "cookie",
				"name": "skillsindex_session",
			},
		},
	}
}
