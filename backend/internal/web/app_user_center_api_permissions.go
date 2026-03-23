package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAPIUserCenterPermissionsGet(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireUserCenterPermission(w, r, userCenterPermissionPermissionsEdit)
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
	targetUser, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	overrides, err := a.loadUserCenterPermissionOverrides(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "permission_query_failed", "message": err.Error()})
		return
	}
	defaultPermissions := defaultUserCenterPermissions(targetUser.EffectiveRole())
	effectivePermissions := defaultPermissions
	source := "default"
	overridePermissions := []string{}
	if override, exists := overrides[targetUser.ID]; exists {
		effectivePermissions = override
		overridePermissions = override
		source = "override"
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user_id":               targetUser.ID,
		"role":                  string(targetUser.EffectiveRole()),
		"available_permissions": userCenterAllPermissions,
		"default_permissions":   defaultPermissions,
		"override_permissions":  overridePermissions,
		"effective_permissions": effectivePermissions,
		"permission_source":     source,
	})
}

func (a *App) handleAPIUserCenterPermissionsUpdate(w http.ResponseWriter, r *http.Request) {
	actor, ok := a.requireUserCenterPermission(w, r, userCenterPermissionPermissionsEdit)
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
	targetUser, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	input, err := readAPIUserCenterPermissionUpdateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	normalized := normalizeUserCenterPermissionList(input.Permissions)
	if err := a.setUserCenterPermissionOverride(r.Context(), targetUserID, normalized); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), actor, services.RecordAuditInput{
		Action:     "api_user_center_permissions_update",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Updated user center permissions",
		Details: auditDetailsJSON(map[string]string{
			"username":    targetUser.Username,
			"permissions": strings.Join(normalized, ","),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                    true,
		"user_id":               targetUserID,
		"effective_permissions": normalized,
	})
}
