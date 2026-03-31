package web

func openAPISchemasAccessCore() map[string]any {
	return map[string]any{
		"RepositorySyncPolicyUpdateRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"enabled":    map[string]any{"type": "boolean"},
				"interval":   map[string]any{"type": "string"},
				"timeout":    map[string]any{"type": "string"},
				"batch_size": map[string]any{"type": "integer"},
			},
		},
		"AdminAccountItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":                   map[string]any{"type": "integer"},
				"username":             map[string]any{"type": "string"},
				"role":                 map[string]any{"type": "string"},
				"status":               map[string]any{"type": "string"},
				"created_at":           map[string]any{"type": "string", "format": "date-time"},
				"updated_at":           map[string]any{"type": "string", "format": "date-time"},
				"force_logout_at":      map[string]any{"type": "string", "format": "date-time"},
				"last_seen_at":         map[string]any{"type": "string", "format": "date-time"},
				"active_session_count": map[string]any{"type": "integer"},
			},
		},
		"AdminAccountsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/AdminAccountItem"}},
				"total": map[string]any{"type": "integer"},
			},
		},
		"AdminRegistrationSettingResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":                        map[string]any{"type": "boolean"},
				"allow_registration":        map[string]any{"type": "boolean"},
				"marketplace_public_access": map[string]any{"type": "boolean"},
			},
		},
		"AdminRegistrationSettingUpdateRequest": map[string]any{
			"type":     "object",
			"required": []string{"allow_registration"},
			"properties": map[string]any{
				"allow_registration":        map[string]any{"type": "boolean"},
				"marketplace_public_access": map[string]any{"type": "boolean"},
			},
		},
		"AdminMarketplaceRankingSettingResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":                    map[string]any{"type": "boolean"},
				"default_sort":          map[string]any{"type": "string"},
				"ranking_limit":         map[string]any{"type": "integer"},
				"highlight_limit":       map[string]any{"type": "integer"},
				"category_leader_limit": map[string]any{"type": "integer"},
			},
		},
		"AdminMarketplaceRankingSettingUpdateRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"default_sort":          map[string]any{"type": "string"},
				"ranking_limit":         map[string]any{"type": "integer"},
				"highlight_limit":       map[string]any{"type": "integer"},
				"category_leader_limit": map[string]any{"type": "integer"},
			},
		},
		"AdminCategoryCatalogSubcategoryItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"slug":       map[string]any{"type": "string"},
				"name":       map[string]any{"type": "string"},
				"enabled":    map[string]any{"type": "boolean"},
				"sort_order": map[string]any{"type": "integer"},
			},
		},
		"AdminCategoryCatalogItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"slug":        map[string]any{"type": "string"},
				"name":        map[string]any{"type": "string"},
				"description": map[string]any{"type": "string"},
				"enabled":     map[string]any{"type": "boolean"},
				"sort_order":  map[string]any{"type": "integer"},
				"subcategories": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/AdminCategoryCatalogSubcategoryItem"},
				},
			},
		},
		"AdminCategoryCatalogSettingResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok": map[string]any{"type": "boolean"},
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/AdminCategoryCatalogItem"},
				},
			},
		},
		"AdminCategoryCatalogSettingUpdateRequest": map[string]any{
			"type":     "object",
			"required": []string{"items"},
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/AdminCategoryCatalogItem"},
				},
			},
		},
		"AdminUserRoleUpdateRequest": map[string]any{
			"type":     "object",
			"required": []string{"role"},
			"properties": map[string]any{
				"role": map[string]any{"type": "string"},
			},
		},
		"AdminUserRoleUpdateResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":      map[string]any{"type": "boolean"},
				"user_id": map[string]any{"type": "integer"},
				"role":    map[string]any{"type": "string"},
			},
		},
		"AdminAccountStatusRequest": map[string]any{
			"type":     "object",
			"required": []string{"status"},
			"properties": map[string]any{
				"status": map[string]any{"type": "string"},
			},
		},
		"AdminAccountPasswordResetRequest": map[string]any{
			"type":     "object",
			"required": []string{"new_password"},
			"properties": map[string]any{
				"new_password": map[string]any{"type": "string"},
			},
		},
	}
}
