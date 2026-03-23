package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func requireAdminUserManagementAPI(w http.ResponseWriter, r *http.Request) (*models.User, bool) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return nil, false
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return nil, false
	}
	return user, true
}

func (a *App) loadAdminManagedUserTarget(w http.ResponseWriter, r *http.Request) (uint, models.User, bool) {
	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_user_id"})
		return 0, models.User{}, false
	}

	target, err := a.findManagedAccountByID(r.Context(), targetUserID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
		return 0, models.User{}, false
	}
	return targetUserID, target, true
}

func (a *App) handleAPIAdminAccounts(w http.ResponseWriter, r *http.Request) {
	if _, ok := requireAdminUserManagementAPI(w, r); !ok {
		return
	}

	accounts, err := a.authService.ListUsers(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	items := make([]apiAdminAccountItem, 0, len(accounts))
	for _, account := range accounts {
		items = append(items, apiAdminAccountItem{
			ID:            account.ID,
			Username:      account.Username,
			Role:          string(account.EffectiveRole()),
			Status:        userStatusValue(account),
			CreatedAt:     account.CreatedAt,
			UpdatedAt:     account.UpdatedAt,
			ForceLogoutAt: account.ForceLogoutAt,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminAccountStatus(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}

	statusRaw, decodeErr := readStringField(r, "status")
	if decodeErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": decodeErr.Error()})
		return
	}
	status, ok := parseUserStatus(statusRaw)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_status"})
		return
	}
	targetUserID, target, ok := a.loadAdminManagedUserTarget(w, r)
	if !ok {
		return
	}
	if targetUserID == user.ID && status == models.UserStatusDisabled {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "cannot_disable_current_account"})
		return
	}

	if err := a.updateManagedAccountStatus(r.Context(), targetUserID, status); err != nil {
		switch {
		case errors.Is(err, services.ErrLastSuperAdmin):
			writeJSON(w, http.StatusConflict, map[string]any{"error": "last_super_admin_guard"})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
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

	targetUserID, target, ok := a.loadAdminManagedUserTarget(w, r)
	if !ok {
		return
	}
	if err := a.forceSignOutManagedAccount(r.Context(), targetUserID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "force_signout_failed", "message": err.Error()})
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
	password, decodeErr := readStringField(r, "new_password")
	if decodeErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": decodeErr.Error()})
		return
	}
	if len(strings.TrimSpace(password)) < 8 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_password"})
		return
	}

	targetUserID, target, ok := a.loadAdminManagedUserTarget(w, r)
	if !ok {
		return
	}
	if err := a.resetManagedAccountPassword(r.Context(), targetUserID, password); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "reset_failed", "message": err.Error()})
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
