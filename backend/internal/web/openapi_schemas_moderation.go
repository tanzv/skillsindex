package web

func openAPISchemasModeration() map[string]any {
	return map[string]any{
		"ContentReportRequest": map[string]any{
			"type":     "object",
			"required": []string{"reason_code"},
			"properties": map[string]any{
				"reason_code":   map[string]any{"type": "string"},
				"reason_detail": map[string]any{"type": "string"},
			},
		},
		"ModerationCreateResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":      map[string]any{"type": "integer"},
				"status":  map[string]any{"type": "string"},
				"message": map[string]any{"type": "string"},
			},
		},
		"ModerationCaseItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":               map[string]any{"type": "integer"},
				"reporter_user_id": map[string]any{"type": "integer"},
				"resolver_user_id": map[string]any{"type": "integer"},
				"target_type":      map[string]any{"type": "string"},
				"skill_id":         map[string]any{"type": "integer"},
				"comment_id":       map[string]any{"type": "integer"},
				"reason_code":      map[string]any{"type": "string"},
				"reason_detail":    map[string]any{"type": "string"},
				"status":           map[string]any{"type": "string"},
				"action":           map[string]any{"type": "string"},
				"resolution_note":  map[string]any{"type": "string"},
				"resolved_at":      map[string]any{"type": "string", "format": "date-time"},
				"created_at":       map[string]any{"type": "string", "format": "date-time"},
				"updated_at":       map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"ModerationCasesResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/ModerationCaseItem"}},
				"total": map[string]any{"type": "integer"},
			},
		},
		"ModerationCaseCreateRequest": map[string]any{
			"type":     "object",
			"required": []string{"target_type", "reason_code"},
			"properties": map[string]any{
				"reporter_user_id": map[string]any{"type": "integer"},
				"target_type":      map[string]any{"type": "string"},
				"skill_id":         map[string]any{"type": "integer"},
				"comment_id":       map[string]any{"type": "integer"},
				"reason_code":      map[string]any{"type": "string"},
				"reason_detail":    map[string]any{"type": "string"},
			},
		},
		"ModerationResolveRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"action":          map[string]any{"type": "string"},
				"resolution_note": map[string]any{"type": "string"},
			},
		},
		"ModerationRejectRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"rejection_note": map[string]any{"type": "string"},
			},
		},
	}
}
