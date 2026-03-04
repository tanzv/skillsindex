package web

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminAuthProvidersSetting(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.settingsService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	defaultValue := strings.Join(authProviderOrder, ",")
	rawProviders, err := a.settingsService.Get(r.Context(), services.SettingAuthEnabledProviders, defaultValue)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                       true,
		"auth_providers":           normalizeAuthProviderList([]string{rawProviders}),
		"available_auth_providers": normalizeAuthProviderList(authProviderOrder),
	})
}

func (a *App) handleAPIAdminAuthProvidersSettingUpdate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.settingsService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	rawProviders, err := readAuthProvidersField(r, "auth_providers")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	providers := normalizeAuthProviderList(rawProviders)
	serialized := strings.Join(providers, ",")
	if err := a.settingsService.Set(r.Context(), services.SettingAuthEnabledProviders, serialized); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_access_auth_providers_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated auth providers through admin api",
		Details: auditDetailsJSON(map[string]string{
			"auth_enabled_providers": serialized,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":             true,
		"auth_providers": providers,
	})
}

func (a *App) handleAPIAdminUserRoleUpdate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
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
	role, ok := parseRoleValue(roleRaw)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_role"})
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

	if err := a.authService.SetUserRole(r.Context(), targetUserID, role); err != nil {
		if errors.Is(err, services.ErrLastSuperAdmin) {
			writeJSON(w, http.StatusConflict, map[string]any{"error": "last_super_admin_guard"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
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

func readAuthProvidersField(r *http.Request, key string) ([]string, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload map[string]any
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return nil, fmt.Errorf("invalid json payload: %w", err)
		}
		rawValue, exists := payload[key]
		if !exists || rawValue == nil {
			return []string{}, nil
		}
		switch value := rawValue.(type) {
		case string:
			return []string{value}, nil
		case []any:
			result := make([]string, 0, len(value))
			for idx, item := range value {
				text, ok := item.(string)
				if !ok {
					return nil, fmt.Errorf("%s[%d] must be string", key, idx)
				}
				result = append(result, text)
			}
			return result, nil
		default:
			return nil, fmt.Errorf("%s must be string or string array", key)
		}
	}

	if err := r.ParseForm(); err != nil {
		return nil, fmt.Errorf("invalid form payload: %w", err)
	}
	values := r.Form[key]
	if len(values) == 0 {
		return []string{}, nil
	}
	return values, nil
}
