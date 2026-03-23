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
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_user_id"})
		return
	}

	roleRaw, decodeErr := readStringField(r, "role")
	if decodeErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": decodeErr.Error()})
		return
	}
	role, parsed := parseRoleValue(roleRaw)
	if !parsed {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_role"})
		return
	}

	targetUser, err := a.updateManagedUserRole(r.Context(), targetUserID, role)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
		case errors.Is(err, services.ErrLastSuperAdmin):
			writeJSON(w, http.StatusConflict, map[string]any{"error": "last_super_admin_guard"})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
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
