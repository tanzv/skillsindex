package web

func openAPISchemasAccessProviderSettings() map[string]any {
	return map[string]any{
		"AdminAuthProvidersSettingResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":                       map[string]any{"type": "boolean"},
				"auth_providers":           map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
				"available_auth_providers": map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
			},
		},
		"AdminAuthProvidersUpdateResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":             map[string]any{"type": "boolean"},
				"auth_providers": map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
			},
		},
		"AdminAuthProvidersSettingUpdateRequest": map[string]any{
			"type":     "object",
			"required": []string{"auth_providers"},
			"properties": map[string]any{
				"auth_providers": map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
			},
		},
		"AdminAuthProviderConfigItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"key":             map[string]any{"type": "string"},
				"display_name":    map[string]any{"type": "string"},
				"management_kind": map[string]any{"type": "string"},
				"configurable":    map[string]any{"type": "boolean"},
				"enabled":         map[string]any{"type": "boolean"},
				"connected":       map[string]any{"type": "boolean"},
				"available":       map[string]any{"type": "boolean"},
				"start_path":      map[string]any{"type": "string"},
				"connector_id":    map[string]any{"type": "integer"},
				"description":     map[string]any{"type": "string"},
				"base_url":        map[string]any{"type": "string"},
				"updated_at":      map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"AdminAuthProviderConfigsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":    map[string]any{"type": "boolean"},
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/AdminAuthProviderConfigItem"}},
			},
		},
		"AdminAuthProviderConfigDetail": map[string]any{
			"type": "object",
			"allOf": []any{
				map[string]any{"$ref": "#/components/schemas/AdminAuthProviderConfigItem"},
				map[string]any{
					"type": "object",
					"properties": map[string]any{
						"name":                      map[string]any{"type": "string"},
						"provider":                  map[string]any{"type": "string"},
						"issuer":                    map[string]any{"type": "string"},
						"authorization_url":         map[string]any{"type": "string"},
						"token_url":                 map[string]any{"type": "string"},
						"userinfo_url":              map[string]any{"type": "string"},
						"client_id":                 map[string]any{"type": "string"},
						"client_secret":             map[string]any{"type": "string"},
						"scope":                     map[string]any{"type": "string"},
						"claim_external_id":         map[string]any{"type": "string"},
						"claim_username":            map[string]any{"type": "string"},
						"claim_email":               map[string]any{"type": "string"},
						"claim_email_verified":      map[string]any{"type": "string"},
						"claim_groups":              map[string]any{"type": "string"},
						"offboarding_mode":          map[string]any{"type": "string"},
						"mapping_mode":              map[string]any{"type": "string"},
						"default_org_id":            map[string]any{"type": "integer"},
						"default_org_role":          map[string]any{"type": "string"},
						"default_org_group_rules":   map[string]any{"type": "string"},
						"default_org_email_domains": map[string]any{"type": "string"},
						"default_user_role":         map[string]any{"type": "string"},
					},
				},
			},
		},
		"AdminAuthProviderConfigDetailResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":   map[string]any{"type": "boolean"},
				"item": map[string]any{"$ref": "#/components/schemas/AdminAuthProviderConfigDetail"},
			},
		},
		"AdminAuthProviderConfigUpsertRequest": map[string]any{
			"type":     "object",
			"required": []string{"provider", "authorization_url", "token_url", "client_id", "client_secret"},
			"properties": map[string]any{
				"provider":                  map[string]any{"type": "string"},
				"name":                      map[string]any{"type": "string"},
				"description":               map[string]any{"type": "string"},
				"issuer":                    map[string]any{"type": "string"},
				"authorization_url":         map[string]any{"type": "string"},
				"token_url":                 map[string]any{"type": "string"},
				"userinfo_url":              map[string]any{"type": "string"},
				"client_id":                 map[string]any{"type": "string"},
				"client_secret":             map[string]any{"type": "string"},
				"scope":                     map[string]any{"type": "string"},
				"claim_external_id":         map[string]any{"type": "string"},
				"claim_username":            map[string]any{"type": "string"},
				"claim_email":               map[string]any{"type": "string"},
				"claim_email_verified":      map[string]any{"type": "string"},
				"claim_groups":              map[string]any{"type": "string"},
				"offboarding_mode":          map[string]any{"type": "string"},
				"mapping_mode":              map[string]any{"type": "string"},
				"default_org_id":            map[string]any{"type": "integer"},
				"default_org_role":          map[string]any{"type": "string"},
				"default_org_group_rules":   map[string]any{"type": "string"},
				"default_org_email_domains": map[string]any{"type": "string"},
				"default_user_role":         map[string]any{"type": "string"},
			},
		},
	}
}
