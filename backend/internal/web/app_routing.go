package web

import (
	"context"
	"crypto/subtle"
	"net"
	"net/http"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

func (a *App) Router() http.Handler {
	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(a.allowCORS)
	r.Use(a.withCurrentUser)
	r.Use(a.requireAPIMode)
	r.Use(a.requireCSRF)

	r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("web/static"))))

	r.Get("/zh", a.handleLocalizedAlias)
	r.Get("/zh/*", a.handleLocalizedAlias)
	r.Get("/skillsmp", a.handleLocalizedAlias)
	r.Get("/light", a.handleLightAlias)
	r.Get("/light/login", a.showLogin)
	r.Get("/light/register", a.showRegister)
	r.Get("/light/account/password-reset/request", a.showPasswordResetRequest)
	r.Get("/light/account/password-reset/confirm", a.showPasswordResetConfirm)
	r.Get("/light/*", a.handleLightAlias)

	r.Group(func(publicMarketplace chi.Router) {
		publicMarketplace.Use(a.requireMarketplaceAccess)
		publicMarketplace.Get("/", a.handleHome)
		publicMarketplace.Get("/skills/{skillID}", a.handleSkillDetail)
		publicMarketplace.Get("/compare", a.handleCompare)
		publicMarketplace.Get("/rollout", a.handleRollout)
		publicMarketplace.Get("/workspace", a.handleWorkspace)
		publicMarketplace.Get("/governance", a.handleGovernance)
		publicMarketplace.Get("/categories", a.handleCategories)
		publicMarketplace.Get("/categories/{categorySlug}", a.handleCategoryDetail)
		publicMarketplace.Get("/timeline", a.handleTimeline)
		publicMarketplace.Get("/docs", a.handleDocs)
	})
	r.Get("/prototype/auth", a.handleAuthPrototype)
	r.Get("/states/{state}", a.handleStatePage)
	r.Get("/docs/api", a.handleAPIDocs)
	r.Get("/docs/swagger", a.handleSwaggerDocs)
	r.Get("/openapi.json", a.handleOpenAPI)
	r.Get("/docs/openapi.json", a.handleOpenAPI)
	r.Get("/openapi.yaml", a.handleOpenAPIYAML)
	r.Get("/docs/openapi.yaml", a.handleOpenAPIYAML)
	r.Get("/about", a.handleAbout)
	r.Get("/register", a.showRegister)
	r.Get("/mobile/register", a.showRegister)
	r.Get("/mobile/light/register", a.showRegister)
	r.Post("/register", a.handleRegister)
	r.Post("/light/register", a.handleRegister)
	r.Post("/mobile/register", a.handleRegister)
	r.Post("/mobile/light/register", a.handleRegister)
	r.Get("/login", a.showLogin)
	r.Get("/mobile/login", a.showLogin)
	r.Get("/mobile/light/login", a.showLogin)
	r.Get("/account/password-reset/request", a.showPasswordResetRequest)
	r.Get("/mobile/account/password-reset/request", a.showPasswordResetRequest)
	r.Get("/mobile/light/account/password-reset/request", a.showPasswordResetRequest)
	r.Post("/account/password-reset/request", a.handlePasswordResetRequest)
	r.Post("/light/account/password-reset/request", a.handlePasswordResetRequest)
	r.Post("/mobile/account/password-reset/request", a.handlePasswordResetRequest)
	r.Post("/mobile/light/account/password-reset/request", a.handlePasswordResetRequest)
	r.Get("/account/password-reset/confirm", a.showPasswordResetConfirm)
	r.Get("/mobile/account/password-reset/confirm", a.showPasswordResetConfirm)
	r.Get("/mobile/light/account/password-reset/confirm", a.showPasswordResetConfirm)
	r.Post("/account/password-reset/confirm", a.handlePasswordResetConfirm)
	r.Post("/light/account/password-reset/confirm", a.handlePasswordResetConfirm)
	r.Post("/mobile/account/password-reset/confirm", a.handlePasswordResetConfirm)
	r.Post("/mobile/light/account/password-reset/confirm", a.handlePasswordResetConfirm)
	r.Post("/login", a.handleLogin)
	r.Post("/light/login", a.handleLogin)
	r.Post("/mobile/login", a.handleLogin)
	r.Post("/mobile/light/login", a.handleLogin)
	r.Post("/logout", a.handleLogout)
	r.Get("/auth/dingtalk/start", a.handleDingTalkStart)
	r.Get("/auth/dingtalk/callback", a.handleDingTalkCallback)
	r.Get("/auth/sso/start/{provider}", a.handleSSOStart)
	r.Get("/auth/sso/callback/{provider}", a.handleSSOCallback)

	r.Route("/api/v1/auth", func(apiAuth chi.Router) {
		apiAuth.Get("/providers", a.handleAPIAuthProviders)
		apiAuth.Get("/csrf", a.handleAPIAuthCSRF)
		apiAuth.Post("/login", a.handleAPIAuthLogin)
		apiAuth.Get("/me", a.handleAPIAuthMe)
		apiAuth.With(a.requireAuth).Post("/logout", a.handleAPIAuthLogout)
	})
	r.Post("/api/v1/account/password-reset/request", a.handleAPIAccountPasswordResetRequest)
	r.Post("/api/v1/account/password-reset/confirm", a.handleAPIAccountPasswordResetConfirm)

	r.Group(func(publicAPI chi.Router) {
		publicAPI.Use(a.requireMarketplaceAccess)
		publicAPI.Get("/api/v1/public/marketplace", a.handleAPIPublicMarketplace)
		publicAPI.Get("/api/v1/public/skills/{skillID}", a.handleAPIPublicSkillDetail)
	})

	r.Route("/api/v1", func(api chi.Router) {
		api.Use(a.requireAPIKey)
		api.Get("/skills/search", a.handleAPISearch)
		api.Get("/skills/ai-search", a.handleAPIAISearch)
	})

	r.Group(func(authRoutes chi.Router) {
		authRoutes.Use(a.requireAuth)
		authRoutes.Get("/account", a.handleAccountRoot)
		authRoutes.Get("/account/profile", a.handleAccountProfile)
		authRoutes.Post("/account/profile", a.handleAccountProfileUpdate)
		authRoutes.Get("/account/security", a.handleAccountSecurity)
		authRoutes.Get("/account/api-credentials", a.handleAccountAPICredentials)
		authRoutes.Post("/account/security/password", a.handleAccountPasswordUpdate)
		authRoutes.Get("/account/sessions", a.handleAccountSessions)
		authRoutes.Post("/account/sessions/{sessionID}/revoke", a.handleAccountSessionRevoke)
		authRoutes.Post("/account/sessions/revoke-others", a.handleAccountSessionsRevokeOthers)
		authRoutes.Get("/api/v1/account/profile", a.handleAPIAccountProfile)
		authRoutes.Get("/api/v1/account/apikeys", a.handleAPIAccountAPIKeys)
		authRoutes.Post("/api/v1/account/apikeys", a.handleAPIAccountAPIKeysCreate)
		authRoutes.Post("/api/v1/account/apikeys/{keyID}/revoke", a.handleAPIAccountAPIKeyRevoke)
		authRoutes.Post("/api/v1/account/apikeys/{keyID}/rotate", a.handleAPIAccountAPIKeyRotate)
		authRoutes.Post("/api/v1/account/apikeys/{keyID}/scopes", a.handleAPIAccountAPIKeyScopesUpdate)
		authRoutes.Post("/api/v1/account/profile", a.handleAPIAccountProfileUpdate)
		authRoutes.Post("/api/v1/account/security/password", a.handleAPIAccountPasswordUpdate)
		authRoutes.Get("/api/v1/account/sessions", a.handleAPIAccountSessions)
		authRoutes.Post("/api/v1/account/sessions/{sessionID}/revoke", a.handleAPIAccountSessionRevoke)
		authRoutes.Post("/api/v1/account/sessions/revoke-others", a.handleAPIAccountSessionsRevokeOthers)
		authRoutes.Get("/api/v1/dingtalk/me", a.handleDingTalkMe)
		authRoutes.Post("/auth/dingtalk/revoke", a.handleDingTalkRevoke)
		authRoutes.Post("/api/v1/skills/{skillID}/report", a.handleAPISkillReport)
		authRoutes.Post("/api/v1/skills/{skillID}/comments/{commentID}/report", a.handleAPICommentReport)
		authRoutes.Post("/api/v1/skills/{skillID}/favorite", a.handleAPISkillFavorite)
		authRoutes.Post("/api/v1/skills/{skillID}/rating", a.handleAPISkillRating)
		authRoutes.Post("/api/v1/skills/{skillID}/comments", a.handleAPISkillCommentCreate)
		authRoutes.Post("/api/v1/skills/{skillID}/comments/{commentID}/delete", a.handleAPISkillCommentDelete)
		authRoutes.Get("/api/v1/skills/{skillID}/sync-runs", a.handleAPISkillSyncRuns)
		authRoutes.Get("/api/v1/skills/{skillID}/sync-runs/{runID}", a.handleAPISkillSyncRunDetail)
		authRoutes.Post("/api/v1/skills/{skillID}/organization-bind", a.handleAPISkillOrganizationBind)
		authRoutes.Post("/api/v1/skills/{skillID}/organization-unbind", a.handleAPISkillOrganizationUnbind)
		authRoutes.Post("/skills/{skillID}/organization-bind", a.handleSkillOrganizationBind)
		authRoutes.Post("/skills/{skillID}/organization-unbind", a.handleSkillOrganizationUnbind)
		authRoutes.Post("/skills/{skillID}/favorite", a.handleSkillFavorite)
		authRoutes.Post("/skills/{skillID}/rating", a.handleSkillRating)
		authRoutes.Post("/skills/{skillID}/comments", a.handleSkillCommentCreate)
		authRoutes.Post("/skills/{skillID}/comments/{commentID}/delete", a.handleSkillCommentDelete)
	})

	r.Group(func(private chi.Router) {
		private.Use(a.requireAuth)
		private.Use(a.requireDashboardAccess)
		private.Get("/admin", a.handleAdmin)
		private.Get("/admin/{section}", a.handleAdmin)
		private.Get("/admin/{section}/{subsection}", a.handleAdmin)
		private.Get("/admin/{section}/{subsection}/{detail}", a.handleAdmin)
		private.Get("/admin/{section}/{subsection}/{detail}/{extra}", a.handleAdmin)
		private.Get("/dashboard", a.handleAdmin)
		private.Get("/dashboard/{section}", a.handleAdmin)
		private.Get("/api/v1/admin/overview", a.handleAPIAdminOverview)
		private.Get("/api/v1/admin/skills", a.handleAPIAdminSkills)
		private.Get("/api/v1/admin/integrations", a.handleAPIAdminIntegrations)
		private.Get("/api/v1/admin/ops/metrics", a.handleAPIAdminOpsMetrics)
		private.Get("/api/v1/admin/ops/alerts", a.handleAPIAdminOpsAlerts)
		private.Get("/api/v1/admin/ops/audit-export", a.handleAPIAdminOpsAuditExport)
		private.Get("/api/v1/admin/ops/release-gates", a.handleAPIAdminOpsReleaseGates)
		private.Post("/api/v1/admin/ops/release-gates/run", a.handleAPIAdminOpsReleaseGatesRun)
		private.Post("/api/v1/admin/ingestion/manual", a.handleAPIAdminIngestionManual)
		private.Post("/api/v1/admin/ingestion/upload", a.handleAPIAdminIngestionUpload)
		private.Post("/api/v1/admin/ingestion/repository", a.handleAPIAdminIngestionRepository)
		private.Post("/api/v1/admin/ingestion/skillmp", a.handleAPIAdminIngestionSkillMP)
		private.Get("/api/v1/admin/ops/recovery-drills", a.handleAPIAdminOpsRecoveryDrills)
		private.Post("/api/v1/admin/ops/recovery-drills/run", a.handleAPIAdminOpsRecoveryDrillRun)
		private.Get("/api/v1/admin/ops/releases", a.handleAPIAdminOpsReleases)
		private.Post("/api/v1/admin/ops/releases", a.handleAPIAdminOpsReleasesCreate)
		private.Get("/api/v1/admin/ops/change-approvals", a.handleAPIAdminOpsChangeApprovals)
		private.Post("/api/v1/admin/ops/change-approvals", a.handleAPIAdminOpsChangeApprovalsCreate)
		private.Get("/api/v1/admin/ops/backup/plans", a.handleAPIAdminOpsBackupPlans)
		private.Post("/api/v1/admin/ops/backup/plans", a.handleAPIAdminOpsBackupPlansUpsert)
		private.Get("/api/v1/admin/ops/backup/runs", a.handleAPIAdminOpsBackupRuns)
		private.Post("/api/v1/admin/ops/backup/runs", a.handleAPIAdminOpsBackupRunsCreate)
		private.Get("/api/v1/admin/jobs", a.handleAPIAdminJobs)
		private.Get("/api/v1/admin/jobs/{jobID}", a.handleAPIAdminJobDetail)
		private.Post("/api/v1/admin/jobs/{jobID}/retry", a.handleAPIAdminJobRetry)
		private.Post("/api/v1/admin/jobs/{jobID}/cancel", a.handleAPIAdminJobCancel)
		private.Get("/api/v1/admin/sync-jobs", a.handleAPIAdminSyncJobs)
		private.Get("/api/v1/admin/sync-jobs/{runID}", a.handleAPIAdminSyncJobDetail)
		private.Get("/api/v1/admin/sync-runs", a.handleAPIAdminSyncRuns)
		private.Get("/api/v1/admin/sync-runs/{runID}", a.handleAPIAdminSyncRunDetail)
		private.Get("/api/v1/admin/sync-policy/repository", a.handleAPIAdminRepositorySyncPolicy)
		private.Post("/api/v1/admin/sync-policy/repository", a.handleAPIAdminRepositorySyncPolicyUpdate)
		private.Get("/api/v1/admin/sync-policies", a.handleAPIAdminSyncPolicies)
		private.Post("/api/v1/admin/sync-policies/create", a.handleAPIAdminSyncPoliciesCreate)
		private.Post("/api/v1/admin/sync-policies/{policyID}/update", a.handleAPIAdminSyncPoliciesUpdate)
		private.Post("/api/v1/admin/sync-policies/{policyID}/toggle", a.handleAPIAdminSyncPoliciesToggle)
		private.Post("/api/v1/admin/sync-policies/{policyID}/delete", a.handleAPIAdminSyncPoliciesDelete)
		private.Get("/api/v1/admin/apikeys", a.handleAPIAdminAPIKeys)
		private.Post("/api/v1/admin/apikeys", a.handleAPIAdminAPIKeysCreate)
		private.Get("/api/v1/admin/apikeys/{keyID}", a.handleAPIAdminAPIKeyDetail)
		private.Post("/api/v1/admin/apikeys/{keyID}/revoke", a.handleAPIAdminAPIKeyRevoke)
		private.Post("/api/v1/admin/apikeys/{keyID}/rotate", a.handleAPIAdminAPIKeyRotate)
		private.Post("/api/v1/admin/apikeys/{keyID}/scopes", a.handleAPIAdminAPIKeyScopesUpdate)
		private.Get("/api/v1/admin/sso/providers", a.handleAPIAdminSSOProviders)
		private.Post("/api/v1/admin/sso/providers", a.handleAPIAdminSSOProviderCreate)
		private.Post("/api/v1/admin/sso/providers/{providerID}/disable", a.handleAPIAdminSSOProviderDisable)
		private.Post("/api/v1/admin/sso/users/sync", a.handleAPIAdminSSOUsersSync)
		private.Get("/api/v1/admin/settings/registration", a.handleAPIAdminRegistrationSetting)
		private.Post("/api/v1/admin/settings/registration", a.handleAPIAdminRegistrationSettingUpdate)
		private.Get("/api/v1/admin/settings/auth-providers", a.handleAPIAdminAuthProvidersSetting)
		private.Post("/api/v1/admin/settings/auth-providers", a.handleAPIAdminAuthProvidersSettingUpdate)
		private.Get("/api/v1/admin/accounts", a.handleAPIAdminAccounts)
		private.Get("/api/v1/admin/user-center/accounts", a.handleAPIUserCenterAccounts)
		private.Post("/api/v1/admin/user-center/sync", a.handleAPIUserCenterSync)
		private.Get("/api/v1/admin/user-center/permissions/{userID}", a.handleAPIUserCenterPermissionsGet)
		private.Post("/api/v1/admin/user-center/permissions/{userID}", a.handleAPIUserCenterPermissionsUpdate)
		private.Post("/api/v1/admin/users/{userID}/role", a.handleAPIAdminUserRoleUpdate)
		private.Post("/api/v1/admin/accounts/{userID}/status", a.handleAPIAdminAccountStatus)
		private.Post("/api/v1/admin/accounts/{userID}/force-signout", a.handleAPIAdminAccountForceSignout)
		private.Post("/api/v1/admin/accounts/{userID}/password-reset", a.handleAPIAdminAccountPasswordReset)
		private.Get("/api/v1/admin/organizations", a.handleAPIAdminOrganizations)
		private.Post("/api/v1/admin/organizations", a.handleAPIAdminOrganizationCreate)
		private.Get("/api/v1/admin/organizations/{orgID}/members", a.handleAPIAdminOrganizationMembers)
		private.Post("/api/v1/admin/organizations/{orgID}/members", a.handleAPIAdminOrganizationMemberUpsert)
		private.Post("/api/v1/admin/organizations/{orgID}/members/{userID}/role", a.handleAPIAdminOrganizationMemberRoleUpdate)
		private.Post("/api/v1/admin/organizations/{orgID}/members/{userID}/remove", a.handleAPIAdminOrganizationMemberRemove)
		private.Get("/api/v1/admin/moderation", a.handleAPIAdminModerationList)
		private.Post("/api/v1/admin/moderation", a.handleAPIAdminModerationCreate)
		private.Post("/api/v1/admin/moderation/{caseID}/resolve", a.handleAPIAdminModerationResolve)
		private.Post("/api/v1/admin/moderation/{caseID}/reject", a.handleAPIAdminModerationReject)
		private.Post("/skills/manual", a.handleCreateManual)
		private.Post("/skills/upload", a.handleUpload)
		private.Post("/skills/repo", a.handleRepositoryCreate)
		private.Post("/skills/skillmp", a.handleSkillMPCreate)
		private.Post("/skills/{skillID}/visibility", a.handleUpdateVisibility)
		private.Post("/skills/{skillID}/sync", a.handleRemoteSync)
		private.Get("/skills/{skillID}/versions", a.handleSkillVersions)
		private.Get("/skills/{skillID}/versions/compare", a.handleSkillVersionCompare)
		private.Get("/skills/{skillID}/versions/{versionID}", a.handleSkillVersionDetail)
		private.Post("/api/v1/skills/{skillID}/versions/{versionID}/rollback", a.handleAPISkillVersionRollback)
		private.Post("/api/v1/skills/{skillID}/versions/{versionID}/restore", a.handleAPISkillVersionRestore)
		private.Post("/skills/{skillID}/versions/{versionID}/rollback", a.handleRollbackSkillVersion)
		private.Post("/skills/{skillID}/versions/{versionID}/restore", a.handleRestoreSkillVersion)
		private.Post("/skills/{skillID}/delete", a.handleDeleteSkill)
		private.Get("/admin/jobs", a.handleAdminJobs)
		private.Get("/admin/jobs/{jobID}", a.handleAdminJob)
		private.Post("/admin/jobs/{jobID}/retry", a.handleAdminJobRetry)
		private.Post("/admin/jobs/{jobID}/cancel", a.handleAdminJobCancel)
		private.Post("/admin/sync/repositories", a.handleRepositorySyncBatch)
		private.Post("/admin/sync-policy/repository", a.handleAdminRepositorySyncPolicyUpdate)
		private.Post("/admin/accounts/create", a.handleAdminAccountCreate)
		private.Post("/admin/access/registration", a.handleAdminAccessRegistrationUpdate)
		private.Post("/admin/access/auth-providers", a.handleAdminAccessAuthProvidersUpdate)
		private.Post("/admin/accounts/{userID}/status", a.handleAdminAccountStatusUpdate)
		private.Post("/admin/accounts/{userID}/force-signout", a.handleAdminAccountForceSignout)
		private.Post("/admin/accounts/{userID}/password-reset", a.handleAdminAccountPasswordReset)
		private.Post("/admin/roles/assign", a.handleAdminRoleAssign)
		private.Post("/admin/integrations/create", a.handleAdminIntegrationCreate)
		private.Post("/admin/incidents/create", a.handleAdminIncidentCreate)
		private.Post("/admin/incidents/{incidentID}/response", a.handleAdminIncidentResponse)
		private.Post("/admin/incidents/{incidentID}/postmortem", a.handleAdminIncidentPostmortem)
		private.Post("/admin/moderation/create", a.handleAdminModerationCreate)
		private.Post("/admin/moderation/{caseID}/resolve", a.handleAdminModerationResolve)
		private.Post("/admin/moderation/{caseID}/reject", a.handleAdminModerationReject)
		private.Post("/admin/sso/providers/create", a.handleAdminSSOProviderCreate)
		private.Post("/admin/sso/providers/{providerID}/disable", a.handleAdminSSOProviderDisable)
		private.Post("/admin/sso/users/sync", a.handleAdminSSOUsersSync)
		private.Post("/admin/apikeys/create", a.handleAPIKeyCreate)
		private.Post("/admin/apikeys/{keyID}/revoke", a.handleAPIKeyRevoke)
		private.Post("/admin/apikeys/{keyID}/rotate", a.handleAPIKeyRotate)
		private.Post("/admin/users/{userID}/role", a.handleAdminUserRoleUpdate)
	})

	return r
}

func (a *App) withCurrentUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if a.sessionService == nil {
			next.ServeHTTP(w, r)
			return
		}
		userID, issuedAt, sessionID, ok := a.sessionService.GetSessionWithID(r)
		if ok {
			if a.userSessionSvc != nil && strings.TrimSpace(sessionID) != "" {
				active, err := a.userSessionSvc.ValidateSession(r.Context(), userID, sessionID, time.Now().UTC())
				if err != nil || !active {
					a.sessionService.ClearSession(w)
					next.ServeHTTP(w, r)
					return
				}
				_ = a.userSessionSvc.TouchSession(r.Context(), sessionID, time.Now().UTC())
			}
			user, err := a.authService.GetUserByID(r.Context(), userID)
			if err == nil && user.IsActive() {
				if user.ForceLogoutAt != nil && !issuedAt.IsZero() && issuedAt.Before(user.ForceLogoutAt.UTC()) {
					a.sessionService.ClearSession(w)
					next.ServeHTTP(w, r)
					return
				}
				ctx := context.WithValue(r.Context(), currentUserKey, &user)
				r = r.WithContext(ctx)
			} else if err == nil && !user.IsActive() {
				a.sessionService.ClearSession(w)
			}
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) requireAPIMode(next http.Handler) http.Handler {
	if !a.apiOnly {
		return next
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if isAPIOnlyAllowedPath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}
		writeJSON(w, http.StatusNotFound, map[string]any{
			"error":   "api_only_mode",
			"message": "This server only exposes API endpoints",
		})
	})
}

func (a *App) allowCORS(next http.Handler) http.Handler {
	if len(a.corsOrigins) == 0 {
		return next
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !isCORSRoutePath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if origin == "" {
			next.ServeHTTP(w, r)
			return
		}

		if _, ok := a.corsOrigins[origin]; !ok {
			if r.Method == http.MethodOptions {
				writeJSON(w, http.StatusForbidden, map[string]any{
					"error":   "cors_origin_denied",
					"message": "Request origin is not allowed",
				})
				return
			}
			next.ServeHTTP(w, r)
			return
		}

		allowHeaders := "Content-Type, Authorization, X-CSRF-Token"
		allowMethods := "GET, POST, PUT, PATCH, DELETE, OPTIONS"

		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", allowHeaders)
		w.Header().Set("Access-Control-Allow-Methods", allowMethods)
		appendHeaderValue(w.Header(), "Vary", "Origin")
		appendHeaderValue(w.Header(), "Vary", "Access-Control-Request-Method")
		appendHeaderValue(w.Header(), "Vary", "Access-Control-Request-Headers")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func isCORSRoutePath(path string) bool {
	clean := strings.TrimSpace(strings.ToLower(path))
	switch {
	case strings.HasPrefix(clean, "/api/"):
		return true
	case strings.HasPrefix(clean, "/openapi."):
		return true
	case strings.HasPrefix(clean, "/docs/openapi."):
		return true
	default:
		return false
	}
}

func appendHeaderValue(header http.Header, key string, value string) {
	values := header.Values(key)
	for _, item := range values {
		if strings.EqualFold(strings.TrimSpace(item), strings.TrimSpace(value)) {
			return
		}
	}
	header.Add(key, value)
}

func (a *App) requireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if currentUserFromContext(r.Context()) == nil {
			if requestWantsJSON(r) {
				writeJSON(w, http.StatusUnauthorized, map[string]any{
					"error":   "unauthorized",
					"message": "Authentication required",
				})
				return
			}
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) requireDashboardAccess(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := currentUserFromContext(r.Context())
		if user == nil {
			if requestWantsJSON(r) {
				writeJSON(w, http.StatusUnauthorized, map[string]any{
					"error":   "unauthorized",
					"message": "Authentication required",
				})
				return
			}
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		if !user.CanAccessDashboard() {
			if requestWantsJSON(r) {
				writeJSON(w, http.StatusForbidden, map[string]any{
					"error":   "permission_denied",
					"message": "Current account role does not have dashboard access",
				})
				return
			}
			a.renderWithStatus(w, r, http.StatusForbidden, ViewData{
				Page:  "home",
				Title: "Skill Marketplace",
				Error: "Current account role does not have dashboard access",
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) requireCSRF(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions, http.MethodTrace:
			next.ServeHTTP(w, r)
			return
		}

		cookie, err := r.Cookie(csrfCookieName)
		if err != nil {
			http.Error(w, "csrf validation failed", http.StatusForbidden)
			return
		}
		expected := strings.TrimSpace(cookie.Value)
		if expected == "" {
			http.Error(w, "csrf validation failed", http.StatusForbidden)
			return
		}

		provided := strings.TrimSpace(r.Header.Get("X-CSRF-Token"))
		if provided == "" {
			if err := r.ParseForm(); err != nil {
				http.Error(w, "csrf validation failed", http.StatusForbidden)
				return
			}
			provided = strings.TrimSpace(r.FormValue(csrfTokenFormField))
		}
		if provided == "" || subtle.ConstantTimeCompare([]byte(provided), []byte(expected)) != 1 {
			http.Error(w, "csrf validation failed", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) requireAPIKey(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := strings.TrimSpace(r.URL.Query().Get("api_key"))
		if apiKey == "" {
			auth := strings.TrimSpace(r.Header.Get("Authorization"))
			if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
				apiKey = strings.TrimSpace(auth[7:])
			}
		}
		if _, ok := a.apiKeys[apiKey]; ok {
			next.ServeHTTP(w, r)
			return
		}
		if a.apiKeyService != nil {
			if key, valid, err := a.apiKeyService.Validate(r.Context(), apiKey); err == nil && valid {
				requiredScope := requiredAPIKeyScope(r.URL.Path)
				if requiredScope != "" && !services.APIKeyHasScope(key, requiredScope) {
					writeJSON(w, http.StatusForbidden, map[string]any{
						"error":   "api_key_scope_denied",
						"message": "API key does not grant required scope",
					})
					return
				}
				next.ServeHTTP(w, r)
				return
			}
		}
		writeJSON(w, http.StatusUnauthorized, map[string]any{
			"error":   "api_key_invalid",
			"message": "Missing or invalid API key",
		})
	})
}

func requiredAPIKeyScope(path string) string {
	switch strings.ToLower(strings.TrimSpace(path)) {
	case "/api/v1/skills/search":
		return services.APIKeyScopeSkillsSearchRead
	case "/api/v1/skills/ai-search":
		return services.APIKeyScopeSkillsAISearchRead
	default:
		return ""
	}
}

func currentUserFromContext(ctx context.Context) *models.User {
	value := ctx.Value(currentUserKey)
	if value == nil {
		return nil
	}
	user, ok := value.(*models.User)
	if !ok {
		return nil
	}
	return user
}

func clientIPFromRequest(r *http.Request) string {
	if r == nil {
		return ""
	}
	forwardedFor := strings.TrimSpace(r.Header.Get("X-Forwarded-For"))
	if forwardedFor != "" {
		first := strings.Split(forwardedFor, ",")[0]
		return strings.TrimSpace(first)
	}
	realIP := strings.TrimSpace(r.Header.Get("X-Real-IP"))
	if realIP != "" {
		return realIP
	}
	host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
	if err == nil {
		return strings.TrimSpace(host)
	}
	return strings.TrimSpace(r.RemoteAddr)
}
