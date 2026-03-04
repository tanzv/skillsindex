package web

import "skillsindex/internal/models"

func openAPISchemasAdminSSO() map[string]any {
	return map[string]any{
		"AdminSSOProviderCreateRequest": map[string]any{
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
					"enum": []string{string(models.OrganizationRoleMember), string(models.OrganizationRoleViewer)},
				},
				"default_org_group_rules":   map[string]any{"type": "string"},
				"default_org_email_domains": map[string]any{"type": "string"},
				"default_user_role": map[string]any{
					"type": "string",
					"enum": []string{string(models.RoleMember), string(models.RoleViewer)},
				},
			},
		},
		"AdminSSOProviderItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":          map[string]any{"type": "integer"},
				"name":        map[string]any{"type": "string"},
				"provider":    map[string]any{"type": "string"},
				"description": map[string]any{"type": "string"},
				"base_url":    map[string]any{"type": "string"},
				"enabled":     map[string]any{"type": "boolean"},
				"offboarding_mode": map[string]any{
					"type": "string",
					"enum": []string{ssoOffboardingDisableOnly, ssoOffboardingDisableAndSignOut},
				},
				"mapping_mode": map[string]any{
					"type": "string",
					"enum": []string{ssoMappingExternalOnly, ssoMappingExternalEmail, ssoMappingExternalEmailUsername},
				},
				"claim_email_verified": map[string]any{"type": "string"},
				"claim_groups":         map[string]any{"type": "string"},
				"default_org_id":       map[string]any{"type": "integer"},
				"default_org_role": map[string]any{
					"type": "string",
					"enum": []string{string(models.OrganizationRoleMember), string(models.OrganizationRoleViewer)},
				},
				"default_org_group_rules": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/AdminSSOOrgGroupRule"},
				},
				"default_org_email_domains": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"default_user_role": map[string]any{
					"type": "string",
					"enum": []string{string(models.RoleMember), string(models.RoleViewer)},
				},
				"created_by": map[string]any{"type": "integer"},
				"created_at": map[string]any{"type": "string", "format": "date-time"},
				"updated_at": map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"AdminSSOProviderItemResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{
					"$ref": "#/components/schemas/AdminSSOProviderItem",
				},
			},
		},
		"AdminSSOOrgGroupRule": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"group":    map[string]any{"type": "string"},
				"org_id":   map[string]any{"type": "integer"},
				"org_role": map[string]any{"type": "string", "enum": []string{string(models.OrganizationRoleMember), string(models.OrganizationRoleViewer)}},
			},
		},
		"AdminSSOProvidersResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/AdminSSOProviderItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
		"AdminSSOUsersSyncRequest": map[string]any{
			"type":     "object",
			"required": []string{"provider", "disabled_external_ids"},
			"properties": map[string]any{
				"provider": map[string]any{"type": "string"},
				"disabled_external_ids": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"force_sign_out": map[string]any{"type": "boolean"},
			},
		},
		"AdminSSOUsersSyncResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok":                   map[string]any{"type": "boolean"},
				"provider":             map[string]any{"type": "string"},
				"disabled_count":       map[string]any{"type": "integer"},
				"requested_identities": map[string]any{"type": "integer"},
				"force_sign_out":       map[string]any{"type": "boolean"},
			},
		},
	}
}
