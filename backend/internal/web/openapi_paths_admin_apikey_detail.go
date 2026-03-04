package web

func openAPIPathsAdminAPIKeyDetail() map[string]any {
	return map[string]any{
		"/api/v1/admin/apikeys/{keyID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get admin API key detail",
				"description": "Session endpoint. member/admin can view own key detail; super_admin can view any key detail.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("keyID", "API key ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("API key detail", "AdminAPIKeyItemResponse"),
					"400": jsonResponse("Invalid key id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API key not found", "ErrorResponse"),
					"500": jsonResponse("Query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
