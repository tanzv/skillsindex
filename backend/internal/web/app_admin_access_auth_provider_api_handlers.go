package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminAuthProvidersSetting(w http.ResponseWriter, r *http.Request) {
	_, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.settingsService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Settings service is unavailable")
		return
	}

	defaultValue := strings.Join(authProviderOrder, ",")
	rawProviders, err := a.settingsService.Get(r.Context(), services.SettingAuthEnabledProviders, defaultValue)
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load auth providers setting")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                       true,
		"auth_providers":           normalizeAuthProviderList([]string{rawProviders}),
		"available_auth_providers": normalizeAuthProviderList(authProviderOrder),
	})
}

func (a *App) handleAPIAdminAuthProvidersSettingUpdate(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.settingsService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Settings service is unavailable")
		return
	}

	rawProviders, err := readAuthProvidersField(r, "auth_providers")
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid auth providers payload")
		return
	}
	providers := normalizeAuthProviderList(rawProviders)
	serialized := strings.Join(providers, ",")
	if err := a.settingsService.Set(r.Context(), services.SettingAuthEnabledProviders, serialized); err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "update_failed", "Failed to update auth providers setting")
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
