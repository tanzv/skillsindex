package web

func openAPIPathsAdminIngestion() map[string]any {
	multipartUploadRequestBody := map[string]any{
		"required": true,
		"content": map[string]any{
			"multipart/form-data": map[string]any{
				"schema": map[string]any{
					"$ref": "#/components/schemas/AdminIngestionUploadRequest",
				},
			},
		},
	}

	return map[string]any{
		"/api/v1/admin/ingestion/manual": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create skill from manual content",
				"description": "Session endpoint to create one skill from manually entered metadata and content.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminIngestionManualRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Ingestion completed", "AdminIngestionMutationResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"409": jsonResponse("Conflicting active import job", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ingestion/upload": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create skill from archive upload",
				"description": "Session endpoint to upload one skill archive and persist the parsed skill record.",
				"security":    sessionSecurity(),
				"requestBody": multipartUploadRequestBody,
				"responses": map[string]any{
					"201": jsonResponse("Ingestion completed", "AdminIngestionMutationResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"409": jsonResponse("Conflicting active import job", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ingestion/repository": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create skill from repository source",
				"description": "Session endpoint to clone one repository source, extract skill metadata, and persist a repository-backed skill record.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminIngestionRepositoryRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Ingestion completed", "AdminIngestionMutationResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"409": jsonResponse("Conflicting active import job", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/ingestion/skillmp": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create skill from SkillMP source",
				"description": "Session endpoint to fetch one SkillMP source and persist the imported skill record.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AdminIngestionSkillMPRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Ingestion completed", "AdminIngestionMutationResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"409": jsonResponse("Conflicting active import job", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
