package web

func openAPISchemasAccessOrgModeration() map[string]any {
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
		"SuccessResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok": map[string]any{"type": "boolean"},
			},
		},
		"ObjectRequest": map[string]any{
			"type":                 "object",
			"additionalProperties": true,
		},
		"ObjectResponse": map[string]any{
			"type":                 "object",
			"additionalProperties": true,
		},
		"ErrorResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"error":   map[string]any{"type": "string"},
				"message": map[string]any{"type": "string"},
			},
		},
	}
}
