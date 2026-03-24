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
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "User center services are unavailable")
		return
	}

	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_user_id", "Invalid user id")
		return
	}
	targetUser, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "user_not_found", "User not found")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load user")
		return
	}

	overrides, err := a.loadUserCenterPermissionOverrides(r.Context())
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "permission_query_failed", "Failed to load permission overrides")
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
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "User center services are unavailable")
		return
	}

	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_user_id", "Invalid user id")
		return
	}
	targetUser, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "user_not_found", "User not found")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load user")
		return
	}

	input, err := readAPIUserCenterPermissionUpdateInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	normalized := normalizeUserCenterPermissionList(input.Permissions)
	if err := a.setUserCenterPermissionOverride(r.Context(), targetUserID, normalized); err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "update_failed", "Failed to update permission override")
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
