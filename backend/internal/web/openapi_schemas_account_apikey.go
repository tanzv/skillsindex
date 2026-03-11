package web

func openAPISchemasAccountAPIKey() map[string]any {
	return map[string]any{
		"AccountAPIKeyItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":              map[string]any{"type": "integer"},
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
		"AccountAPIKeysResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items":            map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/AccountAPIKeyItem"}},
				"total":            map[string]any{"type": "integer"},
				"supported_scopes": map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
				"default_scopes":   map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
			},
		},
		"AccountAPIKeyCreateRequest": map[string]any{
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
					"type": "array",
					"items": map[string]any{
						"type": "string",
					},
				},
			},
		},
		"AccountAPIKeyScopesUpdateRequest": map[string]any{
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
		"AccountAPIKeyItemResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{
					"$ref": "#/components/schemas/AccountAPIKeyItem",
				},
			},
		},
		"AccountAPIKeyCredentialResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{
					"$ref": "#/components/schemas/AccountAPIKeyItem",
				},
				"plaintext_key": map[string]any{
					"type": "string",
				},
			},
		},
	}
}
