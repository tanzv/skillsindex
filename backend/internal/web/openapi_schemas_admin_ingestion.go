package web

func openAPISchemasAdminIngestion() map[string]any {
	return map[string]any{
		"AdminIngestionManualRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"name":            map[string]any{"type": "string"},
				"description":     map[string]any{"type": "string"},
				"content":         map[string]any{"type": "string"},
				"tags":            map[string]any{"type": "string"},
				"visibility":      map[string]any{"type": "string"},
				"install_command": map[string]any{"type": "string"},
				"category":        map[string]any{"type": "string"},
				"subcategory":     map[string]any{"type": "string"},
				"star_count":      map[string]any{"type": "integer"},
				"quality_score":   map[string]any{"type": "number"},
			},
			"required": []string{"name", "content"},
		},
		"AdminIngestionRepositoryRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"repo_url":        map[string]any{"type": "string"},
				"repo_branch":     map[string]any{"type": "string"},
				"repo_path":       map[string]any{"type": "string"},
				"tags":            map[string]any{"type": "string"},
				"visibility":      map[string]any{"type": "string"},
				"install_command": map[string]any{"type": "string"},
				"category":        map[string]any{"type": "string"},
				"subcategory":     map[string]any{"type": "string"},
				"quality_score":   map[string]any{"type": "number"},
			},
			"required": []string{"repo_url"},
		},
		"AdminIngestionUploadRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"archive":         map[string]any{"type": "string", "format": "binary"},
				"tags":            map[string]any{"type": "string"},
				"visibility":      map[string]any{"type": "string"},
				"install_command": map[string]any{"type": "string"},
				"category":        map[string]any{"type": "string"},
				"subcategory":     map[string]any{"type": "string"},
				"quality_score":   map[string]any{"type": "number"},
			},
			"required": []string{"archive"},
		},
		"AdminIngestionSkillMPRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"skillmp_url":     map[string]any{"type": "string"},
				"skillmp_id":      map[string]any{"type": "string"},
				"skillmp_token":   map[string]any{"type": "string"},
				"tags":            map[string]any{"type": "string"},
				"visibility":      map[string]any{"type": "string"},
				"install_command": map[string]any{"type": "string"},
				"category":        map[string]any{"type": "string"},
				"subcategory":     map[string]any{"type": "string"},
				"quality_score":   map[string]any{"type": "number"},
			},
		},
		"AdminIngestionMutationResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":      map[string]any{"type": "boolean"},
				"status":  map[string]any{"type": "string"},
				"message": map[string]any{"type": "string"},
				"item":    map[string]any{"$ref": "#/components/schemas/AdminSkillItem"},
			},
		},
	}
}
