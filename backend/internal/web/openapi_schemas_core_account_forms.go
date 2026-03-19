package web

func openAPISchemasCoreAccountInteractionForms() map[string]any {
	return map[string]any{
		"AccountProfileData": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"display_name": map[string]any{"type": "string"},
				"avatar_url":   map[string]any{"type": "string"},
				"bio":          map[string]any{"type": "string"},
			},
		},
		"AccountProfileResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":      map[string]any{"type": "boolean"},
				"user":    map[string]any{"$ref": "#/components/schemas/AuthSessionUser"},
				"profile": map[string]any{"$ref": "#/components/schemas/AccountProfileData"},
			},
		},
		"AccountProfileUpdateRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"display_name": map[string]any{"type": "string"},
				"avatar_url":   map[string]any{"type": "string"},
				"bio":          map[string]any{"type": "string"},
			},
		},
		"AccountPasswordResetRequestPayload": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"username": map[string]any{"type": "string"},
			},
		},
		"AccountPasswordResetConfirmPayload": map[string]any{
			"type":     "object",
			"required": []string{"token", "new_password"},
			"properties": map[string]any{
				"token":        map[string]any{"type": "string"},
				"new_password": map[string]any{"type": "string"},
			},
		},
		"AccountPasswordResetRequestResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":      map[string]any{"type": "boolean"},
				"message": map[string]any{"type": "string"},
			},
		},
		"AccountPasswordResetConfirmResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":      map[string]any{"type": "boolean"},
				"message": map[string]any{"type": "string"},
				"user":    map[string]any{"$ref": "#/components/schemas/AuthSessionUser"},
			},
		},
		"AccountPasswordUpdateRequest": map[string]any{
			"type":     "object",
			"required": []string{"current_password", "new_password"},
			"properties": map[string]any{
				"current_password":      map[string]any{"type": "string"},
				"new_password":          map[string]any{"type": "string"},
				"revoke_other_sessions": map[string]any{"type": "boolean"},
			},
		},
		"AccountSessionItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"session_id": map[string]any{"type": "string"},
				"user_agent": map[string]any{"type": "string"},
				"issued_ip":  map[string]any{"type": "string"},
				"last_seen":  map[string]any{"type": "string", "format": "date-time"},
				"expires_at": map[string]any{"type": "string", "format": "date-time"},
				"is_current": map[string]any{"type": "boolean"},
			},
		},
		"AccountSessionsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"current_session_id": map[string]any{"type": "string"},
				"session_issued_at":  map[string]any{"type": "string", "format": "date-time"},
				"session_expires_at": map[string]any{"type": "string", "format": "date-time"},
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/AccountSessionItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
		"CSRFTokenResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"csrf_token": map[string]any{"type": "string"},
			},
		},
		"DingTalkMeResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"user_id":            map[string]any{"type": "integer"},
				"provider":           map[string]any{"type": "string"},
				"grant_expires_at":   map[string]any{"type": "string", "format": "date-time"},
				"profile_display":    map[string]any{"type": "string"},
				"profile_open_id":    map[string]any{"type": "string"},
				"profile_union_id":   map[string]any{"type": "string"},
				"profile_avatar_url": map[string]any{"type": "string"},
			},
		},
		"InteractionFavoriteRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"favorite": map[string]any{
					"type":        "boolean",
					"description": "Optional. If omitted, backend toggles current favorite state.",
				},
			},
		},
		"InteractionRatingRequest": map[string]any{
			"type":     "object",
			"required": []string{"score"},
			"properties": map[string]any{
				"score": map[string]any{
					"type":    "integer",
					"minimum": 1,
					"maximum": 5,
				},
			},
		},
		"InteractionCommentRequest": map[string]any{
			"type":     "object",
			"required": []string{"content"},
			"properties": map[string]any{
				"content": map[string]any{
					"type":      "string",
					"maxLength": 3000,
				},
			},
		},
		"SkillOrganizationBindRequest": map[string]any{
			"type":     "object",
			"required": []string{"organization_id"},
			"properties": map[string]any{
				"organization_id": map[string]any{
					"type":    "integer",
					"minimum": 1,
				},
			},
		},
		"SkillOrganizationBindingResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":              map[string]any{"type": "boolean"},
				"skill_id":        map[string]any{"type": "integer"},
				"organization_id": map[string]any{"type": "integer", "nullable": true},
			},
		},
		"FavoriteFormRequest": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"favorite": map[string]any{
					"type":        "string",
					"description": "Toggle input, examples: on/off/true/false",
				},
			},
		},
		"RatingFormRequest": map[string]any{
			"type":     "object",
			"required": []string{"score"},
			"properties": map[string]any{
				"score": map[string]any{
					"type":    "integer",
					"minimum": 1,
					"maximum": 5,
				},
			},
		},
		"CommentFormRequest": map[string]any{
			"type":     "object",
			"required": []string{"content"},
			"properties": map[string]any{
				"content": map[string]any{
					"type":      "string",
					"maxLength": 3000,
				},
			},
		},
		"SkillOrganizationBindFormRequest": map[string]any{
			"type":     "object",
			"required": []string{"organization_id"},
			"properties": map[string]any{
				"organization_id": map[string]any{
					"type":    "integer",
					"minimum": 1,
				},
			},
		},
		"AdminUserRoleUpdateFormRequest": map[string]any{
			"type":     "object",
			"required": []string{"role"},
			"properties": map[string]any{
				"role": map[string]any{
					"type": "string",
					"enum": []string{"viewer", "member", "admin", "super_admin"},
				},
			},
		},
		"SSOProviderCreateFormRequest": map[string]any{
			"type":     "object",
			"required": []string{"provider", "authorization_url", "token_url", "client_id", "client_secret"},
			"properties": map[string]any{
				"name":                 map[string]any{"type": "string"},
				"provider":             map[string]any{"type": "string"},
				"description":          map[string]any{"type": "string"},
				"issuer":               map[string]any{"type": "string"},
				"authorization_url":    map[string]any{"type": "string"},
				"token_url":            map[string]any{"type": "string"},
				"userinfo_url":         map[string]any{"type": "string"},
				"client_id":            map[string]any{"type": "string"},
				"client_secret":        map[string]any{"type": "string"},
				"scope":                map[string]any{"type": "string"},
				"claim_external_id":    map[string]any{"type": "string"},
				"claim_username":       map[string]any{"type": "string"},
				"claim_email":          map[string]any{"type": "string"},
				"claim_email_verified": map[string]any{"type": "string"},
				"claim_groups":         map[string]any{"type": "string"},
				"offboarding_mode": map[string]any{
					"type": "string",
					"enum": []string{ssoOffboardingDisableOnly, ssoOffboardingDisableAndSignOut},
				},
				"mapping_mode": map[string]any{
					"type": "string",
					"enum": []string{ssoMappingExternalOnly, ssoMappingExternalEmail, ssoMappingExternalEmailUsername},
				},
				"default_org_id": map[string]any{"type": "integer"},
				"default_org_role": map[string]any{
					"type": "string",
					"enum": []string{"member", "viewer"},
				},
				"default_org_group_rules":   map[string]any{"type": "string"},
				"default_org_email_domains": map[string]any{"type": "string"},
				"default_user_role": map[string]any{
					"type": "string",
					"enum": []string{"member", "viewer"},
				},
			},
		},
		"SSOUsersSyncFormRequest": map[string]any{
			"type":     "object",
			"required": []string{"provider", "disabled_external_ids"},
			"properties": map[string]any{
				"provider":              map[string]any{"type": "string"},
				"disabled_external_ids": map[string]any{"type": "string"},
				"force_sign_out":        map[string]any{"type": "string"},
			},
		},
	}
}
