package web

func openAPIPathsWebRoutes() map[string]any {
	return map[string]any{
		"/skills/{skillID}/versions": map[string]any{
			"get": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Open skill version history",
				"description": "Session endpoint for owner/admin/super_admin to browse version snapshots.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					queryParam("trigger", "string", false, "Optional trigger filter, for example sync or rollback"),
					queryParam("from_time", "string", false, "Optional time filter start (RFC3339 or YYYY-MM-DD)"),
					queryParam("to_time", "string", false, "Optional time filter end (RFC3339 or YYYY-MM-DD)"),
					queryParam("include_archived", "boolean", false, "Set true to include archived versions"),
				},
				"responses": map[string]any{
					"200": simpleResponse("Rendered version history page"),
					"303": redirectResponse("Redirect to login or skill detail when unavailable"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Skill not found"),
				},
			},
		},
		"/skills/{skillID}/versions/{versionID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Open one skill version snapshot",
				"description": "Session endpoint for owner/admin/super_admin to inspect one historical snapshot.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					pathParam("versionID", "Version ID"),
				},
				"responses": map[string]any{
					"200": simpleResponse("Rendered version detail page"),
					"303": redirectResponse("Redirect to login or skill detail when unavailable"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Skill or version not found"),
				},
			},
		},
		"/skills/{skillID}/versions/compare": map[string]any{
			"get": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Compare two skill versions",
				"description": "Session endpoint for owner/admin/super_admin to compare two snapshots using from/to IDs.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					queryParam("from", "integer", true, "Version ID for baseline"),
					queryParam("to", "integer", true, "Version ID for target"),
				},
				"responses": map[string]any{
					"200": simpleResponse("Rendered version compare page"),
					"303": redirectResponse("Redirect to login or skill detail when unavailable"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Skill or version not found"),
				},
			},
		},
		"/skills/{skillID}/versions/{versionID}/rollback": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Rollback skill to one historical snapshot",
				"description": "Session endpoint. Allowed for owner/admin/super_admin. Rollback appends a new version snapshot.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					pathParam("versionID", "Version ID"),
				},
				"responses": map[string]any{
					"303": redirectResponse("Redirect to skill detail with rollback result"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Skill or version not found"),
				},
			},
		},
		"/skills/{skillID}/favorite": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Favorite or unfavorite a skill",
				"description": "Session endpoint. Allowed roles: member/admin/super_admin. Viewer and guest are denied.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": formRequestBody("FavoriteFormRequest", false),
				"responses": map[string]any{
					"303": redirectResponse("Redirect to skill detail after update"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Skill not found"),
				},
			},
		},
		"/skills/{skillID}/rating": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Submit a rating for one skill",
				"description": "Session endpoint. Allowed roles: member/admin/super_admin. Score must be in range 1-5.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": formRequestBody("RatingFormRequest", true),
				"responses": map[string]any{
					"303": redirectResponse("Redirect to skill detail after update"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Skill not found"),
				},
			},
		},
		"/skills/{skillID}/comments": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Create one skill comment",
				"description": "Session endpoint. Allowed roles: member/admin/super_admin.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": formRequestBody("CommentFormRequest", true),
				"responses": map[string]any{
					"303": redirectResponse("Redirect to skill detail after create"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Skill not found"),
				},
			},
		},
		"/skills/{skillID}/comments/{commentID}/delete": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Delete one skill comment",
				"description": "Session endpoint. Allowed when actor is comment author or admin/super_admin.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					pathParam("commentID", "Comment ID"),
				},
				"responses": map[string]any{
					"303": redirectResponse("Redirect to skill detail after delete"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Comment not found"),
				},
			},
		},
		"/skills/{skillID}/organization-bind": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Bind one skill to one organization",
				"description": "Session endpoint. Allowed for skill owner/admin/super_admin with organization management permission.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": formRequestBody("SkillOrganizationBindFormRequest", true),
				"responses": map[string]any{
					"303": redirectResponse("Redirect to skill detail with bind result"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Skill or organization not found"),
				},
			},
		},
		"/skills/{skillID}/organization-unbind": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Unbind one skill from organization",
				"description": "Session endpoint. Allowed for skill owner/admin/super_admin with organization management permission when organization exists.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"responses": map[string]any{
					"303": redirectResponse("Redirect to skill detail with unbind result"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Skill not found"),
				},
			},
		},
		"/auth/sso/start/{provider}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"oauth"},
				"summary":     "Start enterprise SSO authorization",
				"description": "Redirect to configured enterprise OIDC provider authorization URL.",
				"parameters": []map[string]any{
					pathParam("provider", "SSO provider key"),
				},
				"responses": map[string]any{
					"307": redirectResponse("Redirect to enterprise identity provider"),
					"303": redirectResponse("Redirect to login when provider is unavailable"),
				},
			},
		},
		"/auth/sso/callback/{provider}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"oauth"},
				"summary":     "Handle enterprise SSO callback",
				"description": "Exchange OIDC authorization code, resolve account mapping, and issue local session.",
				"parameters": []map[string]any{
					pathParam("provider", "SSO provider key"),
					queryParam("state", "string", true, "Opaque anti-CSRF state"),
					queryParam("code", "string", true, "OIDC authorization code"),
				},
				"responses": map[string]any{
					"303": redirectResponse("Redirect to admin or login with error message"),
				},
			},
		},
		"/admin/apikeys/create": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create account API key",
				"description": "Dashboard session endpoint. member/admin can create own keys; super_admin can also manage globally.",
				"security":    sessionSecurity(),
				"requestBody": formRequestBody("APIKeyCreateFormRequest", false),
				"responses": map[string]any{
					"303": redirectResponse("Redirect to dashboard with one-time key preview"),
					"403": simpleResponse("Permission denied"),
				},
			},
		},
		"/admin/apikeys/{keyID}/revoke": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Revoke account API key",
				"description": "Dashboard session endpoint. member/admin can revoke own keys, super_admin can revoke any key.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("keyID", "API key ID"),
				},
				"responses": map[string]any{
					"303": redirectResponse("Redirect to dashboard after revoke"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("API key not found"),
				},
			},
		},
		"/admin/sso/providers/create": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Create enterprise SSO provider",
				"description": "Dashboard session endpoint. super_admin creates one OIDC provider entry.",
				"security":    sessionSecurity(),
				"requestBody": formRequestBody("SSOProviderCreateFormRequest", true),
				"responses": map[string]any{
					"303": redirectResponse("Redirect to integration list after create"),
					"403": simpleResponse("Permission denied"),
				},
			},
		},
		"/admin/sso/providers/{providerID}/disable": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Disable enterprise SSO provider",
				"description": "Dashboard session endpoint. super_admin disables one provider by id.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("providerID", "SSO provider connector ID"),
				},
				"responses": map[string]any{
					"303": redirectResponse("Redirect to integration list after disable"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("Provider not found"),
				},
			},
		},
		"/admin/sso/users/sync": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Sync disabled users from enterprise SSO",
				"description": "Dashboard session endpoint. super_admin disables mapped local users by external identity list.",
				"security":    sessionSecurity(),
				"requestBody": formRequestBody("SSOUsersSyncFormRequest", true),
				"responses": map[string]any{
					"303": redirectResponse("Redirect to access workspace with sync result message"),
					"403": simpleResponse("Permission denied"),
				},
			},
		},
		"/admin/apikeys/{keyID}/rotate": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Rotate account API key",
				"description": "Dashboard session endpoint. member/admin can rotate own keys, super_admin can rotate any key.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("keyID", "API key ID"),
				},
				"responses": map[string]any{
					"303": redirectResponse("Redirect to dashboard with new one-time key preview"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("API key not found"),
				},
			},
		},
		"/admin/users/{userID}/role": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Update one account role",
				"description": "Dashboard session endpoint. super_admin updates one account role with last-super-admin guard.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("userID", "User ID"),
				},
				"requestBody": formRequestBody("AdminUserRoleUpdateFormRequest", true),
				"responses": map[string]any{
					"303": redirectResponse("Redirect to dashboard with result message"),
					"403": simpleResponse("Permission denied"),
					"404": simpleResponse("User not found"),
					"409": simpleResponse("Last super admin guard"),
				},
			},
		},
	}
}
