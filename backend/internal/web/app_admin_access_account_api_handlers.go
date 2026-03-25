package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func parseOptionalAdminAccountRoleFilter(raw string) (*models.UserRole, bool) {
	normalized := strings.ToLower(strings.TrimSpace(raw))
	if normalized == "" {
		return nil, true
	}
	switch normalized {
	case string(models.RoleViewer), string(models.RoleMember), string(models.RoleAdmin), string(models.RoleSuperAdmin):
		role := models.UserRole(normalized)
		return &role, true
	default:
		return nil, false
	}
}

func parseOptionalAdminAccountStatusFilter(raw string) (*models.UserStatus, bool) {
	normalized := strings.ToLower(strings.TrimSpace(raw))
	if normalized == "" {
		return nil, true
	}
	switch normalized {
	case string(models.UserStatusActive), string(models.UserStatusDisabled):
		status := models.UserStatus(normalized)
		return &status, true
	default:
		return nil, false
	}
}

func requireAdminUserManagementAPI(w http.ResponseWriter, r *http.Request) (*models.User, bool) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return nil, false
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return nil, false
	}
	return user, true
}

func (a *App) loadAdminManagedUserTarget(w http.ResponseWriter, r *http.Request) (uint, models.User, bool) {
	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_user_id", "Invalid user id")
		return 0, models.User{}, false
	}

	target, err := a.findManagedAccountByID(r.Context(), targetUserID)
	if err != nil {
		writeAPIError(w, r, http.StatusNotFound, "user_not_found", "User not found")
		return 0, models.User{}, false
	}
	return targetUserID, target, true
}

func (a *App) handleAPIAdminAccounts(w http.ResponseWriter, r *http.Request) {
	if _, ok := requireAdminUserManagementAPI(w, r); !ok {
		return
	}
	if a.authService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Authentication service unavailable")
		return
	}

	role, ok := parseOptionalAdminAccountRoleFilter(r.URL.Query().Get("role"))
	if !ok {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_role", "Invalid role filter")
		return
	}
	status, ok := parseOptionalAdminAccountStatusFilter(r.URL.Query().Get("status"))
	if !ok {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_status", "Invalid status filter")
		return
	}

	accounts, err := a.authService.ListUsersWithInput(r.Context(), services.ListUsersInput{
		Query:  strings.TrimSpace(r.URL.Query().Get("q")),
		Role:   role,
		Status: status,
	})
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "list_failed", err, "Failed to list accounts")
		return
	}
	items := make([]apiAdminAccountItem, 0, len(accounts))
	for _, account := range accounts {
		items = append(items, apiAdminAccountItem{
			ID:             account.User.ID,
			Username:       account.User.Username,
			Role:           string(account.User.EffectiveRole()),
			Status:         userStatusValue(account.User),
			CreatedAt:      account.User.CreatedAt,
			UpdatedAt:      account.User.UpdatedAt,
			ForceLogoutAt:  account.User.ForceLogoutAt,
			LastSeenAt:     account.LastSeenAt,
			ActiveSessions: account.ActiveSessionCount,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminAccountStatus(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.authService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Authentication service unavailable")
		return
	}

	statusRaw, decodeErr := readStringField(r, "status")
	if decodeErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", decodeErr, "Invalid request payload")
		return
	}
	status, ok := parseUserStatus(statusRaw)
	if !ok {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_status", "Invalid status")
		return
	}
	targetUserID, target, ok := a.loadAdminManagedUserTarget(w, r)
	if !ok {
		return
	}
	if targetUserID == user.ID && status == models.UserStatusDisabled {
		writeAPIError(w, r, http.StatusBadRequest, "cannot_disable_current_account", "Current account cannot be disabled")
		return
	}

	if err := a.updateManagedAccountStatus(r.Context(), targetUserID, status); err != nil {
		switch {
		case errors.Is(err, services.ErrLastSuperAdmin):
			writeAPIError(w, r, http.StatusConflict, "last_super_admin_guard", "Cannot remove the last super admin")
		default:
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "update_failed", err, "Failed to update account status")
		}
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_user_update_status",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Updated account status through admin api",
		Details: auditDetailsJSON(map[string]string{
			"username": target.Username,
			"status":   string(status),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAdminAccountForceSignout(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.authService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Authentication service unavailable")
		return
	}

	targetUserID, target, ok := a.loadAdminManagedUserTarget(w, r)
	if !ok {
		return
	}
	if err := a.forceSignOutManagedAccount(r.Context(), targetUserID); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "force_signout_failed", err, "Failed to force sign out account")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_user_force_signout",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Forced account sign-out through admin api",
		Details: auditDetailsJSON(map[string]string{
			"username": target.Username,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAdminAccountPasswordReset(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.authService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Authentication service unavailable")
		return
	}
	password, decodeErr := readStringField(r, "new_password")
	if decodeErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", decodeErr, "Invalid request payload")
		return
	}
	if len(strings.TrimSpace(password)) < 8 {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_password", "Password must be at least 8 characters")
		return
	}

	targetUserID, target, ok := a.loadAdminManagedUserTarget(w, r)
	if !ok {
		return
	}
	if err := a.resetManagedAccountPassword(r.Context(), targetUserID, password); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "reset_failed", err, "Failed to reset password")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_user_password_reset",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Reset account password through admin api",
		Details: auditDetailsJSON(map[string]string{
			"username": target.Username,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}
