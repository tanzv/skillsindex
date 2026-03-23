package web

func openAPIPathsModerationInteraction() map[string]any {
	return map[string]any{
		"/api/v1/admin/moderation": map[string]any{
			"get": map[string]any{
				"tags":        []string{"moderation"},
				"summary":     "List moderation cases",
				"description": "Session endpoint for admin/super_admin moderation queue browsing.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("status", "string", false, "Case status filter: open|resolved|rejected"),
					queryParam("limit", "integer", false, "Maximum records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Moderation queue", "ModerationCasesResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"moderation"},
				"summary":     "Create moderation case manually",
				"description": "Session endpoint for admin/super_admin to create moderation cases directly.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("ModerationCaseCreateRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Case created", "ModerationCaseItem"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/moderation/{caseID}/resolve": map[string]any{
			"post": map[string]any{
				"tags":        []string{"moderation"},
				"summary":     "Resolve moderation case",
				"description": "Session endpoint for admin/super_admin to resolve moderation case with action.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("caseID", "Moderation case ID"),
				},
				"requestBody": jsonRequestBody("ModerationResolveRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Case resolved", "ModerationCaseItem"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Case not found", "ErrorResponse"),
					"409": jsonResponse("Case already closed", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/moderation/{caseID}/reject": map[string]any{
			"post": map[string]any{
				"tags":        []string{"moderation"},
				"summary":     "Reject moderation case",
				"description": "Session endpoint for admin/super_admin to reject moderation case.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("caseID", "Moderation case ID"),
				},
				"requestBody": jsonRequestBody("ModerationRejectRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Case rejected", "ModerationCaseItem"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Case not found", "ErrorResponse"),
					"409": jsonResponse("Case already closed", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/report": map[string]any{
			"post": map[string]any{
				"tags":        []string{"moderation"},
				"summary":     "Report one skill",
				"description": "Session endpoint for member/admin/super_admin to submit skill report into moderation queue.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": jsonRequestBody("ContentReportRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Report created", "ModerationCreateResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/comments/{commentID}/report": map[string]any{
			"post": map[string]any{
				"tags":        []string{"moderation"},
				"summary":     "Report one comment",
				"description": "Session endpoint for member/admin/super_admin to report comment content.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					pathParam("commentID", "Comment ID"),
				},
				"requestBody": jsonRequestBody("ContentReportRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Report created", "ModerationCreateResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/favorite": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Favorite or unfavorite one skill",
				"description": "Session JSON endpoint for member/admin/super_admin to update favorite status.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": jsonRequestBody("InteractionFavoriteRequest", false),
				"responses": map[string]any{
					"200": jsonResponse("Favorite status updated", "SuccessResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/rating": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Submit one skill rating",
				"description": "Session JSON endpoint for member/admin/super_admin to submit score 1-5.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": jsonRequestBody("InteractionRatingRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Rating updated", "SuccessResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/comments": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Create one skill comment",
				"description": "Session JSON endpoint for member/admin/super_admin to create comment.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": jsonRequestBody("InteractionCommentRequest", true),
				"responses": map[string]any{
					"201": jsonResponse("Comment created", "SuccessResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/comments/{commentID}/delete": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Delete one skill comment",
				"description": "Session JSON endpoint. Actor must be comment author or admin/super_admin.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					pathParam("commentID", "Comment ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Comment deleted", "SuccessResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill or comment not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/sync-runs": map[string]any{
			"get": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "List sync runs of one skill",
				"description": "Session JSON endpoint for owner/admin/super_admin to query synchronization run history of one skill.",
				"security":    sessionSecurity(),
				"parameters":  openAPISkillSyncRunListQueryParams(),
				"responses": map[string]any{
					"200": jsonResponse("Sync run records", "SyncJobsResponse"),
					"400": jsonResponse("Invalid query filter", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/sync-runs/{runID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Get one sync run of one skill",
				"description": "Session JSON endpoint for owner/admin/super_admin to query one synchronization run by id.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					pathParam("runID", "Sync run ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Sync run detail", "SyncJobDetailResponse"),
					"400": jsonResponse("Invalid run id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill or sync run not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/organization-bind": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Bind skill to organization",
				"description": "Session JSON endpoint for owner/admin/super_admin to bind one skill to one organization.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"requestBody": jsonRequestBody("SkillOrganizationBindRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Organization binding updated", "SkillOrganizationBindingResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill or organization not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/organization-unbind": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Unbind skill from organization",
				"description": "Session JSON endpoint for owner/admin/super_admin to unbind one skill from organization.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Organization unbound", "SkillOrganizationBindingResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/versions": map[string]any{
			"get": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "List historical versions of one skill",
				"description": "Session JSON endpoint for owner/admin/super_admin to query one skill version history.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					queryParam("trigger", "string", false, "Optional trigger filter, for example sync or rollback"),
					queryParam("from_time", "string", false, "Optional captured_at lower bound in RFC3339 or YYYY-MM-DD"),
					queryParam("to_time", "string", false, "Optional captured_at upper bound in RFC3339 or YYYY-MM-DD"),
					queryParam("include_archived", "boolean", false, "Set true to include archived versions"),
					queryParam("limit", "integer", false, "Maximum version records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Skill version history", "SkillVersionsResponse"),
					"400": jsonResponse("Invalid query filter", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/versions/{versionID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Get one historical version of one skill",
				"description": "Session JSON endpoint for owner/admin/super_admin to query one skill version snapshot by id.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					pathParam("versionID", "Version ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Skill version detail", "SkillVersionDetailResponse"),
					"400": jsonResponse("Invalid skill or version id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill or version not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/versions/{versionID}/rollback": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Rollback skill to one historical snapshot",
				"description": "Session JSON endpoint for owner/admin/super_admin. Rollback appends a new version snapshot.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					pathParam("versionID", "Version ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Rollback completed", "SuccessResponse"),
					"400": jsonResponse("Rollback failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill or version not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/{skillID}/versions/{versionID}/restore": map[string]any{
			"post": map[string]any{
				"tags":        []string{"interaction"},
				"summary":     "Restore skill from one historical snapshot",
				"description": "Session JSON endpoint for owner/admin/super_admin to restore one version snapshot.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("skillID", "Skill ID"),
					pathParam("versionID", "Version ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Restore completed", "SuccessResponse"),
					"400": jsonResponse("Restore failed", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Skill or version not found", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
