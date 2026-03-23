package web

func openAPISchemasPublicSkillExtensions() map[string]any {
	return map[string]any{
		"PublicSkillCompareResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"left_skill":  map[string]any{"$ref": "#/components/schemas/SkillItem"},
				"right_skill": map[string]any{"$ref": "#/components/schemas/SkillItem"},
			},
		},
		"PublicSkillResourceFile": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"name":         map[string]any{"type": "string"},
				"display_name": map[string]any{"type": "string"},
				"size_bytes":   map[string]any{"type": "integer"},
				"size_label":   map[string]any{"type": "string"},
				"language":     map[string]any{"type": "string"},
			},
		},
		"PublicSkillResourcesResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"skill_id":        map[string]any{"type": "integer"},
				"source_type":     map[string]any{"type": "string"},
				"source_url":      map[string]any{"type": "string"},
				"repo_url":        map[string]any{"type": "string"},
				"source_branch":   map[string]any{"type": "string"},
				"source_path":     map[string]any{"type": "string"},
				"install_command": map[string]any{"type": "string"},
				"updated_at":      map[string]any{"type": "string", "format": "date-time"},
				"file_count":      map[string]any{"type": "integer"},
				"files": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/PublicSkillResourceFile"},
				},
			},
		},
		"PublicSkillResourceContentResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"skill_id":     map[string]any{"type": "integer"},
				"path":         map[string]any{"type": "string"},
				"display_name": map[string]any{"type": "string"},
				"language":     map[string]any{"type": "string"},
				"size_bytes":   map[string]any{"type": "integer"},
				"size_label":   map[string]any{"type": "string"},
				"content":      map[string]any{"type": "string"},
				"updated_at":   map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"PublicSkillVersionItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":                 map[string]any{"type": "integer"},
				"skill_id":           map[string]any{"type": "integer"},
				"version_number":     map[string]any{"type": "integer"},
				"trigger":            map[string]any{"type": "string"},
				"change_summary":     map[string]any{"type": "string"},
				"risk_level":         map[string]any{"type": "string"},
				"captured_at":        map[string]any{"type": "string", "format": "date-time"},
				"archived_at":        map[string]any{"type": "string", "format": "date-time", "nullable": true},
				"archive_reason":     map[string]any{"type": "string"},
				"actor_username":     map[string]any{"type": "string"},
				"actor_display_name": map[string]any{"type": "string"},
				"tags":               map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
				"changed_fields":     map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
			},
		},
		"PublicSkillVersionsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/PublicSkillVersionItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
	}
}
