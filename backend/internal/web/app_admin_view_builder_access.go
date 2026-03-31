package web

import (
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) populateAdminAuditLogs(view *ViewData, r *http.Request, user *models.User, adminSection string, routeContext adminRouteContext) {
	if a.auditService == nil {
		return
	}

	switch {
	case adminSection == "audit" || adminSection == "incidents" || adminSection == "integrations":
		input := services.ListAuditInput{Limit: 120}
		if !user.CanViewAllSkills() {
			input.ActorUserID = user.ID
		}
		logs, err := a.auditService.ListRecent(r.Context(), input)
		logAdminLoadWarning("audit_logs", err)
		view.AuditLogs = logs
	case adminSection == "ops" && routeContext.OpsMode == "audit-export":
		logs, err := a.auditService.ListRecent(r.Context(), services.ListAuditInput{Limit: 180})
		logAdminLoadWarning("ops_audit_export", err)
		view.AuditLogs = logs
	}
}

func (a *App) populateAdminUsers(view *ViewData, r *http.Request, user *models.User, adminSection string, routeContext adminRouteContext) {
	if a.authService == nil {
		return
	}

	switch {
	case adminSection == "incidents":
		if user.CanViewAllSkills() {
			users, err := a.authService.ListUsers(r.Context())
			logAdminLoadWarning("incident_users", err)
			view.AdminUsers = users
			return
		}
		view.AdminUsers = append(view.AdminUsers, *user)
	case (adminSection == "users" ||
		(adminSection == "access" && strings.HasPrefix(routeContext.AccessMode, "accounts")) ||
		(adminSection == "access" && strings.HasPrefix(routeContext.AccessMode, "roles"))) && user.CanManageUsers():
		users, err := a.authService.ListUsers(r.Context())
		logAdminLoadWarning("admin_users", err)
		view.AdminUsers = users
	}
}

func (a *App) populateAdminDingTalkGrant(view *ViewData, r *http.Request, user *models.User, adminSection string) {
	if adminSection != "integrations" || a.oauthGrantService == nil {
		return
	}

	grant, err := a.oauthGrantService.GetGrantByUserProvider(r.Context(), user.ID, models.OAuthProviderDingTalk)
	logAdminLoadWarning("dingtalk_grant", err)
	if err == nil {
		view.DingTalkGrant = &grant
	}
}

func (a *App) populateAdminAPIKeys(view *ViewData, r *http.Request, user *models.User, adminSection string) {
	if adminSection != "apikeys" || a.apiKeyService == nil {
		return
	}

	if view.AdminShowAPIKeyOwner {
		apiKeys, err := a.apiKeyService.ListForAdmin(r.Context(), services.ListAPIKeysInput{
			OwnerUsername: view.AdminAPIKeyOwner,
			Status:        view.AdminAPIKeyStatus,
			Limit:         400,
		})
		logAdminLoadWarning("admin_api_keys", err)
		view.AdminAPIKeys = apiKeys
		return
	}

	apiKeys, err := a.apiKeyService.ListByUser(r.Context(), user.ID)
	logAdminLoadWarning("user_api_keys", err)
	view.AdminAPIKeys = apiKeys
}
