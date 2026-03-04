package web

func openAPISchemasAdminAPIKey() map[string]any {
	return map[string]any{
		"APIKeyCreateFormRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"name": map[string]any{
					"type": "string",
				},
				"purpose": map[string]any{
					"type": "string",
				},
				"expires_in_days": map[string]any{
					"type":    "integer",
					"minimum": 0,
				},
				"scopes": map[string]any{
					"type": "string",
				},
			},
		},
		"AdminAPIKeyItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":              map[string]any{"type": "integer"},
				"user_id":         map[string]any{"type": "integer"},
				"created_by":      map[string]any{"type": "integer"},
				"owner_username":  map[string]any{"type": "string"},
				"name":            map[string]any{"type": "string"},
				"purpose":         map[string]any{"type": "string"},
				"prefix":          map[string]any{"type": "string"},
				"scopes":          map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
				"status":          map[string]any{"type": "string"},
				"revoked_at":      map[string]any{"type": "string", "format": "date-time"},
				"expires_at":      map[string]any{"type": "string", "format": "date-time"},
				"last_rotated_at": map[string]any{"type": "string", "format": "date-time"},
				"last_used_at":    map[string]any{"type": "string", "format": "date-time"},
				"created_at":      map[string]any{"type": "string", "format": "date-time"},
				"updated_at":      map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"AdminAPIKeysResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/AdminAPIKeyItem"}},
				"total": map[string]any{"type": "integer"},
			},
		},
		"AdminAPIKeyCreateRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"name": map[string]any{
					"type": "string",
				},
				"purpose": map[string]any{
					"type": "string",
				},
				"expires_in_days": map[string]any{
					"type":    "integer",
					"minimum": 0,
				},
				"owner_user_id": map[string]any{
					"type": "integer",
				},
				"scopes": map[string]any{
					"type": "array",
					"items": map[string]any{
						"type": "string",
					},
				},
			},
		},
		"AdminAPIKeyScopesUpdateRequest": map[string]any{
			"type":     "object",
			"required": []string{"scopes"},
			"properties": map[string]any{
				"scopes": map[string]any{
					"type": "array",
					"items": map[string]any{
						"type": "string",
					},
				},
			},
		},
		"AdminAPIKeyItemResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{
					"$ref": "#/components/schemas/AdminAPIKeyItem",
				},
			},
		},
		"AdminAPIKeyCredentialResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{
					"$ref": "#/components/schemas/AdminAPIKeyItem",
				},
				"plaintext_key": map[string]any{
					"type": "string",
				},
			},
		},
	}
}
