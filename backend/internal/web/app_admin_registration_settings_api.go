package web

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminRegistrationSetting(w http.ResponseWriter, r *http.Request) {
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

	allowRegistration, err := a.settingsService.GetBool(r.Context(), services.SettingAllowRegistration, a.allowRegistration)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	marketplacePublicAccess, err := a.settingsService.GetBool(r.Context(), services.SettingMarketplacePublicAccess, true)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                        true,
		"allow_registration":        allowRegistration,
		"marketplace_public_access": marketplacePublicAccess,
	})
}

func (a *App) handleAPIAdminRegistrationSettingUpdate(w http.ResponseWriter, r *http.Request) {
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

	marketplacePublicAccess, err := a.settingsService.GetBool(r.Context(), services.SettingMarketplacePublicAccess, true)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	allowRegistration := false
	if strings.Contains(contentType, "application/json") {
		var payload map[string]any
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
			return
		}
		rawAllowRegistration, ok := payload["allow_registration"]
		if !ok {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "missing allow_registration"})
			return
		}
		parsedAllowRegistration, matched := parseBoolSettingValue(rawAllowRegistration)
		if !matched {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid bool value for allow_registration"})
			return
		}
		allowRegistration = parsedAllowRegistration
		if rawMarketplacePublicAccess, exists := payload["marketplace_public_access"]; exists {
			parsedMarketplacePublicAccess, matched := parseBoolSettingValue(rawMarketplacePublicAccess)
			if !matched {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid bool value for marketplace_public_access"})
				return
			}
			marketplacePublicAccess = parsedMarketplacePublicAccess
		}
	} else {
		if err := r.ParseForm(); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
			return
		}
		rawAllowRegistration := strings.TrimSpace(r.FormValue("allow_registration"))
		if rawAllowRegistration == "" {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "missing allow_registration"})
			return
		}
		parsedAllowRegistration, matched := parseBoolSettingValue(rawAllowRegistration)
		if !matched {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid bool value for allow_registration"})
			return
		}
		allowRegistration = parsedAllowRegistration
		if rawMarketplacePublicAccess := strings.TrimSpace(r.FormValue("marketplace_public_access")); rawMarketplacePublicAccess != "" {
			parsedMarketplacePublicAccess, matched := parseBoolSettingValue(rawMarketplacePublicAccess)
			if !matched {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid bool value for marketplace_public_access"})
				return
			}
			marketplacePublicAccess = parsedMarketplacePublicAccess
		}
	}

	if err := a.settingsService.SetBool(r.Context(), services.SettingAllowRegistration, allowRegistration); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}
	if err := a.settingsService.SetBool(r.Context(), services.SettingMarketplacePublicAccess, marketplacePublicAccess); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_access_registration_policy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated registration policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"allow_registration":        strconv.FormatBool(allowRegistration),
			"marketplace_public_access": strconv.FormatBool(marketplacePublicAccess),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                        true,
		"allow_registration":        allowRegistration,
		"marketplace_public_access": marketplacePublicAccess,
	})
}
