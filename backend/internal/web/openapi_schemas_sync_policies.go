package web

func openAPISchemasSyncPolicies() map[string]any {
	return map[string]any{
		"SyncPolicyItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":                 map[string]any{"type": "integer"},
				"policy_id":          map[string]any{"type": "string"},
				"policy_name":        map[string]any{"type": "string"},
				"target_scope":       map[string]any{"type": "string"},
				"source_type":        map[string]any{"type": "string"},
				"cron_expr":          map[string]any{"type": "string"},
				"interval":           map[string]any{"type": "string"},
				"interval_minutes":   map[string]any{"type": "integer"},
				"timeout":            map[string]any{"type": "string"},
				"timeout_minutes":    map[string]any{"type": "integer"},
				"batch_size":         map[string]any{"type": "integer"},
				"timezone":           map[string]any{"type": "string"},
				"enabled":            map[string]any{"type": "boolean"},
				"max_retry":          map[string]any{"type": "integer"},
				"retry_backoff":      map[string]any{"type": "string"},
				"created_by_user_id": map[string]any{"type": "integer"},
				"updated_by_user_id": map[string]any{"type": "integer"},
				"deleted_at":         map[string]any{"type": "string", "format": "date-time"},
				"created_at":         map[string]any{"type": "string", "format": "date-time"},
				"updated_at":         map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"SyncPoliciesResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/SyncPolicyItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
		"SyncPolicyDetailResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/SyncPolicyItem"},
			},
		},
		"SyncPolicyCreateRequest": map[string]any{
			"type":     "object",
			"required": []string{"policy_name", "target_scope", "source_type"},
			"properties": map[string]any{
				"policy_name":      map[string]any{"type": "string"},
				"target_scope":     map[string]any{"type": "string"},
				"source_type":      map[string]any{"type": "string"},
				"cron_expr":        map[string]any{"type": "string"},
				"interval_minutes": map[string]any{"type": "integer"},
				"timeout_minutes":  map[string]any{"type": "integer"},
				"batch_size":       map[string]any{"type": "integer"},
				"timezone":         map[string]any{"type": "string"},
				"enabled":          map[string]any{"type": "boolean"},
				"max_retry":        map[string]any{"type": "integer"},
				"retry_backoff":    map[string]any{"type": "string"},
			},
		},
		"SyncPolicyUpdateRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"policy_name":      map[string]any{"type": "string"},
				"target_scope":     map[string]any{"type": "string"},
				"source_type":      map[string]any{"type": "string"},
				"cron_expr":        map[string]any{"type": "string"},
				"interval_minutes": map[string]any{"type": "integer"},
				"timeout_minutes":  map[string]any{"type": "integer"},
				"batch_size":       map[string]any{"type": "integer"},
				"timezone":         map[string]any{"type": "string"},
				"enabled":          map[string]any{"type": "boolean"},
				"max_retry":        map[string]any{"type": "integer"},
				"retry_backoff":    map[string]any{"type": "string"},
			},
		},
		"SyncPolicyToggleRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"enabled": map[string]any{"type": "boolean"},
			},
		},
		"SyncPolicyDeleteResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":     map[string]any{"type": "boolean"},
				"policy": map[string]any{"$ref": "#/components/schemas/SyncPolicyItem"},
			},
		},
	}
}
