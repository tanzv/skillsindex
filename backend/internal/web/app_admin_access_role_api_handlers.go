package web

import (
	"errors"
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminUserRoleUpdate(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.authService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Authentication service unavailable")
		return
	}

	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_user_id", "Invalid user id")
		return
	}

	roleRaw, decodeErr := readStringField(r, "role")
	if decodeErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", decodeErr, "Invalid request payload")
		return
	}
	role, parsed := parseRoleValue(roleRaw)
	if !parsed {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_role", "Invalid role")
		return
	}

	targetUser, err := a.updateManagedUserRole(r.Context(), targetUserID, role)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			writeAPIError(w, r, http.StatusNotFound, "user_not_found", "User not found")
		case errors.Is(err, services.ErrLastSuperAdmin):
			writeAPIError(w, r, http.StatusConflict, "last_super_admin_guard", "Cannot remove the last super admin")
		default:
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "update_failed", err, "Failed to update user role")
		}
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_user_role_update",
		TargetType: "user",
		TargetID:   targetUser.ID,
		Summary:    "Updated user role through admin api",
		Details: auditDetailsJSON(map[string]string{
			"username":  targetUser.Username,
			"from_role": string(targetUser.EffectiveRole()),
			"to_role":   string(role),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"user_id": targetUserID,
		"role":    string(role),
	})
}
