package web

func openAPISchemasOrganizations() map[string]any {
	return map[string]any{
		"OrganizationItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":         map[string]any{"type": "integer"},
				"name":       map[string]any{"type": "string"},
				"slug":       map[string]any{"type": "string"},
				"created_at": map[string]any{"type": "string", "format": "date-time"},
				"updated_at": map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"OrganizationsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/OrganizationItem"}},
				"total": map[string]any{"type": "integer"},
			},
		},
		"OrganizationCreateRequest": map[string]any{
			"type":     "object",
			"required": []string{"name"},
			"properties": map[string]any{
				"name": map[string]any{"type": "string"},
			},
		},
		"OrganizationMemberItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"organization_id": map[string]any{"type": "integer"},
				"user_id":         map[string]any{"type": "integer"},
				"username":        map[string]any{"type": "string"},
				"user_role":       map[string]any{"type": "string"},
				"user_status":     map[string]any{"type": "string"},
				"role":            map[string]any{"type": "string"},
				"created_at":      map[string]any{"type": "string", "format": "date-time"},
				"updated_at":      map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"OrganizationMembersResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/OrganizationMemberItem"}},
				"total": map[string]any{"type": "integer"},
			},
		},
		"OrganizationMemberUpsertRequest": map[string]any{
			"type":     "object",
			"required": []string{"user_id", "role"},
			"properties": map[string]any{
				"user_id": map[string]any{"type": "integer"},
				"role":    map[string]any{"type": "string"},
			},
		},
		"OrganizationRoleUpdateRequest": map[string]any{
			"type":     "object",
			"required": []string{"role"},
			"properties": map[string]any{
				"role": map[string]any{"type": "string"},
			},
		},
	}
}
