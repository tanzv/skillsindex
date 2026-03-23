package web

func openAPIPathsPublicAuth() map[string]any {
	return map[string]any{
		"/api/v1/public/marketplace": map[string]any{
			"get": map[string]any{
				"tags":        []string{"skills"},
				"summary":     "Get public marketplace payload for prototype frontend",
				"description": "Public endpoint that returns query filters, stats, pagination, categories, top tags, and skill cards. Session user context is included when cookie is present. When marketplace_public_access=false, anonymous callers receive 401 and frontend routes should redirect to login.",
				"parameters": []map[string]any{
					queryParam("q", "string", false, "Search keyword"),
					queryParam("tags", "string", false, "Comma-separated tags"),
					queryParam("category", "string", false, "Category slug"),
					queryParam("subcategory", "string", false, "Subcategory slug"),
					queryParam("category_group", "string", false, "Presentation taxonomy category slug"),
					queryParam("subcategory_group", "string", false, "Presentation taxonomy subcategory slug"),
					queryParam("scope", "string", false, "Optional route scope: category_hub|category_detail"),
					queryParam("sort", "string", false, "Sort field: recent|stars|quality"),
					queryParam("mode", "string", false, "Search mode: keyword|ai"),
					queryParam("page", "integer", false, "Page number"),
					queryParam("page_size", "integer", false, "Page size, max 24 unless one unpaginated category scope is requested"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Public marketplace payload", "PublicMarketplaceResponse"),
					"401": jsonResponse("Authentication required when marketplace is private", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/public/rankings": map[string]any{
			"get": map[string]any{
				"tags":        []string{"skills"},
				"summary":     "Get public rankings payload",
				"description": "Public endpoint that returns backend-owned ranking sections for the rankings route. When marketplace_public_access=false, anonymous callers receive 401 and frontend routes should redirect to login.",
				"parameters": []map[string]any{
					queryParam("sort", "string", false, "Ranking sort: stars|quality"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Public rankings payload", "PublicRankingResponse"),
					"401": jsonResponse("Authentication required when marketplace is private", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/public/skills/{skillID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"skills"},
				"summary":     "Get one skill detail with interaction aggregation",
				"description": "Public endpoint for skill detail page. Returns visible skill, stats, comments (max 80), and current viewer interaction state. When marketplace_public_access=false, anonymous callers receive 401 before public detail is resolved.",
				"parameters": []map[string]any{
					pathParam("skillID", "Skill identifier"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Public skill detail payload", "PublicSkillDetailResponse"),
					"401": jsonResponse("Authentication required when marketplace is private", "ErrorResponse"),
					"404": jsonResponse("Skill not found", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/search": map[string]any{
			"get": map[string]any{
				"tags":        []string{"skills"},
				"summary":     "Keyword search public skills",
				"description": "Search public skills with keyword and metadata filters. Required scope: skills.search.read. Invalid, expired, or missing keys return 401 api_key_invalid. Keys that authenticate but lack required scope, including static compatibility keys on protected routes and empty or invalid stored scope sets, return 403 api_key_scope_denied.",
				"security":    apiKeySecurity(),
				"parameters": []map[string]any{
					queryParam("q", "string", false, "Search keyword"),
					queryParam("tags", "string", false, "Comma-separated tags"),
					queryParam("category", "string", false, "Category slug"),
					queryParam("subcategory", "string", false, "Subcategory slug"),
					queryParam("sort", "string", false, "Sort field: recent|stars|quality"),
					queryParam("page", "integer", false, "Page number"),
					queryParam("limit", "integer", false, "Page size"),
					queryParam("api_key", "string", false, "API key in query"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Search result list", "SearchSkillsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("API key scope denied", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
				},
			},
		},
		"/api/v1/skills/ai-search": map[string]any{
			"get": map[string]any{
				"tags":        []string{"skills"},
				"summary":     "AI semantic search public skills",
				"description": "Semantic search against public skills. Required scope: skills.ai_search.read. Invalid, expired, or missing keys return 401 api_key_invalid. Keys that authenticate but lack required scope, including static compatibility keys on protected routes and empty or invalid stored scope sets, return 403 api_key_scope_denied.",
				"security":    apiKeySecurity(),
				"parameters": []map[string]any{
					queryParam("q", "string", true, "Natural language query"),
					queryParam("page", "integer", false, "Page number"),
					queryParam("limit", "integer", false, "Maximum result count"),
					queryParam("api_key", "string", false, "API key in query"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Semantic search result list", "AISearchSkillsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("API key scope denied", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
				},
			},
		},
		"/api/v1/auth/login": map[string]any{
			"post": map[string]any{
				"tags":        []string{"oauth"},
				"summary":     "Create session with username and password",
				"description": "Authenticate one account and issue session cookie for frontend API usage. Repeated failed attempts are rate limited per username and source IP window.",
				"requestBody": jsonRequestBody("AuthLoginRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Session established", "AuthSessionResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"429": jsonResponse("Too many failed sign-in attempts", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/auth/providers": map[string]any{
			"get": map[string]any{
				"tags":        []string{"oauth"},
				"summary":     "List configured third-party auth providers",
				"description": "Public endpoint for login page to fetch enabled and currently available third-party providers.",
				"responses": map[string]any{
					"200": jsonResponse("Enabled and available auth providers", "AuthProvidersResponse"),
				},
			},
		},
		"/api/v1/auth/csrf": map[string]any{
			"get": map[string]any{
				"tags":        []string{"oauth"},
				"summary":     "Issue CSRF token and cookie",
				"description": "Issue CSRF token for session-based frontend mutation requests.",
				"responses": map[string]any{
					"200": jsonResponse("CSRF token payload", "CSRFTokenResponse"),
					"500": jsonResponse("Token issue failed", "ErrorResponse"),
				},
			},
		},
		"/api/v1/auth/me": map[string]any{
			"get": map[string]any{
				"tags":        []string{"oauth"},
				"summary":     "Get current session account",
				"description": "Resolve current signed-in account from session cookie. Returns user=null when anonymous.",
				"responses": map[string]any{
					"200": jsonResponse("Current session account", "AuthSessionResponse"),
					"404": jsonResponse("User not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/auth/logout": map[string]any{
			"post": map[string]any{
				"tags":        []string{"oauth"},
				"summary":     "Terminate current session",
				"description": "Revoke current session and clear cookie.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Logout completed", "SuccessResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/profile": map[string]any{
			"get": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Get current account profile",
				"description": "Session endpoint to fetch current account profile detail.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Current account profile", "AccountProfileResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"404": jsonResponse("Account not found", "ErrorResponse"),
				},
			},
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Update current account profile",
				"description": "Session endpoint to update display name, avatar URL, and bio.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AccountProfileUpdateRequest", false),
				"responses": map[string]any{
					"200": jsonResponse("Updated account profile", "AccountProfileResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/password-reset/request": map[string]any{
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Request account password reset token",
				"description": "Public endpoint to request one password reset token by username. Response remains generic for unknown accounts.",
				"requestBody": jsonRequestBody("AccountPasswordResetRequestPayload", false),
				"responses": map[string]any{
					"200": jsonResponse("Reset request accepted", "AccountPasswordResetRequestResponse"),
					"400": jsonResponse("Invalid payload", "ErrorResponse"),
					"429": jsonResponse("Rate limited", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/password-reset/confirm": map[string]any{
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Confirm account password reset",
				"description": "Public endpoint to confirm password reset with one-time token and issue a fresh session.",
				"requestBody": jsonRequestBody("AccountPasswordResetConfirmPayload", true),
				"responses": map[string]any{
					"200": jsonResponse("Password reset completed", "AccountPasswordResetConfirmResponse"),
					"400": jsonResponse("Invalid token or payload", "ErrorResponse"),
					"500": jsonResponse("Server error", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/security/password": map[string]any{
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Change current account password",
				"description": "Session endpoint to rotate account password and optionally revoke other sessions.",
				"security":    sessionSecurity(),
				"requestBody": jsonRequestBody("AccountPasswordUpdateRequest", true),
				"responses": map[string]any{
					"200": jsonResponse("Password changed", "SuccessResponse"),
					"400": jsonResponse("Invalid payload or current password", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/sessions": map[string]any{
			"get": map[string]any{
				"tags":        []string{"account"},
				"summary":     "List active sessions of current account",
				"description": "Session endpoint to list active sessions and mark current session.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Current account sessions", "AccountSessionsResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/sessions/{sessionID}/revoke": map[string]any{
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Revoke one active session",
				"description": "Session endpoint to revoke one target session excluding current session.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("sessionID", "Target session id"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Session revoked", "SuccessResponse"),
					"400": jsonResponse("Invalid request", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"404": jsonResponse("Session not found", "ErrorResponse"),
				},
			},
		},
		"/api/v1/account/sessions/revoke-others": map[string]any{
			"post": map[string]any{
				"tags":        []string{"account"},
				"summary":     "Revoke all other active sessions",
				"description": "Session endpoint to revoke all sessions except the current one and refresh session cookie.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("Other sessions revoked", "SuccessResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
				},
			},
		},
		"/api/v1/dingtalk/me": map[string]any{
			"get": map[string]any{
				"tags":        []string{"oauth"},
				"summary":     "Get DingTalk profile via user temporary grant",
				"description": "Fetch current DingTalk profile using session-bound temporary authorization.",
				"security":    sessionSecurity(),
				"responses": map[string]any{
					"200": jsonResponse("DingTalk profile response", "DingTalkMeResponse"),
					"401": jsonResponse("Unauthorized or grant expired", "ErrorResponse"),
					"404": jsonResponse("Grant not found", "ErrorResponse"),
					"503": jsonResponse("DingTalk integration unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
