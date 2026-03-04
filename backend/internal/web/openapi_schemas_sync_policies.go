package web

func openAPISchemasSyncPolicies() map[string]any {
	return map[string]any{
		"SyncPolicyItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"policy_id":   map[string]any{"type": "string"},
				"policy_name": map[string]any{"type": "string"},
				"source_type": map[string]any{"type": "string"},
				"enabled":     map[string]any{"type": "boolean"},
				"interval":    map[string]any{"type": "string"},
				"timeout":     map[string]any{"type": "string"},
				"batch_size":  map[string]any{"type": "integer"},
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
