package web

func openAPIPathsAdminAPIManagement() map[string]any {
	return map[string]any{
		"/api/v1/admin/api-management/specs/current": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get current published API spec",
				"description": "Session endpoint for privileged admins to inspect the current published API spec snapshot.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Current published API spec", "ObjectResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API spec not found", "ErrorResponse"),
					"500": jsonResponse("Query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/specs/import": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Import one draft API spec",
				"description": "Session endpoint for privileged admins to import one draft API spec from repository source.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Draft API spec imported", "ObjectResponse"),
					"400": jsonResponse("Import failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/specs/{specID}/validate": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Validate one draft API spec",
				"description": "Session endpoint for privileged admins to validate one draft API spec before publish.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("specID", "API spec ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Draft API spec validated", "ObjectResponse"),
					"400": jsonResponse("Validation failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API spec not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/specs/{specID}/publish": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Publish one draft API spec",
				"description": "Session endpoint for privileged admins to publish one draft API spec as current snapshot.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("specID", "API spec ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Draft API spec published", "ObjectResponse"),
					"400": jsonResponse("Publish failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API spec not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/specs/current/export.json": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Export current API spec as JSON",
				"description": "Session endpoint for privileged admins to download the current published API spec as JSON.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": simpleResponse("Current API spec JSON export"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Export failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/specs/current/export.yaml": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Export current API spec as YAML",
				"description": "Session endpoint for privileged admins to download the current published API spec as YAML.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": simpleResponse("Current API spec YAML export"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"500": jsonResponse("Export failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/exports": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List current API export records",
				"description": "Session endpoint for privileged admins to inspect current published API export records.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Current API export records", "ObjectResponse"),
					"400": jsonResponse("Query failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create one current API export",
				"description": "Session endpoint for privileged admins to create one export artifact for the current published API spec.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Current API export created", "ObjectResponse"),
					"400": jsonResponse("Export failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/operations": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List current API operations",
				"description": "Session endpoint for privileged admins to inspect operations resolved from the current published API spec.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Current API operations", "ObjectResponse"),
					"400": jsonResponse("Query failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/operations/{operationID}/policy": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get one current API operation policy",
				"description": "Session endpoint for privileged admins to inspect one operation policy resolved from the current published API spec.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					stringPathParam("operationID", "API operation ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Current API operation policy", "ObjectResponse"),
					"400": jsonResponse("Query failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API operation not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Upsert one current API operation policy",
				"description": "Session endpoint for privileged admins to update one operation policy for the current published API spec.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					stringPathParam("operationID", "API operation ID"),
				},
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Current API operation policy updated", "ObjectResponse"),
					"400": jsonResponse("Update failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API operation not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/mock/profiles": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List current API mock profiles",
				"description": "Session endpoint for privileged admins to inspect current API mock profiles.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Current API mock profiles", "ObjectResponse"),
					"400": jsonResponse("Query failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Upsert one current API mock profile",
				"description": "Session endpoint for privileged admins to create or update one current API mock profile.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Current API mock profile updated", "ObjectResponse"),
					"400": jsonResponse("Update failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/mock/profiles/{profileID}/overrides": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List one mock profile overrides",
				"description": "Session endpoint for privileged admins to inspect overrides configured for one API mock profile.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("profileID", "API mock profile ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("API mock overrides", "ObjectResponse"),
					"400": jsonResponse("Query failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API mock profile not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/mock/profiles/{profileID}/overrides/{operationID}": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Upsert one mock override",
				"description": "Session endpoint for privileged admins to create or update one API mock override for a profile operation pair.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("profileID", "API mock profile ID"),
					stringPathParam("operationID", "API operation ID"),
				},
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("API mock override updated", "ObjectResponse"),
					"400": jsonResponse("Update failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("API mock profile or operation not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/api-management/mock/resolve": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Resolve one API mock response",
				"description": "Session endpoint for privileged admins to resolve the mock response selected for one method and path combination.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("ObjectRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Resolved API mock response", "ObjectResponse"),
					"400": jsonResponse("Resolve failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied or mock disabled", "ErrorResponse"),
					"404": jsonResponse("API mock profile or operation not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}

func stringPathParam(name string, description string) map[string]any {
	return map[string]any{
		"name":        name,
		"in":          "path",
		"required":    true,
		"description": description,
		"schema": map[string]any{
			"type": "string",
		},
	}
}
